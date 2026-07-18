// Geïnspireerd op de Copenhagen Burnout Inventory (Kristensen, Borritz,
// Villadsen & Christensen, 2005) — persoonlijke + werkgerelateerde
// uitputting. De cliëntgerelateerde subschaal is bewust weggelaten (niet
// van toepassing zonder cliëntcontact). Eigen bewoording, geen letterlijke
// afname van de CBI — zie onderbouwing.js voor de volledige toelichting.
export const CBI_SUBSCHALEN = [
  {
    id: 'persoonlijk',
    label: 'Persoonlijke uitputting',
    richting: 'negatief',
    sectie: 'burnout',
    items: [
      'De afgelopen twee weken voelde ik me lichamelijk uitgeput.',
      'De afgelopen twee weken voelde ik me emotioneel leeg.',
      'De afgelopen twee weken had ik het gevoel dat ik mezelf moest voortslepen.',
      'De afgelopen twee weken voelde ik me kwetsbaar, alsof ik makkelijk ziek zou worden.',
      'De afgelopen twee weken vroeg ik me af hoe lang ik dit nog volhoud.',
    ],
  },
  {
    id: 'werk',
    label: 'Werkgerelateerde uitputting',
    richting: 'negatief',
    sectie: 'burnout',
    items: [
      'De afgelopen twee weken voelde mijn werk uitputtend.',
      'De afgelopen twee weken was ik na een werkdag helemaal op.',
      'De afgelopen twee weken had ik na het werk geen energie meer over voor mezelf of anderen.',
      'De afgelopen twee weken voelde ik me gefrustreerd door mijn werk.',
      'De afgelopen twee weken vroeg ik me af of de moeite die werk kost het nog waard is.',
    ],
  },
];
