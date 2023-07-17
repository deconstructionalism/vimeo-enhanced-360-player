/**
 * Appends a style element to the document head with the given css.
 *
 * @param css - css to append to the document
 */
const appendStyle = (css: string): void => {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = css;
  document.head.appendChild(styleSheet);
};

/**
 * Checks if the current browser is a mobile browser.
 *
 * @returns whether or not the current browser is a mobile browser
 */
const checkIfMobileBrowser = (): boolean => {
  return /iPhone|iPad|iPod|Android|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

export { appendStyle, checkIfMobileBrowser };
