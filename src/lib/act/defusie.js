export function defusieStappen(gedachte) {
  const schoon = (gedachte ?? '').trim();
  if (!schoon) return [];

  const kaal = schoon.replace(/[.!?]+$/, '');
  const verlaagd = kaal.charAt(0).toLowerCase() + kaal.slice(1);

  return [
    { label: 'De gedachte', tekst: schoon },
    { label: 'Een stap terug', tekst: `Ik heb de gedachte dat ${verlaagd}.` },
    { label: 'Nog een stap terug', tekst: `Ik merk dat ik de gedachte heb dat ${verlaagd}.` },
  ];
}
