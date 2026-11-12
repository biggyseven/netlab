# LAB 001 — infrastructure PME segmentée

**État : dossier de préparation. Non déployé, non testé dans GNS3.**

Ce pack transforme le schéma PME de NETLAB en livrables concrets pour préparer le laboratoire. Il est conçu pour être adapté aux équipements et aux noms d'interfaces réellement disponibles.

## Architecture cible

`WAN / NAT GNS3 → pfSense → trunk 802.1Q → switch L2`

Le switch transporte trois VLAN. pfSense porte les passerelles, effectue le routage inter-VLAN et filtre les communications.

| Zone | VLAN | Réseau proposé | Passerelle prévue |
|---|---:|---|---|
| Administration | 10 | 192.168.10.0/24 | 192.168.10.1 |
| Utilisateurs | 20 | 192.168.20.0/24 | 192.168.20.1 |
| Serveurs | 30 | 192.168.30.0/24 | 192.168.30.1 |

Ces sous-réseaux sont un plan de laboratoire proposé, pas des adresses relevées sur un réseau existant.

## Contenu du pack

- `topologie-lab001.svg` : schéma logique vectoriel, modifiable.
- `plan-adressage.csv` : VLAN, sous-réseaux et passerelles prévus.
- `switch-cisco-ios.cfg` : configuration de départ pour un switch compatible Cisco IOS.
- `matrice-pfsense.csv` : politique de flux proposée à traduire manuellement en règles pfSense.
- `plan-de-tests.csv` : contrôles à exécuter et résultats attendus, avec champs de résultat encore vides.
- `procedure-gns3.md` : montage des nœuds, câblage, ports du switch et jalons de preuve.
- `pfsense-vlan-runbook.md` : création/assignation des VLAN, adressage, DHCP/DNS, filtrage et retour arrière.
- `gns3-mapping.csv` : relevé des interfaces réelles après identification dans GNS3.
- `hotes-et-ports.csv` : IP des passerelles, clients, serveur et pools DHCP proposés.

## Ordre conseillé de réalisation

1. Créer les nœuds GNS3 et câbler le WAN, pfSense et le switch.
2. Vérifier les interfaces et les liens avant toute configuration VLAN.
3. Créer les VLAN 10, 20 et 30 sur le switch, puis affecter les ports d'accès.
4. Configurer le trunk vers l'interface physique parent de pfSense.
5. Créer et assigner les VLAN dans pfSense, puis définir les passerelles `.1/24`.
6. Appliquer les règles de la matrice en respectant leur ordre et en remplaçant les alias par les hôtes réels.
7. Exécuter chaque ligne du plan de tests et consigner les résultats observés avant de publier une capture.

## Précautions techniques
- Les règles doivent être créées sur leur interface pfSense entrante respective ; l'ordre de la matrice est à respecter à l'intérieur de chaque interface.
- Les autorisations ICMP vers « Ce pare-feu » ne servent qu'au diagnostic des passerelles et peuvent être retirées ensuite.

- Le switch L2 ne route pas entre les VLAN. Le routage inter-VLAN est assuré par pfSense.
- Le trafic entre deux hôtes du même VLAN reste commuté localement et ne passe normalement pas par pfSense.
- La configuration `.cfg` est un modèle Cisco IOS. Les noms d'interfaces, la syntaxe trunk et les commandes disponibles varient selon le modèle ou l'appliance GNS3.
- La matrice pfSense est une spécification de politique, pas un fichier de configuration importable. Créer les règles dans l'interface pfSense et confirmer l'ordre d'évaluation.
- Une règle d'autorisation vers un service applicatif ne doit être ajoutée qu'après avoir défini l'adresse du serveur et le port réellement utilisé.
- Ne pas déclarer un test réussi sur la seule base du résultat attendu. Renseigner le résultat observé et joindre une preuve issue du laboratoire.

## État de validation

Tous les éléments de ce dossier sont des livrables de conception. Aucun équipement n'est présenté comme configuré, aucun flux comme opérationnel et aucun test comme réussi. Le statut ne changera qu'après exécution et collecte de preuves.
