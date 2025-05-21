import AsyncStorage from "@react-native-async-storage/async-storage";

// Clés de stockage
const STORAGE_KEYS = {
  CLOTHES: "wardrobeClothes",
  OUTFITS: "savedOutfits",
  USER_PREFS: "userPreferences",
  PENDING_ORDERS: "pendingOrders",
};

// Identifiant temporaire de l'utilisateur (sera remplacé par un système d'authentification)
const TEMP_USER_ID = "default-user";

/**
 * Récupère les vêtements de l'utilisateur
 * @param {string} userId - Identifiant de l'utilisateur (facultatif)
 * @returns {Promise<Array>} - Tableau des vêtements
 */
export const getClothes = async (userId = TEMP_USER_ID) => {
  try {
    const storedData = await AsyncStorage.getItem(
      `${STORAGE_KEYS.CLOTHES}_${userId}`
    );
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error("Erreur lors de la récupération des vêtements:", error);
    return [];
  }
};

/**
 * Sauvegarde les vêtements de l'utilisateur
 * @param {Array} clothes - Tableau des vêtements
 * @param {string} userId - Identifiant de l'utilisateur (facultatif)
 * @returns {Promise<boolean>} - Succès de la sauvegarde
 */
export const saveClothes = async (clothes, userId = TEMP_USER_ID) => {
  try {
    await AsyncStorage.setItem(
      `${STORAGE_KEYS.CLOTHES}_${userId}`,
      JSON.stringify(clothes)
    );
    return true;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des vêtements:", error);
    return false;
  }
};

/**
 * Récupère les tenues de l'utilisateur
 * @param {string} userId - Identifiant de l'utilisateur (facultatif)
 * @returns {Promise<Array>} - Tableau des tenues
 */
export const getOutfits = async (userId = TEMP_USER_ID) => {
  try {
    const storedData = await AsyncStorage.getItem(
      `${STORAGE_KEYS.OUTFITS}_${userId}`
    );
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error("Erreur lors de la récupération des tenues:", error);
    return [];
  }
};

/**
 * Sauvegarde les tenues de l'utilisateur
 * @param {Array} outfits - Tableau des tenues
 * @param {string} userId - Identifiant de l'utilisateur (facultatif)
 * @returns {Promise<boolean>} - Succès de la sauvegarde
 */
export const saveOutfits = async (outfits, userId = TEMP_USER_ID) => {
  try {
    await AsyncStorage.setItem(
      `${STORAGE_KEYS.OUTFITS}_${userId}`,
      JSON.stringify(outfits)
    );
    return true;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des tenues:", error);
    return false;
  }
};

/**
 * Récupère les commandes en attente de l'utilisateur
 * @param {string} userId - Identifiant de l'utilisateur (facultatif)
 * @returns {Promise<Array>} - Tableau des commandes
 */
export const getPendingOrders = async (userId = TEMP_USER_ID) => {
  try {
    const storedData = await AsyncStorage.getItem(
      `${STORAGE_KEYS.PENDING_ORDERS}_${userId}`
    );
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error("Erreur lors de la récupération des commandes:", error);
    return [];
  }
};

/**
 * Sauvegarde les commandes en attente de l'utilisateur
 * @param {Array} orders - Tableau des commandes
 * @param {string} userId - Identifiant de l'utilisateur (facultatif)
 * @returns {Promise<boolean>} - Succès de la sauvegarde
 */
export const savePendingOrders = async (orders, userId = TEMP_USER_ID) => {
  try {
    await AsyncStorage.setItem(
      `${STORAGE_KEYS.PENDING_ORDERS}_${userId}`,
      JSON.stringify(orders)
    );
    return true;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des commandes:", error);
    return false;
  }
};

/**
 * Ajoute un nouveau vêtement
 * @param {Object} clothing - Objet vêtement à ajouter
 * @param {string} userId - Identifiant de l'utilisateur (facultatif)
 * @returns {Promise<string>} - Identifiant du vêtement ajouté
 */
export const addClothing = async (clothing, userId = TEMP_USER_ID) => {
  try {
    const clothes = await getClothes(userId);
    const newId = Date.now().toString();

    const newClothing = {
      ...clothing,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    clothes.push(newClothing);
    await saveClothes(clothes, userId);

    return newId;
  } catch (error) {
    console.error("Erreur lors de l'ajout du vêtement:", error);
    throw error;
  }
};

/**
 * Met à jour un vêtement existant
 * @param {Object} clothing - Objet vêtement à mettre à jour
 * @param {string} userId - Identifiant de l'utilisateur (facultatif)
 * @returns {Promise<boolean>} - Succès de la mise à jour
 */
export const updateClothing = async (clothing, userId = TEMP_USER_ID) => {
  try {
    const clothes = await getClothes(userId);
    const index = clothes.findIndex((item) => item.id === clothing.id);

    if (index === -1) return false;

    const updatedClothing = {
      ...clothing,
      updatedAt: new Date().toISOString(),
    };

    clothes[index] = updatedClothing;
    await saveClothes(clothes, userId);

    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du vêtement:", error);
    return false;
  }
};

/**
 * Supprime un vêtement
 * @param {string} clothingId - Identifiant du vêtement à supprimer
 * @param {string} userId - Identifiant de l'utilisateur (facultatif)
 * @returns {Promise<boolean>} - Succès de la suppression
 */
export const deleteClothing = async (clothingId, userId = TEMP_USER_ID) => {
  try {
    const clothes = await getClothes(userId);
    const filteredClothes = clothes.filter((item) => item.id !== clothingId);

    if (filteredClothes.length === clothes.length) return false;

    await saveClothes(filteredClothes, userId);

    // Mettre à jour les tenues qui contiennent ce vêtement
    const outfits = await getOutfits(userId);
    let outfitsUpdated = false;

    const updatedOutfits = outfits.map((outfit) => {
      const filteredItems = outfit.items.filter(
        (item) => item.id !== clothingId
      );

      if (filteredItems.length !== outfit.items.length) {
        outfitsUpdated = true;
        return { ...outfit, items: filteredItems };
      }

      return outfit;
    });

    if (outfitsUpdated) {
      await saveOutfits(updatedOutfits, userId);
    }

    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression du vêtement:", error);
    return false;
  }
};

/**
 * Ajoute une nouvelle tenue
 * @param {Object} outfit - Objet tenue à ajouter
 * @param {string} userId - Identifiant de l'utilisateur (facultatif)
 * @returns {Promise<string>} - Identifiant de la tenue ajoutée
 */
export const addOutfit = async (outfit, userId = TEMP_USER_ID) => {
  try {
    const outfits = await getOutfits(userId);
    const newId = Date.now().toString();

    const newOutfit = {
      ...outfit,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    outfits.push(newOutfit);
    await saveOutfits(outfits, userId);

    return newId;
  } catch (error) {
    console.error("Erreur lors de l'ajout de la tenue:", error);
    throw error;
  }
};

/**
 * Supprime une tenue
 * @param {string} outfitId - Identifiant de la tenue à supprimer
 * @param {string} userId - Identifiant de l'utilisateur (facultatif)
 * @returns {Promise<boolean>} - Succès de la suppression
 */
export const deleteOutfit = async (outfitId, userId = TEMP_USER_ID) => {
  try {
    const outfits = await getOutfits(userId);
    const filteredOutfits = outfits.filter((outfit) => outfit.id !== outfitId);

    if (filteredOutfits.length === outfits.length) return false;

    await saveOutfits(filteredOutfits, userId);
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression de la tenue:", error);
    return false;
  }
};

// Ajoutez les autres fonctions pour gérer les commandes, etc.
