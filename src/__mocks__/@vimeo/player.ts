import { EventMap, Options, VimeoCameraProps } from "@vimeo/player";

// CONSTANTS

export const PLAYER_WIDTH = 1920;
export const PLAYER_HEIGHT = 1080;
export const PLAYER_X = 20;
export const PLAYER_Y = 40;

// EXPORTS

class Player {
  // Holds mock callbacks for each event type
  _callbacks: { [key: string]: jest.Mock } = {};
  _element: HTMLElement;
  _cameraProps: VimeoCameraProps;

  /**
   * Mocks the Vimeo player instance.
   * @param element - html element
   * @param __ - options
   */
  constructor(element: HTMLElement, __?: Options) {

    // Mock `getBoundingClientRect` to return the player's dimensions
    jest.spyOn(element, "getBoundingClientRect").mockReturnValue({
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      top: PLAYER_Y,
      left: PLAYER_X,
      right: PLAYER_WIDTH + PLAYER_X,
      bottom: PLAYER_HEIGHT + PLAYER_Y,
      x: PLAYER_X,
      y: PLAYER_Y,
      toJSON: () => ({}),
    });

    this._element = element;
    this._cameraProps = {
      yaw: 180,
      pitch: 0,
      roll: 0,
      fov: 0,
    };
  }

  /**
   * Simulates the given event type on the given Vimeo player instance
   * by calling the `on` callback for the given event type.
   *
   * This method does not exist on the `Player` type, so we use
   * `getOwnPropertyDescriptor` to get access to it.
   *
   * @param event - player event type to simulate
   */
  _simulate = (event: keyof EventMap): void => {
    this._callbacks[event]();
  };

  /**
   * Mocks the `on` method on the Vimeo player instance.
   */
  on = jest
    .fn()
    .mockImplementation(
      (eventType: keyof EventMap, callback: jest.Mock): void => {
        // Stores the callback for the given event type in the `_callbacks`
        this._callbacks[eventType] = callback;
      }
    );

  /**
   * Mocks the `getCameraProps` method on the Vimeo player instance.
   */
  getCameraProps = jest
    .fn()
    .mockImplementation(
      (): Promise<VimeoCameraProps> => Promise.resolve(this._cameraProps)
    );

  /**
   * Mocks the `loadVideo` method on the Vimeo player instance.
   */
  loadVideo = jest.fn();

  /**
   * Mocks the `setVolume` method on the Vimeo player instance.
   */
  setVolume = jest.fn();

  /**
   * Mocks the `getVideoId` method on the Vimeo player instance.
   */
  getVideoId = jest.fn().mockResolvedValue("12345");

  /**
   * Mocks the `play` method on the Vimeo player instance.
   */
  play = jest.fn();

  /**
   * Mocks the `getVideoWidth` method on the Vimeo player instance.
   */
  getVideoWidth = jest.fn().mockResolvedValue(PLAYER_WIDTH);

  /**
   * Mocks the `getVideoHeight` method on the Vimeo player instance.
   */
  getVideoHeight = jest.fn().mockResolvedValue(PLAYER_HEIGHT);

  /**
   * Mocks the `setCameraProps` method on the Vimeo player instance.
   */
  setCameraProps = jest
    .fn()
    .mockImplementation(
      (cameraProps: VimeoCameraProps): Promise<VimeoCameraProps> => {
        this._cameraProps = cameraProps;
        return Promise.resolve(this._cameraProps);
      }
    );
}

export default Player;
