import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCurrentUser } from "./authService"; // CHANGEMENT ICI

// Clés de stockage
const STORAGE_KEYS = {
  CLOTHES: "wardrobeClothes",
  OUTFITS: "savedOutfits",
  USER_PREFS: "userPreferences",
  PENDING_ORDERS: "pendingOrders",
};

// Fonction helper pour obtenir l'ID utilisateur actuel
const getCurrentUserId = async () => {
  try {
    const user = await getCurrentUser();
    return user ? user.id : "default-user";
  } catch (error) {
    console.error("Erreur lors de la récupération de l'ID utilisateur:", error);
    return "default-user";
  }
};

/**
 * Récupère les vêtements de l'utilisateur
 * @param {string} userId - Identifiant de l'utilisateur (facultatif)
 * @returns {Promise<Array>} - Tableau des vêtements
 */
export const getClothes = async (userId = null) => {
  try {
    const finalUserId = userId || await getCurrentUserId();
    const storedData = await AsyncStorage.getItem(
      `${STORAGE_KEYS.CLOTHES}_${finalUserId}`
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
export const saveClothes = async (clothes, userId = null) => {
  try {
    const finalUserId = userId || await getCurrentUserId();
    await AsyncStorage.setItem(
      `${STORAGE_KEYS.CLOTHES}_${finalUserId}`,
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
export const getOutfits = async (userId = null) => {
  try {
    const finalUserId = userId || await getCurrentUserId();
    const storedData = await AsyncStorage.getItem(
      `${STORAGE_KEYS.OUTFITS}_${finalUserId}`
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
export const saveOutfits = async (outfits, userId = null) => {
  try {
    const finalUserId = userId || await getCurrentUserId();
    await AsyncStorage.setItem(
      `${STORAGE_KEYS.OUTFITS}_${finalUserId}`,
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
export const getPendingOrders = async (userId = null) => {
  try {
    const finalUserId = userId || await getCurrentUserId();
    const storedData = await AsyncStorage.getItem(
      `${STORAGE_KEYS.PENDING_ORDERS}_${finalUserId}`
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
export const savePendingOrders = async (orders, userId = null) => {
  try {
    const finalUserId = userId || await getCurrentUserId();
    await AsyncStorage.setItem(
      `${STORAGE_KEYS.PENDING_ORDERS}_${finalUserId}`,
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
export const addClothing = async (clothing, userId = null) => {
  try {
    const finalUserId = userId || await getCurrentUserId();
    const clothes = await getClothes(finalUserId);
    const newId = Date.now().toString();

    const newClothing = {
      ...clothing,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    clothes.push(newClothing);
    await saveClothes(clothes, finalUserId);

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
export const updateClothing = async (clothing, userId = null) => {
  try {
    const finalUserId = userId || await getCurrentUserId();
    const clothes = await getClothes(finalUserId);
    const index = clothes.findIndex((item) => item.id === clothing.id);

    if (index === -1) return false;

    const updatedClothing = {
      ...clothing,
      updatedAt: new Date().toISOString(),
    };

    clothes[index] = updatedClothing;
    await saveClothes(clothes, finalUserId);

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
export const deleteClothing = async (clothingId, userId = null) => {
  try {
    const finalUserId = userId || await getCurrentUserId();
    const clothes = await getClothes(finalUserId);
    const filteredClothes = clothes.filter((item) => item.id !== clothingId);

    if (filteredClothes.length === clothes.length) return false;

    await saveClothes(filteredClothes, finalUserId);

    // Mettre à jour les tenues qui contiennent ce vêtement
    const outfits = await getOutfits(finalUserId);
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
      await saveOutfits(updatedOutfits, finalUserId);
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
export const addOutfit = async (outfit, userId = null) => {
  try {
    const finalUserId = userId || await getCurrentUserId();
    const outfits = await getOutfits(finalUserId);
    const newId = Date.now().toString();

    const newOutfit = {
      ...outfit,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    outfits.push(newOutfit);
    await saveOutfits(outfits, finalUserId);

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
export const deleteOutfit = async (outfitId, userId = null) => {
  try {
    const finalUserId = userId || await getCurrentUserId();
    const outfits = await getOutfits(finalUserId);
    const filteredOutfits = outfits.filter((outfit) => outfit.id !== outfitId);

    if (filteredOutfits.length === outfits.length) return false;

    await saveOutfits(filteredOutfits, finalUserId);
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression de la tenue:", error);
    return false;
  }
};

/**
 * Ajoute une nouvelle commande en attente
 * @param {Object} order - Objet commande à ajouter
 * @param {string} userId - Identifiant de l'utilisateur (facultatif)
 * @returns {Promise<string>} - Identifiant de la commande ajoutée
 */
export const addPendingOrder = async (order, userId = null) => {
  try {
    const finalUserId = userId || await getCurrentUserId();
    const orders = await getPendingOrders(finalUserId);
    const newId = Date.now().toString();

    const newOrder = {
      ...order,
      id: newId,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    orders.push(newOrder);
    await savePendingOrders(orders, finalUserId);

    return newId;
  } catch (error) {
    console.error("Erreur lors de l'ajout de la commande:", error);
    throw error;
  }
};

/**
 * Met à jour une commande existante
 * @param {Object} order - Objet commande à mettre à jour
 * @param {string} userId - Identifiant de l'utilisateur (facultatif)
 * @returns {Promise<boolean>} - Succès de la mise à jour
 */
export const updatePendingOrder = async (order, userId = null) => {
  try {
    const finalUserId = userId || await getCurrentUserId();
    const orders = await getPendingOrders(finalUserId);
    const index = orders.findIndex((item) => item.id === order.id);

    if (index === -1) return false;

    const updatedOrder = {
      ...order,
      updatedAt: new Date().toISOString(),
    };

    orders[index] = updatedOrder;
    await savePendingOrders(orders, finalUserId);

    return true;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la commande:", error);
    return false;
  }
};

/**
 * Supprime une commande en attente
 * @param {string} orderId - Identifiant de la commande à supprimer
 * @param {string} userId - Identifiant de l'utilisateur (facultatif)
 * @returns {Promise<boolean>} - Succès de la suppression
 */
export const deletePendingOrder = async (orderId, userId = null) => {
  try {
    const finalUserId = userId || await getCurrentUserId();
    const orders = await getPendingOrders(finalUserId);
    const filteredOrders = orders.filter((order) => order.id !== orderId);

    if (filteredOrders.length === orders.length) return false;

    await savePendingOrders(filteredOrders, finalUserId);
    return true;
  } catch (error) {
    console.error("Erreur lors de la suppression de la commande:", error);
    return false;
  }
};

/**
 * Marque une commande comme reçue et ajoute les vêtements au dressing
 * @param {string} orderId - Identifiant de la commande
 * @param {string} userId - Identifiant de l'utilisateur (facultatif)
 * @returns {Promise<Object>} - Résultat de l'opération
 */
export const receiveOrder = async (orderId, userId = null) => {
  try {
    const finalUserId = userId || await getCurrentUserId();
    const orders = await getPendingOrders(finalUserId);
    const orderIndex = orders.findIndex((order) => order.id === orderId);

    if (orderIndex === -1) {
      return { success: false, message: "Commande non trouvée" };
    }

    const order = orders[orderIndex];
    
    if (order.status === "received") {
      return { success: false, message: "Cette commande a déjà été reçue" };
    }

    // Marquer la commande comme reçue
    orders[orderIndex] = {
      ...order,
      status: "received",
      receivedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Ajouter les articles de la commande au dressing
    const currentClothes = await getClothes(finalUserId);
    const newClothes = order.items.map((item) => ({
      ...item,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const updatedClothes = [...currentClothes, ...newClothes];

    // Sauvegarder les modifications
    await savePendingOrders(orders, finalUserId);
    await saveClothes(updatedClothes, finalUserId);

    return {
      success: true,
      message: `Commande reçue ! ${newClothes.length} vêtements ajoutés à votre dressing.`,
      addedItems: newClothes.length,
    };
  } catch (error) {
    console.error("Erreur lors de la réception de la commande:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la réception de la commande",
    };
  }
};

/**
 * Exporte toutes les données d'un utilisateur
 * @param {string} userId - Identifiant de l'utilisateur (facultatif)
 * @returns {Object} - Données de l'utilisateur
 */
export const exportUserData = async (userId = null) => {
  try {
    const finalUserId = userId || await getCurrentUserId();
    
    const clothes = await getClothes(finalUserId);
    const outfits = await getOutfits(finalUserId);
    const pendingOrders = await getPendingOrders(finalUserId);

    return {
      userId: finalUserId,
      exportDate: new Date().toISOString(),
      clothes,
      outfits,
      pendingOrders,
    };
  } catch (error) {
    console.error("Erreur lors de l'exportation des données:", error);
    throw error;
  }
};

/**
 * Importe toutes les données pour un utilisateur
 * @param {Object} data - Données à importer
 * @param {string} userId - Identifiant de l'utilisateur (facultatif)
 * @returns {Promise<boolean>} - Succès de l'importation
 */
export const importUserData = async (data, userId = null) => {
  try {
    const finalUserId = userId || await getCurrentUserId();

    if (data.clothes) {
      await saveClothes(data.clothes, finalUserId);
    }

    if (data.outfits) {
      await saveOutfits(data.outfits, finalUserId);
    }

    if (data.pendingOrders) {
      await savePendingOrders(data.pendingOrders, finalUserId);
    }

    return true;
  } catch (error) {
    console.error("Erreur lors de l'importation des données:", error);
    return false;
  }
};