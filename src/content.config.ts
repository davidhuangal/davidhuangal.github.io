import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    title: z.string(),
    /** One-to-two-sentence summary, used for the page meta description and RSS. */
    description: z.string(),
    paperTitle: z.string(),
    paperAuthors: z.string().optional(),
    paperYear: z.number(),
    topic: z.enum(['semantic-segmentation', 'object-detection']),
    subtopic: z.enum(['general', 'remote-sensing']),
    date: z.coerce.date(),
  }),
});

export const collections = { notes };
