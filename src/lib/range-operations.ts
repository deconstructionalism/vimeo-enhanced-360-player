// EXPORTS
class MinMaxRange {
  min: number;
  max: number;
  circular: boolean;
  _current: number = Infinity;

  /**
   * A numeric range with a minimum and maximum value and current index,
   * than handles circular ranges as well.
   *
   * @param min - minimum value of range
   * @param max - maximum value of range
   * @param circular - whether the range is circular
   * @param current - current value within range
   */
  constructor(
    min: number,
    max: number,
    circular = false,
    current: number | null = null
  ) {
    if (min >= max)
      throw new Error(
        `min must be less than max, received ${JSON.stringify({ min, max })}`
      );
    if (current !== null && (current < min || current > max))
      throw new Error(
        `current must be within range, received ${JSON.stringify({
          current,
          min,
          max,
        })}`
      );

    this.min = min;
    this.max = max;
    this.circular = circular;
    this.current = current === null ? this.min : current;
  }

  get current(): number {
    return this._current;
  }

  set current(value: number) {
    // handle circular ranges
    if (this.circular) {
      this._current =
        value < this.min
          ? this.max - (this.min - value)
          : value > this.max
          ? this.min + (value - this.max)
          : value;
      // handle non-circular ranges
    } else {
      this._current =
        value < this.min ? this.min : value > this.max ? this.max : value;
    }
  }
}

/**
 * Takes a range to map from and a range to map to and returns a function that maps
 * a value from the first range to the second range.
 *
 * @param iRange - range to map from
 * @param jRange - range to map to
 * @returns function that maps a value from the first range to the second range
 */
const generateRangeTransform = (iRange: MinMaxRange, jRange: MinMaxRange) => {
  return (iRangeValue: number): number => {
    return (
      ((iRangeValue - iRange.min) / (iRange.max - iRange.min)) *
        (jRange.max - jRange.min) +
      jRange.min
    );
  };
};

/**
 * Maps a position and width from one range to another.
 *
 * @param iRange - range to map from
 * @param jCurrent - current value of range to map to
 * @param jWidth - width of range to map to
 * @returns - range mapped to
 */
const mapPositionAndWidthToRange = (
  iRange: MinMaxRange,
  jCurrent: number,
  jWidth: number
): MinMaxRange => {
  const percentRange =
    (iRange.current - iRange.min) / (iRange.max - iRange.min);
  const jMin = jCurrent - jWidth * percentRange;
  const jMax = jMin + jWidth;

  return new MinMaxRange(jMin, jMax, iRange.circular, jCurrent);
};

export { MinMaxRange, generateRangeTransform, mapPositionAndWidthToRange };
