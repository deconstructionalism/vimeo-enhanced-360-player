import Player, { EventMap } from "@vimeo/player";
import { appendStyle } from "./document-helpers";

// HELPER FUNCTIONS

/**
 * Generates a v4 UUID.
 *
 * @returns a v4 UUID
 */
const uuid = (): `${string}-${string}-${string}-${string}-${string}` => {
  // generate v4 UUID part
  const s4 = (): string =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);

  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}`;
};

/**
 * Adds a loading image to the given element.
 *
 * @param element - The element to add the loading image to
 * @returns CSS to add the loading image to the element
 */
const generateLoadingImageStyleCSS = (element: HTMLElement): string => `
/* add loading image */
div.vimeo-video-root#${element.id}::after {
  background-image: url(${element.dataset.vimeoLoadingImageUrl});
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  bottom: 0;
  content: "";
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
}
`;

// The event types for a Vimeo player
const eventTypes = ((): string[] => {
  // ensure that every event type in `EventMap` is accounted for,
  // otherwise will give compile-time TS errors
  const EventKeys: { [K in keyof Required<EventMap>]: true } = {
    play: true,
    playing: true,
    pause: true,
    ended: true,
    timeupdate: true,
    progress: true,
    seeking: true,
    seeked: true,
    texttrackchange: true,
    chapterchange: true,
    cuechange: true,
    cuepoint: true,
    volumechange: true,
    playbackratechange: true,
    bufferstart: true,
    bufferend: true,
    error: true,
    loaded: true,
    durationchange: true,
    fullscreenchange: true,
    qualitychange: true,
    camerachange: true,
    resize: true,
    enterpictureinpicture: true,
    leavepictureinpicture: true,
  };

  return Object.keys(EventKeys);
})();

/**
 * Adds event listeners that emit custom bubbling events for the given Vimeo
 * player.
 *
 * The custom events are of the form `vimeo-enhanced-360-player-${eventType}`,
 * and contain the original Vimeo player event in `detail`.
 *
 * @param player - Vimeo player instance to add event listeners to
 * @param element - element containing Vimeo player
 */
const addEventEmitters = (player: Player, element: HTMLElement): void => {
  // Add event listeners to the player
  eventTypes.forEach((eventType: string) => {
    // listen for player events
    player.on(eventType, (event: Event) => {
      // Emit custom event that bubbles up
      const customEvent = new CustomEvent(
        `vimeo-enhanced-360-player-${eventType}`,
        { bubbles: true, detail: event }
      );
      element.dispatchEvent(customEvent);
    });
  });
};

/**
 * Checks if the given Vimeo player is playing 360 video.
 *
 * @param player - Vimeo player instance to check
 *
 * @returns whether or not player is playing 360 video
 */
const checkIf360Video = async (player: Player): Promise<boolean> => {
  try {
    await player.getCameraProps();
  } catch (error) {
    return false;
  }

  return true;
};

/**
 * If element has `vimeoLoadingImageUrl` data attribute, add a loading
 * image that shows before video is loaded or auto-played.
 *
 * @param player - Vimeo player instance to add event listeners to
 * @param element - element to add background image to
 * @param willAutoPlay - whether or not video will autoplay
 */
const addLoadingImage = (
  player: Player,
  element: HTMLElement,
  willAutoPlay: boolean
): void => {
  // If element does not have `vimeoLoadingImageUrl` data attribute, do nothing
  if (element.dataset.vimeoLoadingImageUrl === undefined) {
    return;
  }

  const id = `vimeo-video-root-${uuid()}`;
  element.id = id;

  appendStyle(generateLoadingImageStyleCSS(element));

  // fade loading image when video is playing or loaded
  if (willAutoPlay) {
    player.on("playing", () =>
      element.classList.add("vimeo-video-root--loaded")
    );
  } else {
    player.on("loaded", () =>
      element.classList.add("vimeo-video-root--loaded")
    );
  }
};

export {
  addEventEmitters,
  addLoadingImage,
  checkIf360Video,
  eventTypes,
  generateLoadingImageStyleCSS,
  uuid,
};
