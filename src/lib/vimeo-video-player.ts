import Player from "@vimeo/player";
import { VimeoCameraInputTracker } from "./vimeo-camera-input-tracker";

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
 * Checks if the current browser is a mobile browser.
 *
 * @returns whether or not the current browser is a mobile browser
 */
const checkIfMobileBrowser = (): boolean => {
  return /iPhone|iPad|iPod|Android|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
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

  // If autoplay on background play is enabled, we need to mute the video and play it
  if (
    element.dataset.vimeoAutoplay === "true" ||
    element.dataset.vimeoBackground === "true"
  ) {
    // Add `vimeo-video-root--loaded` class to element when video plays
    player.on("play", () => {
      element.classList.add("vimeo-video-root--loaded");
    });

    await player.setVolume(0);
    await player.play();
  } else {
    // Add `vimeo-video-root--loaded` class to element when video is loaded
    player.on("loaded", () => {
      element.classList.add("vimeo-video-root--loaded");
    });
  }

  // Handle 360 videos
  if (await checkIf360Video(player)) {
    // On mobile devices, 360 videos are not supported and we should attempt
    // to load a fallback video
    if (checkIfMobileBrowser()) {
      const { vimeoMobileFallbackId, vimeoMobileFallbackUrl } = element.dataset;

      if (vimeoMobileFallbackId) {
        await player.loadVideo(vimeoMobileFallbackId);
      } else if (vimeoMobileFallbackUrl) {
        await player.loadVideo(vimeoMobileFallbackUrl);
      }
      return player;

      // On desktop devices, we should add custom mouse tracking
      // to baclground videos so we can still navigate the video
      // even when all the controls are hidden
    } else if (
      element.dataset.vimeoBackground === "true" &&
      element.dataset.vimeoBackgroundEnhanced === "true"
    ) {
      const _ = new VimeoCameraInputTracker(element, player);
    }
  }

  return player;
};

export { renderVideoPlayer };
