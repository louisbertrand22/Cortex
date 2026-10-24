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

export async function getSubjects() {
  const subjects = await getCollection('subjects');
  return subjects.sort((a, b) => a.data.order - b.data.order);
}

/** Arbre de navigation : matières → sessions. */
export async function getNavTree() {
  const [subjects, lessons] = await Promise.all([getSubjects(), getLessons()]);
  return subjects.map((subject) => ({
    subject,
    lessons: lessons.filter((l) => l.data.subject.id === subject.id),
  }));
}

export { getEntry };

export const domainLabels: Record<Subject['data']['domain'], string> = {
  ia: 'Intelligence artificielle',
  architecture: 'Architecture',
  infrastructure: 'Infrastructure',
  'genie-logiciel': 'Génie logiciel',
  securite: 'Sécurité',
  data: 'Data',
  autre: 'Autre',
};
