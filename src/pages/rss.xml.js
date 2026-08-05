import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const notes = await getCollection('notes');
  return rss({
    title: 'David Huangal · Paper Notes',
    description:
      'Notes taken while reading research papers on semantic segmentation and object detection.',
    site: context.site,
    items: notes
      .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
      .map((note) => ({
        title: `${note.data.title} — ${note.data.paperTitle}`,
        description: note.data.description,
        pubDate: note.data.date,
        link: `/notes/${note.id}/`,
      })),
  });
}
