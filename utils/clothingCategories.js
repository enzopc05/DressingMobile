/**
 * Structure hiérarchique des catégories et sous-catégories de vêtements
 */
export const clothingCategories = {
  haut: {
    label: "Hauts",
    subCategories: {
      tshirt: "T-shirt",
      chemise: "Chemise",
      pull: "Pull",
      sweatshirt: "Sweat-shirt",
      polo: "Polo",
      debardeur: "Débardeur",
      top: "Top",
      blouse: "Blouse",
      gilet: "Gilet",
    },
  },
  bas: {
    label: "Bas",
    subCategories: {
      pantalon: "Pantalon",
      jeans: "Jeans",
      short: "Short",
      jupe: "Jupe",
      legging: "Legging",
      pantacourt: "Pantacourt",
      jogging: "Jogging",
    },
  },
  robe: {
    label: "Robes",
    subCategories: {
      robeete: "Robe d'été",
      robehiver: "Robe d'hiver",
      robechic: "Robe chic",
      robecasual: "Robe décontractée",
    },
  },
  veste: {
    label: "Vestes et manteaux",
    subCategories: {
      blazer: "Blazer",
      veste: "Veste légère",
      manteau: "Manteau",
      doudoune: "Doudoune",
      impermeable: "Imperméable",
      parka: "Parka",
      cardigan: "Cardigan",
    },
  },
  chaussures: {
    label: "Chaussures",
    subCategories: {
      baskets: "Baskets",
      bottes: "Bottes",
      bottines: "Bottines",
      escarpins: "Escarpins",
      sandales: "Sandales",
      mocassins: "Mocassins",
      ballerines: "Ballerines",
    },
  },
  accessoire: {
    label: "Accessoires",
    subCategories: {
      ceinture: "Ceinture",
      echarpe: "Écharpe/Foulard",
      chapeau: "Chapeau",
      bijou: "Bijou",
      sac: "Sac",
      lunettes: "Lunettes",
      gants: "Gants",
    },
  },
  autre: {
    label: "Autres",
    subCategories: {
      pyjama: "Pyjama",
      maillotdebain: "Maillot de bain",
      sousvêtement: "Sous-vêtement",
      sport: "Vêtement de sport",
      deguisement: "Déguisement",
    },
  },
};

/**
 * Récupère toutes les catégories principales
 * @returns {Object} - Catégories principales avec leurs labels
 */
export const getMainCategories = () => {
  const categories = {};
  Object.keys(clothingCategories).forEach((key) => {
    categories[key] = clothingCategories[key].label;
  });
  return categories;
};

/**
 * Récupère les sous-catégories d'une catégorie principale
 * @param {string} mainCategory - Clé de la catégorie principale
 * @returns {Object} - Sous-catégories ou objet vide si la catégorie n'existe pas
 */
export const getSubCategories = (mainCategory) => {
  if (clothingCategories[mainCategory]) {
    return clothingCategories[mainCategory].subCategories;
  }
  return {};
};

/**
 * Récupère le libellé d'une sous-catégorie
 * @param {string} mainCategory - Clé de la catégorie principale
 * @param {string} subCategory - Clé de la sous-catégorie
 * @returns {string} - Libellé de la sous-catégorie ou chaîne vide
 */
export const getSubCategoryLabel = (mainCategory, subCategory) => {
  if (
    clothingCategories[mainCategory] &&
    clothingCategories[mainCategory].subCategories[subCategory]
  ) {
    return clothingCategories[mainCategory].subCategories[subCategory];
  }
  return "";
};

/**
 * Récupère le libellé complet (catégorie + sous-catégorie)
 * @param {string} mainCategory - Clé de la catégorie principale
 * @param {string} subCategory - Clé de la sous-catégorie
 * @returns {string} - Libellé complet
 */
export const getFullCategoryLabel = (mainCategory, subCategory) => {
  const mainLabel = clothingCategories[mainCategory]
    ? clothingCategories[mainCategory].label
    : "";
  const subLabel = getSubCategoryLabel(mainCategory, subCategory);

  if (mainLabel && subLabel) {
    return `${mainLabel} > ${subLabel}`;
  } else if (mainLabel) {
    return mainLabel;
  }
  return "";
};
