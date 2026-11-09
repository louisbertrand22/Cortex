import { getCollection, getEntry, type CollectionEntry } from 'astro:content';

export type Lesson = CollectionEntry<'lessons'>;
export type Subject = CollectionEntry<'subjects'>;

/** « aiad/01-fondamentaux » → « 01-fondamentaux » */
export const lessonSlug = (lesson: Lesson) => lesson.id.split('/').pop()!;
export const lessonUrl = (lesson: Lesson) => `/cours/${lesson.data.subject.id}/${lessonSlug(lesson)}/`;
export const subjectUrl = (subject: Subject | string) =>
  `/cours/${typeof subject === 'string' ? subject : subject.id}/`;

const showDrafts = import.meta.env.DEV;

export async function getLessons(subjectId?: string) {
  const lessons = await getCollection(
    'lessons',
    (l) => (showDrafts || !l.data.draft) && (!subjectId || l.data.subject.id === subjectId),
  );
  return lessons.sort((a, b) => a.data.session - b.data.session);
}

/**
 * Matières triées. `visibility` : `public` (par défaut, pages publiques), `private` (espace privé) ou `all`
 * (génération des routes, navigation d'une page privée).
 */
export type Visibility = 'public' | 'private' | 'all';
export async function getSubjects(visibility: Visibility = 'public') {
  const subjects = await getCollection(
    'subjects',
    (s) => visibility === 'all' || s.data.private === (visibility === 'private'),
  );
  return subjects.sort((a, b) => a.data.order - b.data.order);
}

/** Routes des leçons (avec précédente/suivante dans la matière), éventuellement limitées à certaines matières. */
export async function lessonPaths(keep: (subjectId: string) => boolean = () => true) {
  const lessons = await getLessons();
  return lessons
    .filter((l) => keep(l.data.subject.id))
    .map((lesson) => {
      const siblings = lessons.filter((l) => l.data.subject.id === lesson.data.subject.id);
      const i = siblings.indexOf(lesson);
      return {
        params: { subject: lesson.data.subject.id, lesson: lessonSlug(lesson) },
        props: { lesson, prev: siblings[i - 1], next: siblings[i + 1] },
      };
    });
}

/** Arbre de navigation : matières → sessions. */
export async function getNavTree(visibility: Visibility = 'public') {
  const [subjects, lessons] = await Promise.all([getSubjects(visibility), getLessons()]);
  return subjects.map((subject) => ({
    subject,
    lessons: lessons.filter((l) => l.data.subject.id === subject.id),
  }));
}

export { getEntry };

/** Partie de la matière qui contient une session (la dernière dont `from` est atteint). */
export const partOf = (subject: Subject, session: number) =>
  [...subject.data.parts].sort((a, b) => a.from - b.from).findLast((p) => p.from <= session);

/** Auteur du site, pour les données structurées schema.org. */
export const author = { '@type': 'Person', name: 'Louis Bertrand', url: 'https://lab.louis-bertrand.fr' };

/** Fil d'Ariane schema.org (`[nom, chemin]` depuis la racine). */
export const breadcrumbLd = (site: URL, items: [string, string][]) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: new URL(path, site).href })),
});

export const domainLabels: Record<Subject['data']['domain'], string> = {
  ia: 'Intelligence artificielle',
  architecture: 'Architecture',
  infrastructure: 'Infrastructure',
  'genie-logiciel': 'Génie logiciel',
  securite: 'Sécurité',
  data: 'Data',
  economie: 'Économie et finance',
  philosophie: 'Philosophie',
  autre: 'Autre',
};
