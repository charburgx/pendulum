function arrowL(x1, y1, x2, y2, linelength, linewidth, headwidth, headlength, color) {
    let tip = new Victor(x2 - x1, y2 - y1)
              .norm().multiply(scalar(linelength))
              .add(new Victor(x1, y1))
    //console.log(tip.length())
    return arrow(x1, y1, tip.x, tip.y, linewidth, headwidth, headlength, color)
}

function arrow(x1, y1, x2, y2, linewidth, headwidth, headlength, color) {
    let c = color ? color : 0x000000

    let vec = new Victor(x2 - x1, y2 - y1)
    //console.log(tip.x)
    let arrowbase = vec.clone().norm().multiply(scalar(-1 * headlength))
    let arrowbasel = new Victor(arrowbase.y, -arrowbase.x).norm().multiply(scalar( headwidth / 2 ))
    let arrowbaser = arrowbasel.clone().multiply(scalar(-1))

    let p0 = vec.clone().add(new Victor(x1, y1))
    let p1 = p0.clone().add(arrowbase).add(arrowbasel)
    let p2 = p0.clone().add(arrowbase).add(arrowbaser)

    let triangle = new Graphics()

    triangle.beginFill(c)
    triangle.drawPolygon([p0.x, p0.y, p1.x, p1.y, p2.x, p2.y])
    triangle.endFill()

    //console.log(p0.x)

    let length = vec.length()
    let linetip = vec.clone().norm().multiply(scalar(length - headlength))

    let line = new Graphics()
    line.lineStyle(linewidth, c, 1);
    line.moveTo(x1, y1)
    line.lineTo(x1 + linetip.x, y1 + linetip.y)

    //console.log("uwu" + p0.clone().add(arrowbase))

    return { line: line, triangle: triangle, origin: new Victor(x1, y1), tip: new Victor(x2, y2) }
}

function scalar(n) {
    return new Victor(n, n)
}

function between( p0, p1, fac ) {
    return p1.clone()
             .subtract(p0)
             .norm().multiply(scalar(fac))
             .add(p0)
}

function clamp(val, min, max, outmin, outmax) {
    if(val >= max) return outmax
    if(val <= min) return outmin

    return (outmin + ((outmax - outmin) * ((val - min) / (max - min))))
}

function hexToColor(rrggbb) {
    //var bbggrr = rrggbb.substr(4, 2) + rrggbb.substr(2, 2) + rrggbb.substr(0, 2);
    //console.log(bbggrr)
    return parseInt(rrggbb, 16);
}