var GraphManager = function(initial_nodes, initial_edges) {
    var nodes = [];
    var edges = [];
    var nextNodeId = 0;
    if (initial_nodes) {
        for (var i = 0; i < initial_nodes.length; ++i, ++nextNodeId) {
            nodes.push(initial_nodes[i]);
            nodes[i].id = nextNodeId;
        }
    }
    if (initial_edges) {
        for (var i = 0; i < initial_edges.length; ++i) edges.push(initial_edges[i]);
    }

    var that = {
        getNodes: function() { return nodes; },
        getEdges: function() { return edges; },
        addEdge:function(a,b,c) {
            var link = edges.filter(function(l) {
                return (l.source === a && l.target === b);
            })[0];
            if (link) return false;

            var e = {source: a, target: b};
            for (f in c) {
                if (f in e) continue;
                e[f] = c[f];
            }
            edges.push(e);
            return e;
        },
        addNode:function(b) {
            var node = {id: ++nextNodeId};
            for (f in b) {
                if (f in node) continue;
                node[f] = b[f];
            }
            nodes.push(node);
            return node;
        },
        getNode:function(n) {
            if (typeof(n) == 'number') {
                for (var i = 0; i < nodes.length; ++i) {
                    if (nodes[i].id == n) return nodes[i];
                }
                return null;
            }
            return n;
        },
        deleteNode:function(a) {
            var n = that.getNode(a);
            var toSplice = edges.filter(function(l) {
                return (l.source === n || l.target === n);
            });
            toSplice.map(function(l) {
                edges.splice(edges.indexOf(l), 1);
            });
            nodes.splice(nodes.indexOf(n), 1);
        },
        deleteEdges:function(a,b) {
            if (!b && typeof(a) == 'object') {
                edges.splice(edges.indexOf(a),1);
                return;
            }
            a = that.getNode(a); b = that.getNode(b);
            for (var i = 0; i < edges.length; ++i) {
                if (edges[i].source === a && edges[i].target === b) {
                    edges.splice(i,1);
                    return;
                }
            }
        },
        findEdge:function(a,b) {
            if (!b && typeof(a) == 'object') {
                return edges.indexOf(a);
            }
            for (var i = 0; i < edges.length; ++i) {
                if ((!a || edges[i].source === a) && (!b || edges[i].target === b)) {
                    return i;
                }
            }
            return -1;
        },
        eachNode:function(f) {
            for (var i = 0; i < nodes.length; ++i) {
                f(nodes[i]);
            }
        },
        eachEdge:function(f) {
            for (var i = 0; i < edges.length; ++i) {
                f(edges[i]);
            }
        },
    };
    return that;
};
