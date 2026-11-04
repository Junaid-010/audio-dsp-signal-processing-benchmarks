// --- VARIABLES ---
let soundFile; 
//  Array to hold library sounds
let soundLibrary = []; 
let recordCount = 1;

let lowPass, distortion, compressor, reverb, masterVol;
let recorder, recordingFile;
let fftIn, fftOut; 
let isRecording = false;

// Global Sliders 
let sld_Cutoff, sld_Resonance;
let sld_DistAmount, sld_DistMix;
let sld_CompThresh, sld_CompRatio, sld_CompAttack;
let sld_RevTime, sld_RevDecay, sld_RevMix;
let sld_MasterVol;

function preload() {
    soundFormats('wav', 'mp3');
    // Loading Default sounds and adding them to library
    let defSound = loadSound('sound1.wav'); 
    soundLibrary.push({ name: "Default Sound", file: defSound });
}

function setup() {
    // 1. Creating Canvas
    let cnv = createCanvas(windowWidth - 250, 200); 
    cnv.parent('canvas-container');
    background(30);

    // 2. Setting Active Sound
    soundFile = soundLibrary[0].file;

    // 3. Initializing Audio Nodes
    lowPass = new p5.LowPass();
    distortion = new p5.Distortion();
    compressor = new p5.Compressor();
    reverb = new p5.Reverb();
    masterVol = new p5.Gain();
    
    // 4. Recording and Analysis
    recorder = new p5.SoundRecorder();
    recorder.setInput(masterVol);
    recordingFile = new p5.SoundFile();
    
    fftIn = new p5.FFT();
    fftIn.setInput(soundFile);
    fftOut = new p5.FFT();
    fftOut.setInput(masterVol);

    // 5. Connecting Chain
    reconnectAudioChain(); 

    // 6. Building GUI 
    createInterface();
    
    // 7. Draw Library 
    updateLibraryUI();
}

function draw() {
    background(30);

    //  VISUALIZATION 
    noStroke();
    fill(0, 255, 0); 
    let specIn = fftIn.analyze();
    for (let i = 0; i < specIn.length; i += 10) {
        let h = map(specIn[i], 0, 255, 0, height/2);
        let x = map(i, 0, specIn.length, 0, width);
        rect(x, height/2 - h, 8, h);
    }

    fill(0, 150, 255);
    let specOut = fftOut.analyze();
    for (let i = 0; i < specOut.length; i += 10) {
        let h = map(specOut[i], 0, 255, 0, height/2);
        let x = map(i, 0, specOut.length, 0, width);
        rect(x, height - h, 8, h);
    }
}

//  This helper function helps reconnects chain when sound changes 
function reconnectAudioChain() {
    soundFile.disconnect();
    
    soundFile.connect(lowPass);
    lowPass.connect(distortion);
    distortion.connect(compressor);
    compressor.connect(reverb);
    reverb.connect(masterVol);
    masterVol.connect(); 
    
    fftIn.setInput(soundFile);
}

//  Updating Library Buttons 
function updateLibraryUI() {
    let container = select('#library-list');
    if(!container) return; 
    container.html(''); 

    for (let i = 0; i < soundLibrary.length; i++) {
        let btn = createButton(soundLibrary[i].name);
        btn.parent(container);
        btn.class('lib-btn');
        
        if (soundLibrary[i].file === soundFile) btn.addClass('active');

        btn.mousePressed(() => {
            if (soundFile.isPlaying()) soundFile.stop();
            soundFile = soundLibrary[i].file;
            reconnectAudioChain();
            updateLibraryUI(); 
        });
    }
}

function createInterface() {
    // Original Slider Logic
    function addControl(parentID, label, min, max, val, step, action) {
        let container = select('#' + parentID);
        if (!container) return; 

        let wrapper = createDiv().parent(container).class('control-group');
        createElement('label', label).parent(wrapper);
        let sld = createSlider(min, max, val, step).parent(wrapper);
        
        sld.input(() => action(sld.value()));
        return sld;
    }

    // Creating Buttons
    let btnPlay = createButton('Play / Loop').parent('btn-play').class('btn');
    btnPlay.mousePressed(() => {
        if (!soundFile.isPlaying()) {
            soundFile.loop();
            userStartAudio();
        } else {
            soundFile.pause();
        }
    });

    let btnStop = createButton('Stop').parent('btn-stop').class('btn');
    btnStop.mousePressed(() => soundFile.stop());

    let btnRec = createButton('Record Output').parent('btn-record').class('btn btn-record');
    btnRec.mousePressed(() => {
        if (!isRecording) {
            recorder.record(recordingFile);
            btnRec.html('Stop & Save');
            btnRec.addClass('recording');
            isRecording = true;
        } else {
            recorder.stop();
            
            // Saving Logic
            saveSound(recordingFile, 'recording.wav');
            
            // Adding to library logic
            soundLibrary.push({ 
                name: "Recording " + recordCount, 
                file: recordingFile 
            });
            recordCount++;
            recordingFile = new p5.SoundFile(); 
            updateLibraryUI();

            btnRec.html('Record Output');
            btnRec.removeClass('recording');
            isRecording = false;
        }
    });

    // Creating SLiders
    sld_Cutoff = addControl('box-lowpass', 'Cutoff', 20, 22000, 22000, 10, (v) => lowPass.freq(v));
    sld_Resonance = addControl('box-lowpass', 'Resonance', 0.1, 20, 5, 0.1, (v) => lowPass.res(v));

    sld_DistAmount = addControl('box-distortion', 'Drive', 0, 1.0, 0.0, 0.01, (v) => distortion.set(v, '2x'));
    sld_DistMix = addControl('box-distortion', 'Mix', 0, 1, 1, 0.01, (v) => distortion.amp(v));

    sld_CompThresh = addControl('box-compressor', 'Threshold', -100, 0, -24, 1, (v) => compressor.threshold(v));
    sld_CompRatio = addControl('box-compressor', 'Ratio', 1, 20, 12, 0.1, (v) => compressor.ratio(v));
    sld_CompAttack = addControl('box-compressor', 'Attack', 0, 1, 0.03, 0.01, (v) => compressor.attack(v));

    let rTime = 3, rDecay = 2;
    // Manual Reverb Sliders
    let boxRev = select('#box-reverb');
    if(boxRev) {
        let w1 = createDiv().parent(boxRev).class('control-group');
        createElement('label', "Duration").parent(w1);
        sld_RevTime = createSlider(0, 10, 3, 0.1).parent(w1);
        sld_RevTime.changed(() => { 
            rTime = sld_RevTime.value();
            reverb.set(rTime, rDecay);
        });

        let w2 = createDiv().parent(boxRev).class('control-group');
        createElement('label', "Decay").parent(w2);
        sld_RevDecay = createSlider(0, 100, 2, 0.1).parent(w2);
        sld_RevDecay.changed(() => { 
            rDecay = sld_RevDecay.value();
            reverb.set(rTime, rDecay);
        });
        
        addControl('box-reverb', 'Dry/Wet', 0, 1, 1, 0.01, (v) => reverb.drywet(v));
    }

    sld_MasterVol = addControl('box-master', 'Level', 0, 1, 1, 0.01, (v) => masterVol.amp(v));
}