/**
 * Module de notation et feedback
 * Responsable du système de notation des combinaisons
 */

// Importation des dépendances
import { currentCombination, isCombinationGenerated } from './generator.js';
import { history, updateHistory, updateStatistics } from './history.js';
import { showNotification } from './ui.js';
import { saveHistory } from '../utils/storage.js';

/**
 * Gestion de l'état des contrôles de notation
 * @param {boolean} disabled - État de désactivation des contrôles
 */
function disableRatingInputs(disabled) {
  const inputs = document.querySelectorAll('.rating input[type="radio"]');
  if (inputs && inputs.length > 0) {
    inputs.forEach(input => input.disabled = disabled);
  }
  
  const submitButton = document.getElementById('submitRating');
  if (submitButton) {
    submitButton.disabled = disabled;
  }
}

/**
 * Réinitialisation des contrôles de notation
 */
function resetRatingInputs() {
  const inputs = document.querySelectorAll('.rating input[type="radio"]');
  if (inputs && inputs.length > 0) {
    inputs.forEach(input => {
      input.checked = false;
      input.disabled = false;
    });
  }
  
  const feedbackElement = document.getElementById('feedback');
  if (feedbackElement) {
    feedbackElement.innerText = '';
  }
}

/**
 * Traitement du changement de notation
 * @param {Event} event - L'événement de changement
 */
function handleRatingChange(event) {
  if (!isCombinationGenerated) return showNotification("Génère d'abord une combinaison avant de noter !");
  
  const selectedRating = event.target.value;
  const feedback = document.getElementById('feedback');
  if (!feedback) return;
  
  feedback.innerText = selectedRating <= 3 ? "Une combinaison farfelue, non ? Essayons encore..." :
    selectedRating <= 6 ? "Intrigant ! Pas tout à fait clair, mais intéressant." :
    selectedRating <= 8 ? "De la belle matière poétique ici !" :
    "Très réaliste, une combinaison crédible et inspirante !";
}

/**
 * Soumission de la notation
 */
function submitRating() {
  const selectedInput = document.querySelector('.rating input[type="radio"]:checked');
  if (!selectedInput) return showNotification("Merci de choisir une note avant d'envoyer.");

  const selectedRating = parseInt(selectedInput.value);
  const ratedCombination = `${currentCombination} (Note : ${selectedRating}/10)`;

  const resultElement = document.getElementById('result');
  if (resultElement) {
    resultElement.innerText = ratedCombination;
  }
  
  showNotification("Merci pour ta contribution !");
  disableRatingInputs(true);

  // Sauvegarde dans l'historique
  history.push({ text: currentCombination, note: selectedRating });
  saveHistory(history);

  updateHistory();
  updateStatistics();
}

/**
 * Initialisation du module
 */
function initialize() {
  // Initialisation des événements pour la notation
  const ratingInputs = document.querySelectorAll('.rating input[type="radio"]');
  if (ratingInputs && ratingInputs.length > 0) {
    ratingInputs.forEach(input => input.addEventListener('change', handleRatingChange));
  }
  
  // Initialiser le bouton de soumission
  const submitButton = document.getElementById('submitRating');
  if (submitButton) {
    submitButton.addEventListener('click', submitRating);
  }
}

// Exporter les fonctions publiques
export {
  disableRatingInputs,
  resetRatingInputs,
  handleRatingChange,
  submitRating,
  initialize
};