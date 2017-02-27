"use strict";

var ua = detect.parse(navigator.userAgent);
// console.log("Browser:" + ua.browser.family + " Device:" + ua.device.family + " Device type:" + ua.device.type);

// get optional default scoreMode from query_string
var queryString = (function(inputString) {
    if (inputString == "") return {};
    var outputObject = {};
    for (var i = 0; i < inputString.length; ++i)
    {
        var key=inputString[i].split('=', 2);
        if (key.length == 1)
            outputObject[key[0]] = "";
        else
            outputObject[key[0]] = decodeURIComponent(key[1].replace(/\+/g, " "));
    }
    return outputObject;
})(window.location.search.substr(1).split('&'));

var AudioContext = window.AudioContext || window.webkitAudioContext;
var Point = { 
	wh: [1050,600], xy: [7,4], // default width, height, x and y, in landscape mode
	setLength: 0 * 60, 
	mainWaitDefault: 2*1000, 
	mainWaitChange: 100, 
	maxNbr: 14, // max number of boxes to sound
	initClear: false, // if true then at start the boxes will be randomly colored
	scoreModeList: ['default', 'mellow', 'red', 'green', 'blue', 'redFull', 'greenFull', 'blueFull', 'grey', 'squares', 'lines', 'single', 'yellow'],
	metaWaitDefault: [60, 60, 40, 40, 40, 40, 40, 40, 40, 60, 60, 40, 20], 
	context: new AudioContext,
	scoreModeListExt: [], scoreModeChanged: false, scoreShuffled: false, scoreMode: queryString['mode'],
	count: 0, tuples: [], tuplesTemp: [], waitSign: -1, waitOrig: 1, waitChanged: 0,
	mainTask: false, metaTask: false, switchValue: 1, closeGUI: false
}; 

if(ua.device.type == 'Mobile') { Point.maxNbr = 3 };

// set window size
if(window.innerHeight < window.innerWidth) { // landscape
	Point.orientation = 0;  Point.orientPrev = 0; Point.margin = 150;
	Point.width = Point.wh[0]; Point.height = Point.wh[1]; Point.nbrX = Point.xy[0]; Point.nbrY = Point.xy[1];
	document.write('<canvas id="PointCanvas" width="'+Point.width+'" height="'+Point.height+'"></canvas>');
	Point.canvas = document.getElementById('PointCanvas');
	Point.canvas.style.width = window.innerWidth - Point.margin;
	Point.canvas.style.height = Point.canvas.style.width * Point.nbrY/Point.nbrX;
}
else { // portrait
	Point.orientation = 1; Point.orientPrev = 1; Point.margin = 100;
	Point.width = Point.wh[1]; Point.height = Point.wh[0]; Point.nbrX = Point.xy[1]; Point.nbrY = Point.xy[0];
	document.write('<canvas id="PointCanvas" width="'+Point.width+'" height="'+Point.height+'"></canvas>');
	Point.canvas = document.getElementById('PointCanvas');
	Point.canvas.style.height = window.innerHeight - Point.margin;
	Point.canvas.style.width = Point.canvas.style.height * Point.nbrX/Point.nbrY;
}

// Listen for resize changes
window.addEventListener("resize", function() {
	if(window.innerHeight < window.innerWidth) { 
		Point.orientation = 0;
		Point.canvas.style.width = window.innerWidth - Point.margin; 
	}
	else { 
		Point.orientation = 1;
		Point.canvas.style.height = window.innerHeight - Point.margin; 
	};
	if(Point.orientation!=Point.orientPrev) { setTimeout(function(){ window.location.reload() }) };
}, false);

// Listen for orientation changes
window.addEventListener("orientationchange", function() {
	window.location.reload();
}, false);

// add more variables to the object 
Point.boxes = Point.canvas.getContext('2d');
Point.nbrXpix = Math.floor(Point.width / Point.nbrX);
Point.nbrYpix = Math.floor(Point.height / Point.nbrY);	
Point.boxPix = Math.min(Point.nbrXpix,Point.nbrYpix);

