var Pagerank = function(svg, renderer, a, itr) {
    var render = renderer;
    var mgr = renderer.getGraphManager();
    var alpha = a === undefined ? 0.2 : a;
    var THRESHOLD = 0.0005;    // Convergence threshold

    // Animation properties
    var iterrate = itr ? itr : 1000;
    var maxnodesize = 80;
    var minnodesize = 25;
    var animateinterval = null;

    var use_colors = false;
    var use_size = true;

    var scales = Array();
    scales[0] = d3.scale.linear()
                         .range([minnodesize, maxnodesize]);
    scales[1] = d3.scale.linear()
                          .range(colorbrewer.YlOrRd[9]);
    var tmpscale = d3.scale.linear()
                    .range([0,1]);
    var setDomains = function (minx, maxx) {
        scales[0].domain([minx, maxx]);
        tmpscale.range([minx, maxx]);
        var arr = Array();
        for (var i = 0; i < 9; ++i) arr[i] = tmpscale(i/8);
        scales[1].domain(arr);
    }
    setDomains(0,1);

    var stopanimation = function() {
        clearTimeout(animateinterval);
        animateinterval = null;
        animationnodes.select('circle').attr('r', 0);
    }
    var animateintervalfunc = function() {
                if (!that.iterate(true)) {
                    stopanimation();
                }
            };

    var animationnodes = svg.select('#back').selectAll('g.carrier');

    var runNodeTransitions = function(t) {
        var transitionfields = Array();
        var transitionvals = Array();
        transitionfields.push('r');
        transitionfields.push('style:fill');
        transitionfields.push('style:stroke');
        if (use_size) {
            transitionvals.push(function(node) {
                return scales[0](node.pr);
            });
        } else {
            transitionvals.push(function(nodee) {
                return 40;
            });
        }
        if (use_colors) {
            transitionvals.push(function(node) {
                return scales[1](node.pr);
            });
            transitionvals.push(function(node) {
                return d3.rgb(scales[1](node.pr)).darker().toString();
            });
        } else {
            transitionvals.push(function(d) {
                if (d === render.getEventManager().getSelected()) {
                    return d3.rgb(colors(d.id)).brighter().toString();
                }
                else {
                    return colors(d.id); 
                }
            });
            transitionvals.push(function(d) {
                return d3.rgb(colors(d.id)).darker().toString(); 
            });
        }
        render.transitionNodes(transitionfields, transitionvals, t, 'circle');
        render.updateText();
    };
    var colors = d3.scale.category10();

    var that = {
        isRunning: function() { return !(animateinterval == null); },
        updateNodeColors: function() { runNodeTransitions(1); },
        useSize: function(b) {
            use_size = b;
            runNodeTransitions(1);
        },
        useColors: function(b) {
            use_colors = b;
            runNodeTransitions(1);
        },
        updateAlpha:function(newalpha) {
            alpha = newalpha;
        },
        updateIterRate:function(ir) {
            iterrate = ir;
            if (animateinterval) {
                clearTimeout(animateinterval);
                animateinterval = null;
                that.animate();
            }
        },
        init:function(startnode) {
            if (animateinterval) {
                stopanimation();
            }
            var nnodes = mgr.getNodes().length;

            mgr.eachNode(function(node) {
                node.pr = 0;
                node.newpr = alpha/nnodes;
            });
            if (startnode) {
                startnode.pr = 1;
            } else {
                mgr.eachNode(function(node) {
                    node.pr = 1/nnodes;
                });
            }
            runNodeTransitions(iterrate/8);
            render.setNodeTextFunction(function(n) {
                if (n.pr) return n.pr.toExponential(3);
                else return "";
            });
        },
        iterate:function(animate) {
            var converged = true;
            // FIXME: Carrier element style
            animationnodes = animationnodes.data(mgr.getEdges());
            animationnodes.enter().append('svg:g').append('svg:circle')
                .attr('class', 'hidden carrier')
                .attr('r', 0)
                .style('fill', '#f00')
                .style('stroke', '#000');
            animationnodes.exit().remove();
            // Propagate Pagerank
            var numnodes = mgr.getNodes().length;
            var outdegrees = Array();
            mgr.eachNode(function(n) {
                outdegrees[n.id] = mgr.getEdges().filter(function(l){ return l.source === n;}).length;
                // Deal with sinks
                if (outdegrees[n.id] == 0) {
                    mgr.eachNode(function(nn) {
                        nn.newpr += (1-alpha)*n.pr/numnodes;
                    });
                }
            });
            mgr.eachEdge(function(e){
                var outdegree = outdegrees[e.source.id];
                var amount = (1-alpha)*e.source.pr/outdegree;
                e.amount = amount;
                e.target.newpr += amount;
            });
            if (animate) {
                // TODO: Show some kind of edge animation!
                animationnodes.classed('hidden', false)
                    .attr('transform', function(d) {
                        return 'translate(' + d.source.x + ',' + d.source.y + ')';
                    })
                    .transition()
                    .ease('linear')
                    .duration(iterrate)
                    .attr('transform', function(d) {
                        return 'translate(' + d.target.x + ',' + d.target.y + ')';
                    });
                if (use_size) {
                    animationnodes.select('circle').attr('r', function(d) {
                        return scales[0](d.amount);
                    });
                }
                if (use_colors) {
                    animationnodes.select('circle').attr('r', function(d) {
                        return scales[0](d.amount);
                    });
                    // FIXME
                }
            }
            // Update Pageranks
            var maxpr = 0;
            var minpr = 1;
            mgr.eachNode(function(node) {
                if (Math.abs(node.pr - node.newpr) > THRESHOLD/numnodes) {
                    converged = false;
                }
                node.pr = node.newpr;
                if (node.pr > maxpr) maxpr = node.pr;
                if (node.pr < minpr) minpr = node.pr;
                node.newpr = alpha/numnodes;
            });
            setDomains(minpr, maxpr);
            if (animate) {
                runNodeTransitions(iterrate);
            }
            return !converged;
        },
        converge:function() {
            if (animateinterval) stopanimation();
            while (that.iterate(false));
            var maxpr = 0;
            var minpr = 1;
            mgr.eachNode(function(node) {
                if (node.pr > maxpr) maxpr = node.pr;
                if (node.pr < minpr) minpr = node.pr;
            });
            
            setDomains(minpr, maxpr);

            runNodeTransitions(iterrate/2);
            animationnodes.select('circle').attr('r', 0);
        },
        animate:function() {
            if (animateinterval) return;
            animateinterval = setInterval(animateintervalfunc,iterrate);
        },
    };
    return that;
};
