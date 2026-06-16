import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Each article is a Markdown file in src/content/blog/. The filename (minus .md)
// becomes the URL slug, so we reuse the exact Squarespace slugs for SEO continuity.
const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    // Optional search-engine title override; falls back to `title` if absent.
    seoTitle: z.string().optional(),
    // Doubles as the SEO meta description — kept under Google's display limit.
    description: z.string().max(400),
    // Preview paragraph shown on cards and at the top of the post.
    excerpt: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Justin Smith'),
    tags: z.array(z.string()).default([]),
    categories: z.array(z.string()).default([]),
    // Path to a hero image under /public (e.g. "/images/posts/foo.jpg").
    // If omitted, an on-brand SVG "ink-wash" hero is generated from the title.
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    // The paste-ready prompt used to generate this post's hero in Gemini/Imagen.
    heroImagePrompt: z.string().optional(),
    draft: z.boolean().default(false),
    // Original URL, if this post was migrated; used for the canonical tag only
    // when the live domain differs. Normally left unset once we own the domain.
    canonicalURL: z.string().url().optional(),
  }),
});

export const collections = { blog };
