/**
 * Utilitaires pour la théorie des couleurs et les combinaisons harmonieuses
 */

// Mapping des noms de couleurs en français vers des codes hexadécimaux approximatifs
export const colorMap = {
  rouge: "#FF0000",
  bleu: "#0000FF",
  jaune: "#FFFF00",
  vert: "#00FF00",
  orange: "#FFA500",
  violet: "#800080",
  rose: "#FF69B4",
  turquoise: "#40E0D0",
  marron: "#A52A2A",
  noir: "#000000",
  gris: "#808080",
  blanc: "#FFFFFF",
  beige: "#F5F5DC",
  bordeaux: "#800020",
  marine: "#000080",
  bleuClair: "#ADD8E6",
  vertFoncé: "#006400",
  corail: "#FF7F50",
  lavande: "#E6E6FA",
  olive: "#808000",
  moutarde: "#FFDB58",
  ocre: "#CC7722",
  taupe: "#483C32",
  crème: "#FFFDD0",
  kaki: "#C3B091",
  argenté: "#C0C0C0",
  doré: "#FFD700",
};

// Groupes de couleurs neutres qui se combinent bien avec d'autres couleurs
export const neutralColors = [
  "noir",
  "blanc",
  "gris",
  "beige",
  "crème",
  "taupe",
  "marine",
  "kaki",
];

// Couleurs complémentaires (opposées sur la roue chromatique)
export const complementaryPairs = {
  rouge: ["vert", "vertFoncé"],
  bleu: ["orange", "corail"],
  jaune: ["violet", "lavande"],
  vert: ["rouge", "bordeaux"],
  orange: ["bleu", "marine", "bleuClair"],
  violet: ["jaune", "moutarde"],
  rose: ["vertFoncé", "olive"],
  turquoise: ["corail", "bordeaux"],
};

// Couleurs analogues (adjacentes sur la roue chromatique)
export const analogousCombinations = {
  rouge: ["orange", "violet", "rose", "bordeaux"],
  orange: ["rouge", "jaune", "ocre", "corail"],
  jaune: ["orange", "vert", "moutarde", "ocre"],
  vert: ["jaune", "turquoise", "bleuClair", "olive"],
  turquoise: ["vert", "bleu", "bleuClair"],
  bleu: ["turquoise", "violet", "marine", "bleuClair"],
  violet: ["bleu", "rose", "lavande"],
  rose: ["violet", "rouge", "corail"],
};

// Triades (3 couleurs équidistantes sur la roue chromatique)
export const triadicCombinations = {
  rouge: ["bleu", "jaune"],
  orange: ["violet", "vert"],
  jaune: ["violet", "turquoise"],
  vert: ["violet", "orange"],
  turquoise: ["rouge", "jaune"],
  bleu: ["rouge", "jaune"],
  violet: ["orange", "vert"],
};

/**
 * Suggère des combinaisons de couleurs harmonieuses basées sur une couleur principale
 * @param {string} mainColor - Couleur principale en français
 * @returns {Object} - Suggestions de combinaisons organisées par type
 */
export const suggestColorCombinations = (mainColor) => {
  const mainColorLower = mainColor.toLowerCase();
  let normalizedColor = "";

  // Trouver la couleur la plus proche dans notre mapping
  for (const [key, value] of Object.entries(colorMap)) {
    if (
      key.toLowerCase() === mainColorLower ||
      key.toLowerCase().includes(mainColorLower)
    ) {
      normalizedColor = key;
      break;
    }
  }

  // Si la couleur n'est pas reconnue, renvoyer un message
  if (!normalizedColor) {
    return {
      message: `La couleur "${mainColor}" n'est pas reconnue dans notre système.`,
      suggestions: {},
    };
  }

  // Construire des suggestions basées sur différentes harmonies
  const suggestions = {
    complementaires: complementaryPairs[normalizedColor] || [],
    analogues: analogousCombinations[normalizedColor] || [],
    triades: triadicCombinations[normalizedColor] || [],
    neutres: neutralColors,
    message: `Voici des suggestions de couleurs qui se combinent bien avec ${mainColor}:`,
  };

  return suggestions;
};

/**
 * Vérifie l'harmonie entre deux couleurs
 * @param {string} color1 - Première couleur en français
 * @param {string} color2 - Deuxième couleur en français
 * @returns {Object} - Résultat d'harmonie et explication
 */
export const checkColorHarmony = (color1, color2) => {
  const color1Lower = color1.toLowerCase();
  const color2Lower = color2.toLowerCase();

  let normalizedColor1 = "";
  let normalizedColor2 = "";

  // Normaliser les couleurs
  for (const [key, value] of Object.entries(colorMap)) {
    if (
      key.toLowerCase() === color1Lower ||
      key.toLowerCase().includes(color1Lower)
    ) {
      normalizedColor1 = key;
    }
    if (
      key.toLowerCase() === color2Lower ||
      key.toLowerCase().includes(color2Lower)
    ) {
      normalizedColor2 = key;
    }
  }

  // Si les couleurs ne sont pas reconnues
  if (!normalizedColor1 || !normalizedColor2) {
    return {
      harmony: false,
      level: "unknown",
      explanation:
        "Une ou plusieurs couleurs ne sont pas reconnues dans notre système.",
    };
  }

  // Vérifier si l'une des couleurs est neutre
  const isNeutral1 = neutralColors.includes(normalizedColor1);
  const isNeutral2 = neutralColors.includes(normalizedColor2);

  if (isNeutral1 || isNeutral2) {
    return {
      harmony: true,
      level: "good",
      explanation: `Les couleurs ${color1} et ${color2} fonctionnent bien ensemble car ${
        isNeutral1 ? color1 : color2
      } est une couleur neutre qui s'associe facilement.`,
    };
  }

  // Vérifier si les couleurs sont complémentaires
  if (
    complementaryPairs[normalizedColor1]?.includes(normalizedColor2) ||
    complementaryPairs[normalizedColor2]?.includes(normalizedColor1)
  ) {
    return {
      harmony: true,
      level: "excellent",
      explanation: `Les couleurs ${color1} et ${color2} sont complémentaires, ce qui crée un contraste dynamique et équilibré.`,
    };
  }

  // Vérifier si les couleurs sont analogues
  if (
    analogousCombinations[normalizedColor1]?.includes(normalizedColor2) ||
    analogousCombinations[normalizedColor2]?.includes(normalizedColor1)
  ) {
    return {
      harmony: true,
      level: "excellent",
      explanation: `Les couleurs ${color1} et ${color2} sont analogues, créant une combinaison harmonieuse et cohérente.`,
    };
  }

  // Vérifier si les couleurs font partie d'une triade
  if (
    triadicCombinations[normalizedColor1]?.includes(normalizedColor2) ||
    triadicCombinations[normalizedColor2]?.includes(normalizedColor1)
  ) {
    return {
      harmony: true,
      level: "good",
      explanation: `Les couleurs ${color1} et ${color2} font partie d'une combinaison triadique qui peut être équilibrée et vibrante.`,
    };
  }

  // Par défaut, les couleurs ne sont pas particulièrement harmonieuses
  return {
    harmony: false,
    level: "challenging",
    explanation: `La combinaison de ${color1} et ${color2} peut être difficile à harmoniser. Essayez d'ajouter une couleur neutre pour équilibrer l'ensemble.`,
  };
};
