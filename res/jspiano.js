/*
  Sizes of keys are determined from the following schemata (which
  you can set yourself to produce differently shaped keyboards):

    whiteHeightProp : 6.25,
    whiteWidthProp : 1,
    blackHeightProp : 3.75,
    blackWidthProp : 0.58

  Concrete sizes in pixels are calculated by multiplying these 
  by the property scaleFactor (default is 25).

  The SVG element in which the keyboard is drawn into is automa-
  tically scaled to fit the whole keyboard if the property autoScaleSVG
  is set to true (which it is by default).

  NON-GRAPHICAL MODE:

  let synth = new Synth();
  synth.powerOn();
  synth.playNote(440);
 */
class Synth{
    powerIsOn = false;
    // Key proportions from: https://www.pianoscales.org/the-keyboard.html
    props = {
            autoScaleSVG : true,
            scaleFactor : 25,
            nOctaves : 4,
            firstOctave : 2,
            whiteHeightProp : 6.25,
            whiteWidthProp : 1,
            blackHeightProp : 3.75,
            blackWidthProp : 0.58
        }

    constructor(mainSvg, props){
        if(mainSvg == undefined) return;
        this.mainSvg = mainSvg;

        if(props != undefined){
            Object.keys(props).forEach(key => {
                this.props[key] = props[key]
            });
        }

        // TODO: Check that properties are proper

        this.keySizesPx = {
            whiteHeight : NaN,
            whiteWidth : NaN,
            blackHeight : NaN,
            blackWidth : NaN
        }

        this.nWhiteKeys = this.props.nOctaves * 7;

        this.keySizesPx.whiteHeight = this.props.whiteHeightProp * 
            this.props.scaleFactor;
        this.keySizesPx.whiteWidth = this.props.whiteWidthProp * 
            this.props.scaleFactor;
        this.keySizesPx.blackHeight = this.props.blackHeightProp * 
            this.props.scaleFactor;
        this.keySizesPx.blackWidth = this.props.blackWidthProp * 
            this.props.scaleFactor;

        if(this.props.autoScaleSVG){
            this.mainSvg.setAttribute("width", 
                this.keySizesPx.whiteWidth * this.nWhiteKeys);
            this.mainSvg.setAttribute("height", 
                this.keySizesPx.whiteHeight);
        }
    }

    createKey(x, width, height, noteNumber, fill){
        let key = document.createElementNS("http://www.w3.org/2000/svg", "rect");

        key.setAttribute("fill", fill);
        key.setAttribute("stroke", "black");
        key.setAttribute("x", x);
        key.setAttribute("y", 0);
        key.setAttribute("height", height);
        key.setAttribute("width", width);
        key.setAttribute("frequency", 
            440 * Math.pow(2, (noteNumber - 69)/12));
        key.addEventListener("click", 
            () => this.playNote(key.getAttribute("frequency")));

        return key;
    }

    drawKeys(){
        // TODO: Should be easyish to generalize?!
        // Assumes that we start on C:
        let blackPattern = [0, 1, 3, 4, 5];
        let patternInd = 0;
        
        // Should be some C (bc look above). 
        // startNote = (octave + 1) * 12
        let startNote = (this.props.firstOctave + 1) * 12; 
        let currentNote = startNote;
        let whiteKeys = []; // TODO: Pre-allocate
        let blackKeys = []; // TODO: Pre-allocate

        for(let i = 0; i < this.nWhiteKeys; i++){
            whiteKeys.push(
                this.createKey(
                    i * this.keySizesPx.whiteWidth, 
                    this.keySizesPx.whiteWidth, 
                    this.keySizesPx.whiteHeight, 
                    currentNote, 
                    "white"));
            currentNote++;
            
            if((i % 7) === blackPattern[patternInd]){
                blackKeys.push(
                    this.createKey(
                        i * this.keySizesPx.whiteWidth + 
                            this.keySizesPx.whiteWidth - 
                            this.keySizesPx.blackWidth/2,
                        this.keySizesPx.blackWidth, 
                        this.keySizesPx.blackHeight, 
                        currentNote, 
                        "black"));
                currentNote++;

                patternInd++;

                if(patternInd === 5){
                    patternInd = 0;
                }
            }
        }

        whiteKeys.forEach(key => this.mainSvg.appendChild(key));
        blackKeys.forEach(key => this.mainSvg.appendChild(key));
    }

    //

    // powerOn
    turnPowerOn(){
        this.audioCtx = new AudioContext();
        this.oscillator = this.audioCtx.createOscillator();
        this.gain = this.audioCtx.createGain();
        this.gain.gain.setValueAtTime(0.0, this.audioCtx.currentTime);
        this.oscillator.connect(this.gain);
        this.gain.connect(this.audioCtx.destination);
        this.oscillator.start();

        this.powerIsOn = true;
    }

    // powerOff
    turnPowerOff(){
        this.audioCtx.destination.disconnect();
        this.gain.disconnect();
        this.oscillator.disconnect();
        this.oscillator.stop();
        this.audioCtx.close();

        this.powerIsOn = false;
    }

    playNote(frequency){
        if(!this.powerIsOn) return;

        this.oscillator.frequency.setValueAtTime(
            frequency, this.audioCtx.currentTime);
        this.gain.gain.cancelScheduledValues(
            this.audioCtx.currentTime);
        this.gain.gain.setValueAtTime(0, 
            this.audioCtx.currentTime);    
        this.gain.gain.linearRampToValueAtTime(0.2, 
            this.audioCtx.currentTime + 0.05);
        this.gain.gain.linearRampToValueAtTime(
            0, this.audioCtx.currentTime + 1); // TODO: Make length settable
    }
}
