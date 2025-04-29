/**
 * Module de gestion des mots et de leur sélection
 * Responsable de la gestion des mots disponibles et de leur état de sélection
 */

// Collection des mots disponibles pour les combinaisons
const words = [
  "Je", "suis", "rêveur", "professionnel", "dans", "mon", "métier",
  "exceptionnel", "l'erreur", "en", "tout", "genre", "est", "proscrite",
  "la", "souveraine", "intelligence", "pour", "moi-même", "grandissant"
];

// Gestion des mots sélectionnés pour la génération
let selectedWords = [...words]; // Initialisation avec tous les mots au départ

/**
 * Gestion de la visibilité des mots avec animation et sélection pour la génération
 * @param {HTMLElement} element - L'élément DOM du mot à basculer
 */
function toggleWordVisibility(element) {
  element.classList.add('word-toggling');
  
  setTimeout(() => {
    element.classList.toggle('word-hidden');
    
    // Logique de sélection/désélection pour la génération
    const word = element.textContent;
    if (element.classList.contains('word-hidden')) {
      // Si le mot est caché/désactivé, le retirer de la sélection
      const index = selectedWords.indexOf(word);
      if (index > -1) {
        selectedWords.splice(index, 1);
      }
    } else {
      // Si le mot est visible/actif, l'ajouter à la sélection
      if (!selectedWords.includes(word)) {
        selectedWords.push(word);
      }
    }
    
    // Mise à jour de l'interface pour indiquer le nombre de mots sélectionnés
    updateSelectedWordsCount();
    
    element.classList.remove('word-toggling');
  }, 150);
  
  // Effet sonore du clic
  const sound = document.getElementById('typewriterSound');
  if (sound) {
    // Vérification plus robuste avant de jouer le son
    if (typeof sound.play === 'function') {
      try {
        sound.currentTime = 0;
        sound.play().catch(err => console.log('Audio playback error:', err));
      } catch (err) {
        console.log('Audio playback error:', err);
      }
    }
  }
}

/**
 * Fonction pour mettre à jour le compteur de mots sélectionnés
 */
function updateSelectedWordsCount() {
  const countElement = document.getElementById('selectedWordsCount');
  if (countElement) {
    countElement.textContent = selectedWords.length;
  }
}

/**
 * Réinitialisation de tous les mots avec effet cascade
 */
function resetAllWords() {
  const hiddenWords = document.querySelectorAll('.word-hidden');
  
  // Réinitialiser la liste des mots sélectionnés
  selectedWords = [...words]; // Par défaut, tous les mots sont sélectionnés
  
  hiddenWords.forEach((word, index) => {
    setTimeout(() => {
      word.classList.add('word-toggling');
      setTimeout(() => {
        word.classList.remove('word-hidden');
        word.classList.remove('word-toggling');
      }, 150);
    }, index * 100);
  });
  
  // Mettre à jour le compteur de mots
  updateSelectedWordsCount();
  
  if (hiddenWords.length > 0) {
    // Import depuis ui.js
    import('./ui.js').then(ui => {
      ui.showNotification("Tous les mots ont été réinitialisés !");
    });
  }
}

/**
 * Ajouter un compteur de mots sélectionnés à l'UI
 */
function addSelectedWordsCounter() {
  const wordListContainer = document.querySelector('.full-word-list');
  if (wordListContainer) {
    const counterDiv = document.createElement('div');
    counterDiv.className = 'selected-words-counter';
    counterDiv.innerHTML = 'Mots sélectionnés: <span id="selectedWordsCount">' + selectedWords.length + '</span>';
    wordListContainer.parentNode.insertBefore(counterDiv, wordListContainer.nextSibling);
  }
}

/**
 * Initialisation du module
 */
function initialize() {
  addSelectedWordsCounter();
}

// Exporter les fonctions et variables publiques
export {
  words,
  selectedWords,
  toggleWordVisibility,
  resetAllWords,
  updateSelectedWordsCount,
  initialize
};