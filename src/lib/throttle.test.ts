import throttle from "./throttle";

jest.useFakeTimers();

describe("throttle", () => {
  const mockThrottledFunction = jest.fn();

  beforeEach(() => {
    mockThrottledFunction.mockClear();
  });

  it("allows first call to throttled function", () => {
    const throttled = throttle(mockThrottledFunction, 1000);

    throttled();

    expect(mockThrottledFunction).toHaveBeenCalledTimes(1);
  });

  it("rejects calls to throttled function within limit", async () => {
    const throttled = throttle(mockThrottledFunction, 500);

    // call throttled function several times within and beyond limit
    [...Array(17).keys()].forEach((index) => {
      throttled(index);
      jest.advanceTimersByTime(100);
    });

    expect(mockThrottledFunction).toHaveBeenCalledTimes(4);
    expect(mockThrottledFunction.mock.calls.flat()).toEqual([0, 5, 10, 15]);
  });
});
