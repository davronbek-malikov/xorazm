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
} from "../types";
import { generateSalesHistory } from "./generate-sales";

const products: Product[] = [
  { id: "p1", barcode: "4870002000011", name: "Paracetamol 500mg (10 tab)", category: "Og'riq qoldiruvchi", brand: "Pharmstandard", unit: "quti", costPrice: 6000, sellPrice: 9000, stock: 150, minStock: 30, expiryDate: "2027-03-01", batchNumber: "B-2301", prescriptionRequired: false },
  { id: "p2", barcode: "4870002000028", name: "Amoxicillin 500mg (20 tab)", category: "Antibiotik", brand: "Hemofarm", unit: "quti", costPrice: 18000, sellPrice: 26000, stock: 60, minStock: 15, expiryDate: "2026-09-15", batchNumber: "B-2218", prescriptionRequired: true },
  { id: "p3", barcode: "4870002000035", name: "No-shpa 40mg (24 tab)", category: "Spazmolitik", brand: "Sanofi", unit: "quti", costPrice: 22000, sellPrice: 31000, stock: 45, minStock: 10, expiryDate: "2027-01-10", batchNumber: "B-2305", prescriptionRequired: false },
  { id: "p4", barcode: "4870002000042", name: "Vitamin C 1000mg (20 tab)", category: "Vitaminlar", brand: "Solgar", unit: "quti", costPrice: 25000, sellPrice: 35000, stock: 70, minStock: 15, expiryDate: "2027-06-01", batchNumber: "B-2402", prescriptionRequired: false },
  { id: "p5", barcode: "4870002000059", name: "Insulin (flakon)", category: "Endokrinologiya", brand: "Novo Nordisk", unit: "flakon", costPrice: 85000, sellPrice: 110000, stock: 12, minStock: 10, expiryDate: "2026-07-20", batchNumber: "B-2150", prescriptionRequired: true },
  { id: "p6", barcode: "4870002000066", name: "Tibbiy maska (50 dona)", category: "Tibbiy buyumlar", brand: "MedLine", unit: "quti", costPrice: 25000, sellPrice: 35000, stock: 100, minStock: 20, expiryDate: "2028-01-01", batchNumber: "B-2410", prescriptionRequired: false },
  { id: "p7", barcode: "4870002000073", name: "Antiseptik (spirtli) 100ml", category: "Antiseptiklar", brand: "Mahalliy", unit: "dona", costPrice: 8000, sellPrice: 13000, stock: 80, minStock: 20, expiryDate: "2027-12-01", batchNumber: "B-2399", prescriptionRequired: false },
  { id: "p8", barcode: "4870002000080", name: "Ibuprofen 400mg (20 tab)", category: "Og'riq qoldiruvchi", brand: "Pharmstandard", unit: "quti", costPrice: 9000, sellPrice: 14000, stock: 9, minStock: 20, expiryDate: "2026-06-30", batchNumber: "B-2199", prescriptionRequired: false },
  { id: "p9", barcode: "4870002000097", name: "Sterilь bint", category: "Tibbiy buyumlar", brand: "MedLine", unit: "dona", costPrice: 4000, sellPrice: 7000, stock: 120, minStock: 30, expiryDate: "2028-05-01", batchNumber: "B-2420", prescriptionRequired: false },
  { id: "p10", barcode: "4870002000103", name: "Tinchlantiruvchi tabletka (20 tab)", category: "Nevrologiya", brand: "KRKA", unit: "quti", costPrice: 30000, sellPrice: 42000, stock: 25, minStock: 10, expiryDate: "2026-07-05", batchNumber: "B-2160", prescriptionRequired: true },
];

const employees: Employee[] = [
  { id: "e1", fullName: "Dilshod Rahimov", birthDate: "1982-01-15", phone: "+998901114455", address: "Toshkent, Shayxontohur", position: "Direktor", hireDate: "2019-03-01", salary: 13000000, status: "active" },
  { id: "e2", fullName: "Madina Yusupova", birthDate: "1995-09-10", phone: "+998901114466", address: "Toshkent, Yakkasaroy", position: "Farmatsevt", hireDate: "2022-01-10", salary: 5500000, status: "active" },
  { id: "e3", fullName: "Aziz Karimov", birthDate: "1993-04-25", phone: "+998901114477", address: "Toshkent, Mirobod", position: "Omborchi", hireDate: "2021-07-01", salary: 5000000, status: "active" },
  { id: "e4", fullName: "Nilufar Rashidova", birthDate: "1990-02-18", phone: "+998901114488", address: "Toshkent, Mirzo Ulug'bek", position: "Buxgalter", hireDate: "2020-06-01", salary: 6200000, status: "active" },
  { id: "e5", fullName: "Sevara Tosheva", birthDate: "1997-12-02", phone: "+998901114499", address: "Toshkent, Chilonzor", position: "Farmatsevt", hireDate: "2023-05-15", salary: 5000000, status: "active" },
];

