(function () {
    'use strict';

    var DEF_NETWORK_FILE = 'data/net1.json';
    var WIDTH = 700;
    var HEIGHT = 700;
    var D3_VIEW = '.d3view';


    console.log('Network rendering start...');
    render();


    function render() {
        var force = d3.layout.force()
            .charge(-20)
            .gravity(.05)
            .linkDistance(30)
            .size([WIDTH, HEIGHT]);

        var svg = d3.select(D3_VIEW).append("svg");

        d3.json(DEF_NETWORK_FILE, function (error, graph) {
            force.nodes(graph.nodes).links(graph.links).start();

            var link = svg.selectAll(".link")
                .data(graph.links)
                .enter().append("line")
                .attr("class", "link")
                .attr('stroke-width', function(d) {
                    return d.EdgeBetweenness/2000 + 1;
                });

            var node = svg.selectAll(".node")
                .data(graph.nodes)
                .enter().append("g")
                .attr("class", "node")
                .call(force.drag);

            // Render label (use name attr)
            node.append("text")
                .attr("dx", 8)
                .attr("dy", ".25em")
                .text(function (d) {
                    return d.name;
                });

            // Use circle for node shape
            node.append("circle")
                .attr("class", "node")
                .attr("r", function(d) {
                    return d.Degree;
                });


            force.on("tick", function () {
                link.attr("x1", function (d) {return d.source.x;})
                    .attr("y1", function (d) {return d.source.y;})
                    .attr("x2", function (d) {return d.target.x;})
                    .attr("y2", function (d) {return d.target.y;});

                node.attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });
            });
        });
    }
})();