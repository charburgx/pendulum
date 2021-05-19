//import PIXI.Graphics as Graphics from "PIXI";
//import { Viewport } from './viewport'
//import * from './pixiutils.js'

PIXI.utils.sayHello()

const BGCOLOR = 0x020202
const GRIDCOLOR = 0xFFFFFF
const GRIDLINECOLOR = 0xDDDDDD
const GRIDLINEAXISCOLOR = 0xFFFFFF
const GRIDLINEWEIGHT = 0.7
const GRIDLINEAXISWEIGHT = 2
const MENUSIZE = 300

const EPSILON = 0.001;

let Graphics = PIXI.Graphics;

let app = new PIXI.Application({
    width: $(window).width() - MENUSIZE, 
    height: $(window).height(),
    antialias: true,
    //transparent: true,
    backgroundColor: BGCOLOR,
    resolution: 1
});

app.renderer.autoResize = true;

window.addEventListener("resize", function(event){ 
    resizeViewport()
  });

let camera = new Viewport.Viewport({
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    worldWidth: 512,
    worldHeight: 512,
    interaction: app.renderer.plugins.interaction 
})

app.stage.addChild(camera)

camera.drag().decelerate({friction: 0.7})
camera.moveCenter(200, 0)

//camera.moveCorner(200, 200)

let gridLines = [];

/* INIT */
document.getElementById("display").appendChild(app.view)

//camera.

/* GRID */

function updateGrid() {
    gridLines.forEach(l => {
        camera.removeChild(l)
    })
    gridLines = []

    // generate x-lines
    let dx = camX() - (camX() % xscale())
    while(dx < camX() + width()) {
        let w = GRIDLINEWEIGHT; let c = GRIDLINECOLOR;
        if(Math.abs(dx) <= EPSILON ) w = GRIDLINEAXISWEIGHT; c = GRIDLINEAXISCOLOR;

        let l = new Graphics()
        l.lineStyle(w, GRIDLINECOLOR, 1)

        l.moveTo(dx, camY())
        l.lineTo(dx, camY() + height())

        gridLines.push(l)

        dx += xscale();
    }

    let dy = camY() - (camY() % yscale())
    while(dy < camY() + height()) {
        let w = GRIDLINEWEIGHT; let c = GRIDLINECOLOR;
        if(Math.abs(dy) <= EPSILON ) w = GRIDLINEAXISWEIGHT; c = GRIDLINEAXISCOLOR;

        let l = new Graphics()
        l.lineStyle(w, GRIDLINECOLOR, 1)

        l.moveTo(camX(), dy)
        l.lineTo(camX() + width(), dy)

        gridLines.push(l)

        dy += yscale();
    }

    gridLines.forEach(l => camera.addChild(l))
}

/* Vector Field */
let fieldEnabled = true
const ARROWLENGTH = 25
const ARROWWEIGHT = 3
const ARROWHEADSIZE = 10
let maxLength = 10

let colorer = new Rainbow()
colorer.setNumberRange(0, 1)
colorer.setSpectrum('00ff00', 'f0ff00', 'ff0000')
//console.log( r.colourAt(0.3) )

let field = []
//let a = 12;
let vectorFreq = 1.5;

//let b = a*vectorFreq;

initVectorField()

function drawVectorField() {
    field.forEach(a => {
        if(!inView(a.tip)) {
            removeFieldArrow(a)
        }
    })    

    let dx = xscale(); let dy = yscale();

    let cx = camX(); let cy = camY();
    let cxo = camPos.x; let cyo = camPos.y;
    let w = width(); let h = height();
    let xdiff = cx - cxo
    let ydiff = cy - cyo

    if(cx >= cxo) {
        populateField(cx + w - xdiff, cy, cx + w, cy + h, dx, dy)
    }else{
        populateField(cx, cy, cx - xdiff, cy + h, dx, dy)
    }

    if(cy > cyo) {
        populateField( (cx >= cxo) ? cx : (cx - xdiff), cy + h - ydiff,
                       (cx >= cxo) ? ( cx + w - xdiff ) : (cx + w), cy + h, dx, dy )
    }else if(cy < cyo) {
        populateField( (cx >= cxo) ? cx : (cx - xdiff), cy,
                       (cx >= cxo) ? (cx + w - xdiff) : (cx + w), cy - ydiff, dx, dy)
        console.log("aaa")
    }
}

