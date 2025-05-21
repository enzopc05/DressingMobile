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
  getPendingOrders,
  deletePendingOrder,
  receiveOrder,
} from "../utils/dataService";
import { getCurrentUserId } from "../utils/simpleAuthService";

function PendingOrdersScreen({ navigation }) {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [receivedOrders, setReceivedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Charger les commandes
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const userId = getCurrentUserId();
        const allOrders = await getPendingOrders(userId);

        // Séparer les commandes en attente et reçues
        const pending = allOrders.filter((order) => order.status === "pending");
        const received = allOrders.filter(
          (order) => order.status === "received"
        );

        setPendingOrders(pending);
        setReceivedOrders(received);
      } catch (error) {
        console.error("Erreur de chargement des commandes:", error);
        Alert.alert("Erreur", "Impossible de charger les commandes");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();

    // Ajouter un écouteur pour recharger les commandes après une modification
    const unsubscribe = navigation.addListener("focus", loadOrders);

    return unsubscribe;
  }, [navigation]);

  // Gérer l'ajout d'une nouvelle commande
  const handleAddOrder = () => {
    // Version simplifiée - Dans une vraie app, naviguez vers un écran de formulaire
    Alert.alert(
      "Fonctionnalité simplifiée",
      "Cette fonctionnalité n'est pas disponible dans cette version simplifiée"
    );
  };

  // Gérer la suppression d'une commande
  const handleDeleteOrder = async (orderId) => {
    Alert.alert(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer cette commande ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              const userId = getCurrentUserId();
              const success = await deletePendingOrder(orderId, userId);

              if (success) {
                setPendingOrders(
                  pendingOrders.filter((order) => order.id !== orderId)
                );
              }
            } catch (error) {
              console.error(
                "Erreur lors de la suppression de la commande:",
                error
              );
              Alert.alert("Erreur", "Impossible de supprimer la commande");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Gérer la réception d'une commande
  const handleReceiveOrder = async (orderId) => {
    Alert.alert(
      "Confirmer la réception",
      "Confirmer la réception de cette commande ? Les vêtements seront ajoutés à votre dressing.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          onPress: async () => {
            try {
              setLoading(true);
              const userId = getCurrentUserId();
              const result = await receiveOrder(orderId, userId);

              if (result.success) {
                // Recharger les commandes
                const allOrders = await getPendingOrders(userId);
                const pending = allOrders.filter(
                  (order) => order.status === "pending"
                );
                const received = allOrders.filter(
                  (order) => order.status === "received"
                );

                setPendingOrders(pending);
                setReceivedOrders(received);

                Alert.alert("Succès", result.message);
              } else {
                Alert.alert(
                  "Erreur",
                  result.message || "Une erreur est survenue"
                );
              }
            } catch (error) {
              console.error(
                "Erreur lors de la réception de la commande:",
                error
              );
              Alert.alert("Erreur", "Impossible de recevoir la commande");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Gérer l'expansion d'une commande pour voir les détails
  const toggleOrderExpansion = (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  // Formater le prix
  const formatPrice = (price) => {
    if (price === undefined || price === null) return "";
    return `${price.toFixed(2)} €`;
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Calculer le prix total d'une commande
  const calculateOrderTotal = (order) => {
    return order.items.reduce((total, item) => total + (item.price || 0), 0);
  };

  // Rendu d'une commande
  const renderOrderItem = ({ item, isPending }) => (
    <View style={styles.orderCard}>
      <TouchableOpacity
        style={styles.orderHeader}
        onPress={() => toggleOrderExpansion(item.id)}
      >
        <View style={styles.orderTitleSection}>
          <Text style={styles.orderName}>{item.name}</Text>
          <View style={styles.orderMeta}>
            {item.store && <Text style={styles.storeText}>{item.store}</Text>}
            <Text style={styles.itemCount}>{item.items.length} articles</Text>
            <Text style={styles.totalPrice}>
              {formatPrice(calculateOrderTotal(item))}
            </Text>
          </View>
        </View>
        <View style={styles.orderDateSection}>
          {isPending ? (
            item.expectedDate ? (
              <Text style={styles.dateText}>
                Livraison prévue: {formatDate(item.expectedDate)}
              </Text>
            ) : (
              <Text style={styles.dateText}>
                Date créée: {formatDate(item.createdAt)}
              </Text>
            )
          ) : (
            <Text style={styles.dateText}>
              Reçue le: {formatDate(item.receivedAt)}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {expandedOrderId === item.id && (
        <View style={styles.orderDetails}>
          <View style={styles.orderItemsSection}>
            <Text style={styles.sectionTitle}>
              Articles ({item.items.length})
            </Text>
            <FlatList
              data={item.items}
              keyExtractor={(itemData, index) => `${item.id}-${index}`}
              renderItem={({ item: orderItem }) => (
                <View style={styles.orderItem}>
                  <Text style={styles.orderItemName}>{orderItem.name}</Text>
                  <Text style={styles.orderItemDetails}>
                    {orderItem.type}
                    {orderItem.subType ? ` (${orderItem.subType})` : ""},
                    {orderItem.color}
                  </Text>
                  {orderItem.price !== undefined && (
                    <Text style={styles.orderItemPrice}>
                      {formatPrice(orderItem.price)}
                    </Text>
                  )}
                </View>
              )}
              style={styles.orderItemsList}
            />
          </View>

          {item.note && (
            <View style={styles.orderNoteSection}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.noteText}>{item.note}</Text>
            </View>
          )}

          {item.trackingNumber && (
            <View style={styles.orderTrackingSection}>
              <Text style={styles.sectionTitle}>Numéro de suivi</Text>
              <Text style={styles.trackingText}>{item.trackingNumber}</Text>
            </View>
          )}

          {isPending && (
            <View style={styles.orderActions}>
              <TouchableOpacity
                style={styles.receiveButton}
                onPress={() => handleReceiveOrder(item.id)}
              >
                <Text style={styles.buttonText}>Marquer comme reçue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteOrder(item.id)}
              >
                <Text style={styles.buttonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );

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
        <Text style={styles.title}>Commandes en attente</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddOrder}>
          <Text style={styles.buttonText}>Nouvelle commande</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pendingOrdersSection}>
        {pendingOrders.length > 0 ? (
          <FlatList
            data={pendingOrders}
            renderItem={({ item }) =>
              renderOrderItem({ item, isPending: true })
            }
            keyExtractor={(item) => item.id}
            style={styles.ordersList}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Vous n'avez pas de commandes en attente.
            </Text>
          </View>
        )}
      </View>

      {receivedOrders.length > 0 && (
        <View style={styles.receivedOrdersSection}>
          <Text style={styles.sectionTitle}>Commandes reçues récemment</Text>
          <FlatList
            data={receivedOrders.slice(0, 5)}
            renderItem={({ item }) =>
              renderOrderItem({ item, isPending: false })
            }
            keyExtractor={(item) => item.id}
            style={styles.ordersList}
          />
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
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  addButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  pendingOrdersSection: {
    flex: 1,
  },
  ordersList: {
    flex: 1,
  },
  emptyContainer: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyText: {
    color: "#7f8c8d",
    fontStyle: "italic",
    textAlign: "center",
  },
  receivedOrdersSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#2c3e50",
  },
  orderCard: {
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    padding: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderTitleSection: {
    flex: 1,
  },
  orderName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#2c3e50",
  },
  orderMeta: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  storeText: {
    fontWeight: "bold",
    color: "#3498db",
    marginRight: 10,
  },
  itemCount: {
    color: "#7f8c8d",
    marginRight: 10,
  },
  totalPrice: {
    fontWeight: "bold",
    color: "#e74c3c",
  },
  orderDateSection: {
    marginLeft: 10,
  },
  dateText: {
    color: "#7f8c8d",
    fontSize: 14,
  },
  orderDetails: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  orderItemsSection: {
    marginBottom: 15,
  },
  orderItemsList: {
    maxHeight: 300,
  },
  orderItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  orderItemName: {
    fontWeight: "bold",
    marginBottom: 5,
  },
  orderItemDetails: {
    color: "#7f8c8d",
    fontSize: 14,
  },
  orderItemPrice: {
    fontWeight: "bold",
    color: "#e74c3c",
    marginTop: 5,
  },
  orderNoteSection: {
    marginBottom: 15,
  },
  noteText: {
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
  },
  orderTrackingSection: {
    marginBottom: 15,
  },
  trackingText: {
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
    fontFamily: "monospace",
  },
  orderActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  receiveButton: {
    flex: 1,
    backgroundColor: "#2ecc71",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginRight: 5,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#e74c3c",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginLeft: 5,
  },
});

export default PendingOrdersScreen;
