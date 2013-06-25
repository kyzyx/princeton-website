var Events = function(svg, graphmanager, renderer) {
    var mgr = graphmanager;
    var render = renderer;
    var lastKeyDown = -1;
    var selected_node = null,
        selected_link = null,
        mousedown_link = null,
        mousedown_node = null,
        mouseup_node = null;
    var drag_line = svg.append('svg:polygon')
        .attr('class', 'edge dragline hidden')
        .attr('points', '0,0 0,0 0,0');

    var prm = null;
    var that = {
        setPageRankManager: function(p) { prm = p; },
        getSelected: function() {
            if (selected_link) return selected_link;
            else return selected_node;
        },
        resetMouseVars: function() {
            mousedown_node = null;
            mouseup_node = null;
            mousedown_link = null;
        },
        selectNode: function(n) {
            mousedown_node = n;
            if(mousedown_node === selected_node) selected_node = null;
            else selected_node = mousedown_node;
            selected_link = null;
            prm.updateNodeColors();
        },
        selectEdge: function(e) {
            mousedown_link = e;
            if (selected_link == e) selected_link = null;
            else selected_link = e;
            selected_node = null;
        },
        initNodeEvents: function(g) {
            g.on('mouseover', function(d) {
                if(!mousedown_node || d === mousedown_node) return;
                d3.select(this).select('circle').attr('transform', 'scale(1.1)');
            })
            .on('mouseout', function(d) {
                if(!mousedown_node || d === mousedown_node) return;
                d3.select(this).select('circle').attr('transform', '');
            })
            .on('mousedown', function(d) {
                if (d3.event.altKey) return;
                that.selectNode(d);
                var x = mousedown_node.x; var y = mousedown_node.y;
                var s = x + "," + y;
                drag_line
                   .classed('hidden', false)
                   .attr('points', s + " " + s + " " + s);
                render.restart();
            })
            .on('mouseup', function(d) {
                if(!mousedown_node) return;
                drag_line.classed('hidden', true)

                // check for drag-to-self
                mouseup_node = d;
                if(mouseup_node === mousedown_node) { that.resetMouseVars(); return; }

                // unenlarge target node
                d3.select(this).attr('transform', '');

                var link = mgr.addEdge(mousedown_node, mouseup_node);
                that.selectEdge(link);
                render.restart();
                if (prm) {
                    prm.init();
                    prm.converge();
                }
            });
        },
        mousedown: function() {
          // prevent I-bar on drag
          d3.event.preventDefault();
          // because :active only works in WebKit?
          d3.select('#svg_area').classed('active', true);
        },
        doubleclick: function() {
          // insert new node at point
          var point = d3.mouse(this);
          selected_node = mgr.addNode({x:point[0], y:point[1], size:40});
          selected_link = null;
          render.restart();
          if (prm) {
              prm.init();
              prm.converge();
          }
        },
        mousemove: function() {
          if(!mousedown_node) return;
          var mousepos = {x: d3.mouse(this)[0], y: d3.mouse(this)[1]};
          drag_line.attr('points', render.getEdgePoints({target: mousepos, source: mousedown_node}));
        },
        mouseup: function() {
          if(mousedown_node) drag_line.classed('hidden', true)
          // because :active only works in WebKit?
          d3.select('#svg_area').classed('active', false);
          that.resetMouseVars();
        },
        keydown: function() {
          if(lastKeyDown !== -1) return;
          lastKeyDown = d3.event.keyCode;
          if(d3.event.keyCode === 18) {
            render.dragNodes();
            d3.select('#svg_area').classed('ctrl', true);
          }

          if (!selected_node && !selected_link) return;
          switch(d3.event.keyCode) {
            case 8: // backspace
            case 46: // delete
                if (selected_node) {
                    mgr.deleteNode(selected_node);
                    if (prm) {
                        prm.init();
                        prm.converge();
                    }
                } else if (selected_link) {
                    mgr.deleteEdges(selected_link);
                    if (prm) {
                        prm.init();
                        prm.converge();
                    }
                }
                selected_link = null;
                selected_node = null;
                render.restart();
                d3.event.preventDefault();
                break;
          }
        },
        keyup: function() {
          lastKeyDown = -1;
          if(d3.event.keyCode === 18) {
              render.undragNodes();
              d3.select('#svg_area').classed('ctrl', false);
          }
        },
        registerEvents: function(svg) {
            svg.on('mousedown', that.mousedown)
              .on('mousemove', that.mousemove)
              .on('mouseup', that.mouseup)
              .on('dblclick', that.doubleclick);
            d3.select(window)
              .on('keydown', that.keydown)
              .on('keyup', that.keyup);
        },
    };
    return that;
};
