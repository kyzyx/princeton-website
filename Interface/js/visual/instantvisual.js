var rings = [];
var ringspeed = 500;
var lastupdate = 0;
var maxr = 100;

function renderRings(ctx, w, h) {
    var l = rings.length;
    if (!lastupdate) {
        lastupdate = (new Date()).getTime() - 1;
    }
    var currtime = (new Date()).getTime();
    var dt = currtime - lastupdate;
    lastupdate = currtime;
    for (var i = 0; i < rings.length; ) {
        rings[i].r += dt*ringspeed/1000;
        if (rings[i].r > maxr) {
            rings[i] = rings[rings.length - 1];
            rings.length -= 1;
        } else {
            ctx.strokeStyle = rgba(toRgb(rings[i].color), 1 - (rings[i].r/maxr));
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(rings[i].p[0], rings[i].p[1], rings[i].r, 0, 2*Math.PI);
            ctx.stroke();
            ++i;
        }
    }
}

var ringspacing = 20;

function addRings(p, color, num) {
    for (var i = 0; i < num; ++i) {
        rings.push({p:[p[0],p[1]], r: i*ringspacing, color: color});
    }
}
