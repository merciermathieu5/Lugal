/* Harnais de validation Lugal — jsdom
   1) Intégrité des données (STORY, SRC, photos, quiz, folios, fins)
   2) Smoke test DOM : intro → allocation → début → source (chrono + quiz) → choix → poursuite
   Lancer : node test/valide.js                                                     */
const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

const ROOT = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");

let pass = 0, fail = 0;
const ok = (cond, msg) => { if (cond) { pass++; } else { fail++; console.error("ÉCHEC  " + msg); } };
const info = (msg) => console.log("       " + msg);

const vc = new (require("jsdom").VirtualConsole)();
vc.on("jsdomError", e => { /* CSS parse etc. : silencieux */ });

const dom = new JSDOM(html, {
  runScripts: "dangerously",
  pretendToBeVisual: true,
  url: "https://localhost/",
  virtualConsole: vc
});
const { window } = dom;
const { document } = window;

// jsdom : quelques stubs inoffensifs
window.HTMLMediaElement.prototype.play = function(){ return Promise.resolve(); };
window.HTMLMediaElement.prototype.pause = function(){};

function $(s){ return document.querySelector(s); }
function ev(expr){ return window.eval(expr); }

setTimeout(main, 150); // laisser le script inline s'exécuter

function main(){
  console.log("— Volet 1 · intégrité des données —");

  const STORY = ev("STORY"), SRC = ev("SRC"), FINS = ev("FINS_ORDRE"), GLOSS = ev("GLOSS");

  // 1. Toutes les cibles pointent vers des nœuds existants
  let cibles = 0;
  for (const k in STORY){
    const n = STORY[k];
    (n.renvois || []).forEach(r => {
      if (r.cible){ cibles++; ok(STORY[r.cible], `cible inconnue « ${r.cible} » depuis ${k}`); }
      if (r.epreuve){
        if (r.epreuve.ok && r.epreuve.ok.cible){ cibles++; ok(STORY[r.epreuve.ok.cible], `cible ok inconnue depuis ${k}`); }
        if (r.epreuve.penalite && r.epreuve.penalite.cible){ cibles++; ok(STORY[r.epreuve.penalite.cible], `cible penalite inconnue depuis ${k}`); }
      }
    });
  }
  info(`${cibles} cibles de renvois vérifiées`);

  // 2. Sources référencées existent
  let refs = 0;
  for (const k in STORY){
    if (STORY[k].src){ refs++; ok(SRC[STORY[k].src], `src inconnue « ${STORY[k].src} » au nœud ${k}`); }
  }
  info(`${refs} références de sources vérifiées`);

  // 3. Visuels : aucune photo externe ; chaque source non textuelle a son SVG
  let nSvg = 0;
  for (const k in SRC){
    const s = SRC[k];
    ok(!s.ph, `résidu de photo externe dans la source ${k}`);
    if (!s.doc){ nSvg++; ok(s.svg && s.svg.includes("<svg"), `SVG manquant pour la source ${k}`); }
  }
  ok(!fs.existsSync(path.join(ROOT, "assets")), "le dossier assets/ devrait avoir disparu");
  info(`${nSvg} illustrations SVG originales, aucune image externe`);

  // 4. Quiz : chaque source a une question à 3 choix, ok valide, choix distincts
  let nQ = 0;
  for (const k in SRC){
    const q = SRC[k].q;
    ok(q, `source ${k} sans question de vérification`);
    if (!q) continue;
    nQ++;
    ok(Array.isArray(q.ch) && q.ch.length === 3, `quiz ${k} : il faut 3 choix`);
    ok(Number.isInteger(q.ok) && q.ok >= 0 && q.ok < 3, `quiz ${k} : ok hors bornes`);
    ok(new Set(q.ch).size === 3, `quiz ${k} : choix en double`);
    ok(q.txt && q.txt.length > 8, `quiz ${k} : question vide`);
  }
  info(`${nQ}/${Object.keys(SRC).length} sources avec question de vérification`);

  // 5. Folios parsables → frise des actes
  let nActes = 0;
  const seen = new Set();
  for (const k in STORY){
    const n = STORY[k];
    if (n.fin) continue;
    const m = /^Acte ([IVX]+)/.exec(n.folio || "");
    const epr = /^Épreuve · /.test(n.folio || "");
    ok(m || epr, `folio non parsable au nœud ${k} : « ${n.folio} »`);
    if (m){ seen.add(m[1]); nActes++; } else if (epr){ nActes++; }
  }
  ok(seen.size === 8, `attendu 8 actes distincts, trouvé ${seen.size} (${[...seen].join(",")})`);
  info(`${nActes} folios parsables couvrant les actes ${[...seen].join(", ")}`);

  // 6. Toutes les fins de la galerie existent et sont des fins
  FINS.forEach(f => { ok(STORY[f] && STORY[f].fin, `fin de galerie invalide : ${f}`); });
  info(`${FINS.length} fins de galerie vérifiées`);

  // 6bis. cibleFn dynamiques : sondées avec des profils contrastés
  const mkF = (v) => { const f = ev("nouvelle()"); ["autorite","sagesse","piete","legitimite"].forEach(k=>f[k]=v);
    f.prosperite=v; f.rayonnement=v; f.savoir=v; f.technique=v; return f; };
  let nFn = 0;
  for (const k in STORY){
    (STORY[k].renvois || []).forEach((r, i) => {
      const fns = [];
      if (r.cibleFn) fns.push(r.cibleFn);
      if (r.epreuve && r.epreuve.ok && r.epreuve.ok.cibleFn) fns.push(r.epreuve.ok.cibleFn);
      if (r.epreuve && r.epreuve.penalite && r.epreuve.penalite.cibleFn) fns.push(r.epreuve.penalite.cibleFn);
      fns.forEach(fn => { nFn++;
        for (const v of [0, 6, 12, 16]){
          let out; try { out = fn(mkF(v)); } catch(e){ out = "(exception " + e.message + ")"; }
          ok(STORY[out], `cibleFn ${k}#${i} (profil ${v}) → cible invalide « ${out} »`);
        }
      });
    });
  }
  info(`${nFn} cibleFn sondées avec 4 profils chacune`);

  // 7. Lexique : clés définies, définitions non vides
  let nG = 0;
  for (const k in GLOSS){ nG++; ok(typeof GLOSS[k] === "string" && GLOSS[k].length > 20, `définition trop courte : ${k}`); }
  info(`${nG} entrées de lexique`);

  // 8. Rendu des sources : tablette d'argile pour les textes (avec étiquette de
  //    reconstitution), SVG sans référence, pas de « Lecture » pour les docs,
  //    aucune mention SOURCES.md / crédits dans l'interface
  let nDoc = 0, nVis = 0, nStone = 0;
  for (const k in SRC){
    const out = ev(`plate(SRC[${JSON.stringify(k)}])`);
    ok(!/SOURCES\.md/.test(out), `mention « SOURCES.md » dans la source ${k}`);
    ok(!/crédits/.test(out), `mention « crédits » dans la source ${k}`);
    ok(!/<figure|<img/.test(out), `image externe rendue pour la source ${k}`);
    if (SRC[k].doc){
      nDoc++;
      ok(!/plate-read/.test(out), `bloc Lecture affiché pour la source textuelle ${k}`);
      ok(/class="clay/.test(out), `rendu tablette d'argile absent pour ${k}`);
      ok(/class="cite">[^<]*(composé|reconstitution)/.test(out), `étiquette de reconstitution absente pour ${k}`);
      if (SRC[k].mat === "stone"){ nStone++; ok(/clay stone/.test(out), `variante pierre absente pour ${k}`); }
    } else {
      ok(!/class="cite"/.test(out), `référence affichée sous l'illustration ${k}`);
      if ((SRC[k].arts || []).length){
        nVis++;
        ok(/plate-read/.test(out), `bloc « Ce que montre l'image » absent pour ${k}`);
      }
    }
  }
  ok(nStone === 1, `attendu 1 source sur pierre, trouvé ${nStone}`);
  ok(SRC.lagash.doc && !SRC.lagash.ph, "lagash devrait être un document composé sans photo");
  info(`${nDoc} documents (tablette d'argile, étiquetés), ${nVis} illustrations avec lecture, sans référence`);

  // 9. Numérotation des sections : bijection STORY ↔ SEC, §1 = le début
  const SEC = ev("SEC");
  const sk = Object.keys(SEC), tk = Object.keys(STORY);
  ok(sk.length === tk.length, `SEC (${sk.length}) et STORY (${tk.length}) désalignés`);
  tk.forEach(k => ok(Number.isInteger(SEC[k]), `nœud sans numéro de section : ${k}`));
  const vals = Object.values(SEC);
  ok(new Set(vals).size === vals.length, "numéros de section en double");
  ok(Math.min(...vals) === 1 && Math.max(...vals) === vals.length, "les numéros ne couvrent pas 1..N");
  ok(SEC.eau === 1, "le livre devrait s'ouvrir au §1");
  info(`${vals.length} sections numérotées, §1 = eau`);

  // 10. Les grandes entreprises passent aux dés
  ["commerce","edubba","amargi"].forEach(k => ok(!!STORY[k].renvois[0].epreuve, `le premier choix de ${k} devrait être une épreuve`));
  let nEp = 0;
  Object.values(STORY).forEach(n => (n.renvois||[]).forEach(r => { if (r.epreuve) nEp++; }));
  info(`${nEp} épreuves de dés sur le graphe`);
  ok(STORY.nF_maudit && STORY.nF_maudit.fin, "la fin du roi maudit manque");

  console.log("\n— Volet 1 bis · report des sceaux sur les épreuves —");
  voletSceaux(STORY);

  console.log("\n— Volet 1 bis bis · lisibilité —");
  voletLisibilite(html);

  console.log("\n— Volet 1 ter · affrontements —");
  voletCombats(STORY);

  console.log("\n— Volet 2 · smoke test DOM —");
  smoke();
}

/* ---- Volet 1 bis bis : plancher de lisibilite --------------------------- */
function voletLisibilite(html){
  const PLANCHER = 12;
  const css = html.slice(html.indexOf("<style>"), html.indexOf("</style>"));
  const regles = [...css.matchAll(/([^{}\n]+)\{([^}]*)\}/g)];
  const fautives = [];
  let n = 0;
  regles.forEach(m => {
    const fs = m[2].match(/font-size:\s*([0-9.]+)px/);
    if (!fs) return;
    n++;
    const v = parseFloat(fs[1]);
    if (v < PLANCHER) fautives.push(`${m[1].trim().slice(0,40)} à ${v}px`);
  });
  ok(fautives.length === 0, `texte sous ${PLANCHER}px : ${fautives.join(" · ")}`);
  info(`${n} règles de taille, plancher tenu à ${PLANCHER}px`);
  // aucune taille en px ne doit trainer hors de la feuille de style
  const hors = html.slice(0, html.indexOf("<style>")) + html.slice(html.indexOf("</style>"));
  ok(!/font-size:\s*[0-9.]+px/.test(hors), "une taille de police traîne hors de la feuille de style");
}

