// A sound visulization that shows the frequency of sound using 3 circles were the rotation speed shows the
// energy of the treble, Mids, and Bass using the inner, middle and outer citcles repectively. 
// Outer Polygone shows freqency of the sound with the postion of the Vertex Corresponding to Amplitude of
// a given frequency range

let angle = 0;
let angle2 = 0;
let bangle = 0;
let mangle = 0;
let tangle = 0;
let radius = 100;
let numLines = 40;
let lineLength = 60;
let angleOffset = 0.2;
let posX, posY;
let mic;

let particle = [];
const num_partics = 1000;

let particles = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Set Position X and Y Varriable to Half Width and Height
  posX = width / 2;
  posY = height / 2;

  mic = new p5.AudioIn(); // Creates new Audio Object and stores in mic 
  mic.start(); // starts Recording mic
  
  // Prints Source Infomraiton
  printAudioSourceInformation();

  const numFftBins = 64; // Defaults to 1024. Must be power of 2.
  const smoothingCoefficient = 0.8; // Defaults to 0.8

  // create new FFT peak Detection whose input is the mic, used to detect beats
  fft = new p5.FFT(smoothingCoefficient, numFftBins);
  fft.setInput(mic);

  peakDetect = new p5.PeakDetect();
  
  // Generates Cordinates for Random Particles in Random positions and of Random sizes
  // Used to the Specles on the Outer Yellow Ring
  for (let i = 0; i <= num_partics; i++) {
    particle.push(
      createVector(
        random(-4 * radius + 45, 4 * radius - 45),
        random(-4 * radius + 45, 4 * radius - 45),
        random(10)
      )
    );
  }
}

function draw() {
  background(30);

  // Move Origin to  mouse position or Press Press Control to Back to Center
  if (mouseIsPressed) {
    // move origin to mouse position
    posX = mouseX;
    posY = mouseY;
  } else if (keyIsDown(CONTROL)) {
    // Reset Origin to Center
    posX = width / 2;
    posY = height / 2;
  }
  drawFps(); // Prints Current Frames Per Second
  
  // Used to See if Mic is Enable else prompts user to enable the mic and start the Visualization
  if (!mic.enabled || getAudioContext().state !== "running") {
    background('rgba(30,49,55,0.7764705882352941)');
    drawEnableMicText();
    return;
  }
  
  // Sets the origin into Center of the Canvas
  translate(posX, posY);
  
  // Uses FFT to Get Analyze Sound and Get Frequency levels
  var spectrum = fft.analyze();

  // Uses FFT to get Energy for Bass, Treble, and Mid. Stores it in corresponding Varriables
  var bass = map(fft.getEnergy("bass") - 150, 0, 105, 0, 0.1); // Value Bass of Energy mapped from 0 to 0.1
  var treble = map(fft.getEnergy("treble") * 2, 0, 255, 0, 0.03); // Value of Trebble Energy mapped from 0 to 0.03
  var mid = map(fft.getEnergy("mid"), 0, 255, 0, 0.03); // Value of Mids Energy mapped from 0 to 0.03

  peakDetect.update(fft); // Updatee fft if peak is detected

  // Sets Color of Specles on Outer Ring, Stores color in Dot Col Variable
  let dotcol = "#E91E63";
  
  // If a peak is detected in the Audio then Sets dotcol to blue and Increases angle of White particles by 0.01 
  if (peakDetect.isDetected) {
    dotcol = "#03A9F4";
    angle += 0.01;
  } else {
    dotcol = "#E91E63";
  }
  
  push();
  rotate(-angle); // Rotate Particle Effect
  let p = new Particle(); // Constructs New Particle object and stores in p
  particles.push(p); // Stores p in particles array
  
  // Draws Particles in particle array and updates location of particle so it moves
  for (let i = 0; i < particles.length; i++) { // Loops over the array of parrticles
    if (!particles[i].remover()) { // Checks if Particle is On Screen 
      particles[i].update(); // Update location of Particle
      particles[i].drawit(); // Draws Particle
    } else {
      particles.splice(i, 1); // Removes Particles that are off Screen
    }
  }
  pop();

  polygone(spectrum, 0, "#00BCD4CE"); // Calls Polygone Function and Sets it to Blue and start Angle to Zero
  polygone(spectrum, PI, "#FFEB3BC4"); // Calls Polygone Function and Sets it to Yellow and start Angle to PI

  circle_outer(dotcol); // Calls Outer Circle Function and passes specles color
  circle_middle(); // Calls middle Circle Function
  circle_inner(); // Calls inner Circle Function

  angle += 0.003; // Rotation Speed of Particle
  bangle = (bangle + (bangle + bass - 0.01)) / 2 + 0.003; // Rotation Speed of Outer Cricle which is increased based on enegery of bass
  mangle += 0.003 + mid; // Rotation Speed of Middle Cricle which is increased based on enegery of Mids
  tangle += 0.003 + treble; // Rotation Speed of Inner Cricle which is increased based on enegery of Trebble
}

