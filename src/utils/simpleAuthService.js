/**
 * Service d'authentification simplifié pour une utilisation entre amis
 */

// Liste prédéfinie des utilisateurs autorisés
let AUTHORIZED_USERS = [
  { id: "user1", name: "Moi", color: "#3498db", isAdmin: false },
  { id: "user2", name: "Ami 1", color: "#e74c3c", isAdmin: false },
  { id: "user3", name: "Ami 2", color: "#2ecc71", isAdmin: false },
  { id: "user4", name: "Ami 3", color: "#f39c12", isAdmin: false },
  { id: "enzo", name: "Enzo", color: "#8e44ad", isAdmin: true }, // Compte admin
];

// Initialiser le stockage local s'il n'existe pas encore
if (!localStorage.getItem("usersList")) {
  localStorage.setItem("usersList", JSON.stringify(AUTHORIZED_USERS));
} else {
  // Charger la liste depuis le stockage local
  AUTHORIZED_USERS = JSON.parse(localStorage.getItem("usersList"));
}

// Récupérer l'utilisateur actuel du stockage local
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

/**
 * Obtient la liste des utilisateurs autorisés
 * @returns {Array} - Liste des utilisateurs
 */
export const getAuthorizedUsers = () => {
  return JSON.parse(localStorage.getItem("usersList")) || AUTHORIZED_USERS;
};

/**
 * Connecte un utilisateur par son ID
 * @param {string} userId - ID de l'utilisateur
 * @returns {Object} - Informations de l'utilisateur
 */
export const loginUser = (userId) => {
  const users = getAuthorizedUsers();
  const user = users.find((u) => u.id === userId);

  if (!user) {
    throw new Error("Utilisateur non autorisé");
  }

  localStorage.setItem("currentUser", JSON.stringify(user));
  currentUser = user;

  return user;
};

/**
 * Déconnecte l'utilisateur actuel
 */
export const logoutUser = () => {
  localStorage.removeItem("currentUser");
  currentUser = null;
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

/**
 * Ajoute un nouvel utilisateur
 * @param {Object} userData - Données de l'utilisateur à ajouter
 * @returns {Object} - L'utilisateur ajouté
 */
export const addUser = (userData) => {
  // Vérifier si l'utilisateur actuel est administrateur
  if (!isCurrentUserAdmin()) {
    throw new Error("Opération non autorisée: droits d'administrateur requis");
  }

  const users = getAuthorizedUsers();

  // Vérifier si l'ID existe déjà
  if (users.some((user) => user.id === userData.id)) {
    throw new Error("Cet identifiant est déjà utilisé");
  }

  // Ajouter le nouvel utilisateur
  const newUser = {
    ...userData,
    isAdmin: userData.isAdmin || false, // Par défaut, les nouveaux utilisateurs ne sont pas admin
  };

  const updatedUsers = [...users, newUser];
  localStorage.setItem("usersList", JSON.stringify(updatedUsers));

  return newUser;
};

/**
 * Met à jour un utilisateur existant
 * @param {Object} userData - Données de l'utilisateur à mettre à jour
 * @returns {Object} - L'utilisateur mis à jour
 */
export const updateUser = (userData) => {
  // Vérifier si l'utilisateur actuel est administrateur
  if (!isCurrentUserAdmin()) {
    throw new Error("Opération non autorisée: droits d'administrateur requis");
  }

  const users = getAuthorizedUsers();
  const index = users.findIndex((user) => user.id === userData.id);

  if (index === -1) {
    throw new Error("Utilisateur non trouvé");
  }

  // Mettre à jour l'utilisateur
  users[index] = {
    ...users[index],
    ...userData,
  };

  localStorage.setItem("usersList", JSON.stringify(users));

  // Si l'utilisateur mis à jour est l'utilisateur actuel, mettre à jour également l'utilisateur actuel
  if (currentUser && currentUser.id === userData.id) {
    currentUser = users[index];
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
  }

  return users[index];
};

/**
 * Supprime un utilisateur
 * @param {string} userId - ID de l'utilisateur à supprimer
 * @returns {boolean} - True si la suppression a réussi
 */
export const deleteUser = (userId) => {
  // Vérifier si l'utilisateur actuel est administrateur
  if (!isCurrentUserAdmin()) {
    throw new Error("Opération non autorisée: droits d'administrateur requis");
  }

  // Ne pas permettre la suppression de son propre compte
  if (currentUser && currentUser.id === userId) {
    throw new Error("Vous ne pouvez pas supprimer votre propre compte");
  }

  const users = getAuthorizedUsers();
  const updatedUsers = users.filter((user) => user.id !== userId);

  if (updatedUsers.length === users.length) {
    // Aucun utilisateur n'a été supprimé
    return false;
  }

  localStorage.setItem("usersList", JSON.stringify(updatedUsers));
  return true;
};

/**
 * Importe une liste d'utilisateurs (admin uniquement)
 * @param {Array} users - Liste des utilisateurs à importer
 * @returns {boolean} - Succès de l'opération
 */
export const importUsers = (users) => {
  // Vérifier si l'utilisateur actuel est administrateur
  if (!isCurrentUserAdmin()) {
    throw new Error("Opération non autorisée: droits d'administrateur requis");
  }

  try {
    // Vérifier que la liste contient au moins un administrateur
    const hasAdmin = users.some((user) => user.isAdmin === true);
    if (!hasAdmin) {
      throw new Error("La liste doit contenir au moins un administrateur");
    }

    // Enregistrer la liste des utilisateurs
    localStorage.setItem("usersList", JSON.stringify(users));

    // Vérifier que l'utilisateur actuel existe toujours dans la liste
    const currentUserId = getCurrentUserId();
    const userExists = users.some((user) => user.id === currentUserId);

    if (!userExists) {
      // Si l'utilisateur actuel n'existe plus, connecter avec le premier admin trouvé
      const firstAdmin = users.find((user) => user.isAdmin === true);
      if (firstAdmin) {
        localStorage.setItem("currentUser", JSON.stringify(firstAdmin));
        currentUser = firstAdmin;
      } else {
        throw new Error(
          "L'utilisateur actuel a été supprimé et aucun administrateur n'a été trouvé"
        );
      }
    }

    // Mettre à jour la référence aux utilisateurs autorisés
    AUTHORIZED_USERS = users;

    return true;
  } catch (error) {
    console.error("Erreur lors de l'importation des utilisateurs:", error);

    // Restaurer la liste précédente en cas d'erreur
    localStorage.setItem("usersList", JSON.stringify(AUTHORIZED_USERS));

    throw error;
  }
};

/**
 * Exporte la liste des utilisateurs (admin uniquement)
 * @returns {Array} - Liste des utilisateurs
 */
export const exportUsers = () => {
  // Vérifier si l'utilisateur actuel est administrateur
  if (!isCurrentUserAdmin()) {
    throw new Error("Opération non autorisée: droits d'administrateur requis");
  }

  return getAuthorizedUsers();
};
