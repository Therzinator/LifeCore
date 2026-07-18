import { describe, it, expect } from 'vitest';
import { vindFedAfbeelding } from './fedMatcher.js';

describe('vindFedAfbeelding', () => {
  it('vindt een exacte match', () => {
    expect(vindFedAfbeelding('Goblet Squat')).toBe(
      'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Goblet_Squat/0.jpg'
    );
  });

  it('vindt een fuzzy match boven de drempel', () => {
    expect(vindFedAfbeelding('Front Squat')).toContain('Front_Barbell_Squat');
  });

  it('normaliseert diakritische tekens', () => {
    expect(vindFedAfbeelding('Gôblèt Squât')).toContain('Goblet_Squat');
  });

  it('geeft null voor iets dat niet bestaat', () => {
    expect(vindFedAfbeelding('Volledig Verzonnen Onbestaande Oefening Xyz')).toBeNull();
  });

  it('geeft null voor lege input', () => {
    expect(vindFedAfbeelding('')).toBeNull();
  });
});
