import {
  ActivityLogEntry,
  AppData,
  AttendanceRecord,
  Customer,
  Debt,
  Employee,
  Expense,
  Partner,
  Product,
  RawMaterial,
  Recipe,
} from "../types";
import { generateSalesHistory } from "./generate-sales";

const rawMaterials: RawMaterial[] = [
  { id: "rm1", name: "Go'sht (mol/qo'y)", unit: "kg", costPrice: 85000, stock: 40, minStock: 10 },
  { id: "rm2", name: "Tovuq go'shti", unit: "kg", costPrice: 35000, stock: 30, minStock: 10 },
  { id: "rm3", name: "Piyoz", unit: "kg", costPrice: 6000, stock: 25, minStock: 5 },
  { id: "rm4", name: "Kartoshka", unit: "kg", costPrice: 4000, stock: 35, minStock: 10 },
  { id: "rm5", name: "Un", unit: "kg", costPrice: 7000, stock: 50, minStock: 15 },
  { id: "rm6", name: "Yog'", unit: "litr", costPrice: 18000, stock: 20, minStock: 5 },
  { id: "rm7", name: "Guruch", unit: "kg", costPrice: 13000, stock: 15, minStock: 10 },
  { id: "rm8", name: "Ko'mir", unit: "kg", costPrice: 3000, stock: 60, minStock: 20 },
  { id: "rm9", name: "Ziravorlar", unit: "kg", costPrice: 40000, stock: 8, minStock: 3 },
];

const products: Product[] = [
  { id: "p1", barcode: "5000001000011", name: "Go'shtli somsa", category: "Somsa", brand: "Oshxona", unit: "dona", costPrice: 6000, sellPrice: 9000, stock: 80, minStock: 20 },
  { id: "p2", barcode: "5000001000028", name: "Kartoshkali somsa", category: "Somsa", brand: "Oshxona", unit: "dona", costPrice: 4000, sellPrice: 7000, stock: 50, minStock: 15 },
  { id: "p3", barcode: "5000001000035", name: "Tandir tovuq", category: "Tandir", brand: "Oshxona", unit: "dona", costPrice: 25000, sellPrice: 45000, stock: 8, minStock: 10 },
  { id: "p4", barcode: "5000001000042", name: "Tovuq qanoti (porsiya)", category: "Tandir", brand: "Oshxona", unit: "porsiya", costPrice: 18000, sellPrice: 32000, stock: 20, minStock: 10 },
  { id: "p5", barcode: "5000001000059", name: "Mol go'shti shashlik", category: "Shashlik", brand: "Oshxona", unit: "sich", costPrice: 16000, sellPrice: 28000, stock: 40, minStock: 15 },
  { id: "p6", barcode: "5000001000066", name: "Qo'y go'shti shashlik", category: "Shashlik", brand: "Oshxona", unit: "sich", costPrice: 18000, sellPrice: 30000, stock: 30, minStock: 15 },
  { id: "p7", barcode: "5000001000073", name: "Jigar shashlik", category: "Shashlik", brand: "Oshxona", unit: "sich", costPrice: 10000, sellPrice: 18000, stock: 25, minStock: 10 },
  { id: "p8", barcode: "5000001000080", name: "Achchiq-chuchuk salat", category: "Salatlar", brand: "Oshxona", unit: "porsiya", costPrice: 5000, sellPrice: 12000, stock: 15, minStock: 10 },
  { id: "p9", barcode: "5000001000097", name: "Non", category: "Non", brand: "Oshxona", unit: "dona", costPrice: 2000, sellPrice: 3000, stock: 60, minStock: 20 },
  { id: "p10", barcode: "5000001000103", name: "Choy (choynak)", category: "Ichimliklar", brand: "Oshxona", unit: "choynak", costPrice: 1000, sellPrice: 5000, stock: 200, minStock: 30 },
];

// Recipe quantities are expressed in the RawMaterial's unit (kg, litr) per ONE sold unit of the product.
const recipes: Recipe[] = [
  { id: "r1", productId: "p1", ingredients: [{ rawMaterialId: "rm5", qty: 0.1 }, { rawMaterialId: "rm1", qty: 0.08 }, { rawMaterialId: "rm3", qty: 0.04 }, { rawMaterialId: "rm6", qty: 0.01 }] },
  { id: "r2", productId: "p2", ingredients: [{ rawMaterialId: "rm5", qty: 0.1 }, { rawMaterialId: "rm4", qty: 0.09 }, { rawMaterialId: "rm3", qty: 0.03 }, { rawMaterialId: "rm6", qty: 0.01 }] },
  { id: "r3", productId: "p3", ingredients: [{ rawMaterialId: "rm2", qty: 1 }, { rawMaterialId: "rm9", qty: 0.02 }, { rawMaterialId: "rm8", qty: 0.5 }] },
  { id: "r4", productId: "p4", ingredients: [{ rawMaterialId: "rm2", qty: 0.3 }, { rawMaterialId: "rm9", qty: 0.01 }, { rawMaterialId: "rm8", qty: 0.2 }] },
  { id: "r5", productId: "p5", ingredients: [{ rawMaterialId: "rm1", qty: 0.12 }, { rawMaterialId: "rm3", qty: 0.02 }, { rawMaterialId: "rm9", qty: 0.01 }] },
  { id: "r6", productId: "p6", ingredients: [{ rawMaterialId: "rm1", qty: 0.13 }, { rawMaterialId: "rm3", qty: 0.02 }, { rawMaterialId: "rm9", qty: 0.01 }] },
  { id: "r7", productId: "p7", ingredients: [{ rawMaterialId: "rm1", qty: 0.1 }, { rawMaterialId: "rm9", qty: 0.01 }] },
  { id: "r8", productId: "p8", ingredients: [{ rawMaterialId: "rm3", qty: 0.08 }, { rawMaterialId: "rm4", qty: 0.05 }] },
  { id: "r9", productId: "p9", ingredients: [{ rawMaterialId: "rm5", qty: 0.15 }] },
];

