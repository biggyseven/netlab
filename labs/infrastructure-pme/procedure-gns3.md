# LAB 001 — montage du laboratoire dans GNS3

**Statut : procédure de montage à exécuter. Aucun projet GNS3 réel n'est joint à ce dépôt.**

## 1. Topologie à construire

Créer les nœuds et liaisons dans cet ordre :

| Nœud | Rôle | Connexions |
|---|---|---|
| NAT GNS3 | Accès WAN du laboratoire | Vers WAN pfSense |
| pfSense | Routage inter-VLAN, filtrage, DHCP/DNS si activés | WAN vers NAT ; port LAN/trunk vers switch |
| Switch L2 | Transport des VLAN | Trunk vers pfSense ; ports d'accès vers les hôtes |
| VPCS-ADMIN | Client de test VLAN 10 | Port access VLAN 10 |
| VPCS-USER | Client de test VLAN 20 | Port access VLAN 20 |
| Ubuntu-SRV | Hôte serveur VLAN 30 | Port access VLAN 30 |
| Client Linux/Windows (temporaire) | Tests TCP applicatifs | Port access VLAN 20 ; à démarrer uniquement pour les tests TCP |

Utiliser le switch Ethernet intégré de GNS3 pour un premier essai simple, ou une appliance de commutation compatible avec la configuration Cisco IOS pour travailler avec le fichier `switch-cisco-ios.cfg`. Les fonctions dépendent du type et de l'image du switch. Le switch intégré se configure par port dans son panneau de configuration ; il ne reçoit pas une configuration IOS à coller dans une console.

## 2. Câblage logique

1. Relier le nœud NAT au port WAN de pfSense.
2. Relier une interface physique distincte de pfSense au port trunk du switch.
3. Relier VPCS-ADMIN, VPCS-USER et Ubuntu-SRV à trois ports d'accès distincts.
4. Ne pas relier directement les clients au même port trunk.
5. Renseigner les noms de nœuds et les interfaces effectivement affichés dans GNS3 dans `gns3-mapping.csv`.

**Ne pas supposer que l'interface pfSense s'appelle em1, igb1 ou vtnet1.** Le nom dépend de l'image, du pilote et de l'ordre des cartes virtuelles.

## 3. Paramétrage du switch

### Switch Ethernet intégré GNS3

Dans la configuration du switch, régler les ports utilisés :

- Port vers pfSense : mode Dot1Q / trunk, VLAN autorisés 10, 20 et 30.
- Port VPCS-ADMIN : mode access, VLAN 10.
- Port VPCS-USER : mode access, VLAN 20.
- Port Ubuntu-SRV : mode access, VLAN 30.

Vérifier que le mode trunk du switch et les VLAN tags des interfaces pfSense sont cohérents. Le switch intégré n'a pas de CLI Cisco IOS.

### Appliance Cisco IOS / IOSvL2 compatible

Adapter les noms d'interfaces du fichier `switch-cisco-ios.cfg`, appliquer les VLAN et ports, puis vérifier :

```text
show vlan brief
show interfaces trunk
show mac address-table dynamic
```

Ne pas appliquer cette configuration à une appliance qui ne prend pas en charge cette syntaxe.

## 4. Plan IP des hôtes

| Hôte | VLAN | IP de laboratoire | Passerelle | DNS |
|---|---:|---|---|---|
| VPCS-ADMIN | 10 | 192.168.10.10/24 | 192.168.10.1 | 192.168.10.1 |
| VPCS-USER | 20 | 192.168.20.10/24 | 192.168.20.1 | 192.168.20.1 |
| Ubuntu-SRV | 30 | 192.168.30.10/24 | 192.168.30.1 | 192.168.30.1 |
| Switch mgmt (si supporté) | 10 | 192.168.10.2/24 | 192.168.10.1 | Selon besoin |

Ces adresses sont des valeurs de laboratoire. Vérifier qu'elles ne chevauchent aucun réseau WAN, NAT ou autre réseau déjà présent sur le poste.

## 5. Ressources et progression

Pour commencer, utiliser VPCS pour les deux clients : ils consomment moins de ressources que deux VM Windows complètes. Démarrer Ubuntu-SRV seulement pour la partie serveur et les essais DNS/HTTP. Si le poste hôte est limité, effectuer les étapes par séquence au lieu de démarrer toutes les VM simultanément.

## 6. Jalons et preuves

- J1 : tous les liens sont connectés et les interfaces pfSense sont identifiées.
- J2 : VLAN et ports d'accès créés.
- J3 : les trois passerelles répondent depuis le bon VLAN.
- J4 : le filtrage inter-VLAN produit les résultats attendus.
- J5 : DNS et accès Internet fonctionnent selon les règles.
- J6 : captures de la topologie, des VLAN, des règles et des tests collectées.

Ne marquer un jalon comme terminé qu'après observation réelle. Nommer les captures avec la date et le contrôle, par exemple `2026-11-12-lab001-vlan10-gateway.png`.
