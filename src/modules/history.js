/**
 * Module de gestion de l'historique et des statistiques
 * Responsable de l'affichage et de la manipulation de l'historique des combinaisons
 */

// Importation des dépendances
import { exportTXT, exportPDF } from './export.js';
import { showNotification } from './ui.js';
import { loadHistory, saveHistory, clearHistory } from '../utils/storage.js';

// Récupération de l'historique depuis le localStorage
// On vérifie explicitement que le résultat est bien un tableau non vide
let history = loadHistory();
// Vérification plus stricte pour s'assurer que history est un tableau non-null avec au moins un élément
if (!history || !Array.isArray(history) || history.length === 0) {
  history = [];
}

/**
 * Animation d'un élément statistique
 * @param {string} elementId - L'ID de l'élément à animer
 * @param {string} text - Le texte à afficher
 */
function animateStatistic(elementId, text) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  element.innerText = text;
  element.classList.add('animate');
  setTimeout(() => element.classList.remove('animate'), 300);
}

/**
 * Mise à jour des statistiques avec animation
 */
function updateStatistics() {
  const total = history.length;
  
  // Si l'historique est vide, afficher des tirets pour toutes les statistiques
  if (total === 0) {
    animateStatistic('totalCombinations', `Total des combinaisons notées : 0`);
    animateStatistic('averageNote', `Note moyenne : -`);
    animateStatistic('bestNote', `Meilleure note : -`);
    animateStatistic('worstNote', `Pire note : -`);
    return;
  }
  
  const notes = history.map(entry => entry.note);
  const sum = notes.reduce((a, b) => a + b, 0);
  const average = (sum / total).toFixed(2);
  const best = Math.max(...notes);
  const worst = Math.min(...notes);

  animateStatistic('totalCombinations', `Total des combinaisons notées : ${total}`);
  animateStatistic('averageNote', `Note moyenne : ${average}`);
  animateStatistic('bestNote', `Meilleure note : ${best}`);
  animateStatistic('worstNote', `Pire note : ${worst}`);
}

/**
 * Mise à jour de l'affichage de l'historique
 */
function updateHistory() {
  const historyContainer = document.getElementById('history');
  if (!historyContainer) return;
  
  // Préservation des éléments statiques
  const h3 = historyContainer.querySelector('h3');
  const staticHTML = h3 ? h3.outerHTML : '<h3>Historique des combinaisons :</h3>';
  
  historyContainer.innerHTML = staticHTML;

  // Ajout des entrées d'historique
  if (history.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.textContent = 'Aucune combinaison notée pour le moment.';
    emptyMessage.style.fontStyle = 'italic';
    emptyMessage.style.color = '#777';
    historyContainer.appendChild(emptyMessage);
    return;
  }

  history.forEach((entry, index) => {
    const div = document.createElement('div');
    div.textContent = `${index + 1}. ${entry.text} (Note : ${entry.note}/10)`;
    historyContainer.appendChild(div);
  });

  // Ajout des contrôles d'historique si nécessaire
  if (history.length > 0) {
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.marginTop = '10px';

    const createButton = (text, handler) => {
      const button = document.createElement('button');
      button.textContent = text;
      button.onclick = handler;
      buttonsContainer.appendChild(button);
    };

    createButton('⬆️', sortHistoryUp);
    createButton('⬇️', sortHistoryDown);
    createButton('🎲', randomizeSortHistory);
    createButton('Exporter TXT 📄', exportTXT);
    createButton('Exporter PDF 🖨️', exportPDF);

    historyContainer.appendChild(buttonsContainer);
    
    // Bouton de réinitialisation
    const resetButton = document.createElement('button');
    resetButton.id = 'resetCacheButton';
    resetButton.textContent = 'Reset du cache ♻️';
    resetButton.onclick = resetCache;
    historyContainer.appendChild(resetButton);
  }
}

/**
 * Initialisation du bouton de réinitialisation du cache 
 */
function initializeResetCacheButton() {
  const container = document.getElementById('history');
  if (!container) return;
  
  const existingButton = document.getElementById('resetCacheButton');
  
  if (!existingButton && history.length > 0) {
    const resetButton = document.createElement('button');
    resetButton.id = 'resetCacheButton';
    resetButton.textContent = 'Reset du cache ♻️';
    resetButton.onclick = resetCache;
    container.appendChild(resetButton);
  } 
  else if (existingButton) {
    existingButton.onclick = resetCache;
  }
}

/**
 * Fonctions de tri de l'historique
 */
function sortHistoryUp() {
  history.sort((a, b) => a.note - b.note);
  updateHistory();
}

function sortHistoryDown() {
  history.sort((a, b) => b.note - a.note);
  updateHistory();
}

function randomizeSortHistory() {
  history.sort(() => Math.random() - 0.5);
  updateHistory();
}

/**
 * Réinitialisation complète du cache
 */
function resetCache() {
  if (confirm("Veux-tu vraiment réinitialiser le cache ? Cela effacera toutes les données enregistrées.")) {
    clearHistory();
    history = [];
    updateHistory();
    updateStatistics();
    showNotification("Le cache a été réinitialisé avec succès!");
  }
}

/**
 * Initialisation du module
 */
function initialize() {
  updateHistory();
  updateStatistics();
  initializeResetCacheButton();
}

// Exporter les fonctions et variables publiques
export {
  history,
  updateHistory,
  updateStatistics,
  initialize,
  sortHistoryUp,
  sortHistoryDown,
  randomizeSortHistory,
  resetCache
};