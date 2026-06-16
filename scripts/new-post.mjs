#!/usr/bin/env node
// Scaffold a new blog post:  npm run new-post -- "My Catchy Title"
// Creates src/content/blog/<slug>.md with today's date and a ready-to-fill
// frontmatter block. The hero falls back to a generated ink-wash plate, so you
// can publish without supplying an image.
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const title = process.argv.slice(2).join(' ').trim();
if (!title) {
  console.error('Usage: npm run new-post -- "My Catchy Title"');
  process.exit(1);
}

const slug = slugify(title);
const dir = join(process.cwd(), 'src', 'content', 'blog');
mkdirSync(dir, { recursive: true });
const file = join(dir, `${slug}.md`);
if (existsSync(file)) {
  console.error(`Refusing to overwrite existing post: ${file}`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

const template = `---
title: ${JSON.stringify(title)}
seoTitle: ""
description: ""
excerpt: ""
pubDate: ${today}
author: "Justin Smith"
categories: ["Political Commentary", "Opinion", "US Politics", "Trump Administration"]
tags: ["Donald Trump", "Second Term"]
heroImageAlt: ""
heroImagePrompt: ""
draft: true
---

Write the post here, in the established voice. Use inline IEEE citations like [1], [2].

## References

[1] "Source title." _Publisher_, date. <https://example.com>
`;

writeFileSync(file, template, 'utf8');
console.log(`Created ${file}`);
console.log(`URL will be: /blog/${slug}`);
console.log('Set draft: false when ready to publish.');
