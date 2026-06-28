# Lugal — un livre dont vous êtes le roi

Un *serious game* en français, type **livre dont vous êtes le héros**, pour la
réalité sociale **« L'émergence d'une civilisation »** (Mésopotamie, HEC sec. 1,
PFEQ). L'élève règne sur une cité-État : à chaque page, il lit une **source
authentique** (banque HEC) et prend une décision. **24 décisions par règne**,
**12 fins** différentes selon les choix accumulés.

Vanilla **HTML / CSS / JS** — aucun serveur, aucune dépendance à installer.

## Jouer
Ouvre `index.html` dans un navigateur. Sur GitHub Pages, l'adresse publique
suffit (voir ci-dessous).

## Héberger sur GitHub Pages
1. Crée un dépôt (ex. `lugal`) et pousse-y **tout le contenu de ce dossier**
   (en conservant `assets/`).
2. Dépôt → **Settings → Pages**.
3. *Source* : **Deploy from a branch**. *Branch* : `main`, dossier `/ (root)`.
4. Enregistre. Après une minute, le jeu est en ligne à
   `https://<ton-utilisateur>.github.io/lugal/`.

> Le fichier `.nojekyll` (déjà présent) empêche GitHub de filtrer le dossier
> `assets/` : ne le supprime pas.

## Structure
```
index.html                  le jeu (interface + moteur + trame)
.nojekyll                    sert assets/ tel quel sur Pages
assets/img/sources/*.png     les 16 images-sources (banque HEC)
SOURCES.md                   crédits et licences de chaque source
LICENSE                      MIT (code) ; les images gardent leur licence
```

## Mécaniques
- **Caractéristiques** (tirées aux dés) : Autorité, Légitimité, Faveur des dieux,
  plus Trésor et Civilisation. Douze **sceaux** marquent les grands choix
  (écriture, code gravé, doctrine de justice, alliances, murailles, héritier…).
- **Lecture imposée** : à chaque page, la source doit être étudiée **6 secondes**
  avant que les choix s'activent.
- **Paris (épreuves de dés)** : certaines options ambitieuses se jouent aux dés
  (`2 dés + bonus de caractéristique ≥ seuil`). En cas d'**échec**, l'option est
  perdue, une **pénalité** s'applique, et l'élève doit se rabattre sur les choix
  restants — le risque a un coût réel.
- **Le jugement (§14)** : pivot inspiré du Code d'Hammourabi. En survolant un
  verdict, l'élève voit **l'article de loi** sur lequel il s'appuie (ou qu'il n'y
  en a aucun, pour la prérogative royale).
- **Les fins** sont déterminées par l'état accumulé du règne : un mauvais choix
  nuit, et peut mener à une chute liée aux décisions passées.

## Personnaliser
- **Textes / choix / effets** : tout est dans l'objet `STORY` (dans `index.html`).
- **Sources** : objet `SRC` — chaque entrée a un titre, une image (`img`), un
  contenu (`arts`) et une citation (`cite`). Pour changer une image, dépose le
  fichier dans `assets/img/sources/` et ajuste le chemin.
- **Équilibrage des fins** : fonction `evaluerFin()` (seuils de Civilisation,
  Légitimité, Trésor, Faveur et sceaux). Certaines fins sont actuellement rares —
  à ajuster après quelques parties tests.

---
Conçu par **Mathieu Mercier**. Sources : banque **HEC** (RÉCIT univers social,
Wikimedia Commons, musée du Louvre, British Museum…). Voir `SOURCES.md`.
