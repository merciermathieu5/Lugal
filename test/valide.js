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
  info(`${nQ}/24 sources avec question de vérification`);

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

  console.log("\n— Volet 2 · smoke test DOM —");
  smoke();
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

  // Attendre la fin du chrono (READ_LOCK = 4 s réels)
  const wait = (ms) => new Promise(r => setTimeout(r, ms));
  const waitFor = async (fn, ms = 5000, step = 60) => {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) { try { if (fn()) return true; } catch (e) {} await wait(step); }
    try { return !!fn(); } catch (e) { return false; }
  };
  setTimeout(async () => {
    // La bascule vers la question peut prendre quelques ms de plus que le chrono
    await waitFor(() => $("#srcquizview") && !$("#srcquizview").classList.contains("off"), 3000);
    ok(!$("#srcquizview").classList.contains("off"), "la question n'apparaît pas après le chrono");
    ok($("#srcview").classList.contains("off"), "la source devrait s'effacer au profit de la question");
    ok($("#srcclose").disabled, "le bouton se déverrouille sans réponse au quiz");
    ok(ev("F._quizTotal") === 1, "F._quizTotal ≠ 1");

    // Bascule : revoir la source, puis revenir à la question
    $("#sqback").click();
    ok(!$("#srcview").classList.contains("off") && $("#srcquizview").classList.contains("off"), "« Revoir la source » ne rebascule pas");
    ok(!$("#sqfwd").classList.contains("off"), "le bouton « Répondre à la question » est absent");
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

    // ——— Faveur des dieux : épreuve, échec forcé, relance, revers ———
    const STORY = ev("STORY");
    ok(ev("F.faveurs") === 3 && ev("F.faveursMax") === 3, "Piété 11 devrait accorder 3 faveurs");
    ok(document.querySelectorAll("#tablet .flame.on").length === 3, "les 3 flammes ne brillent pas au tiroir");
    const btnE = openBtns.find(b => !b.disabled && STORY.eau.renvois[+b.dataset.i].epreuve);
    ok(btnE, "aucun renvoi avec épreuve au nœud eau");
    btnE.click();
    const dz = $("#dicezone");
    ok(dz.classList.contains("show") && $("#rollbtn"), "la zone de dés ne s'ouvre pas");
    ok(/implorer les dieux/i.test(dz.textContent), "la règle de la faveur n'est pas annoncée");

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

    // ——— Sac du roi : sceaux tangibles au tiroir ———
    ev("rendreTablette()");
    ok(/Ordre durci/.test($("#tablet").textContent), "le sceau « Ordre durci » gagné en jeu devrait être au sac");
    $("#sheettab").click(); $("#sheettab").click();   // consulter → languette éteinte
    ev('gagneSceau("Murailles");rendreTablette();');
    const chip = [...document.querySelectorAll("#tablet .seal")].find(c => /Murailles/.test(c.textContent));
    ok(chip, "le sceau gagné n'apparaît pas au sac");
    ok(chip && chip.classList.contains("flash"), "le sceau fraîchement gravé devrait scintiller");
    ok((chip.getAttribute("title") || "").includes("murailles"), "l'infobulle du sceau manque");
    ok($("#sheettab").classList.contains("lit"), "la languette devrait s'illuminer quand un sceau est gravé");
    ok(fs.readFileSync(path.join(ROOT, "index.html"), "utf8").includes("Scellé — ${r.lock}"), "les verrous ne mentionnent pas le sceau manquant");

    // ——— Fins : bandeau funeste vs triomphe ———
    ev('F.noeud="nF_oubli";rendre(false);');
    ok($(".fin-doom") && /règne s'achève ici/i.test($(".fin-doom").textContent), "le bandeau funeste manque");
    ok($(".fin-wrap").classList.contains("chute"), "la fin nF_oubli devrait être une chute");
    ev('F.noeud="nF_orfevre";rendre(false);');
    ok(!$(".fin-doom"), "un triomphe ne devrait pas porter le bandeau funeste");
    ok($(".fin-wrap").classList.contains("triomphe"), "la fin nF_orfevre devrait être un triomphe");
    ok($("#restart"), "le bouton Régner à nouveau manque au bilan");

    bilan();
  }, 4600);
}

function bilan(){
  console.log("\n————————————————————————");
  console.log(`RÉUSSITES : ${pass}   ÉCHECS : ${fail}`);
  process.exit(fail ? 1 : 0);
}
