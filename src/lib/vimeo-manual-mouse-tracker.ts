import Player from "@vimeo/player";
import throttle from "./throttle";

class VimeoManualMouseTracker {
  // Starting state of the camera prior to mousedown
  static startingState = {
    startingX: 0,
    startingY: 0,
  };

  element: HTMLElement;
  player: Player;
  eventOverlay: HTMLElement;
  state: { startingX: number; startingY: number };
  moveCamera: (deltaX: number, deltaY: number) => void;

  /**
   * Tracks click and move mouse movement on the page and moves the camera of the given
   * Vimeo player accordingly.
   *
   * Meant to accommodate videos with `data-background` set to `true`
   * so that the play/pause button is hidden, but which normally do not allow for mouse movement
   * of the camera.
   *
   * @param element - element Vimeo player is rendered in
   * @param player - Vimeo player rendered in element
   */
  constructor(element: HTMLElement, player: Player) {
    this.element = element;
    this.player = player;
    this.eventOverlay = this._addEventOverlay();
    this.state = VimeoManualMouseTracker.startingState;

    // Set moveCamera to a throttled version of _moveCamera
    this.moveCamera = throttle(this._moveCamera, 50);
  }

  /**
   * Moves the camera of the Vimeo player from current position.
   *
   * @param deltaX - amount to move camera in the x direction
   * @param deltaY - amount to move camera in the y direction
   */
  _moveCamera = async (deltaX: number, deltaY: number) => {
    const cameraProps = await this.player.getCameraProps();

    await this.player.setCameraProps({
      ...cameraProps,
      yaw: deltaX,
      pitch: deltaY,
    });
  };

  /**
   * Since the Vimeo player iframe does not emit mousemove events, we need to add an overlay
   * to the element and listen for mousemove events on the overlay.
   *
   * @returns {HTMLElement} - event overlay element
   */
  _addEventOverlay = () => {
    // Create an overlay element that covers the entire video
    const eventOverlay = document.createElement("div");
    eventOverlay.style.position = "absolute";
    eventOverlay.style.top = "0";
    eventOverlay.style.left = "0";
    eventOverlay.style.width = "100%";
    eventOverlay.style.height = "100%";
    eventOverlay.style.zIndex = "200";
    eventOverlay.classList.add("vimeo-video-root__event-overlay");
    this.element.appendChild(eventOverlay);

    // Add event listeners to the overlay
    eventOverlay.addEventListener("mousedown", this._handleMouseDown);
    eventOverlay.addEventListener("mouseup", this._handleMouseUp);

    return eventOverlay;
  };

  /**
   * Handles mousedown events on the event overlay.
   *
   * @param event - mousedown event
   */
  _handleMouseDown = async (event: MouseEvent) => {
    // Add dragging class to the overlay
    this.eventOverlay.classList.add("dragging");

    // Add event listeners to the overlay
    this.eventOverlay.addEventListener("mousemove", this._handleMouseMove);

    // Store the starting position of the mouse
    const cameraProps = await this.player.getCameraProps();
    this.state = {
      startingX: event.clientX,
      startingY: event.clientY,
    };
  };

  _handleMouseMove = async (event: MouseEvent) => {
    const { width, height } = this.element.getBoundingClientRect();

    type Range = { min: number; max: number };

    const xPositionRange: Range = {
      min: this.state.startingX - width * 0.25,
      max: this.state.startingX + width * 0.25,
    };
    const yPositionRange: Range = {
      min: this.state.startingY - height * 0.25,
      max: this.state.startingY + height * 0.25,
    };
    const xRange: Range = { min: 0, max: 360 };
    const yRange: Range = { min: -90, max: 90 };

    const generateTransform = (
      positionRange: Range,
      range: Range
    ): ((value: number) => number) => {
      return (value: number) => {
        return (
          ((value - positionRange.min) /
            (positionRange.max - positionRange.min)) *
            (range.max - range.min) +
          range.min
        );
      };
    };

    const xTransform = generateTransform(xPositionRange, xRange);
    const yTransform = generateTransform(yPositionRange, yRange);

    const deltaX = xTransform(event.clientX);
    const deltaY = yTransform(event.clientY);

    const boundedDeltaX = Math.max(Math.min(deltaX, xRange.max), xRange.min);
    const boundedDeltaY = Math.max(Math.min(deltaY, yRange.max), yRange.min);

    this.moveCamera(boundedDeltaX, -boundedDeltaY);
  };

  /**
   * Handles mouseup events on the event overlay.
   *
   * @param {MouseEvent} event - mouseup event
   */
  _handleMouseUp = () => {
    // remove dragging class from the overlay
    this.eventOverlay.classList.remove("dragging");

    // Remove event listeners from the overlay
    this.eventOverlay.removeEventListener("mousemove", this._handleMouseMove);

    // Reset state
    this.state = VimeoManualMouseTracker.startingState;
  };
}

export { VimeoManualMouseTracker };
