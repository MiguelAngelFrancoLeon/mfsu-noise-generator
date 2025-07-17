// Funciones para el modal de compartir

function openShareModal() {
    const modal = document.getElementById('shareModal');
    modal.style.display = 'block';
    
    // Generar enlace con parámetros actuales
    const params = getParameters();
    const url = generateShareUrl(params);
    document.getElementById('shareLink').value = url;
    
    // Animación de aparición
    setTimeout(() => {
        modal.querySelector('.modal-content').style.transform = 'scale(1)';
        modal.querySelector('.modal-content').style.opacity = '1';
    }, 10);
}

function closeModal() {
    const modal = document.getElementById('shareModal');
    const content = modal.querySelector('.modal-content');
    
    // Animación de salida
    content.style.transform = 'scale(0.8)';
    content.style.opacity = '0';
    
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function generateShareUrl(params) {
    const baseUrl = window.location.origin + window.location.pathname;
    const urlParams = new URLSearchParams({
        samples: params.samples,
        alpha: params.alpha,
        beta: params.beta,
        gamma: params.gamma,
        fractalDim: params.fractalDim,
        noiseType: params.noiseType
    });
    
    return `${baseUrl}?${urlParams.toString()}`;
}

function copyLink() {
    const shareLink = document.getElementById('shareLink');
    shareLink.select();
    shareLink.setSelectionRange(0, 99999); // Para móviles
    
    try {
        document.execCommand('copy');
        showCopyFeedback();
    } catch (err) {
        // Fallback para navegadores modernos
        navigator.clipboard.writeText(shareLink.value).then(() => {
            showCopyFeedback();
        }).catch(() => {
            showError('No se pudo copiar el enlace');
        });
    }
}

function showCopyFeedback() {
    const button = document.querySelector('.share-actions button');
    const originalText = button.textContent;
    
    button.textContent = '¡Copiado!';
    button.style.background = 'linear-gradient(45deg, #4ecdc4, #45b7d1)';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
    }, 2000);
}

function shareOnX() {
    const shareLink = document.getElementById('shareLink').value;
    const text = 'Generador de Ruido 1/f - MFSU Fractal Dynamics: Simulación de fluctuaciones estocásticas multiplicativas';
    const hashtags = 'fractal,noise,mathematics,MFSU,dynamics';
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareLink)}&hashtags=${hashtags}`;
    
    window.open(twitterUrl, '_blank', 'width=600,height=400');
}

// Cargar parámetros desde URL al cargar la página
function loadParametersFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    
    const paramMap = {
        samples: 'samples',
        alpha: 'alpha',
        beta: 'beta',
        gamma: 'gamma',
        fractalDim: 'fractal-dim',
        noiseType: 'noise-type'
    };
    
    Object.entries(paramMap).forEach(([urlParam, elementId]) => {
        const value = urlParams.get(urlParam);
        if (value) {
            const element = document.getElementById(elementId);
            if (element) {
                element.value = value;
            }
        }
    });
}

// Cerrar modal al hacer clic fuera
window.addEventListener('click', function(event) {
    const modal = document.getElementById('shareModal');
    if (event.target === modal) {
        closeModal();
    }
});

// Cargar parámetros al inicializar
document.addEventListener('DOMContentLoaded', function() {
    loadParametersFromUrl();
});
