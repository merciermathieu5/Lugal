# Lugal — un livre dont vous êtes le roi

Un *serious game* en français, type **livre dont vous êtes le héros**, pour la
réalité sociale **« L'émergence d'une civilisation »** (Mésopotamie, cours HEC,
sec. 1, PFEQ). L'élève règne sur une cité-État le long d'une **trame en arbre** :
un **chemin optimal** (≈ 18 décisions sur 8 actes) couvrant les grands piliers de
la Mésopotamie, l'irrigation, le surplus, le **commerce**, le **bronze**,
l'écriture, le **savoir** (maths en base 60, calendrier, astronomie), l'**école
des scribes**, la société, la **cité** et son urbanisme, la **roue**, les **grands
jardins**, les dieux, la justice et l'**amargi** (remise des dettes), la défense et
l'héritage ; dès qu'on s'écarte de ce chemin, des **problématiques** pénalisent et
rallongent le parcours. La partie mène à l'une de **13 fins** selon les qualités
du roi et l'état de sa civilisation.

Vanilla **HTML / CSS / JS** — aucun serveur, aucune dépendance, aucune image
externe : tout est dessiné (SVG au trait) ou écrit dans le fichier.

## La page de présentation
Au lancement, une **page d'accueil** met l'élève en contexte avant tout choix.
Elle nomme la réalité sociale (**L'émergence d'une civilisation**, en Histoire et
éducation à la citoyenneté), situe le décor (la Mésopotamie, entre le Tigre et
l'Euphrate, au pays de Sumer), explique le rôle de l'élève et l'objectif du règne,
et résume en quatre points comment on joue. Une petite scène gravée (ziggourat,
soleil, les deux fleuves, roseaux) ouvre l'écran. Le bouton **Façonner mon roi**
mène ensuite à la création du personnage. La présentation n'apparaît qu'au premier
lancement : après un règne, l'élève revient directement à la création.

## L'accueil : l'élève façonne son roi
Avant de jouer, l'élève **nomme son roi** et **choisit sa cité** parmi six
véritables cités sumériennes (Eridu, Uruk, Ur, Lagash, Kish, Nippur). Chacune
porte une **note historique** d'une ligne et accorde un petit **atout de départ**
fidèle à son histoire (Uruk et l'écriture donnent +1 Sagesse, Kish et la première
royauté +1 Autorité, etc.) : un choix d'identité qui enseigne la géographie réelle
de Sumer. L'élève **répartit ensuite lui-même ses points** entre les quatre
qualités du roi (Autorité, Sagesse, Piété, Légitimité), chacune accompagnée d'une
**explication de son importance** : elles décident des paris que le roi pourra
tenter, des voies qui s'ouvriront à lui et de la façon dont son règne se terminera.

## Ludification : galerie, distinctions, son
Pour soutenir le plaisir et la rejouabilité, trois couches s'ajoutent au jeu,
**sauvegardées localement** d'une partie à l'autre (localStorage). La **galerie
des règnes** est un codex des 13 fins : les fins atteintes se révèlent (les
triomphes en doré), les autres restent scellées avec un indice mystérieux qui
donne envie de les débusquer. Le **registre des distinctions** réunit dix titres
à mériter (Le Législateur, Le Scribe couronné, Le Bâtisseur, Le Juste, Le Prudent,
Le Sage des sources qui récompense la consultation des sources, **L'Œil du
scribe** qui récompense cinq vérifications de lecture réussies du premier coup,
etc.), avec le critère affiché pour chaque titre non encore obtenu. À la fin d'un règne, un
bandeau annonce les nouvelles découvertes. Enfin, un **habillage sonore** combine
une **musique d'ambiance mésopotamienne** en **boucle de fond légère** (un extrait
court, monté en boucle sans couture) et des **bruitages synthétisés** (dés qui
roulent, fanfare de réussite, scintillement de déblocage, froissement de page).
Le tout s'active par un **bouton haut-parleur** flottant (en haut à droite, présent
dès l'accueil), **coupé par défaut** pour la classe ; les dés sont **animés** (faces
qui défilent puis se figent) et les jauges **réagissent** à chaque changement (flash
vert ou rouge et valeur flottante).

## Le livre, en deux pages
Chaque zone porte un **signet** qui l'identifie d'un coup d'œil : **Trame
narrative** (le récit, à gauche), **Décision royale** (le choix, à droite) et
**Capacités du personnage** (la tablette des qualités).

- **Page de gauche — le récit du règne.** Chaque page **s'ouvre sur la
  conséquence concrète de la décision qui vient d'être prise** (ce que ton choix
  a fait à ta cité), avant de présenter la nouvelle situation : les décisions
  **façonnent l'histoire**, au lieu de simples événements qui se suivent. Le texte
  **remplit le feuillet**,
  puis **tourne** vers une nouvelle page une fois la page pleine, comme dans un
  vrai livre. Une barre
  de **feuilletage** (‹ feuillet précédent · *à présent* · revenir au présent »)
  permet à l'élève de **revenir lire** l'histoire de son règne sans rien perdre de
  sa décision en cours.
