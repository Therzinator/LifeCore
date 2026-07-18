export const SCHEMA = {
  A: [
    { id: 'squat', naam: 'Back Squat', sets: 5, reps: 5, type: 'zw', stangType: 'recht', spier: 'Quads, bilspieren, hamstrings', increment: 2.5 },
    { id: 'bench', naam: 'Bench Press', sets: 5, reps: 5, type: 'li', stangType: 'recht', spier: 'Borst, triceps', increment: 2.5 },
    { id: 'row', naam: 'Barbell Row', sets: 5, reps: 5, type: 'li', stangType: 'recht', spier: 'Rug, rhomboïden', increment: 2.5 },
  ],
  B: [
    { id: 'squat', naam: 'Back Squat', sets: 5, reps: 5, type: 'zw', stangType: 'recht', spier: 'Quads, bilspieren, hamstrings', increment: 2.5 },
    { id: 'ohp', naam: 'Overhead Press', sets: 5, reps: 5, type: 'li', stangType: 'recht', spier: 'Schouders, triceps', increment: 2.5 },
    { id: 'deadlift', naam: 'Deadlift', sets: 1, reps: 5, type: 'zw', stangType: 'recht', spier: 'Hamstrings, bilspieren, rugstrekkers', increment: 5 },
  ],
};

// Bibliotheek van veelgebruikte oefeningen om Training A/B mee te bewerken —
// vergelijkbaar met het wisselen van oefeningen in de StrongLifts-app. Naast
// deze presets kan de gebruiker ook een volledig eigen oefening invullen.
export const OEFENINGEN_BIBLIOTHEEK = [
  { categorie: 'Squat', id: 'squat', naam: 'Back Squat', sets: 5, reps: 5, type: 'zw', stangType: 'recht', spier: 'Quads, bilspieren, hamstrings', increment: 2.5 },
  { categorie: 'Squat', id: 'front-squat', naam: 'Front Squat', sets: 5, reps: 5, type: 'zw', stangType: 'recht', spier: 'Quads, core', increment: 2.5 },
  { categorie: 'Squat', id: 'goblet-squat', naam: 'Goblet Squat', sets: 4, reps: 10, type: 'li', stangType: 'recht', spier: 'Quads, bilspieren', increment: 2.5 },
  { categorie: 'Borst', id: 'bench', naam: 'Bench Press', sets: 5, reps: 5, type: 'li', stangType: 'recht', spier: 'Borst, triceps', increment: 2.5 },
  { categorie: 'Borst', id: 'incline-bench', naam: 'Incline Bench Press', sets: 5, reps: 5, type: 'li', stangType: 'recht', spier: 'Bovenborst, schouders', increment: 2.5 },
  { categorie: 'Borst', id: 'close-grip-bench', naam: 'Close-Grip Bench Press', sets: 5, reps: 5, type: 'li', stangType: 'recht', spier: 'Triceps, borst', increment: 2.5 },
  { categorie: 'Rug', id: 'row', naam: 'Barbell Row', sets: 5, reps: 5, type: 'li', stangType: 'recht', spier: 'Rug, rhomboïden', increment: 2.5 },
  { categorie: 'Rug', id: 'pendlay-row', naam: 'Pendlay Row', sets: 5, reps: 5, type: 'li', stangType: 'recht', spier: 'Rug, lats', increment: 2.5 },
  { categorie: 'Schouders', id: 'ohp', naam: 'Overhead Press', sets: 5, reps: 5, type: 'li', stangType: 'recht', spier: 'Schouders, triceps', increment: 2.5 },
  { categorie: 'Schouders', id: 'push-press', naam: 'Push Press', sets: 5, reps: 5, type: 'zw', stangType: 'recht', spier: 'Schouders, benen', increment: 2.5 },
  { categorie: 'Deadlift', id: 'deadlift', naam: 'Deadlift', sets: 1, reps: 5, type: 'zw', stangType: 'recht', spier: 'Hamstrings, bilspieren, rugstrekkers', increment: 5 },
  { categorie: 'Deadlift', id: 'romanian-deadlift', naam: 'Romanian Deadlift', sets: 3, reps: 8, type: 'zw', stangType: 'recht', spier: 'Hamstrings, bilspieren', increment: 2.5 },
  { categorie: 'Deadlift', id: 'sumo-deadlift', naam: 'Sumo Deadlift', sets: 1, reps: 5, type: 'zw', stangType: 'recht', spier: 'Bilspieren, binnenkant bovenbeen', increment: 5 },
];