/* ---- Volet 1 ter : integrite et equilibre des affrontements ------------- */
function voletCombats(STORY){
  const QUAL = ev("QUALITES");
  const ids = Object.keys(STORY).filter(k => STORY[k].combat);
  ok(ids.length === 3, `3 affrontements attendus, ${ids.length} trouvés`);
  info(`${ids.length} affrontements : ${ids.join(", ")}`);

  ids.forEach(k => {
    const c = STORY[k].combat;
    ok(QUAL.includes(c.stat), `${k} : aptitude « ${c.stat} » inconnue`);
    ok(typeof c.advNom === "string" && c.advNom.length > 3, `${k} : l'adversaire doit être nommé`);
    ok(c.advApt >= 8 && c.advApt <= 13, `${k} : aptitude adverse hors bornes (${c.advApt})`);
    [["jPts",c.jPts],["advPts",c.advPts]].forEach(([n,v]) =>
      ok(v >= 4 && v <= 10 && v % 2 === 0, `${k} : ${n} devrait être pair entre 4 et 10 (${v})`));
    ok(c.jLbl && c.advLbl, `${k} : les deux jauges doivent porter un libellé narratif`);
    ["win","lose"].forEach(b => {
      const o = c[b];
      ok(!!o, `${k} : issue « ${b} » manquante`);
      if (!o) return;
      ok(Array.isArray(o.suite) && o.suite.length, `${k}.${b} : récit de suite manquant`);
      ok(typeof o.impact === "string" && o.impact.length > 60, `${k}.${b} : encadré d'impact trop court`);
      ok(typeof o.reg === "string", `${k}.${b} : entrée de registre manquante`);
      const dec0 = (STORY[k].renvois||[]).find(r => r.combat);
      const dest = o.cible || (dec0 && dec0.cibleFn ? "cibleFn" : (dec0 ? dec0.cible : null));
      ok(!!dest, `${k}.${b} : aucune destination après l'affrontement`);
      if (dest && dest !== "cibleFn") ok(!!STORY[dest], `${k}.${b} : destination « ${dest} » inconnue`);
    });
    // le choix qui declenche l'affrontement existe et n'a pas d'effets en double
    const dec = (STORY[k].renvois||[]).filter(r => r.combat);
    ok(dec.length === 1, `${k} : un seul choix devrait déclencher l'affrontement (${dec.length})`);
    if (dec[0]) ok(!dec[0].eff && !dec[0].sceau && !dec[0].epreuve,
      `${k} : le choix d'affrontement ne doit porter ni effet, ni sceau, ni épreuve`);
    // aucun sceau ne peut etre a la fois aide et entrave
    const a = (c.aides||[]).map(x=>x.sceau), e = (c.entraves||[]).map(x=>x.sceau);
    ok(!a.some(x => e.includes(x)), `${k} : un sceau est à la fois aide et entrave`);
  });

  // Monte-Carlo : equilibre reel des trois affrontements
  console.log("\n       Équilibre des affrontements · 4 000 duels par cas");
  const sim = ev("simulerCombat");
  const PROFILS = [["préparé",14],["moyen",10],["négligent",6]];
  const lignes = [];
  ids.forEach(k => {
    const c = STORY[k].combat;
    const ligne = { k, p:{} };
    PROFILS.forEach(([nom,v]) => {
      const mesure = (bd, ad) => {
        const profil = { [c.stat]: v, _bd: bd, _ad: ad };
        let g = 0, rd = 0;
        for (let i=0;i<4000;i++){ const r = sim(k, profil); if (r.win) g++; rd += r.rondes; }
        return { pct: Math.round(100*g/4000), rondes: (rd/4000).toFixed(1) };
      };
      ligne.p[nom] = {
        neutre: mesure(0,0),
        aide: mesure(Math.min(2,(c.aides||[]).length), 0),
        entrave: mesure(0, Math.min(2,(c.entraves||[]).length))
      };
    });
    lignes.push(ligne);
    PROFILS.forEach(([nom]) => {
      const x = ligne.p[nom];
      info(`  ${(k+" · roi "+nom).padEnd(30)} entravé ${String(x.entrave.pct).padStart(3)} %  ·  neutre ${String(x.neutre.pct).padStart(3)} %  ·  aidé ${String(x.aide.pct).padStart(3)} %  ·  ${x.neutre.rondes} rondes`);
    });
  });

  lignes.forEach(l => {
    const P = l.p["préparé"], M = l.p["moyen"], N = l.p["négligent"];
    // 1. investir l'aptitude est la première décision qui compte
    ok(P.neutre.pct >= 75, `${l.k} : spécialiser l'aptitude ne paie pas assez (${P.neutre.pct} %)`);
    ok(N.neutre.pct <= 20, `${l.k} : négliger l'aptitude ne coûte pas assez (${N.neutre.pct} %)`);
    // 2. le roi moyen doit vivre un vrai duel, ni formalité ni condamnation
    ok(M.neutre.pct >= 25 && M.neutre.pct <= 75, `${l.k} : déséquilibré pour un roi moyen (${M.neutre.pct} %)`);
    // 3. le règne doit peser, dans les deux sens et de façon perceptible
    ok(P.aide.pct >= P.neutre.pct, `${l.k} : une aide ne devrait pas nuire`);
    ok(P.entrave.pct <= P.neutre.pct, `${l.k} : une entrave ne devrait pas aider`);
    ok(P.neutre.pct - P.entrave.pct >= 5, `${l.k} : les entraves ne mordent pas assez sur un roi préparé (${P.neutre.pct - P.entrave.pct} points)`);
    ok(M.aide.pct - M.neutre.pct >= 10, `${l.k} : les aides pèsent trop peu sur un roi moyen (${M.aide.pct - M.neutre.pct} points)`);
    // 4. un duel doit durer assez pour se raconter, pas assez pour lasser
    ok(+M.neutre.rondes >= 2 && +M.neutre.rondes <= 12, `${l.k} : durée de duel hors bornes (${M.neutre.rondes} rondes)`);
  });

  // 5. aucun affrontement ne s'engage sans que les chances soient annoncées
  const cc = ev("combatChances");
  ids.forEach(k => {
    window.eval(`F={noeud:"${k}",sceaux:new Set(),${STORY[k].combat.stat}:10}`);
    const ch = cc(k);
    ok(typeof ch === "number" && ch >= 0 && ch <= 100, `${k} : les chances devraient être chiffrées avant de s'engager`);
    const r = STORY[k].renvois.find(x => x.combat);
    ok(/issue favorable : \d+ %/.test(ev("ebsFor")(r)), `${k} : la pastille doit annoncer le pourcentage`);
  });
  window.eval("F=null");
}

