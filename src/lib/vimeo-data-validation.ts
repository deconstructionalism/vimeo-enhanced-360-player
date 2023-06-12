class VimeoDataCast {
  key: string;
  type: "string" | "boolean" | "number" | "object";
  castFunction: (
    value: string
  ) => string | boolean | number | { [key: string]: string };

  /**
   * Validates and type-casts Vimeo player data passed to Vimeo Root elements
   * as `data-*` attributes.
   *
   * @param key - name of the data attribute
   * @param type - type of the data attribute
   */
  constructor(key: string, type: "string" | "boolean" | "number" | "object") {
    this.key = key;
    this.type = type;

    // Set the cast function based on the type
    this.castFunction =
      this.type === "object"
        ? this._castToObject
        : this.type === "boolean"
        ? this._castToBoolean
        : this.type === "number"
        ? Number
        : String;
  }

  /**
   * Casts a string to an object.
   *
   * Example: 'key1=value1, key2=value2' => { key1: 'value1', key2: 'value2' }
   *
   * @param value - value to cast
   *
   * @returns cast object
   */
  _castToObject = (value: string): { [key: string]: string } => {
    return value
      .split(",")
      .map((item) => item.trim())
      .reduce((acc, curr) => {
        const [k, v] = curr.split("=");
        return {
          ...acc,
          [k.trim()]: v.trim(),
        };
      }, {});
  };

  /**
   * Casts a string to a boolean.
   *
   * @param value - value to cast
   *
   * @returns cast boolean
   */
  _castToBoolean = (value: string): boolean => {
    const validBooleanValues = ["True", "true", "1", "False", "false", "0"];
    if (!validBooleanValues.includes(value)) {
      throw new Error(
        `VimeoDataCast: Vimeo video root boolean element \`data-${this.key}\` must have a boolean-like value: ${validBooleanValues}.`
      );
    }

    return Boolean(value);
  };

  /**
   * Validates and transforms Vimeo player data passed to Vimeo Root elements as `data-*` attributes.
   *
   * @param data - data attributes passed to the Vimeo Root element
   *
   * @returns cast value
   */
  validate = (
    data: DOMStringMap
  ): string | boolean | number | { [key: string]: string } | undefined => {
    try {
      const value = data[this.key];

      return value === undefined ? undefined : this.castFunction(value);
    } catch (error) {
      throw new Error(
        `VimeoDataCast: Could not process data attribute \`data-${this.key}\`. ${error}}`
      );
    }
  };
}

export { VimeoDataCast };
