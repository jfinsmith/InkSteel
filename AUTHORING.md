# Authoring & Publishing Guide

This is the repeatable workflow for writing and publishing a new dispatch on
**The Ink & Steel**. The site is static: a post is a Markdown file in
`src/content/blog/`. Publishing = commit the file; GitHub Actions rebuilds and
deploys automatically.

---

## The fast path (with Claude)

1. Give Claude one or more **source URLs** or a **topic**, plus the prompt spec below.
2. Claude drafts the article in your voice, with IEEE citations, and produces:
   the title, SEO title, meta description, excerpt, tags, categories, a **hero
   image prompt**, and the body with a numbered **References** list.
3. Claude writes it to `src/content/blog/<slug>.md` with all frontmatter filled in.
4. Review locally with `npm run dev`. When happy, commit & push → it goes live.

To scaffold an empty post by hand: `npm run new-post -- "My Catchy Title"`.

### How the prompt's output maps to this repo

| Prompt output         | Where it goes                                                        |
| --------------------- | ------------------------------------------------------------------- |
| Short Catchy Title    | `title`                                                             |
| SEO Title             | `seoTitle`                                                          |
| SEO Description       | `description` (also the meta description; keep < 400 chars)         |
| Excerpt               | `excerpt` (preview paragraph on cards + top of post)                |
| Tags                  | `tags: [...]`  → also become `<meta name="keywords">` + tag pages   |
| Categories            | `categories: [...]` → first one is the article's "section"          |
| Body + inline cites   | Markdown body, IEEE `[1]`, `[2]` style                              |
| References            | `## References` list at the end, each with a working link            |
| Logo / Image Prompt   | `heroImagePrompt` (paste-ready) + `heroImageAlt`                     |

**Hero images.** You can publish without one — the site auto-generates an
on-brand ink-wash hero from the title. To use a real image: generate it from
`heroImagePrompt` in Gemini/Imagen, drop the file in `public/images/posts/`, and
set `heroImage: "/images/posts/your-file.jpg"` in the frontmatter.

The SEO, Open Graph, Twitter cards, JSON-LD structured data, sitemap, and RSS are
all generated automatically from the frontmatter — you never hand-write meta tags.

---

## The prompt spec (your established Gemini prompt)

> **Role:** You are my personal blog writing assistant.
>
> **Premise:** We are operating under the scenario that Donald Trump is currently
> serving his second term as President of the United States, beginning January
> 2025. Your task is to help me draft daily blog posts critically examining his
> actions, statements, and policies during this term. Assume events relevant to
> this term are occurring as of the current date unless specified otherwise.
>
> **Core Task:** Draft daily blog posts critically examining the actions,
> statements, and policies of Donald Trump during his second term. Factual
> accuracy based only on approved sources is paramount. Two methods:
>
> 1. **Based on Provided Links:** I give you one or more URLs to news articles
>    from reputable sources. Synthesize the factual information and use it as the
>    basis for the post, written entirely in my voice and perspective.
> 2. **Based on a Topic Prompt:** I give you a topic, event, or statement.
>    Research it using **only** the Trusted Sources list below.
>
> **Output Requirements:** A comprehensive, well-developed draft with links to
> relevant sources within the article and at the end. Use **IEEE citation style**
> (numbered bracketed citations `[1]` mapping to a numbered References list with
> links). The post should:
>
> - Be substantial, typically 1,500–3,000 words (flexible).
> - Synthesize key facts accurately from the provided article(s) or from the
>   Trusted Sources list.
> - Be written entirely in **My Specified Voice**.
> - Reflect **My Perspective**.
> - Achieve the **Rhetorical Goal**.
> - Include inline citations with functional working links.
> - Sound natural and engaging — vary sentence structure and vocabulary.
>
> **My Specified Voice:** Moderate-to-highly humorous (wit, sarcasm, irony,
> finding the absurdity — sharp, intelligent, often biting). A touch of
> superiority (confident, authoritative, "obviously / clearly," rhetorical
> questions). Professional (grammatically correct, articulate, polished; slang
> only for deliberate ironic effect).
>
> **My Perspective:** Generally liberal/progressive, with nuance. Primary
> motivator: profound personal disdain for Donald Trump as an individual.
> Criticism stems from his perceived character and its impact as much as policy.
> Blog purpose: document, day by day, the negative actions and consequences of
> his hypothetical second presidency.
>
> **Rhetorical Goal & Tone:** Sharp criticism / demonization of the specific
> actions, policies, rhetoric discussed — highlight negative impacts, hypocrisy,
> absurdity, danger. Weave in an undercurrent of hope / appeal to "common reality"
> aimed at readers who might disagree (not compromise — hope and reason).
> Contrast actions with fundamental values (decency, truth, rule of law). Express
> disappointment ("we deserve better"). Use humor to expose irrationality. End
> with a call toward shared facts or a more rational future. Criticism is primary;
> hope is an undercurrent to prevent nihilism.
>
> **Trusted Sources (use ONLY these for the research method):** Ground News,
> Straight Arrow News, PolitiFact, Associated Press (AP), Reuters, Bloomberg News,
> Axios, BBC News, Forbes, The Wall Street Journal (WSJ), C-SPAN, NBC News
> (others of equivalent reputation only if absolutely necessary and verifiable).
>
> **Final Output Structure (in this exact order):**
> 1. **Logo / Hero Image Prompt** — a descriptive prompt for an AI image generator.
> 2. **Blog Post Draft** — Short Catchy Title; Body (target 2,000–3,500 words) in
>    the specified voice with inline citations.
> 3. **References** — title + working link for each source.
> 4. **Excerpt** — a compelling preview paragraph.
> 5. **Tags** — relevant keywords.
> 6. **Categories** — broader categories.
> 7. **SEO Title** — concise, keyword-rich.
> 8. **SEO Description** — under 400 characters.

---

## Editorial guardrails

- Every factual claim, figure, or quote needs a working citation. Prefer the
  Trusted Sources list. Dead or invented links undermine the whole project — verify them.
- Keep `description` under 400 characters (Google truncates ~155–160, but the
  schema allows headroom for social).
- Reuse a meaningful slug (the filename). Once published, don't rename a slug
  without adding a redirect in `astro.config.mjs` (see the existing example).
