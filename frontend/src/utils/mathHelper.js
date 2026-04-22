// Math rendering helper using KaTeX
import katex from 'katex';

// Render inline math $...$
export const renderInlineMath = (text) => {
  if (!text) return '';

  return text.replace(/\$([^$]+)\$/g, (match, formula) => {
    try {
      return katex.renderToString(formula, {
        throwOnError: false,
        displayMode: false
      });
    } catch (error) {
      console.error('KaTeX rendering error:', error);
      return match;
    }
  });
};

// Render block math $$...$$
export const renderBlockMath = (text) => {
  if (!text) return '';

  return text.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
    try {
      return katex.renderToString(formula, {
        throwOnError: false,
        displayMode: true
      });
    } catch (error) {
      console.error('KaTeX rendering error:', error);
      return match;
    }
  });
};

// Render all math in text
export const renderMath = (text) => {
  if (!text) return '';

  // First render block math, then inline math
  let rendered = renderBlockMath(text);
  rendered = renderInlineMath(rendered);

  return rendered;
};

// Check if text contains LaTeX
export const containsMath = (text) => {
  if (!text) return false;
  return /\$\$?[^$]+\$\$?/.test(text);
};

// Wrap LaTeX formulas in proper delimiters if not already
export const wrapMathFormulas = (text) => {
  if (!text) return '';

  // Look for common math patterns that might not be wrapped
  // This is a simple heuristic and might need adjustment
  return text.replace(/([a-zA-Z]\s*=\s*[^,\n]+)/g, (match) => {
    // If already wrapped, don't double-wrap
    if (match.includes('$')) return match;
    // If it looks like an equation, wrap it
    return `$${match}$`;
  });
};
