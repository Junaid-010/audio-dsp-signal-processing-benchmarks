//  VARIABLES 
let sounds = []; 
let currentSoundIndex = -1; 
let meydaAnalyzer;
let myRec; 
let bgColor;
let currentShape = "circle"; 

function preload() {
  soundFormats('wav', 'mp3');
  // Task 2.2 Files 
  sounds[0] = loadSound('Ex2_sound1.wav');
  sounds[1] = loadSound('Ex2_sound2.wav');
  sounds[2] = loadSound('Ex2_sound3.wav');
  // Task 2.3 File
  sounds[3] = loadSound('Kalte_Ohren_(_Remix_).mp3'); 
}

function setup() {
  let cnv = createCanvas(600, 400);
  cnv.parent('canvas-container');
  angleMode(DEGREES);
  rectMode(CENTER);
  bgColor = color(20);

  //  VOICE SETUP 
  myRec = new p5.SpeechRec('en-US', parseResult); 
  myRec.continuous = true;      
  myRec.interimResults = false; 
  myRec.onEnd = () => myRec.start(); // Keeping Mic Alive
  myRec.start();

  // Initializing Meyda with a dummy source
  if (typeof Meyda !== "undefined") {
    setupMeyda(sounds[0]); 
  }
}

function setupMeyda(sourceSound) {
  if (meydaAnalyzer) meydaAnalyzer.stop();
  
  meydaAnalyzer = Meyda.createMeydaAnalyzer({
    "audioContext": getAudioContext(),
    "source": sourceSound,
    "bufferSize": 512,
    "featureExtractors": ["rms", "spectralCentroid", "zcr"],
    "callback": (features) => {}
  });
}

function draw() {
  background(bgColor);

  if (currentSoundIndex !== -1 && sounds[currentSoundIndex].isPlaying()) {
    let features = meydaAnalyzer.get();
    if (features) {
      // VISUALIZATION MAPPING 
      // 1. RMS (Loudness) -> Size
      let size = map(features.rms, 0, 0.5, 50, 350);
      
      // 2. Centroid (Timbre) -> Color
      let bright = map(features.spectralCentroid, 0, 80, 0, 255);
      
      // 3. ZCR (Noisiness) -> Jitter
      let rotSpeed = map(features.zcr, 0, 100, 0.5, 15);

      push();
      translate(width / 2, height / 2);
      rotate(frameCount * rotSpeed);
      fill(bright, 100, 150); 
      stroke(255);
      drawShape(currentShape, size);
      pop();
    }
  } else {
    fill(255); noStroke(); textAlign(CENTER);
    text("Select a Sound Button Above", width/2, height/2);
  }
}

// Tracking Switching Logic
window.changeTrack = function(index) {
  // Stopping previous sound
  if (currentSoundIndex !== -1) {
    sounds[currentSoundIndex].stop();
    document.getElementById('btn' + currentSoundIndex).classList.remove('active');
  }

  // Playing new sound
  currentSoundIndex = index;
  let s = sounds[currentSoundIndex];
  s.loop();
  document.getElementById('btn' + index).classList.add('active');
  document.getElementById('status').innerText = "Playing Sound " + (index+1);

  // Updating Meyda source to the new track
  setupMeyda(s);
  meydaAnalyzer.start();
}

function parseResult() {
  // Task 2.3 Logic 
  let word = myRec.resultString.split(' ').pop().toLowerCase();
  if (word === "red") bgColor = color(200, 0, 0);
  else if (word === "green") bgColor = color(0, 200, 0);
  else if (word === "blue") bgColor = color(0, 0, 200);
  else if (word === "white") bgColor = color(255);
  else if (word === "black") bgColor = color(0);
  else if (word === "square") currentShape = "square";
  else if (word === "circle") currentShape = "circle";
  else if (word === "triangle") currentShape = "triangle";
  else if (word === "pentagon") currentShape = "pentagon";
}

function drawShape(shapeName, s) {
  if (shapeName === "square") rect(0, 0, s, s);
  else if (shapeName === "triangle") triangle(0, -s/2, -s/2, s/2, s/2, s/2);
  else if (shapeName === "pentagon") drawPolygon(0, 0, s/2, 5);
  else ellipse(0, 0, s, s);
}

function drawPolygon(x, y, radius, npoints) {
  let angle = 360 / npoints;
  beginShape();
  for (let a = 0; a < 360; a += angle) {
    let sx = x + cos(a) * radius;
    let sy = y + sin(a) * radius;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}