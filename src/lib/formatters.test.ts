import { describe, it, expect } from "vitest";
import { formatNumber } from "./formatters";

describe("formatNumber", () => {
  it("formats positive numbers correctly", () => {
    expect(formatNumber(1000)).toBe("1,000");
    expect(formatNumber(1000000)).toBe("1,000,000");
    expect(formatNumber(123456789)).toBe("123,456,789");
  });

  it("formats negative numbers correctly", () => {
    expect(formatNumber(-1000)).toBe("-1,000");
    expect(formatNumber(-1000000)).toBe("-1,000,000");
  });

  it("handles zero correctly", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(-0)).toBe("-0");
  });

  it("formats decimal numbers correctly", () => {
    expect(formatNumber(1000.5)).toBe("1,000.5");
    expect(formatNumber(1234.56)).toBe("1,234.56");
  });

  it("handles non-finite numbers by returning 0", () => {
    expect(formatNumber(NaN)).toBe("0");
    expect(formatNumber(Infinity)).toBe("0");
    expect(formatNumber(-Infinity)).toBe("0");
  });
});
