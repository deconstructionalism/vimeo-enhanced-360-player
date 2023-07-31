import { EventMap, Options, VimeoCameraProps } from "@vimeo/player";

class Player {
  // Holds mock callbacks for each event type
  _callbacks: { [key: string]: jest.Mock } = {};
  _element: HTMLElement;

  /**
   * Mocks the Vimeo player instance.
   * @param element - html element
   * @param __ - options
   */
  constructor(element: HTMLElement, __?: Options) {
    this._element = element;
  }

  /**
   * Simulates the given event type on the given Vimeo player instance
   * by calling the `on` callback for the given event type.
   *
   * @param event - player event type to simulate
   */
  _simulate = (event: keyof EventMap): void => {
    this._callbacks[event]();
  };

  /**
   * Overrides the `on` method on the Vimeo player instance
   * to store the callback for the given event type.
   *
   * @param eventType - event to listen for
   * @param callback - callback to call when event is triggered
   */
  on = jest
    .fn()
    .mockImplementation(
      (eventType: keyof EventMap, callback: jest.Mock): void => {
        this._callbacks[eventType] = callback;
      }
    );

  /**
   * Overrides the `getCameraProps` method on the Vimeo player instance
   * with generic values that indicate the video is a 360 video.
   *
   * @returns camera props for the current video
   */
  getCameraProps = jest.fn().mockImplementation(
    (): VimeoCameraProps => ({
      yaw: 0,
      pitch: 0,
      roll: 0,
      fov: 0,
    })
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
  getVideoId = jest.fn().mockReturnValue("12345");

  /**
   * Mocks the `getVideoTitle` method on the Vimeo player instance.
   */
  play = jest.fn();

  /**
   * Mocks the `getVideoTitle` method on the Vimeo player instance.
   */
  getVideoWidth = jest.fn().mockReturnValue(1920);

  /**
   * Mocks the `getVideoTitle` method on the Vimeo player instance.
   */
  getVideoHeight = jest.fn().mockReturnValue(1080);
}

export default Player;
