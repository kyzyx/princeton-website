// TODOs: implement polygons
// ----------------------------
// Background Rendering Methods
// ----------------------------
var stars_locs = [];
var last_update = 0;
var vscale = 0.0007;
var vconst = 0.005;
var new_star_rate = 150;
var ns;
var img = new Image();
img.src = "static/room.jpg";
//var new_star_rate = 200;

function renderStars(ctx, w, h) {
    var maxr = Math.sqrt(w*w/4 + h*h/4);
    // Clear background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0,0,w,h);
    // Generate initial starfield
    if (stars_locs.length == 0) {
        for (var i = 0; i < 2*new_star_rate; ++i) {
            var r = Math.random()*maxr;
            var t = Math.random()*2*Math.PI;
            var v = (1+Math.random()*3)*vscale
            stars_locs[i] = [r, t, v];
        }
        last_update = (new Date()).getTime()-10;
        ns = new_star_rate;
    }

    ctx.fillStyle = '#ffffff';
    // Update star positions
    var currtime = (new Date()).getTime();
    var dt = currtime - last_update;
    last_update = currtime;
    for (var i = 0; i < ns;) {
        // Update star positions; velocity is scaled linearly by distance
        stars_locs[i][0] += dt*(stars_locs[i][2]*stars_locs[i][0] + vconst);
        var x = w/2 + stars_locs[i][0]*Math.sin(stars_locs[i][1]);
        var y = h/2 + stars_locs[i][0]*Math.cos(stars_locs[i][1]);
        // If star is out of screen, generate a new one
        if (x < 0 || x > w || y < 0 || y > h) {
            stars_locs[i] = stars_locs[--ns];
        } else {
            // Draw stars
            ctx.fillRect(x, y, 8*stars_locs[i][0]/maxr+2, 8*stars_locs[i][0]/maxr+2);
            ++i;
        }
    }
    for (var i = 0; i < new_star_rate*dt/1000; ++i,++ns) {
        stars_locs[ns] = [Math.random()*10, Math.random()*2*Math.PI, (1+Math.random()*3)*vscale];
    }
}

function renderPsychedelic(ctx, colors, w, h) {
    // FIXME: What does psychedelic mean?
    var x = w/2;
    var y = h/2;
    var gradient = ctx.createRadialGradient(x,y,5,x,y,(x>y?x:y));
    gradient.addColorStop(0, c1);
    gradient.addColorStop(1, c2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0,0,w,h);
}

function renderBg(widget, ctx, w, h) {
    var colors = widget['bg_style_color'] || "#ff0000 #000000";
    var c1 = $.trim(colors.split(" ")[0]);
    var c2 = $.trim(colors.split(" ")[1]);
    if (widget['bg_style_picker'] == 'bg_style_stars') {
        renderStars(ctx, w, h);
    } else {
        stars_locs.length = 0;
        if (widget['bg_style_picker'] == 'bg_style_solid') {
            ctx.fillStyle = c1;
            ctx.fillRect(0,0,w,h);
        } else if (widget['bg_style_picker'] == 'bg_style_gradient') {
            var x = w/2;
            var y = h/2;
            var gradient = ctx.createRadialGradient(x,y,5,x,y,(x>y?x:y));
            gradient.addColorStop(0, c1);
            gradient.addColorStop(1, c2);
            ctx.fillStyle = gradient;
            ctx.fillRect(0,0,w,h);
        } else if (widget['bg_style_picker'] == 'bg_style_psychedelic') {
            renderPsychedelic(ctx, [c1, c2], w, h);
        } else if (widget['bg_style_picker'] = 'bg_style_image') {
            ctx.drawImage(img,0,0,w,h);
        }
    }
}

// ------------------------
// Avatar Rendering Methods
// ------------------------

function ovalfrom(ctx, x1, y1, x2, y2, w) {
    ctx.save();
    ctx.translate((x1+x2)/2, (y1+y2)/2);
    ctx.rotate(Math.atan2(y2-y1,x2-x1));
    ctx.scale(Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1))/2,w);
    ctx.beginPath();
    ctx.arc(0,0,1,0,2*Math.PI);
    ctx.fill();
    ctx.restore();
}

