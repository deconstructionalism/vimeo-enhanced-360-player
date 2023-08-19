import {
  MinMaxRange,
  generateRangeTransform,
  mapPositionAndWidthToRange,
} from "./range-operations";

// TESTS

describe("MinMaxRange", () => {
  it("throws error for ranges where max is not greater than min", () => {
    expect(() => new MinMaxRange(1, 0)).toThrow();
  });

  it("throws error for initial current values outside of range", () => {
    expect(() => new MinMaxRange(1, 10, false, 11)).toThrow();
    expect(() => new MinMaxRange(1, 10, true, 11)).toThrow();
    expect(() => new MinMaxRange(1, 10, false, 0)).toThrow();
    expect(() => new MinMaxRange(1, 10, true, 0)).toThrow();
  });

  it("default to min value when no current value is supplied", () => {
    const range1 = new MinMaxRange(22, 500, false);
    expect(range1.current).toBe(22);

    const range2 = new MinMaxRange(22, 500, true);
    expect(range2.current).toBe(22);
  });

  it("can set initial current value", () => {
    const range1 = new MinMaxRange(22, 500, false, 33);
    expect(range1.current).toBe(33);

    const range2 = new MinMaxRange(22, 500, true, 33);
    expect(range2.current).toBe(33);
  });

  it("allows setting current value within non-circular range", () => {
    const range = new MinMaxRange(22, 500, false, 33);
    expect(range.current).toBe(33);

    range.current = 44;
    expect(range.current).toBe(44);

    range.current = 440;
    expect(range.current).toBe(440);
  });

  it("respects min and max values for non-circular ranges", () => {
    const range = new MinMaxRange(22, 500, false, 33);
    expect(range.current).toBe(33);

    range.current = 501;
    expect(range.current).toBe(500);

    range.current = 21;
    expect(range.current).toBe(22);
  });

  it("allows setting current value within circular range", () => {
    const range = new MinMaxRange(0, 360, true, 33);
    expect(range.current).toBe(33);

    range.current = 44;
    expect(range.current).toBe(44);

    range.current = -90;
    expect(range.current).toBe(270);

    range.current = 361;
    expect(range.current).toBe(1);

    range.current = 720;
    expect(range.current).toBe(360);
  });
});

describe("generateRangeTransform", () => {
  it("maps values from one range to another", () => {
    const iRange1 = new MinMaxRange(0, 100);
    const jRange1 = new MinMaxRange(0, 10);
    const transform = generateRangeTransform(iRange1, jRange1);

    expect(transform(0)).toBe(0);
    expect(transform(50)).toBe(5);
    expect(transform(100)).toBe(10);

    const iRange2 = new MinMaxRange(0, 360);
    const jRange2 = new MinMaxRange(-180, 180);
    const transform2 = generateRangeTransform(iRange2, jRange2);

    expect(transform2(0)).toBe(-180);
    expect(transform2(180)).toBe(0);
    expect(transform2(360)).toBe(180);
  });
});

describe("mapPositionAndWidthToRange", () => {
  test.each([
    {
      iRange: new MinMaxRange(0, 100, false, 20),
      jCurrent: 80,
      jWidth: 360,
      expectedJMin: 8,
      expectedJMax: 368,
    },
    {
      iRange: new MinMaxRange(0, 100, true, 20),
      jCurrent: 50,
      jWidth: 360,
      expectedJMin: -22,
      expectedJMax: 338,
    },
    {
      iRange: new MinMaxRange(-100, 100, false, -20),
      jCurrent: -10,
      jWidth: 360,
      expectedJMin: -154,
      expectedJMax: 206,
    },
    {
      iRange: new MinMaxRange(-200, -100, true, -150),
      jCurrent: 20,
      jWidth: 360,
      expectedJMin: -160,
      expectedJMax: 200,
    },
  ])(
    "maps a value with a width to a new range based on another range: %p",
    ({ iRange, jCurrent, jWidth, expectedJMin, expectedJMax }) => {
      const jRange = mapPositionAndWidthToRange(iRange, jCurrent, jWidth);

      expect(jRange.current).toBe(jCurrent);
      expect(iRange.circular).toBe(jRange.circular);
      expect(jRange.min).toBe(expectedJMin);
      expect(jRange.max).toBe(expectedJMax);
    }
  );
});
