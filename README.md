# Audio Signal Processing & Speech Recognition Benchmarks

This repository contains my coursework projects for **CM3065: Intelligent Signal Processing**[cite: 3]. It covers browser-based audio manipulation[cite: 3], real-time spectral visualization[cite: 5], frequency-domain signal extraction[cite: 8], and an offline speech recognition pipeline[cite: 11].

---

## What's Inside

### 1. Web Audio Effects Rack (`Ex1_template_code`)
A modular browser effects rack built with `p5.sound`[cite: 3].
* **Signal Chain:** Runs sound through a Low-Pass Filter $\rightarrow$ Distortion $\rightarrow$ Compressor $\rightarrow$ Reverb $\rightarrow$ Master Gain[cite: 3].
* **Dynamic Range Handling:** The compressor keeps the signal below 0 dB to avoid harsh digital clipping when saturation spikes[cite: 3].
* **Session Recording:** Lets you capture the output directly to a buffer and switch playback sources on the fly without refreshing the page[cite: 4].

### 2. Audio CAPTCHA & Live Visualizer (`Ex2_files`)
* **Acoustic CAPTCHA:** Generates speech verification codes (`p5.speech`) layered over filtered background audio to make it easy for humans to hear but hard for bots to isolate[cite: 5].
* **Reactive Visuals with Meyda:** Extracts audio features in real time and maps them to canvas shapes[cite: 5]:
  * **RMS (Energy):** Controls shape scaling (50px to 350px) to pulse with the beat[cite: 5].
  * **Spectral Centroid:** Alters color brightness based on high-frequency presence[cite: 5].
  * **Zero Crossing Rate (ZCR):** Translates signal roughness and noise into rotational speed[cite: 5].
* **Hands-Free Control:** Listens for simple voice commands to switch visuals and colors, with an automated listener reboot if the browser microphone idles[cite: 6].

### 3. Audio Steganography & Signal Recovery (`Exercise 3.ipynb`)
* **Carrier Detection:** Fast Fourier Transforms (FFT) revealed an ultrasonic spike around 19.5 kHz in suspect test audio[cite: 8].
* **Demodulation:** Extracted the hidden signal by multiplying it by a 19.5 kHz cosine wave and filtering the result with a 4 kHz Butterworth low-pass filter[cite: 8].
* **LSB Encoding:** Tested Least Significant Bit text embedding in 16-bit PCM audio, keeping changes around -96 dB so they are completely inaudible to human ears[cite: 9].

### 4. Offline Speech Recognition (`Exercise 4 (1).ipynb`)
* **Local Kaldi/Vosk Setup:** Ran local speech recognition across English, Italian, and Spanish without relying on cloud APIs[cite: 11].
* **Background Noise Removal:** Handled loud airport background noise using spectral gating (`noisereduce`), cutting the noise floor roughly in half while preserving vocal formants[cite: 11].
* **Results:** Kept the average Word Error Rate (WER) across all test sets down to 9.7%[cite: 13].

---

## Code Structure

* **`Ex1_template_code/`**: Web Audio effects chain and session recorder[cite: 2, 3, 4].
* **`Ex2_files/`**: Audio CAPTCHA and real-time Meyda visualizer[cite: 2, 5].
* **`Exercise 3.ipynb`**: Frequency analysis, AM demodulation, and LSB audio steganography[cite: 2, 8, 9].
* **`Exercise 4 (1).ipynb`**: Local Vosk ASR, spectral denoising, and WER calculations[cite: 2, 11, 13].
* **`requirements.txt`**: Python dependencies for the notebooks[cite: 2].
* **`*.wav`**: 16-bit PCM test audio clips[cite: 2, 9, 11].

---

## Setup & Running

### Browser Demos (Tasks 1 & 2)
Start a quick local server in the folder you want to inspect:
```bash
cd Ex1_template_code
python3 -m http.server 8000