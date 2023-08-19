import { PLAYER_HEIGHT } from "../__mocks__/@vimeo/player";
import {
  SimulatedEvent,
  SimulatedEventLogic,
  generateSetCameraPropsRunLogic,
  runEvents,
  setupPlayerAndTracker,
} from "../test-utils/enhanced-player-utils";
import {
  KEY_PRESS_INCREMENT,
  PITCH_RANGE,
  YAW_RANGE,
} from "./vimeo-camera-input-tracker";

// TESTS

describe("VimeoCameraInputTracker", () => {
  it("adds event overlay to element", async () => {
    const { player } = await setupPlayerAndTracker();

    // Check that overlay was added
    const overlayElements = document.querySelectorAll<HTMLElement>(
      ".vimeo-video-root__event-overlay"
    );

    expect(overlayElements).toBeDefined();
    expect(overlayElements.length).toBe(1);

    // Check that input tracker was defined and find overlay that way
    expect(player._tracker).toBeDefined();
    const tracker = player._tracker!;
    const eventOverlay = tracker.eventOverlay;

    expect(eventOverlay).toEqual(overlayElements[0]);

    // Check styles on overlay
    const overlayElement = overlayElements[0];

    expect(overlayElement.style.position).toBe("absolute");
    expect(overlayElement.style.top).toBe("0px");
    expect(overlayElement.style.left).toBe("0px");
    expect(overlayElement.style.outline).toBe("none");
    expect(overlayElement.style.width).toBe("100%");
    expect(overlayElement.style.zIndex).toBe("200");
    expect(overlayElement.tabIndex).toBe(0);
  });

  it("throttles mousemove events on event overlay differentially based on browser", async () => {
    // Set up events
    const events: SimulatedEvent[] = [
      { type: "mousedown", clientX: 0, clientY: 0 },
      { type: "mousemove", clientX: 1, clientY: 1 },
      { type: "gap", time: 10 },
      { type: "mousemove", clientX: 2, clientY: 2 },
      { type: "gap", time: 10 },
      { type: "mousemove", clientX: 3, clientY: 3 },
      { type: "gap", time: 10 },
      { type: "mousemove", clientX: 4, clientY: 4 },
      { type: "gap", time: 10 },
      { type: "mousemove", clientX: 5, clientY: 5 },
      { type: "gap", time: 10 },
      { type: "mousemove", clientX: 6, clientY: 6 },
    ];

    /**
     * FIREFOX TESTS
     */

    // Mock `userAgent` to be Firefox
    const userAgentSpy = jest
      .spyOn(navigator, "userAgent", "get")
      .mockReturnValue("Firefox");

    // Run events
    const ffRunContext = await runEvents(events);

    expect(ffRunContext.moveCameraSpy).toHaveBeenCalledTimes(6);
    expect(ffRunContext.setCameraPropsSpy).toHaveBeenCalledTimes(2);

    /**
     * CHROME (NOT FIREFOX) TESTS
     */

    // Mock `userAgent` to be Chrome
    userAgentSpy.mockReturnValue("Chrome");

    // Run events
    const cRunContext = await runEvents(events);

    expect(cRunContext.moveCameraSpy).toHaveBeenCalledTimes(6);
    expect(cRunContext.setCameraPropsSpy).toHaveBeenCalledTimes(6);
  });

  it("adds mouse up and mouse down listeners to the overlay", async () => {
    /**
     * Generates a `run` callback for simulated 'logic' event that checks
     * whether the event overlay has the `dragging` class.
     *
     * @param expectedToHaveClass - Whether the event overlay is expected to
     *                              have the `dragging` class
     */
    const generateHasDraggingClassLogic =
      (expectedToHaveClass: boolean): SimulatedEventLogic["run"] =>
      ({ tracker }) => {
        const eventOverlay = tracker.eventOverlay;
        const hasClass = eventOverlay.classList.contains("dragging");

        expect(hasClass).toBe(expectedToHaveClass);
      };

    // Set up events
    const events: SimulatedEvent[] = [
      {
        description: "no dragging class expected before mousedown",
        type: "logic",
        run: generateHasDraggingClassLogic(false),
      },
      { type: "mousedown", clientX: 0, clientY: 0 },
      {
        description: "dragging class expected after mousedown",
        type: "logic",
        run: generateHasDraggingClassLogic(true),
      },
      { type: "mouseup" },
      {
        description: "no dragging class expected after mouseup",
        type: "logic",
        run: generateHasDraggingClassLogic(false),
      },
    ];

    // Run events
    await runEvents(events);
  });

  const mouseDragTestCases = [
    // no movement
    { xDelta: 0, yDelta: 0 },
    // rightward movement
    { xDelta: 20, yDelta: 0 },
    // leftward movement
    { xDelta: -20, yDelta: 0 },
    // upward movement
    { xDelta: 0, yDelta: -20 },
    // downward movement
    { xDelta: 0, yDelta: 20 },
    // rightward and downward movement
    { xDelta: 20, yDelta: 20 },
    // leftward and downward movement
    { xDelta: -20, yDelta: 20 },
    // rightward and upward movement
    { xDelta: 20, yDelta: -20 },
    // leftward and upward movement
    { xDelta: -20, yDelta: -20 },
  ];

  test.each(mouseDragTestCases)(
    "moves Vimeo player camera appropriately with mouse movement: %p",
    async ({ xDelta, yDelta }) => {
      // Set up events
      const events: SimulatedEvent[] = [
        { type: "mousedown", clientX: 0, clientY: 0 },
        { type: "mousemove", clientX: 0 + xDelta, clientY: 0 + yDelta },
      ];

      // Run events
      const { moveCameraSpy, setCameraPropsSpy, eventHistory } =
        await runEvents(events);

      // Get camera props before and after mouse movement
      const prevCameraProps = eventHistory[eventHistory.length - 2].cameraProps;
      const currCameraProps = eventHistory[eventHistory.length - 1].cameraProps;

      expect(moveCameraSpy).toHaveBeenCalledTimes(1);
      expect(setCameraPropsSpy).toHaveBeenCalledTimes(1);

      expect(currCameraProps.fov === prevCameraProps.fov).toBe(true);
      expect(currCameraProps.roll === prevCameraProps.roll).toBe(true);

      if (xDelta > 0) {
        expect(currCameraProps.yaw).toBeGreaterThan(prevCameraProps.yaw);
      } else if (xDelta < 0) {
        expect(currCameraProps.yaw).toBeLessThan(prevCameraProps.yaw);
      } else {
        expect(currCameraProps.yaw === prevCameraProps.yaw).toBe(true);
      }

      if (yDelta > 0) {
        expect(currCameraProps.pitch).toBeGreaterThan(prevCameraProps.pitch);
      } else if (yDelta < 0) {
        expect(currCameraProps.pitch).toBeLessThan(prevCameraProps.pitch);
      } else {
        expect(currCameraProps.pitch === prevCameraProps.pitch).toBe(true);
      }
    }
  );

  const keyPressRuns = [
    // Key codes that should not move the camera
    ...["Enter", "KeyA", "KeyZ", "Digit1", "Digit9"].map((key) => ({
      key,
      xDelta: 0,
      yDelta: 0,
      focus: true,
    })),

    // Key codes that would move the camera but won't due to lack
    // of element focus
    ...["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].map((key) => ({
      key,
      xDelta: 0,
      yDelta: 0,
      focus: false,
    })),

    // Key codes that should move the camera
    { key: "ArrowUp", xDelta: 0, yDelta: KEY_PRESS_INCREMENT, focus: true },
    {
      key: "ArrowDown",
      xDelta: 0,
      yDelta: -KEY_PRESS_INCREMENT,
      focus: true,
    },
    {
      key: "ArrowLeft",
      xDelta: -KEY_PRESS_INCREMENT,
      yDelta: 0,
      focus: true,
    },
    {
      key: "ArrowRight",
      xDelta: KEY_PRESS_INCREMENT,
      yDelta: 0,
      focus: true,
    },
  ];

  test.each(keyPressRuns)(
    "moves Vimeo player camera appropriately with keyboard press: %p",
    async ({ key, xDelta, yDelta, focus }) => {
      // Set up events
      const events: SimulatedEvent[] = [{ type: "keydown", key }];

      // Prepend focus event if indicated
      if (focus) {
        events.unshift({ type: "focus" });
      }

      // Run events
      const { moveCameraSpy, setCameraPropsSpy, eventHistory } =
        await runEvents(events);

      // Get camera props before and after keyboard press
      const prevCameraProps = eventHistory[eventHistory.length - 2].cameraProps;
      const currCameraProps = eventHistory[eventHistory.length - 1].cameraProps;

      if (xDelta === 0 && yDelta === 0) {
        expect(moveCameraSpy).not.toHaveBeenCalled();
        expect(setCameraPropsSpy).not.toHaveBeenCalled();
      } else {
        expect(moveCameraSpy).toHaveBeenCalledTimes(1);
        expect(setCameraPropsSpy).toHaveBeenCalledTimes(1);
      }

      expect(currCameraProps.fov === prevCameraProps.fov).toBe(true);
      expect(currCameraProps.roll === prevCameraProps.roll).toBe(true);
      expect(currCameraProps.yaw).toBe(prevCameraProps.yaw + xDelta);
      expect(currCameraProps.pitch).toBe(prevCameraProps.pitch + yDelta);
    }
  );

  it("does not move player camera beyond vertical range on drag", async () => {
    // Test logic after moving mouse past top of range
    const testMovePastTopOfRange: SimulatedEventLogic["run"] = ({
      eventHistory,
      moveCameraSpy,
      setCameraPropsSpy,
    }) => {
      // Get camera props before and after mouse movement
      const currCameraProps = eventHistory[eventHistory.length - 1].cameraProps;
      const prevCameraProps = eventHistory[eventHistory.length - 2].cameraProps;

      expect(moveCameraSpy).toHaveBeenCalledTimes(1);
      expect(setCameraPropsSpy).toHaveBeenCalledTimes(1);
      expect(currCameraProps.pitch).toBeGreaterThan(prevCameraProps.pitch);
      expect(currCameraProps.pitch).toBe(PITCH_RANGE.max);
      expect(currCameraProps.fov === prevCameraProps.fov).toBe(true);
      expect(currCameraProps.roll === prevCameraProps.roll).toBe(true);
      expect(currCameraProps.yaw === prevCameraProps.yaw).toBe(true);
    };

    // Test logic after moving mouse past bottom of range
    const testMovePastBottomOfRange: SimulatedEventLogic["run"] = ({
      eventHistory,
      moveCameraSpy,
      setCameraPropsSpy,
    }) => {
      // Get camera props before and after mouse movement
      const currCameraProps = eventHistory[eventHistory.length - 1].cameraProps;
      const prevCameraProps = eventHistory[eventHistory.length - 2].cameraProps;

      expect(moveCameraSpy).toHaveBeenCalledTimes(2);
      expect(setCameraPropsSpy).toHaveBeenCalledTimes(2);
      expect(currCameraProps.pitch).toBeLessThan(prevCameraProps.pitch);
      expect(currCameraProps.pitch).toBe(PITCH_RANGE.min);
      expect(currCameraProps.fov === prevCameraProps.fov).toBe(true);
      expect(currCameraProps.roll === prevCameraProps.roll).toBe(true);
      expect(currCameraProps.yaw === prevCameraProps.yaw).toBe(true);
    };

    // Set up events
    const events: SimulatedEvent[] = [
      { type: "mousedown", clientX: 0, clientY: 0 },
      {
        type: "mousemove",
        clientX: 0,
        clientY: 2 * PLAYER_HEIGHT,
      },
      {
        description:
          "camera should not move past top of allowable range on mouse move",
        type: "logic",
        run: testMovePastTopOfRange,
      },
      {
        type: "mousemove",
        clientX: 0,
        clientY: 2 * -PLAYER_HEIGHT,
      },
      {
        description:
          "camera should not move past bottom of allowable range on mouse move",
        type: "logic",
        run: testMovePastBottomOfRange,
      },
    ];

    // Run events
    await runEvents(events);
  });

  it("does not move player camera beyond vertical range on key press", async () => {
    // Test logic after moving past bottom of range with keypress
    const testMovePastBottomOfRange: SimulatedEventLogic["run"] = ({
      eventHistory,
      moveCameraSpy,
      setCameraPropsSpy,
    }) => {
      // Get camera props before and after mouse movement
      const currCameraProps = eventHistory[eventHistory.length - 1].cameraProps;
      const prevCameraProps = eventHistory[eventHistory.length - 2].cameraProps;

      expect(moveCameraSpy).toHaveBeenCalledTimes(2);
      expect(setCameraPropsSpy).toHaveBeenCalledTimes(2);
      expect(currCameraProps.pitch).toBeLessThan(prevCameraProps.pitch);
      expect(currCameraProps.pitch).toBe(PITCH_RANGE.min);
      expect(currCameraProps.fov === prevCameraProps.fov).toBe(true);
      expect(currCameraProps.roll === prevCameraProps.roll).toBe(true);
      expect(currCameraProps.yaw === prevCameraProps.yaw).toBe(true);
    };

    // Test logic after moving past top of range with keypress
    const testMovePastTopOfRange: SimulatedEventLogic["run"] = ({
      eventHistory,
      moveCameraSpy,
      setCameraPropsSpy,
    }) => {
      // Get camera props before and after mouse movement
      const currCameraProps = eventHistory[eventHistory.length - 1].cameraProps;
      const prevCameraProps = eventHistory[eventHistory.length - 2].cameraProps;

      expect(moveCameraSpy).toHaveBeenCalledTimes(4);
      expect(setCameraPropsSpy).toHaveBeenCalledTimes(4);
      expect(currCameraProps.pitch).toBeGreaterThan(prevCameraProps.pitch);
      expect(currCameraProps.pitch).toBe(PITCH_RANGE.max);
      expect(currCameraProps.fov === prevCameraProps.fov).toBe(true);
      expect(currCameraProps.roll === prevCameraProps.roll).toBe(true);
      expect(currCameraProps.yaw === prevCameraProps.yaw).toBe(true);
    };

    // Set up events
    const events: SimulatedEvent[] = [
      {
        description:
          "set camera pitch to less than one key press from pitch min",
        type: "logic",
        run: generateSetCameraPropsRunLogic({
          pitch: PITCH_RANGE.min + KEY_PRESS_INCREMENT / 2,
        }),
      },
      { type: "focus" },
      { type: "keydown", key: "ArrowDown" },
      {
        description: "camera should not move past bottom of range on key press",
        type: "logic",
        run: testMovePastBottomOfRange,
      },
      {
        description:
          "set camera pitch to less than one key press from pitch max",
        type: "logic",
        run: generateSetCameraPropsRunLogic({
          pitch: PITCH_RANGE.max - KEY_PRESS_INCREMENT / 2,
        }),
      },
      { type: "keydown", key: "ArrowUp" },
      {
        description: "camera should not move past top of range on key press",
        type: "logic",
        run: testMovePastTopOfRange,
      },
    ];

    // Run events
    await runEvents(events);
  });

  it("moves through boundaries of circular range on drag", async () => {
    // Test logic after moving through yaw max
    const testMoveThroughYawMax: SimulatedEventLogic["run"] = ({
      eventHistory,
      moveCameraSpy,
      setCameraPropsSpy,
    }) => {
      // Get camera props before and after mouse movement
      const currCameraProps = eventHistory[eventHistory.length - 1].cameraProps;
      const prevCameraProps = eventHistory[eventHistory.length - 2].cameraProps;

      expect(moveCameraSpy).toHaveBeenCalledTimes(2);
      expect(setCameraPropsSpy).toHaveBeenCalledTimes(2);
      expect(currCameraProps.yaw).toBeLessThan(prevCameraProps.yaw);
      expect(prevCameraProps.yaw).toBe(YAW_RANGE.max - 1);
      expect(currCameraProps.yaw).toBeCloseTo(YAW_RANGE.min, -1);
      expect(currCameraProps.fov === prevCameraProps.fov).toBe(true);
      expect(currCameraProps.roll === prevCameraProps.roll).toBe(true);
      expect(currCameraProps.pitch === prevCameraProps.pitch).toBe(true);
    };

    // Test logic after moving through yaw min
    const testMoveThroughYawMin: SimulatedEventLogic["run"] = ({
      eventHistory,
      moveCameraSpy,
      setCameraPropsSpy,
    }) => {
      // Get camera props before and after mouse movement
      const currCameraProps = eventHistory[eventHistory.length - 1].cameraProps;
      const prevCameraProps = eventHistory[eventHistory.length - 2].cameraProps;

      expect(moveCameraSpy).toHaveBeenCalledTimes(4);
      expect(setCameraPropsSpy).toHaveBeenCalledTimes(4);
      expect(currCameraProps.yaw).toBeGreaterThan(prevCameraProps.yaw);
      expect(prevCameraProps.yaw).toBe(YAW_RANGE.min + 1);
      expect(currCameraProps.yaw).toBeCloseTo(YAW_RANGE.max, -1);
      expect(currCameraProps.fov === prevCameraProps.fov).toBe(true);
      expect(currCameraProps.roll === prevCameraProps.roll).toBe(true);
      expect(currCameraProps.pitch === prevCameraProps.pitch).toBe(true);
    };

    // Set up events
    const events: SimulatedEvent[] = [
      {
        description: "set camera yaw right before yaw max",
        type: "logic",
        run: generateSetCameraPropsRunLogic({ yaw: YAW_RANGE.max - 1 }),
      },
      { type: "mousedown", clientX: 0, clientY: 0 },
      { type: "mousemove", clientX: 5, clientY: 0 },
      {
        description: "camera should move through yaw max to min on drag",
        type: "logic",
        run: testMoveThroughYawMax,
      },
      {
        description: "set camera yaw right before yaw min",
        type: "logic",
        run: generateSetCameraPropsRunLogic({ yaw: YAW_RANGE.min + 1 }),
      },
      { type: "mousemove", clientX: -5, clientY: 0 },
      {
        description: "camera should move through yaw min to max on drag",
        type: "logic",
        run: testMoveThroughYawMin,
      },
    ];

    // Run events
    await runEvents(events);
  });
});
