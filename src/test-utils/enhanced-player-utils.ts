import { VimeoCameraProps } from "@vimeo/player";

import VimeoCameraInputTracker from "../lib/vimeo-camera-input-tracker";
import { ExtendedPlayer } from "../types";
import { createPlayerAndElement } from "./player-utils";

// TYPES

/**
 * Base type for simulated events that can be used to test the enhanced player.
 */
interface BaseSimulatedEvent {
  /**
   * Type of simulated event.
   */
  type: string;
  /**
   * Description of what simulated event should accomplish.
   */
  description?: string;
}

/**
 * A simulated mousedown event.
 */
interface SimulatedMouseDownEvent extends BaseSimulatedEvent {
  type: "mousedown";
  /**
   * X position of mouse.
   */
  clientX: number;
  /**
   * Y position of mouse.
   */
  clientY: number;
}

/**
 * A simulated mousemove event.
 */
interface SimulatedMouseMoveEvent extends BaseSimulatedEvent {
  type: "mousemove";
  /**
   * New x position of mouse.
   */
  clientX: number;
  /**
   * New y position of mouse.
   */
  clientY: number;
}

/**
 * A simulated mouseup event.
 */
interface SimulatedMouseUpEvent extends BaseSimulatedEvent {
  type: "mouseup";
}

/**
 * A simulated focus event on the event overlay.
 */
interface SimulatedFocusEvent extends BaseSimulatedEvent {
  type: "focus";
}

/**
 * A simulated blur event on the event overlay.
 */
interface SimulatedBlurEvent extends BaseSimulatedEvent {
  type: "blur";
}

/**
 * A simulated keydown event on the event overlay.
 */
interface SimulatedKeyDownEvent extends BaseSimulatedEvent {
  type: "keydown";
  /**
   * Key that was pressed.
   */
  key: string;
}

/**
 * A simulated gap in time.
 */
interface SimulatedGap extends BaseSimulatedEvent {
  type: "gap";
  /**
   * Time in seconds.
   */
  time: number;
}

/**
 * Run custom logic.
 *
 * You can run tests in here or call any logic you like.
 */
export interface SimulatedEventLogic extends BaseSimulatedEvent {
  type: "logic";
  description: string;
  /**
   * Custom logic to run.
   *
   * @param context - Context object containing player, spies, other objects,
   * and event history.
   */
  run: (context: PlayerEventContext) => Promise<void> | void;
}

/**
 * Simulated events can be run in sequence to test the behavior of the
 * enhanced player.
 */
export type SimulatedEvent =
  | SimulatedMouseDownEvent
  | SimulatedMouseMoveEvent
  | SimulatedMouseUpEvent
  | SimulatedFocusEvent
  | SimulatedBlurEvent
  | SimulatedKeyDownEvent
  | SimulatedGap
  | SimulatedEventLogic;

/**
 * A history item that contains the camera props right after a simulated event.
 */
interface SimulatedEventHistoryItem {
  /**
   * Camera props after the simulated event.
   */
  cameraProps: VimeoCameraProps;
  /**
   * Simulated event.
   */
  simulatedEvent: SimulatedEvent;
}

/**
 * Context object created when setting up the player and tracker.
 */
interface PlayerContext {
  element: HTMLElement;
  player: ExtendedPlayer;
  tracker: VimeoCameraInputTracker;
  moveCameraSpy: jest.SpyInstance;
  setCameraPropsSpy: jest.SpyInstance;
}

/**
 * Context object passed to custom logic functions for "logic" simulated events
 * as well as returned from `runEvents`.
 */
interface PlayerEventContext extends PlayerContext {
  eventHistory: SimulatedEventHistoryItem[];
}

// SETUP

jest.useFakeTimers();

// CONSTANTS

const VIMEO_ID = "76979871";

// EXPORTS

/**
 * Setup enhanced background player and tracker.
 *
 * @returns - Context object containing player, spies, and other objects.
 */
const setupPlayerAndTracker = async (): Promise<PlayerContext> => {
  // Create enhanced player and element
  const { element, player } = await createPlayerAndElement(
    {
      vimeoId: VIMEO_ID,
      vimeoBackground: "true",
      vimeoBackgroundEnhanced: "true",
    },
    true
  );

  // Get tracker and spy on `moveCamera` method
  const tracker = player._tracker!;
  const moveCameraSpy = jest.spyOn(tracker, "moveCamera");
  const setCameraPropsSpy = jest.spyOn(player, "setCameraProps");

  return { element, player, tracker, moveCameraSpy, setCameraPropsSpy };
};

/**
 * Setup enhanced background player and run simulated events in sequence.
 *
 * @param simulatedEvents - Simulated events to run.
 * @returns - Context object containing player, spies, event histoyr,
 *             and other objects.
 */
const runEvents = async (
  simulatedEvents: SimulatedEvent[] = []
): Promise<PlayerEventContext> => {
  // Setup player and tracker
  const playerContext = await setupPlayerAndTracker();
  const { player, tracker } = playerContext;

  // Store event history
  const eventHistory: SimulatedEventHistoryItem[] = [];

  // Get initial camera props and store in event history
  let cameraProps = await player.getCameraProps();
  eventHistory.push({
    simulatedEvent: { type: "gap", time: 0 },
    cameraProps,
  });

  // Run simulated events in sequence
  let event: MouseEvent | KeyboardEvent;

  for await (const simulatedEvent of simulatedEvents) {
    switch (simulatedEvent.type) {
      case "mousedown":
        event = new MouseEvent("mousedown", {
          clientX: simulatedEvent.clientX,
          clientY: simulatedEvent.clientY,
        });
        await tracker.handleMouseDown(event);
        break;

      case "mousemove":
        event = new MouseEvent("mousemove", {
          clientX: simulatedEvent.clientX,
          clientY: simulatedEvent.clientY,
        });
        await tracker.handleMouseMove(event);
        break;

      case "mouseup":
        await tracker.handleMouseUp();
        break;

      case "focus":
        tracker.eventOverlay.focus();
        break;

      case "blur":
        tracker.eventOverlay.blur();
        break;

      case "keydown":
        event = new KeyboardEvent("keydown", {
          key: simulatedEvent.key,
        });
        await tracker.handleKeyDown(event);
        break;

      case "gap":
        jest.advanceTimersByTime(simulatedEvent.time);
        break;

      case "logic":
        await simulatedEvent.run({
          ...playerContext,
          eventHistory,
        });
        break;
    }

    // Store camera props and simulated event after running simulated
    // event in event history
    cameraProps = await player.getCameraProps();
    eventHistory.push({
      simulatedEvent,
      cameraProps,
    });
  }

  return { ...playerContext, eventHistory };
};

/**
 * Generates a `run` callback for simulated 'logic' event that sets the camera
 * props to the given values.
 *
 * @param props - The camera props to set. If `yaw` or `pitch` are not
 * provided, the current value will be used.
 * @returns
 */
const generateSetCameraPropsRunLogic = (props: {
  yaw?: number;
  pitch?: number;
}): SimulatedEventLogic["run"] => {
  const run: SimulatedEventLogic["run"] = async ({ player, tracker }) => {
    const cameraProps = await player.getCameraProps();
    const nextYaw = props.yaw || cameraProps.yaw;
    const nextPitch = props.pitch || cameraProps.pitch;
    await tracker.moveCamera(nextYaw, nextPitch);
  };
  return run;
};

export { runEvents, setupPlayerAndTracker, generateSetCameraPropsRunLogic };
