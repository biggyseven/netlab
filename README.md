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
python -m http.server 8001
```

Puis visite http://localhost:8001.

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
├── documentation.html
├── README.md
└── assets/
    ├── css/styles.css
    ├── js/main.js
    ├── js/network-tools.js
    └── icons/netlab-mark.svg
```


## Évolution V1.1

- Hero recentré sur le profil professionnel et les objectifs de stage.
- Topologie conceptuelle interactive : sélectionner un équipement met à jour son rôle.
- Section Projets avec filtres Réseaux / Sécurité / Systèmes.
- Fiches détaillées ouvertes dans une boîte de dialogue accessible.
- Les projets non terminés sont étiquetés « en construction », « en préparation » ou « à documenter ».


## Évolution V1.2 — outil IPv4

- Ajout d’un calculateur interactif IPv4/CIDR intégré au Network Lab.
- Calcul de l’adresse réseau, du masque, du wildcard, du broadcast et de la plage d’hôtes.
- Affichage du nombre total d’adresses et d’hôtes utilisables.
- Gestion dédiée des préfixes `/31` (liaison point à point) et `/32` (route hôte).
- Validation des adresses IPv4 et des préfixes saisis.
- Calcul effectué dans le navigateur, sans envoyer les données à un serveur.


## Évolution V1.3 — système de thèmes

- Trois nouvelles ambiances : NOC Signal, Blueprint Engineering et Observability Graphite.
- Conservation des anciennes palettes sombre et claire.
- Sélecteur de thèmes accessible depuis l’en-tête, utilisable au clavier et sur mobile.
- Préférence mémorisée dans le navigateur, avec migration des anciennes valeurs `dark` et `light`.
- Palette commune aux surfaces, textes, boutons, états, topologies, cartes et visualisations de données.
- NOC Signal devient le thème par défaut pour les nouvelles visites.


## Évolution V1.4 — journal technique

- Ajout d’une section publique « Journal technique » accessible depuis la navigation.
- Présentation de trois sujets avec des statuts transparents : outil IPv4 disponible, laboratoire PME en construction et supervision Zabbix en préparation.
- Liens directs vers l’atelier IPv4, le laboratoire et la fiche projet.
- Mise en page responsive et compatible avec les cinq thèmes visuels.
- Les contenus en cours ne sont pas présentés comme des réalisations validées.


## Évolution V1.5 — documentation technique

- Création d'une page dédiée aux fiches IPv4/CIDR, infrastructure PME et supervision Zabbix.
- Procédures ordonnées, tableaux de référence, commandes Windows/Linux/Cisco et matrices de vérification.
- Boutons de copie des commandes avec retour de confirmation.
- Navigation par fiche, responsive et compatible avec les cinq thèmes.
- Liens vers les références officielles Netgate, Zabbix et RFC 3021.
- Distinction explicite entre résultats de calcul vérifiés, procédures à exécuter et preuves encore à collecter.
