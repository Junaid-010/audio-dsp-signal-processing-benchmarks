// EXERCISE 2.1: AUDIO CAPTCHA 
let myVoice;
let captchaString = "";
let backgroundSound; 
let lowPass;
let fft;

function preload() {
  //  Processing a pre-recorded sound file.
  soundFormats('wav', 'mp3');
  backgroundSound = loadSound('Ex2_sound1.wav'); 
}

function setup() {
  // Canvas setup
  let cnv = createCanvas(400, 100);
  cnv.parent('canvas-target');

  // 1. Text-to-Speech Setup
  myVoice = new p5.Speech();
  myVoice.setPitch(0.5); 
  myVoice.setRate(0.8);  

  // 2. Audio Processing Setup 
  lowPass = new p5.LowPass();
  
  // Connecting the pre-recorded sound to the filter
  backgroundSound.disconnect();
  backgroundSound.connect(lowPass);
  
  // Setting filter parameters 
  lowPass.freq(500); 
  lowPass.res(5);

  // 3. Visualization
  fft = new p5.FFT();
  
  // Generating first code
  generateCaptcha();
}

function draw() {
  background(30);

  // Visualizing the mixed output
  stroke(0, 255, 0);
  noFill();
  let wave = fft.waveform();
  beginShape();
  for (let i = 0; i < width; i++) {
    let index = floor(map(i, 0, width, 0, wave.length));
    let y = map(wave[index], -1, 1, height, 0);
    vertex(i, y);
  }
  endShape();
}

function generateCaptcha() {
  // Generating random 4-char string
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  captchaString = "";
  for (let i = 0; i < 4; i++) {
    captchaString += chars.charAt(floor(random(chars.length))) + " ";
  }
  console.log("Code: " + captchaString);
  
  // Updating HTML UI
  let msg = document.getElementById('resultMsg');
  if(msg) msg.innerText = "New code generated.";
  let inp = document.getElementById('userInput');
  if(inp) inp.value = "";
}

function playCaptcha() {
  // 1. Playing the processed pre-recorded file 
  backgroundSound.setVolume(0.5); 
  backgroundSound.rate(1.5); 
  backgroundSound.play();

  // 2. Speaking the code over it
  myVoice.speak(captchaString);
  
  // 3. Stopping background after 4 seconds
  setTimeout(() => {
    if(backgroundSound.isPlaying()) backgroundSound.stop();
  }, 4000);
}

// Making functions available to HTML buttons
window.playCaptcha = playCaptcha;
window.generateCaptcha = generateCaptcha;
window.checkAnswer = checkAnswer;

function checkAnswer() {
  let input = document.getElementById('userInput').value.toUpperCase().replace(/\s/g, '');
  let secret = captchaString.replace(/\s/g, '');
  let msg = document.getElementById('resultMsg');

  if (input === secret) {
    msg.innerText = "Correct! Access Granted.";
    msg.className = "status success";
    msg.style.color = "green";
  } else {
    msg.innerText = "Incorrect. Try again.";
    msg.className = "status fail";
    msg.style.color = "red";
  }
}