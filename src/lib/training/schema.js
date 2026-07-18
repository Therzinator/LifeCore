export const SCHEMA = {
  A: [
    { id: 'squat', naam: 'Back Squat', sets: 5, reps: 5, stangType: 'recht', spier: 'Quads, bilspieren, hamstrings' },
    { id: 'bench', naam: 'Bench Press', sets: 5, reps: 5, stangType: 'recht', spier: 'Borst, triceps' },
    { id: 'row', naam: 'Barbell Row', sets: 5, reps: 5, stangType: 'recht', spier: 'Rug, rhomboïden' },
  ],
  B: [
    { id: 'squat', naam: 'Back Squat', sets: 5, reps: 5, stangType: 'recht', spier: 'Quads, bilspieren, hamstrings' },
    { id: 'ohp', naam: 'Overhead Press', sets: 5, reps: 5, stangType: 'recht', spier: 'Schouders, triceps' },
    { id: 'deadlift', naam: 'Deadlift', sets: 1, reps: 5, stangType: 'recht', spier: 'Hamstrings, bilspieren, rugstrekkers' },
  ],
};

export const PROFIELEN = {
  licht: { squat: 20, bench: 20, ohp: 15, deadlift: 30, row: 20 },
  midden: { squat: 30, bench: 25, ohp: 20, deadlift: 40, row: 25 },
  zwaar: { squat: 40, bench: 30, ohp: 25, deadlift: 50, row: 30 },
};
