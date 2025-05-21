import React, { useState, useEffect } from "react";
import {
  exportUserData,
  importUserData,
  getOutfits,
  saveOutfits,
  getPendingOrders,
  savePendingOrders,
} from "../utils/dataService";
import {
  getCurrentUserId,
  isCurrentUserAdmin,
  getAuthorizedUsers,
  importUsers,
  exportUsers,
} from "../utils/simpleAuthService";
import "../styles/DataBackup.css";

function DataBackup() {
  const [importStatus, setImportStatus] = useState(null);
  const [exportStatus, setExportStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [exportType, setExportType] = useState("all"); // 'all', 'outfits', 'orders', 'users'

  // Initialiser au chargement
  useEffect(() => {
    const adminStatus = isCurrentUserAdmin();
    setIsAdmin(adminStatus);

    if (adminStatus) {
      const usersList = getAuthorizedUsers();
      setUsers(usersList);
      setSelectedUserId(getCurrentUserId());
    } else {
      setSelectedUserId(getCurrentUserId());
    }
  }, []);

  // Exporter les données complètes
  const handleExportAll = () => {
    setIsLoading(true);
    setExportStatus(null);

    try {
      const userId = isAdmin ? selectedUserId : getCurrentUserId();
      const data = exportUserData(userId);

      // Convertir en JSON et créer un fichier téléchargeable
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);

      const filename =
        isAdmin && selectedUserId !== getCurrentUserId()
          ? `dressing-${selectedUserId}-sauvegarde-${new Date()
              .toISOString()
              .slice(0, 10)}.json`
          : `dressing-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;

      downloadFile(url, filename);

      setExportStatus({
        success: true,
        message: "Sauvegarde exportée avec succès!",
      });
    } catch (error) {
      setExportStatus({
        success: false,
        message: `Erreur lors de l'exportation: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Exporter les tenues
  const handleExportOutfits = () => {
    setIsLoading(true);
    setExportStatus(null);

    try {
      const userId = isAdmin ? selectedUserId : getCurrentUserId();
      const outfits = getOutfits(userId);

      const dataStr = JSON.stringify(
        { outfits, exportDate: new Date().toISOString() },
        null,
        2
      );
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);

      const filename =
        isAdmin && selectedUserId !== getCurrentUserId()
          ? `dressing-${selectedUserId}-tenues-${new Date()
              .toISOString()
              .slice(0, 10)}.json`
          : `dressing-tenues-${new Date().toISOString().slice(0, 10)}.json`;

      downloadFile(url, filename);

      setExportStatus({
        success: true,
        message: `${outfits.length} tenues exportées avec succès!`,
      });
    } catch (error) {
      setExportStatus({
        success: false,
        message: `Erreur lors de l'exportation des tenues: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Exporter les commandes
  const handleExportOrders = () => {
    setIsLoading(true);
    setExportStatus(null);

    try {
      const userId = isAdmin ? selectedUserId : getCurrentUserId();
      const orders = getPendingOrders(userId);

      const dataStr = JSON.stringify(
        { pendingOrders: orders, exportDate: new Date().toISOString() },
        null,
        2
      );
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);

      const filename =
        isAdmin && selectedUserId !== getCurrentUserId()
          ? `dressing-${selectedUserId}-commandes-${new Date()
              .toISOString()
              .slice(0, 10)}.json`
          : `dressing-commandes-${new Date().toISOString().slice(0, 10)}.json`;

      downloadFile(url, filename);

      setExportStatus({
        success: true,
        message: `${orders.length} commandes exportées avec succès!`,
      });
    } catch (error) {
      setExportStatus({
        success: false,
        message: `Erreur lors de l'exportation des commandes: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Exporter les utilisateurs (admin seulement)
  const handleExportUsers = () => {
    if (!isAdmin) return;

    setIsLoading(true);
    setExportStatus(null);

    try {
      const usersList = exportUsers();

      const dataStr = JSON.stringify(
        { users: usersList, exportDate: new Date().toISOString() },
        null,
        2
      );
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);

      downloadFile(
        url,
        `dressing-utilisateurs-${new Date().toISOString().slice(0, 10)}.json`
      );

      setExportStatus({
        success: true,
        message: `${usersList.length} utilisateurs exportés avec succès!`,
      });
    } catch (error) {
      setExportStatus({
        success: false,
        message: `Erreur lors de l'exportation des utilisateurs: ${error.message}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Télécharger un fichier
  const downloadFile = (url, filename) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Importer les données
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const userId = isAdmin ? selectedUserId : getCurrentUserId();

        // Déterminer le type d'importation
        if (data.pendingOrders && !data.outfits && !data.clothes) {
          // Import des commandes uniquement
          savePendingOrders(data.pendingOrders, userId);
          setImportStatus({
            success: true,
            message: `${data.pendingOrders.length} commandes importées avec succès!`,
            details: {
              type: "Commandes",
              count: data.pendingOrders.length,
            },
          });
        } else if (data.outfits && !data.pendingOrders && !data.clothes) {
          // Import des tenues uniquement
          saveOutfits(data.outfits, userId);
          setImportStatus({
            success: true,
            message: `${data.outfits.length} tenues importées avec succès!`,
            details: {
              type: "Tenues",
              count: data.outfits.length,
            },
          });
        } else if (data.users && isAdmin) {
          // Import des utilisateurs (admin seulement)
          try {
            const result = importUsers(data.users);

            if (result) {
              setImportStatus({
                success: true,
                message: `${data.users.length} utilisateurs importés avec succès! La page va se recharger.`,
                details: {
                  type: "Utilisateurs",
                  count: data.users.length,
                },
              });

              // Recharger la page après 2 secondes pour prendre en compte les changements
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            } else {
              throw new Error("Échec de l'importation des utilisateurs.");
            }
          } catch (error) {
            setImportStatus({
              success: false,
              message: `Erreur lors de l'importation des utilisateurs: ${error.message}`,
            });
          }
        } else if (data.clothes || data.outfits || data.pendingOrders) {
          // Import complet
          const result = importUserData(data, userId);

          if (result) {
            setImportStatus({
              success: true,
              message:
                "Données importées avec succès! La page va se recharger.",
              details: {
                vetements: data.clothes?.length || 0,
                tenues: data.outfits?.length || 0,
                commandes: data.pendingOrders?.length || 0,
              },
            });

            // Recharger la page après 2 secondes
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          } else {
            throw new Error("Échec de l'importation des données.");
          }
        } else {
          throw new Error(
            "Format de fichier non reconnu ou données invalides."
          );
        }
      } catch (error) {
        setImportStatus({
          success: false,
          message: `Erreur lors de l'importation: ${error.message}`,
        });
      } finally {
        setIsLoading(false);
        // Réinitialiser le champ de fichier
        event.target.value = "";
      }
    };

    reader.onerror = () => {
      setImportStatus({
        success: false,
        message: "Erreur lors de la lecture du fichier.",
      });
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  // Gérer le changement d'utilisateur (admin seulement)
  const handleUserChange = (e) => {
    setSelectedUserId(e.target.value);
  };

  // Gérer le changement de type d'exportation
  const handleExportTypeChange = (e) => {
    setExportType(e.target.value);
  };

  // Exécuter l'exportation en fonction du type sélectionné
  const handleExport = () => {
    switch (exportType) {
      case "all":
        handleExportAll();
        break;
      case "outfits":
        handleExportOutfits();
        break;
      case "orders":
        handleExportOrders();
        break;
      case "users":
        handleExportUsers();
        break;
      default:
        handleExportAll();
    }
  };

  return (
    <div className="data-backup-container">
      <h2>Sauvegarde et Restauration des Données</h2>

      {isAdmin && (
        <div className="admin-section">
          <h3>Administration des données</h3>
          <p>
            En tant qu'administrateur, vous pouvez gérer les données de tous les
            utilisateurs.
          </p>

          <div className="user-selector">
            <label htmlFor="user-select">Sélectionner un utilisateur:</label>
            <select
              id="user-select"
              value={selectedUserId}
              onChange={handleUserChange}
              className="user-select"
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} {user.id === getCurrentUserId() ? "(Vous)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="backup-section">
        <div className="backup-card export-card">
          <h3>Exporter des données</h3>
          <p>
            Téléchargez une sauvegarde de vos données sous forme de fichier
            JSON. Vous pourrez utiliser ce fichier pour restaurer vos données
            ultérieurement.
          </p>

          <div className="export-options">
            <label htmlFor="export-type">Type d'exportation:</label>
            <select
              id="export-type"
              value={exportType}
              onChange={handleExportTypeChange}
              className="export-type-select"
            >
              <option value="all">Données complètes</option>
              <option value="outfits">Tenues uniquement</option>
              <option value="orders">Commandes uniquement</option>
              {isAdmin && (
                <option value="users">Utilisateurs uniquement</option>
              )}
            </select>
          </div>

          <button
            className="export-btn"
            onClick={handleExport}
            disabled={isLoading}
          >
            {isLoading ? "Exportation en cours..." : "Exporter"}
          </button>

          {exportStatus && (
            <div
              className={`status-message ${
                exportStatus.success ? "success" : "error"
              }`}
            >
              {exportStatus.message}
            </div>
          )}
        </div>

        <div className="backup-card import-card">
          <h3>Restaurer des données</h3>
          <p>
            Importez une sauvegarde précédemment exportée pour restaurer vos
            données. Le système détectera automatiquement le type de données
            dans le fichier.
          </p>
          <div className="import-warning">
            <strong>Attention:</strong> L'importation remplacera les données
            existantes du même type!
          </div>
          <label className="import-label">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={isLoading}
              className="import-input"
            />
            <span className="import-btn">
              {isLoading
                ? "Importation en cours..."
                : "Importer une sauvegarde"}
            </span>
          </label>

          {importStatus && (
            <div
              className={`status-message ${
                importStatus.success ? "success" : "error"
              }`}
            >
              {importStatus.message}

              {importStatus.success && importStatus.details && (
                <div className="import-details">
                  <p>Résumé des données importées:</p>
                  {importStatus.details.type ? (
                    <p>
                      {importStatus.details.count} {importStatus.details.type}
                    </p>
                  ) : (
                    <ul>
                      {importStatus.details.vetements > 0 && (
                        <li>{importStatus.details.vetements} vêtements</li>
                      )}
                      {importStatus.details.tenues > 0 && (
                        <li>{importStatus.details.tenues} tenues</li>
                      )}
                      {importStatus.details.commandes > 0 && (
                        <li>{importStatus.details.commandes} commandes</li>
                      )}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="backup-tips">
        <h3>Conseils de sauvegarde</h3>
        <ul>
          <li>Exportez régulièrement vos données pour éviter toute perte.</li>
          <li>Conservez votre fichier de sauvegarde dans un endroit sûr.</li>
          <li>
            Si vous utilisez plusieurs appareils, exportez et importez vos
            données pour les synchroniser.
          </li>
          <li>
            En navigation privée, vos données seront perdues à la fermeture du
            navigateur. Pensez à les exporter avant!
          </li>
          {isAdmin && (
            <li>
              <strong>Admin:</strong> Vous pouvez exporter/importer les données
              de n'importe quel utilisateur.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default DataBackup;
