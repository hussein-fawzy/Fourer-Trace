//global variables
let x = [];     //x points of path to be drawn
let y = [];     //y points of path to be drawn
let fourierX;   //DFT of x points
let fourierY;   //DFT of y points

let time = 0;   //time of the fourier series (fourier epicycles)
let path = [];  //path drawn by the fourier epicycles

let drawXAndYEpicycles = false; //if true, the epicycles of the x and y components of the final path will be drawn separately


function setup() {
    frameRate(40);

    //set plotting area dimensions
    width = 800;            //canvas width
    height = 800;           //canavs height

    //create drawing canvas
    createCanvas(width, height);

    //set final path drawing epicycles locations (and drawing area dimensions in case of drawing x and y epicycles separately)
    if (drawXAndYEpicycles) {
        pathAreaWidth = 500;    //width of the area of the canvas used to draw the final path
        pathAreaHeight = 500;   //height of the area of the canvas used to draw the final path

        //calcualte center point for the epicycles of the x component of the final path to be drawn
        xEpicyclesXCenter = (width - pathAreaWidth) + (pathAreaWidth / 2);
        xEpicyclesYCenter = (height - pathAreaHeight) / 2;

        //calcualte center point for the epicycles of the y component of the final path to be drawn
        yEpicyclesXCenter = (width - pathAreaWidth) / 2;
        yEpicyclesYCenter = (height - pathAreaHeight) + (pathAreaHeight / 2);
    }
    else {
        epicyclesXCenter = width / 2;
        epicyclesYCenter = height / 2;
    }

    //set drawing colors (note: color() function does not work outside setup() and draw())
    epicyclesColor = 60;
    pathColor = color(255, 0, 0);
    
    initSketchPoints(); //initialize the points to draw

    //calculate the discrete fourier transform separately for the x and y point of the path to be drawn
    //two different sets of epicycles will be created to draw each component fourierX and fourierY
    fourierX = dft(x);
    fourierY = dft(y);

    //sort the fourier transform points with amplitude. results in that the epicycles drawing the path are sorted from bigger to smaller
    //this sorting step has no effect on mathematical results since the amplitudes of the epicycles are added together and therefore, order does not matter
    fourierX.sort((a, b) => b.amp - a.amp);
    fourierY.sort((a, b) => b.amp - a.amp);
}

function draw() {
    background(220);
    noFill(); //do not fill shapes

    if (drawXAndYEpicycles) {
        //calculate the vector representing the sum of epicycles for each fourier transform at the current time
        let vx = epicycles(xEpicyclesXCenter, xEpicyclesYCenter, 0, fourierX);
        let vy = epicycles(yEpicyclesXCenter, yEpicyclesYCenter, HALF_PI, fourierY); //rotate the components of the epicycles of the y transform by 90 degrees

        //draw lines from each epicycle end point to final path
        stroke(epicyclesColor, 100);
        line(vx.x, vx.y, vx.x, vy.y);
        line(vy.x, vy.y, vx.x, vy.y);

        //add the current point to be drawn on the final path
        path.push(createVector(vx.x, vy.y));
    }
    else {
        //calculate the epicycles end point of the x and y fouriers summed together
        let v = epicyclesSum(epicyclesXCenter, epicyclesYCenter, fourierX, fourierY);

        //add the current point to be drawn on the final path
        path.push(v);
    }

    //draw final path points
    stroke(pathColor, 0, 0);
    strokeWeight(2);
    beginShape(); //connect the coming vertices by lines
    for (let i = 0; i < path.length; i++) {
        vertex(path[i].x, path[i].y);
    }
    endShape();
    strokeWeight(1)

    //increate time by dt
    //note that a drawn path is completed when the slowest epicycle (frequency = 1) completes a full rotation. and therefore, the total period of the drawn path is TWO_PI
    //divide the period of the drawn path number of frequency components to capture the changes of the fastest epicycle
    const dt = TWO_PI / fourierY.length;
    time += dt;

    //reset if the path drawing is complete
    if (time > TWO_PI) {
        time = 0;
        path = [];
    }
}


function initSketchPoints() {
    //init points of path to be drawn
    //initialized points are added to the global x and y arrays

    //any set of points forming a shape when traced can be drawn
    //create a set of points that form a flower when traced (points does not necessarily need to be initialized with cosines and sines, they can also be loaded from another file)
    for (let i = 0; i < TWO_PI; i += TWO_PI / 100) {
        x.push(60 * cos(i) + 20 * cos(8 * i));
        y.push(60 * sin(i) + 20 * sin(8 * i));
    }
}

function epicycles(x, y, rotation, fourier) {
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
        
        x += radius * cos(freq * time + phase + rotation);  //current x component of the sum of all epicycles
        y += radius * sin(freq * time + phase + rotation);  //current y component of the sum of all epicycles

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

function epicyclesSum(x, y, fourierX, fourierY) {
    //calculate and draw the sum of the epicycles representing the two given fourier transforms at the current time
    //the two fouriers are assumed to have the same length (also, and as a result, same frequencies)
    //fourierY will be rotated by 90 in the calculations to represent a direction (axis) perpendicular to that of fourierX
    //x, y: center point - on the drawing canvas - of the first epicycle of the foureir transform

    //init variables needed inside the loop here for efficiency (explained inside the drawing for loop)
    let prevX = 0;
    let prevY = 0;
    let freq = 0;
    let radius = 0;
    let phase = 0;

    //calculate and draw epicycles
    for (let i = 0; i < fourierX.length; i++) {
        prevX = x;                  //current epicycle x center
        prevY = y;                  //current epicycle y center

        //x component fourier
        freq = fourierX[i].freq;     //current epicycle frequency (per unit time)
        radius = fourierX[i].amp;    //current epicycle amplitude (radius)
        phase = fourierX[i].phase;   //current epicycle phase shift (starting angle)
        
        x += radius * cos(freq * time + phase);  //current x component of the sum of all epicycles
        y += radius * sin(freq * time + phase);  //current y component of the sum of all epicycles

        //y component fourier (fourierY rotated by 90 degrees)
        freq = fourierY[i].freq;
        radius = fourierY[i].amp;
        phase = fourierY[i].phase;
        
        x += radius * cos(freq * time + phase + HALF_PI);
        y += radius * sin(freq * time + phase + HALF_PI);

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
