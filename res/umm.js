class Settings{
    numNotesInput = document.getElementById("numNotesInput");
    numNotes;

    noteLengthInput = document.getElementById("noteLengthInput");
    noteLength;

    diatonicOnlyInput = document.getElementById("diatonicOnlyInput");
    diatonicOnly;

    oneOctaveInput = document.getElementById("oneOctaveInput");
    oneOctave;

    // Checkboxes for the different contours:
    ascContour  = document.getElementById("ascContour");
    descContour = document.getElementById("descContour");
    randContour = document.getElementById("randContour");
    contours = [];

    constructor(){
        this.numNotesInput.addEventListener("change", () => {
            let newValue = parseInt(this.numNotesInput.value);

            if(isNaN(newValue)){
                this.numNotesInput.value = this.numNotes;
                alert("Could not parse number of notes");
                return;
            }
            if(newValue < 2 | newValue > 12){
                this.numNotesInput.value = this.numNotes;
                alert("Number of notes must be between 2 and 12");
                return;
            }

            this.numNotes = newValue;
        });

        this.noteLengthInput.addEventListener("change", () => {
            let newValue = parseFloat(this.noteLengthInput.value);

            if(isNaN(newValue)){
                this.noteLengthInput.value = this.noteLength;
                alert("Could not parse note length");
                return;
            }

            if(newValue < 0.1 | newValue > 10){
                this.noteLengthInput.value = this.noteLength;
                alert("Note length must be between 0.1 and 10.");
                return;
            }

            this.noteLength = newValue;
        });

        this.diatonicOnlyInput.addEventListener("change", () => {
            this.diatonicOnly = this.diatonicOnlyInput.checked;
        });

        this.ascContour.addEventListener("change", () => {
            this.getSelectedContours(this.ascContour);
        });

        this.descContour.addEventListener("change", () => {
            this.getSelectedContours(this.descContour);
        });

        this.randContour.addEventListener("change", () => {
            this.getSelectedContours(this.randContour);
        });
    }

    /**
     * Since there are three contours to choose from, we've to 
     * make sure that _somethig_ is always selected. This
     * horrifying chunk of code does that. The last selected
     * contour is passed as an argument and if it comes to be
     * that nothing would be selected after that then it is
     * left checked. 
     */
    getSelectedContours(lastCheckbox){
        let contours = [];
        if(this.ascContour.checked) contours.push("ascending");
        if(this.descContour.checked) contours.push("descending");
        if(this.randContour.checked) contours.push("random");
        
        if(contours.length === 0){
            alert("You must select at least one contour type");
            lastCheckbox.checked = true;
            return;
        }

        this.contours = contours;
    }

    setDefaults(){
        this.numNotesInput.value = 3;
        this.noteLengthInput.value = 1;
        this.diatonicOnlyInput.checked = false;
        this.oneOctaveInput.checked = true;
        this.ascContour.checked = false;
        this.descContour.checked = false;
        this.randContour.checked = true;

        //
        
        this.numNotes = 3;
        this.noteLength = 1;
        this.diatonicOnly = false;
        this.oneOctave = true; 
        this.contours = ["random"];
    }
}

class MelodyMaker{
    noteNames = ["A", "B", "C", "D", "E", "F", "G"];
    accidentals = ["#", "b", ""];
    
    accidentalMap = {
        "#" : 1,
        "b" : -1,
        "" : 0
    }

    noteMap = {
        A : 0,
        B : 2,
        C : 3,
        D : 5,
        E : 7,
        F : 8,
        G : 10
    }

    octaveMap = {
        2 : 45,
        3 : 57,
        4 : 69,
        5 : 81,
        6 : 93
    }

    /**
     * Generates a random integer between the min and max arguments.
     * Maximum argument is inclusive.
     * @param {Number} min 
     * @param {Number} max 
     * @returns Number
     */
    randInt(min, max){
        max = max + 1;
        let num = min + Math.floor(Math.random() * (max - min));
        return num;
    }

    /**
     * Finds the index of the smallest entry in the array x.
     * Uses the array indexSet to, well, index the array x.
     * @param {Array} x 
     * @param {Array} indexSet 
     * @returns Number
     */
    minInd(x, indexSet){
        let curMinInd = indexSet[0];
        let curMin = x[indexSet[0]];

        for(let i = 1; i < indexSet.length; i++){
            if(x[indexSet[i]] < curMin){
                curMin = x[indexSet[i]];
                curMinInd = indexSet[i];
            }
        }

        return curMinInd;
    }

    /**
     * Removes the entry at index ind from the array x.
     * @param {Array} x 
     * @param {Number} ind 
     * @returns Array
     */
    removeEntryFromIndex(x, ind){
        let x2 = new Array(x.length - 1);
        let j = 0;

        for(let i = 0; i < ind; i++){
            x2[j] = x[i];
            j++;
        }

        for(let i = ind + 1; i < x.length; i++){
            x2[j] = x[i];
            j++;
        }

        return x2;
    }

    /**
     * Returns the order of elements in array x.
     * @param {Array} x 
     * @returns Array
     */
    order(x){
        let orderOfInds = new Array(x.length);
        let indexSet = new Array(x.length);

        for(let i = 0; i < x.length; i++){
            indexSet[i] = i;
        }

        for(let i = 0; i < x.length; i++){
            let curMin = this.minInd(x, indexSet);
            orderOfInds[i] = curMin;
            indexSet = this.removeEntryFromIndex(indexSet, curMin);
        }

        return orderOfInds;
    }

