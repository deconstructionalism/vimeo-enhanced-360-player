// EXPORTS

/**
 * Sequentially call a function a given number of times with a given gap.
 *
 * @param func - Function to call
 * @param times - Number of times to call the function
 * @param gap - Time to wait between calls
 * @param generateArgs - Function to generate an array of arguments for the
 *                       each call to `func`. It receives the index of the call
 *                       as an argument
 * @returns Results of each call to the function
 */
const sequentiallyCallFunction = async <R>(
  func: (...args: any[]) => R,
  times: number,
  gap: number = 0,
  generateArgs: (index?: number) => any[]
): Promise<R[]> => {
  const results: any[] = [];

  await [...Array(times).keys()].reduce(async (acc, index) => {
    await acc;

    // Advance timers by gap
    jest.advanceTimersByTime(gap);

    // Call function and store result
    const result = await func(...generateArgs(index));
    results.push(result);

    return Promise.resolve();
  }, Promise.resolve());

  return results;
};

export { sequentiallyCallFunction };
