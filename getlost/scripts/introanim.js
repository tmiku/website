function createBaseAngles(n) {
    //returns an array of n angles evenly distributed (radians)
    return Array.from({length: n}, () => Math.random() * 2 * Math.PI)
}

function getNextPoint(lastPoint, baseAngle, baseLength) {
    let curAngle = (baseAngle - (Math.PI/4)) + (Math.random() * Math.PI/2);
    let curLength = (baseLength * 0.75) + (Math.random() * baseLength * 0.5);
    console.log("last point was: ", lastPoint)
    console.log("CurLength is ", curLength)
    console.log(lastPoint[0], lastPoint[1])
    return [lastPoint[0] + curLength * Math.cos(curAngle), lastPoint[1] + curLength * Math.sin(curAngle)]
}

function generateLine(baseAngle) {
    console.log("generating line...")
    let fullLine = [[0,0]];
    let baseLength = 25; //temp hardcode this, might make more flexible later
    for (i = 0; i < 35; i++) { //temp hardcode high number of steps
        fullLine.push(getNextPoint(fullLine.slice(-1)[0], baseAngle, baseLength))
    }
    console.log("line: ", fullLine)
    return fullLine;
}

//ready function
$(() => {
    let w = window.innerWidth;
    let h = window.innerHeight;
    console.log(w, h);
    //if you resize the window after this i'll kill myself

    let angs = createBaseAngles(20);
    console.log("angs: ", angs)
    let lineCoords = angs.map(generateLine);
    console.log("lines:", lineCoords);

    let shiftedLines = lineCoords.map( (lineCoord) => {
        return lineCoord.map( pt => [Math.round(pt[0] + w/2), Math.round(pt[1] + h/2)])
    });

    // fuck, ok, AH
    console.log(shiftedLines);

    let s = SVG().addTo("#bg").size(w, h);
    let lineSvgs = [];
    for (let i=0; i < shiftedLines.length; i++) {
        lineSvgs[i] = s.polyline(shiftedLines[i]).fill('none').stroke({width: 2, color: 'black'});
    }
    //let line1 = s.polyline(shiftedLines[0]).fill('none').stroke({width: 2, color: 'black'})
}
);