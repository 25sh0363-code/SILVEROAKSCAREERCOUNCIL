import { marked } from 'marked';

// Configure marked to enable GitHub Flavored Markdown and treat linebreaks as <br>
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Converts Markdown, raw plain text, or HTML content into clean, formatted HTML.
 * Strips inline style/font/class attributes so all text adopts the site's unified font and box style.
 */
export function renderContentToHtml(rawContent: string | null | undefined): string {
  if (!rawContent) return '';

  // 1. Unescape literal '\\n' sequences if present
  let content = rawContent.replace(/\\n/g, '\n');

  // 2. Normalize unicode bullet characters at line start to standard markdown bullet '-'
  content = content.replace(/^[\t ]*[•▪‣⁃][\t ]*/gm, '- ');

  // 3. Parse with marked
  let html = '';
  try {
    const parsed = marked.parse(content);
    html = typeof parsed === 'string' ? parsed : content;
  } catch (err) {
    console.error('Error parsing markdown content:', err);
    html = content;
  }

  // 4. Strip inline style="...", class="...", font="...", align="..." attributes to guarantee unified theme font and colors
  html = html
    .replace(/\s*style="[^"]*"/gi, '')
    .replace(/\s*style='[^']*'/gi, '')
    .replace(/\s*class="[^"]*"/gi, '')
    .replace(/\s*class='[^']*'/gi, '')
    .replace(/\s*font="[^"]*"/gi, '')
    .replace(/\s*align="[^"]*"/gi, '')
    .replace(/<font[^>]*>/gi, '')
    .replace(/<\/font>/gi, '');

  return html;
}

