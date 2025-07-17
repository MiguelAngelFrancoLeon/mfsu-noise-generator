// docs/share-modal.js
console.log("Cargando share-modal.js...");

function openShareModal() {
    console.log("Abriendo modal de compartir...");
    const modal = document.getElementById('shareModal');
    if (modal) {
        modal.style.display = 'flex';
    } else {
        console.error("Modal shareModal no encontrado");
        document.getElementById('error-message').innerHTML = 'Error: Modal de compartir no encontrado';
        document.getElementById('error-message').style.display = 'block';
    }
}

function closeModal() {
    console.log("Cerrando modal...");
    const modal = document.getElementById('shareModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function copyLink() {
    console.log("Copiando enlace...");
    const shareLink = document.getElementById('shareLink');
    if (shareLink) {
        shareLink.select();
        document.execCommand('copy');
        alert('Enlace copiado al portapapeles');
    } else {
        console.error("Input shareLink no encontrado");
        document.getElementById('error-message').innerHTML = 'Error: Input de enlace no encontrado';
        document.getElementById('error-message').style.display = 'block';
    }
}

function shareOnX() {
    console.log("Compartiendo en X...");
    const shareLink = document.getElementById('shareLink');
    if (shareLink) {
        const url = encodeURIComponent(shareLink.value);
        const text = encodeURIComponent('¡Mira este Generador de Ruido 1/f para el MFSU-Fractal-Dynamics!');
        window.open(`https://x.com/intent/tweet?url=${url}&text=${text}`, '_blank');
    } else {
        console.error("Input shareLink no encontrado");
        document.getElementById('error-message').innerHTML = 'Error: Input de enlace no encontrado';
        document.getElementById('error-message').style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("Configurando share-modal.js...");
    const shareButton = document.getElementById('shareButton');
    if (shareButton) {
        shareButton.addEventListener('click', openShareModal);
    } else {
        console.warn("Botón shareButton no encontrado");
    }
});
