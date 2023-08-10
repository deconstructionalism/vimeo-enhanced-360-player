// EXPORTS

/**
 * Throttle function calls to a given limit.
 *
 * @param func - function to throttle
 * @param limit - limit in milliseconds
 *
 * @returns throttled function
 */
const throttle = <R, A extends any[]>(
  func: (...args: A) => R,
  limit: number
): ((...args: A) => R | undefined) => {
  let inThrottle = false;

  return (...args) => {
    if (!inThrottle) {
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
      return func(...args);
    }
  };
};

export default throttle;