function refreshField() {
    let fieldCopy = [...field]

    field.forEach(a => {
        removeFieldArrow(a, true)
    })

    field = []

    fieldCopy.forEach(a => {
        //console.log("got here")
        //console.log(a.origin)
        addFieldArrow(realCoord(a.origin))
    })

    //console.log(field.length)
}

function initVectorField() {
    /*let xlen = (xscale() / vectorFreq)
    let ylen = (yscale() / vectorFreq)
    let x1 = camX() - ( camX() % (xscale() / vectorFreq) )
    let y1 = camY() - ( camY() % (yscale() / vectorFreq) )

    console.log(x1)

    for(i = x1; i >= x1; i += xlen) {
        if(i > camX() + width()) break;

        for(j = y1; j >= y1; j += ylen) {
            if(j > camY() + height()) break;

            if(Math.abs(i) <= EPSILON && Math.abs(j) <= EPSILON ) continue;

            let p = realCoord(new Victor( i, j ));

            let arrow = fieldArrow(p)
    
            camera.addChild(arrow.line)
            camera.addChild(arrow.triangle)

            field.push(arrow)
        }
    }*/

    populateField(camX(), camY(), camX() + width(), camY() + height())
}

function populateField(x1, y1, x2, y2, dx, dy) {
    dx = dx ? dx : 0; dy = dy ? dy : 0;
    x1 -= dx; x2 += dx; y1 -= dy; y2 += dy;

    let xlen = (xscale() / vectorFreq)
    let ylen = (yscale() / vectorFreq)
    let xi = x1 - ( x1 % xlen )
    let yi = y1 - ( y1 % ylen )

    //console.log(yi + ", " + y2)

    for(i = xi; i <= x2; i += xlen) {
        for(j = yi; j <= y2; j += ylen) {
            //if(j > camY() + height()) break;
            if(Math.abs(i) <= EPSILON && Math.abs(j) <= EPSILON ) continue;

            let p = realCoord(new Victor( i, j ));

            addFieldArrow(p)
        }
    }
}

function clearField() {
    field.forEach(a => {
        removeFieldArrow(a)
    })
}

function showVectorField( show ) {
    //console.log(show)
    fieldEnabled = show

    if(show) {
        field.forEach(a => {
            camera.addChild(a.line)
            camera.addChild(a.triangle)
        })
    } else {
        field.forEach(a => {
            camera.removeChild(a.line)
            camera.removeChild(a.triangle)
        })
    }
}

function removeFieldArrow(a, dontRemoveFromArray) {
    camera.removeChild(a.line)
    camera.removeChild(a.triangle)

    if(!dontRemoveFromArray) {
        aindex = field.indexOf(a)
        if(aindex >= 0) field.splice( aindex, 1 )
    }
}

function addFieldArrow(p) {
    let a = fieldArrow(p)

    if(fieldEnabled) {
        camera.addChild(a.line)
        camera.addChild(a.triangle)
    }

    field.push(a)
}

/*for(i = -b; i <b; i++) {
    for(j = -b; j < b; j++) {
        if(i == 0 && j == 0) continue;

        let p = new Victor((i * xtick()) / vectorFreq, (j * ytick()) / vectorFreq);

        let arrow = fieldArrow(p)

        //console.log([coord(p.x), coord(p.y), coord(v.x), coord(v.y)])

        //console.log(arrow.tip.length())

        camera.addChild(arrow.line)
        camera.addChild(arrow.triangle)
    }
}*/

function fieldArrow(p) {
    let v = p.clone().add(f(p))
    let arrow = arrowL(coord(p).x, coord(p).y, coord(v).x, coord(v).y, ARROWLENGTH, ARROWWEIGHT, ARROWHEADSIZE * (2 / Math.sqrt(3)), ARROWHEADSIZE, fieldColor(v.clone().subtract(p).length()))
    return arrow
}

