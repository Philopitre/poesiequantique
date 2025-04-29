// modules/sharing.js
export function shareText(text) {
    if (navigator.share) {
        navigator.share({
            title: 'Partage de texte',
            text: text,
            url: window.location.href
        }).catch((error) => console.error('Erreur de partage', error));
    } else {
        console.warn('API Web Share non supportée dans ce navigateur.');
        alert('Fonction de partage non disponible.');
    }
}
