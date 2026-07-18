// Oldambt-modus wisselt alleen labels/terminologie in de Werk-module —
// geen echte koppeling met een extern systeem van de gemeente, puur
// weergave zodat de module aansluit bij die specifieke werkcontext.
export function werkLabels(oldambtModus) {
  if (oldambtModus) {
    return {
      titel: 'Werktaken — Gemeente Oldambt',
      placeholder: 'bijv. vergunning behandelen, raadsvraag beantwoorden, overleg voorbereiden...',
    };
  }
  return {
    titel: 'Werktaken',
    placeholder: 'bijv. mail beantwoorden, vergadering voorbereiden...',
  };
}
