import { describe, it, expect } from "vitest";
import { formatUZS, formatDate, formatDateTime } from "./format";

describe("formatUZS", () => {
  it("formats whole numbers with space separators and so'm suffix", () => {
    expect(formatUZS(1250000)).toBe("1 250 000 so'm");
  });

  it("formats small numbers without separators", () => {
    expect(formatUZS(500)).toBe("500 so'm");
  });

  it("rounds decimals to the nearest whole number", () => {
    expect(formatUZS(1999.6)).toBe("2 000 so'm");
  });
});

describe("formatDate", () => {
  it("formats an ISO date as dd.mm.yyyy", () => {
    expect(formatDate("2026-06-10T00:00:00")).toBe("10.06.2026");
  });
});

describe("formatDateTime", () => {
  it("formats an ISO date-time as dd.mm.yyyy HH:mm", () => {
    expect(formatDateTime("2026-06-10T09:05:00")).toBe("10.06.2026 09:05");
  });
});
