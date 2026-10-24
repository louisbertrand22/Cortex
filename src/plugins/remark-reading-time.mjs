/** Estime le temps de lecture (≈ 200 mots/min en français technique). */
function text(node) {
  if (node.type === 'text' || node.type === 'inlineCode') return node.value + ' ';
  if (node.type === 'code') return '';
  return (node.children ?? []).map(text).join('');
}

export function remarkReadingTime() {
  return (tree, file) => {
    const words = text(tree).split(/\s+/).filter(Boolean).length;
    file.data.astro ??= {};
    file.data.astro.frontmatter ??= {};
    file.data.astro.frontmatter.readingTime = Math.max(1, Math.round(words / 200));
  };
}