// initialize variables
if(!Point.scoreMode) { Point.scoreMode = Point.scoreModeList[randInt(0,Point.scoreModeList.length)] };
Point.scoreModeCurrent = Point.scoreMode;
for (var i = 0; i < Point.scoreModeList.length; i++) {
	Point.scoreModeListExt.push({ name: Point.scoreModeList[i], nbrBoxes: [], colors: [] })
};
for (var x = 0; x < Point.nbrX; x++) { for (var y = 0; y < Point.nbrY; y++) { Point.tuples.push([x,y]); }; };	

// functions to control menu
Point.switch = function() {
	var btns = document.getElementsByClassName('button');
	Point.switchValue = (Point.switchValue+1)%2;
	if(Point.switchValue == 1) { // menu closed
		for (var i = 0; i < btns.length; i++) {
			btns[i].style.visibility = 'hidden';
		};
		document.getElementById('close').value = '>';
	}
	else { // menu open
		for (var i = 0; i < btns.length; i++) {
			btns[i].style.visibility = 'visible';
		};
		document.getElementById('close').value = '<';
	}
};
Point.close = function(){
	clearTimeout(Point.closeGUI);
	if(Point.switchValue==0) { Point.closeGUI = setTimeout(Point.switch,10*1000) }; // only if menu is open
}

// start and stop functions
Point.start = function() {
	if(!Point.mainTask.running) {
		Point.clearTo([0,0,0]);
		Point.init();
		Point.flicker();
	};
};
Point.stop = function() {
	Point.mainTask.stop();
	Point.metaTask.stop();
	Point.clearTo([0,0,0]);
	Point.flicker('stop');
};
Point.flicker = function(mode) {
	var interval = 100, tuple = [0,0];
	if(!mode) {mode = 'start'};
	switch(mode) {
		case 'stop': interval = 200; tuple = [Point.nbrX-1,Point.nbrY-1]; break;
		default: interval = 100;
	};	
	Point.clearTo([255,255,255],tuple);
	setTimeout(Point.clearTo,1*interval,[0,0,0],tuple);
	setTimeout(Point.clearTo,2*interval,[255,255,255],tuple);
	setTimeout(Point.clearTo,3*interval,[0,0,0],tuple);
	setTimeout(Point.clearTo,4*interval,[255,255,255],tuple);
	setTimeout(Point.clearTo,5*interval,[0,0,0],tuple);
	setTimeout(Point.clearTo,6*interval,[255,255,255],tuple);
	setTimeout(Point.clearTo,7*interval,[0,0,0],tuple);
	setTimeout(Point.clearTo,8*interval,[255,255,255],tuple);
	setTimeout(Point.clearTo,9*interval,[0,0,0],tuple);
	if(mode == 'stop') {
		setTimeout(function(){
       		Point.boxes.font = '20px monaco';
			Point.boxes.fillStyle = "rgb(255,255,255)";
        	Point.boxes.fillText(">goodbye", Point.boxPix * tuple[0], Point.boxPix * tuple[1] + 20);
			setTimeout(Point.clearTo,40*interval,[0,0,0],tuple);
		}, 10*interval)
	}
};

// constructor for tasks
Point.taskConstructor = function(funcArg, waitArg) { 
	var task = { 
		wait: waitArg, // wait time every loop
		func: funcArg, // function to execute every loop
		running: true,
		timeout: false, // variable that holds the setTimeout
		start: function() {
			this.running = true;
			return this.loop(); 
		},
		loop: function() {
			this.timeout = setTimeout(this.runLoop, this.wait);
			return this;
		},
		runLoop: function() {
			var result;
			if (!task.running) return; 
			result = task.func.call(task);
			if (typeof result == 'number') {
				if (result === 0) return;
				task.wait = result;
			}
			task.loop();
		},
		stop: function() {
			this.running = false;
			clearTimeout(this.timeout);
		}
	};
	return task.start();
};

