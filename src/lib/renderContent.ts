/**
 * Zero-dependency Markdown / HTML content renderer.
 * Converts Markdown, raw plain text, or HTML into clean, unified HTML
 * without relying on external packages like 'marked', ensuring GitHub Actions
 * and Vite build seamlessly anywhere.
 */
export function renderContentToHtml(rawContent: string | null | undefined): string {
  if (!rawContent) return '';

  // 1. Unescape literal '\\n' sequences if present
  let content = rawContent.replace(/\\n/g, '\n');

  // 2. Strip harmful or non-uniform inline attributes (styles, fonts, colors, float alignment)
  content = content
    .replace(/\s*style="[^"]*"/gi, '')
    .replace(/\s*style='[^']*'/gi, '')
    .replace(/\s*class="[^"]*"/gi, '')
    .replace(/\s*class='[^']*'/gi, '')
    .replace(/\s*font="[^"]*"/gi, '')
    .replace(/\s*align="[^"]*"/gi, '')
    .replace(/<font[^>]*>/gi, '')
    .replace(/<\/font>/gi, '');

  // If content contains raw HTML block tags (like <p>, <div>, <h3>), return formatted HTML directly
  const hasHtmlTags = /<(p|div|h[1-6]|ul|ol|table|blockquote)[^>]*>/i.test(content);
  if (hasHtmlTags) {
    return content;
  }

  // 3. Otherwise, parse as Markdown / Formatted Plain Text line-by-line
  const lines = content.split('\n');
  const resultLines: string[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' | null = null;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    if (!line) {
      if (inList) {
        resultLines.push(listType === 'ul' ? '</ul>' : '</ol>');
        inList = false;
        listType = null;
      }
      continue;
    }

    // Escape basic HTML entities in raw text to prevent injection (unless already formatted)
    // Note: preserving bold/markdown syntax before line formatting
    line = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Format inline Markdown elements
    // Bold: **text** or __text__
    line = line.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
    // Italic: *text* or _text_
    line = line.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');
    // Links: [label](url)
    line = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Headings
    if (line.startsWith('#### ')) {
      if (inList) { resultLines.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false; }
      resultLines.push(`<h4>${line.slice(5)}</h4>`);
      continue;
    }
    if (line.startsWith('### ')) {
      if (inList) { resultLines.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false; }
      resultLines.push(`<h3>${line.slice(4)}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      if (inList) { resultLines.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false; }
      resultLines.push(`<h2>${line.slice(3)}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      if (inList) { resultLines.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false; }
      resultLines.push(`<h1>${line.slice(2)}</h1>`);
      continue;
    }

    // Blockquotes
    if (line.startsWith('&gt; ')) {
      if (inList) { resultLines.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false; }
      resultLines.push(`<blockquote>${line.slice(5)}</blockquote>`);
      continue;
    }

    // Unordered lists (•, ▪, -, *)
    const isUnordered = /^([•▪‣⁃\-\*])\s+(.*)/.exec(line);
    if (isUnordered) {
      if (!inList || listType !== 'ul') {
        if (inList) resultLines.push(listType === 'ul' ? '</ul>' : '</ol>');
        resultLines.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      resultLines.push(`<li>${isUnordered[2]}</li>`);
      continue;
    }

    // Ordered lists (1., 2., etc.)
    const isOrdered = /^(\d+)\.\s+(.*)/.exec(line);
    if (isOrdered) {
      if (!inList || listType !== 'ol') {
        if (inList) resultLines.push(listType === 'ul' ? '</ul>' : '</ol>');
        resultLines.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      resultLines.push(`<li>${isOrdered[2]}</li>`);
      continue;
    }

    // Close open lists if this line is normal text
    if (inList) {
      resultLines.push(listType === 'ul' ? '</ul>' : '</ol>');
      inList = false;
      listType = null;
    }

    // Regular paragraph
    resultLines.push(`<p>${line}</p>`);
  }

  if (inList) {
    resultLines.push(listType === 'ul' ? '</ul>' : '</ol>');
  }

  return resultLines.join('\n');
}
