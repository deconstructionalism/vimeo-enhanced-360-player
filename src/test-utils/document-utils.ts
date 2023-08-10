// EXPORTS

/**
 * Check that a style is in the document's stylesheets.
 *
 * @param style - The style to check for
 * @param document - The document to check in
 * @returns whether the style is in the document's stylesheets
 */
const isStyleInStyleSheets = (style: string, document: Document): boolean => {
  // Serialize all stylesheets into an array of strings
  const styleElements = document.querySelectorAll("style");
  const styles = [...styleElements].map((element) => element.innerHTML);

  return styles.includes(style);
};

export { isStyleInStyleSheets };
