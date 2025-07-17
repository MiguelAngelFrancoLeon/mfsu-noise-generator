console.log("Cargando noise-generator.js...");

// Generador de ruido 1/f
class NoiseGenerator {
    constructor() {
        this.audioContext = null;
        this.currentBuffer = null;
    }

    // Generar ruido blanco
    generateWhiteNoise(samples) {
        const noise = new Float64Array(samples);
        for (let i = 0; i < samples; i++) {
            noise[i] = (Math.random() - 0.5) * 2;
        }
        return noise;
    }

    // Generar ruido 1/f usando FFT
    generatePinkNoise(samples, exponent = -1) {
        const fft = new FFT(samples);
        const whiteNoise = this.generateWhiteNoise(samples);
        const complexNoise = fft.toComplexArray(whiteNoise);
        
        // Aplicar filtro 1/f en el dominio de frecuencia
        fft.transform(complexNoise, complexNoise);
        
        for (let i = 1; i < samples / 2; i++) {
            const freq = i / samples;
            const magnitude = Math.pow(freq, exponent / 2);
            
            const realIdx = i * 2;
            const imagIdx = i * 2 + 1;
            
            complexNoise[realIdx] *= magnitude;
            complexNoise[imagIdx] *= magnitude;
            
            // Simetría hermítica
            const symmReal = (samples - i) * 2;
            const symmImag = (samples - i) * 2 + 1;
            complexNoise[symmReal] = complexNoise[realIdx];
            complexNoise[symmImag] = -complexNoise[imagIdx];
        }
        
        // DC y Nyquist
        complexNoise[0] = 0;
        complexNoise[1] = 0;
        if (samples % 2 === 0) {
            complexNoise[samples] = 0;
            complexNoise[samples + 1] = 0;
        }
        
        fft.inverseTransform(complexNoise, complexNoise);
        return fft.fromComplexArray(complexNoise);
    }

    // Generar ruido según tipo
    generateNoise(samples, type) {
        switch (type) {
            case 'pink':
                return this.generatePinkNoise(samples, -1);
            case 'brown':
                return this.generatePinkNoise(samples, -2);
            case 'blue':
                return this.generatePinkNoise(samples, 1);
            case 'white':
            default:
                return this.generateWhiteNoise(samples);
        }
    }

    // Aplicar ecuación MFSU
    applyMFSU(noise, alpha, beta, gamma, fractalDim, dt = 0.001) {
        const result = new Float64Array(noise.length);
        let psi = 0.1; // Condición inicial
        
        for (let i = 0; i < noise.length; i++) {
            // Término de difusión fractal (simplificado)
            const fractalTerm = alpha * Math.pow(Math.abs(psi), fractalDim) * Math.sign(psi);
            
            // Ruido multiplicativo
            const noiseTerm = beta * noise[i] * psi;
            
            // Término no lineal
            const nonlinearTerm = gamma * psi * psi * psi;
            
            // Integración Euler
            const dpsi = (fractalTerm + noiseTerm - nonlinearTerm) * dt;
            psi += dpsi;
            
            result[i] = psi;
        }
        
        return result;
    }
}

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.NoiseGenerator = NoiseGenerator;
} else if (typeof module !== 'undefined') {
    module.exports = NoiseGenerator;
}
