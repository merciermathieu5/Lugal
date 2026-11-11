# telecharger-medias.ps1
# A lancer dans PowerShell, a la racine du depot Lugal :
#   .\telecharger-medias.ps1
# Depose dans medias/ les photos documentaires manquantes (les fichiers deja
# presents sont conserves). Ensuite : git add medias ; git commit ; git push ;
# puis npm test.
$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path "medias" | Out-Null
$ua = "Lugal-jeu-serieux/1.0 (https://github.com/merciermathieu5/Lugal)"
$n = 0

function Recuperer($fichier, $url) {
  $dest = "medias/" + $fichier
  if (Test-Path $dest) { Write-Host ($dest + " : deja present"); return }
  Invoke-WebRequest -Uri $url -OutFile $dest -UserAgent $ua
  Write-Host ($dest + " : telecharge")
  $script:n++
}

# Fiche 02 de muniverssocial.ca
$base = "https://muniverssocial.ca/medias/02-emergence-civilisation/"
foreach ($f in @("carte-mesopotamie.png","tablette-cuneiforme.jpg","scribe.jpg","code-hammourabi.jpg","ziggourat-ur.jpg","vase-uruk.jpg","lapis-lazuli.jpg","etendard-ur.jpg")) {
  Recuperer $f ($base + $f)
}

# NASA/JPL (PIA11021), domaine public
Recuperer "crue-delta-satellite.jpg" "https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA11021.jpg"

# Wikimedia Commons (licences et auteurs : voir medias/CREDITS.md)
$commons = @(
  @("bulle-calculi.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Accountancy_clay_envelope_Louvre_Sb1932.jpg/500px-Accountancy_clay_envelope_Louvre_Sb1932.jpg"),
  @("tablettes-proto-cuneiformes.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Numerical_and_proto_cuneiforms_tablets_-_Oriental_Institute.jpg/960px-Numerical_and_proto_cuneiforms_tablets_-_Oriental_Institute.jpg"),
  @("sceau-cylindre.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Cylinder_seal_and_modern_impression._Worshiper_pouring_a_libation_before_a_seated_god%2Cca._2112%E2%80%932004_B.C._Neo-Sumarian_Mesopotamia_Nippur.jpg/960px-Cylinder_seal_and_modern_impression._Worshiper_pouring_a_libation_before_a_seated_god%2Cca._2112%E2%80%932004_B.C._Neo-Sumarian_Mesopotamia_Nippur.jpg"),
  @("kudurru-melishipak.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Kudurru_Melishipak_Louvre_Sb23_n02.jpg/960px-Kudurru_Melishipak_Louvre_Sb23_n02.jpg"),
  @("barque-argent-ur.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Silver_model_of_a_boat%2C_tomb_PG_789%2C_Royal_Cemetery_of_UR%2C_2600-2500_BCE.jpg/960px-Silver_model_of_a_boat%2C_tomb_PG_789%2C_Royal_Cemetery_of_UR%2C_2600-2500_BCE.jpg"),
  @("porte-ishtar.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Pergamon_museum_Ishtar_Gate.jpg/500px-Pergamon_museum_Ishtar_Gate.jpg"),
  @("tete-akkadienne.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Royal_Akkadian_Head_from_Nineveh_%28inv.nr._IM_11331%29.jpg/960px-Royal_Akkadian_Head_from_Nineveh_%28inv.nr._IM_11331%29.jpg"),
  @("etendard-ur-guerre.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Standard_of_Ur_-_War.jpg/960px-Standard_of_Ur_-_War.jpg"),
  @("code-ur-nammu.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Ur_Nammu_code_Istanbul.jpg/500px-Ur_Nammu_code_Istanbul.jpg"),
  @("heros-lion-khorsabad.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Hero_lion_Dur-Sharrukin_Louvre_AO19862.jpg/500px-Hero_lion_Dur-Sharrukin_Louvre_AO19862.jpg"),
  @("tablette-deluge.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/British_Museum_Flood_Tablet.jpg/960px-British_Museum_Flood_Tablet.jpg"),
  @("cone-urukagina.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Clay_Cone_-_Louvre_Museum_-_AO3149.jpg/500px-Clay_Cone_-_Louvre_Museum_-_AO3149.jpg"),
  @("figurine-ur-nammu.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Foundation_figure_of_Ur-Namma_holding_a_basket_MET_DP375092.jpg/500px-Foundation_figure_of_Ur-Namma_holding_a_basket_MET_DP375092.jpg"),
  @("jardins-ninive.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Gardens_of_Ashurbanipal.jpg/960px-Gardens_of_Ashurbanipal.jpg"),
  @("ybc-7289.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/YBC-7289-OBV-REV.jpg/500px-YBC-7289-OBV-REV.jpg")
)
foreach ($c in $commons) { Recuperer $c[0] $c[1]; Start-Sleep -Milliseconds 400 }

Write-Host ""
Write-Host ("Termine : " + $n + " nouvelle(s) image(s) dans medias/. Lance maintenant : npm test")
