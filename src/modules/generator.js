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
let animationFrameId = null;
let typewriterSound = null;

/**
 * Préchargement du son pour éviter les délais
 */
function preloadSound() {
  const sound = document.getElementById('typewriterSound');
  if (sound && !typewriterSound) {
    typewriterSound = sound;
    if (typeof sound.load === 'function') {
      try {
        sound.load();
      } catch (err) {
        console.log('Audio preload error:', err);
      }
    }
  }
}

/**
 * Animation de l'affichage du résultat avec effet machine à écrire optimisé
 * Utilise requestAnimationFrame au lieu de setTimeout pour de meilleures performances
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
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    
    result.innerHTML = '';
    let index = 0;
    let lastTimestamp = 0;
    const typingInterval = 80; // Intervalle entre chaque lettre (en ms)
    
    // Précharger le son
    preloadSound();
    
    const cursor = document.createElement('span');
    cursor.className = 'cursor';
    cursor.textContent = '|';
    result.appendChild(cursor);

    function typeLetter(timestamp) {
      if (!lastTimestamp) lastTimestamp = timestamp;
      
      const elapsed = timestamp - lastTimestamp;
      
      if (elapsed >= typingInterval) {
        if (index < text.length) {
          cursor.insertAdjacentText('beforebegin', text[index]);
          
          if (text[index] !== ' ' && typewriterSound) {
            // Jouer le son de manière plus efficace
            if (typeof typewriterSound.play === 'function') {
              try {
                // Cloner le nœud audio pour éviter les problèmes de lecture simultanée
                const soundClone = typewriterSound.cloneNode();
                soundClone.volume = 0.5; // Réduire le volume pour éviter la saturation
                
                // Libérer la mémoire après la lecture
                soundClone.addEventListener('ended', () => {
                  soundClone.remove();
                }, { once: true });
                
                soundClone.play().catch(err => console.log('Audio playback error:', err));
              } catch (err) {
                console.log('Audio playback error:', err);
              }
            }
          }
          
          index++;
          lastTimestamp = timestamp;
        } else {
          cursor.classList.add('blink');
          animationFrameId = null;
          resolve();
          return;
        }
      }
      
      animationFrameId = requestAnimationFrame(typeLetter);
    }

    animationFrameId = requestAnimationFrame(typeLetter);
  });
}

/**
 * Capitalise une phrase correctement
 * @param {string[]} wordsArray - Tableau de mots à formater
 * @returns {string[]} - Tableau de mots formatés
 */
function formatSentence(wordsArray) {
  // Création d'une copie pour éviter de muter l'argument d'origine
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
 * Sélection aléatoire d'éléments d'un tableau sans le modifier
 * @param {Array} array - Tableau source
 * @param {number} count - Nombre d'éléments à sélectionner
 * @returns {Array} - Nouveaux éléments sélectionnés
 */
function getRandomElements(array, count) {
  // Créer une copie pour ne pas modifier l'original
  const arrayCopy = [...array];
  const result = [];
  const n = Math.min(count, arrayCopy.length);
  
  for (let i = 0; i < n; i++) {
    const randomIndex = Math.floor(Math.random() * arrayCopy.length);
    result.push(arrayCopy[randomIndex]);
    arrayCopy.splice(randomIndex, 1);
  }
  
  return result;
}

/**
 * Fonction pour générer avec un nombre spécifique de mots aléatoires
 * parmi tous les mots disponibles - optimisée
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
  
  // Utiliser la fonction utilitaire pour la sélection aléatoire
  const randomlySelectedWords = getRandomElements(words, count);

  // Formatage et finalisation
  const formattedWords = formatSentence(randomlySelectedWords);
  finalizeCombination(formattedWords.join(' ') + '.');
}

/**
 * Mélange un tableau en utilisant l'algorithme Fisher-Yates
 * @param {Array} array - Tableau à mélanger
 * @returns {Array} - Tableau mélangé
 */
function shuffleArray(array) {
  // Créer une copie pour ne pas modifier l'original
  const result = [...array];
  
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]; // Échange
  }
  
  return result;
}

/**
 * Fonction pour générer une combinaison en utilisant TOUS les mots
 * qui ont été explicitement sélectionnés par l'utilisateur,
 * indépendamment du nombre choisi dans le sélecteur - optimisée
 */
function generateWithSelectedOnly() {
  // Vérifier s'il y a des mots sélectionnés
  if (selectedWords.length === 0) {
    return showNotification("Aucun mot n'est sélectionné ! Cliquez sur les mots grisés pour les activer.");
  }
  
  // Utiliser la fonction de mélange optimisée
  const shuffledWords = shuffleArray(selectedWords);
  
  // Formatage et finalisation
  const formattedWords = formatSentence(shuffledWords);
  finalizeCombination(formattedWords.join(' ') + '.');
  
  // Notification pour informer l'utilisateur
  showNotification(`Combinaison générée avec tous les ${selectedWords.length} mots sélectionnés.`);
}

/**
 * Création optimisée des options du sélecteur
 * @param {HTMLSelectElement} select - Élément select à remplir
 * @param {number} wordCount - Nombre de mots disponibles
 */
function createWordCountOptions(select, wordCount) {
  // Créer un fragment pour améliorer les performances
  const fragment = document.createDocumentFragment();
  
  // Ajouter l'option "Surprise"
  fragment.appendChild(new Option('Surprise 🎲', 'surprise'));
  
  // Ajouter les options numériques
  for (let i = 1; i < wordCount; i++) {
    fragment.appendChild(new Option(`${i} mot${i > 1 ? 's' : ''}`, i));
  }
  
  // Ajouter l'option "Maximum"
  fragment.appendChild(new Option('Maximum 🌟', 'max'));
  
  // Ajouter tout en une seule opération DOM
  select.appendChild(fragment);
}

/**
 * Remplissage du sélecteur de nombre de mots avec mise en cache - optimisé
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
    createWordCountOptions(select, words.length);
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
  preloadSound();
  
  // Nettoyage lorsque la page est déchargée
  window.addEventListener('beforeunload', () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
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