/**
 * Module d'abstraction du localStorage pour la gestion des données persistantes
 * Facilite l'accès, la sauvegarde et la manipulation des données stockées
 */

// Clés de stockage
const STORAGE_KEYS = {
  HISTORY: 'history'
};

/**
* Sauvegarde des données dans le localStorage
* @param {string} key - Clé de stockage
* @param {any} data - Données à stocker (seront converties en JSON)
* @returns {boolean} - Succès de l'opération
*/
function saveToStorage(key, data) {
try {
  localStorage.setItem(key, JSON.stringify(data));
  return true;
} catch (error) {
  console.error(`Erreur lors de la sauvegarde des données (${key}):`, error);
  return false;
}
}

/**
* Récupération des données depuis le localStorage
* @param {string} key - Clé de stockage à récupérer
* @param {any} defaultValue - Valeur par défaut si aucune donnée n'est trouvée
* @returns {any} Les données récupérées ou la valeur par défaut
*/
function loadFromStorage(key, defaultValue = null) {
try {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
} catch (error) {
  console.error(`Erreur lors de la récupération des données (${key}):`, error);
  return defaultValue;
}
}

/**
* Alias pour loadFromStorage pour maintenir la compatibilité avec utils.js
* @param {string} key - Clé de stockage à récupérer
* @param {any} defaultValue - Valeur par défaut si aucune donnée n'est trouvée
* @returns {any} Les données récupérées ou la valeur par défaut
*/
function getFromStorage(key, defaultValue = null) {
return loadFromStorage(key, defaultValue);
}

/**
* Suppression des données du localStorage
* @param {string} key - Clé de stockage à supprimer
* @returns {boolean} - Succès de l'opération
*/
function removeFromStorage(key) {
try {
  localStorage.removeItem(key);
  return true;
} catch (error) {
  console.error(`Erreur lors de la suppression des données (${key}):`, error);
  return false;
}
}

/**
* Vérifie si une clé existe dans le localStorage
* @param {string} key - Clé à vérifier
* @returns {boolean} Vrai si la clé existe
*/
function hasStorageItem(key) {
return localStorage.getItem(key) !== null;
}

/**
* Efface toutes les données du localStorage
* @returns {boolean} - Succès de l'opération
*/
function clearAllStorage() {
try {
  localStorage.clear();
  return true;
} catch (error) {
  console.error('Erreur lors de la suppression de toutes les données:', error);
  return false;
}
}

/**
* Fonctions pour maintenir la compatibilité avec l'ancien code
*/

/**
* Sauvegarde de l'historique
* @param {Array} data - Données d'historique à sauvegarder
* @returns {boolean} - Succès de l'opération
*/
function saveHistory(data) {
return saveToStorage(STORAGE_KEYS.HISTORY, data);
}

/**
* Chargement de l'historique
* @returns {Array|null} Les données d'historique ou null si aucune donnée n'est trouvée
*/
function loadHistory() {
// Retourner null au lieu d'un tableau vide pour permettre une détection explicite
// de l'absence d'historique dans le module history.js
return loadFromStorage(STORAGE_KEYS.HISTORY, null);
}

/**
* Effacement de l'historique
* @returns {boolean} - Succès de l'opération
*/
function clearHistory() {
return removeFromStorage(STORAGE_KEYS.HISTORY);
}

// API publique du module
export {
STORAGE_KEYS,
saveToStorage,
loadFromStorage,
getFromStorage,  // Alias pour la compatibilité
removeFromStorage,
hasStorageItem,
clearAllStorage,
// Fonctions pour la compatibilité
saveHistory,
loadHistory,
clearHistory
};