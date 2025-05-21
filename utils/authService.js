import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Clés de stockage
const STORAGE_KEYS = {
  USERS: "appUsers",
  CURRENT_USER: "currentUser",
};

// Fonction d'initialisation
export const initAuth = async () => {
  try {
    // Vérifier si la liste des utilisateurs existe déjà
    const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);

    if (!usersJson) {
      // Créer des utilisateurs par défaut si aucun n'existe
      const defaultUsers = [
        {
          id: "user1",
          username: "moi",
          password: "password123",
          name: "Moi",
          email: "moi@example.com",
          color: "#3498db",
          isAdmin: false
        },
        {
          id: "admin1",
          username: "admin",
          password: "admin123",
          name: "Admin",
          email: "admin@example.com",
          color: "#8e44ad",
          isAdmin: true
        },
      ];

      await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
    }

    return true;
  } catch (error) {
    console.error("Erreur d'initialisation d'authentification:", error);
    return false;
  }
};

// Obtenir tous les utilisateurs
export const getUsers = async () => {
  try {
    const usersJson = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
    return usersJson ? JSON.parse(usersJson) : [];
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return [];
  }
};

// Obtenir l'utilisateur actuel
export const getCurrentUser = async () => {
  try {
    const userJson = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur actuel:", error);
    return null;
  }
};

// Connexion par identifiant et mot de passe
export const login = async (username, password) => {
  try {
    const users = await getUsers();
    const user = users.find(u =>
      (u.username.toLowerCase() === username.toLowerCase() ||
       u.email.toLowerCase() === username.toLowerCase()) &&
       u.password === password
    );

    if (!user) {
      return { success: false, message: "Identifiant ou mot de passe incorrect" };
    }

    // Créer une version sécurisée de l'utilisateur (sans le mot de passe) pour stocker en mémoire
    const secureUser = { ...user };
    delete secureUser.password;

    await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(secureUser));
    return { success: true, user: secureUser };
  } catch (error) {
    console.error("Erreur de connexion:", error);
    return { success: false, message: "Une erreur est survenue lors de la connexion" };
  }
};

// Déconnexion
export const logout = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    return true;
  } catch (error) {
    console.error("Erreur de déconnexion:", error);
    return false;
  }
};

// Vérifier si un utilisateur est connecté
export const isLoggedIn = async () => {
  const user = await getCurrentUser();
  return !!user;
};

// Créer un nouvel utilisateur (inscription)
export const register = async (userData) => {
  try {
    // Vérifier si le nom d'utilisateur ou l'email existe déjà
    const users = await getUsers();
    const userExists = users.some(
      u => u.username.toLowerCase() === userData.username.toLowerCase() ||
           u.email.toLowerCase() === userData.email.toLowerCase()
    );

    if (userExists) {
      return {
        success: false,
        message: "Cet identifiant ou cette adresse email est déjà utilisé(e)"
      };
    }

    // Créer un nouvel ID unique
    const newId = `user_${Date.now()}`;

    // Créer le nouvel utilisateur
    const newUser = {
      id: newId,
      username: userData.username,
      password: userData.password,
      name: userData.name || userData.username,
      email: userData.email,
      color: userData.color || "#" + Math.floor(Math.random()*16777215).toString(16), // Couleur aléatoire
      isAdmin: false, // Les nouveaux utilisateurs ne sont pas admin par défaut
      createdAt: new Date().toISOString()
    };

    // Ajouter l'utilisateur à la liste
    const updatedUsers = [...users, newUser];
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updatedUsers));

    // Créer une version sécurisée (sans le mot de passe)
    const secureUser = { ...newUser };
    delete secureUser.password;

    return { success: true, user: secureUser };
  } catch (error) {
    console.error("Erreur d'inscription:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de l'inscription"
    };
  }
};

// Mettre à jour le profil d'un utilisateur
export const updateUserProfile = async (userId, userData) => {
  try {
    const users = await getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return { success: false, message: "Utilisateur non trouvé" };
    }

    // Si le nom d'utilisateur ou l'email change, vérifier qu'il n'est pas déjà pris
    if (userData.username !== users[userIndex].username || userData.email !== users[userIndex].email) {
      const userExists = users.some(
        (u, index) => index !== userIndex &&
          (u.username.toLowerCase() === userData.username.toLowerCase() ||
           u.email.toLowerCase() === userData.email.toLowerCase())
      );

      if (userExists) {
        return {
          success: false,
          message: "Cet identifiant ou cette adresse email est déjà utilisé(e)"
        };
      }
    }

    // Mettre à jour l'utilisateur
    const updatedUser = {
      ...users[userIndex],
      ...userData,
      updatedAt: new Date().toISOString()
    };

    // Si le mot de passe est vide, conserver l'ancien
    if (!updatedUser.password) {
      updatedUser.password = users[userIndex].password;
    }

    // Conserver le statut administrateur
    updatedUser.isAdmin = users[userIndex].isAdmin;

    users[userIndex] = updatedUser;
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // Si l'utilisateur mis à jour est l'utilisateur actuel, mettre également à jour l'utilisateur actuel
    const currentUser = await getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      const secureUser = { ...updatedUser };
      delete secureUser.password;
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(secureUser));
    }

    // Retourner une version sécurisée
    const secureUser = { ...updatedUser };
    delete secureUser.password;

    return { success: true, user: secureUser };
  } catch (error) {
    console.error("Erreur de mise à jour du profil:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de la mise à jour du profil"
    };
  }
};