- **Page de droite — la décision.** Dans l'ordre : la **question**, un bouton
  **Consulter la source** (qui ouvre le document créé dans une **fenêtre**), les
  **choix** (chacun annonçant sa section de destination), puis le bouton
  **« Rends-toi au §N »** qui ouvre la table des sections pour tourner la page.

À chaque page : les choix restent **verrouillés tant que la source n'a pas été
étudiée**. Cliquer **Consulter la source** l'ouvre en **pop-up** avec un **chrono
de 4 secondes** ; au terme du chrono, la fenêtre **bascule** vers une **question
de vérification à trois choix** (mélangés) qui occupe tout le cadre — **aucun
défilement**. Un lien « ↑ Revoir la source » permet d'alterner à volonté entre
la source et la question. Bonne réponse, les choix se déverrouillent ; erreur,
un **indice bienveillant** renvoie à la source et l'élève réessaie **sans
pénalité**. La source reste ensuite **rouvrable à volonté** (« Revoir la
source »), sans encombrer la page. Chaque choix
montre son **effet sur les qualités** et, pour les paris, le badge **« Réussite :
X % »** ; les choix à dés portent **« (Jet de dés) »**. La zone de dés **explique
tout le calcul** (règle, bonus détaillé par qualité, seuil, % de réussite, puis
verdict chiffré). Un **pop-up** présente enfin la conséquence — la leçon à retenir.

## Les mécaniques du livre-jeu
Lugal assume pleinement son héritage « dont vous êtes le héros ».

- **Sections numérotées et mélangées.** Les 39 nœuds de la trame portent des
  numéros de section fixes, dispersés comme dans un vrai livre-jeu (le §1 ouvre
  le règne… et le §2 cache une fin funeste). Chaque choix annonce sa
  destination (« Creuser les canaux → §34 »), le bandeau et le récit affichent
  le numéro courant, et les destinations que le destin décidera portent « §… ».
- **La table des sections.** Après chaque décision, le bouton **« Rends-toi au
  §N »** ouvre la **table des sections** : l'élève y *feuillette* lui-même
  jusqu'au bon numéro, qui pulse — les sections déjà lues portent l'encre de
  son règne, les autres demeurent **scellées** (impossible de tricher). Un
  bouton **Sections** du bandeau permet aussi de consulter la table à tout
  moment.
- **La faveur des dieux.** Au couronnement, le roi reçoit **2 faveurs** (3 si sa
  Piété atteint 10) : après un jet de dés raté, il peut **implorer les dieux**
  et relancer — une seule fois par épreuve, et le revers ne s'applique qu'une
  fois le sort accepté. La réserve de flammes vit dans la feuille du roi.
- **Le sac du roi.** Les **sceaux royaux** gagnés en cours de règne s'affichent
  en breloques d'argile dans le tiroir (le dernier gravé scintille, la
  languette s'illumine), et les choix verrouillés annoncent la couleur :
  *« Scellé — exige murs ou alliés »*.
- **« Ton règne s'achève ici. »** Les fins funestes s'ouvrent sur le bandeau
  sombre rituel du genre, frappé d'un sceau brisé ; les triomphes gardent
  leur or.

## Repères pédagogiques : frise des actes et lexique
Le bandeau du livre porte une **frise des huit actes** : huit encoches gravées qui
se remplissent au fil du règne (actes accomplis, acte en cours, teinte rouge
pendant une **problématique**), chacune avec une infobulle nommant l'acte (« Les
eaux », « Le surplus et les échanges », « L'écriture et le savoir »…). L'élève
sait toujours **où il en est** dans la trame — et voit d'un coup d'œil que
s'écarter du chemin l'immobilise dans l'acte.

Dans le récit, **23 concepts de la réalité sociale** (irrigation, surplus, scribe,
ziggourat, corvée, talion, amargi, cité-État…) sont **soulignés d'un pointillé** :
un clic ouvre une **définition d'une phrase**, écrite pour le niveau sec. 1. Le
bouton **Lexique** du bandeau regroupe les 23 entrées en ordre alphabétique — un
petit référentiel de la Mésopotamie toujours à portée de main.

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

## Le bilan, sur deux pages
À la mort du roi, le livre s'ouvre sur un **bilan en double page**. À **gauche, le
verdict** : le titre de la fin, le récit de l'épilogue, la durée du règne et la
**grille des six qualités** qualifiées. À **droite, le jugement de l'histoire** :
la liste des **décisions avisées** prises pendant la partie et celle des
**décisions périlleuses pour la cité**, suivies de ce qui aura marqué le règne.
L'élève voit ainsi, noir sur blanc, **ce qui a fait grandir sa civilisation et ce
qui l'a mise en danger**. Une ligne de bilan indique aussi **combien de sources il
a étudiées** et **combien de vérifications de lecture il a réussies du premier
coup** — la matière première de la distinction *L'Œil du scribe*.

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