// function that starts it all
Point.init = function() { 
	// clear to random colors
	if(Point.initClear) { Point.clearTo() };
	
	// prepare tuples
	Point.tuplesTemp = Point.tuples;
	shuffleArray(Point.tuplesTemp);
	
	// initialize score
	Point.selectScoreMode('init');
	
	// create main task
	Point.mainTask = Point.taskConstructor(function() { 
		var wait = this.wait; // in milliseconds, initially taken from waitDefault (set below)
		// console.log("WaitTime: "+wait.toFixed(2));

		// count number of loops
		Point.count += 1;
		
		// potentially clear to black
		if(Math.random() < 0.5) {
			if(Point.scoreModeChanged || Math.random() < 0.05) {
				Point.clearTo([0,0,0]); 
			};
		};
		
		// randomly shuffle the score every now and then
		if(Point.count%80 == 79) { Point.shuffleScore() };
		
		// start drawing and playing processes, pass fadeTime in seconds
		Point.drawBoxes( (wait/1000)/2 ); 	
			
		// reset wait if changed
		if(Point.waitChanged==1) { wait = Point.waitOrig; Point.waitChanged = 0; }
		
		// reset if scoreModeChanged
		if(Point.scoreModeChanged) { Point.scoreModeChanged = false }; 
		if(Point.scoreShuffled) { Point.scoreShuffled = false }; 
		
		// set new wait
		if(wait < 0.5*Point.mainWaitDefault) { Point.waitSign = 1 };
		if(wait > 2*Point.mainWaitDefault) { Point.waitSign = -1 };
		wait = wait + Point.waitSign * Point.mainWaitChange * Math.random();
		if(Math.random() < 0.1) { Point.waitOrig = wait; wait = wait / 2; Point.waitChanged = 1; };
		return wait; 
	}, Point.mainWaitDefault);  

	Point.metaTask = Point.taskConstructor(function() { // create meta task to switch scoreModes
		var wait = this.wait; 
		Point.selectScoreMode(); 
		wait = Point.metaWaitDefault[Point.scoreModeList.indexOf(Point.scoreMode)]; // wait set by scoreMode
		wait = wait + (-5 + 10 * Math.random()); // add random value between -5 and 5 sec
		// console.log("metaWait: "+wait.toFixed(2)+"sec");
		return wait * 1000;
	}, 1000 * Point.metaWaitDefault[Point.scoreModeList.indexOf(Point.scoreMode)]);  
	// console.log("metaWait: "+(Point.metaTask.wait/1000).toFixed(2)+"sec");
	
	
	// immediately stop so we can start it manually below
	Point.metaTask.stop(); 
	Point.mainTask.stop(); 

	// control mainTask
	setTimeout(function() {Point.mainTask.start(); Point.metaTask.start()}, 0*1000);
	if(Point.setLength > 0) {
		setTimeout(function() {Point.mainTask.stop()}, Point.setLength*1000);
	};
};

// function to select new scoreMode
Point.selectScoreMode = function(mode) {
	if(mode!='init') {
		while (Point.scoreMode == Point.scoreModeCurrent) {
			Point.scoreMode = Point.scoreModeList[randInt(0, Point.scoreModeList.length - 1)];		
		};
	};
	// console.log("ScoreMode: " + Point.scoreMode)
	Point.scoreModeChanged = true;
	Point.shuffleScore();
	Point.scoreModeCurrent = Point.scoreMode;
}

