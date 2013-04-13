// TODO: Add flame/lightning visualizations
function renderFire(skeleton, ctx, color, w, h){
}
function renderGlowball(p, r, ctx, color) {
    ctx.globalCompositeOperation = 'lighter';
    var gradient = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], r);
    gradient.addColorStop(0, rgba(color,0.9))
    gradient.addColorStop(0.5, rgba(color,0.9))
    gradient.addColorStop(1, rgba(color,0))
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(p[0], p[1], r, 0, Math.PI*2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
}

var leftglow = GlowEffect();
var rightglow = GlowEffect();

function renderHands(widget, skeleton, ctx, w, h) {
    var color = toRgb(widget['hands_color']);
    if (widget['hands_visualization'] == 'hands_vis_neon') {
        renderGlowball(skeleton.joint('lefthand', w, h), leftglow.getRadius(), ctx, leftglow.modColor(color));
        renderGlowball(skeleton.joint('righthand', w, h), rightglow.getRadius(), ctx, rightglow.modColor(color));
    } else if (widget['hands_visualization'] == 'hands_vis_fire') {
        renderFire(skeleton.joint('righthand', w, h), ctx, rightcolor, w, h);
        renderFire(skeleton.joint('lefthand', w, h), ctx, leftcolor, w, h);
    } else if (widget['hands_visualization'] == 'hands_vis_lightning') {
        renderGlowball(skeleton.joint('lefthand', w, h), leftglow.getRadius(), ctx, leftcolor);
        renderGlowball(skeleton.joint('righthand', w, h), rightglow.getRadius(), ctx, rightcolor);
    }
}
