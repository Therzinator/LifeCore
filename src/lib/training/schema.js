export const SCHEMA = {
  A: [
    { id: 'squat', naam: 'Back Squat', sets: 5, reps: 5, type: 'zw', stangType: 'recht', spier: 'Quads, bilspieren, hamstrings' },
    { id: 'bench', naam: 'Bench Press', sets: 5, reps: 5, type: 'li', stangType: 'recht', spier: 'Borst, triceps' },
    { id: 'row', naam: 'Barbell Row', sets: 5, reps: 5, type: 'li', stangType: 'recht', spier: 'Rug, rhomboïden' },
  ],
  B: [
    { id: 'squat', naam: 'Back Squat', sets: 5, reps: 5, type: 'zw', stangType: 'recht', spier: 'Quads, bilspieren, hamstrings' },
    { id: 'ohp', naam: 'Overhead Press', sets: 5, reps: 5, type: 'li', stangType: 'recht', spier: 'Schouders, triceps' },
    { id: 'deadlift', naam: 'Deadlift', sets: 1, reps: 5, type: 'zw', stangType: 'recht', spier: 'Hamstrings, bilspieren, rugstrekkers' },
  ],
};

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