## La feuille du roi, en tiroir latéral
Pour que **la lecture prime**, la feuille du personnage n'occupe plus une colonne
permanente : elle est rangée dans un **tiroir** qui s'ouvre **à la demande** par une
**languette** sur le bord droit (libellée « Le roi » ou « La reine » selon le titre
choisi). Le **livre prend ainsi toute la largeur**, le texte est plus grand et les
polices plus homogènes. La languette **s'illumine** dès qu'une
jauge change (lueur dorée respirante et pastille), et **reste allumée tant que le
tiroir n'a pas été ouvert** : l'élève voit qu'il y a du nouveau sans être
interrompu, consulte quand il veut, et referme d'un clic ou avec **Échap**. La feuille reste **sobre et
utile** : les **quatre qualités** du roi ou de la reine (qui montent et
descendent selon les choix, et qu'on a soi-même réparties), le bloc **« Sa
civilisation »**, qui dit ce que la cité devient, le **sac des sceaux royaux**
et la réserve de **faveurs des dieux**. Ce bloc compte **quatre
dimensions** : Prospérité et Rayonnement, toujours visibles, plus **Savoir**
(écriture, mathématiques en base 60, astronomie, école) et **Technique**
(irrigation, bronze, roue, grands ouvrages) qui restent **cachées tant qu'elles
ne sont pas débloquées**. La première décision qui en donne un point fait
**apparaître la dimension** avec une mention (« Ta cité entre dans l'âge du
savoir », « ...maîtrise une technique nouvelle ») : l'élève voit sa civilisation
**émerger axe par axe**. La Technique nourrit ensuite les jets de dés des grands
ouvrages (la cité planifiée, les jardins en terrasses), et un très haut Savoir
ouvre une fin dédiée, **« Le berceau du savoir »**. Les qualités, elles, fixent
les probabilités des paris et déterminent la fin.

## Sources — toutes créées pour le jeu
**16 illustrations originales** au trait (style gravure, dessinées en SVG) et
**8 documents composés**. Les **illustrations** portent un bloc **« Ce que
montre l'image »** (le commentaire pédagogique) et, étant des créations du jeu
— non des iconographies d'archives —, **aucune référence**. Les **documents**
parlent d'eux-mêmes, sans commentaire, et s'affichent comme de véritables
**tablettes d'argile** aux bords irréguliers (**pierre sombre** pour les lois
gravées) ; seule demeure sous chacun l'étiquette d'honnêteté *« Document composé
pour Lugal — reconstitution, non un document d'archive »*. Aucune image
externe, aucune licence tierce : voir `SOURCES.md`.

## Héberger sur GitHub Pages
1. Pousse le contenu de ce dossier dans un dépôt.
2. **Settings → Pages → Deploy from a branch**, branche `main`, dossier `/(root)`.
3. En ligne à `https://<utilisateur>.github.io/<dépôt>/`.

## Structure
```
index.html     jeu complet : livre deux pages, moteur, trame et sources
ambiance.mp3   musique d'ambiance (boucle de fond, sous le bouton son)
.nojekyll      pour GitHub Pages
SOURCES.md     note sur les sources (toutes créées pour le jeu)
LICENSE        MIT — couvre le code, les illustrations et les textes
test/valide.js harnais de validation (node : `npm i jsdom` puis
               `node test/valide.js` — plus de 500 vérifications)
```

Remarque : `ambiance.mp3` est un court extrait monté en boucle à partir d'une
piste fournie. Assure-toi d'avoir le droit de l'utiliser et de la créditer selon sa
licence ; tu peux remplacer le fichier par n'importe quel autre MP3 du même nom.

## Personnaliser (dans `index.html`)
- **Points de départ** : `BASE` (par qualité), `POOL` (à répartir), `MAXADD`.
- **Trame** : objet `STORY` (chaque nœud : `texte`, `consigne`, `src` optionnel,
  `renvois` avec `eff`, `impact`, parfois `epreuve`).
- **Sources** : objet `SRC` (illustration `svg` ou document `doc`, question de
  vérification `q` à trois choix, variante `mat:"stone"` pour un texte sur
  pierre).
- **Lexique** : objet `GLOSS` (23 concepts de la réalité sociale, soulignés d'un
  pointillé dans le récit et regroupés sous le bouton **Lexique** du bandeau).
- **Fins** : fonction `evaluerFin()` (seuils de qualités, de Rayonnement, de
  Légitimité, et sceaux requis).

---
Conçu par **Mathieu Mercier**. Toutes les sources sont créées pour le jeu.
