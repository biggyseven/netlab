# NETLAB — preuves techniques

Ce répertoire contient uniquement les captures et documents visuels issus de travaux réellement exécutés.

## Organisation

- `infrastructure-pme/` : topologie GNS3, VLAN/trunk, interfaces et règles pfSense, tests de flux.
- `ipv4-cidr/` : cas de calcul /24, /31, /32 et contrôles de validation du calculateur.
- `zabbix-supervision/` : hôtes, dernières données, agents, déclencheurs et notifications.

## Convention de nommage

Utiliser des noms explicites, datés et sans espace, par exemple :

`2026-11-11-gns3-topologie-lab001.png`

Formats acceptés par le catalogue : PNG, JPG/JPEG et WebP. Privilégier une image lisible et optimisée plutôt qu'une capture immense.

## Publication dans la galerie

Les fichiers ne sont affichés que lorsqu'ils sont référencés dans le catalogue JSON `netlab-evidence-catalog` de `index.html`. Chaque média doit comporter :

- `src` : chemin local du fichier, depuis la racine du site ;
- `alt` : description accessible de ce qui est visible ;
- `title` : titre court et explicite ;
- `caption` : contexte du test ou de la configuration ;
- `category` : famille de preuve ;
- `date` : date ISO `YYYY-MM-DD`, facultative.

Ne jamais publier de mot de passe, token, clé API, adresse publique sensible, donnée client ou information personnelle. Masquer les éléments confidentiels avant publication. Une capture de maquette, un schéma conceptuel ou un écran vide ne doit pas être décrit comme une preuve de fonctionnement.

Après l'ajout d'un média, retirer de la liste `pending` la preuve désormais documentée, puis exécuter :

```bash
node --check assets/js/main.js
node --check assets/js/network-tools.js
python scripts/validate_site.py
```
