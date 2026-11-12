#!/usr/bin/env python3
"""Static quality checks for the NETLAB portfolio. Uses only Python's standard library."""

from __future__ import annotations

import json
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
PAGE_NAMES = ("index.html", "documentation.html")
LAB_PACK_FILES = (
    "labs/infrastructure-pme/README.md",
    "labs/infrastructure-pme/topologie-lab001.svg",
    "labs/infrastructure-pme/plan-adressage.csv",
    "labs/infrastructure-pme/switch-cisco-ios.cfg",
    "labs/infrastructure-pme/matrice-pfsense.csv",
    "labs/infrastructure-pme/plan-de-tests.csv",
)
ERRORS: list[str] = []


class PageAudit(HTMLParser):
    def __init__(self, path: Path) -> None:
        super().__init__(convert_charrefs=True)
        self.path = path
        self.ids: set[str] = set()
        self.links: list[str] = []
        self.resources: list[str] = []
        self.jsonld: list[dict] = []
        self._jsonld_chunks: list[str] | None = None
        self._evidence_chunks: list[str] | None = None
        self.evidence_catalog: dict | None = None
        self._case_study_chunks: list[str] | None = None
        self.case_study_catalog: dict | None = None
        self._in_title = False
        self.descriptions: list[str] = []
        self.titles: list[str] = []
        self.og_properties: set[str] = set()
        self.twitter_names: set[str] = set()
        self.project_ids: list[str] = []
        self.project_visuals: list[str] = []
        self.dialog_visuals: set[str] = set()
        self.language = ""

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        element_id = values.get("id")
        if element_id:
            if element_id in self.ids:
                ERRORS.append(f"{self.path}: identifiant HTML dupliqué: #{element_id}")
            self.ids.add(element_id)

        if tag == "html":
            self.language = values.get("lang") or ""
        if tag == "title":
            self._in_title = True

        if "href" in values and values["href"]:
            self.links.append(values["href"] or "")
        if "src" in values and values["src"]:
            self.resources.append(values["src"] or "")

        if tag == "meta":
            if values.get("name") == "description" and values.get("content"):
                self.descriptions.append(values["content"] or "")
            if (values.get("property") or "").startswith("og:"):
                self.og_properties.add(values["property"] or "")
            if (values.get("name") or "").startswith("twitter:"):
                self.twitter_names.add(values["name"] or "")

        if "data-project-open" in values:
            project_id = values.get("data-project-id") or ""
            visual = values.get("data-visual") or ""
            if project_id:
                self.project_ids.append(project_id)
            if visual:
                self.project_visuals.append(visual)

        if "data-dialog-art" in values:
            self.dialog_visuals.add(values.get("data-dialog-art") or "")

        if tag == "script" and values.get("type") == "application/ld+json":
            self._jsonld_chunks = []
        if tag == "script" and values.get("type") == "application/json" and values.get("id") == "netlab-evidence-catalog":
            self._evidence_chunks = []
        if tag == "script" and values.get("type") == "application/json" and values.get("id") == "netlab-case-studies":
            self._case_study_chunks = []

    def handle_data(self, data: str) -> None:
        if self._in_title and data.strip():
            self.titles.append(data.strip())
        if self._jsonld_chunks is not None:
            self._jsonld_chunks.append(data)
        if self._evidence_chunks is not None:
            self._evidence_chunks.append(data)
        if self._case_study_chunks is not None:
            self._case_study_chunks.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "title":
            self._in_title = False
        if tag == "script" and self._jsonld_chunks is not None:
            raw = "".join(self._jsonld_chunks).strip()
            try:
                parsed = json.loads(raw)
                if isinstance(parsed, dict):
                    self.jsonld.append(parsed)
                else:
                    ERRORS.append(f"{self.path}: le JSON-LD doit être un objet JSON.")
            except json.JSONDecodeError as exc:
                ERRORS.append(f"{self.path}: JSON-LD invalide: {exc}")
            self._jsonld_chunks = None
        if tag == "script" and self._evidence_chunks is not None:
            raw = "".join(self._evidence_chunks).strip()
            try:
                parsed = json.loads(raw)
                if isinstance(parsed, dict):
                    self.evidence_catalog = parsed
                else:
                    ERRORS.append(f"{self.path}: le catalogue de preuves doit être un objet JSON.")
            except json.JSONDecodeError as exc:
                ERRORS.append(f"{self.path}: catalogue de preuves JSON invalide: {exc}")
            self._evidence_chunks = None
        if tag == "script" and self._case_study_chunks is not None:
            raw = "".join(self._case_study_chunks).strip()
            try:
                parsed = json.loads(raw)
                if isinstance(parsed, dict):
                    self.case_study_catalog = parsed
                else:
                    ERRORS.append(f"{self.path}: le catalogue d'études de cas doit être un objet JSON.")
            except json.JSONDecodeError as exc:
                ERRORS.append(f"{self.path}: catalogue d'études de cas JSON invalide: {exc}")
            self._case_study_chunks = None


