# Lugal — un livre dont vous êtes le roi

Un *serious game* en français, type **livre dont vous êtes le héros**, pour la
réalité sociale **« L'émergence d'une civilisation »** (Mésopotamie, cours HEC,
sec. 1, PFEQ). L'élève règne sur une cité-État le long d'une **trame en arbre** :
un **chemin optimal court** (≈ 10 décisions traversant les 6 actes) et, dès qu'on
s'en écarte, des **problématiques** qui pénalisent et rallongent le parcours. La
partie mène à l'une de **12 fins** selon les qualités du roi et l'état de sa
civilisation.

Vanilla **HTML / CSS / JS** — aucun serveur, aucune dépendance, aucune image
externe (tout est dessiné ou écrit dans le fichier).

## L'accueil : l'élève façonne son roi
Avant de jouer, l'élève **répartit lui-même ses points** entre les quatre
qualités du roi (Autorité, Sagesse, Piété, Légitimité). Chaque qualité est
accompagnée d'une **explication de son importance** : elles décident des paris
que le roi pourra tenter, des voies qui s'ouvriront à lui et de la façon dont
son règne se terminera. Ce choix de départ donne du sens à toute la partie.

## Le livre, en deux pages
- **Page de gauche — le récit du règne.** Le texte **remplit le feuillet**,
  puis **tourne** vers une nouvelle page une fois la page pleine, comme dans un
  vrai livre. Une barre
  de **feuilletage** (‹ feuillet précédent · *à présent* · revenir au présent »)
  permet à l'élève de **revenir lire** l'histoire de son règne sans rien perdre de
  sa décision en cours.
- **Page de droite — la décision.** Dans l'ordre : la **question**, un bouton
  **Consulter la source** (qui ouvre le document créé dans une **fenêtre**), les
  **choix**, puis un bouton **« Poursuis »** pour tourner la page.

À chaque page : les choix restent **verrouillés tant que la source n'a pas été
étudiée**. Cliquer **Consulter la source** l'ouvre en **pop-up** avec un **chrono
de 4 secondes** ; une fois étudiée, les choix se déverrouillent et l'élève peut la
**rouvrir à volonté** (« Revoir la source »), sans encombrer la page. Chaque choix
montre son **effet sur les qualités** et, pour les paris, le badge **« Réussite :
X % »** ; les choix à dés portent **« (Jet de dés) »**. La zone de dés **explique
tout le calcul** (règle, bonus détaillé par qualité, seuil, % de réussite, puis
verdict chiffré). Un **pop-up** présente enfin la conséquence — la leçon à retenir.

## La trame en arbre : le chemin optimal et ses écarts
Le bon roi suit un **chemin optimal court** : à chaque acte, un choix sûr fait
avancer proprement à l'acte suivant. **S'écarter coûte cher.** Un choix non
optimal déclenche une **problématique** — sécheresse, crue, voleurs, crocodile,
fraude, disette, mauvais présage, révolte, siège — qui **pénalise les jauges** et
**ajoute des pages** au parcours (un règne plus long = de mauvais choix).
Chaque problématique offre une **porte de sortie** pour **revenir sur le chemin
optimal** (parfois au prix d'un jet de dés), mais **t'entêter peut faire perdre
la partie** : dès l'acte III, une crise mal gérée peut mener droit à une fin
funeste. Le **§** affiché suit donc le **parcours réel** de l'élève, qui varie
d'une partie à l'autre.

## Les dés conjugués aux points du roi
Les jets de dés sont nombreux, mais **jamais gratuits** : chacun met en jeu les
**qualités pertinentes au domaine**. Le bonus au jet est la **somme de
l'investissement** du roi dans ces qualités (chaque qualité au-dessus de 9
ajoute, en dessous retranche), affichée en clair — p. ex. *« Autorité 14 +
Sagesse 12 · bonus + 8 »*. La répartition de départ décide donc vraiment de ce que
le roi réussit : un roi qui a négligé une qualité **échoue** dans son domaine.
- **Décisions religieuses** (temple, présage) → **Piété**.
- **Décisions de justice** (faire respecter la loi gravée) → **Autorité + Sagesse**.
- **Grands travaux et défense** (canaux, murailles) → **Autorité (+ Prospérité)**.
- **Commerce et disette** (acheter du grain) → **Sagesse + Prospérité**.

Un roi bâtisseur réussit ses chantiers et sa loi ; un roi pieux obtient la faveur
des dieux mais risque le coup d'État s'il néglige sa légitimité. **Échouer un jet
fait basculer dans une problématique** : c'est là que les écarts se paient. Les
choix sont en outre **présentés dans un ordre aléatoire** — le bon n'est jamais à
la même place.

## La feuille du roi
Volontairement sobre et utile : les **quatre qualités** (qui montent et
descendent selon les choix, et qu'on a soi-même réparties), les **deux jauges de
civilisation** (Prospérité, Rayonnement), et la **chronique du règne**. Les
qualités servent vraiment : elles fixent les probabilités des paris et
déterminent la fin.

## Sources — toutes créées
Chaque source distingue clairement le **document/illustration** lui-même de sa
**« Lecture de la source »** (le commentaire pédagogique), et de son attribution.
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
