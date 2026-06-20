(() => {
  const english = location.pathname === "/en" || location.pathname.startsWith("/en/");
  const pageName = ["/en", "/en/"].includes(location.pathname)
    ? "index.html"
    : (location.pathname.split("/").pop() || "index.html");
  const frenchPath = pageName === "index.html" ? "/" : `/${pageName}`;
  const englishPath = pageName === "index.html" ? "/en/" : `/en/${pageName}`;

  document.documentElement.lang = english ? "en" : "fr";

  const translations = {
    "Accueil": "Home",
    "Météo": "Weather",
    "Le mur": "Chat",
    "Résidences": "Residencies",
    "Sons": "Sounds",
    "Inventaire": "Inventory",
    "Terrains Communs · réseau autonome": "Terrains Communs · autonomous network",
    "Field notes": "Field notes",
    "Vous êtes connectés au serveur local Terrains Communs.": "You are connected to the Terrains Communs local server.",
    "Vous êtes dans le jardin": "You are in the garden",
    "Dernier message du jardin": "Latest message from the garden",
    "Le jardin écoute…": "The garden is listening…",
    "Station météo · Nevers": "Weather station · Nevers",
    "Données météo": "Weather data",
    "Voir l’historique": "View history",
    "À parcourir": "Explore",
    "Archives": "Archives",
    "messages": "messages",
    "Chat local": "Local chat",
    "Laisser un mot depuis le Wi-Fi du jardin.": "Leave a note from the garden Wi-Fi.",
    "rendez-vous": "entries",
    "Résidences artistiques et événements": "Artistic residencies and events",
    "Programmation, recherches, rencontres, images, sons et documents.": "Programme, research, encounters, images, sounds and documents.",
    "observations": "observations",
    "Faune & flore": "Fauna & flora",
    "Un inventaire attentif des présences du jardin.": "A careful inventory of life in the garden.",
    "Administration": "Administration",
    "Données météo pour Nevers": "Weather data for Nevers",
    "Mesures issues d’Open-Meteo, mises en cache ici avant le branchement des capteurs du jardin.": "Readings from Open-Meteo, cached here until the garden sensors are connected.",
    "72 dernières mesures": "Last 72 readings",
    "Historique local": "Local history",
    "Date": "Date",
    "Temp.": "Temp.",
    "Humidité": "Humidity",
    "Vent": "Wind",
    "Pression": "Pressure",
    "Soleil": "Sunlight",
    "Pluie": "Rain",
    "Paroles de passage": "Passing words",
    "Le chat local": "Local chat",
    "Un mot laissé ici ne voyage pas plus loin que le jardin.": "A note left here travels no further than the garden.",
    "Nom ou pseudo — facultatif": "Name or nickname — optional",
    "Votre message": "Your message",
    "Qu’avez-vous vu, entendu, imaginé ?": "What did you see, hear or imagine?",
    "Déposer le message": "Post message",
    "Messages récents": "Recent messages",
    "Ce qui a été laissé": "What was left here",
    "Programmation & archives": "Programme & archives",
    "Les résidences, festivals, workshops et rencontres accueillis par Terrains Communs.": "Residencies, festivals, workshops and encounters hosted by Terrains Communs.",
    "Phonothèque locale": "Local sound library",
    "Sons du jardin": "Garden sounds",
    "Vent, insectes, gestes, machines, paroles : une collection à écouter sur place.": "Wind, insects, gestures, machines and voices: a collection to listen to on site.",
    "Présences observées": "Observed life",
    "Un inventaire situé, incomplet par nature, enrichi au fil des rencontres.": "A situated inventory, incomplete by nature and enriched through encounters.",
    "Ajouter une observation": "Add an observation",
    "Tout": "All",
    "Plantes": "Plants",
    "Oiseaux": "Birds",
    "Insectes": "Insects",
    "Mammifères": "Mammals",
    "Champignons": "Fungi",
    "Autres": "Other",
    "Bibliothèque de terrain": "Field library",
    "Protocoles, plans, textes et notices utiles, disponibles sans connexion extérieure.": "Protocols, maps, texts and technical notes available without an outside connection.",
    "sans Internet, sans pistage": "without Internet, without tracking",
    "les mots restent ici": "the words stay here",
    "archive vivante": "living archive",
    "tendre l’oreille": "listen closely",
    "regarder doucement": "observe gently",
    "savoirs en partage": "shared knowledge"
    ,"Voir l’inventaire": "View inventory"
    ,"Carnet de terrain": "Field notebook"
    ,"Entrez le code partagé par Terrains Communs. Il restera mémorisé sur ce téléphone.": "Enter the code shared by Terrains Communs. It will be remembered on this phone."
    ,"Code d’accès": "Access code"
    ,"Continuer": "Continue"
    ,"Nouvelle entrée": "New entry"
    ,"Qu’avez-vous observé ?": "What did you observe?"
    ,"Choisissez une catégorie": "Choose a category"
    ,"Oiseau": "Bird"
    ,"Plante": "Plant"
    ,"Insecte": "Insect"
    ,"Mammifère": "Mammal"
    ,"Champignon": "Fungus"
    ,"Autre": "Other"
    ,"Nom observé *": "Observed name *"
    ,"Nom latin — facultatif": "Latin name — optional"
    ,"Lieu dans le jardin": "Location in the garden"
    ,"Photo — facultative": "Photo — optional"
    ,"Note — facultative": "Note — optional"
    ,"Enregistrer l’observation": "Save observation"
    ,"Changer d’utilisateur": "Change user"
  };

  if (english) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const original = node.nodeValue;
      const trimmed = original.trim();
      if (!translations[trimmed]) continue;
      node.nodeValue = original.replace(trimmed, translations[trimmed]);
    }
    document.title = document.title
      .replace("Jardin Local", "Local Garden")
      .replace("Météo du jardin", "Garden weather")
      .replace("Mur local", "Local chat")
      .replace("Résidences", "Residencies")
      .replace("Sons du jardin", "Garden sounds")
      .replace("Faune et flore", "Fauna and flora");
  }

  document.querySelectorAll('a[href^="/"]').forEach((link) => {
    const href = link.getAttribute("href");
    if (!english || href.startsWith("/api") || href.startsWith("/admin") || href.startsWith("/uploads")) return;
    if (href === "/") link.setAttribute("href", "/en/");
    else if (!href.startsWith("/en/")) link.setAttribute("href", `/en${href}`);
  });

  const header = document.querySelector(".header-inner");
  if (header) {
    const switcher = document.createElement("a");
    switcher.className = "language-link";
    switcher.href = english ? frenchPath : englishPath;
    switcher.textContent = english ? "FR" : "EN";
    switcher.setAttribute("aria-label", english ? "Version française" : "English version");
    header.insertBefore(switcher, document.querySelector(".nav-toggle"));
  }

  const footer = document.querySelector(".footer-inner");
  if (footer) {
    const online = document.createElement("span");
    online.textContent = english ? "Online field-test version" : "Version test terrain en ligne";
    footer.appendChild(online);
  }
})();
