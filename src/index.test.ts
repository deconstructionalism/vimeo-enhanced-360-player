import { load, styleCSS } from "./index";
import { isStyleInStyleSheets } from "./test-utils";

describe("load", () => {
  beforeEach(() => {
    window.vimeoPlayers = [];
  });

  it("appends a stylesheet for video root elements containing Vimeo players", async () => {
    await load();

    expect(isStyleInStyleSheets(styleCSS, document)).toBe(true);
  });

  it("sets up Vimeo player on elements with 'vimeo-video-root' class and attached player instances to `window.vimeoPlayers`", async () => {
    // Create 10 elements, every other one will be a vimeo video root
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

    // Get the vimeo player vimeo ids from the players
    const playerIds = window.vimeoPlayers.map(
      (player) =>
        Object.getOwnPropertyDescriptor(player, "_element")?.value?.dataset
          ?.vimeoId
    );

    expect(playerIds).toStrictEqual(["0", "2", "4", "6", "8"]);
  });
});
