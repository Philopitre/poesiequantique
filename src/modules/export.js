/**
 * Module d'exportation optimisé
 * Responsable des fonctionnalités d'exportation des combinaisons
 */

// Importation des dépendances
import { showNotification } from './ui.js';

// Pour éviter la dépendance circulaire, nous importons l'historique à l'exécution
// plutôt qu'à l'initialisation
let historyModule = null;

/**
 * Obtenir l'historique à la demande pour éviter les dépendances circulaires
 * @returns {Array} L'historique des combinaisons
 */
async function getHistory() {
  if (!historyModule) {
    historyModule = await import('./history.js');
  }
  return historyModule.history;
}

/**
 * Export de l'historique au format TXT
 */
async function exportTXT() {
  const history = await getHistory();
  
  if (!history.length) {
    return showNotification("L'historique est vide.");
  }
  
  const textHistory = history.map((entry, index) => `${index + 1}. ${entry.text} (Note : ${entry.note}/10)`).join('\n');
  const blob = new Blob([textHistory], { type: 'text/plain' });
  
  // Utiliser la fonction utilitaire pour télécharger
  downloadBlob(blob, 'historique_combinaisons.txt');
}

/**
 * Export de l'historique au format PDF
 */
async function exportPDF() {
  const history = await getHistory();
  
  if (!history.length) {
    return showNotification("L'historique est vide.");
  }
  
  try {
    // Vérification plus robuste de la disponibilité de jsPDF
    if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF !== 'function') {
      return showNotification("La bibliothèque jsPDF n'est pas disponible. Veuillez vérifier que la bibliothèque est correctement chargée.");
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("La poésie quantique", 105, 20, { align: "center" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    
    let y = 30;
    const maxWidth = 180;
    
    // Intro
    const intro = "Une invention originale de Philow pour les éditions augmentées Provoq'émois.";
    doc.text(doc.splitTextToSize(intro, maxWidth), 10, y);
    y += 15;
    
    const concept = "Ce concept explore l'idée qu'un même poème peut contenir plusieurs lectures simultanées, comme des états superposés en physique quantique.";
    doc.text(doc.splitTextToSize(concept, maxWidth), 10, y);
    y += 20;
    
    // Preuve poétique
    doc.setFont("helvetica", "italic");
    doc.text("Preuve de concept :", 10, y);
    y += 10;
    
    doc.setFont("helvetica", "normal");
    doc.text("1. Je suis professionnel dans l'erreur en tout genre proscrite, la souveraine intelligence.", 10, y);
    y += 10;
    doc.text("2. Rêveur, mon métier exceptionnel est pour moi-même grandissant.", 10, y);
    y += 10;
    const textComplet = "3. Je suis rêveur professionel dans mon métier exceptionel l'erreur en tout genre est proscritez la souveraine intelligence pour moi-même grandissant";
    doc.text(doc.splitTextToSize(textComplet, maxWidth), 10, y);
    y += 15;
    
    // Conclusion
    const conclusion = "Chaque combinaison générée par ce programme peut, elle aussi, porter un sens multiple.";
    doc.text(doc.splitTextToSize(conclusion, maxWidth), 10, y);
    y += 15;
    
    // Historique ensuite
    doc.setFont("helvetica", "bold");
    doc.text("Historique des combinaisons notées :", 10, y);
    y += 10;
    
    // Génération du contenu
    history.forEach((entry, index) => {
      const entryText = `${index + 1}. ${entry.text} (Note : ${entry.note}/10)`;
      const splitText = doc.splitTextToSize(entryText, maxWidth);
      
      // Gestion des sauts de page
      if (y + (splitText.length * 8) > 280) {
        doc.addPage();
        y = 15;
      }
      
      doc.text(splitText, 10, y);
      y += (splitText.length * 8) + 7;
    });

    // Utiliser save plutôt que output pour améliorer les performances
    doc.save('historique_combinaisons.pdf');
  } catch (e) {
    console.error("Erreur lors de la génération du PDF:", e);
    showNotification("Erreur lors de la génération du PDF. Vérifiez la console pour plus de détails.");
  }
}

/**
 * Fonction utilitaire pour télécharger un Blob
 * @param {Blob} blob - Le blob à télécharger
 * @param {string} filename - Le nom du fichier
 */
function downloadBlob(blob, filename) {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.href = url;
  link.download = filename;
  link.click();
  
  // Libérer la mémoire après le téléchargement
  setTimeout(() => {
    URL.revokeObjectURL(url);
    link.remove();
  }, 100);
}

/**
 * Génération d'une image à partir du texte - optimisée
 */
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
    // Utiliser une approche plus efficace pour la mise en page
    const maxWidth = canvas.width - 100;
    const lines = layoutTextIntoLines(text, context, maxWidth);

    // Rendu du texte
    const lineHeight = 60;
    const yStart = (canvas.height - lines.length * lineHeight) / 2;
    lines.forEach((line, i) => {
      context.fillText(line, canvas.width / 2, yStart + i * lineHeight);
    });

    // Convertir le canvas en blob puis le télécharger
    canvas.toBlob(blob => {
      downloadBlob(blob, 'combinaison.png');
    }, 'image/png');
  } catch (e) {
    console.error("Erreur lors de la génération de l'image:", e);
    showNotification("Erreur lors de la génération de l'image.");
  }
}

/**
 * Disposition du texte en lignes pour adapter à une largeur maximale
 * @param {string} text - Texte à formater
 * @param {CanvasRenderingContext2D} context - Contexte du canvas
 * @param {number} maxWidth - Largeur maximale
 * @returns {string[]} - Tableau de lignes de texte
 */
function layoutTextIntoLines(text, context, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';
  
  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = context.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

// Exporter les fonctions publiques
export {
  exportTXT,
  exportPDF,
  generateImage
};