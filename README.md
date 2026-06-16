# The Ink & Steel

> _From the Desk of Sanity — decoding the politics of the United States._
> The pen is mightier than the sword. **Ink & Steel.**

A self-owned, static political blog built with [Astro](https://astro.build),
deployed free on **GitHub Pages**, with **Firebase/Firestore** powering the
dynamic bits (newsletter signups, contact form, post view counts). Migrated off
Squarespace; every old `/blog/<slug>` URL is preserved.

- **Articles** live as Markdown files in `src/content/blog/` — see [AUTHORING.md](AUTHORING.md).
- **Design** is an ink-art / literary system in `src/styles/global.css` + `src/components/InkArt/`.
- **SEO** (meta, Open Graph, Twitter, JSON-LD, sitemap, RSS) is generated automatically.

---

## 1. Run it locally

Requires **Node 20+** (you have it). From the project folder:

```bash
npm install        # first time only
npm run dev        # http://localhost:4321
```

Other commands: `npm run build` (production build → `dist/`), `npm run preview`
(serve the build), `npm run new-post -- "Title"` (scaffold a post).

The site runs fine **without** Firebase configured — the forms just show a
friendly "coming soon" message until you complete Step 2.

---

## 2. Firebase setup (one time, ~10 min)

Project: **`inksteel-47253`** · Console: <https://console.firebase.google.com/u/0/project/inksteel-47253/overview>

1. **Register a Web App.** Console → ⚙️ **Project settings** → **General** →
   *Your apps* → **</> (Web)**. Nickname it "Ink & Steel Web". You don't need
   Firebase Hosting. Copy the `firebaseConfig` values it shows you.

2. **Create the database.** Left nav → **Build → Firestore Database** →
   **Create database** → **Production mode** → pick a location (e.g. `nam5`).

3. **Publish the security rules.** In the Firestore **Rules** tab, paste the
   contents of [`firestore.rules`](firestore.rules) and **Publish**. (Or, with the
   Firebase CLI: `firebase deploy --only firestore:rules`.) These rules let
   visitors *create* signups/messages and bump view counts, but **never read,
   list, edit, or delete** — you read submissions in the console.

4. **(Recommended) Turn on App Check** to block spam bots: Console → **App Check**
   → register the web app with **reCAPTCHA v3**. Then we'll initialize App Check
   in `src/lib/firebase.ts` (ask Claude to wire it once you have the site key).

5. **Give the config to the site.** Copy `.env.example` to `.env` and paste your
   six values:

   ```bash
   cp .env.example .env
   ```

   ```
   PUBLIC_FIREBASE_API_KEY=AIza...
   PUBLIC_FIREBASE_AUTH_DOMAIN=inksteel-47253.firebaseapp.com
   PUBLIC_FIREBASE_PROJECT_ID=inksteel-47253
   PUBLIC_FIREBASE_STORAGE_BUCKET=inksteel-47253.appspot.com
   PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   PUBLIC_FIREBASE_APP_ID=1:...:web:...
   ```

   > These keys are **public by design** (they ship in the browser). Your data is
   > protected by the security rules, not by hiding them. `.env` is git-ignored;
   > for production you'll set the same values as GitHub Actions *variables* (Step 4).

**Where submissions go:** newsletter → `subscribers` collection · contact form →
`messages` collection · view counts → `views/{slug}`. Read them in
Firestore → Data.

---

## 3. Push to GitHub

The repo is <https://github.com/jfinsmith/InkSteel.git>. From the project folder:

```bash
git init
git add .
git commit -m "Launch Ink & Steel on Astro"
git branch -M main
git remote add origin https://github.com/jfinsmith/InkSteel.git
git push -u origin main
```

Then in the repo: **Settings → Pages → Build and deployment → Source: GitHub
Actions**. The included workflow ([.github/workflows/deploy.yml](.github/workflows/deploy.yml))
builds and deploys on every push to `main`.

### Add the Firebase config to CI

**Settings → Secrets and variables → Actions → Variables tab → New repository
variable** — add the same six `PUBLIC_FIREBASE_*` names/values from your `.env`.
(They're "variables," not "secrets," because they're public.) Without them the
site still deploys; the forms just stay in "coming soon" mode.

---

## 4. Point your domain (final cutover — do this last)

Your domain `inksteeljournal.com` is currently registered through Squarespace.
**Keep Squarespace live until the new site is verified** at the temporary URL
(`https://jfinsmith.github.io/InkSteel/` or your Pages preview). Then:

1. In the GitHub repo: **Settings → Pages → Custom domain** → enter
   `www.inksteeljournal.com` → Save. (The [`public/CNAME`](public/CNAME) file
   already sets this.)
2. In Squarespace **DNS settings** (or wherever your DNS lives), add:
   - **CNAME**: `www` → `jfinsmith.github.io`
   - **A records** for the apex `@` → GitHub Pages IPs:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
3. Back in **Settings → Pages**, wait for the domain check, then tick
   **Enforce HTTPS**.
4. DNS can take up to ~24h. Once green, every old URL — including
   `https://www.inksteeljournal.com/blog/<slug>` — resolves to the new site.

> Because the domain and every slug are unchanged, there are **no broken links**.
> The one old auto-slug post is redirected (see `astro.config.mjs`).

---

## 5. Publish a new article

See [AUTHORING.md](AUTHORING.md) for the full workflow and your writing prompt.
The short version:

```bash
npm run new-post -- "A Sharp New Title"   # or have Claude write the file
# edit src/content/blog/<slug>.md, set draft: false
git add . && git commit -m "New post: <slug>" && git push
```

GitHub Actions deploys it within a couple of minutes.

---

## Project map

```
src/
  content/blog/        # the articles (Markdown) — one file per post
  content.config.ts    # frontmatter schema
  pages/               # home, blog, post, about, faqs, the-record, tags, categories, rss, 404
  layouts/             # BaseLayout, PostLayout
  components/          # Logo, Header, Footer, BaseHead (SEO), PostCard,
                       #   Newsletter, ContactForm, ViewCounter, InkArt/*
  lib/                 # firebase.ts (guarded client), utils.ts
  styles/global.css    # ink-art design tokens
public/                # favicon, CNAME, robots.txt, og/, images/posts/
firestore.rules        # Firestore security rules
.github/workflows/     # deploy.yml (build + deploy to Pages)
```
