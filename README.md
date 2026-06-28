# Lugal — un livre dont vous êtes le roi

Un *serious game* en français, type **livre dont vous êtes le héros**, pour la
réalité sociale **« L'émergence d'une civilisation »** (Mésopotamie, HEC sec. 1,
PFEQ). L'élève règne sur une cité-État : il lit un texte, **consulte une source
authentique** (banque HEC), réfléchit, décide — puis un **pop-up lui explique
l'impact** de son choix. **24 décisions par règne**, **12 fins** selon l'état
accumulé de ses qualités et de sa civilisation.

Vanilla **HTML / CSS / JS** — aucun serveur, aucune dépendance.

## Déroulé d'une page
1. **Un texte** pose la situation (sans nommer le document).
2. Bouton **« Consulter la source »** : l'élève l'ouvre pour décider en
   connaissance de cause. Tant qu'il ne l'a pas consultée, **les réponses sont
   verrouillées**.
3. À la consultation, **un chrono de 6 secondes** invite à étudier la source ;
   les choix se déverrouillent ensuite.
4. Chaque réponse affiche **son impact sur les qualités du roi** et, pour les
   paris, **le % de réussite aux dés**.
5. Après la décision, **un pop-up présente la conséquence** — la leçon à retenir.

> Les sources textuelles ou iconographiques ne sont pas toujours pertinentes :
> 6 des 24 décisions se prennent **sans source**, par pur jugement politique.

## La feuille du roi
- **Qualités du roi** (montent et descendent selon les choix) : Autorité,
  Sagesse, Piété, Légitimité.
- **Sa civilisation** : Prospérité (l'économie) et Rayonnement (le développement
  et l'héritage).
- **Sceaux du règne** : 12 marques irréversibles des grands choix (écriture,
  code gravé, doctrine de justice, alliances, murailles, héritier…).
- **Paris (dés)** : `2 dés + (qualité − 9) ≥ seuil`. En cas d'échec, l'option est
  perdue, une pénalité s'applique, et l'élève se rabat sur les choix restants.

## Héberger sur GitHub Pages
1. Pousse **tout le contenu de ce dossier** (avec `assets/`) dans un dépôt.
2. **Settings → Pages → Deploy from a branch**, branche `main`, dossier `/(root)`.
3. Le jeu est en ligne à `https://<utilisateur>.github.io/<dépôt>/`.

> `.nojekyll` (présent) garantit que `assets/` est servi tel quel ; ne le supprime pas.

## Structure
```
index.html                  jeu complet (interface + moteur + trame)
.nojekyll                    sert assets/ tel quel sur Pages
assets/img/sources/*.png     les 16 images-sources (banque HEC)
SOURCES.md                   crédits et licences de chaque source
LICENSE                      MIT (code) ; les images gardent leur licence
```

## Personnaliser (dans `index.html`)
- **Trame** : objet `STORY`. Chaque nœud a `texte` (long), `consigne`, un `src`
  optionnel, et des `renvois`. Chaque renvoi porte `eff` (effets sur les qualités),
  `impact` (texte du pop-up), parfois une `epreuve` (dés) et un `sceau`.
- **Sources** : objet `SRC` (titre, image, contenu, citation). Pour changer une
  image, dépose le fichier dans `assets/img/sources/` et ajuste le chemin.
- **Fins** : fonction `evaluerFin()` — seuils de qualités, de Rayonnement, de
  Légitimité et sceaux requis. Deux fins (« révolte », « abandonné des dieux »)
  sont rares ; ajuste leurs seuils après quelques parties tests.

---
Conçu par **Mathieu Mercier**. Sources : banque **HEC** (RÉCIT univers social,
Wikimedia Commons, musée du Louvre, British Museum…). Voir `SOURCES.md`.
