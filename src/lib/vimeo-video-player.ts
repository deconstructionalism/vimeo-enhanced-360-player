import Player, { Options } from "@vimeo/player";
import { VimeoDataCast } from "./vimeo-data-validation";
import { VimeoManualMouseTracker } from "./vimeo-manual-mouse-tracker";

// Validations for all valid data attributes passed to the Vimeo root element
// See here for explanation of all data attributes: https://developer.vimeo.com/player/sdk/embed
const dataValidations = [
  new VimeoDataCast("id", "string"),
  new VimeoDataCast("url", "string"),
  new VimeoDataCast("autopause", "boolean"),
  new VimeoDataCast("autopip", "boolean"),
  new VimeoDataCast("autoplay", "boolean"),
  new VimeoDataCast("background", "boolean"),
  new VimeoDataCast("byline", "boolean"),
  new VimeoDataCast("color", "string"),
  new VimeoDataCast("controls", "boolean"),
  new VimeoDataCast("dnt", "boolean"),
  new VimeoDataCast("height", "number"),
  new VimeoDataCast("interactive_params", "object"),
  new VimeoDataCast("keyboard", "boolean"),
  new VimeoDataCast("loop", "boolean"),
  new VimeoDataCast("maxheight", "number"),
  new VimeoDataCast("maxwidth", "number"),
  new VimeoDataCast("muted", "boolean"),
  new VimeoDataCast("pip", "boolean"),
  new VimeoDataCast("playsinline", "boolean"),
  new VimeoDataCast("portrait", "boolean"),
  new VimeoDataCast("quality", "string"),
  new VimeoDataCast("responsive", "boolean"),
  new VimeoDataCast("speed", "boolean"),
  new VimeoDataCast("texttrack", "string"),
  new VimeoDataCast("title", "boolean"),
  new VimeoDataCast("transparent", "boolean"),
  new VimeoDataCast("width", "number"),
];

/**
 * Renders a Vimeo player in the given element using options passed as data attributes.
 *
 * @param element - element to render the Vimeo player in
 *
 * @returns player instance
 */
const renderVideoPlayer = (element: HTMLElement): Player => {
  // Validate and transform data attributes passed to the Vimeo Root element
  const options: Options = dataValidations.reduce((acc, validation) => {
    const value = validation.validate(element.dataset);

    // Only add the option if it is defined
    return value === undefined
      ? acc
      : {
          ...acc,
          [validation.key]: value,
        };
  }, {});

  const player = new Player(element, options);

  // If autoplay is enabled, we need to mute the video and play it
  if (options.autoplay === true) {
    player.setVolume(0);
    player.play();
  }

  // If the video is a background video, check this custom data attribute
  // to see if we should manually track the mouse movement
  const customBackgroundControl = new VimeoDataCast(
    "custom_backgroundcontrol",
    "boolean"
  ).validate(element.dataset);

  if (options.background === true && customBackgroundControl === true) {
    const _ = new VimeoManualMouseTracker(element, player);
  }

  return player;
};

export { renderVideoPlayer };