function fieldColor(m) {
    //TODO: what are min/max values for magnitude??
    let val = clamp(m, 0, maxLength, 0, 1)
    return hexToColor( colorer.colourAt(val) )
}

/* Curve */
const curveColor = 0x03d9ff
const timeCurveColor = 0xB758ED
const curveWeight = 1.5
const timeCurveWeight = 2

let moving = true

let pen = new Graphics()
pen.beginFill(curveColor)
pen.drawCircle(0, 0, 3)
pen.endFill()

let initpoint = new Victor(Math.PI, 0.1)
pen.x = coordX(initpoint.x)
pen.y = coordY(initpoint.y)

camera.addChild(pen)

let curveShown = true
let timeCurveShown = false
let timeElapsed = 0

let curveLines = []
let timeCurveLines = []

function nextLine() {
    let theta0 = 0; let thetadot0 = 0;
    if(curveLines.length == 0 || pointChanged == true) { theta0 = theta(); thetadot0 = thetadot(); pointChanged = false; }
    else {
        let lastline = lastLine()
        theta0 = lastline.x2; thetadot0 = lastline.y2
    }

    let p = new Victor(theta0, thetadot0)
    let v = p.clone().add(f(p))
    v.subtract(p).multiply(scalar(dt())).add(p)

    let l = {x1: theta0, y1: thetadot0, x2: v.x, y2: v.y, dt: dt()}

    let lineobj = new Graphics(); lineobj.lineStyle( curveWeight, curveColor, 1 );
    let p1 = coord(new Victor(l.x1, l.y1)); let p2 = coord(new Victor(l.x2, l.y2))
    lineobj.moveTo(p1.x, p1.y); lineobj.lineTo(p2.x, p2.y); l = {...l, obj: lineobj}

    if(curveShown) {
        camera.addChild(lineobj)
    }

    curveLines.push(l)
}

function showCurve(show) {
    if(curveShown == show) return

    curveShown = show

    curveLines.forEach(l => {
        if(show) { camera.addChild(l.obj) }
        else { camera.removeChild(l.obj) }
    })
}

function showTimeCurve(show) {
    if(timeCurveShown == show) return;

    timeCurveShown = show

    timeCurveLines.forEach(l => {
        if(show) { camera.addChild(l.obj) }
        else { camera.removeChild(l.obj) }
    })
}

function lastLine() {
    return curveLines.slice(-1).pop()
}

function clearCurve() {
    curveLines.forEach(l => {
        camera.removeChild(l.obj)
    })

    timeCurveLines.forEach(l => {
        camera.removeChild(l.obj)
    })

    curveLines = []
    timeCurveLines = []
}

function resetCurve() {
    clearCurve()
    setPenPos(initpoint.x, initpoint.y)
    timeElapsed = 0
}

let currLinePercent = 0

function moveTick(delta) {
    if(!moving) return;
    if(curveLines.length == 0) { nextLine(); return; }

    let time = delta * framerate()
    let l = lastLine()
    let vec = new Victor(l.x2 - l.x1, l.y2 - l.y1)
    let len = vec.length()

    let del = l.dt ? l.dt : dt()
    let frac = time / del
    currLinePercent += frac

    let prex = pen.x

    //console.log(frac)

    if(currLinePercent >= 1) {
        //nextLine(); l = lastLine();

        let remainingTime = (currLinePercent - 1) * del
        currLinePercent = 0
        let pos = new Victor(l.x2, l.y2)
        let postest = pos.clone()
        while(true) {
            nextLine()

            l = lastLine()
            del = l.dt ? l.dt : dt()
            vec = new Victor( l.x2 - l.x1, l.y2 - l.y1 )
            len = vec.length()

            if(remainingTime > del) {
                //console.log("got here")
                remainingTime -= del
                pos.add( vec )
                continue
            }

            frac = remainingTime / del

            let f = vec.clone().multiply(scalar(frac))
            pos.add(f)
            break;
        }

        setPenPos(postest.x, postest.y)
    }else{
        let f = vec.clone().multiply(scalar(frac))
        addPenPos(f.x, f.y)
    }

    timeElapsed += time

    let dtheta = realCoord(new Victor(prex, pen.x))

    //console.log(dtheta.x + ", " + dtheta.y)

    nextTimeCurveLine(dtheta.x, -dtheta.y, time)
    
    //l.obj.lineTo( 10, 10 )
    //console.log(delta)
}

