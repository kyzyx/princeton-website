function renderKnob(center, p, r, color, ctx) {
    var dp = Math.sqrt(dist2(p, center));
    var pp = [(p[0] - center[0])*r/dp + center[0], (p[1] - center[1])*r/dp + center[1]];
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(center[0], center[1], r, 0, 2*Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(center[0], center[1]);
    ctx.lineTo(pp[0], pp[1]);
    ctx.stroke();
}
function renderPie(center, p, a, color, ctx) {
    var r = Math.sqrt(dist2(p,center));
    var theta = Math.atan2(p[1]-center[1], p[0] - center[0]);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(center[0], center[1]);
    ctx.lineTo(p[0], p[1]);
    ctx.arc(center[0], center[1], r, theta, a);
    ctx.lineTo(center[0], center[1]);
    ctx.stroke();
}

function renderWave(widget, skeleton, ctx, w, h) {
    var maxr = skeleton.getArmlength(w,h)/2;
    var color = widget['wave_color'];
    var rc = skeleton.joint('rightshoulder', w, h);
    var lc = skeleton.joint('leftshoulder', w, h);
    var rh = skeleton.joint('righthand', w, h);
    var lh = skeleton.joint('lefthand', w, h);
    var renderl = true; var renderr = true;
    if (widget['wave_hands'] == 'wave_hands_right') renderl = false;
    else if (widget['wave_hands'] == 'wave_hands_left') renderr = false;

    if (widget['wave_visualization'] == 'wave_vis_pie') {
        if (renderr) renderPie(rc, rh, 0, color, ctx);
        if (renderl) renderPie(lc, lh, 0, color, ctx);
    } else if (widget['wave_visualization'] == 'wave_vis_knob') {
        if (renderr) renderKnob(rc, rh, maxr, color, ctx);
        if (renderl) renderKnob(lc, lh, maxr, color, ctx);
    }
}
