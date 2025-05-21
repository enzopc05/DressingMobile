import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  getAuthorizedUsers,
  loginUser,
  logoutUser,
  getCurrentUser,
  initAuth,
} from "../utils/simpleAuthService";
import { Ionicons } from "@expo/vector-icons";

function UserScreen({ navigation, route, setIsLoggedIn, setIsAdmin }) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger les utilisateurs et l'utilisateur actuel
  useEffect(() => {
    const loadUsersData = async () => {
      try {
        await initAuth();
        const usersList = await getAuthorizedUsers();
        setUsers(usersList);

        const user = getCurrentUser();
        setCurrentUser(user);

        if (user) {
          // Si l'utilisateur est déjà connecté, mettre à jour l'état global
          if (setIsLoggedIn) setIsLoggedIn(true);
          if (setIsAdmin) setIsAdmin(user.isAdmin || false);
        }
      } catch (error) {
        console.error("Erreur de chargement des utilisateurs:", error);
        Alert.alert("Erreur", "Impossible de charger les utilisateurs");
      } finally {
        setLoading(false);
      }
    };

    loadUsersData();
  }, []);

  // Gérer la sélection d'un utilisateur
  const handleUserSelection = async (userId) => {
    setLoading(true);
    try {
      const user = await loginUser(userId);
      setCurrentUser(user);

      // Mettre à jour l'état global
      if (setIsLoggedIn) setIsLoggedIn(true);
      if (setIsAdmin) setIsAdmin(user.isAdmin || false);

      // Si nous sommes dans un contexte de navigation (pas dans l'écran initial)
      if (navigation) {
        navigation.reset({
          index: 0,
          routes: [{ name: "Vêtements" }],
        });
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      Alert.alert("Erreur", "Échec de la connexion");
    } finally {
      setLoading(false);
    }
  };

  // Gérer la déconnexion
  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setCurrentUser(null);

      // Mettre à jour l'état global
      if (setIsLoggedIn) setIsLoggedIn(false);
      if (setIsAdmin) setIsAdmin(false);

      // Si nous sommes dans un contexte de navigation
      if (navigation) {
        // Retourner à l'écran précédent ou rester sur l'écran actuel
        // mais avec l'état déconnecté
      }
    } catch (error) {
      console.error("Erreur de déconnexion:", error);
      Alert.alert("Erreur", "Échec de la déconnexion");
    } finally {
      setLoading(false);
    }
  };

  // Rendu de l'élément utilisateur
  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => handleUserSelection(item.id)}
    >
      <View style={[styles.userAvatar, { backgroundColor: item.color }]}>
        <Text style={styles.userInitial}>{item.name.charAt(0)}</Text>
      </View>
      <Text style={styles.userName}>{item.name}</Text>
      {item.isAdmin && (
        <View style={styles.adminBadge}>
          <Text style={styles.adminText}>Admin</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  // Si l'utilisateur est connecté
  if (currentUser) {
    return (
      <View style={styles.container}>
        <View style={styles.profileSection}>
          <View
            style={[
              styles.profileAvatar,
              { backgroundColor: currentUser.color },
            ]}
          >
            <Text style={styles.profileInitial}>
              {currentUser.name.charAt(0)}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{currentUser.name}</Text>
            {currentUser.isAdmin && (
              <View style={styles.profileAdminBadge}>
                <Text style={styles.profileAdminText}>Administrateur</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="white" />
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>

        {/* Ajouter d'autres options si nécessaire */}
      </View>
    );
  }

  // Si l'utilisateur n'est pas connecté
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue dans votre Dressing Virtuel</Text>
      <Text style={styles.subtitle}>
        Choisissez un utilisateur pour commencer
      </Text>

      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        style={styles.userList}
        numColumns={2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#3498db",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#2c3e50",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#7f8c8d",
  },
  userList: {
    flex: 1,
  },
  userItem: {
    flex: 1,
    alignItems: "center",
    padding: 15,
    margin: 8,
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  userInitial: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  userName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2c3e50",
  },
  adminBadge: {
    marginTop: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: "#8e44ad",
    borderRadius: 10,
  },
  adminText: {
    fontSize: 12,
    color: "white",
    fontWeight: "bold",
  },
  // Styles pour l'utilisateur connecté
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  profileInitial: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 5,
  },
  profileAdminBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#8e44ad",
    borderRadius: 10,
  },
  profileAdminText: {
    fontSize: 14,
    color: "white",
    fontWeight: "bold",
  },
  logoutButton: {
    flexDirection: "row",
    backgroundColor: "#e74c3c",
    borderRadius: 10,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    marginLeft: 10,
  },
});

export default UserScreen;
