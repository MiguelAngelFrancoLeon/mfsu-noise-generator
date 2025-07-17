// Variables globales
let currentData = null;
let audioContext = null;
let audioBuffer = null;
let timeChart = null;
let spectrumChart = null;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeCharts();
    setupEventListeners();
    
    // Generar ruido inicial
    generateNoise();
});

// Configurar event listeners
function setupEventListeners() {
    // Controles en tiempo real
    document.getElementById('samples').addEventListener('input', generateNoise);
    document.getElementById('alpha').addEventListener('input', generateNoise);
    document.getElementById('beta').addEventListener('input', generateNoise);
    document.getElementById('gamma').addEventListener('input', generateNoise);
    document.getElementById('fractal-dim').addEventListener('input', generateNoise);
    document.getElementById('noise-type').addEventListener('change', generateNoise);
    
    // Botones
    document.getElementById('shareButton').addEventListener('click', openShareModal);
    
    // Cerrar modal con Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

// Inicializar gráficos
function initializeCharts() {
    const timeCanvas = document.getElementById('timeChart');
    const spectrumCanvas = document.getElementById('spectrumChart');
    
    // Configurar canvas
    timeCanvas.width = timeCanvas.offsetWidth;
    timeCanvas.height = timeCanvas.offsetHeight;
    spectrumCanvas.width = spectrumCanvas.offsetWidth;
    spectrumCanvas.offsetHeight;
    
    timeChart = timeCanvas.getContext('2d');
    spectrumChart = spectrumCanvas.getContext('2d');
}

// Función principal para generar ruido
function generateNoise() {
    showLoading();
    hideError();
    
    try {
        // Obtener parámetros
        const params = getParameters();
        
        // Generar ruido usando el generador
        const noiseData = generateFractalNoise(params);
        
        // Actualizar datos globales
        currentData = noiseData;
        
        // Actualizar visualizaciones
        updateCharts(noiseData);
        updateStatistics(noiseData);
        
        // Mostrar estadísticas
        document.getElementById('stats').style.display = 'flex';
        
    } catch (error) {
        showError('Error al generar ruido: ' + error.message);
        console.error('Error:', error);
    } finally {
        hideLoading();
    }
}

// Obtener parámetros de la interfaz
function getParameters() {
    return {
        samples: parseInt(document.getElementById('samples').value),
        alpha: parseFloat(document.getElementById('alpha').value),
        beta: parseFloat(document.getElementById('beta').value),
        gamma: parseFloat(document.getElementById('gamma').value),
        fractalDim: parseFloat(document.getElementById('fractal-dim').value),
        noiseType: document.getElementById('noise-type').value
    };
}

// Generar ruido fractal (función principal)
function generateFractalNoise(params) {
    const { samples, alpha, beta, gamma, fractalDim, noiseType } = params;
    
    // Generar ruido base
    let noise = generateBaseNoise(samples, noiseType);
    
    // Aplicar ecuación MFSU
    const signal = new Array(samples);
    const dt = 1.0 / samples;
    
    // Condición inicial
    signal[0] = Math.random() * 0.1;
    
    // Integración numérica (Euler mejorado)
    for (let i = 1; i < samples; i++) {
        const psi = signal[i-1];
        const xi = noise[i-1];
        
        // Término de difusión fractal
        const diffusion = alpha * Math.pow(Math.abs(psi), fractalDim - 1) * psi;
        
        // Término de ruido multiplicativo
        const stochastic = beta * xi * psi;
        
        // Término no lineal
        const nonlinear = gamma * Math.pow(psi, 3);
        
        // Ecuación MFSU: dψ/dt = α·∇^∂ψ + β·ξ(t)·ψ - γ·ψ³
        const derivative = diffusion + stochastic - nonlinear;
        
        signal[i] = psi + derivative * dt;
        
        // Estabilización numérica
        if (Math.abs(signal[i]) > 10) {
            signal[i] = Math.sign(signal[i]) * 10;
        }
    }
    
    return {
        signal: signal,
        noise: noise,
        time: Array.from({length: samples}, (_, i) => i * dt),
        spectrum: computeSpectrum(signal)
    };
}

// Generar ruido base según el tipo
function generateBaseNoise(samples, type) {
    const noise = new Array(samples);
    
    switch (type) {
        case 'white':
            for (let i = 0; i < samples; i++) {
                noise[i] = (Math.random() - 0.5) * 2;
            }
            break;
            
        case 'pink':
            noise.fill(0);
            const pinkNoise = generatePinkNoise(samples);
            for (let i = 0; i < samples; i++) {
                noise[i] = pinkNoise[i];
            }
            break;
            
        case 'brown':
            noise[0] = (Math.random() - 0.5) * 2;
            for (let i = 1; i < samples; i++) {
                noise[i] = noise[i-1] + (Math.random() - 0.5) * 0.1;
            }
            break;
            
        case 'blue':
            const whiteNoise = new Array(samples);
            for (let i = 0; i < samples; i++) {
                whiteNoise[i] = (Math.random() - 0.5) * 2;
            }
            // Diferenciación para ruido azul
            noise[0] = whiteNoise[0];
            for (let i = 1; i < samples; i++) {
                noise[i] = whiteNoise[i] - whiteNoise[i-1];
            }
            break;
    }
    
    return noise;
}

// Generar ruido rosa (1/f)
function generatePinkNoise(samples) {
    const noise = new Array(samples);
    const b = [0.02109238, 0.07113478, 0.68873558]; // Coeficientes del filtro
    const a = [1.0, -2.494956002, 2.017265875, -0.522189400];
    
    // Filtro IIR para ruido rosa
    let x = [0, 0, 0];
    let y = [0, 0, 0];
    
    for (let i = 0; i < samples; i++) {
        x[0] = (Math.random() - 0.5) * 2;
        
        y[0] = b[0] * x[0] + b[1] * x[1] + b[2] * x[2]
             - a[1] * y[1] - a[2] * y[2];
        
        noise[i] = y[0];
        
        // Desplazar buffers
        x[2] = x[1]; x[1] = x[0];
        y[2] = y[1]; y[1] = y[0];
    }
    
    return noise;
}

// Calcular espectro de potencia
function computeSpectrum(signal) {
    const N = signal.length;
    const spectrum = new Array(N/2);
    
    // Usar FFT si está disponible, sino DFT básica
    if (typeof FFT !== 'undefined') {
        const fft = new FFT(N);
        const out = fft.createComplexArray();
        fft.realTransform(out, signal);
        
        for (let i = 0; i < N/2; i++) {
            const real = out[2*i];
            const imag = out[2*i + 1];
            spectrum[i] = Math.sqrt(real*real + imag*imag);
        }
    } else {
        // DFT básica
        for (let k = 0; k < N/2; k++) {
            let real = 0, imag = 0;
            for (let n = 0; n < N; n++) {
                const angle = -2 * Math.PI * k * n / N;
                real += signal[n] * Math.cos(angle);
                imag += signal[n] * Math.sin(angle);
            }
            spectrum[k] = Math.sqrt(real*real + imag*imag);
        }
    }
    
    return spectrum;
}

// Actualizar gráficos
function updateCharts(data) {
    drawTimeChart(data.signal, data.time);
    drawSpectrumChart(data.spectrum);
}

// Dibujar gráfico temporal
function drawTimeChart(signal, time) {
    const canvas = document.getElementById('timeChart');
    const ctx = timeChart;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Configurar estilo
    ctx.strokeStyle = '#4ecdc4';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    
    // Normalizar datos
    const minVal = Math.min(...signal);
    const maxVal = Math.max(...signal);
    const range = maxVal - minVal;
    
    // Dibujar señal
    ctx.beginPath();
    for (let i = 0; i < signal.length; i++) {
        const x = (i / signal.length) * canvas.width;
        const y = canvas.height - ((signal[i] - minVal) / range) * canvas.height;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // Dibujar ejes
    drawAxes(ctx, canvas, 'Tiempo', 'Amplitud');
}

// Dibujar espectro de potencia
function drawSpectrumChart(spectrum) {
    const canvas = document.getElementById('spectrumChart');
    const ctx = spectrumChart;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Configurar estilo
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2;
    
    // Escala logarítmica
    const logSpectrum = spectrum.map(val => Math.log10(val + 1e-10));
    const minLog = Math.min(...logSpectrum);
    const maxLog = Math.max(...logSpectrum);
    const logRange = maxLog - minLog;
    
    // Dibujar espectro
    ctx.beginPath();
    for (let i = 1; i < spectrum.length; i++) {
        const x = (Math.log10(i) / Math.log10(spectrum.length)) * canvas.width;
        const y = canvas.height - ((logSpectrum[i] - minLog) / logRange) * canvas.height;
        
        if (i === 1) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // Dibujar ejes
    drawAxes(ctx, canvas, 'Frecuencia (log)', 'Potencia (dB)');
}

// Dibujar ejes
function drawAxes(ctx, canvas, xLabel, yLabel) {
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 1;
    ctx.font = '12px Arial';
    ctx.fillStyle = '#ccc';
    
    // Eje X
    ctx.beginPath();
    ctx.moveTo(0, canvas.height);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.stroke();
    
    // Eje Y
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, canvas.height);
    ctx.stroke();
    
    // Etiquetas
    ctx.fillText(xLabel, canvas.width/2 - 30, canvas.height - 5);
    ctx.save();
    ctx.translate(15, canvas.height/2);
    ctx.rotate(-Math.PI/2);
    ctx.fillText(yLabel, -30, 0);
    ctx.restore();
}

// Actualizar estadísticas
function updateStatistics(data) {
    const signal = data.signal;
    
    // Calcular estadísticas
    const mean = signal.reduce((a, b) => a + b, 0) / signal.length;
    const variance = signal.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / signal.length;
    const std = Math.sqrt(variance);
    
    // Calcular entropía
    const entropy = calculateEntropy(signal);
    
    // Actualizar elementos
    document.getElementById('stat-mean').textContent = mean.toFixed(3);
    document.getElementById('stat-std').textContent = std.toFixed(3);
    document.getElementById('stat-fractal').textContent = 
        document.getElementById('fractal-dim').value;
    document.getElementById('stat-entropy').textContent = entropy.toFixed(3);
}

// Calcular entropía
function calculateEntropy(signal) {
    const bins = 50;
    const min = Math.min(...signal);
    const max = Math.max(...signal);
    const binSize = (max - min) / bins;
    
    const histogram = new Array(bins).fill(0);
    
    for (let val of signal) {
        const binIndex = Math.min(Math.floor((val - min) / binSize), bins - 1);
        histogram[binIndex]++;
    }
    
    let entropy = 0;
    const total = signal.length;
    
    for (let count of histogram) {
        if (count > 0) {
            const p = count / total;
            entropy -= p * Math.log2(p);
        }
    }
    
    return entropy;
}

// Reproducir audio
function playNoise() {
    if (!currentData) {
        showError('Primero genera ruido');
        return;
    }
    
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const signal = currentData.signal;
        const sampleRate = 44100;
        const duration = 2; // segundos
        
        audioBuffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        
        // Interpolar señal para audio
        for (let i = 0; i < channelData.length; i++) {
            const index = (i / channelData.length) * (signal.length - 1);
            const lower = Math.floor(index);
            const upper = Math.ceil(index);
            const fraction = index - lower;
            
            channelData[i] = signal[lower] * (1 - fraction) + signal[upper] * fraction;
        }
        
        // Reproducir
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
        
    } catch (error) {
        showError('Error al reproducir audio: ' + error.message);
    }
}

// Descargar datos
function downloadData() {
    if (!currentData) {
        showError('Primero genera ruido');
        return;
    }
    
    const params = getParameters();
    const data = {
        parameters: params,
        signal: currentData.signal,
        spectrum: currentData.spectrum,
        timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], 
        { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `fractal-noise-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
}

// Funciones de UI
function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function hideError() {
    document.getElementById('error-message').style.display = 'none';
}

// Redimensionar canvas cuando cambie el tamaño de la ventana
window.addEventListener('resize', function() {
    setTimeout(() => {
        initializeCharts();
        if (currentData) {
            updateCharts(currentData);
        }
    }, 100);
});
