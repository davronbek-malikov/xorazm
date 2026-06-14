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
  { id: "p1", barcode: "4780001000011", name: "Non (oddiy)", category: "Non mahsulotlari", brand: "Mahalliy", unit: "dona", costPrice: 2000, sellPrice: 3000, stock: 120, minStock: 20 },
  { id: "p2", barcode: "4780001000028", name: "Sut 1L", category: "Sut mahsulotlari", brand: "Tetra", unit: "dona", costPrice: 9000, sellPrice: 12000, stock: 60, minStock: 15 },
  { id: "p3", barcode: "4780001000035", name: "Tuxum (10 dona)", category: "Tuxum", brand: "Fermer", unit: "quti", costPrice: 18000, sellPrice: 24000, stock: 40, minStock: 10 },
  { id: "p4", barcode: "4780001000042", name: "Makaron 500g", category: "Bakaleya", brand: "Makfa", unit: "dona", costPrice: 8000, sellPrice: 11000, stock: 80, minStock: 20 },
  { id: "p5", barcode: "4780001000059", name: "O'simlik yog'i 1L", category: "Yog'lar", brand: "Oltin Don", unit: "dona", costPrice: 17000, sellPrice: 22000, stock: 50, minStock: 10 },
  { id: "p6", barcode: "4780001000066", name: "Coca-Cola 1.5L", category: "Ichimliklar", brand: "Coca-Cola", unit: "dona", costPrice: 9000, sellPrice: 13000, stock: 90, minStock: 24 },
  { id: "p7", barcode: "4780001000073", name: "Choy (qora) 100g", category: "Bakaleya", brand: "Tess", unit: "dona", costPrice: 12000, sellPrice: 17000, stock: 35, minStock: 10 },
  { id: "p8", barcode: "4780001000080", name: "Shakar 1kg", category: "Bakaleya", brand: "Mahalliy", unit: "kg", costPrice: 9000, sellPrice: 12000, stock: 100, minStock: 25 },
  { id: "p9", barcode: "4780001000097", name: "Tovuq go'shti 1kg", category: "Go'sht mahsulotlari", brand: "Fermer", unit: "kg", costPrice: 28000, sellPrice: 36000, stock: 8, minStock: 10 },
  { id: "p10", barcode: "4780001000103", name: "Yogurt 500g", category: "Sut mahsulotlari", brand: "Efe", unit: "dona", costPrice: 8000, sellPrice: 11000, stock: 5, minStock: 12 },
];

const employees: Employee[] = [
  { id: "e1", fullName: "Olim Karimov", birthDate: "1985-03-12", phone: "+998901112233", address: "Toshkent, Chilonzor", position: "Direktor", hireDate: "2021-01-10", salary: 12000000, status: "active" },
  { id: "e2", fullName: "Madina Yusupova", birthDate: "1996-07-22", phone: "+998901112244", address: "Toshkent, Yunusobod", position: "Kassir", hireDate: "2022-04-01", salary: 4500000, status: "active" },
  { id: "e3", fullName: "Sardor Tojiyev", birthDate: "1992-11-05", phone: "+998901112255", address: "Toshkent, Sergeli", position: "Omborchi", hireDate: "2021-09-15", salary: 5000000, status: "active" },
  { id: "e4", fullName: "Nilufar Rashidova", birthDate: "1990-02-18", phone: "+998901112266", address: "Toshkent, Mirzo Ulug'bek", position: "Buxgalter", hireDate: "2020-06-01", salary: 6000000, status: "active" },
  { id: "e5", fullName: "Jasur Ergashev", birthDate: "1998-05-30", phone: "+998901112277", address: "Toshkent, Olmazor", position: "Kassir", hireDate: "2023-02-20", salary: 4200000, status: "active" },
];

const today = new Date().toISOString().slice(0, 10);

const attendance: AttendanceRecord[] = [
  { id: "a1", employeeId: "e1", date: today, checkIn: "09:00", checkOut: "18:00", late: false, status: "ishda" },
  { id: "a2", employeeId: "e2", date: today, checkIn: "08:55", checkOut: null, late: false, status: "ishda" },
  { id: "a3", employeeId: "e3", date: today, checkIn: "09:20", checkOut: null, late: true, status: "ishda" },
  { id: "a4", employeeId: "e4", date: today, checkIn: "09:05", checkOut: "17:30", late: false, status: "ishda" },
  { id: "a5", employeeId: "e5", date: today, checkIn: null, checkOut: null, late: false, status: "dam olish" },
];

