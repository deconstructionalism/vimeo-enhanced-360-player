import Player from "@vimeo/player";
import VimeoCameraInputTracker from "./vimeo-camera-input-tracker";
import { appendStyle, checkIfMobileBrowser } from "./document-helpers";
import {
  addEventEmitters,
  addLoadingImage,
  checkIf360Video,
} from "./vimeo-video-player-helpers";

/**
 * Renders a Vimeo player in the given element using options passed as data attributes.
 *
 * @param element - element to render the Vimeo player in
 *
 * @returns player instance
 */
const renderVideoPlayer = async (element: HTMLElement): Promise<Player> => {
  // Create a new Vimeo player instance
  const player = new Player(element);

  // On mobile devices, we should attempt to load a fallback video if provided
  if (checkIfMobileBrowser()) {
    const { vimeoMobileFallbackId, vimeoMobileFallbackUrl } = element.dataset;

    if (vimeoMobileFallbackId) {
      await player.loadVideo(vimeoMobileFallbackId);
    } else if (vimeoMobileFallbackUrl) {
      await player.loadVideo(vimeoMobileFallbackUrl);
    }
  }

  // Handle 360 videos
  if (await checkIf360Video(player)) {
    // Add custom mouse tracking to background videos so
    // we can still navigate the video even when all the controls
    // are hidden
    if (
      element.dataset.vimeoBackground === "true" &&
      element.dataset.vimeoBackgroundEnhanced === "true"
    ) {
      const _ = new VimeoCameraInputTracker(element, player);
    }

    // Set camera props for 360 video if they were passed
    if (element.dataset.vimeoStartingCameraProps) {
      player.on("playing", () => {
        player.setCameraProps(
          JSON.parse(element.dataset.vimeoStartingCameraProps || "")
        );
      });
    }
  }

  // If video is responsive, we need to add some styles to make sure it
  // is full width
  if (element.dataset.vimeoResponsive === "true") {
    const width = await player.getVideoWidth();
    const height = await player.getVideoHeight();

    // Add styles to make sure background videos are full width
    appendStyle(`
      /* ensure background videos are really full width */
      div.vimeo-video-root[data-vimeo-responsive="true"] > div {
        height: calc(${(height / width) * 100}vw);
        max-width: 100vw;
        padding: unset !important;
      }
    `);
  }

  // Add event emitters to the player
  addEventEmitters(player, element);

  // If autoplay or background play is enabled, we need to mute the video and play it
  if (
    element.dataset.vimeoAutoplay === "true" ||
    element.dataset.vimeoBackground === "true"
  ) {
    // add a loading image if provided
    addLoadingImage(player, element, true);

    // mute video
    await player.setVolume(0);

    // redundant reload of video seems to be required for mobile to autoplay
    const videoId = await player.getVideoId();
    await player.loadVideo(videoId);

    await player.play();
  } else {
    // add a loading image if provided
    addLoadingImage(player, element, false);
  }

  return player;
};

export default renderVideoPlayer;
