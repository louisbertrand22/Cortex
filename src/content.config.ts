import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Une matière (UE) : regroupe plusieurs sessions. */
const subjects = defineCollection({
  loader: file('src/content/subjects.json'),
  schema: z.object({
    title: z.string(),
    short: z.string(), // sigle affiché dans la navigation (ex. « AIAD »)
    description: z.string(),
    teacher: z.string().optional(),
    semester: z.string().optional(),
    domain: z.enum(['ia', 'architecture', 'infrastructure', 'genie-logiciel', 'securite', 'data', 'autre']),
    accent: z.string().default('signal'), // nom d'une couleur du thème
    order: z.number().default(0),
    plannedSessions: z.number().optional(), // nombre total de sessions prévues dans l'UE
    // Sessions annoncées mais pas encore rédigées : affichées en pointillés sur la page de la matière
    upcoming: z
      .array(z.object({ session: z.number(), title: z.string(), description: z.string().optional() }))
      .default([]),
    // Parties de la matière : chacune commence à la session `from` et court jusqu'à la partie suivante
    parts: z
      .array(z.object({ title: z.string(), description: z.string().optional(), from: z.number() }))
      .default([]),
  }),
});

/** Une session de cours, rédigée en MDX : src/content/lessons/<matière>/<NN-slug>.mdx */
const lessons = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/lessons' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    subject: reference('subjects'),
    session: z.number(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    objectives: z.array(z.string()).default([]),
    sources: z
      .array(z.object({ label: z.string(), url: z.url().optional() }))
      .default([]),
    updated: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { subjects, lessons };