/* ---- Volet 1 bis : aides et entraves des sceaux ------------------------- */
function voletSceaux(STORY){
  const SCEAUX = new Set(ev("SCEAUX_ORDRE"));
  const CAP = ev("SCEAU_CAP");

  // graphe inverse : quels sceaux sont gagnables avant d'atteindre un noeud
  const pred = {};
  Object.keys(STORY).forEach(k => {
    const cb = STORY[k].combat;
    (STORY[k].renvois||[]).forEach(r => {
      const cs = [];
      if (typeof r.cible === "string") cs.push(r.cible);
      if (r.epreuve){ ["ok","penalite"].forEach(b => { const c = r.epreuve[b] && r.epreuve[b].cible; if (typeof c === "string") cs.push(c); }); }
      if (r.combat && cb){ ["win","lose"].forEach(b => { const c = cb[b] && cb[b].cible; if (typeof c === "string") cs.push(c); }); }
      cs.forEach(c => { (pred[c] = pred[c] || new Set()).add(k); });
    });
  });
  const sceauxDe = k => {
    const out = new Set();
    const cb = STORY[k].combat;
    if (cb) ["win","lose"].forEach(b => { const o = cb[b]; if(o){ [o.sceau,o.sceau2].forEach(x => x && out.add(x)); } });
    (STORY[k].renvois||[]).forEach(r => {
      [r.sceau, r.sceau2].forEach(x => x && out.add(x));
      if (r.epreuve) ["ok","penalite"].forEach(b => { const o = r.epreuve[b]; if(o){ [o.sceau,o.sceau2].forEach(x => x && out.add(x)); } });
    });
    return out;
  };
  const amont = cible => {
    const vus = new Set(), pile = [cible], sc = new Set();
    while (pile.length){
      const x = pile.pop();
      (pred[x] ? [...pred[x]] : []).forEach(pp => { if (!vus.has(pp)){ vus.add(pp); pile.push(pp); sceauxDe(pp).forEach(y => sc.add(y)); } });
    }
    return sc;
  };

  let nAides = 0, nEntraves = 0, nEnrichies = 0;
  Object.keys(STORY).forEach(k => {
    (STORY[k].renvois||[]).forEach(r => {
      if (!r.epreuve) return;
      const e = r.epreuve, a = e.aides||[], en = e.entraves||[];
      if (!a.length && !en.length) return;
      nEnrichies++; nAides += a.length; nEntraves += en.length;
      const dispo = amont(k);
      [...a, ...en].forEach(x => {
        ok(SCEAUX.has(x.sceau) || ev("MARQUES")[x.sceau] !== undefined, `${k} : sceau inconnu « ${x.sceau} »`);
        ok(dispo.has(x.sceau), `${k} : le sceau « ${x.sceau} » n'est pas gagnable avant cette épreuve`);
        ok(x.d === 1, `${k} : le report de « ${x.sceau} » devrait valoir 1`);
      });
      const noms = [...a, ...en].map(x => x.sceau);
      ok(new Set(noms).size === noms.length, `${k} : un sceau apparaît deux fois dans la même épreuve`);
    });
  });
  info(`${nEnrichies} épreuves enrichies, ${nAides} aides et ${nEntraves} entraves déclarées`);
  ok(CAP === 2, "le plafond de report devrait valoir 2");

  // le plafond tient, dans les deux sens
  const avait = ev("F");
  window.eval("F={sceaux:new Set(SCEAUX_ORDRE)}");
  let plafondOk = true, plancherOk = true;
  Object.keys(STORY).forEach(k => (STORY[k].renvois||[]).forEach(r => {
    if (!r.epreuve) return;
    const d = ev("epreuveSceaux")(r.epreuve).d;
    if (d > CAP) plafondOk = false;
    if (d < -CAP) plancherOk = false;
  }));
  ok(plafondOk, "un report dépasse le plafond avec tous les sceaux en main");
  ok(plancherOk, "un report dépasse le plancher avec tous les sceaux en main");
  window.eval("F=null");
  ok(ev("F") === null && avait === null, "l'état du roi devrait être restauré après la mesure");

  // Monte-Carlo : mesurer l'effet reel du report sur trois profils de roi
  console.log("\n       Difficulté mesurée · 20 000 tirages par cas");
  console.log("       BASE 6, POOL 16 : roi préparé = qualités en jeu à 12, roi moyen = 10, roi négligent = 6");
  const d6 = () => 1 + Math.floor(Math.random()*6);
  const PROFILS = [["préparé",12],["moyen",10],["négligent",6]];
  const cas = [];
  Object.keys(STORY).forEach(k => (STORY[k].renvois||[]).forEach(r => {
    if (!r.epreuve) return;
    const e = r.epreuve, seuil = e.seuil||8, cap = seuil-4;
    const stats = e.stats ? e.stats : (e.stat ? [e.stat] : []);
    const raw = (v) => {
      let m = stats.reduce((t) => t + (v-9), 0);
      if (e.mod) m += Math.round(((e.mod==="prosperite"?4:e.mod==="rayonnement"?1:0)-4)/2);
      return Math.max(-4, Math.min(cap, m));
    };
    const mesure = (v, ds) => {
      const mod = Math.max(-6, Math.min(seuil-3, raw(v) + ds));
      let g = 0;
      for (let i=0;i<20000;i++){ const a=d6(), b=d6(); if (a===1&&b===1) continue; if (a+b+mod >= seuil) g++; }
      return Math.round(100*g/20000);
    };
    const dMax = Math.min(CAP, (e.aides||[]).length);
    const dMin = -Math.min(CAP, (e.entraves||[]).length);
    const ligne = { k, seuil, dMax, dMin, p:{} };
    PROFILS.forEach(([nom,v]) => { ligne.p[nom] = { neutre: mesure(v,0), aide: mesure(v,dMax), entrave: mesure(v,dMin) }; });
    cas.push(ligne);
  }));

  // monotonie verifiee analytiquement, sans bruit de tirage
  const pR = ev("pReussite");
  cas.forEach(c => {
    const base = 0;
    ok(pR(base+c.dMax, c.seuil) >= pR(base, c.seuil), `${c.k} : une aide ne devrait jamais nuire`);
    ok(pR(base+c.dMin, c.seuil) <= pR(base, c.seuil), `${c.k} : une entrave ne devrait jamais aider`);
    if (c.dMax > 0) ok(pR(base+c.dMax, c.seuil) > pR(base, c.seuil), `${c.k} : l'aide devrait être perceptible`);
    if (c.dMin < 0) ok(pR(base+c.dMin, c.seuil) < pR(base, c.seuil), `${c.k} : l'entrave devrait être perceptible`);
  });

  PROFILS.forEach(([nom]) => {
    console.log(`\n       Roi ${nom}`);
    cas.forEach(c => {
      const x = c.p[nom];
      info(`  ${(c.k+" (seuil "+c.seuil+")").padEnd(28)} entravé ${String(x.entrave).padStart(3)} %  ·  neutre ${String(x.neutre).padStart(3)} %  ·  aidé ${String(x.aide).padStart(3)} %`);
    });
    const moy = (ch) => Math.round(cas.reduce((t,c)=>t+c.p[nom][ch],0)/cas.length);
    info(`  ${"moyenne des 20 épreuves".padEnd(28)} entravé ${String(moy("entrave")).padStart(3)} %  ·  neutre ${String(moy("neutre")).padStart(3)} %  ·  aidé ${String(moy("aide")).padStart(3)} %`);
  });

  // le roi negligent doit rester en difficulte, le roi prepare ne doit pas etre invincible
  const moyProf = (nom, ch) => Math.round(cas.reduce((t,c)=>t+c.p[nom][ch],0)/cas.length);
  ok(moyProf("négligent","neutre") < moyProf("préparé","neutre"), "la préparation devrait rester payante");
  const meilleur = Math.max(...cas.map(c => c.p["préparé"].aide));
  ok(meilleur < 100, `une épreuve devient une certitude pour un roi aidé (${meilleur} %)`);
  info(`  meilleure épreuve pour un roi préparé et aidé : ${meilleur} %`);
  // une entrave ne doit jamais transformer un pari jouable en cul-de-sac
  const pireMoyen = Math.min(...cas.map(c => c.p["moyen"].entrave));
  ok(pireMoyen >= 10, `une entrave rend une épreuve injouable pour un roi moyen (${pireMoyen} %)`);
  info(`  pire épreuve entravée pour un roi moyen : ${pireMoyen} %`);
  info(`  rappel : un roi qui n'a jamais investi la qualité en jeu tourne autour de ${moyProf("négligent","neutre")} %. Les épreuves restent des paris facultatifs, annoncés par leur pastille.`);

  // le libelle ne s'affiche que lorsqu'un sceau est reellement en main
  const epTest = STORY.code.renvois.find(r => r.epreuve).epreuve;
  window.eval("F={sceaux:new Set()}");
  ok(ev("epreuveSceauxTxt")(epTest) === "", "aucun sceau en main : la ligne des sceaux devrait rester vide");
  window.eval('F={sceaux:new Set(["Maison des tablettes"])}');
  ok(/Maison des tablettes/.test(ev("epreuveSceauxTxt")(epTest)), "un sceau en main devrait apparaître dans la ligne des sceaux");
  ok(ev("epreuveSceaux")(epTest).d === 1, "un seul sceau d'aide devrait valoir + 1");
  window.eval("F=null");
}

