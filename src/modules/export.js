/**
 * Module d'exportation
 * Responsable des fonctionnalités d'exportation des combinaisons
 */

// Importation des dépendances
import { history } from './history.js';
import { showNotification } from './ui.js';

/**
 * Export de l'historique au format TXT
 */
function exportTXT() {
  if (!history.length) return showNotification("L'historique est vide.");
  const textHistory = history.map((entry, index) => `${index + 1}. ${entry.text} (Note : ${entry.note}/10)`).join('\n');
  const blob = new Blob([textHistory], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'historique_combinaisons.txt';
  link.click();
}

/**
 * Export de l'historique au format PDF
 */
function exportPDF() {
  if (!history.length) return showNotification("L'historique est vide.");
  
  try {
    // Vérification plus robuste de la disponibilité de jsPDF
    if (typeof window.jspdf === 'undefined' || typeof window.jspdf.jsPDF !== 'function') {
      return showNotification("La bibliothèque jsPDF n'est pas disponible. Veuillez vérifier que la bibliothèque est correctement chargée.");
    }
    
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
  } catch (e) {
    console.error("Erreur lors de la génération du PDF:", e);
    showNotification("Erreur lors de la génération du PDF. Vérifiez la console pour plus de détails.");
  }
}

/**
 * Génération d'une image à partir du texte
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

// Exporter les fonctions publiques
export {
  exportTXT,
  exportPDF,
  generateImage
};