const today = new Date().toISOString().slice(0, 10);

const attendance: AttendanceRecord[] = [
  { id: "a1", employeeId: "e1", date: today, checkIn: "09:00", checkOut: "18:00", late: false, status: "ishda" },
  { id: "a2", employeeId: "e2", date: today, checkIn: "08:50", checkOut: null, late: false, status: "ishda" },
  { id: "a3", employeeId: "e3", date: today, checkIn: "09:15", checkOut: null, late: true, status: "ishda" },
  { id: "a4", employeeId: "e4", date: today, checkIn: "09:00", checkOut: "17:30", late: false, status: "ishda" },
  { id: "a5", employeeId: "e5", date: today, checkIn: null, checkOut: null, late: false, status: "dam olish" },
];

const partners: Partner[] = [
  {
    id: "pt1",
    companyName: "Pharmstandard Distribution",
    phone: "+998712007788",
    address: "Toshkent sh., Yunusobod tumani",
    taxId: "306112233",
    bankDetails: "Hamkorbank, 2020 8000 XXXX 1357",
    transactions: [{ date: "2026-05-15", productsDelivered: "Paracetamol, Ibuprofen", qty: 500, total: 7500000, paid: 7500000 }],
  },
  {
    id: "pt2",
    companyName: "Hemofarm Uzbekistan",
    phone: "+998712008899",
    address: "Toshkent sh., Mirzo Ulug'bek tumani",
    taxId: "306223344",
    bankDetails: "Ipoteka bank, 2020 8000 XXXX 2468",
    transactions: [{ date: "2026-06-01", productsDelivered: "Amoxicillin", qty: 100, total: 1800000, paid: 1200000 }],
  },
  {
    id: "pt3",
    companyName: "MedLine Supply",
    phone: "+998712009900",
    address: "Toshkent sh., Sergeli tumani",
    taxId: "306334455",
    bankDetails: "Xalq banki, 2020 8000 XXXX 3579",
    transactions: [{ date: "2026-06-05", productsDelivered: "Tibbiy maska, Sterilь bint", qty: 220, total: 4400000, paid: 4400000 }],
  },
];

const customers: Customer[] = [
  { id: "c1", fullName: "Shahnoza Aliyeva", phone: "+998909991122", bonusCardPercent: 5, discount: 5, debt: 0, purchaseHistory: [{ date: "2026-06-08", total: 45000 }] },
  { id: "c2", fullName: "Bekzod Niyozov", phone: "+998909992233", bonusCardPercent: 0, discount: 0, debt: 60000, purchaseHistory: [{ date: "2026-05-28", total: 60000 }] },
  { id: "c3", fullName: "Gulnoza Sodiqova", phone: "+998909993344", bonusCardPercent: 3, discount: 3, debt: 0, purchaseHistory: [{ date: "2026-06-10", total: 35000 }] },
];

const expenses: Expense[] = [
  { id: "ex1", date: "2026-06-01", category: "Ijara", amount: 7000000, note: "Iyun oyi ijara to'lovi" },
  { id: "ex2", date: "2026-06-02", category: "Elektr", amount: 900000, note: "Elektr energiyasi" },
  { id: "ex3", date: "2026-06-03", category: "Internet", amount: 350000, note: "Ofis internet" },
  { id: "ex4", date: "2026-06-05", category: "Soliq", amount: 4200000, note: "Oylik soliq to'lovi" },
  { id: "ex5", date: "2026-06-10", category: "Ishchilar oyligi", amount: 34700000, note: "May oyi ish haqi" },
];

const debts: Debt[] = [
  { id: "d1", partyName: "Bekzod Niyozov", type: "receivable", amount: 60000, dueDate: "2026-06-18" },
  { id: "d2", partyName: "Hemofarm Uzbekistan", type: "payable", amount: 600000, dueDate: "2026-06-22" },
];

const activityLog: ActivityLogEntry[] = [
  { id: "log1", timestamp: new Date().toISOString(), user: "admin", action: "Tizimga kirdi" },
  { id: "log2", timestamp: new Date().toISOString(), user: "kassir", action: "Retsept asosida dori sotildi" },
  { id: "log3", timestamp: new Date().toISOString(), user: "omborchi", action: "Yangi partiya dori kirim qilindi" },
];

export const PHARMACY_DATA: AppData = {
  businessType: "pharmacy",
  products,
  rawMaterials: [],
  recipes: [],
  employees,
  attendance,
  sales: generateSalesHistory(products, ["Madina Yusupova", "Sevara Tosheva"], 90, 2),
  partners,
  customers,
  expenses,
  debts,
  activityLog,
  balance: { cash: 22000000, bank: 51000000 },
};
