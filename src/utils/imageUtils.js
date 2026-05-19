// src/utils/imageUtils.js
export const getEventImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/400x300?text=Pas+d%27image';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('data:')) return imagePath;

    // Si ça commence par /media/, on ajoute le host
    if (imagePath.startsWith('/media/')) {
        return `http://localhost:8000${imagePath}`;
    }
    if (imagePath.startsWith('media/')) {
        return `http://localhost:8000/${imagePath}`;
    }

    // Sinon on construit l'URL complète
    return `http://localhost:8000/media/events/posters/${imagePath}`;
};