def load_page(path: Path) -> PageAudit:
    parser = PageAudit(path.relative_to(ROOT))
    parser.feed(path.read_text(encoding="utf-8"))
    parser.close()
    return parser


def is_external(url: str) -> bool:
    parts = urlsplit(url)
    return bool(parts.scheme or parts.netloc) or url.startswith("//")


def check_local_reference(page_path: Path, reference: str, pages: dict[Path, PageAudit]) -> None:
    if not reference or is_external(reference):
        return

    parts = urlsplit(reference)
    raw_path = unquote(parts.path)
    target = (ROOT / page_path.parent / raw_path).resolve() if raw_path else (ROOT / page_path).resolve()

    try:
        target.relative_to(ROOT)
    except ValueError:
        ERRORS.append(f"{page_path}: chemin local hors du site: {reference}")
        return

    if target.is_dir():
        target = target / "index.html"
    if not target.is_file():
        ERRORS.append(f"{page_path}: ressource locale introuvable: {reference}")
        return

    if not parts.fragment:
        return

    target_relative = target.relative_to(ROOT)
    target_page = pages.get(target_relative)
    if target_page is None and target.suffix.lower() == ".html":
        target_page = load_page(target)
        pages[target_relative] = target_page

    fragment = unquote(parts.fragment)
    if target_page and fragment in target_page.ids:
        return

    # The three project dossiers are JavaScript-powered dialog routes, not static IDs.
    if target_relative == Path("index.html"):
        known_routes = {f"project-{item}" for item in target_page.project_ids} if target_page else set()
        if fragment in known_routes:
            return

    ERRORS.append(f"{page_path}: ancre locale introuvable: {reference}")


