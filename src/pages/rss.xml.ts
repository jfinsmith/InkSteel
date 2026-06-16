import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  return rss({
    title: 'The Ink & Steel',
    description:
      'From the Desk of Sanity — decoding the politics of the United States. Sharp, sourced political commentary by Justin Smith.',
    site: context.site ?? 'https://www.inksteeljournal.com',
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.excerpt,
      link: `/blog/${post.id}/`,
      categories: [...post.data.categories, ...post.data.tags],
      author: post.data.author,
    })),
    customData: `<language>en-us</language>`,
  });
}
