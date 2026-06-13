export type BusinessType = "supermarket" | "pharmacy" | "restaurant";
export type Role = "admin" | "direktor" | "kassir" | "omborchi" | "buxgalter";

export interface User {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: Role;
  active: boolean;
}

export interface Employee {
  id: string;
  fullName: string;
  birthDate: string;
  phone: string;
  address: string;
  position: string;
  hireDate: string;
  salary: number;
  status: "active" | "inactive";
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  late: boolean;
  status: "ishda" | "dam olish" | "tatil";
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: string;
  brand: string;
  unit: string;
  costPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  expiryDate?: string;
  batchNumber?: string;
  prescriptionRequired?: boolean;
}

export interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  costPrice: number;
  stock: number;
  minStock: number;
}

export interface RecipeIngredient {
  rawMaterialId: string;
  qty: number;
}

export interface Recipe {
  id: string;
  productId: string;
  ingredients: RecipeIngredient[];
}

export type PaymentMethod = "Naqd" | "Karta" | "Click" | "Payme" | "Uzum" | "Aralash";
export type OrderType = "Stolda" | "Olib ketish" | "Yetkazib berish";

export interface SaleItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
  discount: number;
}

export interface PrescriptionInfo {
  doctorName: string;
  patientName: string;
  prescriptionNumber: string;
}

export interface Sale {
  id: string;
  date: string;
  cashierName: string;
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  orderType?: OrderType;
  tableNumber?: string;
  customerId?: string;
  prescription?: PrescriptionInfo;
}

export interface PartnerTransaction {
  date: string;
  productsDelivered: string;
  qty: number;
  total: number;
  paid: number;
}

export interface Partner {
  id: string;
  companyName: string;
  phone: string;
  address: string;
  taxId: string;
  bankDetails: string;
  transactions: PartnerTransaction[];
}

export interface CustomerPurchase {
  date: string;
  total: number;
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  bonusCardPercent: number;
  discount: number;
  debt: number;
  purchaseHistory: CustomerPurchase[];
}

export type ExpenseCategory =
  | "Soliq"
  | "Elektr"
  | "Gaz"
  | "Suv"
  | "Internet"
  | "Ijara"
  | "Ishchilar oyligi"
  | "Boshqa";

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  note: string;
}

export interface Debt {
  id: string;
  partyName: string;
  type: "receivable" | "payable";
  amount: number;
  dueDate: string;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
}

export interface FinanceBalance {
  cash: number;
  bank: number;
}

export interface AppData {
  businessType: BusinessType;
  products: Product[];
  rawMaterials: RawMaterial[];
  recipes: Recipe[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  sales: Sale[];
  partners: Partner[];
  customers: Customer[];
  expenses: Expense[];
  debts: Debt[];
  activityLog: ActivityLogEntry[];
  balance: FinanceBalance;
}
