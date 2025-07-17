// docs/fft.js
console.log("Cargando fft.js...");

class FFT {
    constructor(size) {
        this.size = size;
        this._csize = size << 1;
        this._initialize();
    }

    _initialize() {
        this.sinTable = new Float64Array(this.size);
        this.cosTable = new Float64Array(this.size);
        for (let i = 0; i < this.size; i++) {
            this.sinTable[i] = Math.sin(-Math.PI * 2 * i / this.size);
            this.cosTable[i] = Math.cos(-Math.PI * 2 * i / this.size);
        }
        this.reverseTable = new Uint32Array(this.size);
        let limit = 1;
        let bit = this.size >> 1;
        for (let i = 0; i < this.size; i++) {
            this.reverseTable[i] = 0;
        }
        while (limit < this.size) {
            for (let i = 0; i < limit; i++) {
                this.reverseTable[i + limit] = this.reverseTable[i] + bit;
            }
            limit = limit << 1;
            bit = bit >> 1;
        }
    }

    createComplexArray() {
        return new Float64Array(this._csize);
    }

    toComplexArray(input, output) {
        if (!output) output = this.createComplexArray();
        for (let i = 0; i < input.length; i++) {
            output[i * 2] = input[i];
            output[i * 2 + 1] = 0;
        }
        return output;
    }

    fromComplexArray(input, output) {
        if (!output) output = new Float64Array(this.size);
        for (let i = 0; i < this.size; i++) {
            output[i] = input[i * 2];
        }
        return output;
    }

    transform(out, input) {
        if (!input) input = out;
        for (let i = 0; i < this.size; i++) {
            const rev = this.reverseTable[i];
            out[rev * 2] = input[i * 2];
            out[rev * 2 + 1] = input[i * 2 + 1];
        }
        let limit = 1;
        let halfSize = this.size >> 1;
        while (limit < this.size) {
            for (let i = 0; i < this.size; i += limit * 2) {
                for (let j = 0; j < limit; j++) {
                    const idx = i + j;
                    const idx1 = idx + limit;
                    const idx2 = j * halfSize / limit;
                    const tre = out[idx1 * 2];
                    const tim = out[idx1 * 2 + 1];
                    const cos = this.cosTable[idx2];
                    const sin = this.sinTable[idx2];
                    out[idx1 * 2] = out[idx * 2] - (cos * tre - sin * tim);
                    out[idx1 * 2 + 1] = out[idx * 2 + 1] - (sin * tre + cos * tim);
                    out[idx * 2] += cos * tre - sin * tim;
                    out[idx * 2 + 1] += sin * tre + cos * tim;
                }
            }
            limit = limit << 1;
        }
        return out;
    }

    inverseTransform(out, input) {
        if (!input) input = out;
        this.transform(out, input);
        for (let i = 0; i < this._csize; i++) {
            out[i] /= this.size;
        }
        return out;
    }
}

if (typeof window !== 'undefined') {
    window.FFT = FFT;
} else if (typeof module !== 'undefined') {
    module.exports = FFT;
}
