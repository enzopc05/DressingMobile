import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import {
  getClothes,
  getOutfits,
  addOutfit,
  deleteOutfit,
} from "../utils/dataService";
import { getCurrentUser } from "../utils/authService";
import ClothingItemComponent from "../components/ClothingItemComponent";

function OutfitCreatorScreen({ navigation, route }) {
  const [clothes, setClothes] = useState(route.params?.clothes || []);
  const [selectedItems, setSelectedItems] = useState([]);
  const [outfitName, setOutfitName] = useState("");
  const [savedOutfits, setSavedOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupedClothes, setGroupedClothes] = useState({});
  const [activeTab, setActiveTab] = useState("create"); // 'create' ou 'saved'

  // Charger les vêtements et les tenues sauvegardées
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const user = await getCurrentUser();
        const userId = user ? user.id : null;

        // Charger les vêtements
        const loadedClothes = await getClothes(userId);
        setClothes(loadedClothes);

        // Grouper les vêtements par type
        const grouped = loadedClothes.reduce((groups, item) => {
          const type = item.type || "autre";
          if (!groups[type]) {
            groups[type] = [];
          }
          groups[type].push(item);
          return groups;
        }, {});
        setGroupedClothes(grouped);

        // Charger les tenues sauvegardées
        const loadedOutfits = await getOutfits(userId);
        setSavedOutfits(loadedOutfits);
      } catch (error) {
        console.error("Erreur de chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Ajouter un écouteur pour recharger les données après une modification
    const unsubscribe = navigation.addListener("focus", loadData);

    return unsubscribe;
  }, [navigation]);

  // Vérifier si un vêtement est sélectionné
  const isSelected = (item) => {
    return selectedItems.some((selected) => selected.id === item.id);
  };

  // Gérer la sélection/désélection d'un vêtement
  const toggleSelect = (item) => {
    if (isSelected(item)) {
      setSelectedItems(
        selectedItems.filter((selected) => selected.id !== item.id)
      );
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  // Sauvegarder une tenue
  const saveOutfit = async () => {
    if (selectedItems.length === 0) {
      Alert.alert("Attention", "Veuillez sélectionner au moins un vêtement");
      return;
    }

    if (!outfitName.trim()) {
      Alert.alert("Attention", "Veuillez donner un nom à votre tenue");
      return;
    }

    try {
      setLoading(true);

      const newOutfit = {
        name: outfitName,
        items: selectedItems,
      };

      const user = await getCurrentUser();
      const userId = user ? user.id : null;
      const outfitId = await addOutfit(newOutfit, userId);

      // Mettre à jour l'état local
      const outfitWithId = {
        ...newOutfit,
        id: outfitId,
      };

      setSavedOutfits([...savedOutfits, outfitWithId]);

      // Réinitialiser le formulaire
      setSelectedItems([]);
      setOutfitName("");
      setActiveTab("saved");

      Alert.alert("Succès", "Tenue sauvegardée avec succès !");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de la tenue:", error);
      Alert.alert("Erreur", "Impossible de sauvegarder la tenue");
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une tenue
  const handleDeleteOutfit = async (outfitId) => {
    Alert.alert(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer cette tenue ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);

              const user = await getCurrentUser();
              const userId = user ? user.id : null;
              const success = await deleteOutfit(outfitId, userId);

              if (success) {
                const updatedOutfits = savedOutfits.filter(
                  (outfit) => outfit.id !== outfitId
                );
                setSavedOutfits(updatedOutfits);
              }
            } catch (error) {
              console.error(
                "Erreur lors de la suppression de la tenue:",
                error
              );
              Alert.alert("Erreur", "Impossible de supprimer la tenue");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Rendu du composant pour chaque type de vêtements
  const renderClothingTypeSection = ([type, items]) => {
    if (items.length === 0) return null;

    // Convertir le premier caractère en majuscule
    const formattedType = type.charAt(0).toUpperCase() + type.slice(1) + "s";

    return (
      <View key={type} style={styles.clothingTypeSection}>
        <Text style={styles.sectionTitle}>{formattedType}</Text>
        <FlatList
          data={items}
          renderItem={({ item }) => (
            <ClothingItemComponent
              item={item}
              selectable={true}
              onSelect={toggleSelect}
              isSelected={isSelected(item)}
            />
          )}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListContent}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Onglets pour basculer entre création et tenues sauvegardées */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "create" && styles.activeTab]}
          onPress={() => setActiveTab("create")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "create" && styles.activeTabText,
            ]}
          >
            Créer une tenue
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "saved" && styles.activeTab]}
          onPress={() => setActiveTab("saved")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "saved" && styles.activeTabText,
            ]}
          >
            Tenues sauvegardées ({savedOutfits.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "create" ? (
        <ScrollView style={styles.outfitBuilder}>
          <View style={styles.outfitNameField}>
            <Text style={styles.label}>Nom de la tenue:</Text>
            <TextInput
              style={styles.input}
              value={outfitName}
              onChangeText={setOutfitName}
              placeholder="Ex: Tenue de soirée"
            />
          </View>

          <View style={styles.selectedItems}>
            <Text style={styles.sectionTitle}>
              Vêtements sélectionnés ({selectedItems.length})
            </Text>
            {selectedItems.length > 0 ? (
              <FlatList
                data={selectedItems}
                renderItem={({ item }) => (
                  <View style={styles.selectedItem}>
                    <ClothingItemComponent
                      item={item}
                      selectable={true}
                      onSelect={toggleSelect}
                      isSelected={true}
                    />
                  </View>
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalListContent}
              />
            ) : (
              <View style={styles.emptySelection}>
                <Text style={styles.emptyText}>Aucun vêtement sélectionné</Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.saveOutfitBtn,
                (selectedItems.length === 0 || !outfitName.trim()) &&
                  styles.disabledButton,
              ]}
              onPress={saveOutfit}
              disabled={selectedItems.length === 0 || !outfitName.trim()}
            >
              <Text style={styles.buttonText}>Sauvegarder cette tenue</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.availableItems}>
            <Text style={styles.sectionTitle}>Vêtements disponibles</Text>

            {Object.entries(groupedClothes).map(renderClothingTypeSection)}
          </View>
        </ScrollView>
      ) : (
        <ScrollView style={styles.savedOutfits}>
          {savedOutfits.length > 0 ? (
            <View>
              {savedOutfits.map((outfit) => (
                <View key={outfit.id} style={styles.savedOutfit}>
                  <Text style={styles.outfitName}>{outfit.name}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.outfitItems}>
                      {outfit.items.map((item) => (
                        <View key={item.id} style={styles.outfitItem}>
                          <ClothingItemComponent
                            item={item}
                            selectable={false}
                          />
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                  <TouchableOpacity
                    style={styles.deleteOutfitBtn}
                    onPress={() => handleDeleteOutfit(outfit.id)}
                  >
                    <Text style={styles.buttonText}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyOutfits}>
              <Text style={styles.emptyText}>
                Aucune tenue sauvegardée. Créez votre première tenue !
              </Text>
              <TouchableOpacity
                style={styles.createOutfitBtn}
                onPress={() => setActiveTab("create")}
              >
                <Text style={styles.buttonText}>Créer une tenue</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </View>
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
  tabs: {
    flexDirection: "row",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#3498db",
  },
  tabText: {
    fontSize: 16,
    color: "#7f8c8d",
  },
  activeTabText: {
    fontWeight: "bold",
    color: "#3498db",
  },
  outfitBuilder: {
    flex: 1,
    padding: 16,
  },
  outfitNameField: {
    marginBottom: 20,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 8,
    color: "#34495e",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "white",
  },
  selectedItems: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptySelection: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#7f8c8d",
    fontStyle: "italic",
  },
  horizontalListContent: {
    paddingBottom: 10,
  },
  selectedItem: {
    width: 150,
    marginRight: 10,
  },
  saveOutfitBtn: {
    backgroundColor: "#2ecc71",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: "#95a5a6",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  availableItems: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#2c3e50",
  },
  clothingTypeSection: {
    marginBottom: 20,
  },
  savedOutfits: {
    flex: 1,
    padding: 16,
  },
  savedOutfit: {
    backgroundColor: "white",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  outfitName: {
    backgroundColor: "#3498db",
    color: "white",
    padding: 15,
    fontSize: 18,
    fontWeight: "bold",
  },
  outfitItems: {
    flexDirection: "row",
    padding: 10,
  },
  outfitItem: {
    width: 150,
    marginRight: 10,
  },
  deleteOutfitBtn: {
    backgroundColor: "#e74c3c",
    padding: 15,
    alignItems: "center",
  },
  emptyOutfits: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  createOutfitBtn: {
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
});

export default OutfitCreatorScreen;
