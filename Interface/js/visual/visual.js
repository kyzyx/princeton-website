// TODO: Random hand motion
function dist2(a,b) {
    return (a[0]-b[0])*(a[0]-b[0]) + (a[1]-b[1])*(a[1]-b[1]);
}
function rotateAround(x, y, px, py, t) {
    var dx = x - px; var dy = y - py;
    var c = Math.cos(t);
    var s = Math.sin(t);
    return [px + c*dx - s*dy, py + s*dx + c*dy];
}
var Skeleton = function() {
    var joints = {
        head: [0, 0.71],
        hips: [0, 0.35],
        neck: [0, 0.6],
        rightfoot: [-0.1, 0.01],
        leftfoot:  [ 0.1, 0.01],
        righthand: [-0.2, 0.3],
        lefthand:  [ 0.2, 0.3],
        rightshoulder: [-0.08, 0.6],
        leftshoulder:  [ 0.08, 0.6],
    };
    var canvasel = $("#visualization");
    var canvas = canvasel.get(0);
    var ctx = canvas.getContext("2d");
    var w = canvas.width; var h = canvas.height;

    var draggable = ['righthand', 'lefthand', 'head'];
    var sensitivity = [35, 35, 60];
    var armlength2 = dist2(joints['lefthand'], joints['leftshoulder']);
    var armlength = Math.sqrt(armlength2);
    var bodylength = 0.35;
    var move = {
        'righthand': function(x,y) {
            if (dist2([x,y], joints['rightshoulder']) > armlength2) {
                var dx = x - joints['rightshoulder'][0];
                var dy = y - joints['rightshoulder'][1];
                var l = Math.sqrt(dx*dx+dy*dy);
                dx *= armlength/l; dy *= armlength/l;
                x = joints['rightshoulder'][0] + dx;
                y = joints['rightshoulder'][1] + dy;
            }
            joints['righthand'] = [x,y];
        },
        'lefthand': function(x,y) {
            if (dist2([x,y], joints['leftshoulder']) > armlength2) {
                var dx = x - joints['leftshoulder'][0];
                var dy = y - joints['leftshoulder'][1];
                var l = Math.sqrt(dx*dx+dy*dy);
                dx *= armlength/l; dy *= armlength/l;
                x = joints['leftshoulder'][0] + dx;
                y = joints['leftshoulder'][1] + dy;
            }
            joints['lefthand'] = [x,y];
        },
        'head': function(x,y) {
            var t = Math.atan2(y-joints['hips'][1], x-joints['hips'][0]);
            if (t < Math.PI/4 && t > -Math.PI/2) t = Math.PI/4;
            if (t > 3*Math.PI/4 || t < -Math.PI/2) t = 3*Math.PI/4;
            var ot = Math.atan2(joints['head'][1] - joints['hips'][1], joints['head'][0] - joints['hips'][0]);
            joints['head'] = rotateAround(joints['head'][0], joints['head'][1], joints['hips'][0], joints['hips'][1], t-ot);
            joints['righthand'] = rotateAround(joints['righthand'][0], joints['righthand'][1], joints['hips'][0], joints['hips'][1], t-ot);
            joints['lefthand'] = rotateAround(joints['lefthand'][0], joints['lefthand'][1], joints['hips'][0], joints['hips'][1], t-ot);
            joints['rightshoulder'] = rotateAround(joints['rightshoulder'][0], joints['rightshoulder'][1], joints['hips'][0], joints['hips'][1], t-ot);
            joints['leftshoulder'] = rotateAround(joints['leftshoulder'][0], joints['leftshoulder'][1], joints['hips'][0], joints['hips'][1], t-ot);
            joints['neck'] = [(joints['rightshoulder'][0] + joints['leftshoulder'][0])/2,(joints['rightshoulder'][1] + joints['leftshoulder'][1])/2];
        }
    };
    var currdrag = '';

    // Joint locations: Lhand, Rhand, Lshoulder, Rshoulder, Head, Hip
    var that = {
        toBody: function(x, w, h) {
            var m = w<h?w:h;
            return [(x[0] - w/2)/m, (h - x[1])/m];
        },
        toCanvas: function(x, w, h) {
            if (!w) w = 0;
            if (!h) h = 0;
            var m = w<h?w:h;
            return [w/2 + m*x[0], h - m*x[1]];
        },
        canvasDist: function(d, w, h) {
            var m = w<h?w:h;
            return m*d;
        },
        update: function() {
            // Set random positions for things  
        },
        initHandlers: function() {
            // Add mouse handlers to drag arms and head
            canvasel.mousedown(function(e) {
                var x = e.pageX - canvas.offsetLeft;
                var y = e.pageY - canvas.offsetTop;
                for (var i = 0; i < draggable.length; ++i) {
                    if (dist2(that.toCanvas(joints[draggable[i]], w, h), [x,y]) < sensitivity[i]*sensitivity[i]) {
                        currdrag = draggable[i];
                        break;
                    }
                }
            });
            canvasel.mouseup(function(e) {
                currdrag = '';
            });
            canvasel.mousemove(function(e) {
                if (!(currdrag in move)) return;
                var x = e.pageX - canvas.offsetLeft;
                var y = e.pageY - canvas.offsetTop;
                var bc = that.toBody([x,y], w, h);
                move[currdrag](bc[0], bc[1]);
            });
            canvasel.disableSelection();
        },
        joint: function(which, w, h) {
            if (!w && !h) return [joints[which][0], joints[which][1]];
            return that.toCanvas(joints[which], w, h);
        },
        getArmlength: function(w,h) {
            if (!w || !h) return armlength;
            return that.canvasDist(armlength, w, h);
        },
    };
    return that;
};

function render(kiblet, skeleton) {
    var widgets = ['background', 'arc', 'body', 'ball', 'wave', 'hands', 'punch', 'clap'];
    var render = [renderBackground, renderArc, renderBody, renderBall, renderWave, renderHands, renderPunch, renderClap];

    var ctx = $('#visualization').get(0);
    
    for (var i = 0; i < widgets.length; ++i) {
        if (widgets[i] in kiblet) {
            render[i](kiblet[widgets[i]], skeleton, ctx.getContext("2d"), ctx.width, ctx.height);
        }
    }
}

