import Player from "@vimeo/player";
import throttle from "./throttle";
import { generateRangeTransform, MinMaxRange } from "./range-operations";

// CONSTANTS

const YAW_RANGE = new MinMaxRange(0, 360, true, 180);
const PITCH_RANGE = new MinMaxRange(-90, 90, false, 0);
const KEY_PRESS_INCREMENT = 5;

class VimeoCameraInputTracker {
  element: HTMLElement;
  player: Player;
  eventOverlay: HTMLElement;
  moveCamera: (yawDelta: number, pitchDelta: number) => Promise<void> | void;
  dragData: { xRange: MinMaxRange; yRange: MinMaxRange };

  /**
   * Tracks click and drag mouse movement or arrow key press and moves the camera of the given
   * Vimeo player accordingly.
   *
   * Meant to accommodate videos with `data-background` set to `true`
   * so that the play/pause button is hidden, but which normally do not allow for movement
   * of the camera using the vimeo player SDK.
   *
   * @param element - element Vimeo player is rendered in
   * @param player - Vimeo player rendered in element
   */
  constructor(element: HTMLElement, player: Player) {
    this.element = element;
    this.player = player;
    this.eventOverlay = this.addEventOverlay();
    this.dragData = {
      xRange: new MinMaxRange(0, 1),
      yRange: new MinMaxRange(0, 1),
    };

    // Set moveCamera to a throttled version of _moveCamera, with higher latency if
    // browser is firefox since firefox is very laggy in handling mousemove events
    this.moveCamera = /Firefox/i.test(navigator.userAgent)
      ? throttle(this._moveCamera, 50)
      : this._moveCamera;
  }

  /**
   * Moves the camera of the Vimeo player to new position.
   *
   * @param yaw - camera yaw to set
   * @param pitchDelta - camera pitch to set
   */
  _moveCamera = async (yaw: number, pitch: number): Promise<void> => {
    const cameraProps = await this.player.getCameraProps();

    YAW_RANGE.current = yaw;
    PITCH_RANGE.current = pitch;

    await this.player.setCameraProps({
      ...cameraProps,
      yaw: YAW_RANGE.current,
      pitch: PITCH_RANGE.current,
    });
  };

  /**
   * Since the Vimeo player iframe does not emit mousemove events, we need to add an overlay
   * to the element and listen for mousemove events on the overlay.
   *
   * @returns {HTMLElement} - event overlay element
   */
  addEventOverlay = (): HTMLElement => {
    // Create an overlay element that covers the entire video
    const eventOverlay = document.createElement("div");
    eventOverlay.style.position = "absolute";
    eventOverlay.style.top = "0";
    eventOverlay.style.left = "0";
    eventOverlay.style.outline = "none";
    eventOverlay.style.width = "100%";
    eventOverlay.style.zIndex = "200";
    eventOverlay.classList.add("vimeo-video-root__event-overlay");
    eventOverlay.tabIndex = 0;
    this.element.appendChild(eventOverlay);

    // Add event listeners to the overlay
    eventOverlay.addEventListener("mousedown", this.handleMouseDown);
    eventOverlay.addEventListener("mouseup", this.handleMouseUp);
    window.addEventListener("keydown", this.handleKeyDown);

    return eventOverlay;
  };

  /**
   * Store origin and max x and y range information for mouse position
   * when mouse drag starts.
   *
   * @param xStart - starting x position of mouse drag
   * @param yStart - starting y position of mouse drag
   */
  storeDragData = (xStart: number, yStart: number): void => {
    const { width, height } = this.element.getBoundingClientRect();

    this.dragData = {
      xRange: new MinMaxRange(
        xStart - width * 0.25,
        xStart + width * 0.25,
        false,
        width
      ),
      yRange: new MinMaxRange(
        yStart - height * 0.25,
        yStart + height * 0.25,
        false,
        height
      ),
    };
  };

  /**
   * Handles mousedown events on the event overlay.
   *
   * @param event - mousedown event
   */
  handleMouseDown = (event: MouseEvent): void => {
    // Add dragging class to the overlay
    this.eventOverlay.classList.add("dragging");

    // Store the starting position of the mouse and drag range
    this.storeDragData(event.clientX, event.clientY);

    // Add event listeners to the overlay
    this.eventOverlay.addEventListener("mousemove", this.handleMouseMove);
  };

  /**
   * Handles mousemove events on the event overlay.
   *
   * @param event - mousemove event
   */
  handleMouseMove = (event: MouseEvent): void => {
    event.preventDefault();

    const { xRange, yRange } = this.dragData;

    xRange.current = event.clientX;
    yRange.current = event.clientY;

    const xTransform = generateRangeTransform(xRange, YAW_RANGE);
    const yTransform = generateRangeTransform(yRange, PITCH_RANGE);

    const nextYaw = xTransform(xRange.current);
    const nextPitch = yTransform(yRange.current);

    this.moveCamera(nextYaw, -nextPitch);
  };

  /**
   * Handles mouseup events on the event overlay.
   */
  handleMouseUp = (): void => {
    // remove dragging class from the overlay
    this.eventOverlay.classList.remove("dragging");

    // Remove event listeners from the overlay
    this.eventOverlay.removeEventListener("mousemove", this.handleMouseMove);
  };

  /**
   * Handles arrow key presses if video is focused.
   *
   * @param event - keydown event
   */
  handleKeyDown = (event: KeyboardEvent): void => {
    // If the event overlay is not focused or arrow keys are not pressed, do nothing
    if (
      !(document.activeElement === this.eventOverlay) ||
      !["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown"].includes(event.key)
    ) {
      return;
    }

    event.preventDefault();

    // Move the camera based on the arrow key pressed
    switch (event.key) {
      case "ArrowRight":
        this.moveCamera(
          YAW_RANGE.current + KEY_PRESS_INCREMENT,
          PITCH_RANGE.current
        );
        break;
      case "ArrowLeft":
        this.moveCamera(
          YAW_RANGE.current - KEY_PRESS_INCREMENT,
          PITCH_RANGE.current
        );
        break;
      case "ArrowUp":
        this.moveCamera(
          YAW_RANGE.current,
          PITCH_RANGE.current + KEY_PRESS_INCREMENT
        );
        break;
      case "ArrowDown":
        this.moveCamera(
          YAW_RANGE.current,
          PITCH_RANGE.current - KEY_PRESS_INCREMENT
        );
        break;
    }
  };
}

export default VimeoCameraInputTracker;
