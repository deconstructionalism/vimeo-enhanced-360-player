import {
  isStyleInStyleSheets,
  createPlayerAndElement,
  simulatePlayerEvent,
} from "../test-utils/index";
import {
  addEventEmitters,
  addLoadingImage,
  checkIf360Video,
  eventTypes,
  generateLoadingImageStyleCSS,
  uuid,
} from "./vimeo-video-player-helpers";

// CONSTANTS

const BACKGROUND_URL = "https://example.com/image.png";

describe("addEventEmitters", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("emits bubbling custom events for each Vimeo player event type", async () => {
    // Create player and add event emitters
    const { player, element } = await createPlayerAndElement();
    addEventEmitters(player, element);

    // make sure each event type is emitted and captured
    eventTypes.forEach((eventType) => {
      // Create callback to listen for even
      const callback = jest.fn();
      window.addEventListener(
        `vimeo-enhanced-360-player-${eventType}`,
        callback
      );

      // Trigger event on player
      simulatePlayerEvent(player, eventType);

      expect(callback).toHaveBeenCalledTimes(1);
    });
  });
});

describe("addLoadingImage", () => {
  it("does not add loading image if no `vimeoLoadingImageUrl` is in element dataset", async () => {
    // Create player and attempt to add loading image
    const { player, element } = await createPlayerAndElement();
    addLoadingImage(player, element, false);

    // Generate expected style if loading image was added
    const style = generateLoadingImageStyleCSS(element);
    expect(isStyleInStyleSheets(style, document)).toBe(false);
  });

  it("adds loading image if `vimeoLoadingImageUrl` is in element dataset", async () => {
    // Create element to contain Vimeo player and attempt to add loading image
    const { player, element } = await createPlayerAndElement({
      vimeoLoadingImageUrl: BACKGROUND_URL,
    });
    addLoadingImage(player, element, false);

    // Generate expected style if loading image was added
    const style = generateLoadingImageStyleCSS(element);
    expect(isStyleInStyleSheets(style, document)).toBe(true);
  });

  it("applies class to fade out loading image when non-auto-played video is loaded", async () => {
    // Create element to contain Vimeo player and attempt to add loading image
    const { player, element } = await createPlayerAndElement({
      vimeoLoadingImageUrl: BACKGROUND_URL,
    });
    addLoadingImage(player, element, false);

    expect(element.classList.contains("vimeo-video-root--loaded")).toBe(false);

    // Add loading image and simulate loaded event
    addLoadingImage(player, element, false);
    simulatePlayerEvent(player, "loaded");

    expect(element.classList.contains("vimeo-video-root--loaded")).toBe(true);
  });

  it("applies class to fade out loading image when auto-played video is played", async () => {
    // Create element to contain Vimeo player and attempt to add loading image
    const { player, element } = await createPlayerAndElement({
      vimeoLoadingImageUrl: BACKGROUND_URL,
    });
    addLoadingImage(player, element, false);

    expect(element.classList.contains("vimeo-video-root--loaded")).toBe(false);

    // Add loading image and simulate playing event
    addLoadingImage(player, element, true);
    simulatePlayerEvent(player, "playing");

    expect(element.classList.contains("vimeo-video-root--loaded")).toBe(true);
  });
});

describe("checkIf360Video", () => {
  it("detects that video is 360 video", async () => {
    const { player } = await createPlayerAndElement();

    expect(checkIf360Video(player)).resolves.toBe(true);
  });

  it("detects that video is not 360 video", async () => {
    const { player } = await createPlayerAndElement();

    // mock `getCameraProps` to throw error
    jest.spyOn(player, "getCameraProps").mockImplementation(() => {
      throw new Error("Not a 360 video");
    });

    expect(checkIf360Video(player)).resolves.toBe(false);
  });
});

describe("uuid", () => {
  it("generates a v4 uuid", () => {
    // Intercept random number generator with specific values
    [...Array(24).fill(null)].forEach((_, index) => {
      jest.spyOn(global.Math, "random").mockReturnValueOnce(index / 24);
    });

    const uuidRegex = /^([a-f0-9]{4}){2}(-[a-f0-9]{4}){4}$/;
    const uuids = [uuid(), uuid(), uuid(), uuid()];

    expect(uuids.every((id) => uuidRegex.test(id))).toEqual(true);
    expect(uuids[0]).toBe("00000aaa-1555-2000-2aaa-3555");
    expect(uuids[1]).toBe("40004aaa-5555-6000-6aaa-7555");
    expect(uuids[2]).toBe("80008aaa-9555-a000-aaaa-b555");
    expect(uuids[3]).toBe("c000caaa-d555-e000-eaaa-f555");
  });
});
