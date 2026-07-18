// Centrale registratie van modules + hun indeling in categorieën — gedeeld
// door SnelkeuzeScherm (mobiel startscherm) en BottomNav (uitklapbare grid),
// zodat beide dezelfde groepering en labels tonen.

export const MODULES = {
  ochtend: { label: 'Ochtend', subtitel: 'Start je dag met de ochtend-flow' },
  waarden: { label: 'Waarden', subtitel: 'ACT-waarden en dagelijkse reflectie' },
  welzijn: { label: 'Welzijn', subtitel: 'Burn-out check en herstelcheck' },
  mindfulness: { label: 'Mindfulness', subtitel: 'Adem, grounding en ontspanning' },
  training: { label: 'Training', subtitel: 'Volg en start je trainingssessies' },
  cardio: { label: 'Cardio', subtitel: 'Hardlopen, wandelen en roeien loggen' },
  adhd: { label: 'Focus', subtitel: 'Taken, focus-timer en dag afsluiten' },
  werk: { label: 'Werk', subtitel: 'Werktaken en huishouden met spraakinvoer' },
  dashboard: { label: 'Dashboard', subtitel: 'Voortgang over alle modules heen' },
};

// Vaste, platte volgorde — gebruikt door de desktop-zijbalk, die alle
// modules altijd in één lijst toont zonder categorie-koppen.
export const MODULE_VOLGORDE = [
  'ochtend', 'waarden', 'welzijn', 'mindfulness', 'training', 'cardio', 'adhd', 'werk', 'dashboard',
];

export const MODULE_CATEGORIEEN = [
  { id: 'dag', titel: 'Dag & focus', modules: ['ochtend', 'adhd', 'werk'] },
  { id: 'lichaam', titel: 'Lichaam', modules: ['training', 'cardio'] },
  { id: 'geest', titel: 'Rust & geest', modules: ['waarden', 'welzijn', 'mindfulness'] },
  { id: 'overzicht', titel: 'Overzicht', modules: ['dashboard'] },
];
