import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { login, register } from "../utils/authService";

function LoginScreen({ setIsLoggedIn, setCurrentUser }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // États pour le formulaire de connexion
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  // États pour le formulaire d'inscription
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  });

  // Gérer la connexion
  const handleLogin = async () => {
    if (!loginForm.username.trim() || !loginForm.password.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(loginForm.username, loginForm.password);
      
      if (result.success) {
        setCurrentUser(result.user);
        setIsLoggedIn(true);
      } else {
        Alert.alert("Erreur de connexion", result.message);
      }
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      Alert.alert("Erreur", "Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  // Gérer l'inscription
  const handleRegister = async () => {
    if (!registerForm.username.trim() || !registerForm.email.trim() || 
        !registerForm.name.trim() || !registerForm.password.trim()) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }

    if (registerForm.password.length < 6) {
      Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setIsLoading(true);
    try {
      const result = await register(registerForm);
      
      if (result.success) {
        Alert.alert(
          "Inscription réussie", 
          "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
          [
            {
              text: "OK",
              onPress: () => {
                setIsLoginMode(true);
                setLoginForm({
                  username: registerForm.username,
                  password: registerForm.password,
                });
              }
            }
          ]
        );
      } else {
        Alert.alert("Erreur d'inscription", result.message);
      }
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error);
      Alert.alert("Erreur", "Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  // Connexion rapide avec compte admin pour les tests
  const handleQuickLogin = async (username, password) => {
    setIsLoading(true);
    try {
      const result = await login(username, password);
      if (result.success) {
        setCurrentUser(result.user);
        setIsLoggedIn(true);
      } else {
        Alert.alert("Erreur", "Impossible de se connecter avec ce compte");
      }
    } catch (error) {
      Alert.alert("Erreur", "Une erreur inattendue s'est produite");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Ionicons name="shirt" size={80} color="#3498db" />
          <Text style={styles.title}>Mon Dressing Virtuel</Text>
          <Text style={styles.subtitle}>
            {isLoginMode ? "Connectez-vous à votre compte" : "Créez votre compte"}
          </Text>
        </View>

        <View style={styles.formContainer}>
          {isLoginMode ? (
            // Formulaire de connexion
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nom d'utilisateur ou email</Text>
                <TextInput
                  style={styles.input}
                  value={loginForm.username}
                  onChangeText={(text) => setLoginForm({...loginForm, username: text})}
                  placeholder="Entrez votre nom d'utilisateur ou email"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mot de passe</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={loginForm.password}
                    onChangeText={(text) => setLoginForm({...loginForm, password: text})}
                    placeholder="Entrez votre mot de passe"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={24} 
                      color="#7f8c8d" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.disabledButton]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Se connecter</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            // Formulaire d'inscription
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nom d'utilisateur *</Text>
                <TextInput
                  style={styles.input}
                  value={registerForm.username}
                  onChangeText={(text) => setRegisterForm({...registerForm, username: text})}
                  placeholder="Choisissez un nom d'utilisateur"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={registerForm.email}
                  onChangeText={(text) => setRegisterForm({...registerForm, email: text})}
                  placeholder="votre@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nom complet *</Text>
                <TextInput
                  style={styles.input}
                  value={registerForm.name}
                  onChangeText={(text) => setRegisterForm({...registerForm, name: text})}
                  placeholder="Votre nom complet"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mot de passe *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={registerForm.password}
                    onChangeText={(text) => setRegisterForm({...registerForm, password: text})}
                    placeholder="Au moins 6 caractères"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off" : "eye"} 
                      size={24} 
                      color="#7f8c8d" 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmer le mot de passe *</Text>
                <TextInput
                  style={styles.input}
                  value={registerForm.confirmPassword}
                  onChangeText={(text) => setRegisterForm({...registerForm, confirmPassword: text})}
                  placeholder="Répétez votre mot de passe"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.disabledButton]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.submitButtonText}>Créer un compte</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Bouton pour basculer entre connexion et inscription */}
          <TouchableOpacity
            style={styles.switchModeButton}
            onPress={() => setIsLoginMode(!isLoginMode)}
            disabled={isLoading}
          >
            <Text style={styles.switchModeText}>
              {isLoginMode 
                ? "Pas encore de compte ? Inscrivez-vous" 
                : "Déjà un compte ? Connectez-vous"}
            </Text>
          </TouchableOpacity>

          {/* Connexions rapides pour les tests */}
          <View style={styles.quickLoginSection}>
            <Text style={styles.quickLoginTitle}>Comptes de test :</Text>
            <TouchableOpacity
              style={styles.quickLoginButton}
              onPress={() => handleQuickLogin("moi", "password123")}
              disabled={isLoading}
            >
              <Text style={styles.quickLoginText}>Utilisateur normal</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quickLoginButton, styles.adminButton]}
              onPress={() => handleQuickLogin("admin", "admin123")}
              disabled={isLoading}
            >
              <Text style={styles.quickLoginText}>Admin</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#f9f9f9",
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  passwordToggle: {
    padding: 15,
  },
  submitButton: {
    backgroundColor: "#3498db",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#95a5a6",
  },
  submitButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  switchModeButton: {
    alignItems: "center",
    padding: 15,
  },
  switchModeText: {
    color: "#3498db",
    fontSize: 16,
    fontWeight: "500",
  },
  quickLoginSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  quickLoginTitle: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    marginBottom: 10,
  },
  quickLoginButton: {
    backgroundColor: "#95a5a6",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
    marginBottom: 8,
  },
  adminButton: {
    backgroundColor: "#8e44ad",
  },
  quickLoginText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default LoginScreen;