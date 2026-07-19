// Meegeleverde bibliotheek gerechten — statisch, geen database (zie
// migratie 0015 voor de reden). Samengesteld volgens het gestelde profiel:
// koolhydraatarm, geen varkensvlees, voorkeur kip/rund, vis/schaaldieren
// incidenteel (vaak duurder), airfryer-gerechten waar het kan (gemak).
// Zelfde 3-categorieën-vorm (ingredienten/optioneel/kruiden) als het
// aangeleverde voorbeeld ("Kip wraps", door de gebruiker zelf handmatig
// in te voeren — bewust niet hier gedupliceerd). `bereiding` is een korte
// kookinstructie, getoond als ingeklapt gedeelte bovenaan het gerecht.
//
// `id` is stabiel (curated_<slug>) zodat 'm ooit hernummeren geen
// bestaande referenties breekt; curated gerechten zijn read-only in de UI
// — wijzigen kan alleen door 'm te dupliceren naar een eigen gerecht.

export const CURATED_GERECHTEN = [
  {
    id: 'curated_airfryer_kipdij_broccoli',
    naam: 'Airfryer kipdijfilet met broccoli',
    bereiding: 'Kipdijfilets kruiden en 20 min op 180°C. Broccoli met olijfolie erbij de laatste 12 min.',
    ingredienten: ['4 kipdijfilets', '1 broccoli', 'Olijfolie'],
    optioneel: ['Geraspte parmezaan', 'Citroen'],
    kruiden: ['Paprikapoeder', 'Knoflookpoeder', 'Peper', 'Zout'],
  },
  {
    id: 'curated_rundergehaktballen_courgette',
    naam: 'Gehaktballen (rund) met courgette-noedels',
    bereiding: 'Gehaktballen rollen, kruiden en bakken. Ui en tomatenblokjes toevoegen, 10 min laten sudderen. Courgette met een spiraalsnijder/dunschiller tot noedels, kort meebakken.',
    ingredienten: ['500 gr rundergehakt', '2 courgettes', '1 ui', '1 blik tomatenblokjes'],
    optioneel: ['Geraspte parmezaan', 'Verse basilicum'],
    kruiden: ['Italiaanse kruidenmix', 'Knoflookpoeder', 'Peper', 'Zout'],
  },
  {
    id: 'curated_airfryer_zalm_sperziebonen',
    naam: 'Airfryer zalmfilet met sperziebonen',
    bereiding: 'Zalm kruiden en 10-12 min op 180°C. Sperziebonen met olijfolie de laatste 8 min erbij.',
    ingredienten: ['2 zalmfilets', '300 gr sperziebonen', 'Olijfolie'],
    optioneel: ['Amandelschaafsel', 'Citroen'],
    kruiden: ['Peper', 'Zout', 'Knoflookpoeder'],
  },
  {
    id: 'curated_kip_currysoep',
    naam: 'Kip-currysoep met kokosmelk',
    bereiding: 'Ui en paprika aanfruiten, kip toevoegen en aanbakken. Curry kort meebakken, dan kokosmelk en bouillon erbij. 15 min laten sudderen.',
    ingredienten: ['300 gr kipfilet', '1 blik kokosmelk', '1 paprika', '1 ui', 'Groentebouillon'],
    optioneel: ['Verse koriander', 'Limoen'],
    kruiden: ['Currypoeder', 'Gemberpoeder', 'Sambal', 'Zout'],
  },
  {
    id: 'curated_rund_taco_bowl',
    naam: 'Rundergehakt taco-bowl (zonder tortilla)',
    bereiding: 'Gehakt bakken met tacokruiden. Bonen en mais verwarmen. Sla in een kom, gehakt erop, toppings naar smaak.',
    ingredienten: ['400 gr rundergehakt', 'Krop sla', '1 blik zwarte bonen', '1 blik mais', 'Geraspte kaas'],
    optioneel: ['Guacamole', 'Zure room', 'Cherrytomaten'],
    kruiden: ['Tacokruiden', 'Komijn', 'Peper'],
  },
  {
    id: 'curated_airfryer_kippenvleugels',
    naam: 'Airfryer kippenvleugels',
    bereiding: 'Vleugels kruiden en met een scheut olijfolie mengen. 20-25 min op 190°C, halverwege omscheppen.',
    ingredienten: ['1 kg kippenvleugels', 'Olijfolie'],
    optioneel: ['Bladsalade', 'Dipsaus (yoghurt-knoflook)'],
    kruiden: ['Paprikapoeder', 'Knoflookpoeder', 'Peper', 'Zout', 'Cayennepeper'],
  },
  {
    id: 'curated_rund_roerbak_broccoli',
    naam: 'Beef-roerbak met paprika en broccoli',
    bereiding: 'Reepjes rund kort en heet aanbakken in een wok, apart houden. Groenten roerbakken, vlees terug erbij, sojasaus en kruiden erdoor.',
    ingredienten: ['400 gr runderreepjes (biefstuk of bavette)', '1 broccoli', '2 paprika’s', 'Sojasaus (suikervrij)'],
    optioneel: ['Cashewnoten', 'Lente-ui'],
    kruiden: ['Gemberpoeder', 'Knoflookpoeder', 'Sambal', 'Sesamolie'],
  },
  {
    id: 'curated_kip_griekse_salade',
    naam: 'Gegrilde kipfilet met Griekse salade',
    bereiding: 'Kipfilet kruiden en grillen (pan of airfryer, 8-10 min per kant/180°C). Groenten en feta mengen, olijfolie en citroensap erover, kip erbovenop.',
    ingredienten: ['4 kipfilets', 'Komkommer', 'Cherrytomaten', 'Rode ui', 'Feta'],
    optioneel: ['Zwarte olijven', 'Extra olijfolie'],
    kruiden: ['Oregano', 'Peper', 'Zout', 'Citroensap'],
  },
  {
    id: 'curated_bloemkool_gehaktschotel',
    naam: 'Ovenschotel bloemkool met rundergehakt',
    bereiding: 'Bloemkoolroosjes voorkoken (5 min). Gehakt bakken en kruiden. Alles in een ovenschaal, room en kaas erover, 20 min op 200°C.',
    ingredienten: ['1 bloemkool', '400 gr rundergehakt', 'Geraspte kaas', 'Scheut room'],
    optioneel: ['Spinazie', 'Nootmuskaat'],
    kruiden: ['Italiaanse kruidenmix', 'Peper', 'Zout'],
  },
  {
    id: 'curated_airfryer_garnalen_knoflook',
    naam: 'Airfryer garnalen met knoflook (af en toe vis/schaaldieren)',
    bereiding: 'Garnalen en courgette mengen met olijfolie en kruiden. 8-10 min op 180°C, halverwege schudden.',
    ingredienten: ['300 gr garnalen', 'Courgette', 'Olijfolie'],
    optioneel: ['Verse peterselie', 'Citroen'],
    kruiden: ['Knoflookpoeder', 'Chilivlokken', 'Peper', 'Zout'],
  },
  {
    id: 'curated_kip_fajita_bowl',
    naam: 'Kip-fajitabowl',
    bereiding: 'Kipreepjes met fajitakruiden bakken. Paprika en ui meebakken tot zacht. Op een bed van sla serveren met toppings.',
    ingredienten: ['400 gr kipfilet', '2 paprika’s', '1 ui', 'Krop sla'],
    optioneel: ['Guacamole', 'Geraspte kaas', 'Zure room'],
    kruiden: ['Fajitakruiden/tacokruiden', 'Komijn', 'Peper'],
  },
  {
    id: 'curated_rundburgers_portobello',
    naam: 'Runderburgers zonder broodje (portobello als ‘bun’)',
    bereiding: 'Gehakt kruiden en tot burgers vormen, bakken of grillen (4-5 min per kant). Portobello’s apart bakken, kaas laten smelten op de burger, opbouwen met de portobello als ‘broodje’.',
    ingredienten: ['500 gr rundergehakt', '4 grote portobello’s', 'Geraspte kaas'],
    optioneel: ['Bacon (rund/kalkoen, geen varken)', 'Sla en tomaat'],
    kruiden: ['Peper', 'Zout', 'Knoflookpoeder', 'Paprikapoeder'],
  },
  {
    id: 'curated_airfryer_zalm_asperges',
    naam: 'Airfryer zalm met citroen en asperges',
    bereiding: 'Onderkant asperges afbreken. Zalm en asperges kruiden met olijfolie, 10-12 min op 180°C, citroen erover.',
    ingredienten: ['2 zalmfilets', 'Bosje groene asperges', 'Olijfolie'],
    optioneel: ['Amandelschaafsel'],
    kruiden: ['Citroen', 'Peper', 'Zout', 'Knoflookpoeder'],
  },
  {
    id: 'curated_kip_paprika_roerbak',
    naam: 'Kip-paprika roerbak',
    bereiding: 'Kipreepjes aanbakken tot gaar, apart houden. Ui en paprika roerbakken, kip terug erbij, sambal en sojasaus erdoor.',
    ingredienten: ['400 gr kipfilet', '3 paprika’s (verschillende kleuren)', '1 ui'],
    optioneel: ['Cashewnoten', 'Lente-ui'],
    kruiden: ['Kipkruiden', 'Knoflookpoeder', 'Sambal', 'Sojasaus (suikervrij)'],
  },
  {
    id: 'curated_gehakt_spinazie_kaas',
    naam: 'Gehaktschotel (rund) met spinazie en kaas',
    bereiding: 'Gehakt bakken en kruiden. Spinazie erdoor tot geslonken. Room en kaas erdoor tot een romige schotel.',
    ingredienten: ['500 gr rundergehakt', '300 gr spinazie', 'Geraspte kaas', 'Scheut room'],
    optioneel: ['Cherrytomaten', 'Knoflook'],
    kruiden: ['Nootmuskaat', 'Peper', 'Zout', 'Italiaanse kruidenmix'],
  },
  {
    id: 'curated_airfryer_kipspiesjes_tzatziki',
    naam: 'Airfryer kipspiesjes met tzatziki',
    bereiding: 'Kipblokjes kruiden en aan prikkers rijgen. 12-15 min op 180°C, halverwege omdraaien. Komkommer raspen/uitknijpen en door de yoghurt voor tzatziki.',
    ingredienten: ['4 kipfilets in blokjes', 'Satéprikkers', 'Komkommer', 'Griekse yoghurt'],
    optioneel: ['Bladsalade', 'Cherrytomaten'],
    kruiden: ['Kipkruiden', 'Knoflookpoeder', 'Munt', 'Peper', 'Zout'],
  },
];