function circle_outer(dotcol) {
  // Yellow Circle
  // Function Draws the Outer Circle, takes in the color of the specles as a parameter
  strokeWeight(0); // Set Stroke Weight to Zero 
  fill("#FFC107"); // Set Color to Yellow
  circle(0, 0, radius * 4 + lineLength * 2 + 10 + 50 + lineLength * 2 + 35); // Draws Disk

  push();
  fill(dotcol); // Fills Circle

  rotate(bangle); // Rotates Circle based on bangle value

  // Draws particle in particle array that are the Spectlces,  based on the random cordinates and sizes 
  for (let i = 0; i <= num_partics; i++) { 
    let p = particle[i];
    let distance = dist(0, 0, p.x, p.y);

    if (distance < radius * 3.5) {
      square(p.x, p.y, p.z);
    }
  }

  pop();
  fill(20); // Sets Fill to Black
  circle(0, 0, radius * 2 + lineLength * 2 + 10 + 50 + lineLength * 2 + 80); // Draws Inner circle: Black to create the Disk
}

function circle_middle() {
  // Function Draws the Middle Circle
  strokeWeight(0); // Set Stroke Weight to Zero
  fill("blue"); // Sets Color to Blue
  circle(0, 0, radius * 2 + lineLength * 2 + 10 + 50 + lineLength * 2 + 40); // Draws Outer circle/Disk

  fill(20); // Sets Fill to Black
  circle(0, 0, radius + lineLength * 2 + radius + 10 + 50); // Draws Inner circle

  
  // Sets Cordinates for the The Lines 
  let radius2 = radius + lineLength + 40;
  for (let i = 0; i < numLines; i++) {
    let x1 = radius2 * cos(-mangle);
    let y1 = radius2 * sin(-mangle);
    let x2 = (radius2 + lineLength) * cos(-mangle - angleOffset);
    let y2 = (radius2 + lineLength) * sin(-mangle - angleOffset);

    strokeWeight(10); // Sets Line Thikness 
    stroke(255, 105, 180); // Sets Color of the Line
    strokeCap(PROJECT); // Sets Line Ends to be Project Forward and Square
    line(x1, y1, x2, y2); // Draws The Lines
    mangle += TWO_PI / numLines; // Increases the angle for the next line
  }
}

function circle_inner() {
  // Draw the Circles
  strokeWeight(0); // Set Stroke Weight to Zero
  fill(183, 255, 80); // Sets Color to Blue
  circle(0, 0, radius + lineLength * 2 + radius + 20); // Draws Outer circle/Disk

  fill(20); // Sets Fill to Black
  circle(0, 0, radius * 2 - 30);  // Draws Inner circle

  // Sets Cordinates for the The Lines 
  for (let i = 0; i < numLines; i++) {
    let x1 = radius * cos(tangle);
    let y1 = radius * sin(tangle);
    let x2 = (radius + lineLength) * cos(tangle + angleOffset);
    let y2 = (radius + lineLength) * sin(tangle + angleOffset);

    strokeWeight(7); // Sets Line Thikness
    stroke(190, 0, 252); // Sets Color of the Line
    strokeCap(PROJECT);  // Sets Line Ends to be Project Forward and Square
    line(x1, y1, x2, y2); // Draws The Lines
    tangle += TWO_PI / numLines; // Increases the angle for the next line
  }
}

class Particle {
  // Particles was made By Following the following tutorial
  // https://www.youtube.com/watch?v=uk96O7N1Yo0&t=40s&ab_channel=ColorfulCoding
  // Class for Particle Effect Objects, Creates Particles that Eminate from the Center and moves outwards 

  // Creates / Initialized Objects 
  constructor() {
    this.posit = p5.Vector.random2D().mult(100); // Determines Position of Object
    this.speed = createVector(0, 0); // Determines Speed of Object
    this.acelrt = this.posit.copy().mult(random(0.0002, 0.00002));  // Determines Accelaration of Object
  }
  
  // Draws Particle
  drawit() {
    stroke(250); // Sets Color to White
    circle(this.posit.x, this.posit.y, 2); // Draws Cricle with radius 2
  }
  
  // Updates Positions and and Speed of Particle
  update() {
    this.speed.add(this.acelrt); // Increases Speed
    this.posit.add(this.speed); // Moves Object 
  }
  
  // Removes particles that are outside the screen
  // If Particle x or y postion is greater than the max of height/2 or widith/2 of the screen
  // less than the min of -height/2 or -widith/2 of the screen returns true else return false
  remover() {
    if (
      this.posit.x < min(-width / 2, -height / 2) ||
      this.posit.x > max(width / 2, height / 2) ||
      this.posit.y < min(-width / 2, -height / 2) ||
      this.posit.y > max(width / 2, height / 2)
    ) {
      return true;
    } else {
      return false;
    }
  }
}



