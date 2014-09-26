/* global d3 */

(function () {
    'use strict';

    var DEF_NETWORK_FILE = 'data/net1.json';
    var DEF_TREE_FILE = 'data/tree1.json';

    var WIDTH = 800;
    var HEIGHT = 800;

    var D3_VIEW = '.d3view';
    var D3_TREE_VIEW = '.d3treeview';
    var D3_CTREE_VIEW = '.d3ctreeview';


    var GraphRenderer = function (width, height) {
        this.force = d3.layout.force()
            .charge(-20)
            .gravity(0.05)
            .linkDistance(20)
            .size([width, height]);

        this.svg = d3.select(D3_VIEW).append('svg')
            .attr('width', width)
            .attr('height', height);
    };


    GraphRenderer.prototype.render = function (graph) {
        this.force.nodes(graph.nodes).links(graph.links).start();

        var link = this.svg.selectAll('.link')
            .data(graph.links)
            .enter().append('line')
            .attr('class', 'link')
            .attr('stroke-width', function (d) {
                return Math.log(d.EdgeBetweenness) / Math.LN10;
            });

        var node = this.svg.selectAll('.node')
            .data(graph.nodes)
            .enter().append('g')
            .attr('class', 'node')
            .call(this.force.drag);

        // Render label (use name attr)
        node.append('text')
            .attr('dx', 8)
            .attr('dy', '.25em')
            .text(function (d) {
                return d.name;
            });

        // Use circle for node shape
        node.append('circle')
            .attr('class', 'node')
            .attr('r', function (d) {
                return d.Degree;
            });

        this.force.on('tick', function () {
            link.attr('x1', function (d) {
                return d.source.x;
            })
                .attr('y1', function (d) {
                    return d.source.y;
                })
                .attr('x2', function (d) {
                    return d.target.x;
                })
                .attr('y2', function (d) {
                    return d.target.y;
                });

            node.attr('transform', function (d) {
                return 'translate(' + d.x + ',' + d.y + ')';
            });
        });
    };


    var TreeRenderer = function (width, height) {
        this.cluster = d3.layout.cluster()
            .size([height, width - 80]);

        this.diagonal = d3.svg.diagonal()
            .projection(function (d) {
                return [d.y, d.x];
            });

        this.svg = d3.select(D3_TREE_VIEW).append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform', 'translate(50,0)');
    };

    TreeRenderer.prototype.render = function (tree) {
        var nodes = this.cluster.nodes(tree),
            links = this.cluster.links(nodes);

        this.svg.selectAll('.link')
            .data(links)
            .enter().append('path')
            .attr('class', 'link')
            .attr('d', this.diagonal);

        var node = this.svg.selectAll('.node')
            .data(nodes)
            .enter().append('g')
            .attr('class', 'node')
            .attr('transform', function (d) {
                return 'translate(' + d.y + ',' + d.x + ')';
            });

        node.append('circle')
            .attr('r', 6);

        node.append('text')
            .attr('dx', function (d) {
                return d.children ? -10 : 10;
            })
            .attr('dy', 20)
            .style('text-anchor', function (d) {
                return d.children ? 'end' : 'start';
            })
            .text(function (d) {
                return d.name;
            });
    };


    var RadialTreeRenderer = function (diameter) {
        this.tree = d3.layout.tree()
            .size([2500, 400])
            .separation(function (a, b) {
                return (a.parent === b.parent ? 1 : 2) / a.depth;
            });

        this.diagonal = d3.svg.diagonal.radial()
            .projection(function (d) {
                return [d.y, d.x / 180 * Math.PI];
            });

        this.svg = d3.select(D3_CTREE_VIEW).append('svg')
            .attr('width', diameter)
            .attr('height', diameter)
            .append('g')
            .attr('transform', 'translate(' + (diameter / 2 - 30) + ',' + diameter / 2 + ')');
    };

    RadialTreeRenderer.prototype.render = function (treeData) {
        var nodes = this.tree.nodes(treeData),
            links = this.tree.links(nodes);

        this.svg.selectAll('.link')
            .data(links)
            .enter().append('path')
            .attr('class', 'link')
            .attr('d', this.diagonal);

        var node = this.svg.selectAll('.node')
            .data(nodes)
            .enter().append('g')
            .attr('class', 'node')
            .attr('transform', function (d) {
                return 'rotate(' + (d.x - 90) + ')translate(' + d.y + ')';
            });

        node.append('circle')
            .attr('r', 2);

        node.append('text')
            .attr('dy', '.31em')
            .attr('text-anchor', function (d) {
                return d.x < 180 ? 'start' : 'end';
            })
            .attr('transform', function (d) {
                return d.x < 180 ? 'translate(8)' : 'rotate(180)translate(-8)';
            })
            .text(function (d) {
                return d.name;
            });
    };

    // Main //
    console.log('Network rendering start...');
    var gr = new GraphRenderer(WIDTH, HEIGHT);
    var rr = new RadialTreeRenderer(1100);
    var tr = new TreeRenderer(700, 350);

    d3.json(DEF_NETWORK_FILE, function (graphData) {
        gr.render(graphData);
    });

    d3.json(DEF_TREE_FILE, function (treeData) {
        // Render in different ways:
        tr.render(treeData);
        rr.render(treeData);
    });

    d3.chart('Tree', {

        transform: function(data) {
            var chart = this;
            chart.data = data;
            return data;
        },


        initialize: function () {
            var chart = this;
            this.cluster = d3.layout.cluster().size([this.h, this.w - 80]);
            this.xScale = d3.scale.linear();

            var treeBase =
                this.base.attr('width', this.w)
                    .attr('height', this.h)
                    .append('g')
                    .attr('transform', 'translate(50,0)');


            this.layer(
                'tree',
                treeBase, {

                    dataBind: function (data) {
                        var nodes = chart.cluster.nodes(data);
                        var links = chart.cluster.links(nodes);
                        this.selectAll('.link')
                            .data(links)
                            .enter().append('path')
                            .attr('class', 'link')
                            .attr('d', this.diagonal);

                        var node = this.selectAll('.node')
                            .data(nodes)
                            .enter().append('g')
                            .attr('class', 'node')
                            .attr('transform', function (d) {
                                return 'rotate(' + (d.x - 90) + ')translate(' + d.y + ')';
                            });


                        return node;

                    },

                    insert: function () {
                        var chart = this.chart();
                        // update the range of the xScale
                        chart.xScale.range([5, chart.w - chart.r]);

                        return this.append('circle')
                            .attr('r', chart.r);                    // setup the elements that were just created
                    },

                    events: {
                        'enter': function () {
                            var chart = this.chart();
                            return this.attr('cx', function (d) {
                                return chart.xScale(d);
                            });
                        }
                    }

                });
        },

        width: function (newWidth) {
            if (arguments.length === 0) {
                return this.w;
            }
            this.w = newWidth;
            return this;
        },

        height: function (newHeight) {
            if (arguments.length === 0) {
                return this.h;
            }
            this.h = newHeight;
            return this;
        },

        radius: function (newRadius) {
            if (arguments.length === 0) {
                return this.r;
            }
            this.r = newRadius;
            return this;
        }
    });

    var data = [1, 3, 4, 6, 10, 11, 20];

    var treeView = d3.select('.d3chart')
        .append('svg')
        .chart('Tree')
        .width(700)
        .height(700)
        .radius(10);

    treeView.draw(data);

})();