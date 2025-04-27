// Gestion de la visibilité des mots avec animation 
function toggleWordVisibility(element) {
  element.classList.add('word-toggling');
  
  setTimeout(() => {
    element.classList.toggle('word-hidden');
    element.classList.remove('word-toggling');
  }, 150);
  
  // Effet sonore du clic
  const sound = document.getElementById('typewriterSound');
  if (sound && typeof sound.play === 'function') {
    sound.currentTime = 0;
    sound.play().catch(err => console.log('Audio playback error:', err));
  }
}

// Réinitialisation de tous les mots avec effet cascade
function resetAllWords() {
  const hiddenWords = document.querySelectorAll('.word-hidden');
  
  hiddenWords.forEach((word, index) => {
    setTimeout(() => {
      word.classList.add('word-toggling');
      setTimeout(() => {
        word.classList.remove('word-hidden');
        word.classList.remove('word-toggling');
      }, 150);
    }, index * 100);
  });
  
  if (hiddenWords.length > 0) {
    showNotification("Tous les mots ont été réinitialisés !");
  }
}

// Collection des mots disponibles pour les combinaisons
const words = [
  "Je", "suis", "rêveur", "professionnel", "dans", "mon", "métier",
  "exceptionnel", "l'erreur", "en", "tout", "genre", "est", "proscrite",
  "la", "souveraine", "intelligence", "pour", "moi-même", "grandissant"
];

// Variables d'état
let isCombinationGenerated = false;
let currentCombination = '';
let history = JSON.parse(localStorage.getItem('history')) || [];

// Initialisation au chargement de la page
window.onload = function() {
  populateWordCountOptions();
  updateHistory();
  updateStatistics();
  initializeResetCacheButton();
  
  // Initialisation des événements pour la notation
  const ratingInputs = document.querySelectorAll('.rating input[type="radio"]');
  if (ratingInputs && ratingInputs.length > 0) {
    ratingInputs.forEach(input => input.addEventListener('change', handleRatingChange));
  }
};

// Initialisation du bouton de réinitialisation du cache 
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

// Remplissage du sélecteur de nombre de mots
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

// Génération d'une combinaison aléatoire de mots
function generateCombination() {
  const selectElement = document.getElementById('wordCount');
  if (!selectElement) return;
  
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

// Animation de l'affichage du résultat avec effet machine à écrire
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
      if (text[index] !== ' ' && sound && typeof sound.play === 'function') {
        sound.currentTime = 0;
        sound.play().catch(err => console.log('Audio playback error:', err));
      }
      index++;
      setTimeout(typeLetter, 80);
    } else {
      cursor.classList.add('blink');
    }
  }

  typeLetter();
}

// Gestion de l'état des contrôles de notation
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

// Réinitialisation des contrôles de notation
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

// Traitement du changement de notation
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

// Soumission de la notation
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
  localStorage.setItem('history', JSON.stringify(history));

  updateHistory();
  updateStatistics();
}

// Mise à jour des statistiques avec animation
function updateStatistics() {
  const total = history.length;
  const notes = history.map(entry => entry.note);
  const sum = notes.reduce((a, b) => a + b, 0);
  const average = total > 0 ? (sum / total).toFixed(2) : '-';
  const best = total > 0 ? Math.max(...notes) : '-';
  const worst = total > 0 ? Math.min(...notes) : '-';

  animateStatistic('totalCombinations', `Total des combinaisons notées : ${total}`);
  animateStatistic('averageNote', `Note moyenne : ${average}`);
  animateStatistic('bestNote', `Meilleure note : ${best}`);
  animateStatistic('worstNote', `Pire note : ${worst}`);
}

// Animation d'un élément statistique
function animateStatistic(elementId, text) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  element.innerText = text;
  element.classList.add('animate');
  setTimeout(() => element.classList.remove('animate'), 300);
}

