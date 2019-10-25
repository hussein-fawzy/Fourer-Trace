//global variables
let p = [];                 //complex points of path to be drawn (x-components: real, y-components: imaginary)
let fourier;                //DFT of input path points

let time = 0;               //time of the fourier series (fourier epicycles)
let timeDirection = 0;      //0: time is increasing (automatically switches to 1), 1: time is decreasing (automatically switches to 0), 2: time is increasing and resets at the end of the cycle
let path = [];              //path drawn by the fourier epicycles

let epicyclesColor = 60;    //color used to draw epicycles


function setup() {
    frameRate(40);

    //set plotting area dimensions
    width = 800;    //canvas width
    height = 800;   //canavs height

    //create drawing canvas
    createCanvas(width, height);

    //set final path drawing epicycles locations (and drawing area dimensions in case of drawing x and y epicycles separately)
    epicyclesXCenter = width / 2;
    epicyclesYCenter = height / 2;
    
    initSketchPoints(); //initialize the points to draw

    //calculate the discrete fourier transform for the complex set of points of the path to be drawn
    //two different sets of epicycles will be created to draw each component fourierX and fourierY
    fourier = dft(p);

    //sort the fourier transform points with amplitude. results in that the epicycles drawing the path are sorted from bigger to smaller
    //this sorting step has no effect on mathematical results since the amplitudes of the epicycles are added together and therefore, order does not matter
    fourier.sort((a, b) => b.amp - a.amp);
}

function draw() {
    background(200);
    noFill(); //do not fill shapes

    //calculate and draw the epicycles end point of the fourier transform
    let v = epicycles(epicyclesXCenter, epicyclesYCenter, fourier);

    //add the current point to (or remove a point from) the final path to be drawn
    if (timeDirection == 0 || timeDirection == 2) {
        path.push(v);
    }
    else {
        path.pop();
    }

    //draw final path points
    let vertexColor = 0; //drawing color for a vertex
    for (let i = 0; i < path.length; i++) {
        //set color of current vertex using the rainbow colors
        vertexColor = rainbowColor(i * 255 / (fourier.length - 1)); //total vertices to be drawn is equal to fourierY.length. map (0, fourierY.length - 1) => (0, 255)
        stroke(vertexColor.r, vertexColor.g, vertexColor.b);

        //draw vertex
        if (i > 0) {
            strokeWeight(2);
            line(path[i - 1].x, path[i - 1].y, path[i].x, path[i].y)
        } 
        else{
            strokeWeight(5);
            point(path[i].x, path[i].y);
        }
    }
    strokeWeight(1)

    //increate (or decrease) time by dt
    //note that a drawn path is completed when the slowest epicycle (frequency = 1) completes a full rotation. and therefore, the total period of the drawn path is TWO_PI
    //divide the period of the drawn path number of frequency components to capture the changes of the fastest epicycle
    const dt = TWO_PI / fourier.length;
    
    if (timeDirection == 0) {
        time += dt;

        if (time > TWO_PI) {
            time = TWO_PI;
            timeDirection = 1;
        }
    }
    else if (timeDirection == 2) {
        time += dt;

        if (time > TWO_PI) {
            time = 0;
            path = []
        }
    }
    else if (timeDirection == 1) {
        time -= dt;

        if (time < 0) {
            time = 0;
            timeDirection = 0;
        }
    }
}


function initSketchPoints() {
    //init points of path to be drawn
    //initialized points are added to the global x and y arrays
    //any set of points forming a shape when traced can be drawn

    //create a set of points from the addition of multiple cosine waves and sine waves
    for (let i = 0; i < TWO_PI; i += TWO_PI / 120) {
        let x = 120 * cos(i) + 60 * cos(5 * i);
        let y = 120 * sin(i) + 60 * sin(5 * i);

        let c = new Complex(x, y);
        p.push(c);
    }

    //create a set of points representing the graph of a compound sine wave
    // for (let i = 0; i < TWO_PI; i += TWO_PI / 200) {
    //     let x = (i / TWO_PI * 400) - 200;
    //     let y = 120 * sin(i) + 60 * sin(5 * i) + 20 * sin(25 * i);

    //     let c = new Complex(x, y);
    //     p.push(c);
    // }
}

function epicycles(x, y, fourier) {
    //calculate and draw the epicycles representing the given fourier transform at the current time
    //x, y: center point - on the drawing canvas - of the first epicycle of the foureir transform
    //rotation: a rotation angle for the each of the epicycles

    //init variables needed inside the loop here for efficiency (explained inside the drawing for loop)
    let prevX = 0;
    let prevY = 0;
    let freq = 0;
    let radius = 0;
    let phase = 0;

    //calculate and draw epicycles
    for (let i = 0; i < fourier.length; i++) {
        prevX = x;                  //current epicycle x center
        prevY = y;                  //current epicycle y center

        freq = fourier[i].freq;     //current epicycle frequency (per unit time)
        radius = fourier[i].amp;    //current epicycle amplitude (radius)
        phase = fourier[i].phase;   //current epicycle phase shift (starting angle)
        
        x += radius * cos(freq * time + phase);  //current x component of the sum of all epicycles
        y += radius * sin(freq * time + phase);  //current y component of the sum of all epicycles

        //draw a slightly transparent circle to represent the current epicycle
        stroke(epicyclesColor, 100);
        ellipse(prevX, prevY, radius * 2);

        //draw a line from the epicycle center on the canvas to the current epicycles total sum
        stroke(epicyclesColor);
        line(prevX, prevY, x, y);
    }

    //return a vector representing the epicycles total sum at current time
    return createVector(x, y);
}

function rainbowColor(color) {
    //return the RGB color for an intermediate color between XXX and YYY where color is in the range of 0:255

    var r = Math.round(Math.sin(0.024 * color + 0) * 127 + 128);
    var g = Math.round(Math.sin(0.024 * color + 2) * 127 + 128);
    var b = Math.round(Math.sin(0.024 * color + 4) * 127 + 128);

    return {r: r, g: g, b: b}
}
