// ================================================================
// Utilitaire de gestion du stockage local - Version de compatibilité
// ================================================================

/**
 * Ce module est maintenu pour la compatibilité avec le code existant.
 * Il réexporte simplement les fonctions du module storage.js pour éviter
 * les duplications et maintenir la cohérence.
 * 
 * IMPORTANT: Pour les nouveaux développements, utilisez directement 
 * les fonctions de storage.js
 */

import {
  STORAGE_KEYS,
  saveToStorage,
  getFromStorage, // Nous utilisons cette fonction au lieu de loadFromStorage pour la compatibilité
  removeFromStorage,
  hasStorageItem,
  clearAllStorage
} from './storage.js';

// Réexportation des fonctions pertinentes
export {
  STORAGE_KEYS,
  saveToStorage,
  getFromStorage,
  removeFromStorage,
  hasStorageItem,
  clearAllStorage
};