    /**
     * Input is an object of class Settings
     */
    createMelody(settings){
        let noteNameArray = new Array(settings.numNotes);
        let freqArray = new Array(settings.numNotes);
        let note, accidental, octave, midinote;

        octave = this.randInt(2, 4);

        for(let i = 0; i < settings.numNotes; i++){
            note = this.noteNames[this.randInt(0, 6)];
            
            if(!settings.diatonicOnly){
                accidental = this.accidentals[this.randInt(0, 2)];
            } else{
                accidental = "";
            }

            if(!settings.oneOctave){
                octave = this.randInt(2,4);
            }

            midinote = this.noteMap[note] + this.accidentalMap[accidental] + 
                this.octaveMap[octave];
            noteNameArray[i] = note + accidental + octave;
            freqArray[i] = 440 * Math.pow(2, (midinote - 69)/12);
        }

        let contour = settings.contours[
            this.randInt(0, settings.contours.length - 1)];

        if(contour === "ascending"){
            let order = this.order(freqArray);
            let tempName = new Array(noteNameArray.length);
            let tempFreq = new Array(freqArray.length);

            for(let i = 0; i < order.length; i++){
                tempName[i] = noteNameArray[order[i]];
                tempFreq[i] = freqArray[order[i]];
            }

            noteNameArray = tempName;
            freqArray = tempFreq;
        } else if(contour === "descending"){
            let order = this.order(freqArray);
            let tempName = new Array(noteNameArray.length);
            let tempFreq = new Array(freqArray.length);

            for(let i = order.length - 1; i >= 0; i--){
                tempName[order.length - i - 1] = noteNameArray[order[i]];
                tempFreq[order.length - i - 1] = freqArray[order[i]];
            }

            noteNameArray = tempName;
            freqArray = tempFreq;
        }

        return {
            freqs : freqArray,
            noteNames : noteNameArray
        };
    }
}

class GUI{
    constructor(){
        // Text elements
        this.trueMelodyText = 
            document.getElementById("trueMelodyText");
        this.firstNoteText = 
            document.getElementById("firstNoteText");

        // Buttons
        this.newMelodyBtn = 
            document.getElementById("newMelodyBtn");
        this.playMelodyBtn = 
            document.getElementById("playMelodyBtn");

        this.synthPowerBtn = 
            document.getElementById("synthPowerBtn");
        this.synthPowerIndicator = 
            document.getElementById("synthPowerIndicator");

        this.synth = new Synth(
            document.getElementById("pianoSVG")
        );
        this.synth.drawKeys();

        this.newMelodyBtn.addEventListener("click", 
            () => this.createNewMelody()
        );

        this.playMelodyBtn.addEventListener("click",
          () => this.playMelody()  
        );

        this.synthPowerBtn.addEventListener("click", 
            () => this.switchSynthPower());

        //

        // NOTE: We create another synth object for
        // playing the melodies so that there is no interference
        // with the virtual keyboard.
        this.melodyPlayer = new Synth();
        this.melodyMaker = new MelodyMaker();
        this.settings = new Settings();
        this.settings.setDefaults();
        this.initializeAccordions();

        // Initialize the blur effects:

            document.getElementById("trueMelodyText").style.filter = "blur(10px)";
        document.getElementById("showHideMelodyBtn").addEventListener("click", () => {
            let el = document.getElementById("trueMelodyText");

            if(el.style.filter === "blur(10px)"){
                el.style.filter = "blur(0px)";
            } else {
                el.style.filter = "blur(10px)"
            }
        });
    }

    initializeAccordions(){
        let accordions = document.getElementsByClassName("accordion");

        for(let i = 0; i < accordions.length; i++){
            let title = accordions[i].
                getElementsByClassName("accordionTitle")[0];
            let contents = accordions[i].
                getElementsByClassName("accordionContents")[0];
            contents.style.display = "block";
            title.addEventListener("click", () => {
                if(contents.style.display === "none"){
                    contents.style.display = "block";
                } else if(contents.style.display === "block"){
                    contents.style.display = "none";
                }

            });
        }
    }

    createNewMelody(){
        document.getElementById("trueMelodyText").
            style.filter = "blur(10px)";

        if(!this.melodyPlayer.powerIsOn){
            this.melodyPlayer.turnPowerOn();
        }

        this.currentMelody = 
            this.melodyMaker.createMelody(this.settings);

        this.trueMelodyText.innerText = this.currentMelody.noteNames.
            toString().replaceAll(",", ", ").replaceAll("E#", "F").
            replaceAll("Cb", "B").replaceAll("Fb", "E").replaceAll("B#", "C");
        this.firstNoteText.innerText = 
            this.trueMelodyText.innerText.split(",")[0];
    }

    playMelody(){
        if(!this.currentMelody) {
            alert("Create a melody first ♫...");
            return;
        };

        let timeOuts = new Array(this.currentMelody.freqs.length);
        timeOuts[0] = 0;

        for(let i = 1; i < this.currentMelody.freqs.length; i++){
            timeOuts[i] = timeOuts[i - 1] + this.settings.noteLength * 1000;
        }

        for(let i = 0; i < this.currentMelody.freqs.length; i++){
            setTimeout(() => {
                this.melodyPlayer.playNote(this.currentMelody.freqs[i]);
            }, timeOuts[i]);
        }

    }

    switchSynthPower(){
        if(this.synth.powerIsOn){
            this.synthPowerIndicator.style.backgroundColor = "white";
            this.synth.turnPowerOff();
        } else {
            this.synthPowerIndicator.style.backgroundColor = "green";
            this.synth.turnPowerOn();
        }
    }
}

let gui = new GUI();
