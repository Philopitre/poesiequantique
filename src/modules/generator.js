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

/**
 * Animation de l'affichage du résultat avec effet machine à écrire
 * @param {string} text - Le texte à animer
 */
function animateResult(text) {
  const result = document.getElementById('result');
  if (!result) return;
  
  result.innerHTML = '';
  let index = 0;
  
  const sound = document.getElementById('typewriterSound');
  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  cursor.textContent = '|';
  result.appendChild(cursor);

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
      setTimeout(typeLetter, 80);
    } else {
      cursor.classList.add('blink');
    }
  }

  typeLetter();
}

/**
 * Fonction pour générer avec tous les mots disponibles
 */
function generateCombination() {
  const selectElement = document.getElementById('wordCount');
  if (!selectElement) return;
  
  // Utiliser tous les mots disponibles (pas seulement les sélectionnés)
  if (words.length === 0) {
    return showNotification("Aucun mot n'est disponible !");
  }
  
  const selectedValue = selectElement.value;
  const count = selectedValue === 'surprise' ? Math.floor(Math.random() * words.length) + 1 : 
              selectedValue === 'max' ? words.length : 
              parseInt(selectedValue);
  
  const wordsCopy = [...words];
  let combination = [];

  // Sélection aléatoire des mots
  for (let i = 0; i < count && wordsCopy.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * wordsCopy.length);
    combination.push(wordsCopy[randomIndex]);
    wordsCopy.splice(randomIndex, 1);
  }

  // Capitalisation appropriée
  combination = combination.map((word, index) => 
    index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : 
    word === "Je" ? "je" : word
  );
  
  currentCombination = combination.join(' ') + '.';
  animateResult(currentCombination);

  disableRatingInputs(false);
  isCombinationGenerated = true;
  setTimeout(resetRatingInputs, 10);
  
  const feedbackElement = document.getElementById('feedback');
  if (feedbackElement) {
    feedbackElement.innerText = '';
  }
}

/**
 * Fonction pour générer avec tous les mots sélectionnés
 */
function generateWithSelectedOnly() {
  // Vérifier s'il y a des mots sélectionnés
  if (selectedWords.length === 0) {
    return showNotification("Aucun mot n'est sélectionné ! Cliquez sur les mots grisés pour les activer.");
  }
  
  // Utiliser TOUS les mots sélectionnés, indépendamment du nombre choisi dans le sélecteur
  const wordsCopy = [...selectedWords];
  
  // Mélanger les mots pour obtenir un ordre aléatoire
  for (let i = wordsCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [wordsCopy[i], wordsCopy[j]] = [wordsCopy[j], wordsCopy[i]]; // Échange
  }
  
  // Capitalisation appropriée
  const combination = wordsCopy.map((word, index) => 
    index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : 
    word === "Je" ? "je" : word
  );
  
  currentCombination = combination.join(' ') + '.';
  animateResult(currentCombination);

  disableRatingInputs(false);
  isCombinationGenerated = true;
  setTimeout(resetRatingInputs, 10);
  
  const feedbackElement = document.getElementById('feedback');
  if (feedbackElement) {
    feedbackElement.innerText = '';
  }
  
  // Notification pour informer l'utilisateur
  showNotification(`Combinaison générée avec tous les ${selectedWords.length} mots sélectionnés.`);
}

/**
 * Remplissage du sélecteur de nombre de mots
 */
function populateWordCountOptions() {
  const select = document.getElementById('wordCount');
  if (!select) return;
  
  select.innerHTML = '';
  select.add(new Option('Surprise 🎲', 'surprise'));

  for (let i = 1; i < words.length; i++) {
    select.add(new Option(`${i} mot${i > 1 ? 's' : ''}`, i));
  }

  select.add(new Option('Maximum 🌟', 'max'));

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
}

/**
 * Initialisation du module
 */
function initialize() {
  populateWordCountOptions();
}

// Exporter les fonctions et variables publiques
export {
  currentCombination,
  isCombinationGenerated,
  generateCombination,
  generateWithSelectedOnly,
  populateWordCountOptions,
  initialize
};