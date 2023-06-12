/**
 * Throttle function calls to a given limit.
 *
 * @param func - function to throttle
 * @param limit - limit in milliseconds
 * @returns throttled function
 */
const throttle = (
  func: (...args: any[]) => void | Promise<void>,
  limit: number
): ((...args: any[]) => void | Promise<void>) => {
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
