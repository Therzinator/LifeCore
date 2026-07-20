// Wat: neemt een base64-gecodeerde foto van een kookboekpagina en laat Claude
// (vision) die omzetten naar een gestructureerd recept in dezelfde vorm als
// een handmatig ingevoerd gerecht (zie useGerechten.js/Gerechten.jsx):
// { naam, bereiding, ingredienten[], optioneel[], kruiden[] }.
// Waarom als Edge Function i.p.v. client-side OCR: ruwe OCR-tekst is slecht
// in het scheiden van ingrediënten vs. bereidingsstappen op wisselende
// kookboek-layouts — een vision-LLM-call geeft direct gestructureerde output.
// De foto wordt hier nooit opgeslagen (geen storage-upload) — alleen in het
// geheugen van deze functie verwerkt en daarna weggegooid, dus er is niets
// om achteraf te verwijderen.
//
// Vereist een Supabase secret ANTHROPIC_API_KEY (project-instellingen of
// `supabase secrets set ANTHROPIC_API_KEY=...`). JWT-verificatie staat aan
// (verify_jwt: true bij deploy) — alleen ingelogde gebruikers kunnen 'm
// aanroepen, om misbruik van de API-kosten per scan te voorkomen.

import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.32.1';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RECEPT_SCHEMA = {
  type: 'object',
  properties: {
    naam: { type: 'string' },
    bereiding: { type: 'string' },
    ingredienten: { type: 'array', items: { type: 'string' } },
    optioneel: { type: 'array', items: { type: 'string' } },
    kruiden: { type: 'array', items: { type: 'string' } },
  },
  required: ['naam', 'bereiding', 'ingredienten', 'optioneel', 'kruiden'],
  additionalProperties: false,
};

const PROMPT = `Dit is een foto van een kookboekpagina of recept. Zet 'm om naar een gestructureerd recept:
- naam: de naam van het gerecht
- bereiding: de bereidingswijze als korte, doorlopende tekst (geen genummerde lijst nodig)
- ingredienten: de hoofdingrediënten, elk als één string inclusief hoeveelheid (bv. "300 gr kipfilet")
- optioneel: ingrediënten die het recept als "optioneel"/"naar smaak" markeert — leeg als er geen zijn
- kruiden: kruiden en specerijen apart van de hoofdingrediënten — leeg als er geen apart genoemd worden
Alles in het Nederlands, ook als de foto in een andere taal is.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

  try {
    const { afbeelding, mediaType } = await req.json();
    if (!afbeelding || !mediaType) {
      return new Response(JSON.stringify({ error: 'afbeelding en mediaType zijn verplicht' }), {
        status: 400,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY niet geconfigureerd op de server' }), {
        status: 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 2048,
      output_config: { format: { type: 'json_schema', schema: RECEPT_SCHEMA } },
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: afbeelding } },
          { type: 'text', text: PROMPT },
        ],
      }],
    });

    if (response.stop_reason === 'refusal') {
      return new Response(JSON.stringify({ error: 'Kon de foto niet verwerken' }), {
        status: 422,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    const tekstBlok = response.content.find((b) => b.type === 'text');
    const recept = JSON.parse(tekstBlok?.text ?? '{}');

    return new Response(JSON.stringify(recept), {
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('recept-uit-foto fout', err);
    return new Response(JSON.stringify({ error: 'Kon het recept niet verwerken' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
