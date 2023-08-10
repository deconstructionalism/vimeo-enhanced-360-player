import { sequentiallyCallFunction } from "../test-utils/function-utils";
import throttle from "./throttle";

// SETUP

jest.useFakeTimers();

// TESTS

describe("throttle", () => {
  const mockThrottledFunction = jest.fn().mockReturnValue("sync");
  const mockThrottledAsyncFunction = jest
    .fn<Promise<string>, any>()
    .mockResolvedValue("async");

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("allows first call to throttled function", async () => {
    // Test synchronous function
    const throttled = throttle(mockThrottledFunction, 1000);
    const syncValue = throttled();

    expect(mockThrottledFunction).toHaveBeenCalledTimes(1);
    expect(syncValue).toBe("sync");

    // Test asynchronous function
    const asyncThrottled = throttle(mockThrottledAsyncFunction, 1000);
    const asyncValue = await asyncThrottled();

    expect(mockThrottledAsyncFunction).toHaveBeenCalledTimes(1);
    expect(asyncValue).toBe("async");
  });

  it("rejects calls to throttled function within limit", async () => {
    // Test synchronous function
    const throttled = throttle(mockThrottledFunction, 500);

    // call throttled function several times within and beyond limit
    await sequentiallyCallFunction(throttled, 17, 100, (index) => [index]);

    expect(mockThrottledFunction).toHaveBeenCalledTimes(4);
    expect(mockThrottledFunction.mock.calls.flat()).toEqual([0, 5, 10, 15]);

    // Test asynchronous function
    const asyncThrottled = throttle(mockThrottledAsyncFunction, 500);

    // Call throttled function several times within and beyond limit
    await sequentiallyCallFunction(asyncThrottled, 17, 100, (index) => [index]);

    expect(mockThrottledAsyncFunction).toHaveBeenCalledTimes(4);
    expect(mockThrottledAsyncFunction.mock.calls.flat()).toEqual([
      0, 5, 10, 15,
    ]);
  });
});
