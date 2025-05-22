import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import {
  getMainCategories,
  getSubCategories,
} from "../utils/clothingCategories";
import { addPendingOrder, updatePendingOrder } from "../utils/dataService";
import { getCurrentUser } from "../utils/authService";

function OrderFormScreen({ navigation, route }) {
  const editOrder = route.params?.order;
  const isEditing = !!editOrder;

  const [form, setForm] = useState({
    name: "",
    store: "",
    expectedDate: "",
    trackingNumber: "",
    note: "",
    items: [],
  });

  const [currentItem, setCurrentItem] = useState({
    name: "",
    type: "",
    subType: "",
    color: "",
    price: "",
  });

  const [subCategories, setSubCategories] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialiser le formulaire si on modifie une commande
  useEffect(() => {
    if (editOrder) {
      setForm({
        ...editOrder,
        expectedDate: editOrder.expectedDate || "",
      });
      if (editOrder.expectedDate) {
        setSelectedDate(new Date(editOrder.expectedDate));
      }
    }
  }, [editOrder]);

  // Gérer les changements dans le formulaire principal
  const handleFormChange = (name, value) => {
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
    setForm({ ...form, [name]: value });
  };

  // Gérer les changements dans le formulaire d'article
  const handleItemChange = (name, value) => {
    if (name === "type") {
      const newSubCategories = getSubCategories(value);
      setSubCategories(newSubCategories);
      setCurrentItem({ ...currentItem, [name]: value, subType: "" });
    } else if (name === "price") {
      const isValidPrice = /^[0-9]*[.,]?[0-9]*$/.test(value);
      if (isValidPrice || value === "") {
        setCurrentItem({ ...currentItem, [name]: value });
      }
    } else {
      setCurrentItem({ ...currentItem, [name]: value });
    }
  };

  // Ajouter un article à la commande
  const addItemToOrder = () => {
    if (!currentItem.name.trim()) {
      Alert.alert("Erreur", "Le nom de l'article est obligatoire");
      return;
    }

    if (!currentItem.type) {
      Alert.alert("Erreur", "La catégorie de l'article est obligatoire");
      return;
    }

    if (!currentItem.color.trim()) {
      Alert.alert("Erreur", "La couleur de l'article est obligatoire");
      return;
    }

    const newItem = {
      ...currentItem,
      id: Date.now().toString(),
      price: currentItem.price ? parseFloat(currentItem.price.replace(",", ".")) : 0,
    };

    setForm({
      ...form,
      items: [...form.items, newItem],
    });

    // Réinitialiser le formulaire d'article
    setCurrentItem({
      name: "",
      type: "",
      subType: "",
      color: "",
      price: "",
    });
    setSubCategories({});
  };

  // Supprimer un article de la commande
  const removeItemFromOrder = (itemId) => {
    Alert.alert(
      "Supprimer l'article",
      "Êtes-vous sûr de vouloir supprimer cet article ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            const updatedItems = form.items.filter((item) => item.id !== itemId);
            setForm({ ...form, items: updatedItems });
          },
        },
      ]
    );
  };

  // Gérer la sélection de date
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(Platform.OS === "ios");
    setSelectedDate(currentDate);
    setForm({
      ...form,
      expectedDate: currentDate.toISOString().split("T")[0],
    });
  };

  // Valider le formulaire
  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Le nom de la commande est obligatoire";
    }

    if (form.items.length === 0) {
      newErrors.items = "Ajoutez au moins un article à la commande";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Sauvegarder la commande
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const user = await getCurrentUser();
      const userId = user ? user.id : null;

      if (isEditing) {
        const success = await updatePendingOrder(form, userId);
        if (success) {
          Alert.alert("Succès", "Commande mise à jour avec succès");
          navigation.goBack();
        } else {
          Alert.alert("Erreur", "Impossible de mettre à jour la commande");
        }
      } else {
        const orderId = await addPendingOrder(form, userId);
        if (orderId) {
          Alert.alert("Succès", "Commande ajoutée avec succès");
          navigation.goBack();
        } else {
          Alert.alert("Erreur", "Impossible d'ajouter la commande");
        }
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      Alert.alert("Erreur", "Une erreur est survenue lors de la sauvegarde");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculer le total de la commande
  const calculateTotal = () => {
    return form.items.reduce((total, item) => total + (item.price || 0), 0);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {isEditing ? "Modifier la commande" : "Nouvelle commande"}
      </Text>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Informations de la commande</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nom de la commande *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={form.name}
            onChangeText={(value) => handleFormChange("name", value)}
            placeholder="Ex: Commande Zara du 15 mars"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Boutique</Text>
          <TextInput
            style={styles.input}
            value={form.store}
            onChangeText={(value) => handleFormChange("store", value)}
            placeholder="Ex: Zara, H&M, Amazon..."
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date de livraison prévue</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {form.expectedDate
                ? new Date(form.expectedDate).toLocaleDateString()
                : "Sélectionner une date"}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#7f8c8d" />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Numéro de suivi</Text>
          <TextInput
            style={styles.input}
            value={form.trackingNumber}
            onChangeText={(value) => handleFormChange("trackingNumber", value)}
            placeholder="Ex: FR123456789"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={form.note}
            onChangeText={(value) => handleFormChange("note", value)}
            placeholder="Notes sur la commande..."
            multiline
            numberOfLines={3}
          />
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Articles commandés</Text>

        {form.items.length > 0 && (
          <View style={styles.itemsList}>
            {form.items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDetails}>
                    {item.type}
                    {item.subType ? ` (${item.subType})` : ""} - {item.color}
                  </Text>
                  {item.price > 0 && (
                    <Text style={styles.itemPrice}>{item.price.toFixed(2)} €</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.removeItemButton}
                  onPress={() => removeItemFromOrder(item.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            ))}
            
            {form.items.some(item => item.price > 0) && (
              <View style={styles.totalSection}>
                <Text style={styles.totalText}>
                  Total: {calculateTotal().toFixed(2)} €
                </Text>
              </View>
            )}
          </View>
        )}

        {errors.items && <Text style={styles.errorText}>{errors.items}</Text>}

        <View style={styles.addItemSection}>
          <Text style={styles.addItemTitle}>Ajouter un article</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom de l'article *</Text>
            <TextInput
              style={styles.input}
              value={currentItem.name}
              onChangeText={(value) => handleItemChange("name", value)}
              placeholder="Ex: T-shirt bleu rayé"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Catégorie *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={currentItem.type}
                onValueChange={(value) => handleItemChange("type", value)}
                style={styles.picker}
              >
                <Picker.Item label="Sélectionnez une catégorie" value="" />
                {Object.entries(getMainCategories()).map(([key, label]) => (
                  <Picker.Item key={key} label={label} value={key} />
                ))}
              </Picker>
            </View>
          </View>

          {currentItem.type && Object.keys(subCategories).length > 0 && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sous-catégorie</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={currentItem.subType}
                  onValueChange={(value) => handleItemChange("subType", value)}
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Couleur *</Text>
            <TextInput
              style={styles.input}
              value={currentItem.color}
              onChangeText={(value) => handleItemChange("color", value)}
              placeholder="Ex: Bleu marine"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prix (€)</Text>
            <TextInput
              style={styles.input}
              value={currentItem.price}
              onChangeText={(value) => handleItemChange("price", value)}
              placeholder="Ex: 29.99"
              keyboardType="decimal-pad"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.addItemButton,
              (!currentItem.name.trim() || !currentItem.type || !currentItem.color.trim()) &&
                styles.disabledButton,
            ]}
            onPress={addItemToOrder}
            disabled={!currentItem.name.trim() || !currentItem.type || !currentItem.color.trim()}
          >
            <Ionicons name="add-circle-outline" size={20} color="white" />
            <Text style={styles.addItemButtonText}>Ajouter cet article</Text>
          </TouchableOpacity>
        </View>
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
          style={[styles.submitButton, isLoading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEditing ? "Mettre à jour" : "Créer la commande"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 20,
  },
  formSection: {
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
    color: "#3498db",
    marginBottom: 15,
  },
  inputGroup: {
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
    backgroundColor: "#f9f9f9",
  },
  inputError: {
    borderColor: "#e74c3c",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
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
    backgroundColor: "#f9f9f9",
    overflow: "hidden",
  },
  picker: {
    height: 50,
  },
  dateButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f9f9f9",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#2c3e50",
  },
  itemsList: {
    marginBottom: 20,
  },
  itemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  itemDetails: {
    color: "#7f8c8d",
    fontSize: 14,
    marginBottom: 2,
  },
  itemPrice: {
    color: "#e74c3c",
    fontWeight: "bold",
    fontSize: 14,
  },
  removeItemButton: {
    padding: 8,
  },
  totalSection: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 12,
    alignItems: "flex-end",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  addItemSection: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 20,
  },
  addItemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
  },
  addItemButton: {
    flexDirection: "row",
    backgroundColor: "#2ecc71",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  addItemButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: "#95a5a6",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#95a5a6",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 10,
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#3498db",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 10,
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default OrderFormScreen;