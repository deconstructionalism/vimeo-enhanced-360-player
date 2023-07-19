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
 * Will append a custom class to the body if it is a mobile browser.
 *
 * @returns whether or not the current browser is a mobile browser
 */
const checkIfMobileBrowser = (): boolean => {
  const isMobile =
    /iPhone|iPad|iPod|Android|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  // Add class to body if mobile browser
  if (isMobile) {
    document.body.classList.add("vimeo-enhanced-360-player--mobile-browser");
  }

  return isMobile;
};

export { appendStyle, checkIfMobileBrowser };
