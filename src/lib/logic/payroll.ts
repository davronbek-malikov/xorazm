import { Employee } from "../types";

export interface PayrollAdjustments {
  bonus: number;
  penalty: number;
  advance: number;
}

export interface PayrollResult extends PayrollAdjustments {
  base: number;
  final: number;
}

export function calculatePayroll(employee: Employee, adjustments: PayrollAdjustments): PayrollResult {
  const { bonus, penalty, advance } = adjustments;
  const final = employee.salary + bonus - penalty - advance;
  return { base: employee.salary, bonus, penalty, advance, final: Math.max(0, final) };
}
