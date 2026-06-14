import { describe, it, expect } from "vitest";
import { calculatePayroll } from "./payroll";
import { Employee } from "../types";

function makeEmployee(salary: number): Employee {
  return {
    id: "e1",
    fullName: "Test Employee",
    birthDate: "1990-01-01",
    phone: "+998900000000",
    address: "Toshkent",
    position: "Sotuvchi",
    hireDate: "2020-01-01",
    salary,
    status: "active",
  };
}

describe("calculatePayroll", () => {
  it("computes final payout as base + bonus - penalty - advance", () => {
    const result = calculatePayroll(makeEmployee(5000000), { bonus: 500000, penalty: 100000, advance: 1000000 });
    expect(result.final).toBe(4400000);
    expect(result.base).toBe(5000000);
  });

  it("never returns a negative final payout", () => {
    const result = calculatePayroll(makeEmployee(1000000), { bonus: 0, penalty: 0, advance: 2000000 });
    expect(result.final).toBe(0);
  });
});
