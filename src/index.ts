import Player from "@vimeo/player";
import renderVideoPlayer from "./lib/render-video-player";
import { appendStyle } from "./lib/document-helpers";

// Add `vimeoPlayers` to the global window object
declare global {
  interface Window {
    vimeoPlayers: Player[];
  }
}

const styleCSS = `
/* ensures overlays for loading images and mouse tracking match size of video */
div.vimeo-video-root {
  position: relative;
}

/* change cursor for grab state */
div.vimeo-video-root > div.vimeo-video-root__event-overlay {
  cursor: grab;
}

div.vimeo-video-root > div.vimeo-video-root__event-overlay.dragging {
  cursor: grabbing;
}

/* fade out loading image if one was provided when video starts playing or is loaded */
div.vimeo-video-root.vimeo-video-root--loaded::after {
  animation: vimeo-video-root__loading-animation 0.5s ease-in-out forwards;
}

@keyframes vimeo-video-root__loading-animation {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    visibility: hidden;
  }
}
`

/**
 * Loads the Vimeo player API and sets up all Vimeo video root elements on the page.
 */
const load = async (): Promise<void> => {
  // Add styles to the page for the Vimeo video root elements
  appendStyle(styleCSS);

  // Find all Vimeo video root elements on the page
  const videoRoots = [
    ...document.querySelectorAll<HTMLElement>("div.vimeo-video-root"),
  ];

  // Render a Vimeo player in each element and store the players in a global variable
  // `window.vimeoPlayers` can be used to further control the players using external code
  const players = await Promise.all(videoRoots.map(renderVideoPlayer));
  window.vimeoPlayers = players;
};

window.onload = load;

export { load, styleCSS }