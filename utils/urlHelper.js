/**
 * Tente de déterminer si une URL est probablement une URL de produit ou une URL d'image directe
 * @param {string} url - L'URL à vérifier
 * @returns {boolean} - True si c'est probablement une URL d'image, false sinon
 */
export const isImageUrl = (url) => {
  if (!url) return false;

  // Vérifier si l'URL se termine par une extension d'image courante
  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".svg",
    ".bmp",
  ];
  const lowerUrl = url.toLowerCase();

  if (imageExtensions.some((ext) => lowerUrl.endsWith(ext))) {
    return true;
  }

  // Vérifier si l'URL contient des indicateurs typiques d'une URL d'image
  const imageIndicators = [
    "/images/",
    "/img/",
    "/photos/",
    "/thumbnails/",
    "/assets/images",
    "/products/images",
    "/cdn/",
    "/uploads/",
    "image.php",
    "picture.php",
    "media/",
  ];

  return imageIndicators.some((indicator) =>
    lowerUrl.includes(indicator.toLowerCase())
  );
};

/**
 * Donne des suggestions de sites marchands connus et comment extraire les URLs d'images
 * @returns {Array} - Un tableau d'objets contenant des informations sur chaque site marchand
 */
export const getShoppingWebsiteTips = () => {
  return [
    {
      name: "Amazon",
      tip: "Cherchez des URL contenant 'images-amazon' ou 'images-na.ssl-images-amazon'",
    },
    {
      name: "Zalando",
      tip: "Cherchez des URL contenant 'img01.ztat.net'",
    },
    {
      name: "ASOS",
      tip: "Cherchez des URL contenant 'images.asos-media.com'",
    },
    {
      name: "Shopify (comme Amoses)",
      tip: "Cherchez des URL contenant 'cdn.shopify.com'",
    },
    {
      name: "H&M",
      tip: "Cherchez des URL contenant 'lp2.hm.com/hmgoepprod'",
    },
  ];
};
