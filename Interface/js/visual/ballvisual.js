// TODO: Lightning effect
var num_bolts = 4;
var bolt_recursion_depth = 7;

function renderLightningBolt(lh, rh, color, ctx) {
}

function renderBall(widget, skeleton, ctx, w, h) {
    var color = widget['ball_color'];
    var lh = skeleton.joint('lefthand', w, h);
    var rh = skeleton.joint('righthand', w, h);
    if (widget['ball_visualization'] == 'ball_vis_line') {
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(lh[0], lh[1]);
        ctx.lineTo(rh[0], rh[1]);
        ctx.stroke();
    } else if (widget['ball_visualization'] == 'ball_vis_ball') {
        var mid = [(lh[0]+rh[0])/2, (lh[1]+rh[1])/2];
        var radius = Math.sqrt((mid[0]-lh[0])*(mid[0]-lh[0]) + (mid[1]-lh[1])*(mid[1]-lh[1]));
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(lh[0], lh[1]);
        ctx.lineTo(rh[0], rh[1]);
        ctx.stroke();
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mid[0], mid[1], 5, 0, 2*Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(mid[0], mid[1], radius, 0, 2*Math.PI);
        ctx.stroke();
    } else if (widget['ball_visualization'] == 'ball_vis_lightning') {
        for (var i = 0; i < num_bolts; ++i) {
            renderLightningBolt(lh, rh, color, ctx);
        }
    }
}
