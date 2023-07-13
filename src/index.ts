import Player from "@vimeo/player";
import { renderVideoPlayer } from "./lib/vimeo-video-player";

// Add `vimeoPlayers` to the global window object
declare global {
  interface Window {
    vimeoPlayers: Player[];
  }
}

/**
 * Loads the Vimeo player API and sets up all Vimeo video root elements on the page.
 */
window.onload = async () => {

  // Add styles to ensure responsive videos are actually full width
  const styles = `
    /* ensures overlays for loading images and mouse tracking match size of video */
    div.vimeo-video-root {
      position: relative;
    }

    /* ensure responsive videos are really full width */
    div.vimeo-video-root[data-vimeo-responsive="true"] > div {
      padding: 50% 0 0 0!important;
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
        display: block;
      }
      100% {
        opacity: 0;
        display: none;
      }
    }
  `;
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);

  // Find all Vimeo video root elements on the page
  const videoRoots = [...document.querySelectorAll<HTMLElement>("div.vimeo-video-root")];

  // Render a Vimeo player in each element and store the players in a global variable
  // `window.vimeoPlayers` can be used to further control the players using external code
  const players = await Promise.all(videoRoots.map(renderVideoPlayer));
  window.vimeoPlayers = players;
};