function nextTimeCurveLine(theta1, theta2, dtime) {
    let tl = { x1: timeElapsed - dtime, y1: theta1, x2: timeElapsed , y2: theta2}

    let tlineobj = new Graphics(); tlineobj.lineStyle( timeCurveWeight, timeCurveColor, 1)
    let tp1 = coord(new Victor(tl.x1, tl.y1)); let tp2 = coord(new Victor(tl.x2, tl.y2))
    tlineobj.moveTo(tp1.x, tp1.y); tlineobj.lineTo(tp2.x, tp2.y); tl = {...tl, obj: tlineobj}

    if(timeCurveShown) camera.addChild(tlineobj)

    timeCurveLines.push(tl)
}

function setMoving(m) { moving = m; }

function movePenPos(x, y) {
    setPenPos(x, y)
    currLinePercent = 0
}

app.ticker.add(delta => moveTick(delta))

let settingPoint = false
let pointChanged = false

function setPoint() {
    document.getElementsByTagName("body")[0].style.cursor="crosshair"
    settingPoint = true
}

app.renderer.plugins.interaction.on('pointerup', onClick);

function onClick(e) {
    if(settingPoint) {
        document.getElementsByTagName("body")[0].style.cursor="default"
        let x = camX() + e.data.global.x
        let y = camY() + e.data.global.y
        let p = realCoord(new Victor(x, y))

        //setMoving(false)
        movePenPos(p.x, p.y)
        initpoint.x = p.x; initpoint.y = p.y;
        pointChanged = true

        console.log(x + ", " + y)
        settingPoint = false
    }
}

for(i = 0; i < 3000; i++) {
    //nextLine()
}

/* Pendulum */

//TODO: handle window resizing
const PVIEWSIZE = 250
const PVIEWBORDERSIZE = 5
let PVIEW = true

let pviewRect = new Graphics()
pviewRect.lineStyle(PVIEWBORDERSIZE, 0xFFFFFF, 1)
pviewRect.beginFill(BGCOLOR)
//pviewRect.drawRect( 0, 400, 300, 700 )
pviewRect.drawRect( 0, 0, PVIEWSIZE, PVIEWSIZE )
pviewRect.pivot.set(PVIEWSIZE/2, PVIEWSIZE/2)
pviewRect.endFill()

const stringLen = 100
let string = new Graphics()
string.lineStyle(4, 0xAAAAAA, 1)
string.moveTo( 0, 0 )
string.lineTo( 0, stringLen )
string.pivot.set(0, 0)

let ball = new Graphics()
ball.beginFill(0xFFFFFF)
ball.drawCircle(0, stringLen, 15)
ball.pivot.set(0, 0)

ball.endFill()

let pivot = new Graphics()
pivot.beginFill(0xFFFFFF)
pivot.drawCircle(0, 0, 4)
pivot.endFill()

showPview(true)

function showPview(show) {
    PVIEW = show
    let items = [pviewRect, string, ball, pivot]

    items.forEach(i => {
        if(show) { app.stage.addChild(i) }
        else { app.stage.removeChild(i) }
    })
}

function resetPview() {
    let piv = new Victor(PVIEWSIZE/2, height() - PVIEWSIZE/2)

    ball.x = piv.x; ball.y = piv.y
    string.x = piv.x; string.y = piv.y
    pivot.x = piv.x; pivot.y = piv.y
    pviewRect.x = piv.x; pviewRect.y = piv.y;
}

resetPview()

