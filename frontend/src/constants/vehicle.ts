export const VEHICLE_BRANDS = [
  'Hero',
  'Honda',
  'Bajaj',
  'TVS',
  'Yamaha',
  'Royal Enfield',
  'Suzuki',
  'KTM',
  'Other',
];

export const VEHICLE_YEARS = Array.from(
  { length: 20 },
  (_, index) => String(new Date().getFullYear() - index),
);