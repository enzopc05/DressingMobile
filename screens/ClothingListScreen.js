import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { getClothes, deleteClothing } from "../utils/dataService";
import { getCurrentUserId } from "../utils/simpleAuthService";
import {
  getMainCategories,
  getSubCategories,
} from "../utils/clothingCategories";
import ClothingItemComponent from "../components/ClothingItemComponent";

function ClothingListScreen({ navigation, route }) {
  const [clothes, setClothes] = useState(route.params?.clothes || []);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: "",
    subType: "",
    color: "",
    season: "",
  });
  const [filterSubCategories, setFilterSubCategories] = useState({});
  const [colors, setColors] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Charger les vêtements
  useEffect(() => {
    const loadClothes = async () => {
      try {
        setLoading(true);
        const userId = getCurrentUserId();
        const loadedClothes = await getClothes(userId);
        setClothes(loadedClothes);

        // Extraire les couleurs et saisons uniques
        setColors([...new Set(loadedClothes.map((item) => item.color))]);
        setSeasons([
          ...new Set(
            loadedClothes
              .filter((item) => item.season)
              .map((item) => item.season)
          ),
        ]);
      } catch (error) {
        console.error("Erreur de chargement des vêtements:", error);
      } finally {
        setLoading(false);
      }
    };

    loadClothes();

    // Ajouter un écouteur pour recharger les vêtements après une modification
    const unsubscribe = navigation.addListener("focus", loadClothes);

    return unsubscribe;
  }, [navigation]);

  // Gérer le changement de filtre
  const handleFilterChange = (name, value) => {
    if (name === "type") {
      setFilter({ ...filter, [name]: value, subType: "" });
      setFilterSubCategories(value ? getSubCategories(value) : {});
    } else {
      setFilter({ ...filter, [name]: value });
    }
  };

  // Filtrer les vêtements
  const filteredClothes = clothes.filter((item) => {
    return (
      (filter.type === "" || item.type === filter.type) &&
      (filter.subType === "" || item.subType === filter.subType) &&
      (filter.color === "" || item.color === filter.color) &&
      (filter.season === "" || item.season === filter.season)
    );
  });

  // Réinitialiser les filtres
  const resetFilters = () => {
    setFilter({ type: "", subType: "", color: "", season: "" });
    setFilterSubCategories({});
  };

  // Gérer la suppression d'un vêtement
  const handleDeleteClothing = async (id) => {
    try {
      const userId = getCurrentUserId();
      const success = await deleteClothing(id, userId);
      if (success) {
        setClothes(clothes.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error("Erreur de suppression:", error);
    }
  };

  // Gérer l'édition d'un vêtement
  const handleEditClothing = (id) => {
    const clothingToEdit = clothes.find((item) => item.id === id);
    navigation.navigate("Ajouter", { clothing: clothingToEdit });
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
      <View style={styles.header}>
        <Text style={styles.title}>
          Mes vêtements ({filteredClothes.length})
        </Text>
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterToggleText}>
            {showFilters ? "Masquer les filtres" : "Afficher les filtres"}
          </Text>
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterTitle}>Filtres</Text>

          <Text style={styles.filterLabel}>Catégorie</Text>
          <Picker
            selectedValue={filter.type}
            onValueChange={(value) => handleFilterChange("type", value)}
            style={styles.picker}
          >
            <Picker.Item label="Toutes" value="" />
            {Object.entries(getMainCategories()).map(([key, label]) => (
              <Picker.Item key={key} label={label} value={key} />
            ))}
          </Picker>

          {filter.type && Object.keys(filterSubCategories).length > 0 && (
            <>
              <Text style={styles.filterLabel}>Sous-catégorie</Text>
              <Picker
                selectedValue={filter.subType}
                onValueChange={(value) => handleFilterChange("subType", value)}
                style={styles.picker}
              >
                <Picker.Item label="Toutes" value="" />
                {Object.entries(filterSubCategories).map(([key, label]) => (
                  <Picker.Item key={key} label={label} value={key} />
                ))}
              </Picker>
            </>
          )}

          <Text style={styles.filterLabel}>Couleur</Text>
          <Picker
            selectedValue={filter.color}
            onValueChange={(value) => handleFilterChange("color", value)}
            style={styles.picker}
          >
            <Picker.Item label="Toutes" value="" />
            {colors.map((color) => (
              <Picker.Item key={color} label={color} value={color} />
            ))}
          </Picker>

          {seasons.length > 0 && (
            <>
              <Text style={styles.filterLabel}>Saison</Text>
              <Picker
                selectedValue={filter.season}
                onValueChange={(value) => handleFilterChange("season", value)}
                style={styles.picker}
              >
                <Picker.Item label="Toutes" value="" />
                {seasons.map((season) => (
                  <Picker.Item key={season} label={season} value={season} />
                ))}
              </Picker>
            </>
          )}

          <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
            <Text style={styles.resetButtonText}>
              Réinitialiser les filtres
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {filteredClothes.length > 0 ? (
        <FlatList
          data={filteredClothes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ClothingItemComponent
              item={item}
              onDelete={handleDeleteClothing}
              onEdit={handleEditClothing}
            />
          )}
          style={styles.clothingList}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.noItems}>
            Aucun vêtement trouvé. Ajoutez-en ou modifiez vos filtres.
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("Ajouter")}
          >
            <Text style={styles.addButtonText}>Ajouter un vêtement</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  filterToggle: {
    backgroundColor: "#3498db",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterToggleText: {
    color: "white",
    fontWeight: "bold",
  },
  filtersContainer: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#3498db",
  },
  filterLabel: {
    fontWeight: "bold",
    marginBottom: 4,
    marginTop: 8,
  },
  picker: {
    height: 50,
    marginBottom: 8,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
  },
  resetButton: {
    backgroundColor: "#95a5a6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  resetButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  clothingList: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noItems: {
    textAlign: "center",
    marginBottom: 20,
    color: "#7f8c8d",
    fontStyle: "italic",
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#2ecc71",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ClothingListScreen;
