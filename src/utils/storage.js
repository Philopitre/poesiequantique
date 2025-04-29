/**
 * Module d'abstraction du localStorage pour la gestion des données persistantes
 * Facilite l'accès, la sauvegarde et la manipulation des données stockées
 */

// Vérification de disponibilité du localStorage
const isLocalStorageAvailable = (() => {
  try {
    const test = 'test';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    console.warn('localStorage n\'est pas disponible dans cet environnement');
    return false;
  }
})();

// Implémentation d'un fallback en mémoire si localStorage n'est pas disponible
const memoryStorage = new Map();

// Clés de stockage - centralisées pour faciliter la gestion
const STORAGE_KEYS = {
  HISTORY: 'generateur_history',
  SELECTED_WORDS: 'generateur_selected_words',
  USER_PREFERENCES: 'generateur_preferences'
};

/**
 * Sauvegarde des données dans le stockage
 * @param {string} key - Clé de stockage
 * @param {any} data - Données à stocker (seront converties en JSON)
 * @returns {boolean} - Succès de l'opération
 */
function saveToStorage(key, data) {
  try {
    const serializedData = JSON.stringify(data);
    
    if (isLocalStorageAvailable) {
      localStorage.setItem(key, serializedData);
    } else {
      memoryStorage.set(key, serializedData);
    }
    return true;
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde des données (${key}):`, error);
    return false;
  }
}

/**
 * Récupération des données depuis le stockage
 * @param {string} key - Clé de stockage à récupérer
 * @param {any} defaultValue - Valeur par défaut si aucune donnée n'est trouvée
 * @returns {any} Les données récupérées ou la valeur par défaut
 */
function loadFromStorage(key, defaultValue = null) {
  try {
    let data;
    
    if (isLocalStorageAvailable) {
      data = localStorage.getItem(key);
    } else {
      data = memoryStorage.get(key);
    }
    
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Erreur lors de la récupération des données (${key}):`, error);
    return defaultValue;
  }
}

/**
 * Alias pour loadFromStorage pour maintenir la compatibilité avec l'ancien code
 * @param {string} key - Clé de stockage à récupérer
 * @param {any} defaultValue - Valeur par défaut si aucune donnée n'est trouvée
 * @returns {any} Les données récupérées ou la valeur par défaut
 */
function getFromStorage(key, defaultValue = null) {
  return loadFromStorage(key, defaultValue);
}

/**
 * Suppression des données du stockage
 * @param {string} key - Clé de stockage à supprimer
 * @returns {boolean} - Succès de l'opération
 */
function removeFromStorage(key) {
  try {
    if (isLocalStorageAvailable) {
      localStorage.removeItem(key);
    } else {
      memoryStorage.delete(key);
    }
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression des données (${key}):`, error);
    return false;
  }
}

/**
 * Vérifie si une clé existe dans le stockage
 * @param {string} key - Clé à vérifier
 * @returns {boolean} Vrai si la clé existe
 */
function hasStorageItem(key) {
  if (isLocalStorageAvailable) {
    return localStorage.getItem(key) !== null;
  } else {
    return memoryStorage.has(key);
  }
}

/**
 * Efface toutes les données du stockage
 * @returns {boolean} - Succès de l'opération
 */
function clearAllStorage() {
  try {
    if (isLocalStorageAvailable) {
      localStorage.clear();
    } else {
      memoryStorage.clear();
    }
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de toutes les données:', error);
    return false;
  }
}

/**
 * Fonctions spécifiques pour gérer l'historique
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
  return loadFromStorage(STORAGE_KEYS.HISTORY, null);
}

/**
 * Effacement de l'historique
 * @returns {boolean} - Succès de l'opération
 */
function clearHistory() {
  return removeFromStorage(STORAGE_KEYS.HISTORY);
}

/**
 * Fonctions pour les mots sélectionnés
 */
function saveSelectedWords(words) {
  return saveToStorage(STORAGE_KEYS.SELECTED_WORDS, words);
}

function loadSelectedWords() {
  return loadFromStorage(STORAGE_KEYS.SELECTED_WORDS, []);
}

/**
 * Fonctions pour les préférences utilisateur
 */
function saveUserPreferences(prefs) {
  return saveToStorage(STORAGE_KEYS.USER_PREFERENCES, prefs);
}

function loadUserPreferences() {
  return loadFromStorage(STORAGE_KEYS.USER_PREFERENCES, {});
}

// API publique du module
export {
  // Constants
  STORAGE_KEYS,
  
  // Fonctions de base
  saveToStorage,
  loadFromStorage,
  getFromStorage,  // Alias pour la compatibilité
  removeFromStorage,
  hasStorageItem,
  clearAllStorage,
  
  // Fonctions spécifiques pour l'historique
  saveHistory,
  loadHistory,
  clearHistory,
  
  // Fonctions pour les mots sélectionnés
  saveSelectedWords,
  loadSelectedWords,
  
  // Fonctions pour les préférences utilisateur
  saveUserPreferences,
  loadUserPreferences
};