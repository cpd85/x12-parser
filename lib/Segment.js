class Segment {
  /**
   * Creates a new segment object
   * @param {string} raw The raw string of a segment in X12 format
   * @param {object} delimiters An object of delimiters to be used to parse segment
   */
  constructor(raw, delimiters, trim) {
    this._delimiters = delimiters;
    this._parsed = [];
    this._name = '';
    this._trim = trim;

    this.parseSegment(raw);
  }

  /** @type {string[]} */
  get parsed() {
    return this._parsed;
  }

  /** @type {string} */
  get name() {
    return this._name;
  }

  get formatted() {
    let formatted = { name: this._name };
    this._parsed.forEach((element, elementIndex) => {
      // First value is the initial value
      formatted[`${elementIndex + 1}`] = element.splice(0, 1)[0];

      // Add components
      element.forEach((component, componentIndex) => {
        formatted[`${elementIndex + 1}-${componentIndex + 1}`] = component;
      });
    });

    return formatted;
  }

  /**
   * Removes unneeded chars from a string
   * @param {string} string The string to be cleaned
   * @param {boolean} trim whether to trim the string
   * @returns {string} Cleaned version of string
   */
  static cleanString(string, trim) {
    const cleaned = string.replace(/\n/g, '');
    return trim ? cleaned.trim() : cleaned;
  }

  /**
   * Processes an element and formats it
   * @param {string} element The string inside the element
   * @returns {string[]} A nested array of segments & componenets
   */
  processElement(element) {
    // If this is ISA we don't want to split on component
    if (this._name === 'ISA') {
      return [Segment.cleanString(element, this._trim)];
    } else {
      return element
        .split(this._delimiters.component)
        .map((string) => Segment.cleanString(string, this._trim));
    }
  }

  /**
   * Parses the segments and components into an array
   * @param {string} rawData The segment string
   * @param {object} delmiters An object with delimiters for this file
   */
  parseSegment(rawData) {
    // Separate elements
    const elements = rawData.split(this._delimiters.element);

    // Extract name
    this._name = Segment.cleanString(elements.splice(0, 1)[0], this._trim);

    // Get formatted element w/ components
    this._parsed = elements.map((element) => this.processElement(element));
  }
}

module.exports = Segment;