// function to shuffle number of boxes to change, triggered when scoreMode is changed and extra randomly
Point.shuffleScore = function() { 
	var modeIndex = Point.scoreModeList.indexOf(Point.scoreMode);

	Point.scoreShuffled = true;
	
	// set array of max number of boxes, fillArray(repMin,repMax,valMin,valMax)
	Point.scoreModeListExt[modeIndex].nbrBoxes = 
		fillArray(4,7,1,1).concat( fillArray(7,12,3,6).concat( fillArray(1,2,1,1).concat( 
			fillArray(2,4,Point.nbrX*Point.nbrY/2,Point.nbrX*Point.nbrY).concat ( fillArray(6,10,1,3) ) ) )
	);
	// create shorter alias
	Point.nbrBoxes = Point.scoreModeListExt[modeIndex].nbrBoxes;
	
	// set array of colors, which are pairs of triplets with min and max values for rgb colors
	// [ [rmin,gmin,bmin], [rmax,gmax,bmax] ], [ [rmin,gmin,bmin], [rmax,gmax,bmax] ], [ [rmin,gmin,bmin], [rmax,gmax,bmax] ],....
	switch (Point.scoreMode) {
	case 'red':
		Point.scoreModeListExt[modeIndex].colors = [ [ [100,0,0], [255,0,0] ] ];
		break;
	case 'green':
		Point.scoreModeListExt[modeIndex].colors = [ [ [0,100,0], [0,255,0] ] ];
		break;
	case 'blue':
		Point.scoreModeListExt[modeIndex].colors = [ [ [0,0,100], [0,0,255] ] ];
		break;
	case 'redFull':
		Point.scoreModeListExt[modeIndex].colors = [ [ [0,0,0], [255,0,0] ] ];
		break;
	case 'greenFull':
		Point.scoreModeListExt[modeIndex].colors = [ [ [0,0,0], [0,255,0] ] ];
		break;
	case 'blueFull':
		Point.scoreModeListExt[modeIndex].colors = [ [ [0,0,0], [0,0,255] ] ];
		break;
	case 'yellow':
		Point.scoreModeListExt[modeIndex].colors = [ [ [255,255,0], [255,255,230] ] ];
		break;
	case 'grey':
		for (var i = 0; i < randInt(5,10); i++) { 
			Point.scoreModeListExt[modeIndex].colors.push([ Array(3).fill(randInt(0,255)), [255,255,255] ] );
			Point.scoreModeListExt[modeIndex].colors[i][1] = Point.scoreModeListExt[modeIndex].colors[i][0];
		};
		break;
	case 'mellow':
		for (var i = 0; i < randInt(25,35); i++) { // mellow colors
			Point.scoreModeListExt[modeIndex].colors.push([ fillArray(3,3,85,153), [255,255,255] ]);
			for (var j = 0; j < 3; j++) {
				Point.scoreModeListExt[modeIndex].colors[i][1][j] = Point.scoreModeListExt[modeIndex].colors[i][0][j] + 25;
			};
		};	
		break;
	case 'squares':
		for (var i = 0; i < randInt(25,35); i++) { // mellow colors
			Point.scoreModeListExt[modeIndex].colors.push([ fillArray(3,3,85,153), [255,255,255] ]);
			for (var j = 0; j < 3; j++) {
				Point.scoreModeListExt[modeIndex].colors[i][1][j] = Point.scoreModeListExt[modeIndex].colors[i][0][j] + 25;
			};
		};	
		break;
	case 'lines':
		var index = 0; // to keep track of position in array
		for (var i = 0; i < randInt(1,4); i++) { // black or white
			if(Math.random()<0.5) { Point.scoreModeListExt[modeIndex].colors.push([ [255,255,255], [255,255,255] ]) }
			else { Point.scoreModeListExt[modeIndex].colors.push([ [0,0,0], [0,0,0] ]) };
			index += 1;
		};
		for (var i = 0; i < randInt(3,6); i++) { // pure colors
			Point.scoreModeListExt[modeIndex].colors.push([ [randInt(0,1)*255,randInt(0,1)*255,randInt(0,1)*255 ], [0,0,0] ]);
			for (var j = 0; j < 3; j++) {
				if( Point.scoreModeListExt[modeIndex].colors[index][0][j] == 255 ) {
					Point.scoreModeListExt[modeIndex].colors[index][1][j] = randInt(200,255);
				};
			}
			index += 1;
		};	
		break;
	default:
		var index = 0; // to keep track of position in array
		for (var i = 0; i < randInt(15,25); i++) { // all colors
			Point.scoreModeListExt[modeIndex].colors.push([ [0,0,0], [255,255,255] ]);
			index += 1;
		};
		for (var i = 0; i < randInt(5,15); i++) { // mellow colors
			Point.scoreModeListExt[modeIndex].colors.push([ fillArray(3,3,85,153), [255,255,255] ]);
			for (var j = 0; j < 3; j++) {
				Point.scoreModeListExt[modeIndex].colors[index][1][j] = Point.scoreModeListExt[modeIndex].colors[index][0][j] + randInt(10,25);
			}
			index += 1;
		};	
		for (var i = 0; i < randInt(5,8); i++) { // hard colors high
			Point.scoreModeListExt[modeIndex].colors.push([ fillArray(3,3,200,230), [255,255,255] ]);
			for (var j = 0; j < 3; j++) {
				Point.scoreModeListExt[modeIndex].colors[index][1][j] = Point.scoreModeListExt[modeIndex].colors[index][0][j] + randInt(10,25);
			}
			index += 1;
		};	
		for (var i = 0; i < randInt(5,8); i++) { // hard colors low
			Point.scoreModeListExt[modeIndex].colors.push([ fillArray(3,3,10,30), [255,255,255] ]);
			for (var j = 0; j < 3; j++) {
				Point.scoreModeListExt[modeIndex].colors[index][1][j] = Point.scoreModeListExt[modeIndex].colors[index][0][j] + randInt(10,25);
			}
			index += 1;
		};	
	};
	// create shorter alias
	Point.colors = Point.scoreModeListExt[modeIndex].colors;
	
	// console.log(Point.scoreModeListExt[modeIndex].name + " nbrBoxes: " + Point.scoreModeListExt[modeIndex].nbrBoxes);
};

