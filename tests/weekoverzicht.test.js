import { describe, it, expect } from 'vitest';
import { bepaalWeekoverzicht, LIFT_DAGEN, CARDIO_DAGEN } from '../src/lib/dagstructuur/weekoverzicht.js';

function maandagDezeWeek() {
  const d = new Date();
  const dag = d.getDay() || 7;
  d.setDate(d.getDate() - (dag - 1));
  return d;
}

function isoOpDagIndex(index) {
  const d = maandagDezeWeek();
  d.setDate(d.getDate() + index);
  return d.toISOString();
}

describe('bepaalWeekoverzicht', () => {
  it('geeft 7 dagen terug met het juiste type per dag', () => {
    const dagen = bepaalWeekoverzicht([], {});
    expect(dagen).toHaveLength(7);
    dagen.forEach((dag, i) => {
      const verwacht = LIFT_DAGEN.includes(i) ? 'lift' : CARDIO_DAGEN.includes(i) ? 'cardio' : 'rust';
      expect(dag.type).toBe(verwacht);
    });
  });

  it('markeert een liftdag als gedaan als er deze week een training was op die dag', () => {
    const sessies = [{ datum: isoOpDagIndex(0) }]; // maandag
    const dagen = bepaalWeekoverzicht(sessies, {});
    expect(dagen[0].gedaan).toBe(true);
    expect(dagen[2].gedaan).toBe(false); // woensdag, geen sessie
  });

  it('markeert een cardiodag als gedaan als er een activiteit is afgevinkt', () => {
    const dinsdagIso = isoOpDagIndex(1).slice(0, 10);
    const cardioDagen = { [dinsdagIso]: { hardlopen: true } };
    const dagen = bepaalWeekoverzicht([], cardioDagen);
    expect(dagen[1].gedaan).toBe(true);
  });

  it('rustdag (zondag) heeft altijd gedaan = null', () => {
    const dagen = bepaalWeekoverzicht([], {});
    expect(dagen[6].type).toBe('rust');
    expect(dagen[6].gedaan).toBeNull();
  });

  it('negeert sessies/activiteiten van vorige weken', () => {
    const oudeMaandag = new Date(maandagDezeWeek());
    oudeMaandag.setDate(oudeMaandag.getDate() - 14);
    const sessies = [{ datum: oudeMaandag.toISOString() }];
    const dagen = bepaalWeekoverzicht(sessies, {});
    expect(dagen[0].gedaan).toBe(false);
  });
});
