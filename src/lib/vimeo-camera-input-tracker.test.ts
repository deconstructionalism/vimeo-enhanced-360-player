import VimeoCameraInputTracker from "./vimeo-camera-input-tracker";

/**
 * VimeoCameraInputTracker
 *   - adds event overlay to element that is
 *     - same dimensions as element
 *     - same x y position as element
 *     - has listeners for mouse down, mouse up and key press events
 *   - throttles mousemove events on event overlay differentitally based on browser
 *     - Firefox
 *     - other browsers
 *   - on keypress events
 *     - only calls moveCamera if arrow key is pressed
 *     - on arrow key press
 *        - calls moveCamera with yawDelta and pitchDelta for each direction
 *   - on mousemove events
 *     - adds mouse move listener
 *     - stores drag data
 *     - adds dragging class to element
 *   - calls mousemove event handler with appropriate values for
 *     - horizontal mouse movement
 *     - vertical mouse movement
 *     - combined horizontal and vertical mouse movement
 *  - on mouseup events
 *    - removes mousemove listener
 *    - removes dragging class from element
 *  - camera movement
 *    - ensure it works properly
 */

describe("VimeoCameraInputTracker", () => {
  it("", () => {
    expect(true).toBe(true);
  });
});
