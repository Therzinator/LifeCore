const ONDERBOUWING = {
  ademhaling446: {
    titel: 'Waarom 4-4-6 ademhaling?',
    tekst:
      'Een langere uitademing dan inademing (hier 6 tegenover 4 seconden) activeert de ' +
      'nervus vagus en verschuift je autonome zenuwstelsel richting de parasympathische ' +
      '"rust-en-herstel"-modus. Dat verlaagt hartslag merkbaar binnen enkele cycli, zonder ' +
      'dat je iets anders hoeft te doen dan ademen. Uitademingsgerichte patronen geven een ' +
      'sneller kalmerend effect dan gelijkverdeelde patronen zoals box breathing.',
    bron: 'Zaccaro et al. (2018), Frontiers in Human Neuroscience — effecten van langzame ademhaling op het autonome zenuwstelsel.',
  },
  brainDump: {
    titel: 'Waarom een brain dump werkt',
    tekst:
      'Onafgemaakte taken en losse gedachten blijven actief in je werkgeheugen tot ze ergens ' +
      '"geparkeerd" zijn — het Zeigarnik-effect. Door alles vrij op te schrijven vóórdat je gaat ' +
      'prioriteren, ontlast je je werkgeheugen zonder dat er iets verloren gaat: het staat al ' +
      'ergens. Dat maakt ruimte vrij om daarna bewust te kiezen wat je aandacht verdient.',
    bron: 'Zeigarnik (1927); Masicampo & Baumeister (2011) over het effect van plannen op onafgemaakte taken.',
  },
  waardenACT: {
    titel: 'Waarom waarden verhelderen helpt',
    tekst:
      'Waarden zijn geen doelen die je "af" kunt vinken, maar een richting — een kompas voor ' +
      'wat je belangrijk vindt. Onderzoek binnen Acceptance and Commitment Therapy (ACT) laat ' +
      'zien dat het expliciet maken van je waarden en er kleine, dagelijkse keuzes op baseren ' +
      'samenhangt met meer welbevinden, ook op momenten dat het lastig of vermoeiend is. Het gaat ' +
      'niet om prestatie, maar om richting: je hoeft een waarde nooit "voltooid" te hebben.',
    bron: 'Hayes, Strosahl & Wilson (2012), Acceptance and Commitment Therapy: The Process and Practice of Mindful Change.',
  },
  defusieACT: {
    titel: 'Waarom cognitieve defusie werkt',
    tekst:
      'Een lastige gedachte voelt vaak als een feit, terwijl het een mentale gebeurtenis is die ' +
      'voorbijgaat. Door een gedachte te herformuleren — van "dit is zo" naar "ik heb de gedachte ' +
      'dat…" — neem je er letterlijk een stapje afstand van. Onderzoek naar cognitieve defusie ' +
      'laat zien dat deze korte herformulering de geloofwaardigheid en impact van de gedachte kan ' +
      'verminderen, zonder dat je hoeft te vechten tegen de gedachte zelf.',
    bron: 'Masuda et al. (2004); Hayes et al. (2006) meta-analyse over ACT-processen.',
  },
  mbiGS: {
    titel: 'Waarom deze vragen (burn-out)',
    tekst:
      'Deze check is geïnspireerd op de Maslach Burnout Inventory – General Survey (MBI-GS), die ' +
      'burn-out beschrijft langs drie dimensies: uitputting, cynisme/distantie en (verminderde) ' +
      'effectiviteit. Dit is geen medisch instrument en geen letterlijke afname van de MBI-GS — ' +
      'de vragen zijn eigen bewoordingen langs dezelfde dimensies, bedoeld als persoonlijk ' +
      'hulpmiddel om patronen bij jezelf op te merken, niet om te diagnosticeren.',
    bron: 'Maslach & Jackson (1981); Schaufeli et al. (1996), Maslach Burnout Inventory – General Survey.',
  },
  reqHerstel: {
    titel: 'Waarom deze vragen (herstel)',
    tekst:
      'Deze check is geïnspireerd op Sonnentag & Fritz\' Recovery Experience Questionnaire (REQ), ' +
      'dat herstel van vermoeidheid beschrijft langs vier dimensies: onthechting, ontspanning, ' +
      'mastery en controle. Dit zijn eigen bewoordingen langs dezelfde dimensies, geen letterlijke ' +
      'afname van de REQ — een persoonlijk hulpmiddel, geen gevalideerd meetinstrument.',
    bron: 'Sonnentag & Fritz (2007), The Recovery Experience Questionnaire.',
  },
  ademMeditatie: {
    titel: 'Waarom ademmeditatie werkt',
    tekst:
      'Aandacht bewust bij je adem houden — zonder het ritme te forceren — is de kern van ' +
      'mindfulness-meditatie. Onderzoek naar kortdurende mindfulness-training laat zien dat het ' +
      'herhaaldelijk terugbrengen van je aandacht naar dit moment, in plaats van naar rondmalende ' +
      'gedachten, stressgevoelens en piekeren kan verminderen — vooral bij regelmatige oefening.',
    bron: 'Zeidan et al. (2010); Kabat-Zinn, Mindfulness-Based Stress Reduction (MBSR).',
  },
  grounding54321: {
    titel: 'Waarom 5-4-3-2-1 grounding werkt',
    tekst:
      'Deze oefening leidt je aandacht van piekerende gedachten naar concrete zintuiglijke ' +
      'waarnemingen in het hier en nu. Deze vorm van sensorische grounding wordt binnen ACT en DBT ' +
      'gebruikt om overweldiging, paniek of dissociatie te doorbreken — niet door de gedachte te ' +
      'bestrijden, maar door je aandacht ergens anders naartoe te verleggen.',
    bron: 'Grounding-technieken uit Dialectical Behavior Therapy (Linehan, 1993) en ACT.',
  },
  pmrSpierontspanning: {
    titel: 'Waarom progressieve spierontspanning werkt',
    tekst:
      'Bij PMR span je bewust een spiergroep aan en laat je die daarna volledig los. Dat contrast ' +
      'maakt het makkelijker om de ontspannen toestand te herkennen en op te roepen dan wanneer je ' +
      'meteen probeert te "ontspannen". Onderzoek laat consistent een verlagend effect zien op ' +
      'zowel spierspanning als ervaren angst.',
    bron: 'Jacobson (1938), Progressive Relaxation; Manzoni et al. (2008) meta-analyse.',
  },
};

export function onderbouwing(sleutel) {
  return ONDERBOUWING[sleutel] ?? null;
}
