const ITEM_CATEGORIES = [
  'ID / Access',
  'Accessories',
  'Personal Belongings',
  'Jewellery',
  'Stationery',
  'Other',
] as const;

export function getItemCategories() {
  return ITEM_CATEGORIES;
}
