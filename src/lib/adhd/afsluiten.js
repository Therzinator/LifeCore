export const SHUTDOWN_ITEMS = [
  'Mail/berichten gesloten — geen nieuwe checks vanavond',
  'Openstaande taken verplaatst naar morgen of het klusboek',
  'Werkomgeving opgeruimd — bureau/laptop afgesloten',
  "Morgen's prioriteit is bepaald en geparkeerd",
];

const STEMMING_REACTIE = {
  slecht: 'Dat mag. Niet elke dag is geweldig — morgen is nieuw.',
  matig: 'Matige dag — kijk wat je kon afvinken. Dat telt ook.',
  ok: 'Oké dag. Wat je gedaan hebt is genoeg.',
  goed: 'Goede dag. Je hebt goed gewerkt vandaag.',
  top: 'Sterke dag. Hoge energie goed benut — noteer wat werkte.',
};

export function stemmingReactie(niveau) {
  return STEMMING_REACTIE[niveau] ?? null;
}
