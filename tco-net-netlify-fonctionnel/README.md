# TCo_NET — version en ligne de test

Cette copie est prévue pour tester les observations faune/flore depuis le jardin avec un téléphone connecté en 4G ou 5G.

Elle est séparée de la version locale Raspberry Pi, mais reprend maintenant ses principales fonctions :

- le site public et son design sont conservés ;
- les observations et les photos sont stockées dans **Netlify Blobs** ;
- le formulaire naturaliste fonctionne avec un code partagé ;
- la météo de Nevers provient d’Open-Meteo ;
- l’administration permet de modifier le message d’accueil et de gérer le chat,
  les résidences, les sons, les espèces et la documentation.

## Méthode conseillée : déploiement depuis GitHub

### 1. Créer un dépôt

Créer un nouveau dépôt GitHub, par exemple `tco-net-online`, puis y placer **le contenu de ce dossier** `netlify-online` — pas le dossier parent.

Le dépôt doit donc commencer ainsi :

```text
.
├── data/
├── netlify/
├── public/
├── netlify.toml
└── package.json
```

### 2. Créer le projet Netlify

Dans Netlify :

1. choisir **Add new project** ;
2. choisir **Import an existing project** ;
3. connecter GitHub ;
4. sélectionner le dépôt `tco-net-online` ;
5. laisser les réglages de compilation proposés par `netlify.toml` ;
6. lancer le déploiement.

### 3. Ajouter les trois secrets

Dans **Project configuration → Environment variables**, ajouter :

```text
OBSERVER_PASSWORD
ADMIN_PASSWORD
SESSION_SECRET
```

- `OBSERVER_PASSWORD` : un code facile à taper sur smartphone, mais non évident ;
- `ADMIN_PASSWORD` : le mot de passe de la page `/admin.html` ;
- `SESSION_SECRET` : une longue phrase aléatoire, différente du code.

Exemple de code naturaliste : `pinson-5832`.

Ne jamais inscrire les vraies valeurs dans GitHub ou dans un fichier public.

Après avoir ajouté les variables, lancer un nouveau déploiement.

## Essai sur le terrain

L’adresse principale sera de la forme :

```text
https://nom-du-projet.netlify.app
```

Le formulaire direct :

```text
https://nom-du-projet.netlify.app/observation.html
```

L’administration :

```text
https://nom-du-projet.netlify.app/admin.html
```

Sur le téléphone :

1. ouvrir le formulaire avec la 4G/5G ;
2. saisir le code naturaliste une fois ;
3. choisir la catégorie ;
4. indiquer le nom observé ;
5. ajouter éventuellement une photo et une note ;
6. toucher **Enregistrer l’observation**.

Le code reste mémorisé sur ce téléphone. Le bouton « Changer d’utilisateur » permet de l’effacer.

## Déploiement avec la ligne de commande

Depuis ce dossier :

```bash
npm install
npx netlify login
npx netlify init
npx netlify deploy --prod
```

Les variables d’environnement doivent toujours être ajoutées dans l’interface Netlify.

## Données

Netlify Blobs utilise plusieurs espaces séparés :

- `tco-observations` pour les nouvelles observations ;
- `tco-observation-images` pour les photos ;
- `tco-wall` pour le chat public.
- `tco-settings` pour le message du jardin ;
- `tco-residences`, `tco-sounds` et `tco-documents` pour les contenus administrables ;
- `tco-files` pour les images, sons et documents envoyés depuis l’administration.

Les données persistent entre les déploiements. Elles sont consultables dans l’interface Netlify, dans la partie Blobs.

## Limites de cette version

- Les photos d’observation sont limitées à 8 Mo.
- Netlify impose ses propres quotas de stockage et de fonctions.
- Une connexion Internet est nécessaire pour enregistrer ou administrer les contenus.
- La version locale SQLite reste la référence pour le futur réseau autonome du jardin.
