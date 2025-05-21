import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { getFullCategoryLabel } from "../utils/clothingCategories";

function ClothingItemComponent({
  item,
  onDelete,
  onEdit,
  selectable,
  onSelect,
  isSelected,
}) {
  // Récupérer le libellé complet de la catégorie
  const categoryLabel = getFullCategoryLabel(item.type, item.subType);

  // Formater le prix pour l'affichage
  const formatPrice = (price) => {
    if (price === undefined || price === null || price === "") return "";
    return `${price.toFixed(2)} €`;
  };

  // Confirmer la suppression
  const confirmDelete = () => {
    Alert.alert(
      "Confirmer la suppression",
      `Êtes-vous sûr de vouloir supprimer "${item.name}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          onPress: () => onDelete(item.id),
          style: "destructive",
        },
      ]
    );
  };

  return (
    <View style={[styles.container, isSelected && styles.selectedContainer]}>
      <View style={styles.imageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.noImage}>
            <Text style={styles.noImageText}>Pas d'image</Text>
          </View>
        )}
      </View>

      <View style={styles.details}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.type}>{categoryLabel || item.type}</Text>
        <Text style={styles.color}>Couleur: {item.color}</Text>
        {item.season && (
          <Text style={styles.season}>Saison: {item.season}</Text>
        )}
        {item.price && (
          <Text style={styles.price}>Prix: {formatPrice(item.price)}</Text>
        )}
      </View>

      <View style={styles.actions}>
        {selectable ? (
          <TouchableOpacity
            style={[styles.selectButton, isSelected && styles.deselectButton]}
            onPress={() => onSelect(item)}
          >
            <Text style={styles.buttonText}>
              {isSelected ? "Désélectionner" : "Sélectionner"}
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => onEdit(item.id)}
            >
              <Text style={styles.buttonText}>Modifier</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={confirmDelete}
            >
              <Text style={styles.buttonText}>Supprimer</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedContainer: {
    borderWidth: 2,
    borderColor: "#3498db",
  },
  imageContainer: {
    height: 200,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  noImage: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
  },
  noImageText: {
    color: "#999",
    fontStyle: "italic",
  },
  details: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  type: {
    color: "#666",
    marginBottom: 4,
  },
  color: {
    color: "#666",
    marginBottom: 4,
  },
  season: {
    color: "#666",
    marginBottom: 4,
  },
  price: {
    fontWeight: "bold",
    color: "#e74c3c",
    marginTop: 4,
  },
  actions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  editButton: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    backgroundColor: "#f39c12",
  },
  deleteButton: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    backgroundColor: "#e74c3c",
  },
  selectButton: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    backgroundColor: "#3498db",
  },
  deselectButton: {
    backgroundColor: "#95a5a6",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default ClothingItemComponent;
