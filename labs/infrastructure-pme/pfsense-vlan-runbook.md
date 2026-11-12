# LAB 001 — configuration pfSense pour les VLAN 10, 20 et 30

**Statut : runbook à exécuter dans le laboratoire. Les interfaces et règles ci-dessous ne sont pas déclarées configurées.**

## 0. Avant toute modification

1. Démarrer pfSense seul et relever la liste des interfaces, leurs adresses MAC et leur état de lien.
2. Identifier physiquement/logiquement l'interface WAN reliée au NAT GNS3 et l'interface qui sera reliée au trunk du switch.
3. Ne pas deviner le nom de l'interface parent. Consigner le nom réellement affiché dans `gns3-mapping.csv`.
4. Exporter une sauvegarde de la configuration pfSense depuis **Diagnostics > Backup & Restore**.
5. Conserver un accès console ou une interface LAN de secours pendant la création des VLAN. Ne supprimer l'ancien accès d'administration qu'après avoir testé le VLAN 10 et la reconnexion à l'interface Web.

## 1. Créer les VLAN sur l'interface parent

Dans l'interface Web :

1. Ouvrir **Interfaces > Assignments > VLANs**.
2. Cliquer sur **Add**.
3. Choisir comme **Parent Interface** l'interface physique reliée au port trunk du switch.
4. Choisir le type de tag C-Tag / 802.1Q (valeur standard pour ce laboratoire).
5. Créer les tags suivants, avec une description claire :
   - VLAN tag 10, description `ADMIN_10`
   - VLAN tag 20, description `USERS_20`
   - VLAN tag 30, description `SERVERS_30`
6. Enregistrer chaque VLAN.

Ne pas créer trois interfaces physiques distinctes pour ces segments : les trois VLAN sont transportés sur le même lien physique parent, avec des tags différents.

## 2. Assigner et configurer les interfaces

Dans **Interfaces > Assignments** :

1. Ajouter les trois interfaces VLAN créées dans la liste des ports disponibles.
2. Ouvrir chaque nouvelle interface OPT et l'activer.
3. Utiliser des descriptions simples : `ADMIN_10`, `USERS_20`, `SERVERS_30`.
4. Configurer IPv4 en statique et saisir les passerelles suivantes :

| Interface pfSense | Adresse | Préfixe |
|---|---|---:|
| ADMIN_10 | 192.168.10.1 | /24 |
| USERS_20 | 192.168.20.1 | /24 |
| SERVERS_30 | 192.168.30.1 | /24 |

5. Ne pas sélectionner de passerelle WAN sur ces interfaces internes.
6. Appliquer les changements, puis contrôler que chaque interface est active et porte la bonne adresse.

Le lien physique parent sert au transport des trames taguées. Dans cette architecture, les passerelles IP résident sur les interfaces VLAN assignées.

## 3. Configurer les hôtes et le DHCP

Pour le premier passage, utiliser des adresses statiques afin de valider la couche 2 et les passerelles :

- VPCS-ADMIN : `192.168.10.10/24`, passerelle `192.168.10.1`
- VPCS-USER : `192.168.20.10/24`, passerelle `192.168.20.1`
- Ubuntu-SRV : `192.168.30.10/24`, passerelle `192.168.30.1`

Sur VPCS, exemple de commande à adapter :

```text
ip 192.168.10.10/24 192.168.10.1
show ip
ping 192.168.10.1
```

Répéter pour VLAN 20 avec `.20.10` et VLAN 30 avec `.30.10`.

Une fois les tests statiques validés, DHCP peut être activé séparément pour les VLAN qui en ont besoin :

| Segment | Pool proposé | Réservations statiques à exclure |
|---|---|---|
| ADMIN_10 | 192.168.10.100–192.168.10.149 | .1 à .49 |
| USERS_20 | 192.168.20.100–192.168.20.199 | .1 à .49 |
| SERVERS_30 | Désactivé au départ | Serveurs en IP statique |

Configurer les pools dans **Services > DHCP Server** sur l'interface VLAN correspondante. Ne pas activer de DHCP concurrent sur un second équipement du même VLAN.

## 4. DNS du laboratoire

Si le DNS Resolver pfSense est utilisé :

1. Vérifier son activation dans **Services > DNS Resolver**.
2. Vérifier qu'il écoute sur les interfaces VLAN utilisées (ou sur les interfaces explicitement choisies), et pas uniquement sur localhost.
3. Configurer le DNS des clients à l'adresse de leur passerelle VLAN (.1).
4. Ajouter dans chaque interface VLAN une règle autorisant TCP/UDP port 53 depuis le sous-réseau local vers l'adresse de cette interface pfSense.
5. Tester d'abord une résolution depuis pfSense, puis depuis un client.

Si un DNS externe ou un serveur DNS dédié est utilisé, remplacer la destination de la règle par cette adresse réelle.

## 5. Règles de filtrage : ordre par interface entrante

Les règles se créent dans **Firewall > Rules**, sur l'onglet de l'interface VLAN où le client initie son trafic. Les règles sont évaluées de haut en bas jusqu'à la première correspondance. Les réponses à une connexion autorisée sont permises par le suivi d'état.

### ADMIN_10

Créer les règles dans cet ordre :

