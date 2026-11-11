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

## Évolution V2.2 — recentrage du portfolio

- Repositionnement de l'accueil autour du titre « Administrateur réseaux junior » et d'une présentation professionnelle explicite.
- Réécriture de l'introduction pour mettre en avant le parcours, les projets et les preuves techniques.
- Remplacement des accès rapides centrés sur des outils par trois entrées : projets techniques, laboratoires réseau et documentation.
- Retrait du suivi personnel local de la vitrine publique ; il ne sera réintroduit que dans un éventuel espace privé.
- Retrait du journal éditorial provisoire tant que des notes techniques réelles et datées ne sont pas publiables.
- Navigation simplifiée et numérotation des sections ajustée.
- Correction du parcours conceptuel inter-VLAN : VLAN source → switch L2 → trunk 802.1Q / pfSense → switch L2 → VLAN destination. Le trafic au sein d'un même VLAN reste commuté localement.
- Les statuts de conception et les mentions de topologie non testée sont conservés afin de ne pas confondre maquette et réalisation.
- Le contact reste à compléter avec des coordonnées validées avant publication.

## Évolution V2.3 — fiches projets structurées

- Transformation des fenêtres de détail en dossiers techniques structurés : contexte, objectif, domaine, environnement, démarche, état des preuves et prochaine étape.
- Contenus spécifiques pour les trois entrées : infrastructure PME, atelier IPv4/CIDR et supervision Zabbix.
- L'atelier IPv4 est présenté comme un outil disponible, avec des preuves et exercices encore à enrichir.
- Les statuts des projets distinguent explicitement les travaux en construction, les outils disponibles et les projets en préparation.
- Suppression de la courbe de métriques illustrative sur la carte Zabbix ; l'aperçu indique désormais qu'aucune mesure réelle n'est publiée.
- Liens depuis chaque dossier vers la fiche documentaire correspondante.
- Les dossiers utilisent des attributs de données et des nœuds texte, sans injecter de HTML arbitraire.
- Les résultats, tests et métriques non documentés ne sont pas présentés comme validés.

## Évolution V2.4 — présentation visuelle éditoriale des projets

- Refonte des aperçus de cartes avec une composition réseau horizontale, des sous-réseaux lisibles et des niveaux de lecture renforcés.
- Dossiers détaillés dotés d'un en-tête éditorial en deux colonnes, d'un résumé, du statut et des informations de cadrage.
- Visuel technique contextuel selon le projet : topologie conceptuelle PME, exemple IPv4/CIDR ou périmètre Zabbix sans métriques.
- Le schéma réseau indique explicitement que le trunk 802.1Q reste envisagé et non testé.
- L'exemple IPv4 affiché est un cas pédagogique /24 cohérent avec les paramètres indiqués.
- L'aperçu Zabbix n'affiche aucune valeur de mesure et reste marqué « no data ».
- Mise en page détaillée organisée en colonnes sur écran large et empilée sur mobile.
- Les visuels sont construits en HTML/CSS et ne sont pas présentés comme des captures d'écran d'environnements réellement déployés.

## Évolution V2.5 — dossiers projets partageables

- Attribution d'un identifiant stable à chaque dossier projet : infrastructure PME, atelier IPv4/CIDR et supervision Zabbix.
- Ouverture directe d'un dossier avec une URL à fragment, par exemple `#project-ipv4-cidr`.
- Conservation du dossier au rechargement de la page et synchronisation avec les boutons Précédent / Suivant du navigateur.
- Ajout d'une action « Partager le dossier » qui copie l'URL exacte de la fiche ouverte.
- Fermeture de la fenêtre et nettoyage de l'URL lors d'une fermeture manuelle, sans casser la navigation historique.
- Aucun service externe ni backend requis : le routage repose sur l'URL et JavaScript côté navigateur.

## Évolution V2.6 — compétences reliées aux ressources

- Chaque carte de compétence propose un accès direct à un outil, un laboratoire ou une fiche documentaire associée.
- Les états ont été clarifiés : la segmentation VLAN reste en conception avec validation GNS3 à effectuer ; sécurité et supervision restent en étude préparatoire.
- Les libellés évitent de présenter les simulations et procédures comme des validations de déploiement.
- Les cartes adoptent une structure verticale cohérente afin d'aligner les états et liens même lorsque les descriptions ont des longueurs différentes.

## Évolution V2.7 — métadonnées de partage et référencement

- Ajout de titres et descriptions distincts pour l'accueil et la documentation.
- Ajout des métadonnées Open Graph (type, langue, nom du site, titre et description) et des cartes Twitter de type summary.
- Ajout de données structurées Schema.org : profil Person sur l'accueil et WebPage sur la documentation.
- Les données structurées restent limitées aux informations confirmées du profil et aux domaines présentés dans le portfolio.
- Aucune URL canonique, adresse e-mail, image de partage ou présence sociale n'est inventée : ces éléments seront ajoutés lorsque leurs adresses publiques seront confirmées.

## Évolution V2.8 — contrôle qualité automatisé

- Ajout d'un workflow GitHub Actions déclenché sur les pushes de `main` et de `feature/netlab-v1-1`, sur les pull requests vers `main` et à la demande.
- Vérification de la syntaxe de `main.js` et `network-tools.js` avec Node.js.
- Script Python sans dépendance externe pour contrôler les pages HTML, les identifiants dupliqués, les liens et ressources locaux, les routes de dossiers projets et les liens entre illustrations.
- Vérification des métadonnées Open Graph / Twitter Card, des données structurées JSON-LD et de la structure CSS.
- Les contrôles sont statiques : ils ne remplacent pas les essais visuels dans un navigateur réel.
