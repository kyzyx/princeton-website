// From: http://jeshua.me/blog/SamplingUnivariateGaussianinJavascript
Math.normrnd = function(mean,std) { 
    if(this.extra == undefined){         
        var u,v;var s = 0; 
        while(s >= 1 || s == 0){ 
            u = Math.random()*2 - 1; v = Math.random()*2 - 1; 
            s = u*u + v*v; 
        } 
        var n = Math.sqrt(-2 * Math.log(s)/s); 
        this.extra = v * n; 
        return mean + u * n * std; 
    } else{ 
        var r = mean + this.extra * std; 
        this.extra = undefined; 
        return r; 
    } 
}
function scale(color, brightness) {
    var ret = [];
    for (var i = 0; i < 3; ++i) {
        ret[i] = Math.floor(color[i]*brightness);
        if (ret[i] > 255) ret[i] = 255;
        if (ret[i] < 0) ret[i] = 0;
    }
    return ret;
}
function toRgb(color) {
    if (!color) return [0,0,0];
    var r = parseInt(color.substr(1,2), 16);
    var g = parseInt(color.substr(3,2), 16);
    var b = parseInt(color.substr(5,2), 16);
    return [r,g,b];
}
function rgba(rgb, a) {
    return "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + a + ")";
}
function dist2(a,b) {
    return (a[0]-b[0])*(a[0]-b[0]) + (a[1]-b[1])*(a[1]-b[1]);
}
function between(a,hi,lo) {
    if (hi<lo) return between(a,lo,hi);
    if (hi < 0) {
        var t = Math.ceil(-hi/(2*Math.PI));
        return between(a,hi+t*2*Math.PI,lo+t*2*Math.PI);
    }
    // hi > 0; hi > lo
    if (a < 0) a += 2*Math.PI*Math.ceil(-a/(2*Math.PI));
    if (lo > 0) return a < hi && a > lo;
    else return a < hi || a - 2*Math.PI > lo;
}
var EPSILON = 0.001;
function arcTo(startangle, endangle, center, r, ctx, ccw, inner) {
    var midangle = (startangle+endangle)/2;
    if (startangle - endangle > Math.PI || endangle - startangle > Math.PI) {
        arcTo(startangle, midangle, center, r, ctx, ccw, inner);
        arcTo(midangle, endangle, center, r, ctx, ccw, inner);
    } else {
        var startp = [center[0] + r*Math.cos(startangle), center[1] + r*Math.sin(startangle)];
        var endp = [center[0] + r*Math.cos(endangle), center[1] + r*Math.sin(endangle)];
        var ct = Math.cos(midangle-startangle);
        var p = [center[0] + r*Math.cos(midangle)/ct, center[1] + r*Math.sin(midangle)/ct];
        if (inner) {
            // Move a little farther from p to draw the arc
            startp[0] += EPSILON*(p[0]-startp[0])
            startp[1] += EPSILON*(p[1]-startp[1])
            endp[0] += EPSILON*(p[0]-endp[0])
            endp[1] += EPSILON*(p[1]-endp[1])
        } else {
            // Move a little closer to p to draw the arc
            startp[0] -= EPSILON*(p[0]-startp[0])
            startp[1] -= EPSILON*(p[1]-startp[1])
            endp[0] -= EPSILON*(p[0]-endp[0])
            endp[1] -= EPSILON*(p[1]-endp[1])
        }
        if (ccw) {
            ctx.lineTo(endp[0], endp[1]);
            ctx.arcTo(p[0], p[1], startp[0], startp[1], r);
        } else {
            ctx.lineTo(startp[0], startp[1]);
            ctx.arcTo(p[0], p[1], endp[0], endp[1], r);
        }
    }
}

function GlowEffect(radius, speed, stdr, stdb) {
    var last_updated = 0;
    var r = radius || 30;
    var b = 1;
    var cr = r;
    var cb = b;
    var sr = stdr || 0.4;
    var sb = stdb || 0.06;
    var s = speed || 80;
    var callback = null;
    var that = {
        update: function() {
            var dr = Math.normrnd(cr-r, sr);
            var db = Math.normrnd(cb-b, sb);
            cr -= dr;
            cb -= db;
        },
        getRadius: function() { return cr; },
        getBrightness: function() { return cb; },
        modColor: function(color) {
            var col = (typeof color === 'string')?toRgb(color):color;
            return scale(col, cb);
        },
    };
    callback = setInterval(that.update, s);
    return that;
};
