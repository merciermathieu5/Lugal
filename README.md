# Lugal — un livre dont vous êtes le roi

Un *serious game* en français, type **livre dont vous êtes le héros**, pour la
réalité sociale **« L'émergence d'une civilisation »** (Mésopotamie, cours HEC,
sec. 1, PFEQ). L'élève règne sur une cité-État sur **24 décisions**, qui mènent
à l'une de **12 fins** selon les qualités du roi et l'état de sa civilisation.

Vanilla **HTML / CSS / JS** — aucun serveur, aucune dépendance, aucune image
externe (tout est dessiné ou écrit dans le fichier).

## L'accueil : l'élève façonne son roi
Avant de jouer, l'élève **répartit lui-même ses points** entre les quatre
qualités du roi (Autorité, Sagesse, Piété, Légitimité). Chaque qualité est
accompagnée d'une **explication de son importance** : elles décident des paris
que le roi pourra tenter, des voies qui s'ouvriront à lui et de la façon dont
son règne se terminera. Ce choix de départ donne du sens à toute la partie.

## Le livre, en deux pages
- **Page de gauche — le récit du règne.** Tous les paragraphes traversés s'y
  accumulent comme dans un vrai livre-jeu : le paragraphe courant est **en
  pleine encre**, les précédents **pâlissent**.
- **Page de droite — la décision.** Dans l'ordre : un bouton **Consulter la
  source** (qui révèle le document créé), la **question**, les **choix**, puis un
  bouton **« Poursuis au §X »** pour tourner la page.

À chaque page : les choix restent **verrouillés tant que la source n'est pas
consultée** ; la consultation lance un **chrono de 6 secondes** ; chaque choix
montre son **effet sur les qualités** (et, pour les paris, le **% de réussite**
aux dés) ; et un **pop-up** présente la conséquence — la leçon à retenir.

> 6 des 24 décisions se prennent **sans source**, par pur jugement politique.

## La feuille du roi
Volontairement sobre et utile : les **quatre qualités** (qui montent et
descendent selon les choix, et qu'on a soi-même réparties), les **deux jauges de
civilisation** (Prospérité, Rayonnement), et la **chronique du règne**. Les
qualités servent vraiment : elles fixent les probabilités des paris et
déterminent la fin.

## Sources — toutes créées
Aucune image d'archive. **13 illustrations originales** au trait (style gravure,
dessinées en SVG) et **5 documents composés** pour le jeu, honnêtement étiquetés
comme reconstitutions. Voir `SOURCES.md`.

## Héberger sur GitHub Pages
1. Pousse le contenu de ce dossier dans un dépôt.
2. **Settings → Pages → Deploy from a branch**, branche `main`, dossier `/(root)`.
3. En ligne à `https://<utilisateur>.github.io/<dépôt>/`.

## Structure
```
index.html   jeu complet : livre deux pages, moteur, trame et sources
.nojekyll    pour GitHub Pages
SOURCES.md   note sur les sources (toutes créées pour le jeu)
LICENSE      MIT — couvre le code, les illustrations et les textes
```

## Personnaliser (dans `index.html`)
- **Points de départ** : `BASE` (par qualité), `POOL` (à répartir), `MAXADD`.
- **Trame** : objet `STORY` (chaque nœud : `texte`, `consigne`, `src` optionnel,
  `renvois` avec `eff`, `impact`, parfois `epreuve`).
- **Sources** : objet `SRC` (illustration `svg` ou document `doc`).
- **Fins** : fonction `evaluerFin()` (seuils de qualités, de Rayonnement, de
  Légitimité, et sceaux requis).

---
Conçu par **Mathieu Mercier**. Toutes les sources sont créées pour le jeu.