def check_css_braces(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    depth = 0
    index = 0
    quote: str | None = None
    in_comment = False
    escaped = False

    while index < len(text):
        char = text[index]
        next_char = text[index + 1] if index + 1 < len(text) else ""

        if in_comment:
            if char == "*" and next_char == "/":
                in_comment = False
                index += 2
                continue
        elif quote:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == quote:
                quote = None
        elif char == "/" and next_char == "*":
            in_comment = True
            index += 2
            continue
        elif char in ("'", '"'):
            quote = char
        elif char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth < 0:
                ERRORS.append("assets/css/styles.css: accolade fermante sans ouverture.")
                return
        index += 1

    if in_comment or quote or depth != 0:
        ERRORS.append(f"assets/css/styles.css: bloc incomplet (accolades restantes: {depth}).")


def main() -> int:
    pages: dict[Path, PageAudit] = {}
    for name in PAGE_NAMES:
        path = ROOT / name
        if not path.is_file():
            ERRORS.append(f"Page obligatoire absente: {name}")
            continue
        pages[Path(name)] = load_page(path)

    for name, page in pages.items():
        if page.language != "fr":
            ERRORS.append(f"{name}: attribut lang='fr' absent ou incorrect.")
        source = ROOT / name
        for reference in page.links + page.resources:
            check_local_reference(source, reference, pages)

        html_text = source.read_text(encoding="utf-8")
        if not page.titles or "<title>" not in html_text.lower():
            ERRORS.append(f"{name}: balise title manquante.")
        if len(page.descriptions) != 1:
            ERRORS.append(f"{name}: une seule meta description est attendue.")
        if not {"og:title", "og:description", "og:type"}.issubset(page.og_properties):
            ERRORS.append(f"{name}: métadonnées Open Graph essentielles manquantes.")
        if not {"twitter:card", "twitter:title", "twitter:description"}.issubset(page.twitter_names):
            ERRORS.append(f"{name}: métadonnées Twitter Card essentielles manquantes.")

    home = pages.get(Path("index.html"))
    docs = pages.get(Path("documentation.html"))
    if home:
        if len(home.project_ids) != 3 or len(set(home.project_ids)) != 3:
            ERRORS.append("index.html: les trois identifiants de dossiers projets doivent être uniques.")
        if set(home.project_visuals) != home.dialog_visuals:
            ERRORS.append("index.html: les clés de visuels des projets ne correspondent pas aux panneaux du dialogue.")
        if not any(item.get("@type") == "Person" for item in home.jsonld):
            ERRORS.append("index.html: données structurées Person absentes.")
        if home.evidence_catalog is None:
            ERRORS.append("index.html: catalogue de preuves absent ou invalide.")
        if home.case_study_catalog is None:
            ERRORS.append("index.html: catalogue d'études de cas absent ou invalide.")
        else:
            if set(home.case_study_catalog) != set(home.project_ids):
                ERRORS.append("index.html: le catalogue d'études de cas doit couvrir exactement les trois projets.")
            allowed_states = {"available", "described", "prepared", "planned", "verify"}
            for project_id, case in home.case_study_catalog.items():
                if not isinstance(case, dict) or not case.get("stateLabel") or not case.get("summary"):
                    ERRORS.append(f"index.html: résumé d'étude de cas incomplet pour {project_id}.")
                    continue
                stages = case.get("stages")
                if not isinstance(stages, list) or len(stages) < 3:
                    ERRORS.append(f"index.html: au moins trois étapes sont attendues pour {project_id}.")
                    continue
                for stage in stages:
                    required = ("state", "title", "detail", "deliverable")
                    if not isinstance(stage, dict) or not all(stage.get(key) for key in required):
                        ERRORS.append(f"index.html: étape incomplète dans l'étude de cas {project_id}.")
                        continue
                    if stage["state"] not in allowed_states:
                        ERRORS.append(f"index.html: état non autorisé dans l'étude de cas {project_id}: {stage['state']}.")
        html_source = (ROOT / "index.html").read_text(encoding="utf-8")
        for marker in (
            'data-case-study-timeline',
            'data-case-study-summary',
            'data-case-study-state',
        ):
            if marker not in html_source:
                ERRORS.append(f"index.html: parcours d'étude de cas incomplet ({marker}).")
        for marker in (
            'data-evidence-lightbox',
            'data-evidence-lightbox-image',
            'data-evidence-lightbox-close',
        ):
            if marker not in html_source:
                ERRORS.append(f"index.html: composant de consultation agrandie manquant ({marker}).")
        js_source = (ROOT / "assets/js/main.js").read_text(encoding="utf-8")
        if "openEvidenceLightbox" not in js_source or 'data-evidence-lightbox-close' not in js_source:
            ERRORS.append("main.js: interactions de consultation agrandie absentes.")
        else:
            if set(home.evidence_catalog) != set(home.project_ids):
                ERRORS.append("index.html: le catalogue de preuves doit couvrir exactement les trois projets.")
            for project_id, entry in home.evidence_catalog.items():
                if not isinstance(entry, dict):
                    ERRORS.append(f"index.html: entrée de preuve invalide pour {project_id}.")
                    continue
                pending = entry.get("pending", [])
                media = entry.get("media", [])
                if not isinstance(pending, list) or not isinstance(media, list):
                    ERRORS.append(f"index.html: listes pending/media invalides pour {project_id}.")
                    continue
                if not pending and not media:
                    ERRORS.append(f"index.html: aucune preuve attendue ni publiée pour {project_id}.")
                for item in pending:
                    if not isinstance(item, dict) or not all(item.get(key) for key in ("category", "title", "detail")):
                        ERRORS.append(f"index.html: élément à collecter incomplet pour {project_id}.")
                for item in media:
                    if not isinstance(item, dict) or not all(item.get(key) for key in ("src", "alt", "title", "caption", "category")):
                        ERRORS.append(f"index.html: média incomplet pour {project_id}.")
                        continue
                    media_path = Path(item["src"])
                    if media_path.is_absolute() or ".." in media_path.parts or media_path.suffix.lower() not in {".png", ".jpg", ".jpeg", ".webp"}:
                        ERRORS.append(f"index.html: chemin ou format de média non autorisé pour {project_id}: {item['src']}")
                        continue
                    if not (ROOT / media_path).is_file():
                        ERRORS.append(f"index.html: fichier de preuve introuvable pour {project_id}: {item['src']}")
    if docs and not any(item.get("@type") == "WebPage" for item in docs.jsonld):
        ERRORS.append("documentation.html: données structurées WebPage absentes.")

    # The LAB 001 pack is a set of preparation templates, not claimed execution evidence.
    for relative in LAB_PACK_FILES:
        if not (ROOT / relative).is_file():
            ERRORS.append(f"Livrable LAB 001 absent: {relative}")

    lab_root = ROOT / "labs/infrastructure-pme"
    if lab_root.is_dir():
        svg_path = lab_root / "topologie-lab001.svg"
        if svg_path.is_file() and "<svg" not in svg_path.read_text(encoding="utf-8"):
            ERRORS.append("LAB 001: schéma SVG invalide ou vide.")
        switch_path = lab_root / "switch-cisco-ios.cfg"
        if switch_path.is_file():
            switch_text = switch_path.read_text(encoding="utf-8")
            for expected in ("vlan 10", "vlan 20", "vlan 30", "switchport trunk allowed vlan 10,20,30"):
                if expected not in switch_text:
                    ERRORS.append(f"LAB 001: configuration switch incomplète ({expected}).")
        policy_path = lab_root / "matrice-pfsense.csv"
        if policy_path.is_file():
            policy_text = policy_path.read_text(encoding="utf-8")
            for expected in ("ALIAS_RFC1918", "REFUS PAR DÉFAUT", "BLOQUER"):
                if expected not in policy_text:
                    ERRORS.append(f"LAB 001: matrice pfSense incomplète ({expected}).")
        tests_path = lab_root / "plan-de-tests.csv"
        if tests_path.is_file():
            tests_text = tests_path.read_text(encoding="utf-8")
            if tests_text.count("NON EXÉCUTÉ") < 8:
                ERRORS.append("LAB 001: les huit tests doivent rester explicitement non exécutés avant validation.")
        address_path = lab_root / "plan-adressage.csv"
        if address_path.is_file():
            address_text = address_path.read_text(encoding="utf-8")
            for subnet in ("192.168.10.0/24", "192.168.20.0/24", "192.168.30.0/24"):
                if subnet not in address_text:
                    ERRORS.append(f"LAB 001: plan d'adressage incomplet ({subnet}).")

    if docs:
        docs_html = (ROOT / "documentation.html").read_text(encoding="utf-8")
        for marker in ("docs-download-grid", "topologie-lab001.svg", "plan-adressage.csv", "switch-cisco-ios.cfg", "matrice-pfsense.csv", "plan-de-tests.csv"):
            if marker not in docs_html:
                ERRORS.append(f"documentation.html: lien de livrable LAB 001 absent ({marker}).")

    css_path = ROOT / "assets/css/styles.css"
    if css_path.is_file():
        check_css_braces(css_path)
    else:
        ERRORS.append("Feuille de styles absente: assets/css/styles.css")

    for script in ("assets/js/main.js", "assets/js/network-tools.js"):
        if not (ROOT / script).is_file():
            ERRORS.append(f"Script obligatoire absent: {script}")

    if ERRORS:
        print("NETLAB quality checks: ÉCHEC")
        for error in ERRORS:
            print(f" - {error}")
        return 1

    print("NETLAB quality checks: OK")
    print(f" - {len(pages)} pages HTML contrôlées")
    print(" - liens et ressources locales vérifiés")
    print(" - identifiants, routes projets et visuels cohérents")
    print(" - catalogue de preuves, médias locaux et éléments à collecter contrôlés")
    print(" - parcours des trois études de cas et états des étapes contrôlés")
    print(" - livrables du pack LAB 001 et statut non exécuté des tests contrôlés")
    print(" - aperçu agrandi, fermeture accessible et structure de la lightbox contrôlés")
    print(" - métadonnées Open Graph / Twitter et JSON-LD contrôlés")
    print(" - structure CSS et présence des scripts vérifiées")
    return 0


if __name__ == "__main__":
    sys.exit(main())
