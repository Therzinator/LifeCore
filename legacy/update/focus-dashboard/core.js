/* ══════════════════════════════════════════════════════════════
   core.js — Focus Dashboard gedeelde utilities
   Alle modules laden dit bestand via <script src="core.js">
   Beschikbaar als window.Core.*
══════════════════════════════════════════════════════════════ */
(function(win){
  'use strict';

  /* ── Toast ──────────────────────────────────────────────── */
  function toast(msg, type){
    type = type || 'neu';
    var containerId = 'toast-c';
    // Liftcore gebruikt toast-wrap
    var c = document.getElementById(containerId) || document.getElementById('toast-wrap');
    if(!c) return;
    var el = document.createElement('div');
    el.className = 'toast ' + type;
    el.setAttribute('role', 'status');
    var ico = type==='ok' ? '✓' : type==='wn' ? '⚠' : '·';
    el.innerHTML = '<span>' + ico + '</span><span>' + msg + '</span>';
    c.appendChild(el);
    setTimeout(function(){
      el.classList.add('out');
      el.addEventListener('animationend', function(){ el.remove(); }, {once:true});
    }, 3400);
  }

  /* ── Schema (focus_schema) ──────────────────────────────── */
  var SCHEMA_KEY = 'focus_schema';
  var SCHEMA_STD = {
    wekker:            '07:00',
    slaap_herinnering: '22:30',
    rooster:           {ma:'werk',di:'werk',wo:'werk',do:'werk',vr:'werk',za:'vrij',zo:'vrij'},
    lift_dagen:        ['ma','wo','vr'],
    cardio_dagen:      ['di','do','za'],
    regen:             false,
  };

  function laadSchema(){
    try{
      var r = localStorage.getItem(SCHEMA_KEY);
      return r ? Object.assign({}, JSON.parse(JSON.stringify(SCHEMA_STD)), JSON.parse(r)) : JSON.parse(JSON.stringify(SCHEMA_STD));
    }catch(e){ return JSON.parse(JSON.stringify(SCHEMA_STD)); }
  }

  function slaSchemaOp(s){
    try{ localStorage.setItem(SCHEMA_KEY, JSON.stringify(s)); }
    catch(e){ toast('Schema opslaan mislukt', 'wn'); }
  }

  /* ── Dag helpers ────────────────────────────────────────── */
  var DAGEN = ['ma','di','wo','do','vr','za','zo'];
  var DAGEN_MAP = {0:'zo',1:'ma',2:'di',3:'wo',4:'do',5:'vr',6:'za'};
  var DAG_NAMEN = {ma:'Maandag',di:'Dinsdag',wo:'Woensdag',do:'Donderdag',vr:'Vrijdag',za:'Zaterdag',zo:'Zondag'};

  function vandaagKort(){
    return DAGEN_MAP[new Date().getDay()];
  }

  function isWerkdag(){
    var s = laadSchema();
    return (s.rooster[vandaagKort()] || 'werk') === 'werk';
  }

  /* ── Energie dag-state ──────────────────────────────────── */
  // Centrale dagstate key — alle modules schrijven/lezen hiervan
  var DAG_KEY = 'focus_dag_state';

  function laadDagState(){
    try{
      var r = localStorage.getItem(DAG_KEY);
      if(!r) return null;
      var d = JSON.parse(r);
      // Verouderd als datum niet vandaag is
      if(d.datum !== new Date().toDateString()) return null;
      return d;
    }catch(e){ return null; }
  }

  function schrijfDagState(velden){
    var huidig = laadDagState() || { datum: new Date().toDateString() };
    var bijgewerkt = Object.assign({}, huidig, velden, { datum: new Date().toDateString() });
    try{ localStorage.setItem(DAG_KEY, JSON.stringify(bijgewerkt)); }
    catch(e){}
    return bijgewerkt;
  }

  /* Lees energie uit centrale dagstate (ook compatibel met wc_handoff) */
  function getEnergie(){
    var dag = laadDagState();
    if(dag && dag.energie) return dag.energie;
    // Fallback: wc_handoff
    try{
      var h = JSON.parse(localStorage.getItem('wc_handoff') || 'null');
      if(h && h.energie) return h.energie;
    }catch(e){}
    return 'midden';
  }

  /* ── Energiebudget ──────────────────────────────────────── */
  // Elke activiteit kost een bepaald energiebedget (0-10 schaal per dag)
  var ENERGIE_BUDGET = {
    liftcore_zwaar:  3.0,
    liftcore_licht:  1.5,
    cardio_interval: 2.5,
    cardio_duur:     1.5,
    cardio_basis:    1.0,
    werkdag_vol:     3.5,
    werkdag_half:    2.0,
    focusblok_90:    1.5,
    focusblok_45:    0.8,
    resetcore:       0.2,
    relaxcore:       0.1,
  };

  function energieBudgetVandaag(){
    var energie = getEnergie();
    var basis = {laag: 5, midden: 7, hoog: 10}[energie] || 7;
    var dag = laadDagState();
    var verbruikt = dag ? (dag.energie_verbruikt || 0) : 0;
    return { totaal: basis, verbruikt: verbruikt, resterend: Math.max(0, basis - verbruikt) };
  }

  function verbruikEnergie(activiteit){
    var kosten = ENERGIE_BUDGET[activiteit] || 0;
    var dag = laadDagState() || {};
    var huidig = dag.energie_verbruikt || 0;
    schrijfDagState({ energie_verbruikt: huidig + kosten });
    return energieBudgetVandaag();
  }

  /* ── Slaapdebt tracker ──────────────────────────────────── */
  var SLAAP_KEY = 'focus_slaap_log';
  var AANBEVOLEN_SLAAP = 7.5;

  function logSlaap(uren){
    try{
      var log = JSON.parse(localStorage.getItem(SLAAP_KEY) || '[]');
      log.unshift({ datum: new Date().toISOString().slice(0,10), uren: uren });
      log = log.slice(0, 14); // max 14 dagen
      localStorage.setItem(SLAAP_KEY, JSON.stringify(log));
    }catch(e){}
  }

  function slaapDebt(){
    try{
      var log = JSON.parse(localStorage.getItem(SLAAP_KEY) || '[]');
      if(log.length < 3) return null;
      var recent = log.slice(0, 7);
      var tekort = recent.reduce(function(s, d){
        return s + Math.max(0, AANBEVOLEN_SLAAP - d.uren);
      }, 0);
      return { dagen: recent.length, tekort: Math.round(tekort * 10) / 10, kritiek: tekort > 5 };
    }catch(e){ return null; }
  }

  /* ── Burnout indicator ──────────────────────────────────── */
  function berekeningBurnoutScore(){
    var scores = [];
    // 1. Energie trend (LifeCore check-ins)
    try{
      var lc = JSON.parse(localStorage.getItem('lifecore_v1') || '{}');
      var checkins = (lc.check_ins || []).slice(0, 21);
      if(checkins.length >= 7){
        var oud  = checkins.slice(-7).reduce(function(s,c){return s+(c.energie||3);},0) / 7;
        var nw   = checkins.slice(0,7).reduce(function(s,c){return s+(c.energie||3);},0) / 7;
        var trend = nw - oud; // negatief = dalend
        scores.push({ label:'Energietrend', waarde: trend < -0.5 ? 'dalend' : trend > 0.3 ? 'stijgend' : 'stabiel', score: trend < -0.5 ? 2 : 0 });
      }
    }catch(e){}
    // 2. Slaapdebt
    var sd = slaapDebt();
    if(sd) scores.push({ label:'Slaaptekort', waarde: sd.tekort + 'u/week', score: sd.kritiek ? 3 : sd.tekort > 2 ? 1 : 0 });
    // 3. Drang-frequentie stijging (LifeCore)
    try{
      var lc2 = JSON.parse(localStorage.getItem('lifecore_v1') || '{}');
      var drangLog = lc2.drang_log || [];
      var vandaag = new Date();
      var week1 = drangLog.filter(function(d){
        var diff = (vandaag - new Date(d.datum)) / (1000*60*60*24);
        return diff <= 7;
      }).length;
      var week2 = drangLog.filter(function(d){
        var diff = (vandaag - new Date(d.datum)) / (1000*60*60*24);
        return diff > 7 && diff <= 14;
      }).length;
      if(week1 > 0 && week2 > 0){
        var stijging = (week1 - week2) / week2;
        if(stijging > 0.5) scores.push({ label:'Drangfrequentie', waarde: '+' + Math.round(stijging*100) + '%', score: 2 });
      }
    }catch(e){}

    var totaalScore = scores.reduce(function(s,i){return s+i.score;},0);
    var niveau = totaalScore >= 5 ? 'hoog' : totaalScore >= 3 ? 'matig' : totaalScore >= 1 ? 'licht' : 'geen';
    return { score: totaalScore, niveau: niveau, signalen: scores };
  }

  /* ── Micro-reflectie vraag generator ────────────────────── */
  function getMicroReflectieVraag(){
    var dag = laadDagState();
    var lc  = {};
    try{ lc = JSON.parse(localStorage.getItem('lifecore_v1') || '{}'); }catch(e){}

    var drangVandaag = (lc.drang_log || []).filter(function(d){
      return d.datum === new Date().toISOString().slice(0,10);
    });

    // Contextspecifieke vraag
    if(drangVandaag.length >= 2){
      var patroonNamen = {};
      drangVandaag.forEach(function(d){ patroonNamen[d.patroon_id] = (patroonNamen[d.patroon_id]||0)+1; });
      var topPatroon = Object.entries(patroonNamen).sort(function(a,b){return b[1]-a[1];})[0];
      if(topPatroon) return 'Je hebt vandaag ' + topPatroon[1] + '× drang geregistreerd. Wat speelde er?';
    }

    var sd = slaapDebt();
    if(sd && sd.kritiek) return 'Je slaaptekort loopt op (' + sd.tekort + 'u deze week). Wat staat een goede nachtrust in de weg?';

    var burnout = berekeningBurnoutScore();
    if(burnout.niveau === 'matig' || burnout.niveau === 'hoog'){
      return 'De signalen wijzen op oplopende belasting. Wat zou je morgen kunnen weglaten?';
    }

    // Algemene roulerende vragen
    var vragen = [
      'Wat ging er vandaag beter dan je verwachtte?',
      'Waar verloor je de meeste energie aan?',
      'Wat zou je morgen als eerste willen doen?',
      'Op een schaal van 1-5: hoe goed heb je voor jezelf gezorgd vandaag?',
      'Wat is één ding dat je kon laten gaan vandaag?',
    ];
    var dagNr = Math.floor(Date.now() / (1000*60*60*24));
    return vragen[dagNr % vragen.length];
  }

  /* ── Patroon correlatie (LifeCore) ──────────────────────── */
  function berekenPatroonCorrelaties(){
    var lc = {};
    try{ lc = JSON.parse(localStorage.getItem('lifecore_v1') || '{}'); }catch(e){}
    var checkins  = lc.check_ins  || [];
    var drangLog  = lc.drang_log  || [];
    if(checkins.length < 5 || drangLog.length < 3) return [];

    // Bouw energie-per-datum map
    var energiePerDatum = {};
    checkins.forEach(function(c){ energiePerDatum[c.datum] = c.energie || 3; });

    // Per patroon: gemiddelde energie op drangdagen vs niet-drangdagen
    var patronen = {};
    drangLog.forEach(function(d){
      if(!patronen[d.patroon_id]) patronen[d.patroon_id] = { drangDagen:[], rustDagen:[] };
      if(energiePerDatum[d.datum]) patronen[d.patroon_id].drangDagen.push(energiePerDatum[d.datum]);
    });

    // Voeg niet-drang-dagen toe
    Object.keys(energiePerDatum).forEach(function(datum){
      var inDrang = drangLog.some(function(d){ return d.datum === datum; });
      if(!inDrang){
        Object.keys(patronen).forEach(function(pid){
          patronen[pid].rustDagen.push(energiePerDatum[datum]);
        });
      }
    });

    var resultaten = [];
    Object.entries(patronen).forEach(function(entry){
      var pid = entry[0]; var data = entry[1];
      if(data.drangDagen.length < 2) return;
      var gemDrang = data.drangDagen.reduce(function(a,b){return a+b;},0) / data.drangDagen.length;
      var gemRust  = data.rustDagen.length > 0 ? data.rustDagen.reduce(function(a,b){return a+b;},0) / data.rustDagen.length : 3;
      resultaten.push({
        patroon_id: pid,
        gem_energie_bij_drang: Math.round(gemDrang * 10) / 10,
        gem_energie_rustdagen: Math.round(gemRust * 10) / 10,
        verschil: Math.round((gemRust - gemDrang) * 10) / 10,
        n: data.drangDagen.length,
      });
    });

    return resultaten.sort(function(a,b){ return b.verschil - a.verschil; });
  }

  /* ── Slaap-prestatie correlatie ─────────────────────────── */
  function slaapPrestatieCorrelatie(){
    try{
      var slaapLog = JSON.parse(localStorage.getItem(SLAAP_KEY) || '[]');
      var lc = JSON.parse(localStorage.getItem('lifecore_v1') || '{}');
      var checkins = lc.check_ins || [];
      if(slaapLog.length < 5 || checkins.length < 5) return null;

      var slaapPerDatum = {};
      slaapLog.forEach(function(s){ slaapPerDatum[s.datum] = s.uren; });

      var voldoende = [], onvoldoende = [];
      checkins.forEach(function(c){
        var slaap = slaapPerDatum[c.datum];
        if(!slaap) return;
        if(slaap >= 7) voldoende.push(c.energie || 3);
        else onvoldoende.push(c.energie || 3);
      });

      if(voldoende.length < 2 || onvoldoende.length < 2) return null;
      var gemV = Math.round(voldoende.reduce(function(a,b){return a+b;},0) / voldoende.length * 10) / 10;
      var gemO = Math.round(onvoldoende.reduce(function(a,b){return a+b;},0) / onvoldoende.length * 10) / 10;
      var verschil = Math.round((gemV - gemO) * 10) / 10;
      var pct = verschil > 0 ? Math.round((verschil / gemO) * 100) : 0;

      return { gem_7plus: gemV, gem_onder7: gemO, verschil: verschil, pct_verschil: pct };
    }catch(e){ return null; }
  }

  /* ── Publieke API ────────────────────────────────────────── */
  win.Core = {
    // Toast
    toast: toast,

    // Schema
    SCHEMA_KEY:   SCHEMA_KEY,
    DAGEN:        DAGEN,
    DAGEN_MAP:    DAGEN_MAP,
    DAG_NAMEN:    DAG_NAMEN,
    laadSchema:   laadSchema,
    slaSchemaOp:  slaSchemaOp,
    vandaagKort:  vandaagKort,
    isWerkdag:    isWerkdag,

    // Dagstate
    DAG_KEY:       DAG_KEY,
    laadDagState:  laadDagState,
    schrijfDagState: schrijfDagState,
    getEnergie:    getEnergie,

    // Energiebudget
    ENERGIE_BUDGET:      ENERGIE_BUDGET,
    energieBudgetVandaag: energieBudgetVandaag,
    verbruikEnergie:     verbruikEnergie,

    // Slaap
    SLAAP_KEY:     SLAAP_KEY,
    logSlaap:      logSlaap,
    slaapDebt:     slaapDebt,

    // Burnout & inzichten
    berekeningBurnoutScore:    berekeningBurnoutScore,
    getMicroReflectieVraag:    getMicroReflectieVraag,
    berekenPatroonCorrelaties: berekenPatroonCorrelaties,
    slaapPrestatieCorrelatie:  slaapPrestatieCorrelatie,
  };

})(window);

