// Geïnspireerd op Sonnentag & Fritz' Recovery Experience Questionnaire
// (2007) — onthechting, ontspanning, mastery en controle. Eigen bewoording,
// geen letterlijke afname van de REQ — zie onderbouwing.js. Herformuleerd
// naar 'de afgelopen twee weken' (was 'vandaag') zodat dit samen met de
// CBI-vragen als één tweewekelijkse check afgenomen kan worden.
export const REQ_DIMENSIES = [
  {
    id: 'onthechting',
    label: 'Onthechting',
    richting: 'positief',
    sectie: 'herstel',
    items: [
      'De afgelopen twee weken lukte het me om werk mentaal los te laten in mijn vrije tijd.',
      'De afgelopen twee weken merkte ik dat ik \'s avonds niet meer actief nadacht over werk.',
    ],
  },
  {
    id: 'ontspanning',
    label: 'Ontspanning',
    richting: 'positief',
    sectie: 'herstel',
    items: [
      'De afgelopen twee weken had ik geregeld momenten waarop ik echt ontspannen was.',
      'De afgelopen twee weken voelde mijn lichaam op meerdere momenten rustig aan.',
    ],
  },
  {
    id: 'mastery',
    label: 'Mastery',
    richting: 'positief',
    sectie: 'herstel',
    items: [
      'De afgelopen twee weken deed ik dingen waar ik nieuwe energie van kreeg.',
      'De afgelopen twee weken leerde of oefende ik iets nieuws.',
    ],
  },
  {
    id: 'controle',
    label: 'Controle',
    richting: 'positief',
    sectie: 'herstel',
    items: [
      'De afgelopen twee weken had ik het gevoel zelf te kunnen kiezen wat ik deed in mijn vrije tijd.',
      'De afgelopen twee weken voelde ik me niet opgejaagd door verplichtingen in mijn vrije tijd.',
    ],
  },
];
