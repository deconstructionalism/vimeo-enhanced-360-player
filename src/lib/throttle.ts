type ThrottledFunction = (...args: any[]) => Promise<void> | void;

/**
 * Throttle function calls to a given limit.
 *
 * @param func - function to throttle
 * @param limit - limit in milliseconds
 *
 * @returns throttled function
 */
const throttle = (
  func: ThrottledFunction,
  limit: number
): ThrottledFunction => {
  let inThrottle = false;

  return (...args) => {
    if (!inThrottle) {
      inThrottle = true;
      func(...args);
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export default throttle;
