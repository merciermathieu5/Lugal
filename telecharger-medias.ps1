# telecharger-medias.ps1
# A lancer UNE FOIS dans PowerShell, a la racine du depot Lugal :
#   .\telecharger-medias.ps1
# Cree le dossier medias/ et y depose les 9 photos documentaires du jeu.
# Ensuite : git add medias ; git commit ; git push ; puis npm test.
$ErrorActionPreference = "Stop"
New-Item -ItemType Directory -Force -Path "medias" | Out-Null

$base = "https://muniverssocial.ca/medias/02-emergence-civilisation/"
$fichiers = @(
  "carte-mesopotamie.png",
  "tablette-cuneiforme.jpg",
  "scribe.jpg",
  "code-hammourabi.jpg",
  "ziggourat-ur.jpg",
  "vase-uruk.jpg",
  "lapis-lazuli.jpg",
  "etendard-ur.jpg"
)
foreach ($f in $fichiers) {
  Invoke-WebRequest -Uri ($base + $f) -OutFile ("medias/" + $f)
  Write-Host ("medias/" + $f + " : telecharge depuis muniverssocial.ca")
}

# La crue : le delta du Tigre et de l'Euphrate vu de l'espace.
# Photo NASA/JPL/UCSD/JSC (PIA11021), domaine public.
Invoke-WebRequest -Uri "https://d2pn8kiwq2w21t.cloudfront.net/original_images/jpegPIA11021.jpg" -OutFile "medias/crue-delta-satellite.jpg"
Write-Host "medias/crue-delta-satellite.jpg : telecharge depuis la NASA (PIA11021)"

Write-Host ""
Write-Host "Termine : 9 images dans medias/. Lance maintenant : npm test"
