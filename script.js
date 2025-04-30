// script.js — Point d'entrée principal de l'application
import { generateCombination, generateWithSelectedOnly } from './src/modules/generator.js';
import { submitRating } from './src/modules/rating.js';
import { 
  sortHistoryUp, 
  sortHistoryDown, 
  randomizeSortHistory, 
  resetCache 
} from './src/modules/history.js';
import { exportTXT, exportPDF, generateImage } from './src/modules/export.js';
import { 
  shareText, 
  shareOnTwitter, 
  shareOnFacebook, 
  shareOnWhatsApp, 
  shareByEmail,
  copyToClipboard,
  shareOn
} from './src/modules/sharing.js';
import { showNotification, showError } from './src/modules/ui.js';
import { 
  toggleWordVisibility, 
  resetAllWords 
} from './src/modules/wordManager.js';
import { saveToStorage, loadFromStorage, removeFromStorage } from './src/utils/storage.js';

// Attachement global (nécessaire pour les appels HTML onclick)
window.generateCombination = generateCombination;
window.generateWithSelectedOnly = generateWithSelectedOnly;
window.submitRating = submitRating;
window.sortHistoryUp = sortHistoryUp;
window.sortHistoryDown = sortHistoryDown;
window.randomizeSortHistory = randomizeSortHistory;
window.resetCache = resetCache;
window.exportTXT = exportTXT;
window.exportPDF = exportPDF;
window.generateImage = generateImage;
window.toggleWordVisibility = toggleWordVisibility;
window.resetAllWords = resetAllWords;

// Fonctions de partage
window.shareText = shareText;
window.shareOnTwitter = shareOnTwitter;
window.shareOnFacebook = shareOnFacebook;
window.shareOnWhatsApp = shareOnWhatsApp;
window.shareByEmail = shareByEmail;
window.shareOn = shareOn;
window.copyToClipboard = copyToClipboard;