import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import * as SplashScreen from "expo-splash-screen";

// Importer les écrans
import ClothingListScreen from "./screens/ClothingListScreen";
import ClothingFormScreen from "./screens/ClothingFormScreen";
import OutfitCreatorScreen from "./screens/OutfitCreatorScreen";
import ColorAssistantScreen from "./screens/ColorAssistantScreen";
import PendingOrdersScreen from "./screens/PendingOrdersScreen";
import UserScreen from "./screens/UserScreen";

// Importer les services
import {
  initAuth,
  getCurrentUser,
  isCurrentUserAdmin,
} from "./utils/simpleAuthService";

// Créer le navigateur d'onglets
const Tab = createBottomTabNavigator();

// Garder l'écran de démarrage visible
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Préparer l'application
  useEffect(() => {
    async function prepare() {
      try {
        // Initialiser l'authentification
        await initAuth();

        // Vérifier si un utilisateur est connecté
        const currentUser = getCurrentUser();
        if (currentUser) {
          setIsLoggedIn(true);
          setIsAdmin(isCurrentUserAdmin());
        }
      } catch (e) {
        console.warn("Erreur de préparation de l'application:", e);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return null;
  }

  // Si l'utilisateur n'est pas connecté, afficher l'écran de connexion
  if (!isLoggedIn) {
    return <UserScreen setIsLoggedIn={setIsLoggedIn} setIsAdmin={setIsAdmin} />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === "Vêtements") {
              iconName = focused ? "shirt" : "shirt-outline";
            } else if (route.name === "Ajouter") {
              iconName = focused ? "add-circle" : "add-circle-outline";
            } else if (route.name === "Tenues") {
              iconName = focused ? "people" : "people-outline";
            } else if (route.name === "Commandes") {
              iconName = focused ? "cart" : "cart-outline";
            } else if (route.name === "Couleurs") {
              iconName = focused ? "color-palette" : "color-palette-outline";
            } else if (route.name === "Profil") {
              iconName = focused ? "person" : "person-outline";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#3498db",
          tabBarInactiveTintColor: "gray",
          headerStyle: {
            backgroundColor: "#3498db",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        })}
      >
        <Tab.Screen name="Vêtements" component={ClothingListScreen} />
        <Tab.Screen name="Ajouter" component={ClothingFormScreen} />
        <Tab.Screen name="Tenues" component={OutfitCreatorScreen} />
        <Tab.Screen name="Commandes" component={PendingOrdersScreen} />
        <Tab.Screen name="Couleurs" component={ColorAssistantScreen} />
        <Tab.Screen
          name="Profil"
          children={() => (
            <UserScreen setIsLoggedIn={setIsLoggedIn} setIsAdmin={setIsAdmin} />
          )}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
