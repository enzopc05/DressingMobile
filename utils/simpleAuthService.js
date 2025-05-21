import AsyncStorage from "@react-native-async-storage/async-storage";

// Liste prédéfinie des utilisateurs autorisés
let AUTHORIZED_USERS = [
  { id: "user1", name: "Moi", color: "#3498db", isAdmin: false },
  { id: "user2", name: "Ami 1", color: "#e74c3c", isAdmin: false },
  { id: "user3", name: "Ami 2", color: "#2ecc71", isAdmin: false },
  { id: "user4", name: "Ami 3", color: "#f39c12", isAdmin: false },
  { id: "enzo", name: "Enzo", color: "#8e44ad", isAdmin: true }, // Compte admin
];

// Variable pour stocker l'utilisateur actuel
let currentUser = null;

// Initialiser le stockage AsyncStorage
export const initAuth = async () => {
  try {
    // Vérifier si la liste des utilisateurs existe déjà
    const usersList = await AsyncStorage.getItem("usersList");
    if (!usersList) {
      await AsyncStorage.setItem("usersList", JSON.stringify(AUTHORIZED_USERS));
    } else {
      AUTHORIZED_USERS = JSON.parse(usersList);
    }

    // Charger l'utilisateur actuel
    const user = await AsyncStorage.getItem("currentUser");
    currentUser = user ? JSON.parse(user) : null;

    return true;
  } catch (error) {
    console.error("Erreur d'initialisation de l'authentification:", error);
    return false;
  }
};

/**
 * Obtient la liste des utilisateurs autorisés
 * @returns {Promise<Array>} - Liste des utilisateurs
 */
export const getAuthorizedUsers = async () => {
  try {
    const users = await AsyncStorage.getItem("usersList");
    return users ? JSON.parse(users) : AUTHORIZED_USERS;
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return AUTHORIZED_USERS;
  }
};

/**
 * Connecte un utilisateur par son ID
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>} - Informations de l'utilisateur
 */
export const loginUser = async (userId) => {
  try {
    const users = await getAuthorizedUsers();
    const user = users.find((u) => u.id === userId);

    if (!user) {
      throw new Error("Utilisateur non autorisé");
    }

    await AsyncStorage.setItem("currentUser", JSON.stringify(user));
    currentUser = user;

    return user;
  } catch (error) {
    console.error("Erreur de connexion:", error);
    throw error;
  }
};

/**
 * Déconnecte l'utilisateur actuel
 * @returns {Promise<boolean>} - Succès de la déconnexion
 */
export const logoutUser = async () => {
  try {
    await AsyncStorage.removeItem("currentUser");
    currentUser = null;
    return true;
  } catch (error) {
    console.error("Erreur de déconnexion:", error);
    return false;
  }
};

/**
 * Vérifie si un utilisateur est connecté
 * @returns {boolean} - True si un utilisateur est connecté
 */
export const isLoggedIn = () => {
  return !!currentUser;
};

/**
 * Obtient l'utilisateur actuellement connecté
 * @returns {Object|null} - Utilisateur connecté ou null
 */
export const getCurrentUser = () => {
  return currentUser;
};

/**
 * Obtient l'ID de l'utilisateur actuel
 * @returns {string|null} - ID de l'utilisateur ou null
 */
export const getCurrentUserId = () => {
  return currentUser ? currentUser.id : null;
};

/**
 * Vérifie si l'utilisateur actuel est administrateur
 * @returns {boolean} - True si l'utilisateur est administrateur
 */
export const isCurrentUserAdmin = () => {
  return currentUser ? currentUser.isAdmin : false;
};

// Ajoutez les autres fonctions d'authentification selon vos besoins