const partners: Partner[] = [
  {
    id: "pt1",
    companyName: "Aroma Foods MChJ",
    phone: "+998712001122",
    address: "Toshkent sh., Sergeli tumani",
    taxId: "302456789",
    bankDetails: "Hamkorbank, 2020 8000 XXXX 1234",
    transactions: [
      { date: "2026-05-02", productsDelivered: "Non, Sut, Yogurt", qty: 200, total: 4200000, paid: 4200000 },
      { date: "2026-06-01", productsDelivered: "Sut, Yogurt", qty: 150, total: 1950000, paid: 1500000 },
    ],
  },
  {
    id: "pt2",
    companyName: "Makfa Distribution",
    phone: "+998712003344",
    address: "Toshkent sh., Mirzo Ulug'bek tumani",
    taxId: "301122334",
    bankDetails: "Ipoteka bank, 2020 8000 XXXX 5678",
    transactions: [
      { date: "2026-05-10", productsDelivered: "Makaron, Shakar", qty: 300, total: 5100000, paid: 5100000 },
    ],
  },
  {
    id: "pt3",
    companyName: "Fermer Agro",
    phone: "+998712005566",
    address: "Toshkent viloyati, Qibray",
    taxId: "304556677",
    bankDetails: "Xalq banki, 2020 8000 XXXX 9012",
    transactions: [
      { date: "2026-06-05", productsDelivered: "Tuxum, Tovuq go'shti", qty: 80, total: 2880000, paid: 2000000 },
    ],
  },
];

const customers: Customer[] = [
  { id: "c1", fullName: "Shahnoza Aliyeva", phone: "+998909991122", bonusCardPercent: 5, discount: 5, debt: 0, purchaseHistory: [{ date: "2026-06-01", total: 150000 }, { date: "2026-06-08", total: 95000 }] },
  { id: "c2", fullName: "Bekzod Niyozov", phone: "+998909992233", bonusCardPercent: 3, discount: 3, debt: 120000, purchaseHistory: [{ date: "2026-05-28", total: 320000 }] },
  { id: "c3", fullName: "Gulnoza Sodiqova", phone: "+998909993344", bonusCardPercent: 0, discount: 0, debt: 0, purchaseHistory: [{ date: "2026-06-10", total: 60000 }] },
];

const expenses: Expense[] = [
  { id: "ex1", date: "2026-06-01", category: "Ijara", amount: 8000000, note: "Iyun oyi ijara to'lovi" },
  { id: "ex2", date: "2026-06-02", category: "Elektr", amount: 1200000, note: "Elektr energiyasi" },
  { id: "ex3", date: "2026-06-02", category: "Suv", amount: 250000, note: "Suv ta'minoti" },
  { id: "ex4", date: "2026-06-03", category: "Internet", amount: 400000, note: "Ofis internet" },
  { id: "ex5", date: "2026-06-05", category: "Soliq", amount: 3500000, note: "Oylik soliq to'lovi" },
  { id: "ex6", date: "2026-06-10", category: "Ishchilar oyligi", amount: 31700000, note: "May oyi ish haqi" },
];

const debts: Debt[] = [
  { id: "d1", partyName: "Bekzod Niyozov", type: "receivable", amount: 120000, dueDate: "2026-06-20" },
  { id: "d2", partyName: "Fermer Agro", type: "payable", amount: 880000, dueDate: "2026-06-25" },
];

const activityLog: ActivityLogEntry[] = [
  { id: "log1", timestamp: new Date().toISOString(), user: "admin", action: "Tizimga kirdi" },
  { id: "log2", timestamp: new Date().toISOString(), user: "kassir", action: "Savdo amalga oshirdi" },
  { id: "log3", timestamp: new Date().toISOString(), user: "omborchi", action: "Mahsulot kirimini kiritdi" },
];

export const SUPERMARKET_DATA: AppData = {
  businessType: "supermarket",
  products,
  rawMaterials: [],
  recipes: [],
  employees,
  attendance,
  sales: generateSalesHistory(products, ["Madina Yusupova", "Jasur Ergashev"], 90, 1),
  partners,
  customers,
  expenses,
  debts,
  activityLog,
  balance: { cash: 18500000, bank: 64200000 },
};
