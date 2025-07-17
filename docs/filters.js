// docs/filters.js
function savitzkyGolay(signal, windowSize, order) {
    if (windowSize % 2 === 0 || windowSize < 1 || order >= windowSize) {
        throw new Error('Parámetros inválidos para Savitzky-Golay');
    }
    const halfWindow = Math.floor(windowSize / 2);
    const coeffs = getSavitzkyGolayCoefficients(windowSize, order);
    const smoothed = new Array(signal.length);
    
    for (let i = 0; i < signal.length; i++) {
        let sum = 0;
        for (let j = -halfWindow; j <= halfWindow; j++) {
            const idx = Math.min(Math.max(0, i + j), signal.length - 1);
            sum += signal[idx] * coeffs[j + halfWindow];
        }
        smoothed[i] = sum;
    }
    return smoothed;
}

function getSavitzkyGolayCoefficients(windowSize, order) {
    // Implementación simplificada para orden 2
    const halfWindow = Math.floor(windowSize / 2);
    const coeffs = new Array(windowSize).fill(0);
    // Ejemplo para ventana de tamaño 5, orden 2
    if (windowSize === 5 && order === 2) {
        return [-3/35, 12/35, 17/35, 12/35, -3/35];
    }
    // Agrega más casos según sea necesario
    return coeffs;
}
