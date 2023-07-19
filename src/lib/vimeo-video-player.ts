import Player from "@vimeo/player";
import { VimeoCameraInputTracker } from "./vimeo-camera-input-tracker";
import { appendStyle, checkIfMobileBrowser } from "./document-helpers";

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
 * image that shows before video is loaded.
 *
 * @param element - element to add background image to
 */
const addLoadingImage = (element: HTMLElement): void => {
  // If element does not have `vimeoLoadingImageUrl` data attribute, do nothing
  if (element.dataset.vimeoLoadingImageUrl === undefined) {
    return;
  }

  const id = `vimeo-video-root-${crypto.randomUUID()}`;
  element.id = id;

  const styles = `
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
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
};

/**
 * Handles the `loaded` and `play` events for a Vimeo player by adding
 * a class to the element and body.
 *
 * @param player - Vimeo player to track
 * @param element - element containing the Vimeo player
 * @param index - index of the element in the list of vimeo player element
 *                       to render.
 */
const handleVideoLoadOrPlay = (
  player: Player,
  element: HTMLElement,
  index: number
): void => {
  /**
   * Handles the `loaded` and `play` events for a Vimeo player by adding
   * a class to the element and body.
   * @param type - type of event to handle
   */
  const handler = (type: "loaded" | "playing"): void => {
    element.classList.add(`vimeo-video-root--${type}`);
    document.body.classList.add(
      `vimeo-enhanced-360-player--${type}-player-${index}`
    );
  };

  // Add event listeners to the player
  player.on("play", handler.bind(null, "playing"));
  player.on("loaded", handler.bind(null, "loaded"));
};

/**
 * Renders a Vimeo player in the given element using options passed as data attributes.
 *
 * @param element - element to render the Vimeo player in
 * @param index - index of the element in the list of elements to render
 *
 * @returns player instance
 */
const renderVideoPlayer = async (
  element: HTMLElement,
  index: number
): Promise<Player> => {
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
      await player.setCameraProps(
        JSON.parse(element.dataset.vimeoStartingCameraProps || "")
      );
    }
  }

  handleVideoLoadOrPlay(player, element, index);

  // If autoplay on background play is enabled, we need to mute the video and play it
  if (
    element.dataset.vimeoAutoplay === "true" ||
    element.dataset.vimeoBackground === "true"
  ) {
    const width = await player.getVideoWidth();
    const height = await player.getVideoHeight();

    // Add styles to make sure background videos are full width and height
    appendStyle(`
      /* ensure background videos are really full width */
      div.vimeo-video-root[data-vimeo-responsive="true"] > div {
        height: calc(${(height / width) * 100}vw);
        max-width: calc(${(width / height) * 100}vh);
        padding: unset !important;
      }
    `);

    // add a loading image if provided, must happen after the above styles
    // are added to avoid ugly resizing of loading graphic
    addLoadingImage(element);

    await player.setVolume(0);

    // redundant reload of video seems to be required for mobile to autoplay
    const videoId = await player.getVideoId();
    await player.loadVideo(videoId);

    await player.play();
  } else {
    // add a loading image if provided
    addLoadingImage(element);
  }

  return player;
};

export { renderVideoPlayer };
