import { BusinessType } from "./types";

export interface Labels {
  productNoun: string;
  productNounPlural: string;
  warehouseName: string;
  posTitle: string;
  hasRawMaterials: boolean;
  hasRecipes: boolean;
  hasExpiry: boolean;
  hasPrescription: boolean;
}

export const LABELS: Record<BusinessType, Labels> = {
  supermarket: {
    productNoun: "Mahsulot",
    productNounPlural: "Mahsulotlar",
    warehouseName: "Ombor",
    posTitle: "Savdo",
    hasRawMaterials: false,
    hasRecipes: false,
    hasExpiry: false,
    hasPrescription: false,
  },
  pharmacy: {
    productNoun: "Dori",
    productNounPlural: "Dorilar",
    warehouseName: "Dorixona ombori",
    posTitle: "Savdo",
    hasRawMaterials: false,
    hasRecipes: false,
    hasExpiry: true,
    hasPrescription: true,
  },
  restaurant: {
    productNoun: "Taom",
    productNounPlural: "Taomlar",
    warehouseName: "Oshxona ombori",
    posTitle: "Buyurtma",
    hasRawMaterials: true,
    hasRecipes: true,
    hasExpiry: false,
    hasPrescription: false,
  },
};

export const BUSINESS_TYPE_NAMES: Record<BusinessType, string> = {
  supermarket: "Supermarket",
  pharmacy: "Apteka",
  restaurant: "Milliy taomlar",
};
