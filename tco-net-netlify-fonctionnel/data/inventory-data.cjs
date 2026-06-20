// Inventaires fournis par Terrains Communs, dernière mise à jour : 12 mai 2026.
// Format : type SQLite | groupe source | nom commun | nom latin
const rawInventory = `
mammifère|Mammifères|Chevreuil|Capreolus capreolus
mammifère|Mammifères|Crossope|Neomys fodiens
mammifère|Mammifères|Écureuil roux|Sciurus vulgaris
mammifère|Mammifères|Renard roux|Vulpes vulpes
oiseau|Oiseaux|Bouscarle de Cetti|Cettia cetti
oiseau|Oiseaux|Buse variable|Buteo buteo
oiseau|Oiseaux|Canard colvert|Anas platyrhynchos
oiseau|Oiseaux|Chouette effraie|Tyto alba
oiseau|Oiseaux|Corneille noire|Corvus corone
oiseau|Oiseaux|Épervier d’Europe|Accipiter nisus
oiseau|Oiseaux|Fauvette à tête noire|Sylvia atricapilla
oiseau|Oiseaux|Gallinule poule-d’eau|Gallinula chloropus
oiseau|Oiseaux|Geai des chênes|Garrulus glandarius
oiseau|Oiseaux|Grande Aigrette|Ardea alba
oiseau|Oiseaux|Grimpereau des jardins|Certhia brachydactyla
oiseau|Oiseaux|Grive musicienne|Turdus philomelos
oiseau|Oiseaux|Grue cendrée|Grus grus
oiseau|Oiseaux|Héron cendré|Ardea cinerea
oiseau|Oiseaux|Huppe fasciée|Upupa epops
oiseau|Oiseaux|Hypolaïs polyglotte|Hippolais polyglotta
oiseau|Oiseaux|Loriot d’Europe|Oriolus oriolus
oiseau|Oiseaux|Martinet noir|Apus apus
oiseau|Oiseaux|Merle noir|Turdus merula
oiseau|Oiseaux|Mésange à longue queue|Aegithalos caudatus
oiseau|Oiseaux|Mésange bleue|Cyanistes caeruleus
oiseau|Oiseaux|Mésange charbonnière|Parus major
oiseau|Oiseaux|Perruche à collier|Psittacula krameri
oiseau|Oiseaux|Pic vert|Picus viridis
oiseau|Oiseaux|Pie bavarde|Pica pica
oiseau|Oiseaux|Pigeon ramier|Columba palumbus
oiseau|Oiseaux|Pouillot véloce|Phylloscopus collybita
oiseau|Oiseaux|Rossignol philomèle|Luscinia megarhynchos
oiseau|Oiseaux|Rouge-gorge familier|Erithacus rubecula
oiseau|Oiseaux|Rougequeue à front blanc|Phoenicurus phoenicurus
oiseau|Oiseaux|Serin cini|Serinus serinus
oiseau|Oiseaux|Troglodyte mignon|Troglodytes troglodytes
insecte|Coléoptères|Cétoine dorée|Cetonia aurata
insecte|Coléoptères|Cétoine grise|Oxythyrea funesta
insecte|Coléoptères|Coccinelle asiatique|Harmonia axyridis
insecte|Coléoptères|Coccinelle à sept points|Coccinella septempunctata
insecte|Coléoptères|Petite biche|Dorcus parallelipipedus
insecte|Coléoptères|Timarche ténébreuse / Crache-sang|Timarcha tenebricosa
insecte|Coléoptères|Trichodes alvearius|Trichodes alvearius
autre|Gastéropodes|Hélice cerise|Fruticicola fruticum
insecte|Hyménoptères|Abeille domestique|Apis mellifera
insecte|Hyménoptères|Abeille charpentière|Xylocopa sp.
insecte|Hyménoptères|Bourdon terrestre|Bombus gr. terrestris spp.
insecte|Hyménoptères|Bourdon des prés|Bombus gr. pascuorum spp.
insecte|Hyménoptères|Bourdon des pierres|Bombus gr. lapidarius spp.
insecte|Hyménoptères|Frelon asiatique|Vespa velutina
insecte|Hyménoptères|Frelon européen|Vespa crabro
insecte|Hyménoptères|Sceliphron asiatique|Sceliphron caementarium
insecte|Libellules (Odonates)|Caloptéryx éclatant|Calopteryx splendens
insecte|Libellules (Odonates)|Pennipatte bleuâtre|Platycnemis pennipes
insecte|Libellules (Odonates)|Libellule déprimée|Libellula depressa
insecte|Orthoptères|Grande sauterelle verte|Tettigonia viridissima
insecte|Orthoptères|Grillon des bois|Nemobius sylvestris
insecte|Papillons (Lépidoptères)|Amaryllis|Pyronia tithonus
insecte|Papillons (Lépidoptères)|Aurore|Anthocharis cardamines
insecte|Papillons (Lépidoptères)|Azuré de la bugrane|Polyommatus icarus
insecte|Papillons (Lépidoptères)|Azuré des nerpruns|Celastrina argiolus
insecte|Papillons (Lépidoptères)|Citron|Gonepteryx rhamni
insecte|Papillons (Lépidoptères)|Cuivré commun|Lycaena phlaeas
insecte|Papillons (Lépidoptères)|Grande tortue|Nymphalis polychloros
insecte|Papillons (Lépidoptères)|Machaon|Papilio machaon
insecte|Papillons (Lépidoptères)|Myrtil|Maniola jurtina
insecte|Papillons (Lépidoptères)|Paon-du-jour|Aglais io
insecte|Papillons (Lépidoptères)|Piéride de la rave|Pieris rapae
insecte|Papillons (Lépidoptères)|Robert-le-diable|Polygonia c-album
insecte|Papillons (Lépidoptères)|Silène|Brintesia circe
insecte|Papillons (Lépidoptères)|Tabac d’Espagne|Argynnis paphia
insecte|Papillons (Lépidoptères)|Vulcain|Vanessa atalanta
insecte|Punaises (Hétéroptères)|Corée marginée|Coreus marginatus
insecte|Punaises (Hétéroptères)|Gendarme|Pyrrhocoris apterus
insecte|Punaises (Hétéroptères)|Pentatome des baies|Dolycoris baccarum
insecte|Punaises (Hétéroptères)|Punaise arlequin|Graphosoma italicum
autre|Reptiles|Couleuvre helvétique|Natrix helvetica
autre|Reptiles|Couleuvre verte et jaune|Hierophis viridiflavus
autre|Reptiles|Lézard des murailles|Podarcis muralis
plante|Arbres et arbustes|Ailante|Ailanthus altissima
plante|Arbres et arbustes|Aulne glutineux|Alnus glutinosa
plante|Arbres et arbustes|Bouleau|Betula sp.
plante|Arbres et arbustes|Cornouiller mâle|Cornus mas
plante|Arbres et arbustes|Cornouiller sanguin|Cornus sanguinea
plante|Arbres et arbustes|Églantier|Rosa canina
plante|Arbres et arbustes|Érable sycomore|Acer pseudoplatanus
plante|Arbres et arbustes|Frêne|Fraxinus excelsior
plante|Arbres et arbustes|Mahonia à feuilles de houx|Mahonia aquifolium
plante|Arbres et arbustes|Noisetier|Corylus avellana
plante|Arbres et arbustes|Noyer|Juglans regia
plante|Arbres et arbustes|Paulownia|Paulownia tomentosa
plante|Arbres et arbustes|Prunelier|Prunus spinosa
plante|Arbres et arbustes|Ronce commune|Rubus plicatus
plante|Arbres et arbustes|Saule blanc / argenté|Salix alba
plante|Arbres et arbustes|Saule marsault|Salix caprea
plante|Arbres et arbustes|Sureau noir|Sambucus nigra
plante|Arbres et arbustes|Vigne vierge|Parthenocissus quinquefolia
plante|Fleurs et plantes herbacées|Alliaire officinale|Alliaria petiolata
plante|Fleurs et plantes herbacées|Amarante queue de renard|Amaranthus caudatus
plante|Fleurs et plantes herbacées|Anthémis des teinturiers|Cota tinctoria
plante|Fleurs et plantes herbacées|Armoise commune|Artemisia vulgaris
plante|Fleurs et plantes herbacées|Berce commune / Spondyle|Heracleum sphondylium
plante|Fleurs et plantes herbacées|Bouton d’or|Ranunculus repens
plante|Fleurs et plantes herbacées|Campanule|Campanula rapunculoides
plante|Fleurs et plantes herbacées|Carotte sauvage|Daucus carota
plante|Fleurs et plantes herbacées|Centaurée noire|Centaurea nigra
plante|Fleurs et plantes herbacées|Cerfeuil des champs|Anthriscus sylvestris
plante|Fleurs et plantes herbacées|Chénopode blanc|Chenopodium album
plante|Fleurs et plantes herbacées|Chrysanthème|Chrysanthemum sp.
plante|Fleurs et plantes herbacées|Clinopode commun|Clinopodium vulgare
plante|Fleurs et plantes herbacées|Compagnon blanc|Silene latifolia
plante|Fleurs et plantes herbacées|Consoude officinale|Symphytum officinale
plante|Fleurs et plantes herbacées|Cruciate|Cruciata laevipes
plante|Fleurs et plantes herbacées|Dahlia|Dahlia sp.
plante|Fleurs et plantes herbacées|Échinacée pourpre|Echinacea purpurea
plante|Fleurs et plantes herbacées|Épilobe hérissé|Epilobium hirsutum
plante|Fleurs et plantes herbacées|Eupatoire chanvrine|Eupatorium cannabinum
plante|Fleurs et plantes herbacées|Euphorbe des bois|Euphorbia amygdaloides subsp. robbiae
plante|Fleurs et plantes herbacées|Gaillet grateron|Galium aparine
plante|Fleurs et plantes herbacées|Grande ortie|Urtica dioica
plante|Fleurs et plantes herbacées|Grémil officinale|Lithospermum officinale
plante|Fleurs et plantes herbacées|Guimauve officinale|Althaea officinalis
plante|Fleurs et plantes herbacées|Houblon|Humulus lupulus
plante|Fleurs et plantes herbacées|Lamier blanc|Lamium album
plante|Fleurs et plantes herbacées|Linaire commune|Linaria vulgaris
plante|Fleurs et plantes herbacées|Liseron des haies|Calystegia sepium
plante|Fleurs et plantes herbacées|Lotier corniculé|Lotus corniculatus
plante|Fleurs et plantes herbacées|Lysimaque commune|Lysimachia vulgaris
plante|Fleurs et plantes herbacées|Marjolaine|Origanum majorana
plante|Fleurs et plantes herbacées|Mélilot officinale|Melilotus officinalis
plante|Fleurs et plantes herbacées|Mélisse officinale|Melissa officinalis
plante|Fleurs et plantes herbacées|Menthe odorante|Mentha suaveolens
plante|Fleurs et plantes herbacées|Millepertuis|Hypericum perforatum
plante|Fleurs et plantes herbacées|Myosotis|Myosotis sp.
plante|Fleurs et plantes herbacées|Nicotiana|Nicotiana obtusifolia
plante|Fleurs et plantes herbacées|Ornithogale en ombelle|Ornithogalum umbellatum
plante|Fleurs et plantes herbacées|Physalis|Physalis heterophylla
plante|Fleurs et plantes herbacées|Potentille rampante|Potentilla reptans
plante|Fleurs et plantes herbacées|Pulmonaire officinale|Pulmonaria officinalis
plante|Fleurs et plantes herbacées|Saponaire officinale|Saponaria officinalis
plante|Fleurs et plantes herbacées|Scrofulaire noueuse|Scrophularia nodosa
plante|Fleurs et plantes herbacées|Séneçon de Jacob|Jacobaea vulgaris
plante|Fleurs et plantes herbacées|Silène enflé|Silene vulgaris
plante|Fleurs et plantes herbacées|Stellaire holostée|Stellaria holostea
plante|Fleurs et plantes herbacées|Sureau hièble|Sambucus ebulus
plante|Fleurs et plantes herbacées|Tanaisie commune|Tanacetum vulgare
plante|Fleurs et plantes herbacées|Véronique petit-chêne|Veronica chamaedrys
plante|Fleurs et plantes herbacées|Verge d’or|Solidago sp.
plante|Fleurs et plantes herbacées|Verveine officinale|Verbena officinalis
plante|Fleurs et plantes herbacées|Vipérine|Echium vulgare
plante|Graminées, fougères et roseaux|Baldingère|Phalaris arundinacea
plante|Graminées, fougères et roseaux|Carex|Carex sp.
plante|Graminées, fougères et roseaux|Prêle des champs|Equisetum arvense
plante|Graminées, fougères et roseaux|Roseau commun|Phragmites australis
champignon|Champignons et lichens|Evernie / Mousse de chêne|Evernia prunastri
champignon|Champignons et lichens|Morille blonde|Morchella rotunda
champignon|Champignons et lichens|Pezize vésiculeuse|Peziza vesiculosa
`;

const inventory = rawInventory.trim().split("\n").map((line) => {
  const [type, group, commonName, latinName] = line.split("|");
  return { type, group, commonName, latinName };
});

module.exports = inventory;