export const PROFIELEN = {
  licht: { squat: 30, bench: 17.5, ohp: 15, deadlift: 45, row: 20 },
  midden: { squat: 45, bench: 27.5, ohp: 22.5, deadlift: 60, row: 32.5 },
  zwaar: { squat: 60, bench: 40, ohp: 30, deadlift: 80, row: 45 },
};

// Thuis uitvoerbare accessoire-oefeningen — per trainingsletter en push/pull-groep.
// Geen opbouwsets, standaard 3×10, gewicht wordt onthouden vanuit de geschiedenis.
export const EXTRA = {
  'A-push': [
    { id: 'floor-press', naam: 'Dumbbell Floor Press', spier: 'Pecs, triceps', equip: '2× dumbbell' },
    { id: 'chest-flye', naam: 'Chest Flye (vloer)', spier: 'Pecs', equip: '2× dumbbell' },
    { id: 'closegrip-fp', naam: 'Close-Grip Floor Press', spier: 'Triceps, pecs', equip: 'Barbell' },
    { id: 'diamond-pu', naam: 'Diamond Push-ups', spier: 'Triceps, pecs', equip: 'Lichaamsgewicht' },
  ],
  'A-pull': [
    { id: 'chin-ups', naam: 'Chin-ups', spier: 'Lats, biceps', equip: 'Pull-up stang' },
    { id: 'inv-row', naam: 'Inverted Rows (tafel)', spier: 'Rug, biceps', equip: 'Stevige tafel' },
    { id: 'db-row', naam: 'One-Arm DB Row', spier: 'Lats, rhomboïden', equip: '1× dumbbell' },
    { id: 'rear-delt', naam: 'Rear Delt Fly', spier: 'Achterste deltavormige', equip: '2× dumbbell' },
    { id: 'bicep-curl', naam: 'Barbell Bicep Curl', spier: 'Biceps', equip: 'Barbell' },
  ],
  'B-push': [
    { id: 'lat-raise', naam: 'Lateral Raise', spier: 'Middelste deltavormige', equip: '2× dumbbell' },
    { id: 'front-raise', naam: 'Front Raise', spier: 'Voorste deltavormige', equip: '2× dumbbell' },
    { id: 'arnold-press', naam: 'Arnold Press (vloer)', spier: 'Deltavormige', equip: '2× dumbbell' },
    { id: 'skull-crusher', naam: 'Skull Crushers', spier: 'Triceps', equip: 'Barbell' },
  ],
  'B-pull': [
    { id: 'rdl', naam: 'Romanian Deadlift', spier: 'Hamstrings, bilspieren', equip: 'Barbell' },
    { id: 'good-morning', naam: 'Good Mornings', spier: 'Hamstrings, rugstrekkers', equip: 'Barbell' },
    { id: 'shrugs', naam: 'Barbell Shrugs', spier: 'Trapezius', equip: 'Barbell' },
    { id: 'superman', naam: 'Superman Hold', spier: 'Rugstrekkers', equip: 'Lichaamsgewicht' },
  ],
};

export function extraGroepenVoorLetter(letter) {
  return letter === 'A' ? ['A-push', 'A-pull'] : ['B-push', 'B-pull'];
}

export function alleExtraOefeningen() {
  return Object.values(EXTRA).flat();
}

// Laatst gebruikte gewicht voor een accessoire-oefening — anders een veilig begingewicht.
export function haalExtraGewicht(id, sessies) {
  for (let i = sessies.length - 1; i >= 0; i--) {
    const gevonden = (sessies[i].extraOefeningen || []).find((x) => x.id === id);
    if (gevonden?.gewicht) return gevonden.gewicht;
  }
  return 10;
}