1. Autoriser TCP 443 de `ADMIN_10 net` vers `This Firewall` pour l'administration Web pfSense.
2. Facultatif : autoriser ICMP vers `This Firewall` pour diagnostiquer la passerelle.
3. Si SSH est activé sur Ubuntu-SRV, autoriser TCP 22 de `ADMIN_10 net` vers `192.168.30.10`.
4. Ajouter uniquement les autres flux de gestion qui ont une raison documentée.

Ne pas publier l'interface d'administration pfSense sur WAN ou sur le VLAN Utilisateurs.

### USERS_20

Créer les règles dans cet ordre :

1. Autoriser TCP/UDP 53 de `USERS_20 net` vers `USERS_20 address` si pfSense fournit le DNS.
2. Facultatif : autoriser un service applicatif précis vers `192.168.30.10`, uniquement après avoir identifié le port réellement utilisé.
3. Bloquer les destinations internes non autorisées, par exemple les réseaux Administration et Serveurs ou un alias contenant les réseaux privés internes.
4. Autoriser TCP 80 et 443 vers les destinations Internet requises.
5. Ne pas ajouter de règle large `USERS_20 net → any` : elle annulerait l'effet du cloisonnement.

Si l'alias de blocage contient les réseaux privés RFC1918, placer les exceptions DNS et applicatives avant ce blocage. Ne pas oublier qu'une règle de blocage générale placée trop haut empêchera les exceptions situées en dessous.

### SERVERS_30

Créer les règles dans cet ordre :

1. Autoriser TCP/UDP 53 de `SERVERS_30 net` vers `SERVERS_30 address` si pfSense fournit le DNS.
2. Bloquer les connexions initiées vers `ADMIN_10 net`.
3. Bloquer les connexions initiées vers `USERS_20 net`.
4. Autoriser uniquement les sorties nécessaires aux mises à jour ou aux services documentés, par exemple TCP 80/443 vers Internet.
5. Ne pas ouvrir de règle générale vers tous les réseaux internes.

Les connexions d'administration initiées depuis ADMIN_10 vers Ubuntu-SRV sont contrôlées sur ADMIN_10. Les réponses sont gérées par le suivi d'état pfSense.

### Rappels de sécurité

- Les règles d'interface filtrent le trafic entrant sur l'interface où la connexion commence.
- L'ordre est significatif : une règle permissive placée avant une règle restrictive peut la rendre inopérante.
- Le refus implicite bloque les flux non autorisés ; une règle de blocage explicite peut être ajoutée pour rendre la politique plus lisible dans les journaux.
- Activer la journalisation sur les règles de blocage utiles pendant les essais, puis examiner **Status > System Logs > Firewall**.

## 6. NAT et accès Internet

1. Vérifier que l'interface WAN pfSense reçoit une configuration depuis le NAT GNS3.
2. Vérifier la route par défaut et la résolution DNS depuis pfSense.
3. Contrôler **Firewall > NAT > Outbound**. Le mode automatique par défaut suffit dans le cas courant ; ne passer en mode manuel/hybride que si un besoin précis le justifie.
4. Tester depuis un client uniquement après avoir validé sa passerelle et ses règles.

## 7. Séquence de validation

| Ordre | Contrôle | Résultat attendu |
|---:|---|---|
| 1 | Lien trunk et tags VLAN cohérents | VLAN 10, 20, 30 visibles/transportés |
| 2 | VPCS-ADMIN vers 192.168.10.1 | Réponse de la passerelle |
| 3 | VPCS-USER vers 192.168.20.1 | Réponse de la passerelle |
| 4 | Ubuntu-SRV vers 192.168.30.1 | Réponse de la passerelle |
| 5 | USERS_20 vers ADMIN_10 | Accès refusé, journal correspondant |
| 6 | USERS_20 vers service autorisé dans SERVERS_30 | Seul le port déclaré fonctionne |
| 7 | Clients vers DNS pfSense | Résolution réussie si Resolver actif |
| 8 | Clients vers HTTPS Internet | Réponse HTTP(S) si WAN, DNS et règles sont corrects |

Les lignes du fichier `plan-de-tests.csv` restent à l'état NON EXÉCUTÉ jusqu'aux contrôles réels. Un ping seul ne prouve pas qu'un service applicatif est autorisé ou bloqué.

## 8. Retour arrière

Si un changement coupe l'accès :

1. Utiliser la console pfSense conservée pendant l'opération.
2. Restaurer l'accès via l'interface de secours ou rétablir l'assignation précédente.
3. Restaurer le fichier de configuration sauvegardé si nécessaire.
4. Corriger une seule variable à la fois : parent, tag, affectation, adresse, règle.
5. Recommencer depuis le dernier jalon validé.

## Références officielles

- [Netgate — VLAN Configuration](https://docs.netgate.com/pfsense/en/latest/vlan/configuration.html)
- [Netgate — Interface Configuration](https://docs.netgate.com/pfsense/en/latest/config/interface-configuration.html)
- [Netgate — Firewall Fundamentals](https://docs.netgate.com/pfsense/en/latest/firewall/fundamentals.html)
- [Netgate — Rule Methodology](https://docs.netgate.com/pfsense/en/latest/firewall/rule-methodology.html)
- [GNS3 — Switching and GNS3](https://docs.gns3.com/docs/using-gns3/beginners/switching-and-gns3)

Les libellés du menu peuvent évoluer selon la version pfSense installée. Vérifier le nom exact des interfaces dans l'interface Web et la console avant d'appliquer chaque étape.
