var Renderer = function(svg, nodes, edges) {
    var path;
    var circle;
    svg.append('svg:g').attr('id', 'back');

    var mgr;
    if (!$.isArray(nodes) && !edges && typeof(nodes) == 'object') {
        mgr = nodes;
    } else {
        mgr = GraphManager(nodes, edges); 
    }
    var charge = -2500;
    var distance = 300;
    var event_mgr;

    var zoomEnabled = false;
    var w = svg.attr('width');
    var h = svg.attr('height');
    var margin = 50;
    var nodetextfunc = function(n) { return n.id; };
    var force;

    var scale = 1;
    var fontsizescale = d3.scale.linear()
        .domain([0, 1, 1.4, 1.4001, 2])
        .range([16, 16, 19, 1, 1])
    var getFont = function() {
        return fontsizescale(scale) + 'px';
    };
    var colors = d3.scale.category10();

    var that = {
        pause: function() {
            force.stop();
        },
        resume: function() {force.resume();},
        getGraphManager: function() { return mgr; },
        getEdgePoints: function(d) {
            var tx = d.target.x;
            var ty = d.target.y;
            var sx = d.source.x;
            var sy = d.source.y;
            var deltaX = tx - sx,
                deltaY = ty - sy,
                dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
                base = 8;
                normX = deltaX / dist,
                normY = deltaY / dist,
                dx = normY*base,
                dy = -normX*base;
            if (mgr.findEdge(d.target, d.source) > -1) {
                tx += normY*base*1.1;
                ty += -normX*base*1.1;
                sx += normY*base*1.1;
                sy += -normX*base*1.1;
            }
            return (tx) + "," + (ty) + " " +
                   (sx + dx) + "," + (sy + dy) + " " +
                   (sx - dx) + "," + (sy - dy);
        },
        updateText: function() {
            circle.selectAll('text').text(nodetextfunc).attr('font-size', getFont());
            circle.selectAll('title').text(nodetextfunc);
        },
        redraw: function() {
              var fx = function(d) { return d.x; };
              var fy = function(d) { return d.y; };

              var minx = d3.min(mgr.getNodes(), fx) - margin;
              var miny = d3.min(mgr.getNodes(), fy) - margin;
              var maxx = d3.max(mgr.getNodes(), fx) + margin;
              var maxy = d3.max(mgr.getNodes(), fy) + margin;

              var vbw = d3.max([w, maxx - minx]);
              var vbh = d3.max([h, maxy - miny]);
              scale = d3.max([vbw/w, vbh/h]);
              var vbx = (maxx + minx - w*scale)/2;
              var vby = (maxy + miny - h*scale)/2;

              svg.attr('width', w*scale);
              svg.attr('height', h*scale);
              svg.select(function() {return this.parentNode;}).transition()
                  .ease('linear')
                  .duration(80)
                  .attr('viewBox', vbx + ' ' + vby + ' ' + (w*scale) + ' ' + (h*scale));

              path.attr('points', that.getEdgePoints);

              circle.attr('transform', function(d) {
                return 'translate(' + d.x + ',' + d.y + ')';
              });
              that.updateText();
        },
        restart: function() {
              svg.select('#back').empty();
              path = path.data(mgr.getEdges());
              path.classed('selected', function(d) { return d === event_mgr.getSelected(); });
              // add new links
              path.enter().append('svg:polygon')
                .attr('class', 'edge')
                .classed('selected', function(d) { return d === event_mgr.getSelected(); })
                .on('mousedown', function(d) {
                  if(d3.event.altKey) return;
                  event_mgr.selectEdge(d);
                  that.restart();
                });

              // remove old links
              path.exit().remove();

              //-------------------------------------------------------------------------
              circle = circle.data(mgr.getNodes(), function(d) { return d.id; });
              if (mgr.getNodes().length > 100) force.theta(0.9);

              // add new nodes
              var g = circle.enter().append('svg:g');
              var gg = g.append('svg:circle')
                .attr('class', 'node')
                .attr('r', function(d) { return d.size;} )
                .style('fill', function(d) { return (d === event_mgr.getSelected()) ? d3.rgb(colors(d.id)).brighter().toString() : colors(d.id); })
                .style('stroke', function(d) { return d3.rgb(colors(d.id)).darker().toString(); });
              event_mgr.initNodeEvents(g);

              // show node IDs
              g.append('svg:text')
                  .attr('x', 0)
                  .attr('y', 4)
                  .attr('class', 'id')
                  .attr('font-size', getFont())
                  .text(nodetextfunc);
              g.append('svg:title')
                  .text(nodetextfunc);

              // remove old nodes
              circle.exit().remove();

              // set the graph in motion
              force.start();
        },
        transitionNodes: function(a,v,t,selector) {
            var transitionobj;
            if (selector) transitionobj = circle.select(selector);
            else transitionobj = circle;
            transitionobj = transitionobj.transition().ease('linear').duration(t);
            if ($.isArray(a) && $.isArray(v)) {
                var l = d3.min([a.length, v.length]);
                for (var i = 0; i < l; ++i) {
                    if (a[i].substring(0,6) == 'style:')
                        transitionobj = transitionobj.style(a[i].substring(6),v[i]);
                    else 
                        transitionobj = transitionobj.attr(a[i],v[i]);
                }
            } else {
                transitionobj.attr(a,v);
            }
        },
        transitionNodeStyles: function(a,v,t,selector) {
            if (selector) circle.select(selector).transition().ease('linear').duration(t).style(a,v);
            else circle.transition().ease('linear').duration(t).style(a,v);
        },
        transitionEdges: function(a,v,t,selector) {
            if (selector) path.select(selector).transition().ease('linear').duration(t).attr(a,v);
            else path.transition().ease('linear').duration(t).attr(a,v);
        },
        dragNodes: function() {
            circle.call(force.drag);
        },
        undragNodes: function() {
            circle.on('mousedown.drag', null)
              .on('touchstart.drag', null);
        },
        setNodeTextFunction: function(f) {
            nodetextfunc = f;
            that.restart();
        },
        getEventManager: function() { return event_mgr; },
        cleanup: function() {
            force.stop();
            circle.remove();
            path.remove();
        },
    };
    force = d3.layout.force()
        .nodes(mgr.getNodes())
        .links(mgr.getEdges())
        .size([w,h])
        .linkDistance(distance)
        .charge(charge)
        .on('tick', that.redraw);
    event_mgr = Events(svg, mgr, that);
    path = svg.append('svg:g').selectAll('polygon');
    circle = svg.append('svg:g').selectAll('g');
    event_mgr.registerEvents(svg.select(function() {return this.parentNode;}));
    that.restart();
    return that;
};
