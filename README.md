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


## Évolution V1.6 — accueil console réseau

- Refonte visuelle du héros : hiérarchie typographique renforcée, fond technique discret et panneau de topologie plus structuré.
- Ajout de trois accès rapides vers l'atelier IPv4, le laboratoire PME et la documentation Zabbix.
- Affichage explicite des états « disponible », « en construction » et « en préparation ».
- Ajustements responsive et compatibilité avec les cinq thèmes existants.
- Amélioration de la sémantique accessible de la zone de topologie interactive.


## Évolution V1.7 — projets et Network Lab interactifs

- Recherche textuelle des projets par nom, technologie ou domaine, combinée aux filtres Réseaux / Sécurité / Systèmes.
- Compteur de résultats et état vide avec remise à zéro des filtres.
- Harmonisation des cartes de projets avec l'identité visuelle de l'accueil.
- Nouvelle lecture du laboratoire PME : objectifs explicitement à réaliser, périmètre VLAN et mention claire de maquette non testée.
- Sélection interactive des VLAN 10, 20 et 30 pour afficher leur rôle et leur sous-réseau prévu.
- Mise en évidence du trunk 802.1Q envisagé et renvoi vers la fiche technique.
- Les éléments conceptuels restent distingués des configurations et tests réels.


## Évolution V1.8 — correction des liaisons du laboratoire PME

- Reconstruction du schéma LAB 001 sur une grille à trois colonnes avec centres de branche calculés par la grille.
- Liaison verticale continue WAN → pfSense → trunk 802.1Q → switch L2.
- Bus horizontal raccordé au point de sortie du switch, avec trois descentes verticales alignées sur VLAN 10, 20 et 30.
- Suppression des anciennes largeurs de connecteur contradictoires qui pouvaient décaler les extrémités.
- Ajustements dédiés aux petits écrans.
- Le dessin reste conceptuel jusqu'à la réalisation et aux tests réels dans GNS3.


## Évolution V1.9 — écrans larges et ultralarges

- Conteneur principal progressif selon les largeurs 1440, 1920, 2560 et 3200 px.
- Largeur maximale portée à 2520 px sur les écrans ultralarges de 3440 px.
- Largeurs dédiées aux grilles de projets, compétences, journal et méthode pour conserver des cartes équilibrées.
- Hero et accès rapides élargis sans étirer excessivement les blocs de texte.
- Schéma du laboratoire agrandi sur ultralarge tout en conservant l'alignement des connecteurs.
- Contenu de documentation maintenu dans une largeur de lecture contrôlée.
- Les règles mobiles et tablette existantes restent inchangées.

## Évolution V2.0 — simulateur pédagogique de flux inter-VLAN

- Ajout d'un simulateur local permettant de choisir un VLAN source, un VLAN destination et un service.
- Évaluation de la demande selon une politique d'exemple explicitée dans l'interface.
- Distinction entre flux autorisé par l'exemple, flux refusé par défaut et communication locale au même VLAN.
- Règles de démonstration : ADMIN vers USERS (SSH/RDP/ICMP), ADMIN vers SERVERS (DNS/HTTPS/SSH/ICMP), USERS vers SERVERS (DNS/HTTPS), autres nouvelles connexions inter-VLAN refusées.
- Calcul entièrement exécuté dans le navigateur : aucun paquet réseau n'est envoyé et aucune règle n'est poussée vers pfSense.
- Mise en page responsive, compatible avec les cinq thèmes et utilisable au clavier.
- Cette politique est illustrative et ne décrit pas une configuration réellement déployée ou testée.

## Évolution V2.1 — chemin de flux et suivi personnel du laboratoire

- Ajout d'une représentation visuelle du chemin simulé : VLAN source, pfSense, switch L2 et VLAN destination.
- Mise en évidence visuelle du passage autorisé, du point de blocage ou du contournement de la passerelle pour un trafic au sein du même VLAN.
- Mise à jour dynamique des libellés et sous-réseaux selon les VLAN sélectionnés.
- Ajout d'un suivi de réalisation du LAB 001 en six étapes : adressage, VLAN, trunk, filtrage, tests et supervision.
- Progression calculée automatiquement avec barre, compteur, message de statut et réinitialisation.
- État du suivi conservé dans le stockage local du navigateur, sans compte utilisateur ni synchronisation serveur.
- Les cases représentent des déclarations de progression faites manuellement. Elles ne constituent pas une preuve technique et doivent être cochées uniquement après réalisation et test.
- Interface responsive et navigation clavier prises en charge.

