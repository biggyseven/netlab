(() => {
  "use strict";

  const root = document.documentElement;
  const themePicker = document.querySelector("[data-theme-picker]");
  const themeTrigger = document.querySelector("[data-theme-trigger]");
  const themeMenu = document.querySelector("[data-theme-menu]");
  const themeLabel = document.querySelector("[data-theme-label]");
  const themeOptions = [...document.querySelectorAll("[data-theme-option]")];
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");
  const navLinks = [...document.querySelectorAll("[data-nav] a")];

  const themeDefinitions = {
    noc: { label: "NOC Signal", color: "#0B1420" },
    blueprint: { label: "Blueprint Engineering", color: "#F2F6FC" },
    observability: { label: "Observability Graphite", color: "#171A24" },
    "classic-dark": { label: "Classique sombre", color: "#07101D" },
    "classic-light": { label: "Classique clair", color: "#F4F8FC" }
  };

  const closeThemeMenu = () => {
    if (!themeMenu || !themeTrigger) return;
    themeMenu.hidden = true;
    themeTrigger.setAttribute("aria-expanded", "false");
  };

  const applyTheme = (theme, persist = false) => {
    const selected = themeDefinitions[theme] ? theme : "noc";
    root.dataset.theme = selected;
    const definition = themeDefinitions[selected];

    if (themeLabel) themeLabel.textContent = definition.label;
    if (themeTrigger) {
      themeTrigger.setAttribute("aria-label", "Choisir un thème. Thème actuel : " + definition.label);
      themeTrigger.setAttribute("aria-expanded", "false");
    }
    themeOptions.forEach(option => {
      option.setAttribute("aria-pressed", String(option.dataset.themeOption === selected));
    });

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) metaTheme.setAttribute("content", definition.color);

    if (persist) {
      try { localStorage.setItem("netlab-theme", selected); } catch (_) { /* stockage indisponible */ }
    }
  };

  applyTheme(root.dataset.theme || "noc");

  themeTrigger?.addEventListener("click", () => {
    const willOpen = themeTrigger.getAttribute("aria-expanded") !== "true";
    if (themeMenu) themeMenu.hidden = !willOpen;
    themeTrigger.setAttribute("aria-expanded", String(willOpen));
  });

  themeOptions.forEach(option => option.addEventListener("click", () => {
    applyTheme(option.dataset.themeOption, true);
    closeThemeMenu();
    themeTrigger?.focus();
  }));

  const closeMenu = () => {
    nav?.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Ouvrir le menu");
  };

  menuToggle?.addEventListener("click", () => {
    const willOpen = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(willOpen));
    menuToggle.setAttribute("aria-label", willOpen ? "Fermer le menu" : "Ouvrir le menu");
    nav?.classList.toggle("is-open", willOpen);
  });

  navLinks.forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeMenu();
      closeThemeMenu();
    }
  });
  document.addEventListener("click", event => {
    if (nav?.classList.contains("is-open") && !nav.contains(event.target) && !menuToggle?.contains(event.target)) {
      closeMenu();
    }
    if (themeMenu && !themeMenu.hidden && themePicker && !themePicker.contains(event.target)) {
      closeThemeMenu();
    }
  });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll("[data-reveal]").forEach(el => revealObserver.observe(el));

    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const current = "#" + entry.target.id;
        navLinks.forEach(link => {
          const active = link.getAttribute("href") === current;
          link.classList.toggle("is-active", active);
          if (active) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });
    ["profil", "competences", "projets", "laboratoire", "journal", "methode", "ipv4", "pme", "zabbix"].forEach(id => {
      const section = document.getElementById(id);
      if (section) sectionObserver.observe(section);
    });
  } else {
    document.querySelectorAll("[data-reveal]").forEach(el => el.classList.add("is-visible"));
  }

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();


  // Project filters and text search
  const projectFilters = [...document.querySelectorAll("[data-project-filter]")];
  const projectCards = [...document.querySelectorAll("[data-project-card]")];
  const projectCount = document.querySelector("[data-project-count]");
  const projectTotal = document.querySelector("[data-project-total]");
  const projectSearch = document.querySelector("[data-project-search]");
  const projectEmpty = document.querySelector("[data-project-empty]");
  const projectReset = document.querySelector("[data-project-reset]");
  let activeProjectFilter = "all";

  const normalizeSearchText = value => (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .trim();

  const filterProjects = () => {
    const query = normalizeSearchText(projectSearch?.value || "");
    let visible = 0;

    projectCards.forEach(card => {
      const categories = (card.dataset.category || "").split(/\s+/);
      const matchesCategory = activeProjectFilter === "all" || categories.includes(activeProjectFilter);
      const searchableContent = normalizeSearchText(card.textContent + " " + (card.dataset.category || ""));
      const matchesQuery = !query || searchableContent.includes(query);
      const show = matchesCategory && matchesQuery;
      card.hidden = !show;
      if (show) visible += 1;
    });

    if (projectCount) projectCount.textContent = String(visible).padStart(2, "0");
    if (projectTotal) projectTotal.textContent = "/ " + String(projectCards.length).padStart(2, "0") + " PROJETS";
    if (projectEmpty) projectEmpty.hidden = visible !== 0;
  };

  projectFilters.forEach(button => button.addEventListener("click", () => {
    activeProjectFilter = button.dataset.projectFilter || "all";
    projectFilters.forEach(item => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    filterProjects();
  }));
  projectSearch?.addEventListener("input", filterProjects);
  projectReset?.addEventListener("click", () => {
    if (projectSearch) projectSearch.value = "";
    activeProjectFilter = "all";
    projectFilters.forEach(item => {
      const active = item.dataset.projectFilter === "all";
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    filterProjects();
    projectSearch?.focus();
  });
  filterProjects();

  // Project detail dialog
  const projectDialog = document.querySelector("[data-project-dialog]");
  const dialogTitle = document.querySelector("[data-dialog-title]");
  const dialogStatus = document.querySelector("[data-dialog-status]");
  const dialogSummary = document.querySelector("[data-dialog-summary]");
  const dialogTools = document.querySelector("[data-dialog-tools]");
  const dialogObjectives = document.querySelector("[data-dialog-objectives]");
  document.querySelectorAll("[data-project-open]").forEach(button => button.addEventListener("click", () => {
    if (!projectDialog) return;
    if (dialogTitle) dialogTitle.textContent = button.dataset.title || "Fiche projet";
    if (dialogStatus) {
      dialogStatus.textContent = button.dataset.status || "État non précisé";
      const planned = button.closest(".project-card")?.querySelector(".project-status")?.classList.contains("status-planned");
      dialogStatus.className = "project-status " + (planned ? "status-planned" : "status-progress");
    }
    if (dialogSummary) dialogSummary.textContent = button.dataset.summary || "";
    if (dialogTools) {
      dialogTools.replaceChildren();
      (button.dataset.tools || "").split("|").filter(Boolean).forEach(value => {
        const tag = document.createElement("span"); tag.textContent = value; dialogTools.append(tag);
      });
    }
    if (dialogObjectives) {
      dialogObjectives.replaceChildren();
      (button.dataset.objectives || "").split("|").filter(Boolean).forEach(value => {
        const item = document.createElement("li"); item.textContent = value; dialogObjectives.append(item);
      });
    }
    projectDialog.showModal();
  }));
  document.querySelector("[data-dialog-close]")?.addEventListener("click", () => projectDialog?.close());
  projectDialog?.addEventListener("click", event => { if (event.target === projectDialog) projectDialog.close(); });

  // Interactive role descriptions for the conceptual topology
  const topologyInfo = {
    "node-router": ["Routeur", "Relie des réseaux IP différents et choisit la prochaine destination des paquets."],
    "node-switch": ["Commutateur (switch)", "Connecte les équipements d'un même réseau local. Les VLAN permettent de séparer les domaines logiques."],
    "node-firewall": ["Pare-feu pfSense", "Applique des règles de filtrage entre les zones réseau et peut assurer le NAT."],
    "node-server": ["Serveur", "Héberge les services internes. Le laboratoire prévu utilisera Ubuntu Server pour la supervision."],
    "node-client-a": ["Poste administration", "Poste du VLAN Administration. Son accès aux outils dépend des règles de sécurité."],
    "node-client-b": ["Poste utilisateur", "Poste du VLAN Utilisateurs. Son accès aux serveurs est limité aux services nécessaires."]
  };
  const topologyNodes = [...document.querySelectorAll(".network-node")];
  const topologyTitle = document.querySelector("[data-topology-title]");
  const topologyRole = document.querySelector("[data-topology-role]");
  const topologyIndex = document.querySelector(".inspector-index");
  const selectTopologyNode = (node, index) => {
    topologyNodes.forEach(item => {
      const selected = item === node;
      item.setAttribute("aria-pressed", String(selected));
      item.setAttribute("role", "button");
      item.setAttribute("tabindex", "0");
    });
    const key = [...node.classList].find(className => topologyInfo[className]);
    const info = topologyInfo[key] || ["Équipement réseau", ""];
    if (topologyTitle) topologyTitle.textContent = info[0];
    if (topologyRole) topologyRole.textContent = info[1];
    if (topologyIndex) topologyIndex.textContent = "NODE / " + String(index + 1).padStart(2, "0");
  };
  topologyNodes.forEach((node, index) => {
    node.addEventListener("click", () => selectTopologyNode(node, index));
    node.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectTopologyNode(node, index); }
    });
  });
  if (topologyNodes[0]) selectTopologyNode(topologyNodes[0], 0);


  // Interactive VLAN inspector for the conceptual PME topology
  const vlanNodes = [...document.querySelectorAll("[data-vlan-node]")];
  const vlanTitle = document.querySelector("[data-vlan-title]");
  const vlanRole = document.querySelector("[data-vlan-role]");
  const vlanSubnet = document.querySelector("[data-vlan-subnet]");

  const selectVlan = node => {
    vlanNodes.forEach(item => item.setAttribute("aria-pressed", String(item === node)));
    if (vlanTitle) vlanTitle.textContent = node.dataset.title || "Segment VLAN";
    if (vlanRole) vlanRole.textContent = node.dataset.role || "";
    if (vlanSubnet) vlanSubnet.textContent = "SOUS-RÉSEAU PRÉVU · " + (node.dataset.subnet || "À définir");
  };

  vlanNodes.forEach(node => node.addEventListener("click", () => selectVlan(node)));
  if (vlanNodes[0]) selectVlan(vlanNodes[0]);



  // LAB 001 progress tracker, stored only in this browser.
  const labTracker = document.querySelector("[data-lab-tracker]");
  if (labTracker) {
    const taskInputs = [...labTracker.querySelectorAll("[data-lab-task]")];
    const progressBar = labTracker.querySelector("[data-lab-progress]");
    const progressFill = labTracker.querySelector("[data-lab-progress-fill]");
    const progressCount = labTracker.querySelector("[data-lab-progress-count]");
    const progressStatus = labTracker.querySelector("[data-lab-progress-status]");
    const resetButton = labTracker.querySelector("[data-lab-progress-reset]");
    const storageKey = "netlab-lab001-progress-v1";

    const readProgress = () => {
      try {
        const stored = JSON.parse(localStorage.getItem(storageKey) || "{}");
        return stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {};
      } catch (_) {
        return {};
      }
    };

    const saveProgress = () => {
      const state = {};
      taskInputs.forEach(input => { state[input.dataset.labTask] = input.checked; });
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
        if (progressStatus) progressStatus.textContent = "Suivi enregistré dans ce navigateur.";
      } catch (_) {
        if (progressStatus) progressStatus.textContent = "Stockage indisponible : le suivi restera temporaire.";
      }
    };

    const renderProgress = () => {
      const completed = taskInputs.filter(input => input.checked).length;
      const total = taskInputs.length;
      if (progressCount) progressCount.textContent = completed + " / " + total;
      if (progressBar) {
        progressBar.setAttribute("aria-valuenow", String(completed));
        progressBar.setAttribute("aria-valuetext", completed + " étape(s) marquée(s) sur " + total);
      }
      if (progressFill) progressFill.style.width = (total ? completed / total * 100 : 0) + "%";
      if (progressStatus && completed === total) {
        progressStatus.textContent = "Toutes les étapes sont marquées. Vérifie que les preuves de test sont conservées.";
      } else if (progressStatus && completed === 0) {
        progressStatus.textContent = "Aucune étape marquée pour le moment.";
      } else if (progressStatus) {
        progressStatus.textContent = completed + " étape(s) marquée(s) comme réalisée(s).";
      }
    };

    const saved = readProgress();
    taskInputs.forEach(input => {
      input.checked = saved[input.dataset.labTask] === true;
      input.addEventListener("change", () => {
        saveProgress();
        renderProgress();
      });
    });
    resetButton?.addEventListener("click", () => {
      taskInputs.forEach(input => { input.checked = false; });
      saveProgress();
      renderProgress();
    });
    renderProgress();
  }

    // Local educational simulator for example inter-VLAN firewall rules.
  const flowSimulator = document.querySelector("[data-flow-simulator]");
  if (flowSimulator) {
    const flowForm = flowSimulator.querySelector("[data-flow-form]");
    const flowSource = flowSimulator.querySelector("[data-flow-source]");
    const flowDestination = flowSimulator.querySelector("[data-flow-destination]");
    const flowService = flowSimulator.querySelector("[data-flow-service]");
    const flowResult = flowSimulator.querySelector("[data-flow-result]");
    const flowKicker = flowSimulator.querySelector("[data-flow-kicker]");
    const flowVerdict = flowSimulator.querySelector("[data-flow-verdict]");
    const flowExplanation = flowSimulator.querySelector("[data-flow-explanation]");
    const flowDetail = flowSimulator.querySelector("[data-flow-detail]");
    const flowPath = flowSimulator.querySelector("[data-flow-path]");
    const flowPathCaption = flowSimulator.querySelector("[data-flow-path-caption]");
    const flowPathSteps = [...flowSimulator.querySelectorAll("[data-flow-step]")];
    const flowSourceLabel = flowSimulator.querySelector("[data-flow-source-label]");
    const flowSourceSubnet = flowSimulator.querySelector("[data-flow-source-subnet]");
    const flowDestinationLabel = flowSimulator.querySelector("[data-flow-destination-label]");
    const flowDestinationSubnet = flowSimulator.querySelector("[data-flow-destination-subnet]");

    const serviceLabels = {
      dns: "DNS · TCP/UDP 53",
      https: "HTTPS · TCP 443",
      ssh: "SSH · TCP 22",
      rdp: "RDP · TCP 3389",
      icmp: "ICMP · Echo"
    };
    const exampleRules = {
      "10>20": ["ssh", "rdp", "icmp"],
      "10>30": ["dns", "https", "ssh", "icmp"],
      "20>30": ["dns", "https"]
    };
    const networkDetails = {
      "10": { label: "VLAN 10 · ADMIN", subnet: "192.168.10.0/24" },
      "20": { label: "VLAN 20 · USERS", subnet: "192.168.20.0/24" },
      "30": { label: "VLAN 30 · SERVERS", subnet: "192.168.30.0/24" }
    };
    const networkLabel = value => ({
      "10": "VLAN 10 · Administration",
      "20": "VLAN 20 · Utilisateurs",
      "30": "VLAN 30 · Serveurs"
    }[value] || "VLAN inconnu");

    flowForm?.addEventListener("submit", event => {
      event.preventDefault();
      if (!flowSource || !flowDestination || !flowService || !flowResult) return;

      const source = flowSource.value;
      const destination = flowDestination.value;
      const service = flowService.value;
      const key = source + ">" + destination;
      const sameNetwork = source === destination;
      const allowed = Boolean(exampleRules[key]?.includes(service));
      const sourceLabel = networkLabel(source);
      const destinationLabel = networkLabel(destination);
      const serviceLabel = serviceLabels[service] || service.toUpperCase();

      let state = "blocked";
      let kicker = "POLITIQUE PAR DÉFAUT";
      let verdict = "Flux bloqué";
      let explanation = "Aucune règle d'autorisation n'est définie pour ce nouveau flux. Dans cette politique pédagogique, le refus par défaut s'applique.";

      if (sameNetwork) {
        state = "local";
        kicker = "TRAJET LOCAL";
        verdict = "Pas de routage inter-VLAN";
        explanation = "La source et la destination appartiennent au même VLAN. Le trafic reste dans le réseau local et ne passe pas par la passerelle inter-VLAN, sous réserve de la segmentation L2.";
      } else if (allowed) {
        state = "allowed";
        kicker = "RÈGLE D'AUTORISATION TROUVÉE";
        verdict = "Flux autorisé par l'exemple";
        explanation = "La politique de démonstration autorise " + serviceLabel + " de " + sourceLabel + " vers " + destinationLabel + ". Cette décision est une simulation locale, pas un test de paquets.";
      } else {
        explanation = "Aucune règle d'autorisation ne couvre " + serviceLabel + " de " + sourceLabel + " vers " + destinationLabel + ". Le nouveau flux est donc refusé par défaut dans cet exemple.";
      }

      flowResult.dataset.state = state;
      if (flowKicker) flowKicker.textContent = kicker;
      if (flowVerdict) flowVerdict.textContent = verdict;
      if (flowExplanation) flowExplanation.textContent = explanation;
      if (flowDetail) flowDetail.textContent = sourceLabel + " → " + destinationLabel + " · " + serviceLabel;

      const sourceInfo = networkDetails[source] || { label: "VLAN inconnu", subnet: "À définir" };
      const destinationInfo = networkDetails[destination] || { label: "VLAN inconnu", subnet: "À définir" };
      if (flowSourceLabel) flowSourceLabel.textContent = sourceInfo.label;
      if (flowSourceSubnet) flowSourceSubnet.textContent = sourceInfo.subnet;
      if (flowDestinationLabel) flowDestinationLabel.textContent = destinationInfo.label;
      if (flowDestinationSubnet) flowDestinationSubnet.textContent = destinationInfo.subnet;

      if (flowPath) {
        flowPath.dataset.state = state;
        flowPathSteps.forEach(step => {
          const name = step.dataset.flowStep;
          let stepState = "inactive";
          if (state === "allowed") stepState = "active";
          else if (state === "blocked") {
            if (name === "source") stepState = "active";
            if (name === "gateway") stepState = "blocked";
          } else if (state === "local") {
            if (name === "source" || name === "switch" || name === "destination") stepState = "active";
            if (name === "gateway") stepState = "bypassed";
          }
          step.dataset.status = stepState;
        });
        flowPath.querySelectorAll("[data-flow-link]").forEach((link, index) => {
          const active = state === "allowed" ||
            (state === "blocked" && index === 0) ||
            (state === "local" && index === 2);
          link.dataset.status = active ? "active" : "inactive";
        });
      }
      if (flowPathCaption) {
        const captions = {
          allowed: "Chemin accepté par la politique d'exemple : source → pfSense → switch → destination.",
          blocked: "Arrêt simulé au niveau du filtrage pfSense : le segment de destination n'est pas atteint.",
          local: "Même VLAN : commutation locale, la passerelle pfSense est contournée."
        };
        flowPathCaption.textContent = captions[state] || "Le chemin s'actualisera après l'analyse du flux.";
      }
    });
  }

  // Documentation: copy command snippets with a fallback for older contexts.
  document.querySelectorAll("[data-copy-code]").forEach(button => button.addEventListener("click", async () => {
    const code = button.closest(".docs-code")?.querySelector("pre code");
    if (!code) return;
    const label = button.querySelector("[data-copy-label]");
    const originalLabel = label?.textContent || "Copier";
    const value = code.textContent || "";

    const fallbackCopy = text => {
      const field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.append(field);
      field.select();
      const copied = document.execCommand("copy");
      field.remove();
      if (!copied) throw new Error("Copie indisponible");
    };

    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(value);
      else fallbackCopy(value);
      if (label) label.textContent = "Copié";
      button.setAttribute("aria-label", "Commande copiée");
    } catch (_) {
      if (label) label.textContent = "Copie indisponible";
      button.setAttribute("aria-label", "Copie indisponible");
    }

    window.setTimeout(() => {
      if (label) label.textContent = originalLabel;
      button.setAttribute("aria-label", "Copier les commandes");
    }, 1800);
  }));

  const docsLinks = [...document.querySelectorAll(".docs-sidebar a[href^='#']")];
  if (docsLinks.length && "IntersectionObserver" in window) {
    const docsObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        docsLinks.forEach(link => {
          const active = link.getAttribute("href") === "#" + entry.target.id;
          link.classList.toggle("is-active", active);
          if (active) link.setAttribute("aria-current", "location");
          else link.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-20% 0px -65% 0px", threshold: 0 });
    ["ipv4", "pme", "zabbix"].forEach(id => {
      const section = document.getElementById(id);
      if (section) docsObserver.observe(section);
    });
  }

})();