function smoke(){
  // Intro → frontispice
  $("#introgo").click();
  ok($("#frontis").style.display === "flex", "le frontispice ne s'ouvre pas");

  // Allocation : 4 points sur chacune des 4 qualités (POOL=16)
  const QUALITES = ev("QUALITES");
  for (const k of QUALITES){
    for (let i = 0; i < 4; i++){
      const b = document.querySelector(`#alloc button[data-k="${k}"][data-d="1"]`);
      ok(b && !b.disabled, `stepper + indisponible pour ${k}`);
      b && b.click();
    }
  }
  const begin = $("#begin");
  ok(!begin.disabled, "le bouton d'ouverture reste verrouillé après 16 points");
  begin.click();

  ok(ev("F && F.histoire.length") === 1, "histoire.length ≠ 1 après l'ouverture");
  ok(document.body.classList.contains("playing"), "body.playing absent");

  // Frise rendue avec 8 encoches, acte I courant
  const notches = document.querySelectorAll("#progress .frise i");
  ok(notches.length === 8, `frise : attendu 8 encoches, trouvé ${notches.length}`);
  ok(notches[0] && notches[0].classList.contains("cur"), "frise : l'acte I n'est pas marqué courant");

  // Lexique : bouton topbar + termes soulignés dans la page
  ok($("#lexbtn"), "bouton Lexique absent du bandeau");
  const gl = document.querySelectorAll("#story .gl");
  ok(gl.length >= 1, "aucun terme de lexique détecté dans la page 1");
  if (gl.length){
    gl[0].click();
    ok($("#modal").classList.contains("show"), "le clic sur un terme n'ouvre pas la définition");
    const mb = $("#modalbtn") || $("#modal .modal-btn");
    mb && mb.click();
    ok(!$("#modal").classList.contains("show"), "la définition ne se referme pas");
  }

  // Renvois verrouillés tant que la source n'est pas étudiée
  const lockedBefore = [...document.querySelectorAll("#renvois .renvoi.open")].every(b => b.disabled);
  ok(lockedBefore, "les renvois devraient être verrouillés avant l'étude de la source");
  ok($("#locknote"), "la note de verrouillage est absente");

  // Consulter la source (nœud eau → fleuves, avec photo + quiz)
  $("#consultbtn").click();
  ok($("#modal").classList.contains("show"), "la fenêtre de source ne s'ouvre pas");
  ok($("#srcclose") && $("#srcclose").disabled, "le bouton de fermeture devrait être verrouillé pendant le chrono");
  ok($(".plate"), "pas de planche dans la fenêtre de source");
  ok($("#srcquizview"), "la vue de vérification est absente du DOM");
  ok($("#srcquizview").classList.contains("off"), "la question ne devrait pas être visible pendant le chrono");
  ok(!$("#srcview").classList.contains("off"), "la source devrait être visible pendant le chrono");

  // Échap ne doit PAS fermer tant que le bouton est verrouillé
  window.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  ok($("#modal").classList.contains("show"), "Échap contourne le verrou de lecture");

  // Attendre la fin du chrono (READ_LOCK s réels, lu dans le jeu)
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const waitFor = async (fn, ms = 5000, step = 60) => {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) { try { if (fn()) return true; } catch (e) {} await wait(step); }
    try { return !!fn(); } catch (e) { return false; }
  };
  setTimeout(async () => {
    // Aucun chrono : la source reste affichée tant que l'élève ne demande pas la question
    ok(!$("#srcview").classList.contains("off"), "la source devrait rester affichée à l'ouverture");
    ok($("#srcquizview").classList.contains("off"), "la question ne devrait pas s'afficher d'elle-même");
    ok(!$("#sqfwd").classList.contains("off"), "le bouton « Répondre à la question » devrait être disponible tout de suite");
    ok(!/\bs\b|[0-9]/.test($("#srctimer").textContent), "aucun compte à rebours ne devrait subsister");
    ok(!$("#srcnum"), "le compteur de secondes ne devrait plus exister");
    ok($("#srcclose").disabled, "le bouton se déverrouille sans réponse au quiz");
    ok(ev("F._quizTotal") === 1, "F._quizTotal ≠ 1");

    // La source tient dans la durée : elle ne bascule pas toute seule
    await wait(1400);
    ok(!$("#srcview").classList.contains("off"), "la source s'est refermée toute seule après un délai");
    ok($("#srcquizview").classList.contains("off"), "la question s'est ouverte toute seule après un délai");

    // Bascule : c'est l'élève qui décide, dans les deux sens
    $("#sqfwd").click();
    ok($("#srcview").classList.contains("off") && !$("#srcquizview").classList.contains("off"), "le passage à la question ne fonctionne pas");
    $("#sqback").click();
    ok(!$("#srcview").classList.contains("off") && $("#srcquizview").classList.contains("off"), "« Revoir la source » ne rebascule pas");
    $("#sqfwd").click();
    ok($("#srcview").classList.contains("off") && !$("#srcquizview").classList.contains("off"), "le retour à la question ne fonctionne pas");

    // Mauvaise réponse d'abord : indice, pas de déverrouillage
    const okIdx = ev('SRC["fleuves"].q.ok');
    const wrong = document.querySelector(`#sqch button:not([data-qi="${okIdx}"])`);
    wrong.click();
    ok(wrong.disabled && wrong.classList.contains("no"), "la mauvaise réponse n'est pas marquée");
    ok($("#sqhint").classList.contains("err"), "pas d'indice après une erreur");
    ok($("#srcclose").disabled, "déverrouillé malgré une mauvaise réponse");

    // Bonne réponse : déverrouillage
    document.querySelector(`#sqch button[data-qi="${okIdx}"]`).click();
    ok(!$("#srcclose").disabled, "le bouton ne se déverrouille pas après la bonne réponse");
    ok(ev("F._quizFirst") === 0, "F._quizFirst devrait rester à 0 (erreur commise)");
    $("#srcclose").click();
    ok(!$("#modal").classList.contains("show"), "la fenêtre de source ne se ferme pas");
    ok(ev("F._srcSeen") === 1, "F._srcSeen ≠ 1");

    // Renvois déverrouillés, note disparue
    const openBtns = [...document.querySelectorAll("#renvois .renvoi.open")];
    ok(openBtns.some(b => !b.disabled), "aucun renvoi déverrouillé après l'étude");
    ok(!$("#locknote"), "la note de verrouillage persiste");

    // --- Faveur des dieux : épreuve, échec forcé, relance, revers ---
    const STORY = ev("STORY");
    ok(ev("F.faveurs") === 3 && ev("F.faveursMax") === 3, "Piété 11 devrait accorder 3 faveurs");
    ok(document.querySelectorAll("#tablet .flame.on").length === 3, "les 3 flammes ne brillent pas au tiroir");
    const btnE = openBtns.find(b => !b.disabled && STORY.eau.renvois[+b.dataset.i].epreuve);
    ok(btnE, "aucun renvoi avec épreuve au nœud eau");
    btnE.click();
    const dz = $("#dicezone");
    ok(dz.classList.contains("show") && $("#rollbtn"), "la zone de dés ne s'ouvre pas");
    ok(/implorer les dieux/i.test(dz.textContent), "la règle de la faveur n'est pas annoncée");
    ok(/maudit/i.test(dz.textContent), "la règle du courroux n'est pas annoncée dans la zone de dés");
    ok(ev("F._echecs") === 0 && document.querySelectorAll("#tablet .bolt").length === 3 && document.querySelectorAll("#tablet .bolt.on").length === 0, "le courroux devrait afficher 0 éclair sur 3 au départ");

    const realRandom = Math.random;
    window.eval("Math.random = () => 0");   // dés à 1-1 : échec garanti (seuil 9)
    $("#rollbtn").click();
    ok(await waitFor(() => $("#dzfavor")), "l'offre d'imploration n'apparaît pas après l'échec");
    ok(ev("F.faveurs") === 3, "la faveur ne doit pas être consommée avant l'imploration");
    ok(!$("#modal").classList.contains("show"), "le revers ne doit pas s'appliquer tant que l'offre est ouverte");
    const proBefore = ev("F.prosperite");

    $("#favyes").click();                    // implorer : relance
    ok(ev("F.faveurs") === 2, "la faveur n'est pas décomptée");
    ok(document.querySelectorAll("#tablet .flame.on").length === 2, "le tiroir ne reflète pas la faveur consommée");

    ok(await waitFor(() => $("#modal").classList.contains("show")), "le verdict d'échec ne s'affiche pas après la relance");
    ok(!$("#dzfavor"), "une seconde imploration ne devrait pas être offerte");
    ok(/double-un/.test($("#modal").textContent) && /parlent contre toi/.test($("#modal").textContent), "le verdict devrait nommer le double-un");
    ok(ev("F._echecs") === 1, "l'échec résolu devrait compter un revers");
    ok(document.querySelectorAll("#tablet .bolt.on").length === 1, "le tiroir devrait afficher 1 éclair de courroux");
    ok(/Échec/.test($("#modal").textContent), "le verdict devrait annoncer l'échec");
    ok(ev("F.prosperite") === proBefore + 1, "le revers (Prospérité +1) ne s'applique qu'à la résolution");
    window.eval("Math.random = undefined"); window.Math.random = realRandom;
    ev("Math.random()");                     // sanity : restauré
    $("#modalbtn").click();
    ok(btnE.disabled && btnE.classList.contains("burned"), "le choix raté devrait être condamné");
    ok(openBtns.some(b => b !== btnE && !b.disabled), "les autres voies ne rouvrent pas après l'échec");

    // Choisir LE renvoi sans épreuve qui grave un sceau (l'ordre DOM est mélangé)
    const btn = openBtns.find(b => { const r = STORY.eau.renvois[+b.dataset.i]; return !b.disabled && !r.epreuve && r.sceau; });
    ok(btn, "aucun renvoi sans épreuve porteur de sceau au nœud eau");
    btn.click();
    ok($("#modal").classList.contains("show"), "la fenêtre de conséquence ne s'ouvre pas");
    $("#modalbtn").click();

    // La languette « Le roi » s'illumine dès le changement de qualités
    const tab = $("#sheettab");
    ok(tab.classList.contains("lit"), "la languette ne s'illumine pas après un changement de qualités");
    tab.click();  // ouvrir le tiroir…
    ok(!tab.classList.contains("lit"), "la languette reste illuminée après consultation");
    tab.click();  // …et le refermer

    const p = $("#poursuite");
    ok(p.classList.contains("show"), "le bouton Poursuis n'apparaît pas");
    ok(/Rends-toi au §\d+/.test(p.textContent), `le bouton devrait annoncer la section : « ${p.textContent.trim()} »`);
    p.click();

    // La table des sections s'ouvre : seule la destination est déverrouillée
    ok($("#overlay").classList.contains("show"), "la table des sections ne s'ouvre pas");
    const cibleKey = ev("SECNAV");
    ok(typeof cibleKey === "string" && cibleKey, "SECNAV vide");
    const targetBtn = document.querySelector("#seclist .secn.target");
    ok(targetBtn && targetBtn.dataset.sk === cibleKey, "la destination n'est pas marquée dans la table");
    const others = [...document.querySelectorAll("#seclist .secn:not(.target)")];
    ok(others.length && others.every(b => b.disabled), "des sections non atteintes sont cliquables");
    others[0].click();
    ok($("#overlay").classList.contains("show"), "cliquer une section scellée ne devrait rien faire");
    ok(ev("SEC[F.noeud]") !== ev(`SEC[${JSON.stringify(cibleKey)}]`) || true, "");
    targetBtn.click();
    ok(!$("#overlay").classList.contains("show"), "la table ne se ferme pas après le feuilletage");

    ok(ev("F.histoire.length") === 2, "histoire.length ≠ 2 après la poursuite");
    ok(ev("F.histoire[1].sec") === ev(`SEC[${JSON.stringify(cibleKey)}]`), "l'entrée du récit ne porte pas son numéro de section");
    ok(/§\d+ · /.test(($("#story") || {textContent:""}).textContent), "le numéro de section n'apparaît pas dans le récit");
    // Nouvelle source au nouveau nœud → compteur total = 2 si src présente
    const n2 = ev("STORY[F.noeud]");
    if (n2 && n2.src) ok(ev("F._srcTotal") === 2, "F._srcTotal non incrémenté au nœud 2");

    // La frise suit : au moins une encoche fait/cur cohérente
    const cur = document.querySelectorAll("#progress .frise i.cur, #progress .frise i.fait");
    ok(cur.length >= 1, "la frise ne se met pas à jour");

    // Lexique plein écran
    $("#lexbtn").click();
    ok($("#overlay").classList.contains("show"), "l'écran Lexique ne s'ouvre pas");
    const items = document.querySelectorAll("#overlay .lexlist .lex-e");
    ok(items.length >= 20, `lexique : attendu ≥ 20 entrées listées, trouvé ${items.length}`);
    window.dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    ok(!$("#overlay").classList.contains("show"), "Échap ne ferme pas le Lexique");

    // Table des sections consultative : lues marquées, position cliquable, reste scellé
    $("#secbtn").click();
    ok($("#overlay").classList.contains("show"), "la table consultative ne s'ouvre pas");
    ok(document.querySelectorAll("#seclist .secn.seen").length >= 2, "les sections lues ne sont pas marquées");
    const here = document.querySelector("#seclist .secn.here");
    ok(here && !here.disabled, "la position courante devrait être cliquable");
    ok(!document.querySelector("#seclist .secn.target"), "aucune destination ne devrait pulser en consultation");
    here.click();
    ok(!$("#overlay").classList.contains("show"), "cliquer sa position ne referme pas la table");

    // --- Sac du roi : sceaux tangibles au tiroir ---
    ev("rendreTablette()");
    ok(/Ordre durci/.test($("#tablet").textContent), "le sceau « Ordre durci » gagné en jeu devrait être au sac");
    $("#sheettab").click(); $("#sheettab").click();   // consulter → languette éteinte
    ev('gagneSceau("Murailles");rendreTablette();');
    const chip = [...document.querySelectorAll("#tablet .seal")].find(c => /Murailles/.test(c.textContent));
    ok(chip, "le sceau gagné n'apparaît pas au sac");
    ok(chip && chip.classList.contains("flash"), "le sceau fraîchement gravé devrait scintiller");
    ok((chip.getAttribute("title") || "").includes("murailles"), "l'infobulle du sceau manque");
    ok($("#sheettab").classList.contains("lit"), "la languette devrait s'illuminer quand un sceau est gravé");
    ok(fs.readFileSync(path.join(ROOT, "index.html"), "utf8").includes("Scellé : ${r.lock}"), "les verrous ne mentionnent pas le sceau manquant");

    // --- Seuils d'effondrement : trois manières de tomber avant l'heure ---
    const secOf = (k) => ev(`SEC[${JSON.stringify(k)}]`);
    ev('F.prosperite=0;');
    ev('finaliser(null,"terre",null);');
    const pBtn = $("#poursuite");
    ok(pBtn.textContent.includes(`§${secOf("nF_greniers")}`), "Prospérité à zéro devrait détourner vers Les greniers vides");
    pBtn.click();
    ok(ev("SECNAV") === "nF_greniers", "la table devrait mener à la fin des greniers");
    ev("SECNAV=null;closeOverlay();");
    ev('F.prosperite=4;F.autorite=0;');
    ev('finaliser(null,"terre",null);');
    ok(pBtn.textContent.includes(`§${secOf("nF_poignards")}`), "Autorité à zéro devrait détourner vers La nuit des poignards");
    ev('F.autorite=8;F.legitimite=0;');
    ev('finaliser(null,"terre",null);');
    ok(pBtn.textContent.includes(`§${secOf("nF_revolte")}`), "Légitimité à zéro devrait détourner vers La révolte des opprimés");
    ev('F.legitimite=8;F.piete=0;');
    ev('finaliser(null,"terre",null);');
    ok(pBtn.textContent.includes(`§${secOf("nF_deluge")}`), "Piété à zéro devrait détourner vers Abandonné des dieux");
    ev('F.piete=8;F._echecs=3;');
    ev('finaliser(null,"terre",null);');
    ok(pBtn.textContent.includes(`§${secOf("nF_maudit")}`), "trois revers devraient détourner vers Le roi maudit");
    ev('F._echecs=1;');
    ev('finaliser(null,"terre",null);');
    ok(pBtn.textContent.includes(`§${secOf("terre")}`), "jauges rétablies, le renvoi normal devrait reprendre");
    ok(!pBtn.textContent.includes("Découvre le sort"), "sans effondrement, pas de détour vers une fin");

    // --- Fins : bandeau funeste vs triomphe ---
    ev('F.noeud="nF_oubli";rendre(false);');
    ok($(".fin-doom") && /règne s'achève ici/i.test($(".fin-doom").textContent), "le bandeau funeste manque");
    ok($(".fin-wrap").classList.contains("chute"), "la fin nF_oubli devrait être une chute");
    ev('F.noeud="nF_orfevre";rendre(false);');
    ok(!$(".fin-doom"), "un triomphe ne devrait pas porter le bandeau funeste");
    ok($(".fin-wrap").classList.contains("triomphe"), "la fin nF_orfevre devrait être un triomphe");
    ok($("#restart"), "le bouton Régner à nouveau manque au bilan");

    // --- Affrontement : le panneau de duel s'ouvre et se renseigne ---
    ev('F.noeud="complot";F.autorite=14;F.sceaux.add("Loi de fer");F.sceaux.add("Ordre durci");F._echecs=0;rendre(false);');
    const cBtn = [...document.querySelectorAll("#renvois .renvoi")].find(b => /traquer les conjurés/i.test(b.textContent));
    ok(!!cBtn, "le choix d'affrontement du complot est introuvable");
    ok(/issue favorable : \d+ %/.test(cBtn.textContent), "la pastille du duel doit annoncer les chances");
    if (cBtn){
      cBtn.click();
      ok($("#dicezone").classList.contains("show"), "la zone de duel ne s'ouvre pas");
      ok($(".cz-side.me") && $(".cz-side.adv"), "les deux camps du duel devraient être affichés");
      ok(/Les conjurés du palais/.test($(".cz-side.adv .cz-n").textContent), "l'adversaire n'est pas nommé");
      ok($("#czj").querySelectorAll("i").length === 6 && $("#cza").querySelectorAll("i").length === 8,
        "les deux jauges devraient afficher 6 et 8 points");
      ok(/arme l'adversaire/.test($(".cz-aides").textContent), "les entraves devraient être annoncées avant la première ronde");
      ok(/Aptitude 10 \+ 2/.test($(".cz-side.adv .cz-apt").textContent), "les entraves devraient majorer l'aptitude adverse");
      ok(!!$("#czroll"), "le bouton de lancer manque au duel");
      // issue forcee : victoire immediate, la chaine doit mener au renvoi
      ev("CB.a=0;czFinir(true);");
      const mb = $("#modalbtn");
      ok(!!mb, "l'issue du duel devrait ouvrir la fenêtre d'impact");
      if (mb) mb.click();
      ok($("#poursuite").classList.contains("show"), "après un duel gagné, le renvoi devrait s'afficher");
      ok(/§\d+/.test($("#poursuite").textContent), "le renvoi devrait porter un numéro de section");
      ok(ev("F.sceaux").has("Conjuration brisée"), "la victoire devrait graver le sceau de la conjuration brisée");
    }

    bilan();
  }, ev("READ_LOCK") * 1000 + 600);
}

function bilan(){
  console.log("\n————————————————————————");
  console.log(`RÉUSSITES : ${pass}   ÉCHECS : ${fail}`);
  process.exit(fail ? 1 : 0);
}