// function to fill whole picture with one color
Point.clearTo = function(rgbClear, box) {
	var clearToRandom = 0;
	// console.log("Clear to rgb(" + rgbClear + ")");
	if(!rgbClear) { clearToRandom = 1 };
	if(!box) { // no specific box given
		Point.tuples.forEach(function(tuple,index){
			if(clearToRandom==1) { rgbClear = fillArray(3,3,0,255);  };
		  	Point.boxes.fillStyle = "rgb("+rgbClear[0]+","+rgbClear[1]+","+rgbClear[2]+")";
		  	Point.boxes.fillRect(Point.boxPix * tuple[0], Point.boxPix * tuple[1], Point.boxPix, Point.boxPix);		
		});
	}
	else { // just fill one specific box
	  	Point.boxes.fillStyle = "rgb("+rgbClear[0]+","+rgbClear[1]+","+rgbClear[2]+")";
	  	Point.boxes.fillRect(Point.boxPix * box[0], Point.boxPix * box[1], Point.boxPix, Point.boxPix);		
	}
};

// function to draw boxes and kick off Point.play
Point.drawBoxes = function(fadeTime) { // fadeTime in seconds
	var rgb = new Array(3),rgbText = new Array(3), red, green, blue, tuple = [], tmp;
	var nbr = Point.nbrBoxes[Point.count%Point.nbrBoxes.length];
	// console.log("nbr = " + nbr);

	// random shuffle all tuples
	if(Point.scoreMode != 'single') {
		Point.tuplesTemp = Point.tuples;
		shuffleArray(Point.tuplesTemp);
	};
			
	// special treatment for certain modes
	switch(Point.scoreMode) {
		case 'single':
			nbr = 1;
			if(Point.scoreModeChanged || Point.scoreShuffled) {
				Point.tuplesTemp = Point.tuples;
				shuffleArray(Point.tuplesTemp);
				Point.tuplesTemp = Point.tuplesTemp.filter( function(value, index) { if(index < randInt(2,4)) {return value} })
			}
			else {
				tmp = Point.tuplesTemp.shift();
				Point.tuplesTemp.push(tmp);
			}
			break;
		case 'squares':
			var x = randInt(0,Point.nbrX-2), y = randInt(0,Point.nbrY-2);
			nbr = 4;
			Point.tuplesTemp = Point.tuplesTemp.filter(
				function(value) 
				{ return value.equals([x,y]) || value.equals([x+1,y]) || value.equals([x,y+1]) || value.equals([x+1,y+1]) }
			);
			if(Math.random() < 0.1) { Point.clearTo([0,0,0]) }; 
			break;
		case 'lines':
			var x,y;
			if(Math.random()<0.5) { // vertical line
				x = randInt(0,Point.nbrX-1);
				nbr = Point.nbrY;
				Point.tuplesTemp = Point.tuplesTemp.filter(function(value) { return value[0] == x });
			}
			else { // horizontal line
				y = randInt(0,Point.nbrY-1);
				nbr = Point.nbrX;
				Point.tuplesTemp = Point.tuplesTemp.filter(function(value) { return value[1] == y });
			};
			break;
	};
	
	// change nbr boxes
	for(var index = 0; index < nbr; index += 1) {
		// get next tuple to change
		tuple = Point.tuplesTemp[index];

		// get color
		for (var i = 0; i < 3; i++) {
			rgb[i] = randInt(Point.colors[Point.count%Point.colors.length][0][i],Point.colors[Point.count%Point.colors.length][1][i]); 
			rgbText[i] = randInt(Point.colors[Point.count%Point.colors.length][0][i]+100,Point.colors[Point.count%Point.colors.length][1][i]+100); 
		};
		// console.log(Point.colors[Point.count%Point.colors.length].toString());
		// console.log(rgb);
		
		// play sound
		if(index < Point.maxNbr) {
			Point.play(rgb, fadeTime, tuple[0], tuple[1]); // fadeTime in seconds
		};
		
		// fill boxes
		Point.boxes.fillStyle = "rgb("+rgb[0]+","+rgb[1]+","+rgb[2]+")";
		Point.boxes.fillRect(Point.boxPix * tuple[0], Point.boxPix * tuple[1], Point.boxPix, Point.boxPix);
		if(Point.scoreModeChanged && index == 0) {
	        Point.boxes.font = '20px monaco';
			Point.boxes.fillStyle = "rgb("+rgbText[0]+","+rgbText[1]+","+rgbText[2]+")";
	        Point.boxes.fillText("> "+Point.scoreMode, Point.boxPix * tuple[0], Point.boxPix * tuple[1] + 20);
		}
	};
};

