import { isStyleInStyleSheets } from "../test-utils";
import {
  appendStyle,
  checkIfMobileBrowser,
  mobileBrowserUserAgents,
} from "./document-helpers";

describe("appendStyle", () => {
  it("appends css to the document head", () => {
    // set css
    const cssStyle = "body { background-color: red; }";
    appendStyle(cssStyle);

    const styleElements = document.querySelectorAll("style");

    expect(styleElements.length).toBe(1);
    expect(isStyleInStyleSheets(cssStyle, document)).toBe(true);
  });
});

describe("checkIfMobileBrowser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("can determine if browser is not mobile", () => {
    checkIfMobileBrowser();

    // make sure browser does not have mobile user agent
    mobileBrowserUserAgents.forEach((userAgent) => {
      expect(navigator.userAgent).not.toBe(userAgent);
    });

    expect(
      document.body.classList.contains(
        "vimeo-enhanced-360-player--mobile-browser"
      )
    ).toBe(false);
  });

  it("can determine if browser is mobile and then set a css class on body accordingly", () => {
    mobileBrowserUserAgents.forEach((userAgent) => {
      // mock userAgent to be mobile
      jest.spyOn(navigator, "userAgent", "get").mockReturnValue(userAgent);

      // reset body class
      document.body.classList.value = "";

      checkIfMobileBrowser();

      expect(
        document.body.classList.contains(
          "vimeo-enhanced-360-player--mobile-browser"
        )
      ).toBe(true);
    });
  });
});
