import { describe, it, expect } from 'vitest';
import { defusieStappen } from '../src/lib/act/defusie.js';

describe('defusieStappen', () => {
  it('geeft lege lijst bij lege of ontbrekende gedachte', () => {
    expect(defusieStappen('')).toEqual([]);
    expect(defusieStappen('   ')).toEqual([]);
    expect(defusieStappen(undefined)).toEqual([]);
  });

  it('geeft drie stappen bij een geldige gedachte', () => {
    const stappen = defusieStappen('Ik ga dit niet redden');
    expect(stappen).toHaveLength(3);
    expect(stappen[0].tekst).toBe('Ik ga dit niet redden');
  });

  it('herformuleert met verlaagde beginletter in stap 2 en 3', () => {
    const stappen = defusieStappen('Ik ga dit niet redden.');
    expect(stappen[1].tekst).toBe('Ik heb de gedachte dat ik ga dit niet redden.');
    expect(stappen[2].tekst).toBe('Ik merk dat ik de gedachte heb dat ik ga dit niet redden.');
  });

  it('strippt overtollige leestekens aan het einde', () => {
    const stappen = defusieStappen('Niemand luistert naar mij!!!');
    expect(stappen[1].tekst).toBe('Ik heb de gedachte dat niemand luistert naar mij.');
  });
});
