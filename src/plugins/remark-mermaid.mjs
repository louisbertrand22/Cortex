/**
 * Transforme les blocs ```mermaid en <div class="mermaid-diagram" data-mermaid="…">.
 * Le rendu SVG est fait côté client par src/components/mdx/MermaidRuntime.astro,
 * ce qui permet de re-rendre les diagrammes quand le thème clair/sombre change.
 */
function walk(node, fn) {
  fn(node);
  if (node.children) for (const child of node.children) walk(child, fn);
}

export function remarkMermaid() {
  return (tree, file) => {
    let count = 0;
    walk(tree, (node) => {
      if (node.type !== 'code' || node.lang !== 'mermaid') return;
      count++;
      const caption = /title="([^"]+)"/.exec(node.meta ?? '')?.[1];
      node.data = {
        hName: 'figure',
        hProperties: {
          className: ['mermaid-figure'],
          'data-pagefind-ignore': '',
        },
        hChildren: [
          {
            type: 'element',
            tagName: 'div',
            properties: { className: ['mermaid-diagram'], 'data-mermaid': node.value },
            children: [],
          },
          ...(caption
            ? [{ type: 'element', tagName: 'figcaption', properties: {}, children: [{ type: 'text', value: caption }] }]
            : []),
        ],
      };
    });
    file.data.astro ??= {};
    file.data.astro.frontmatter ??= {};
    file.data.astro.frontmatter.diagramCount = count;
  };
}
