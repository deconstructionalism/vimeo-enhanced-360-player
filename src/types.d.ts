import Player from "@vimeo/player";
import VimeoCameraInputTracker from "./lib/vimeo-camera-input-tracker";

/**
 * Extended Vimeo player with custom camera input tracker.
 */
export interface ExtendedPlayer extends Player {
  /**
   * Camera input tracker for the player. Only defined if running in background
   * enhanced mode.
   */
  _tracker?: VimeoCameraInputTracker
}

// Add `vimeoPlayers` to the global window object
declare global {
  interface Window {
    vimeoPlayers: ExtendedPlayer[];
  }
}