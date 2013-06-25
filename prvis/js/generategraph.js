var randInt = function(min, max) {
    return Math.floor((Math.random()*(max-min))+min);
}
var randIntEx = function(min, max, not) {
    var i = randInt(min, max);
    while (i == not) i = randInt(min, max);
    return i;
}
var GenerateTree = function(numnodes) {
    var nodes = Array();
    for (var i = 0; i < numnodes; ++i) nodes.push({id: i, size:40});

    // Generate tree edges so that it is a connected graph and every node has an
    // outgoing edge to a higher node
    var edges = Array();
    for (var i = 1; i < numnodes; ++i) {
        edges.push({source: nodes[i], target: nodes[randInt(0,i)]});
    }

    return GraphManager(nodes, edges);
}

// Every node has at least one incoming and one outgoing edge
var GenerateGraph = function(numnodes) {
    var tree = GenerateTree(numnodes);

    // Root doesn't have an outgoing edge
    tree.addEdge(tree.getNodes()[0], tree.getNodes()[randInt(1,numnodes)]);
    // Generate one random incoming edge per node
    for (var i = 1; i < numnodes; ++i) {
        if (tree.findEdge(false, tree.getNodes()[i]) == -1)
            tree.addEdge(tree.getNodes()[randIntEx(0,numnodes,i)], tree.getNodes()[i])
    }
    return tree;
}

var GenerateRandomGraph = function(numnodes, numedges) {
    var g = GenerateGraph(numnodes);

    var numadded = 0;
    while (numadded < numedges) {
        var from = randInt(0,numnodes);
        if (tree.addEdge(tree.getNodes()[from], tree.getNodes()[randIntEx(0,numnodes,from)])) {
            ++numadded;
        }
    }

    return g;
}
