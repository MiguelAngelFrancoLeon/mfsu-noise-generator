# 🌌 MFSU Noise Generator - 1/f Spectral Noise Simulator

## Overview

This project implements an advanced interactive 1/f^α noise generator based on the **Unified Fractal-Stochastic Model (MFSU)**. It allows users to generate and analyze noise with customizable spectral parameters, generation methods, and anti-artifact filters. The tool is designed to simulate natural noise patterns observed in physical systems, such as the Cosmic Microwave Background (CMB), fractal structures, and anomalous diffusion processes.

The core of the MFSU is the differential equation:

\[ \frac{d\psi}{dt} = \alpha \cdot \nabla^{\partial} \psi + \beta \cdot \xi(t) \cdot \psi - \gamma \cdot \psi^3 \]

This model captures multiplicative stochastic fluctuations in fractal systems, enabling the replication of 1/f^α power spectra seen in real-world data.

Live Demo: [MFSU Noise Generator](https://miguelangelfrancoleon.github.io/mfsu-noise-generator/)

## Features

- **Generation Methods**:
  - Spectral FFT
  - Timmer-Koenig
  - Mandelbrot-Van Ness (Fractional Brownian Motion)
  - Kasdin-Walter

- **Adjustable Parameters**:
  - Spectral exponent (α) for controlling the noise type (e.g., white noise α=0, pink noise α=1, brown noise α=2).
  - Length of the time series.
  - Amplitude and other model-specific parameters (β, γ).

- **Visualizations**:
  - Time series plot.
  - Power spectrum in log-log scale with linear fit for slope estimation.

- **Anti-Artifact Filters**:
  - Low-pass, high-pass, and adaptive smoothing to reduce generation artifacts.

- **Automatic Estimations**:
  - Spectral slope (α).
  - Fractal dimension (∂).
  - Hurst exponent (H = (3 - ∂)/2).
  - R² correlation coefficient for the log-log fit.

- **Applications**:
  - Validation of the MFSU model against datasets like Planck CMB, BAO, or DESI.
  - Simulation of fractal noise for cosmology, signal processing, art, or music.
  - Exploration of phenomena like the Hubble tension through stochastic modeling.

## Installation

This is a web-based tool built with HTML, CSS, and JavaScript. No installation is required to use the live demo. To run it locally or contribute:

1. Clone the repository:
   ```
   git clone https://github.com/miguelangelfrancoleon/mfsu-noise-generator.git
   ```

2. Open `index.html` in your browser.

For development, ensure you have a modern browser. No external dependencies are needed, but libraries like Chart.js or fft.js may be used internally—check the code for details.

## Usage

1. Visit the [live demo](https://miguelangelfrancoleon.github.io/mfsu-noise-generator/).
2. Select a generation method (e.g., Spectral FFT).
3. Adjust parameters like α (spectral exponent) using sliders.
4. Click "Generate" to create the noise signal.
5. View the time series and power spectrum plots.
6. Export data as CSV or JSON for further analysis.

### Example Code Snippet (JavaScript)

Here's a basic example of generating 1/f noise using the Spectral FFT method (adapt from the project's code):

```javascript
function generate1fNoise(alpha, length) {
  let noise = new Array(length).fill(0);
  for (let i = 1; i < length / 2; i++) {
    let amp = Math.pow(i, -alpha / 2);
    let phase = Math.random() * 2 * Math.PI;
    noise[i] = amp * Math.cos(phase);
    noise[length - i] = amp * Math.sin(phase);
  }
  // Perform Inverse FFT (use a library like fft.js for real implementation)
  return noise; // Placeholder for transformed signal
}

// Usage
let alpha = 1.0; // Pink noise
let signal = generate1fNoise(alpha, 1024);
// Plot or analyze signal...
```

For full implementation, refer to the source code in `script.js`.

## Mathematical Background

The MFSU integrates fractal diffusion and stochastic processes to model systems with anomalous scaling. Key relations:
- Power spectrum: \( P(f) \propto 1/f^\alpha \)
- Fractal dimension: \( \partial = 2 - H \) (for 1D signals)
- Hurst exponent: \( H = (\alpha + 1)/2 \) for certain noise types

This tool validates MFSU predictions, such as replicating CMB spectral signatures or resolving tensions like Hubble constant discrepancies through fractal-stochastic simulations.

## Contributing

Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

Please ensure code is well-documented and tests are added if applicable.


## 🔧 Features

- Generation Methods: Spectral FFT, Timmer-Koenig, Mandelbrot-Van Ness, Kasdin-Walter
- Adjustable spectral exponent (α)
- Time series and power spectrum visualization (log-log)
- Anti-artifact filtering: low-pass, high-pass, adaptive smoothing
- Automatic estimation of:
  - Spectral slope (α)
  - Fractal dimension (∂)
  - Hurst exponent (H)
  - R² correlation of log-log fit

## License

This repository and all its contents (text, figures, data, and simulations) are licensed under the [Creative Commons Attribution 4.0 International License (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).

You are free to use, share, and adapt the material, provided you give appropriate credit to the author: **Miguel Ángel Franco León**.


## Acknowledgments

- Inspired by research on fractal-stochastic models and cosmology data from Planck and DESI.
- Thanks to open-source libraries for FFT and plotting.

If you use this tool in your work, please cite it as:
> Franco León, M. Á. (2025). MFSU Noise Generator. GitHub Repository: https://github.com/miguelangelfrancoleon/mfsu-noise-generator

Contact: [mf410360@gmail.com] for questions or collaborations! 😊


Created with 💙 by Miguel Ángel Franco León  