const employees: Employee[] = [
  { id: "e1", fullName: "Bahodir Yusupov", birthDate: "1980-08-01", phone: "+998901115566", address: "Xorazm, Urganch", position: "Administrator", hireDate: "2020-01-15", salary: 11000000, status: "active" },
  { id: "e2", fullName: "Madina Yusupova", birthDate: "1996-07-22", phone: "+998901115577", address: "Xorazm, Urganch", position: "Kassir", hireDate: "2022-04-01", salary: 4500000, status: "active" },
  { id: "e3", fullName: "Olimjon Sattorov", birthDate: "1988-03-14", phone: "+998901115588", address: "Xorazm, Urganch", position: "Oshpaz", hireDate: "2021-02-01", salary: 7000000, status: "active" },
  { id: "e4", fullName: "Sardor Tojiyev", birthDate: "1992-11-05", phone: "+998901115599", address: "Xorazm, Urganch", position: "Tandirchi", hireDate: "2021-09-15", salary: 6000000, status: "active" },
  { id: "e5", fullName: "Jasur Ergashev", birthDate: "1998-05-30", phone: "+998901115600", address: "Xorazm, Urganch", position: "Shashlikchi", hireDate: "2023-02-20", salary: 6000000, status: "active" },
];

const today = new Date().toISOString().slice(0, 10);

const attendance: AttendanceRecord[] = [
  { id: "a1", employeeId: "e1", date: today, checkIn: "08:30", checkOut: "20:00", late: false, status: "ishda" },
  { id: "a2", employeeId: "e2", date: today, checkIn: "08:55", checkOut: null, late: false, status: "ishda" },
  { id: "a3", employeeId: "e3", date: today, checkIn: "07:50", checkOut: null, late: false, status: "ishda" },
  { id: "a4", employeeId: "e4", date: today, checkIn: "08:10", checkOut: null, late: false, status: "ishda" },
  { id: "a5", employeeId: "e5", date: today, checkIn: "09:30", checkOut: null, late: true, status: "ishda" },
];

const partners: Partner[] = [
  {
    id: "pt1",
    companyName: "Go'sht Bazasi Xorazm",
    phone: "+998622001122",
    address: "Xorazm viloyati, Urganch",
    taxId: "305112233",
    bankDetails: "Hamkorbank, 2020 8000 XXXX 4321",
    transactions: [{ date: "2026-06-01", productsDelivered: "Go'sht, Tovuq go'shti", qty: 60, total: 4500000, paid: 4500000 }],
  },
  {
    id: "pt2",
    companyName: "Don Mahsulotlari",
    phone: "+998622003344",
    address: "Xorazm viloyati, Urganch",
    taxId: "305223344",
    bankDetails: "Ipoteka bank, 2020 8000 XXXX 8765",
    transactions: [{ date: "2026-06-03", productsDelivered: "Un, Guruch", qty: 100, total: 1300000, paid: 900000 }],
  },
  {
    id: "pt3",
    companyName: "Sabzavot Bozori",
    phone: "+998622005566",
    address: "Xorazm viloyati, Urganch",
    taxId: "305334455",
    bankDetails: "Xalq banki, 2020 8000 XXXX 2468",
    transactions: [{ date: "2026-06-05", productsDelivered: "Piyoz, Kartoshka", qty: 50, total: 300000, paid: 300000 }],
  },
];

const customers: Customer[] = [
  { id: "c1", fullName: "Shahnoza Aliyeva", phone: "+998909991122", bonusCardPercent: 5, discount: 5, debt: 0, purchaseHistory: [{ date: "2026-06-08", total: 95000 }] },
  { id: "c2", fullName: "Bekzod Niyozov", phone: "+998909992233", bonusCardPercent: 0, discount: 0, debt: 0, purchaseHistory: [{ date: "2026-05-28", total: 145000 }] },
];

const expenses: Expense[] = [
  { id: "ex1", date: "2026-06-01", category: "Ijara", amount: 9000000, note: "Iyun oyi ijara" },
  { id: "ex2", date: "2026-06-02", category: "Gaz", amount: 2200000, note: "Tandir uchun gaz" },
  { id: "ex3", date: "2026-06-02", category: "Elektr", amount: 1100000, note: "Elektr energiyasi" },
  { id: "ex4", date: "2026-06-05", category: "Soliq", amount: 2800000, note: "Oylik soliq" },
  { id: "ex5", date: "2026-06-10", category: "Ishchilar oyligi", amount: 34500000, note: "May oyi ish haqi" },
];

const debts: Debt[] = [{ id: "d1", partyName: "Don Mahsulotlari", type: "payable", amount: 400000, dueDate: "2026-06-20" }];

const activityLog: ActivityLogEntry[] = [
  { id: "log1", timestamp: new Date().toISOString(), user: "admin", action: "Tizimga kirdi" },
  { id: "log2", timestamp: new Date().toISOString(), user: "kassir", action: "Buyurtma qabul qilindi" },
  { id: "log3", timestamp: new Date().toISOString(), user: "omborchi", action: "Xomashyo kirimi kiritildi" },
];

export const RESTAURANT_DATA: AppData = {
  businessType: "restaurant",
  products,
  rawMaterials,
  recipes,
  employees,
  attendance,
  sales: generateSalesHistory(products, ["Madina Yusupova", "Jasur Ergashev"], 90, 3),
  partners,
  customers,
  expenses,
  debts,
  activityLog,
  balance: { cash: 12500000, bank: 28000000 },
};