// Mise à jour de l'affichage de l'historique
function updateHistory() {
  const historyContainer = document.getElementById('history');
  if (!historyContainer) return;
  
  // Préservation des éléments statiques
  const h3 = historyContainer.querySelector('h3');
  const staticHTML = h3 ? h3.outerHTML : '<h3>Historique des combinaisons :</h3>';
  
  historyContainer.innerHTML = staticHTML;

  // Ajout des entrées d'historique
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

// Fonctions de tri de l'historique
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

// Réinitialisation complète du cache
function resetCache() {
  if (confirm("Veux-tu vraiment réinitialiser le cache ? Cela effacera toutes les données enregistrées.")) {
    localStorage.removeItem('history');
    history = [];
    updateHistory();
    updateStatistics();
    showNotification("Le cache a été réinitialisé avec succès!");
  }
}

// Export de l'historique au format TXT
function exportTXT() {
  if (!history.length) return showNotification("L'historique est vide.");
  const textHistory = history.map((entry, index) => `${index + 1}. ${entry.text} (Note : ${entry.note}/10)`).join('\n');
  const blob = new Blob([textHistory], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'historique_combinaisons.txt';
  link.click();
}

// Export de l'historique au format PDF
function exportPDF() {
  if (!history.length) return showNotification("L'historique est vide.");
  
  try {
    if (typeof window.jspdf !== 'undefined' && typeof window.jspdf.jsPDF === 'function') {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      
      doc.setFont("helvetica");
      doc.setFontSize(12);
      
      // En-têtes du document
      doc.text("La poésie quantique est une invention originale de Philow pour les éditions Provoq'émois.", 10, 20);
      doc.text("Historique des combinaisons notées :", 10, 30);
      
      let y = 40;
      const maxWidth = 180;
      
      // Génération du contenu
      history.forEach((entry, index) => {
        const entryText = `${index + 1}. ${entry.text} (Note : ${entry.note}/10)`;
        const splitText = doc.splitTextToSize(entryText, maxWidth);
        
        // Gestion des sauts de page
        if (y + (splitText.length * 8) > 280) {
          doc.addPage();
          y = 20;
        }
        
        doc.text(splitText, 10, y);
        y += (splitText.length * 8) + 7;
      });

      doc.save('historique_combinaisons.pdf');
    } else {
      showNotification("La bibliothèque jsPDF n'est pas chargée correctement.");
    }
  } catch (e) {
    console.error("Erreur lors de la génération du PDF:", e);
    showNotification("Erreur lors de la génération du PDF. Vérifiez la console pour plus de détails.");
  }
}

// Affichage des notifications temporaires
function showNotification(message) {
  const existingNotif = document.querySelector('.notification');
  if (existingNotif) {
    existingNotif.remove();
  }
  
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('fade-out');
    notification.addEventListener('transitionend', () => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    });
  }, 3000);
}

// Copie du résultat dans le presse-papier
function copyToClipboard() {
  const resultElement = document.getElementById('result');
  if (!resultElement) return;
  
  const text = resultElement.innerText;
  if (text && text !== 'Ta combinaison apparaîtra ici...') {
    navigator.clipboard.writeText(text)
      .then(() => showNotification("Combinaison copiée dans le presse-papier !"))
      .catch(err => {
        console.error('Erreur lors de la copie :', err);
        showNotification("Erreur lors de la copie. Essayez à nouveau.");
      });
  } else {
    showNotification("Génère d'abord une combinaison !");
  }
}

// Fonctions de partage sur les réseaux sociaux
function shareOnTwitter() {
  const resultElement = document.getElementById('result');
  if (!resultElement) return;
  
  const text = resultElement.innerText;
  if (!text || text === 'Ta combinaison apparaîtra ici...') {
    return showNotification("Génère d'abord une combinaison !");
  }
  
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function shareOnWhatsApp() {
  const resultElement = document.getElementById('result');
  if (!resultElement) return;
  
  const text = resultElement.innerText;
  if (!text || text === 'Ta combinaison apparaîtra ici...') {
    return showNotification("Génère d'abord une combinaison !");
  }
  
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function shareOnFacebook() {
  const resultElement = document.getElementById('result');
  if (!resultElement) return;
  
  const text = resultElement.innerText;
  if (!text || text === 'Ta combinaison apparaîtra ici...') {
    return showNotification("Génère d'abord une combinaison !");
  }
  
  const url = `https://www.facebook.com/sharer/sharer.php?u=&quote=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

function shareByEmail() {
  const resultElement = document.getElementById('result');
  if (!resultElement) return;
  
  const text = resultElement.innerText;
  if (!text || text === 'Ta combinaison apparaîtra ici...') {
    return showNotification("Génère d'abord une combinaison !");
  }
  
  const url = `mailto:?subject=Ma combinaison poétique&body=${encodeURIComponent(text)}`;
  window.location.href = url;
}

// Génération d'une image à partir du texte
function generateImage() {
  const resultElement = document.getElementById('result');
  if (!resultElement) return;
  
  const text = resultElement.innerText;
  if (!text || text === 'Ta combinaison apparaîtra ici...') {
    return showNotification("Génère d'abord une combinaison !");
  }
  
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error("Impossible de créer le contexte du canvas");
    }

    // Configuration du canvas
    canvas.width = 1080;
    canvas.height = 1080;

    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = '#333333';
    context.font = 'bold 48px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    // Traitement du texte pour l'adapter au canvas
    const words = text.split(' ');
    let line = '';
    const lines = [];
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = context.measureText(testLine);
      if (metrics.width > canvas.width - 100 && n > 0) {
        lines.push(line.trim());
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());

    // Rendu du texte
    const lineHeight = 60;
    const yStart = (canvas.height - lines.length * lineHeight) / 2;
    lines.forEach((l, i) => {
      context.fillText(l, canvas.width / 2, yStart + i * lineHeight);
    });

    // Téléchargement de l'image
    const link = document.createElement('a');
    link.download = 'combinaison.png';
    link.href = canvas.toDataURL();
    link.click();
  } catch (e) {
    console.error("Erreur lors de la génération de l'image:", e);
    showNotification("Erreur lors de la génération de l'image.");
  }
}