function polygone(spectrum, angmod = 0, clr = "#E2F80970") {
  // Draws a Sound Reactive Dodecogon where the position of the corners are
  // based on the amplitude of the frequency bin
  // function takes in spectrum of the sound, initial angle of the shape, color of the shape
  
  var avgSpectrum = []; // Creates average spectrum array
  
  // Loops through the 64 spectrum bins and then turing it into 13 bins
  // 13 bins are made by averaging 5 neighbooring bins and stores these bins in avgSpectrum 
  for (let a = 0; a < 64; a += 5) {
    let sum = 0;
    for (let b = 0; b < 5; b++) {
      sum = sum + spectrum[a + b];
    }
    
    // Checks if sum of bins is NA, if it is stores zero in avgspectrum else stores avarage
    if (isNaN(sum)) {
      avgSpectrum.push(0);
    } else {
      avgSpectrum.push(sum / 5);
    }
  }

  // Increases the ampletude of the first bin to make it more even 
  avgSpectrum[0] = avgSpectrum[0] * 1.001;

  push();
  rotate(angle2 + angmod); // Rotates Polygon
  noFill(); // Sets to no Fill
  strokeWeight(20); // Sets Line Thickness
  stroke(clr); // Sets Line Color
  beginShape(); // Draws Polygon with vertex modified by amplitude of sound frequencies
  vertex(129 + avgSpectrum[0], -483 - avgSpectrum[0]);
  vertex(-129 - avgSpectrum[1], -483 - avgSpectrum[1]);
  vertex(-354 - avgSpectrum[2], -354 - avgSpectrum[2]);
  vertex(-483 - avgSpectrum[3], -129 - avgSpectrum[3]);
  vertex(-483 - avgSpectrum[4], 129 + avgSpectrum[4]);
  vertex(-354 - avgSpectrum[5], 354 + avgSpectrum[5]);
  vertex(-129 - avgSpectrum[6], 483 + avgSpectrum[6]);
  vertex(129 + avgSpectrum[7], 483 + avgSpectrum[7]);
  vertex(354 + avgSpectrum[8], 354 + avgSpectrum[8]);
  vertex(483 + avgSpectrum[9], 129 + avgSpectrum[9]);
  vertex(483 + avgSpectrum[10], -129 - avgSpectrum[10]);
  vertex(354 + avgSpectrum[11], -354 - avgSpectrum[11]);
  endShape(CLOSE);
  angle2 += 0.015; // Increases Rotation Angle
  pop();
}

// Following Functions Taken Professor Jon E. Froehlich

// In 2017, Chrome and other browsers started adding additional protection to browsers
// so that media would not auto-play and browsers could not auto-start microphones or
// cameras without the users' permission. So, to get the microphone to work, the user
// must explicitly interact with the page

function drawEnableMicText(){
  push();
  
  fill('#3F51B5');
  noStroke();

  const fontSize = 30;
  const instructionText = "Touch or click the screen to begin";
  const guidetext = "Press Control to Center and Hold Left Click to Drag Visualization";

  textSize(fontSize);

  const strWidth = textWidth(instructionText);
  const xText = width / 2 - strWidth / 1;
  const yText = height / 3 - fontSize / 2;
  text(instructionText, xText, yText);
  text(guidetext, xText, yText + fontSize);
 
  pop();
}

function touchStarted() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
    drawAxes();
  }
}

function mouseClicked() {
  getAudioContext().resume().then(() => {
    console.log('Playback resumed successfully');
    drawAxes();
  });
}

function printAudioSourceInformation(){
  let micSamplingRate = sampleRate();
  print(mic);

  // For debugging, it's useful to print out this information
  // https://p5js.org/reference/#/p5.AudioIn/getSources
  mic.getSources(function(devices) {
    print("Your audio devices: ")
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo
    devices.forEach(function(device) {
      print("  " + device.kind + ": " + device.label + " id = " + device.deviceId);
    });
  });
  print("Sampling rate:", sampleRate());

  // Helpful to determine if the microphone state changes
  getAudioContext().onstatechange = function() {
    print("getAudioContext().onstatechange", getAudioContext().state);
  }
}

function drawFps() {
  // Draw fps
  push();
  const fpsLblTextSize = 8;
  textSize(fpsLblTextSize);
  const fpsLbl = nf(frameRate(), 0, 1) + " fps";
  const fpsLblWidth = textWidth(fpsLbl);
  const xFpsLbl = 4;
  const yFpsLbl = 10;
  fill(30);
  noStroke();
  rect(
    xFpsLbl - 1,
    yFpsLbl - fpsLblTextSize,
    fpsLblWidth + 2,
    fpsLblTextSize + textDescent()
  );

  fill(150);
  text(fpsLbl, xFpsLbl, yFpsLbl);
  pop();
}