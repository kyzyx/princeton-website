function renderButtons(n, color1, color2, skeleton, ctx, w, h) {
    var inner = 0.35;
    var outer = 0.4;
    var startangle = -0.25*Math.PI;
    var endangle = 1.25*Math.PI;
    var angleinc = (endangle-startangle)/n;
    var center = [0, 0.55];
    var canvascenter = skeleton.toCanvas(center,w , h);
    var inp = skeleton.toCanvas([inner*Math.cos(0) + center[0], inner*Math.sin(0) + center[1]], w, h);
    var outp = skeleton.toCanvas([outer*Math.cos(0) + center[0], outer*Math.sin(0) + center[1]], w, h);
    var canvasinner = Math.sqrt(dist2(canvascenter, inp)); 
    var canvasouter = Math.sqrt(dist2(canvascenter, outp)); 
    var aeps = 0.007*Math.PI;
    
    var rangle = Math.atan2(skeleton.joint('righthand')[1]-center[1], skeleton.joint('righthand')[0]-center[0]);
    var langle = Math.atan2(skeleton.joint('lefthand')[1]-center[1], skeleton.joint('lefthand')[0]-center[0]);
    var rr = Math.sqrt(dist2(skeleton.joint('righthand'), center));
    var lr = Math.sqrt(dist2(skeleton.joint('lefthand'), center));
    ctx.globalCompositeOperation = 'lighter';
    for (var a = startangle; a < endangle; a += angleinc) {
        if ((between(rangle, a, a+angleinc) && rr > inner) || 
            (between(langle, a, a+angleinc) && lr > inner)) {
            ctx.fillStyle = color2;
        } else {
            ctx.fillStyle = color1;
        }

        ctx.beginPath();
        var i1 = skeleton.toCanvas([inner*Math.cos(a+aeps) + center[0], inner*Math.sin(a+aeps) + center[1]], w, h);
        var o1 = skeleton.toCanvas([outer*Math.cos(a+aeps) + center[0], outer*Math.sin(a+aeps) + center[1]], w, h);
        var i2 = skeleton.toCanvas([inner*Math.cos(a+angleinc-aeps) + center[0], inner*Math.sin(a+angleinc-aeps) + center[1]], w, h);
        var o2 = skeleton.toCanvas([outer*Math.cos(a+angleinc-aeps) + center[0], outer*Math.sin(a+angleinc-aeps) + center[1]], w, h);

        ctx.moveTo(i1[0], i1[1]);
        ctx.lineTo(o1[0], o1[1]);
        arcTo(-(a+aeps), -(a+angleinc-aeps), canvascenter, canvasouter, ctx, false, false);
        ctx.lineTo(i2[0], i2[1]);
        arcTo(-(a+angleinc-aeps), -(a+aeps), canvascenter, canvasinner, ctx, false, false);
        ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
}
var leftarchglow = GlowEffect();
var rightarchglow = GlowEffect();
function renderArch(n, c1, c2, skeleton, ctx, w, h) {
    var r = 0.35;
    var startangle = -0.25*Math.PI;
    var endangle = 1.25*Math.PI;
    var angleinc = (endangle-startangle)/n;
    var center = [0, 0.55];
    var canvascenter = skeleton.toCanvas(center,w , h);
    var inp = skeleton.toCanvas([r*Math.cos(0) + center[0], r*Math.sin(0) + center[1]], w, h);
    var canvasr = Math.sqrt(dist2(canvascenter, inp));
    var rangle = Math.atan2(skeleton.joint('righthand')[1]-center[1], skeleton.joint('righthand')[0]-center[0]);
    if (rangle < 0) rangle += 2*Math.PI;
    var langle = Math.atan2(skeleton.joint('lefthand')[1]-center[1], skeleton.joint('lefthand')[0]-center[0]);
    if (langle < 0) langle += 2*Math.PI;
    var rr = Math.sqrt(dist2(skeleton.joint('righthand'), center));
    var lr = Math.sqrt(dist2(skeleton.joint('lefthand'), center));
    // Render central arch
    ctx.strokeStyle = c1;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(canvascenter[0], canvascenter[1], canvasr, -startangle, -endangle, true);
    ctx.stroke();
    ctx.globalCompositeOperation = 'lighter';
    // Render left hand area
    if (between(langle, startangle, endangle) && lr > r) {
        var lar = leftarchglow.getRadius();
        var i1 = [canvascenter[0] + (canvasr-lar)*Math.cos(-startangle), canvascenter[1] + (canvasr-lar)*Math.sin(-startangle)];
        var o1 = [canvascenter[0] + (canvasr+lar)*Math.cos(-startangle), canvascenter[1] + (canvasr+lar)*Math.sin(-startangle)];
        var i2 = [canvascenter[0] + (canvasr-lar)*Math.cos(-langle), canvascenter[1] + (canvasr-lar)*Math.sin(-langle)];
        var o2 = [canvascenter[0] + (canvasr+lar)*Math.cos(-langle), canvascenter[1] + (canvasr+lar)*Math.sin(-langle)];
        var lcol = leftarchglow.modColor(c2);
        var gradient = ctx.createRadialGradient(canvascenter[0], canvascenter[1], 0, canvascenter[0], canvascenter[1], canvasr + lar);
        gradient.addColorStop(0,rgba(lcol,0));
        gradient.addColorStop((canvasr-lar)/(canvasr+lar),rgba(lcol,0));
        gradient.addColorStop(canvasr/(canvasr+lar),rgba(lcol,0.9));
        gradient.addColorStop(1,rgba(lcol,0));
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(i1[0], i1[1]);
        ctx.lineTo(o1[0], o1[1]);
        arcTo(-(startangle), -(langle), canvascenter, canvasr + lar, ctx, false, false);
        ctx.lineTo(i2[0], i2[1]);
        arcTo(-(langle), -(startangle), canvascenter, canvasr - lar, ctx, false, false);
        ctx.fill();
    }
    // Render right hand area
    if (between(rangle, startangle, endangle) && rr > r) {
        var rar = rightarchglow.getRadius();
        var i1 = [canvascenter[0] + (canvasr-rar)*Math.cos(-rangle), canvascenter[1] + (canvasr-rar)*Math.sin(-rangle)];
        var o1 = [canvascenter[0] + (canvasr+rar)*Math.cos(-rangle), canvascenter[1] + (canvasr+rar)*Math.sin(-rangle)];
        var i2 = [canvascenter[0] + (canvasr-rar)*Math.cos(-endangle), canvascenter[1] + (canvasr-rar)*Math.sin(-endangle)];
        var o2 = [canvascenter[0] + (canvasr+rar)*Math.cos(-endangle), canvascenter[1] + (canvasr+rar)*Math.sin(-endangle)];
        var rcol = rightarchglow.modColor(c2);
        var gradient = ctx.createRadialGradient(canvascenter[0], canvascenter[1], 0, canvascenter[0], canvascenter[1], canvasr + rar);
        gradient.addColorStop(0,rgba(rcol,0));
        gradient.addColorStop((canvasr-rar)/(canvasr+rar),rgba(rcol,0));
        gradient.addColorStop(canvasr/(canvasr+rar),rgba(rcol,0.9));
        gradient.addColorStop(1,rgba(rcol,0));
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(i1[0], i1[1]);
        ctx.lineTo(o1[0], o1[1]);
        arcTo(-(rangle), -(endangle), canvascenter, canvasr + rar, ctx, false, false);
        ctx.lineTo(i2[0], i2[1]);
        arcTo(-(endangle), -(rangle), canvascenter, canvasr - rar, ctx, false, false);
        ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
}

function renderArc(widget, skeleton, ctx, w, h) {
    var colors = widget['arc_color'].split(" ");
    var c1 = $.trim(colors[0] || "#ff00ff");
    var c2 = $.trim(colors[1] || "#990099");

    var sections = widget['arc_discrete_slider'] || 1;
    if (widget['arc_visualization'] == 'arc_vis_button') {
        renderButtons(sections, c1, c2, skeleton, ctx, w, h);
    } else if (widget['arc_visualization'] == 'arc_vis_arc') {
        renderArch(sections, c1, c2, skeleton, ctx, w, h);
    }
}
