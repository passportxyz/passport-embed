import { displayNumber } from "../../src/utils";

describe("displayNumber", () => {
  it("returns '0' for undefined input", () => {
    expect(displayNumber(undefined)).toBe("0");
  });

  it("returns '0' for null input", () => {
    expect(displayNumber(null as unknown as number)).toBe("0");
  });

  it("returns '0' for 0 input", () => {
    expect(displayNumber(0)).toBe("0");
  });

  it("returns '0' for negative numbers less than 1", () => {
    expect(displayNumber(-0.5)).toBe("-0.5");
  });

  it("returns '0.5' for positive numbers less than 1", () => {
    expect(displayNumber(0.5)).toBe("0.5");
  });

  it("returns '1' for positive integers", () => {
    expect(displayNumber(1)).toBe("1");
  });

  it("returns '10' for positive integers greater than 1", () => {
    expect(displayNumber(10)).toBe("10");
  });

  it("returns '-1' for negative integers", () => {
    expect(displayNumber(-1)).toBe("-1");
  });

  it("returns '-10' for negative integers greater than 1", () => {
    expect(displayNumber(-10)).toBe("-10");
  });

  it("returns '1' for decimal numbers greater than 1", () => {
    expect(displayNumber(1.5)).toBe("1");
  });

  it("returns '10' for decimal numbers greater than 10", () => {
    expect(displayNumber(10.7)).toBe("10");
  });
});
