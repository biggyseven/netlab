(() => {
  "use strict";

  const tool = document.querySelector("[data-subnet-tool]");
  if (!tool) return;

  const form = tool.querySelector("[data-subnet-form]");
  const input = tool.querySelector("#subnet-cidr");
  const error = tool.querySelector("[data-subnet-error]");
  const note = tool.querySelector("[data-subnet-note]");

  const output = {
    network: tool.querySelector("[data-subnet-network]"),
    mask: tool.querySelector("[data-subnet-mask]"),
    broadcast: tool.querySelector("[data-subnet-broadcast]"),
    wildcard: tool.querySelector("[data-subnet-wildcard]"),
    first: tool.querySelector("[data-subnet-first]"),
    last: tool.querySelector("[data-subnet-last]"),
    total: tool.querySelector("[data-subnet-total]"),
    usable: tool.querySelector("[data-subnet-usable]")
  };

  const FULL_MASK = 0xffffffffn;
  const numberFormat = new Intl.NumberFormat("fr-FR");

  function ipv4ToInteger(address) {
    const octets = address.split(".");
    if (octets.length !== 4) throw new Error("L’adresse doit contenir quatre octets.");

    return octets.reduce((value, octet) => {
      if (!/^\d{1,3}$/.test(octet)) throw new Error("Chaque octet doit être un nombre entre 0 et 255.");
      const part = Number(octet);
      if (part > 255) throw new Error("Chaque octet doit être compris entre 0 et 255.");
      return (value << 8n) | BigInt(part);
    }, 0n);
  }

  function integerToIPv4(value) {
    return [24n, 16n, 8n, 0n]
      .map(shift => Number((value >> shift) & 255n))
      .join(".");
  }

  function calculateSubnet(value) {
    const match = /^(\d{1,3}(?:\.\d{1,3}){3})\/(\d{1,2})$/.exec(value.trim());
    if (!match) throw new Error("Format attendu : 192.168.10.25/24.");

    const address = ipv4ToInteger(match[1]);
    const prefix = Number(match[2]);
    if (prefix < 0 || prefix > 32) throw new Error("Le préfixe CIDR doit être compris entre /0 et /32.");

    const mask = prefix === 0 ? 0n : (FULL_MASK << BigInt(32 - prefix)) & FULL_MASK;
    const wildcard = FULL_MASK ^ mask;
    const network = address & mask;
    const broadcast = network | wildcard;
    const total = 2n ** BigInt(32 - prefix);

    let usable;
    let first;
    let last;
    let explanation;

    if (prefix <= 30) {
      usable = total - 2n;
      first = network + 1n;
      last = broadcast - 1n;
      explanation = "Préfixe /" + prefix + " · " + numberFormat.format(total) +
        " adresses au total · " + numberFormat.format(usable) +
        " hôtes utilisables, après exclusion de l’adresse réseau et du broadcast.";
    } else if (prefix === 31) {
      usable = 2n;
      first = network;
      last = broadcast;
      explanation = "Préfixe /31 · adapté aux liaisons point à point : les deux adresses sont utilisables, sans adresse réseau ni broadcast réservée à cet usage.";
    } else {
      usable = 1n;
      first = network;
      last = network;
      explanation = "Préfixe /32 · une seule adresse, généralement utilisée pour identifier une interface ou une route hôte.";
    }

    return {
      network: integerToIPv4(network),
      mask: integerToIPv4(mask),
      broadcast: integerToIPv4(broadcast),
      wildcard: integerToIPv4(wildcard),
      first: integerToIPv4(first),
      last: integerToIPv4(last),
      total: numberFormat.format(total),
      usable: numberFormat.format(usable),
      explanation
    };
  }

  function renderResults(result) {
    Object.entries(output).forEach(([key, element]) => {
      if (element) element.textContent = result[key];
    });
    if (note) note.textContent = result.explanation;
  }

  function runCalculation() {
    try {
      const result = calculateSubnet(input.value);
      renderResults(result);
      error.hidden = true;
      error.textContent = "";
      input.setAttribute("aria-invalid", "false");
    } catch (reason) {
      error.textContent = reason instanceof Error ? reason.message : "Impossible d’effectuer ce calcul.";
      error.hidden = false;
      Object.values(output).forEach(element => {
        if (element) element.textContent = "—";
      });
      if (note) note.textContent = "Aucun résultat : corrigez l’adresse IPv4 ou le préfixe CIDR.";
      input.setAttribute("aria-invalid", "true");
      input.focus();
    }
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    runCalculation();
  });

  runCalculation();
})();