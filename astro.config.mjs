// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import rehypeExternalLinks from 'rehype-external-links';

// The canonical, public URL of the site. Used for sitemap, RSS, and canonical tags.
// This is the apex domain you'll point at GitHub Pages during cutover.
// Path-portable base. Local dev and the final custom domain serve at root ('/').
// The GitHub Pages project URL (jfinsmith.github.io/InkSteel/) serves from a
// subfolder, so CI sets PAGES_BASE=/InkSteel for that build. At domain cutover,
// drop PAGES_BASE from the workflow and the site returns to root automatically.
const base = process.env.PAGES_BASE || '/';

export default defineConfig({
  site: 'https://www.inksteeljournal.com',
  base,
  trailingSlash: 'ignore',
  // Preserve inbound links to the old Squarespace auto-slug for this post.
  // Astro emits a static redirect page (meta-refresh + canonical) for GitHub Pages.
  redirects: {
    '/blog/9xhreh82gpq0nla3c0ymucsy5zz5os': '/blog/the-presidents-preferred-painkiller',
    '/faqs': '/fascism-watch',
  },
  integrations: [
    sitemap({
      // Keep utility/listing taxonomy pages out of the sitemap; index real content.
      filter: (page) =>
        !page.includes('/tags/') && !page.includes('/categories/'),
    }),
    mdx(),
  ],
  markdown: {
    // Outbound source links open in a new tab and don't pass ranking signal.
    rehypePlugins: [
      [
        rehypeExternalLinks,
        { target: '_blank', rel: ['nofollow', 'noopener', 'noreferrer'] },
      ],
    ],
    shikiConfig: { theme: 'github-dark', wrap: true },
  },
});
