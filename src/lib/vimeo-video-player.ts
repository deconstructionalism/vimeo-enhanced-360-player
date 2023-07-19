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
 * @param imgUrl - url where loading image is located
 */
const addLoadingImage = (element: HTMLElement, imgUrl: string): void => {
  const id = `vimeo-video-root-${crypto.randomUUID()}`;
  element.id = id;

  const styles = `
    /* add loading image */
    div.vimeo-video-root#${element.id}::after {
      background-image: url(${imgUrl});
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
 * Renders a Vimeo player in the given element using options passed as data attributes.
 *
 * @param element - element to render the Vimeo player in
 *
 * @returns player instance
 */
const renderVideoPlayer = async (element: HTMLElement): Promise<Player> => {
  // If `vimeoLoadingImageUrl` data attribute is present, add a loading image
  if (element.dataset.vimeoLoadingImageUrl) {
    addLoadingImage(element, element.dataset.vimeoLoadingImageUrl);
  }

  // Create a new Vimeo player instance
  const player = new Player(element);

  // On mobile devices, we should attempt to load a fallback video if provided
  if (checkIfMobileBrowser()) {
    const { vimeoMobileFallbackId, vimeoMobileFallbackUrl } = element.dataset;

    if (vimeoMobileFallbackId) {
      await player.loadVideo(vimeoMobileFallbackId);
      console.log('loaded id')
    } else if (vimeoMobileFallbackUrl) {
      await player.loadVideo(vimeoMobileFallbackUrl);
      console.log('loaded url')
    }
  }

  // Handle 360 videos
  if (await checkIf360Video(player)) {
    console.log('is 360')
    // Add custom mouse tracking to background videos so
    // we can still navigate the video even when all the controls
    // are hidden
    if (
      element.dataset.vimeoBackground === "true" &&
      element.dataset.vimeoBackgroundEnhanced === "true"
    ) {
      console.log('tracking')
      const _ = new VimeoCameraInputTracker(element, player);
    }

    // Set camera props for 360 video if they were passed
    if (element.dataset.vimeoStartingCameraProps) {
      console.log('setting camera props')
      await player.setCameraProps(
        JSON.parse(element.dataset.vimeoStartingCameraProps || "")
      );
    }
  }

  // If autoplay on background play is enabled, we need to mute the video and play it
  if (
    element.dataset.vimeoAutoplay === "true" ||
    element.dataset.vimeoBackground === "true"
  ) {
    console.log('autoplay')
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

    // Add `vimeo-video-root--loaded` class to element when video plays
    player.on("play", () => {
      console.log('playing')
      element.classList.add("vimeo-video-root--loaded");
    });
    await player.setVolume(0);
    await player.play();
    console.log('play now')
  } else {
    console.log('not autoplay')
    // Add `vimeo-video-root--loaded` class to element when video is loaded
    player.on("loaded", () => {
      console.log('loaded')
      element.classList.add("vimeo-video-root--loaded");
    });
  }

  console.log('returning player')

  return player;
};

export { renderVideoPlayer };
