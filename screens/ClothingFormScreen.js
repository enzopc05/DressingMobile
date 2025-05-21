import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import {
  getMainCategories,
  getSubCategories,
} from "../utils/clothingCategories";
import { addClothing, updateClothing } from "../utils/dataService";
import { getCurrentUserId } from "../utils/simpleAuthService";

function ClothingFormScreen({ navigation, route }) {
  const editClothing = route.params?.clothing;
  const isEditing = !!editClothing;

  const [form, setForm] = useState({
    name: "",
    type: "",
    subType: "",
    color: "",
    season: "",
    imageUrl: "",
    price: "",
  });

  const [imagePreview, setImagePreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [subCategories, setSubCategories] = useState({});
  const [errors, setErrors] = useState({});

  // Si un vêtement est fourni pour modification, remplir le formulaire
  useEffect(() => {
    if (editClothing) {
      setForm({
        ...editClothing,
        price: editClothing.price ? editClothing.price.toString() : "",
      });
      setImagePreview(editClothing.imageUrl || "");

      if (editClothing.type) {
        const newSubCategories = getSubCategories(editClothing.type);
        setSubCategories(newSubCategories);
      }
    }
  }, [editClothing]);

  // Vérification des permissions pour l'accès à la galerie
  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission refusée",
          "Nous avons besoin de votre permission pour accéder à la galerie d'images."
        );
      }
    })();
  }, []);

  const handleChange = (name, value) => {
    // Effacer l'erreur correspondante si elle existe
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }

    if (name === "type") {
      const newSubCategories = getSubCategories(value);
      setSubCategories(newSubCategories);
      setForm({ ...form, [name]: value, subType: "" });
    } else if (name === "price") {
      // Validation pour ne permettre que des nombres et une virgule/point
      const isValidPrice = /^[0-9]*[.,]?[0-9]*$/.test(value);
      if (isValidPrice || value === "") {
        setForm({ ...form, [name]: value });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        setImagePreview(selectedImage.uri);
        setForm({ ...form, imageUrl: selectedImage.uri });
      }
    } catch (error) {
      console.error("Erreur lors de la sélection de l'image:", error);
      Alert.alert("Erreur", "Impossible de sélectionner l'image");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Le nom est obligatoire";
    }

    if (!form.type) {
      newErrors.type = "La catégorie est obligatoire";
    }

    if (!form.color.trim()) {
      newErrors.color = "La couleur est obligatoire";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const userId = getCurrentUserId();
      const formattedForm = { ...form };

      // Convertir le prix en nombre
      if (formattedForm.price) {
        formattedForm.price = parseFloat(formattedForm.price.replace(",", "."));
      }

      if (isEditing) {
        // Mise à jour d'un vêtement existant
        await updateClothing(formattedForm, userId);
        Alert.alert("Succès", "Vêtement mis à jour avec succès");
      } else {
        // Ajout d'un nouveau vêtement
        await addClothing(formattedForm, userId);
        Alert.alert("Succès", "Vêtement ajouté avec succès");
      }

      // Réinitialiser le formulaire si nécessaire ou naviguer vers une autre page
      navigation.goBack();
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de l'enregistrement");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {isEditing ? "Modifier un vêtement" : "Ajouter un vêtement"}
      </Text>

      <View style={styles.form}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nom*</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={form.name}
            onChangeText={(value) => handleChange("name", value)}
            placeholder="Ex: T-shirt bleu rayé"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Catégorie*</Text>
          <View
            style={[styles.pickerContainer, errors.type && styles.inputError]}
          >
            <Picker
              selectedValue={form.type}
              onValueChange={(value) => handleChange("type", value)}
              style={styles.picker}
            >
              <Picker.Item label="Sélectionnez une catégorie" value="" />
              {Object.entries(getMainCategories()).map(([key, label]) => (
                <Picker.Item key={key} label={label} value={key} />
              ))}
            </Picker>
          </View>
          {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
        </View>

        {form.type && Object.keys(subCategories).length > 0 && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Sous-catégorie</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.subType}
                onValueChange={(value) => handleChange("subType", value)}
                style={styles.picker}
              >
                <Picker.Item label="Sélectionnez une sous-catégorie" value="" />
                {Object.entries(subCategories).map(([key, label]) => (
                  <Picker.Item key={key} label={label} value={key} />
                ))}
              </Picker>
            </View>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Couleur*</Text>
          <TextInput
            style={[styles.input, errors.color && styles.inputError]}
            value={form.color}
            onChangeText={(value) => handleChange("color", value)}
            placeholder="Ex: Bleu marine"
          />
          {errors.color && <Text style={styles.errorText}>{errors.color}</Text>}
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Prix (€)</Text>
          <TextInput
            style={styles.input}
            value={form.price}
            onChangeText={(value) => handleChange("price", value)}
            placeholder="Ex: 29.99"
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Saison</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={form.season}
              onValueChange={(value) => handleChange("season", value)}
              style={styles.picker}
            >
              <Picker.Item label="Toutes saisons" value="" />
              <Picker.Item label="Printemps" value="printemps" />
              <Picker.Item label="Été" value="été" />
              <Picker.Item label="Automne" value="automne" />
              <Picker.Item label="Hiver" value="hiver" />
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Image</Text>
          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={pickImage}
          >
            <Text style={styles.imagePickerText}>
              {imagePreview ? "Changer l'image" : "Sélectionner une image"}
            </Text>
          </TouchableOpacity>

          {imagePreview ? (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: imagePreview }}
                style={styles.imagePreview}
              />
            </View>
          ) : null}

          <TextInput
            style={styles.input}
            value={form.imageUrl}
            onChangeText={(value) => {
              handleChange("imageUrl", value);
              setImagePreview(value);
            }}
            placeholder="Ou entrez une URL d'image"
          />
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Annuler</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditing ? "Mettre à jour" : "Ajouter"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
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
    marginBottom: 20,
    color: "#2c3e50",
    textAlign: "center",
  },
  form: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formGroup: {
    marginBottom: 16,
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
  },
  inputError: {
    borderColor: "#e74c3c",
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 14,
    marginTop: 5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  imagePickerButton: {
    backgroundColor: "#3498db",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  imagePickerText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  imagePreviewContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    resizeMode: "cover",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: "#95a5a6",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#2ecc71",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default ClothingFormScreen;
