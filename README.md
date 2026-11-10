# NETLAB — première interface

Première maquette codée du portfolio Réseaux & Télécommunications NETLAB.

## Aperçu local

Cette première page est statique et ne nécessite pas encore PHP ni MySQL.

1. Télécharge ou clone le dépôt.
2. Ouvre le dossier `NETLAB`.
3. Lance `index.html` dans un navigateur.

Pour un serveur local :

```bash
cd NETLAB
python -m http.server 8000
```

Puis visite http://localhost:8000.

## Contenu de cette étape

- Accueil public responsive.
- Navigation par ancres.
- Thème sombre / clair, avec préférence conservée.
- Menu mobile.
- Animations d'apparition respectueuses de `prefers-reduced-motion`.
- Présentation du profil.
- Domaines de compétences avec états de progression.
- Premier laboratoire réseau documenté comme étant en construction.
- Schéma topologique conceptuel en HTML/CSS.

## Périmètre volontaire

Aucun compte administrateur, aucune base de données et aucun formulaire de contact connecté à ce stade. Ces éléments arriveront pendant les phases PHP/MySQL.

Les niveaux et projets présentés sont des éléments de départ. Ils doivent être ajustés pour refléter uniquement les compétences et réalisations réellement démontrées.

## Structure

```
NETLAB/
├── index.html
├── README.md
└── assets/
    ├── css/styles.css
    ├── js/main.js
    └── icons/netlab-mark.svg
```