app.ticker.add(d => {
    string.rotation = theta()
    ball.rotation = theta()
})



/* Viewport */
resizeViewport()

function resizeViewport() {
    app.renderer.view.style.left = MENUSIZE + "px";
    app.renderer.resize($(window).width() - MENUSIZE, $(window).height())
    updateGrid()
    resetPview()
}

let camPos = new Victor( camX(), camY() )

updateGrid()
camera.on('moved', (props) => {
    updateGrid()
    //drawVectorField()

    //camPos.x = camX(); camPos.y = camY();
})

/*let a = arrow(40, -50, 53, -67, 3, 10, 10, fieldColor(13))

camera.addChild(a.line)
camera.addChild(a.triangle)

let c1 = new Graphics();
c1.beginFill(0x9966FF);
c1.drawCircle(0, 0, 2);
c1.endFill();
c1.x = 40
c1.y = -50

let c2 = new Graphics()
c2.beginFill(0x9966FF);
c2.drawCircle(0, 0, 2);
c2.endFill();
c2.x = 53
c2.y = -67

camera.addChild(c1)
camera.addChild(c2)*/

console.log(f(new Victor(3, 4)))

function f(p) {
    return new Victor( p.y, - (mu() * p.y) - ( (g() / L()) * Math.sin(p.x) )  )
    //return new Victor(p.y, -( 0.1 * p.y ) - ( 4.9 * Math.sin(p.x) ))
    //return new Victor(p.x, p.y)
}

function coord(p) {
    return new Victor( coordX(p.x), coordY(p.y) )
}

function coordX(x) { return ((xscale() / xtick()) * x) }
function coordY(y) { return - ((yscale() / ytick()) * y) }

function realCoord(p) {
    return new Victor( (xtick() / xscale()) * p.x, - (ytick() / yscale()) * p.y )
}

function inView(p) {
    let x = p.x; let y = p.y;

    if(x == null && y == null) return false;
    
    if(x != null && y != null){
        return ( x >= camX() && x <= (camX() + width()) ) 
            && ( y >= camY() && y <= (camY() + height()) )
    }else if(x != null) {
        return ( x >= camX() && x <= (camX() + width()) )
    }else if(y != null) {
        return ( y >= camY() && y <= (camY() + height()) )
    }
}

/*let a = arrowL(0, 0, 64, 64, 30, 3, 10 * (2 / Math.sqrt(3)), 10, hexToColor( r.colourAt(1) ))
camera.addChild(a.line)
console.log(a.triangle)
camera.addChild(a.triangle)

let circle = new Graphics();
circle.beginFill(0x9966FF);
circle.drawCircle(0, 0, 2);
circle.endFill();
circle.x = a.uwu.x;
circle.y = a.uwu.y;*/
//camera.addChild(circle);

/*let test = new Graphics()
test.beginFill(0x000000)
test.drawPolygon([64, 64, 60, 64, 64, 60])*/

function framerate() { return (1 / 60) }
function width() { return app.view.width }
function height() { return app.view.height }
function camX() { return -camera.x }
function camY() { return -camera.y }

function xscale() { return 55 } // number of pixels between ticks
function xtick() { return 1 } // number for each tick
function yscale() { return 55 }
function ytick() { return 1 }

//function mu() { return 1 }
//function L() { return 2 }
function g() { return 9.81 }

//function dt() { return 0.01 }
function theta() { return penstate().x }
function thetadot() { return penstate().y }
function penstate() { return realCoord( new Victor( pen.x, pen.y ) ) }

function setPenPos(x, y) { pen.x = coordX(x); pen.y = coordY(y); }
function addPenPos(dx, dy) { 
    let v = realCoord(new Victor(pen.x, pen.y)); setPenPos( v.x + dx, v.y + dy )
    
    let l = lastLine()
    if(l != null) {
        //console.log(l.obj.geometry)
        //if(l.obj.geometry == null || l.obj.geometry.points == null) return

        //console.log("got here")
        //l.obj.geometry.points[2] = pen.x
        //l.obj.geometry.points[3] = pen.y
    }
}