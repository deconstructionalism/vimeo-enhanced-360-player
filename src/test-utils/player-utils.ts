import Player from "@vimeo/player";

import renderVideoPlayer from "../lib/render-video-player";
import { ExtendedPlayer } from "../types";

// EXPORTS

/**
 * Create a vimeo player and element with the given dataset.
 *
 * @param dataset - The dataset to use for the element
 * @param useRenderVideoPlayer - Whether or not to use `renderVideoPlayer` or
 *                               just call the constructor to create the player
 * @returns a player and the element it was created with
 */
const createPlayerAndElement = async (
  dataset: { [key: string]: string } = {},
  useRenderVideoPlayer: boolean = false
): Promise<{ player: ExtendedPlayer; element: HTMLElement }> => {
  // Create element and populate dataset
  const element = document.createElement("div");
  Object.entries(dataset).forEach(([key, value]) => {
    element.dataset[key] = value;
  });
  document.body.appendChild(element);

  // Create player using `renderVideoPlayer` or constructor
  const player = useRenderVideoPlayer
    ? await renderVideoPlayer(element)
    : new Player(element);

  return { player, element };
};

/**
 * Simulates the given event type on the given Vimeo player instance.
 *
 * @param player - Vimeo player instance to simulate event on
 * @param eventType - event type to simulate
 */
const simulatePlayerEvent = (
  player: ExtendedPlayer,
  eventType: string
): void => {
  // use `getOwnPropertyDescriptor` to get access to private `_simulate` methods
  // that are otherwise not part of `Player` type
  Object.getOwnPropertyDescriptor(player, "_simulate")?.value(eventType);
};

export { createPlayerAndElement, simulatePlayerEvent };