function renderSkeletonAvatar(skeleton, ctx, color, w, h) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    var cv = skeleton.joint('head',w,h);
    ctx.arc(cv[0], cv[1], 30, 0, 2*Math.PI);
    cv = skeleton.joint('neck',w,h);
    ctx.moveTo(cv[0], cv[1]);
    cv = skeleton.joint('hips',w,h);
    ctx.lineTo(cv[0], cv[1]);             // Draw neck and body
    cv = skeleton.joint('leftfoot',w,h);
    ctx.lineTo(cv[0], cv[1]);             // Draw left leg
    cv = skeleton.joint('hips',w,h);
    ctx.moveTo(cv[0], cv[1]);
    cv = skeleton.joint('rightfoot',w,h);
    ctx.lineTo(cv[0], cv[1]);             // Draw right leg
    cv = skeleton.joint('lefthand',w,h);
    ctx.moveTo(cv[0], cv[1]);
    ctx.arc(cv[0], cv[1], 5, 0, 2*Math.PI);
    cv = skeleton.joint('leftshoulder',w,h);
    ctx.lineTo(cv[0], cv[1]);             // Draw left arm
    cv = skeleton.joint('rightshoulder',w,h);
    ctx.lineTo(cv[0], cv[1]);             // Draw shoulders
    cv = skeleton.joint('righthand',w,h);
    ctx.lineTo(cv[0], cv[1]);             // Draw right arm
    ctx.arc(cv[0], cv[1], 5, 0, 2*Math.PI);
    ctx.stroke();
}
function renderImageAvatar(skeleton, ctx, color, w, h) {
    var starts = ['hips', 'hips',          'neck', 'lefthand', 'leftshoulder', 'rightshoulder'];
    var ends =   ['leftfoot', 'rightfoot', 'hips', 'leftshoulder', 'rightshoulder', 'righthand'];
    var widths = [13, 13, 33, 10, 7, 10];
    var colors = ['#2266ff', '#2266ff', '#ff3300', '#ff3300', '#ff3300', '#ff3300'];
    var cv = skeleton.joint('head',w,h);
    ctx.beginPath();
    ctx.strokeStyle = '#e5b887';
    ctx.fillStyle = '#e5b887';
    ctx.arc(cv[0], cv[1], 30, 0, 2*Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.lineWidth = 9;
    ctx.strokeStyle = '#a57257';
    ctx.fillStyle = '#a57257';
    var v = [skeleton.joint('head', w, h)[0] - skeleton.joint('hips', w, h)[0],
             skeleton.joint('head', w, h)[1] - skeleton.joint('hips', w, h)[1]];
    var off = Math.atan2(v[1], v[0])+ Math.PI/2;
    ctx.arc(cv[0], cv[1], 30, off + Math.PI*21/20, off + Math.PI*39/20);
    ctx.stroke();
    ctx.lineWidth = 3;
    for (var i = 0; i < starts.length; ++i) {
        ctx.strokeStyle = colors[i];
        ctx.fillStyle = colors[i];
        var cv1 = skeleton.joint(starts[i],w,h);
        var cv2 = skeleton.joint(ends[i],w,h);
        if (ends[i] == 'leftfoot') ovalfrom(ctx, cv1[0]+8, cv1[1]-24, cv2[0], cv2[1], widths[i]);
        else if (ends[i] == 'rightfoot') ovalfrom(ctx, cv1[0]-8, cv1[1]-24, cv2[0], cv2[1], widths[i]);
        else ovalfrom(ctx, cv1[0], cv1[1], cv2[0], cv2[1], widths[i]);
    }
}
function renderSilhouetteAvatar(skeleton, ctx, color, w, h) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;
    var starts = ['neck', 'hips', 'hips',          'lefthand', 'leftshoulder', 'rightshoulder'];
    var ends =   ['hips', 'leftfoot', 'rightfoot', 'leftshoulder', 'rightshoulder', 'righthand'];
    var widths = [33, 13, 13, 10, 7, 10];
    ctx.beginPath();
    var cv = skeleton.joint('head',w,h);
    ctx.arc(cv[0], cv[1], 30, 0, 2*Math.PI);
    ctx.fill();
    for (var i = 0; i < starts.length; ++i) {
        var cv1 = skeleton.joint(starts[i],w,h);
        var cv2 = skeleton.joint(ends[i],w,h);
        if (ends[i] == 'leftfoot') ovalfrom(ctx, cv1[0]+8, cv1[1]-24, cv2[0], cv2[1], widths[i]);
        else if (ends[i] == 'rightfoot') ovalfrom(ctx, cv1[0]-8, cv1[1]-24, cv2[0], cv2[1], widths[i]);
        else ovalfrom(ctx, cv1[0], cv1[1], cv2[0], cv2[1], widths[i]);
    }
}

function renderPolygonsAvatar(skeleton, ctx, color, w, h) {
    renderSkeletonAvatar(skeleton, ctx, color, w, h);
    // FIXME
}

function renderAvatar(widget, skeleton, ctx, w, h) {
    if (widget['avatar_style_picker'] == 'avatar_style_image') {
        renderImageAvatar(skeleton, ctx, widget['fg_style_color'], w, h);
    } else if (widget['avatar_style_picker'] == 'avatar_style_silhouette') {
        renderSilhouetteAvatar(skeleton, ctx, widget['fg_style_color'], w, h);
    } else if (widget['avatar_style_picker'] == 'avatar_style_skeleton') {
        renderSkeletonAvatar(skeleton, ctx, widget['fg_style_color'], w, h);
    } else if (widget['avatar_style_picker'] == 'avatar_style_polygon') {
        renderPolygonsAvatar(skeleton, ctx, widget['fg_style_color'], w, h);
    }
}

// ------------------------
// Public Rendering Methods
// ------------------------
function renderBackground(widget, skeleton, ctx, w, h) {
    renderBg(widget, ctx, w, h);
    renderAvatar(widget, skeleton, ctx, w, h);
}
