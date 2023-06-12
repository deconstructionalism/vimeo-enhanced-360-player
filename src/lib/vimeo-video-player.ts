import Player from "@vimeo/player";
import { VimeoManualMouseTracker } from "./vimeo-manual-mouse-tracker";

/**
 * Renders a Vimeo player in the given element using options passed as data attributes.
 *
 * @param element - element to render the Vimeo player in
 *
 * @returns player instance
 */
const renderVideoPlayer = (element: HTMLElement): Player => {
  const player = new Player(element);

  // If autoplay is enabled, we need to mute the video and play it
  if (element.dataset.vimeoAutoplay === "true") {
    player.setVolume(0);
    player.play();
  }

  // If the video is a background video, check this custom data attribute
  // to see if we should manually track the mouse movement
  if (
    element.dataset.vimeoBackground === "true" &&
    element.dataset.vimeoBackgroundEnhanced === "true"
  ) {
    const _ = new VimeoManualMouseTracker(element, player);
  }

  return player;
};

export { renderVideoPlayer };
