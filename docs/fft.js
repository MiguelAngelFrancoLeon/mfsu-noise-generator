// Implementación de FFT (Fast Fourier Transform)
// Basada en el algoritmo Cooley-Tukey

class FFT {
    constructor(size) {
        this.size = size;
        this.table = this.generateTable(size);
    }
    
    generateTable(size) {
        const table = new Array(size);
        for (let i = 0; i < size; i++) {
            table[i] = {
                cos: Math.cos(2 * Math.PI * i / size),
                sin: Math.sin(2 * Math.PI * i / size)
            };
        }
        return table;
    }
    
    createComplexArray() {
        return new Array(this.size * 2);
    }
    
    // Transformada directa
    transform(out, input) {
        if (input.length !== this.size * 2) {
            throw new Error('Input size must be 2 * size');
        }
        
        this.fft(out, input, false);
    }
    
    // Transformada inversa
    inverseTransform(out, input) {
        if (input.length !== this.size * 2) {
            throw new Error('Input size must be 2 * size');
        }
        
        this.fft(out, input, true);
        
        // Normalizar
        for (let i = 0; i < this.size * 2; i++) {
            out[i] /= this.size;
        }
    }
    
    // Transformada para datos reales
    realTransform(out, input) {
        if (input.length !== this.size) {
            throw new Error('Real input size must be equal to size');
        }
        
        // Convertir a formato complejo
        const complexInput = new Array(this.size * 2);
        for (let i = 0; i < this.size; i++) {
            complexInput[i * 2] = input[i];     // parte real
            complexInput[i * 2 + 1] = 0;       // parte imaginaria
        }
        
        this.fft(out, complexInput, false);
    }
    
    // Algoritmo FFT principal
    fft(out, input, inverse) {
        const size = this.size;
        const sign = inverse ? 1 : -1;
        
        // Copiar entrada
        for (let i = 0; i < size * 2; i++) {
            out[i] = input[i];
        }
        
        // Bit-reversal permutation
        this.bitReverse(out, size);
        
        // Butterfly operations
        for (let subSize = 2; subSize <= size; subSize *= 2) {
            const halfSize = subSize / 2;
            const tableStep = size / subSize;
            
            for (let i = 0; i < size; i += subSize) {
                let k = 0;
                for (let j = i; j < i + halfSize; j++) {
                    const evenReal = out[j * 2];
                    const evenImag = out[j * 2 + 1];
                    const oddReal = out[(j + halfSize) * 2];
                    const oddImag = out[(j + halfSize) * 2 + 1];
                    
                    const cos = this.table[k].cos;
                    const sin = this.table[k].sin * sign;
                    
                    const tReal = oddReal * cos - oddImag * sin;
                    const tImag = oddReal * sin + oddImag * cos;
                    
                    out[j * 2] = evenReal + tReal;
                    out[j * 2 + 1] = evenImag + tImag;
                    out[(j + halfSize) * 2] = evenReal - tReal;
                    out[(j + halfSize) * 2 + 1] = evenImag - tImag;
                    
                    k += tableStep;
                }
            }
        }
    }
    
    // Bit-reversal permutation
    bitReverse(array, size) {
        for (let i = 0; i < size; i++) {
            let j = this.reverseBits(i, size);
            
            if (i < j) {
                // Intercambiar elementos complejos
                let temp = array[i * 2];
                array[i * 2] = array[j * 2];
                array[j * 2] = temp;
                
                temp = array[i * 2 + 1];
                array[i * 2 + 1] = array[j * 2 + 1];
                array[j * 2 + 1] = temp;
            }
        }
    }
    
    // Invertir bits
    reverseBits(num, size) {
        let result = 0;
        let bits = Math.log2(size);
        
        for (let i = 0; i < bits; i++) {
            result = (result << 1) | (num & 1);
            num >>= 1;
        }
        
        return result;
    }
    
    // Calcular magnitud del espectro
    getMagnitude(complexArray) {
        const magnitude = new Array(this.size);
        
        for (let i = 0; i < this.size; i++) {
            const real = complexArray[i * 2];
            const imag = complexArray[i * 2 + 1];
            magnitude[i] = Math.sqrt(real * real + imag * imag);
        }
        
        return magnitude;
    }
    
    // Calcular fase del espectro
    getPhase(complexArray) {
        const phase = new Array(this.size);
        
        for (let i = 0; i < this.size; i++) {
            const real = complexArray[i * 2];
            const imag = complexArray[i * 2 + 1];
            phase[i] = Math.atan2(imag, real);
        }
        
        return phase;
    }
    
    // Ventana Hanning
    static applyHanningWindow(signal) {
        const windowed = new Array(signal.length);
        const N = signal.length;
        
        for (let i = 0; i < N; i++) {
            const window = 0.5 * (1 - Math.cos(2 * Math.PI * i / (N - 1)));
            windowed[i] = signal[i] * window;
        }
        
        return windowed;
    }
    
    // Ventana Hamming
    static applyHammingWindow(signal) {
        const windowed = new Array(signal.length);
        const N = signal.length;
        
        for (let i = 0; i < N; i++) {
            const window = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (N - 1));
            windowed[i] = signal[i] * window;
        }
        
        return windowed;
    }
    
    // Calcular densidad espectral de potencia
    static powerSpectralDensity(signal, sampleRate) {
        const N = signal.length;
        const fft = new FFT(N);
        const windowed = FFT.applyHanningWindow(signal);
        
        const complexOut = fft.createComplexArray();
        fft.realTransform(complexOut, windowed);
        
        const psd = new Array(N / 2);
        const df = sampleRate / N;
        
        for (let i = 0; i < N / 2; i++) {
            const real = complexOut[i * 2];
            const imag = complexOut[i * 2 + 1];
            const magnitude = Math.sqrt(real * real + imag * imag);
            
            // Normalizar por el ancho de banda y la ventana
            psd[i] = (magnitude * magnitude) / (sampleRate * N);
            
            // Corrección para frecuencias no DC y Nyquist
            if (i > 0 && i < N / 2 - 1) {
                psd[i





