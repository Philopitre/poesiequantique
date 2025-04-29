/**
 * Module de génération de combinaisons
 * Responsable de la génération aléatoire des combinaisons de mots
 */

// Importation des dépendances
import { words, selectedWords } from './wordManager.js';
import { disableRatingInputs, resetRatingInputs } from './rating.js';
import { showNotification } from './ui.js';

// Variables d'état
let isCombinationGenerated = false;
let currentCombination = '';
let typingAnimation = null;

/**
 * Animation de l'affichage du résultat avec effet machine à écrire
 * @param {string} text - Le texte à animer
 * @returns {Promise} - Promise qui se résout quand l'animation est terminée
 */
function animateResult(text) {
  return new Promise(resolve => {
    const result = document.getElementById('result');
    if (!result) {
      resolve();
      return;
    }
    
    // Annuler toute animation en cours
    if (typingAnimation) {
      clearTimeout(typingAnimation);
      typingAnimation = null;
    }
    
    result.innerHTML = '';
    let index = 0;
    
    const sound = document.getElementById('typewriterSound');
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    cursor.textContent = '|';
    result.appendChild(cursor);

    // Pré-charger le son pour éviter les délais
    if (sound && typeof sound.load === 'function') {
      try {
        sound.load();
      } catch (err) {
        console.log('Audio preload error:', err);
      }
    }

    function typeLetter() {
      if (index < text.length) {
        cursor.insertAdjacentText('beforebegin', text[index]);
        if (text[index] !== ' ' && sound) {
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
        index++;
        typingAnimation = setTimeout(typeLetter, 80);
      } else {
        cursor.classList.add('blink');
        typingAnimation = null;
        resolve();
      }
    }

    typeLetter();
  });
}

/**
 * Capitalise une phrase correctement
 * @param {string[]} wordsArray - Tableau de mots à formater
 * @returns {string[]} - Tableau de mots formatés
 */
function formatSentence(wordsArray) {
  return wordsArray.map((word, index) => 
    index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : 
    word === "Je" ? "je" : word
  );
}

/**
 * Méthode commune pour finaliser la génération
 * @param {string} combination - La combinaison générée
 */
async function finalizeCombination(combination) {
  currentCombination = combination;
  await animateResult(currentCombination);

  disableRatingInputs(false);
  isCombinationGenerated = true;
  resetRatingInputs();
  
  const feedbackElement = document.getElementById('feedback');
  if (feedbackElement) {
    feedbackElement.innerText = '';
  }
}

/**
 * Fonction pour générer avec un nombre spécifique de mots aléatoires
 * parmi tous les mots disponibles
 */
function generateCombination() {
  const selectElement = document.getElementById('wordCount');
  if (!selectElement) return;
  
  // Vérifier que des mots sont disponibles
  if (words.length === 0) {
    return showNotification("Aucun mot n'est disponible !");
  }
  
  const selectedValue = selectElement.value;
  const count = selectedValue === 'surprise' ? Math.floor(Math.random() * words.length) + 1 : 
              selectedValue === 'max' ? words.length : 
              parseInt(selectedValue);
  
  const wordsCopy = [...words];
  const randomlySelectedWords = [];

  // Sélection aléatoire des mots selon le nombre choisi dans le sélecteur
  for (let i = 0; i < count && wordsCopy.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * wordsCopy.length);
    randomlySelectedWords.push(wordsCopy[randomIndex]);
    wordsCopy.splice(randomIndex, 1);
  }

  // Formatage et finalisation
  const formattedWords = formatSentence(randomlySelectedWords);
  finalizeCombination(formattedWords.join(' ') + '.');
}

/**
 * Fonction pour générer une combinaison en utilisant TOUS les mots
 * qui ont été explicitement sélectionnés par l'utilisateur,
 * indépendamment du nombre choisi dans le sélecteur
 */
function generateWithSelectedOnly() {
  // Vérifier s'il y a des mots sélectionnés
  if (selectedWords.length === 0) {
    return showNotification("Aucun mot n'est sélectionné ! Cliquez sur les mots grisés pour les activer.");
  }
  
  // Utiliser TOUS les mots sélectionnés et les mélanger
  const wordsCopy = [...selectedWords];
  
  // Mélanger les mots pour obtenir un ordre aléatoire
  for (let i = wordsCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [wordsCopy[i], wordsCopy[j]] = [wordsCopy[j], wordsCopy[i]]; // Échange
  }
  
  // Formatage et finalisation
  const formattedWords = formatSentence(wordsCopy);
  finalizeCombination(formattedWords.join(' ') + '.');
  
  // Notification pour informer l'utilisateur
  showNotification(`Combinaison générée avec tous les ${selectedWords.length} mots sélectionnés.`);
}

/**
 * Remplissage du sélecteur de nombre de mots avec mise en cache
 */
function populateWordCountOptions() {
  const select = document.getElementById('wordCount');
  if (!select) return;
  
  // Optimisation: éviter de recréer toutes les options si le nombre de mots n'a pas changé
  const currentOptionsCount = select.options.length;
  const expectedOptionsCount = words.length + 2; // +2 pour "Surprise" et "Maximum"
  
  if (currentOptionsCount !== expectedOptionsCount) {
    // Effacer seulement si nécessaire
    select.innerHTML = '';
    
    // Créer un fragment pour améliorer les performances
    const fragment = document.createDocumentFragment();
    
    // Ajouter l'option "Surprise"
    const surpriseOption = new Option('Surprise 🎲', 'surprise');
    fragment.appendChild(surpriseOption);
    
    // Ajouter les options numériques
    for (let i = 1; i < words.length; i++) {
      const option = new Option(`${i} mot${i > 1 ? 's' : ''}`, i);
      fragment.appendChild(option);
    }
    
    // Ajouter l'option "Maximum"
    const maxOption = new Option('Maximum 🌟', 'max');
    fragment.appendChild(maxOption);
    
    // Ajouter tout en une seule opération DOM
    select.appendChild(fragment);
  }

  resetUI();
}

/**
 * Réinitialise l'interface utilisateur
 */
function resetUI() {
  disableRatingInputs(true);
  resetRatingInputs();
  
  // Réinitialisation des éléments d'affichage
  const resultElement = document.getElementById('result');
  if (resultElement) {
    resultElement.innerHTML = '<span class="cursor">|</span>';
  }
  
  const feedbackElement = document.getElementById('feedback');
  if (feedbackElement) {
    feedbackElement.innerText = '';
  }
  
  // Réinitialiser l'état
  isCombinationGenerated = false;
  currentCombination = '';
}

/**
 * Initialisation du module
 */
function initialize() {
  populateWordCountOptions();
  
  // Nettoyage lorsque la page est déchargée
  window.addEventListener('beforeunload', () => {
    if (typingAnimation) {
      clearTimeout(typingAnimation);
    }
  });
}

// Exporter les fonctions et variables publiques
export {
  currentCombination,
  isCombinationGenerated,
  generateCombination,
  generateWithSelectedOnly,
  populateWordCountOptions,
  initialize,
  resetUI
};