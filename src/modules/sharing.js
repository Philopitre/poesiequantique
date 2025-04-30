// modules/sharing.js

/**
 * Module de partage des combinaisons
 * Responsable des fonctionnalités de partage sur les réseaux sociaux
 */

// Importation des dépendances
import { showNotification } from './ui.js';

/**
 * Récupère le texte à partager depuis l'interface utilisateur
 * @returns {string|null} Le texte à partager ou null si non disponible
 */
function getTextToShare() {
    const result = document.getElementById("result");
    if (!result) return null;
    return result.textContent;
}

/**
 * Vérifie si le texte est valide pour le partage
 * @param {string} text - Le texte à vérifier
 * @returns {boolean} true si le texte est valide, false sinon
 */
function isValidText(text) {
    if (!text || text === 'Ta combinaison apparaîtra ici...') {
        showNotification("Génère d'abord une combinaison !");
        return false;
    }
    return true;
}

/**
 * Partage un texte via l'API Web Share si disponible
 * @returns {boolean} true si le partage a été effectué, false sinon
 */
export function shareText() {
    const text = getTextToShare();
    if (!isValidText(text)) return false;

    if (navigator.share) {
        navigator.share({
            title: 'Partage de texte',
            text: text,
            url: window.location.href
        }).catch((error) => console.error('Erreur de partage', error));
    } else {
        console.warn('API Web Share non supportée dans ce navigateur.');
        showNotification('Fonction de partage non disponible.');
    }
    return true;
}

/**
 * Partage un texte sur Twitter
 * @returns {boolean} true si le partage a été effectué, false sinon
 */
export function shareOnTwitter() {
    const text = getTextToShare();
    if (!isValidText(text)) return false;
    
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    return true;
}

/**
 * Partage un texte sur WhatsApp
 * @returns {boolean} true si le partage a été effectué, false sinon
 */
export function shareOnWhatsApp() {
    const text = getTextToShare();
    if (!isValidText(text)) return false;
    
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    return true;
}

/**
 * Partage un texte sur Facebook
 * @returns {boolean} true si le partage a été effectué, false sinon
 */
export function shareOnFacebook() {
    const text = getTextToShare();
    if (!isValidText(text)) return false;
    
    const url = `https://www.facebook.com/sharer/sharer.php?u=&quote=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    return true;
}

/**
 * Partage un texte par e-mail
 * @param {string} subject - Le sujet de l'e-mail (optionnel)
 * @returns {boolean} true si le partage a été effectué, false sinon
 */
export function shareByEmail(subject = 'Ma combinaison poétique') {
    const text = getTextToShare();
    if (!isValidText(text)) return false;
    
    const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    window.location.href = url;
    return true;
}

/**
 * Copie un texte dans le presse-papier
 * @returns {boolean} true si la copie a été effectuée, false sinon
 */
export function copyToClipboard() {
    const text = getTextToShare();
    if (!isValidText(text)) return false;
    
    navigator.clipboard.writeText(text)
        .then(() => showNotification("Combinaison copiée dans le presse-papier !"))
        .catch(err => {
            console.error('Erreur lors de la copie :', err);
            showNotification("Erreur lors de la copie. Essayez à nouveau.");
        });
    return true;
}

/**
 * Fonction dispatcher pour partager sur différentes plateformes
 * @param {string} platform - La plateforme sur laquelle partager (twitter, facebook, whatsapp, email)
 * @returns {boolean} true si le partage a été effectué, false sinon
 */
export function shareOn(platform) {
    switch(platform.toLowerCase()) {
        case 'twitter':
            return shareOnTwitter();
        case 'facebook':
            return shareOnFacebook();
        case 'whatsapp':
            return shareOnWhatsApp();
        case 'email':
            return shareByEmail();
        default:
            return shareText();
    }
}