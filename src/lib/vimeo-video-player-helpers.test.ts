import {
  addEventEmitters,
  addLoadingImage,
  checkIf360Video,
  eventTypes,
} from "./vimeo-video-player-helpers";
import Player, { EventMap } from "@vimeo/player";

// MOCKS

jest.mock("@vimeo/player", () => {
  // tslint:disable-next-line: only-arrow-functions
  return function (_: HTMLElement) {
    // Create object to hold callbacks for each event type
    const callbacks: { [key: string]: jest.Mock } = {};

    return {
      // Create methods to simulate all events on player.
      // These methods do not actually exist in the Vimeo player API
      _simulate: eventTypes.reduce(
        (acc, eventType) => ({
          ...acc,
          [eventType]: () => callbacks[eventType](),
        }),
        {}
      ),

      // Mock `on` method to store callback for each event type
      on: jest.fn((eventType: keyof EventMap, callback: jest.Mock) => {
        callbacks[eventType] = callback;
      }),

      // by default, mock `getCameraProps` to return values that indicate
      // video is 360 video
      getCameraProps: jest
        .fn()
        .mockResolvedValue({ yaw: 0, pitch: 0, roll: 0, fov: 0 }),
    };
  };
});

// HELPER FUNCTIONS

/**
 * Simulates the given event type on the given Vimeo player instance.
 *
 * @param player - Vimeo player instance to simulate event on
 * @param eventType - event type to simulate
 */
const simulatePlayerEvent = (player: Player, eventType: string): void => {
  // use `getOwnPropertyDescriptor` to get access to private `_simulate` methods
  // that are otherwise not part of `Player` type
  const simulators = Object.getOwnPropertyDescriptor(
    player,
    "_simulate"
  )?.value;
  Object.getOwnPropertyDescriptor(simulators, eventType)?.value();
};

describe("addEventEmitters", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("emits bubbling custom events for each Vimeo player event type", () => {
    // Create element to contain Vimeo player
    const element = document.createElement("div");
    document.body.appendChild(element);

    // Create player and add event emitters
    const player = new Player(element);
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
  it("does not add loading image if no `vimeoLoadingImageUrl` is in element dataset", () => {
    const element = document.createElement("div");
    document.body.appendChild(element);

    const player = new Player(element);
    const styleElementsBefore = document.querySelectorAll("style");

    addLoadingImage(player, element, false);
    const styleElementsAfter = document.querySelectorAll("style");

    expect(styleElementsBefore.length).toBe(styleElementsAfter.length);
  });

  it("adds loading image if `vimeoLoadingImageUrl` is in element dataset", () => {
    const backgroundUrl = "https://example.com/image.jpg";
    const element = document.createElement("div");
    element.dataset.vimeoLoadingImageUrl = backgroundUrl;
    document.body.appendChild(element);

    const player = new Player(element);
    const styleElementsBefore = document.querySelectorAll("style");

    addLoadingImage(player, element, false);
    const styleElementsAfter = document.querySelectorAll("style");

    expect(styleElementsBefore.length + 1).toBe(styleElementsAfter.length);
    expect(
      styleElementsAfter[styleElementsAfter.length - 1].innerText
    ).toContain(`background-image: url(${backgroundUrl});`);
  });

  it("applies class to fade out loading image when non-auto-played video is loaded", () => {
    const backgroundUrl = "https://example.com/image.jpg";
    const element = document.createElement("div");
    element.dataset.vimeoLoadingImageUrl = backgroundUrl;
    document.body.appendChild(element);

    const player = new Player(element);

    expect(element.classList.contains("vimeo-video-root--loaded")).toBe(false);

    addLoadingImage(player, element, false);
    simulatePlayerEvent(player, "loaded");

    expect(element.classList.contains("vimeo-video-root--loaded")).toBe(true);
  });

  it("applies class to fade out loading image when auto-played video is played", () => {
    const backgroundUrl = "https://example.com/image.jpg";
    const element = document.createElement("div");
    element.dataset.vimeoLoadingImageUrl = backgroundUrl;
    document.body.appendChild(element);

    const player = new Player(element);

    expect(element.classList.contains("vimeo-video-root--loaded")).toBe(false);

    addLoadingImage(player, element, true);
    simulatePlayerEvent(player, "playing");

    expect(element.classList.contains("vimeo-video-root--loaded")).toBe(true);
  });
});

describe("checkIf360Video", () => {
  it("detects that video is 360 video", () => {
    const player = new Player(document.createElement("div"));

    expect(checkIf360Video(player)).resolves.toBe(true);
  });

  it("detects that video is not 360 video", () => {
    const player = new Player(document.createElement("div"));

    // mock `getCameraProps` to throw error
    jest.spyOn(player, "getCameraProps").mockImplementation(() => {
      throw new Error("Not a 360 video");
    });

    expect(checkIf360Video(player)).resolves.toBe(false);
  });
});
