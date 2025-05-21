import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  suggestColorCombinations,
  checkColorHarmony,
  colorMap,
} from "../utils/colorTheory";

function ColorAssistantScreen() {
  const [selectedColor, setSelectedColor] = useState("");
  const [customColor, setCustomColor] = useState("");
  const [suggestions, setSuggestions] = useState(null);
  const [harmonyCheck, setHarmonyCheck] = useState(null);
  const [secondColor, setSecondColor] = useState("");

  // Récupérer la liste des couleurs disponibles
  const availableColors = Object.keys(colorMap).sort();

  // Gérer la sélection d'une couleur dans la liste déroulante
  const handleColorSelect = (color) => {
    setSelectedColor(color);
    if (color) {
      setSuggestions(suggestColorCombinations(color));
      setCustomColor("");
    } else {
      setSuggestions(null);
    }
  };

  // Gérer la soumission d'une couleur personnalisée
  const handleCustomColorSubmit = () => {
    if (customColor.trim()) {
      const suggestions = suggestColorCombinations(customColor);
      setSuggestions(suggestions);
      setSelectedColor("");
    }
  };

  // Gérer la vérification d'harmonie entre deux couleurs
  const handleHarmonyCheck = () => {
    if ((selectedColor || customColor) && secondColor) {
      const colorToCheck = selectedColor || customColor;
      const harmonyResult = checkColorHarmony(colorToCheck, secondColor);
      setHarmonyCheck(harmonyResult);
    }
  };

  // Composant pour afficher un échantillon de couleur
  const ColorSwatch = ({ colorName }) => {
    const hexColor = colorMap[colorName] || "#CCCCCC";
    return <View style={[styles.colorSwatch, { backgroundColor: hexColor }]} />;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Assistant de combinaison de couleurs</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Choisissez une couleur</Text>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedColor}
            onValueChange={handleColorSelect}
            style={styles.picker}
          >
            <Picker.Item label="Sélectionnez une couleur" value="" />
            {availableColors.map((color) => (
              <Picker.Item
                key={color}
                label={color.charAt(0).toUpperCase() + color.slice(1)}
                value={color}
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.orDivider}>OU</Text>

        <View style={styles.customColorForm}>
          <TextInput
            style={styles.input}
            value={customColor}
            onChangeText={setCustomColor}
            placeholder="Entrez une couleur"
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleCustomColorSubmit}
          >
            <Text style={styles.buttonText}>Trouver des combinaisons</Text>
          </TouchableOpacity>
        </View>
      </View>

      {suggestions && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Suggestions</Text>

          {suggestions.message && (
            <Text style={styles.message}>{suggestions.message}</Text>
          )}

          {/* Afficher les suggestions de couleurs ici */}
          {suggestions.complementaires &&
            suggestions.complementaires.length > 0 && (
              <View style={styles.suggestionGroup}>
                <Text style={styles.groupTitle}>Couleurs complémentaires</Text>
                <Text style={styles.description}>
                  Les couleurs complémentaires créent un contraste fort et
                  dynamique.
                </Text>
                <View style={styles.colorList}>
                  {suggestions.complementaires.map((color) => (
                    <View key={color} style={styles.colorItem}>
                      <ColorSwatch colorName={color} />
                      <Text style={styles.colorName}>
                        {color.charAt(0).toUpperCase() + color.slice(1)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

          {/* Ajouter les autres types de suggestions de la même manière */}
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Vérifier l'harmonie entre deux couleurs
        </Text>

        <View style={styles.harmonyInputs}>
          <View style={styles.harmonyColor}>
            <Text style={styles.label}>Première couleur</Text>
            <View style={styles.colorInputContainer}>
              <Text style={styles.colorIndicator}>
                {selectedColor ||
                  customColor ||
                  "Sélectionnez une couleur ci-dessus"}
              </Text>
            </View>
          </View>

          <View style={styles.harmonyColor}>
            <Text style={styles.label}>Deuxième couleur</Text>
            <Picker
              selectedValue={secondColor}
              onValueChange={setSecondColor}
              style={styles.picker}
            >
              <Picker.Item label="Sélectionnez une couleur" value="" />
              {availableColors.map((color) => (
                <Picker.Item
                  key={color}
                  label={color.charAt(0).toUpperCase() + color.slice(1)}
                  value={color}
                />
              ))}
            </Picker>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            !((selectedColor || customColor) && secondColor) &&
              styles.disabledButton,
          ]}
          onPress={handleHarmonyCheck}
          disabled={!((selectedColor || customColor) && secondColor)}
        >
          <Text style={styles.buttonText}>Vérifier l'harmonie</Text>
        </TouchableOpacity>

        {harmonyCheck && (
          <View style={styles.harmonyResult}>
            <Text style={styles.resultTitle}>Résultat</Text>
            <Text style={styles.resultText}>{harmonyCheck.explanation}</Text>
            <View style={styles.harmonyDisplay}>
              <View
                style={[
                  styles.colorBox,
                  {
                    backgroundColor:
                      colorMap[selectedColor] ||
                      colorMap[
                        Object.keys(colorMap).find((key) =>
                          key.toLowerCase().includes(customColor.toLowerCase())
                        )
                      ] ||
                      "#CCCCCC",
                  },
                ]}
              />
              <Text style={styles.plusSign}>+</Text>
              <View
                style={[
                  styles.colorBox,
                  {
                    backgroundColor: colorMap[secondColor] || "#CCCCCC",
                  },
                ]}
              />
              <Text style={styles.equalsSign}>=</Text>
              <View
                style={[
                  styles.harmonyBadge,
                  harmonyCheck.harmony ? styles.goodHarmony : styles.badHarmony,
                ]}
              >
                <Text style={styles.harmonyBadgeText}>
                  {harmonyCheck.harmony ? "Harmonieux" : "Difficile"}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#2c3e50",
    textAlign: "center",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#3498db",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 10,
  },
  picker: {
    height: 50,
  },
  orDivider: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#95a5a6",
    marginVertical: 10,
  },
  customColorForm: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 10,
  },
  button: {
    backgroundColor: "#3498db",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#95a5a6",
  },
  message: {
    fontWeight: "bold",
    marginBottom: 16,
  },
  suggestionGroup: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  groupTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 10,
  },
  colorList: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  colorItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  colorName: {
    fontSize: 14,
  },
  harmonyInputs: {
    marginBottom: 16,
  },
  harmonyColor: {
    marginBottom: 10,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  colorInputContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    backgroundColor: "#f9f9f9",
  },
  colorIndicator: {
    color: "#7f8c8d",
    fontStyle: "italic",
  },
  harmonyResult: {
    marginTop: 16,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  resultTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  resultText: {
    marginBottom: 10,
  },
  harmonyDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  colorBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  plusSign: {
    marginHorizontal: 10,
    fontSize: 20,
    fontWeight: "bold",
  },
  equalsSign: {
    marginHorizontal: 10,
    fontSize: 20,
    fontWeight: "bold",
  },
  harmonyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  goodHarmony: {
    backgroundColor: "#2ecc71",
  },
  badHarmony: {
    backgroundColor: "#e74c3c",
  },
  harmonyBadgeText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default ColorAssistantScreen;