// function to play sines
Point.play = function(rgbArg, fadeTime, x, y) { 
	// rgbArg is array with 3 items between 0-255, fadeTime in seconds, (x,y) is position of box
    var freq = [80,200,400], baseFreq = 0.0, gain = [0,0,0];
	var attack = 0.1, release = Math.min(2,2*fadeTime); // in seconds
    var osctype = 'sine';
	var masterGain = 0.05; // in amp
    var osc1 = Point.context.createOscillator(), 
		osc2 = Point.context.createOscillator(), 
		osc3 = Point.context.createOscillator();
    var osc1gain = Point.context.createGain(), 
		osc2gain = Point.context.createGain(), 
		osc3gain = Point.context.createGain();
    var tremolo = Point.context.createGain(), 
		master = Point.context.createGain();
	var compressor = Point.context.createDynamicsCompressor();
	var tremInterval; // tremolo setInterval

	if(ua.browser.family != 'Safari' && ua.browser.family != 'Mobile Safari') {		
		var panner = Point.context.createStereoPanner();
	};

	// map rgb values to frequencies
	freq = [50 + (rgbArg[0]/255) * 100, 200 + (rgbArg[1]/255) * 200, 400 + (rgbArg[2]/255) * 400];
	// octave depending on y
	for (var i = 0; i < freq.length; i++) { freq[i] = freq[i] * (Point.nbrY - y) };
	// round to integers and add baseFreq 
	freq = [baseFreq + Number(freq[0].toFixed()), baseFreq + Number(freq[1].toFixed()), baseFreq + Number(freq[2].toFixed())]
	// map rgb values to gains
	gain = [rgbArg[0]/255, rgbArg[1]/255, rgbArg[2]/255].map(Math.sqrt);
	if(gain.equals([0,0,0])) { gain = [0.3,0.3,0.3] };
	
	// console.log("Freqs: "+freq+" Gain: "+gain);

    osc1.type = osctype;
    osc1.frequency.value = freq[0]; 
	osc1gain.gain.value = gain[0];  
    osc2.type = osctype;
    osc2.frequency.value = freq[1];
	osc2gain.gain.value = gain[1];  
    osc3.type = osctype;
    osc3.frequency.value = freq[2];
	osc3gain.gain.value = gain[2];  
	
	compressor.threshold.value = -12; 
	compressor.knee.value = 40; // 0-40 where 0=hard knee 40=soft knee
	compressor.ratio.value = 12; // 12:1 when input is 12db above threshold, output is 1db above 
	compressor.attack.value = 0.001;
	compressor.release.value = 0.25;
	    
    osc1.connect(osc1gain);
    osc2.connect(osc2gain);
    osc3.connect(osc3gain);
    osc1gain.connect(tremolo);
    osc2gain.connect(tremolo);
    osc3gain.connect(tremolo);
    tremolo.connect(master);

	// map x to panning
	if(ua.browser.family != 'Safari' && ua.browser.family != 'Mobile Safari') {		
		panner.pan.value = ( x / ((Point.nbrX-1)/2) ) - 1;
	    master.connect(panner);
	    panner.connect(compressor);
	}
	else {
	    master.connect(compressor);
	};
	
    compressor.connect(Point.context.destination);

	// attack
    master.gain.setValueAtTime(0, Point.context.currentTime);
    master.gain.linearRampToValueAtTime(masterGain, Point.context.currentTime+attack);  
	// start osc's  
    osc1.start(0); osc2.start(0); osc3.start(0);
	// start LFO
	tremolo.gain.setValueCurveAtTime( Point.lfoValues(fadeTime+release), Point.context.currentTime, fadeTime+release);

	// schedule fade out and stop
    setTimeout( function() {
        master.gain.setValueAtTime(masterGain, Point.context.currentTime);
        master.gain.linearRampToValueAtTime(0, Point.context.currentTime+release);    
        osc1.stop(Point.context.currentTime + release);
        osc2.stop(Point.context.currentTime + release);
        osc3.stop(Point.context.currentTime + release);
        setTimeout( function() { clearInterval(tremInterval) }, release * 1000);
    }, fadeTime * 1000);
};

// function to generate LFO values
Point.lfoValues = function(lfoDur) { 
	var lfoValueCount = 4096, lfoValues = new Float32Array(lfoValueCount), percent;
    var lfoFreq = 0.5 + Math.random() * 10, lfoDepth = 0.1 + Math.random() * 0.3;

    // console.log("LFO freq: " + lfoFreq.toFixed(2) + " depth: " + lfoDepth.toFixed(2));
    
    for (var i = 0; i < lfoValueCount; i++) {
        percent = (i / lfoValueCount) * lfoDur * lfoFreq ;
        lfoValues[i] = (1 - lfoDepth) + (Math.sin(percent * 2 * Math.PI) * lfoDepth );
    }
	return lfoValues;
};