/* ══════════════════════════════════════════════════════════════
   Core.sync — Module data synchronisatie met Supabase
   
   Elke module definieert:
     - LS_KEY: de localStorage sleutel
     - module naam: de identifier in de module_data tabel
   
   Core.sync.upload(module, data)  — schrijft naar cloud
   Core.sync.download(module)      — leest van cloud
   Core.sync.uploadAlle()          — upload alle modules
   Core.sync.downloadAlle()        — download alle modules
   Core.sync.uploadSchema()        — sync focus_schema
   Core.sync.downloadSchema()      — laad focus_schema van cloud
══════════════════════════════════════════════════════════════ */
(function(win){
  'use strict';

  // Module registry: naam → localStorage key
  var MODULE_REGISTRY = {
    liftcore:   'liftcore_v3',
    workcore:   'workcore_dag',
    resetcore:  'resetcore_dag',
    cardiocore: 'cardiocore_v1',
    lifecore:   'lifecore_v1',
    klusboek:   'workcore_klusboek',
  };

  // Sync-status per module (in-memory)
  var syncStatus = {};

  function getSB(){
    return win._supabaseClient || win.SB || null;
  }

  async function getUserId(){
    var sb = getSB();
    if(!sb) return null;
    try{
      var res = await sb.auth.getSession();
      return res.data?.session?.user?.id || null;
    }catch(e){ return null; }
  }

  /* ── Upload één module ──────────────────────────────────── */
  async function upload(module, data){
    var sb = getSB();
    if(!sb || !navigator.onLine) return { ok:false, reden:'offline' };
    var uid = await getUserId();
    if(!uid) return { ok:false, reden:'niet_ingelogd' };

    // Data compression: sla alleen wat past in Supabase jsonb (~1MB)
    var json;
    try{
      json = JSON.stringify(data);
      if(json.length > 900 * 1024){
        // Trim oudste records als data te groot is
        data = trimData(module, data);
        json = JSON.stringify(data);
      }
    }catch(e){ return { ok:false, reden:'serialize_fout' }; }

    try{
      var res = await sb.from('module_data').upsert(
        { user_id: uid, module: module, data: data, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,module' }
      );
      if(res.error) throw res.error;
      syncStatus[module] = { status:'synced', ts: Date.now() };
      return { ok:true };
    }catch(e){
      syncStatus[module] = { status:'mislukt', ts: Date.now() };
      return { ok:false, reden: e.message };
    }
  }

  /* ── Download één module ────────────────────────────────── */
  async function download(module){
    var sb = getSB();
    if(!sb || !navigator.onLine) return { ok:false, reden:'offline' };
    var uid = await getUserId();
    if(!uid) return { ok:false, reden:'niet_ingelogd' };

    try{
      var res = await sb.from('module_data')
        .select('data, updated_at')
        .eq('user_id', uid)
        .eq('module', module)
        .single();

      if(res.error){
        if(res.error.code === 'PGRST116') return { ok:true, data:null }; // geen data
        throw res.error;
      }
      return { ok:true, data: res.data.data, updated_at: res.data.updated_at };
    }catch(e){
      return { ok:false, reden: e.message };
    }
  }

  /* ── Upload alle modules ────────────────────────────────── */
  async function uploadAlle(voortgangCb){
    var resultaten = {};
    var modules = Object.entries(MODULE_REGISTRY);
    for(var i=0; i<modules.length; i++){
      var naam = modules[i][0];
      var lsKey = modules[i][1];
      try{
        var raw = localStorage.getItem(lsKey);
        if(!raw){ resultaten[naam] = 'leeg'; continue; }
        var data = JSON.parse(raw);
        var res = await upload(naam, data);
        resultaten[naam] = res.ok ? 'ok' : res.reden;
      }catch(e){
        resultaten[naam] = 'fout';
      }
      if(voortgangCb) voortgangCb(i+1, modules.length, naam);
    }
    // Upload focus_schema ook
    try{
      var schemaRaw = localStorage.getItem('focus_schema');
      if(schemaRaw){
        var schemaRes = await uploadSchema(JSON.parse(schemaRaw));
        resultaten['schema'] = schemaRes.ok ? 'ok' : schemaRes.reden;
      }
    }catch(e){ resultaten['schema'] = 'fout'; }
    return resultaten;
  }

  /* ── Download alle modules ──────────────────────────────── */
  async function downloadAlle(voortgangCb){
    var resultaten = {};
    var modules = Object.entries(MODULE_REGISTRY);
    for(var i=0; i<modules.length; i++){
      var naam = modules[i][0];
      var lsKey = modules[i][1];
      var res = await download(naam);
      if(res.ok && res.data){
        try{
          localStorage.setItem(lsKey, JSON.stringify(res.data));
          resultaten[naam] = 'ok';
        }catch(e){ resultaten[naam] = 'opslaan_fout'; }
      } else {
        resultaten[naam] = res.data === null ? 'geen_data' : res.reden;
      }
      if(voortgangCb) voortgangCb(i+1, modules.length, naam);
    }
    // Download schema ook
    var schemaRes = await downloadSchema();
    resultaten['schema'] = schemaRes.ok ? (schemaRes.data ? 'ok' : 'geen_data') : schemaRes.reden;
    return resultaten;
  }

  /* ── Schema sync ────────────────────────────────────────── */
  async function uploadSchema(schemaData){
    var sb = getSB();
    if(!sb || !navigator.onLine) return { ok:false, reden:'offline' };
    var uid = await getUserId();
    if(!uid) return { ok:false, reden:'niet_ingelogd' };
    try{
      var res = await sb.from('user_schema').upsert(
        { user_id: uid, schema_data: schemaData, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      );
      if(res.error) throw res.error;
      return { ok:true };
    }catch(e){ return { ok:false, reden: e.message }; }
  }

  async function downloadSchema(){
    var sb = getSB();
    if(!sb || !navigator.onLine) return { ok:false, reden:'offline' };
    var uid = await getUserId();
    if(!uid) return { ok:false, reden:'niet_ingelogd' };
    try{
      var res = await sb.from('user_schema')
        .select('schema_data, updated_at')
        .eq('user_id', uid)
        .single();
      if(res.error){
        if(res.error.code === 'PGRST116') return { ok:true, data:null };
        throw res.error;
      }
      if(res.data?.schema_data){
        localStorage.setItem('focus_schema', JSON.stringify(res.data.schema_data));
      }
      return { ok:true, data: res.data?.schema_data || null };
    }catch(e){ return { ok:false, reden: e.message }; }
  }

  /* ── Auto-sync: upload na wijziging (debounced) ─────────── */
  var autoSyncTimers = {};
  function planAutoSync(module, data, vertragingMs){
    vertragingMs = vertragingMs || 5000; // 5 sec na laatste wijziging
    if(autoSyncTimers[module]) clearTimeout(autoSyncTimers[module]);
    autoSyncTimers[module] = setTimeout(function(){
      if(module === 'schema') uploadSchema(data);
      else upload(module, data);
    }, vertragingMs);
  }

  /* ── Trim: verwijder oudste records bij te grote data ────── */
  function trimData(module, data){
    var d = Object.assign({}, data);
    // Per module weten we welk veld de history bevat
    var histVelden = {
      liftcore:   'trainingen',
      cardiocore: 'sessies',
      lifecore:   ['check_ins','drang_log','reflecties'],
      workcore:   'log',
    };
    var veld = histVelden[module];
    if(!veld) return d;
    var velden = Array.isArray(veld) ? veld : [veld];
    velden.forEach(function(v){
      if(Array.isArray(d[v]) && d[v].length > 500){
        d[v] = d[v].slice(0, 500); // bewaar 500 meest recente
      }
    });
    return d;
  }

  /* ── Status helpers ─────────────────────────────────────── */
  function getSyncStatus(module){
    return syncStatus[module] || { status:'onbekend', ts:0 };
  }

  function isIngelogd(){
    var sb = getSB();
    if(!sb) return false;
    // Sync check via cached session
    try{
      var key = Object.keys(localStorage).find(function(k){ return k.includes('supabase.auth.token'); });
      if(!key) return false;
      var tok = JSON.parse(localStorage.getItem(key) || '{}');
      return !!(tok.access_token);
    }catch(e){ return false; }
  }

  /* ── Publieke API ────────────────────────────────────────── */
  if(!win.Core) win.Core = {};
  win.Core.sync = {
    MODULE_REGISTRY: MODULE_REGISTRY,
    upload:          upload,
    download:        download,
    uploadAlle:      uploadAlle,
    downloadAlle:    downloadAlle,
    uploadSchema:    uploadSchema,
    downloadSchema:  downloadSchema,
    planAutoSync:    planAutoSync,
    getSyncStatus:   getSyncStatus,
    isIngelogd:      isIngelogd,
  };

})(window);
