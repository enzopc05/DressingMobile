import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  logout,
  getCurrentUser,
  updateUserProfile,
} from "../utils/authService";

function UserScreen({ setIsLoggedIn, setCurrentUser, currentUser }) {
  const [user, setUser] = useState(currentUser);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  // Charger les données utilisateur
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = await getCurrentUser();
        if (userData) {
          setUser(userData);
          setEditForm({
            name: userData.name || "",
            email: userData.email || "",
            username: userData.username || "",
            password: "",
            confirmPassword: "",
          });
        }
      } catch (error) {
        console.error("Erreur de chargement des données utilisateur:", error);
      }
    };

    if (!user) {
      loadUserData();
    } else {
      setEditForm({
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [user]);

  // Gérer la déconnexion
  const handleLogout = async () => {
    Alert.alert(
      "Déconnexion",
      "Êtes-vous sûr de vouloir vous déconnecter ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Déconnecter",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const success = await logout();
              if (success) {
                setCurrentUser(null);
                setIsLoggedIn(false);
              } else {
                Alert.alert("Erreur", "Impossible de se déconnecter");
              }
            } catch (error) {
              console.error("Erreur de déconnexion:", error);
              Alert.alert("Erreur", "Une erreur est survenue lors de la déconnexion");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Gérer la sauvegarde du profil
  const handleSaveProfile = async () => {
    if (!editForm.name.trim() || !editForm.email.trim() || !editForm.username.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (editForm.password && editForm.password !== editForm.confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }

    if (editForm.password && editForm.password.length < 6) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);
    try {
      const updateData = {
        name: editForm.name,
        email: editForm.email,
        username: editForm.username,
      };

      // N'inclure le mot de passe que s'il a été modifié
      if (editForm.password) {
        updateData.password = editForm.password;
      }

      const result = await updateUserProfile(user.id, updateData);
      
      if (result.success) {
        setUser(result.user);
        setCurrentUser(result.user);
        setIsEditing(false);
        setEditForm({
          ...editForm,
          password: "",
          confirmPassword: "",
        });
        Alert.alert("Succès", "Profil mis à jour avec succès");
      } else {
        Alert.alert("Erreur", result.message);
      }
    } catch (error) {
      console.error("Erreur de mise à jour du profil:", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  // Annuler l'édition
  const handleCancelEdit = () => {
    setEditForm({
      name: user.name || "",
      email: user.email || "",
      username: user.username || "",
      password: "",
      confirmPassword: "",
    });
    setIsEditing(false);
  };

  if (loading && !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={80} color="#e74c3c" />
        <Text style={styles.errorText}>Erreur de chargement du profil</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: user.color || "#3498db" }]}>
          <Text style={styles.avatarText}>
            {user.name ? user.name.charAt(0).toUpperCase() : "?"}
          </Text>
        </View>
        
        {!isEditing ? (
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userUsername}>@{user.username}</Text>
            {user.isAdmin && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminText}>Administrateur</Text>
              </View>
            )}
          </View>
        ) : null}
      </View>

      {isEditing ? (
        <View style={styles.editForm}>
          <Text style={styles.sectionTitle}>Modifier le profil</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom complet *</Text>
            <TextInput
              style={styles.input}
              value={editForm.name}
              onChangeText={(text) => setEditForm({...editForm, name: text})}
              placeholder="Votre nom complet"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={editForm.email}
              onChangeText={(text) => setEditForm({...editForm, email: text})}
              placeholder="votre@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom d'utilisateur *</Text>
            <TextInput
              style={styles.input}
              value={editForm.username}
              onChangeText={(text) => setEditForm({...editForm, username: text})}
              placeholder="nom_utilisateur"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nouveau mot de passe (optionnel)</Text>
            <TextInput
              style={styles.input}
              value={editForm.password}
              onChangeText={(text) => setEditForm({...editForm, password: text})}
              placeholder="Laisser vide pour conserver l'actuel"
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {editForm.password ? (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmer le nouveau mot de passe</Text>
              <TextInput
                style={styles.input}
                value={editForm.confirmPassword}
                onChangeText={(text) => setEditForm({...editForm, confirmPassword: text})}
                placeholder="Confirmer le mot de passe"
                secureTextEntry
                autoCapitalize="none"
              />
            </View>
          ) : null}

          <View style={styles.editActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelEdit}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveProfile}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Sauvegarder</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.profileActions}>
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => setIsEditing(true)}
          >
            <Ionicons name="create-outline" size={24} color="white" />
            <Text style={styles.editProfileText}>Modifier le profil</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.accountInfo}>
        <Text style={styles.sectionTitle}>Informations du compte</Text>
        
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={20} color="#7f8c8d" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Statut</Text>
            <Text style={styles.infoValue}>
              {user.isAdmin ? "Administrateur" : "Utilisateur"}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={20} color="#7f8c8d" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Membre depuis</Text>
            <Text style={styles.infoValue}>
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Date inconnue"}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={20} color="#7f8c8d" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Dernière modification</Text>
            <Text style={styles.infoValue}>
              {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "Jamais"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.dangerZone}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loading}
        >
          <Ionicons name="log-out-outline" size={24} color="white" />
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#e74c3c",
    textAlign: "center",
    marginTop: 20,
  },
  header: {
    backgroundColor: "white",
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
  },
  userInfo: {
    alignItems: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 3,
  },
  userUsername: {
    fontSize: 14,
    color: "#95a5a6",
    marginBottom: 10,
  },
  adminBadge: {
    backgroundColor: "#8e44ad",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  adminText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  editForm: {
    backgroundColor: "white",
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#34495e",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  editActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#95a5a6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 10,
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#3498db",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 10,
  },
  saveButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  profileActions: {
    margin: 15,
  },
  editProfileButton: {
    backgroundColor: "#3498db",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
  },
  editProfileText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
  accountInfo: {
    backgroundColor: "white",
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  infoContent: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: "#2c3e50",
    fontWeight: "500",
  },
  dangerZone: {
    margin: 15,
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
  },
  logoutText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 10,
  },
});

export default UserScreen;