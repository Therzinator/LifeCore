const KG_NAAR_LB = 2.20462;

export function formatGewicht(kg, eenheid) {
  if (kg == null) return '—';
  if (eenheid === 'lb') return `${Math.round(kg * KG_NAAR_LB * 10) / 10}`;
  return `${kg}`;
}

export function eenheidLabel(eenheid) {
  return eenheid === 'lb' ? 'lb' : 'kg';
}
