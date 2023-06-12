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
window.onload = () => {

  // Add styles to ensure responsive videos are actually full width
  const styles = `
    /* ensure responsive videos are really full width */
    div.vimeo-video-root[data-responsive="true"] > div {
      padding: 50% 0 0 0!important;
    }

    /* change cursor for grab state */
    div.vimeo-video-root > div.vimeo-video-root__event-overlay {
      cursor: grab;
    }

    div.vimeo-video-root > div.vimeo-video-root__event-overlay.dragging {
      cursor: grabbing;
    }
  `;
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);

  // Find all Vimeo video root elements on the page
  const videoRoots = [...document.querySelectorAll<HTMLElement>("div.vimeo-video-root")];

  // Render a Vimeo player in each element and store the players in a global variable
  // `window.vimeoPlayers` can be used to further control the players using external code
  const players = videoRoots.map(renderVideoPlayer);
  window.vimeoPlayers = players;
};
