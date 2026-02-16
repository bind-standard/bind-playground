/** Names of definitions that get special field components */
const SPECIAL_TYPES = new Set([
  'Coding',
  'CodeableConcept',
  'Reference',
  'Money',
  'Period',
  'DateTimePeriod',
  'MoneyWithConversion',
  'MultiCurrencyMoney',
  'HumanName',
  'Address',
  'ContactPoint',
  'Attachment',
  'GeoPoint',
  'Identifier',
  'Quantity',
]);

export type SpecialType =
  | 'Coding'
  | 'CodeableConcept'
  | 'Reference'
  | 'Money'
  | 'Period'
  | 'DateTimePeriod'
  | 'HumanName'
  | 'Address'
  | 'ContactPoint'
  | 'Attachment'
  | 'GeoPoint'
  | 'Identifier'
  | 'Quantity'
  | 'MoneyWithConversion'
  | 'MultiCurrencyMoney';

export function isSpecialType(defName: string): defName is SpecialType {
  return SPECIAL_TYPES.has(defName);
}

export function getSpecialType(defName: string): SpecialType | null {
  return isSpecialType(defName) ? defName : null;
}

/** Detect if a $ref string points to a special type */
export function detectSpecialTypeFromRef(ref: string): SpecialType | null {
  if (!ref.startsWith('#/definitions/')) return null;
  const name = ref.replace('#/definitions/', '');
  return getSpecialType(name);
}
