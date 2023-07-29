import { load } from "./index";

// MOCKS

jest.mock("./lib/render-video-player", () =>
  jest.fn((element) => element.dataset.vimeoId)
);

describe("load", () => {
  it("appends a stylesheet for video root elements containing Vimeo players", async () => {
    await load();

    const styleElements = document.head.querySelectorAll("style");
    expect(styleElements.length).toBeGreaterThan(0);

    const mainStyle = styleElements[0];
    expect(mainStyle.textContent).toContain("vimeo-video-root");
  });

  it("sets up Vimeo player on elements with 'vimeo-video-root' class", async () => {
    Array(10)
      .fill(null)
      .forEach((_, index) => {
        const element = document.createElement("div");
        // every other element will be a vimeo video root
        element.classList.add(
          index % 2 === 0 ? "vimeo-video-root" : "not-vimeo-video-root"
        );
        element.dataset.vimeoId = `${index}`;
        document.body.appendChild(element);
      });

    await load();

    expect(window.vimeoPlayers).toBeDefined();
    expect(window.vimeoPlayers.length).toBe(5);
    expect(window.vimeoPlayers).toStrictEqual(["0", "2", "4", "6", "8"]);
  });
});
