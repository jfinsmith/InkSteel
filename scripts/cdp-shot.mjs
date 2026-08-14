// Minimal Chrome DevTools Protocol screenshot with true device emulation.
// Used by the build-verify loop: headless Chrome's --window-size does NOT set
// the layout viewport reliably, so we drive CDP's Emulation domain instead.
//
// Usage:
//   chrome --headless=new --disable-gpu --remote-debugging-port=9222 --user-data-dir=/tmp/cdpprof &
//   node scripts/cdp-shot.mjs <url> <outfile> [width] [height] [dsf] [port] [scroll]
//     scroll: pass "bottom" to scroll to the page bottom before capturing.
import net from 'node:net';
import crypto from 'node:crypto';
import http from 'node:http';
import fs from 'node:fs';

const [url, out, W = '390', H = '780', DSF = '3', PORT = '9222', SCROLL = 'top'] = process.argv.slice(2);
const width = +W, height = +H, dsf = +DSF, port = +PORT;

const getJSON = (path) => new Promise((res, rej) => {
  http.get({ host: '127.0.0.1', port, path }, (r) => {
    let d = ''; r.on('data', (c) => (d += c)); r.on('end', () => res(JSON.parse(d)));
  }).on('error', rej);
});

// Node 20 has no built-in WebSocket, and this repo deliberately has no
// puppeteer/playwright dependency — so speak the WS protocol by hand.
function connect(wsUrl) {
  const u = new URL(wsUrl);
  return new Promise((resolve, reject) => {
    const key = crypto.randomBytes(16).toString('base64');
    const sock = net.connect(+u.port, u.hostname, () => {
      sock.write(
        `GET ${u.pathname}${u.search} HTTP/1.1\r\nHost: ${u.host}\r\nUpgrade: websocket\r\n` +
        `Connection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`
      );
    });
    let buf = Buffer.alloc(0), upgraded = false;
    const handlers = {}; let nextId = 1; const events = {};
    function emit(msg) {
      const o = JSON.parse(msg);
      if (o.id && handlers[o.id]) { handlers[o.id](o); delete handlers[o.id]; }
      else if (o.method && events[o.method]) { events[o.method].forEach((f) => f(o.params)); }
    }
    let frag = Buffer.alloc(0), fragOp = 0;
    function parse() {
      while (buf.length >= 2) {
        const b0 = buf[0], b1 = buf[1];
        const fin = b0 & 0x80, op = b0 & 0x0f;
        let len = b1 & 0x7f, off = 2;
        if (len === 126) { if (buf.length < 4) return; len = buf.readUInt16BE(2); off = 4; }
        else if (len === 127) { if (buf.length < 10) return; len = Number(buf.readBigUInt64BE(2)); off = 10; }
        if (buf.length < off + len) return;
        let payload = buf.subarray(off, off + len);
        buf = buf.subarray(off + len);
        if (op === 0x8) { sock.end(); return; }
        if (op === 0x9) { continue; }
        if (op === 0x0) { frag = Buffer.concat([frag, payload]); }
        else { frag = Buffer.from(payload); fragOp = op; }
        if (fin) { if (fragOp === 0x1) emit(frag.toString('utf8')); frag = Buffer.alloc(0); }
      }
    }
    sock.on('data', (chunk) => {
      buf = Buffer.concat([buf, chunk]);
      if (!upgraded) {
        const i = buf.indexOf('\r\n\r\n');
        if (i === -1) return;
        upgraded = true; buf = buf.subarray(i + 4);
        resolve(api);
      }
      parse();
    });
    sock.on('error', reject);
    function sendFrame(str) {
      const data = Buffer.from(str, 'utf8');
      const mask = crypto.randomBytes(4);
      const len = data.length;
      let header;
      if (len < 126) header = Buffer.from([0x81, 0x80 | len]);
      else if (len < 65536) { header = Buffer.alloc(4); header[0] = 0x81; header[1] = 0x80 | 126; header.writeUInt16BE(len, 2); }
      else { header = Buffer.alloc(10); header[0] = 0x81; header[1] = 0x80 | 127; header.writeBigUInt64BE(BigInt(len), 2); }
      const masked = Buffer.alloc(len);
      for (let i = 0; i < len; i++) masked[i] = data[i] ^ mask[i & 3];
      sock.write(Buffer.concat([header, mask, masked]));
    }
    const api = {
      send(method, params = {}) {
        const id = nextId++;
        return new Promise((res) => { handlers[id] = (o) => res(o.result); sendFrame(JSON.stringify({ id, method, params })); });
      },
      on(method, fn) { (events[method] ||= []).push(fn); },
      close() { sock.end(); },
    };
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const targets = await getJSON('/json');
const page = targets.find((t) => t.type === 'page') || targets[0];
const cdp = await connect(page.webSocketDebuggerUrl);
await cdp.send('Page.enable');
await cdp.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: dsf, mobile: true });
const loaded = new Promise((r) => cdp.on('Page.loadEventFired', r));
await cdp.send('Page.navigate', { url });
await Promise.race([loaded, sleep(6000)]);
await sleep(900); // fonts/images
if (SCROLL === 'bottom') {
  await cdp.send('Runtime.evaluate', { expression: 'window.scrollTo(0, document.body.scrollHeight)' });
  await sleep(500);
}
const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
fs.writeFileSync(out, Buffer.from(data, 'base64'));
console.log('wrote', out, width + 'x' + height + '@' + dsf);
cdp.close();
process.exit(0);
