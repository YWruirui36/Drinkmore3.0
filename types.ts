
export enum SugarLevel {
  FULL = '正常甜 (100%)',
  LESS = '少糖 (70%)',
  HALF = '半糖 (50%)',
  MICRO = '微糖 (30%)',
  ONE_PERCENT = '一分糖 (10%)',
  NONE = '無糖 (0%)',
  CUSTOM = '自定義 %'
}

export enum IceLevel {
  REGULAR = '正常冰',
  LESS = '少冰',
  MICRO = '微冰',
  NONE = '去冰',
  TOTAL_NONE = '完全去冰',
  WARM = '溫',
  HOT = '熱'
}

export enum DrinkSize {
  SMALL = '小杯 (S)',
  MEDIUM = '中杯 (M)',
  LARGE = '大杯 (L)',
  BOTTLE = '瓶裝 (XL)'
}

export interface DrinkRecord {
  id: string;
  timestamp: number;
  brand: string;
  itemName: string;
  size: DrinkSize;
  sugar: string;
  customSugarPercent?: number;
  ice: IceLevel;
  toppings: string[];
  moodScore: number;
  price: number;
  notes?: string;
  // Added estimatedCalories property to fix TypeScript errors in components accessing this field
  estimatedCalories?: number;
}
