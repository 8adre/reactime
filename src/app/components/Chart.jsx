import React, { Component } from 'react';
import '../styles/components/_d3Tree.scss';
import * as d3 from 'd3';

var root={};
let duration = 750;

// var test={
//     name: 'root',
//     state: {
//         "kids": 0,
//         "kids1": 0,
//         "kids2": 0,
//         "kids3": 0,
//         "kids4": 0,
//         "kids5": {
//             subkid: 3,
//             subkid3: 5,
//             sukid5:{
//                 kid:1,
//                 kid:3
//             }
//         },
//         "kids6": 0,
//         "kids7": 0,
//         "kids8": 0,
//         "kids9": 0,
//         "kids10": 0,
//         "kids11": 0,
//         "kids12": 0,
//         "kids13": 0,
//     },
//     children: [{name: 'hello',state:{name: "codesmith"}},{name: 'bye'}]
// }

class Chart extends Component {
    constructor(props){
        super(props);
    }

    componentDidMount(){
        root = JSON.parse(JSON.stringify(this.props.snapshot));
        this.maked3Tree();
    }
    
    componentWillUpdate(newProps){
        if(this.props.snapshot !== newProps.snapshot){
            root = JSON.parse(JSON.stringify(newProps.snapshot));
            this.maked3Tree();
        }
    }

    removed3Tree(){
        const anchor = this.refs.anchor;
        while(anchor.hasChildNodes()){
            anchor.removeChild(anchor.lastChild);
        }
    }

    maked3Tree(){
        this.removed3Tree();

        duration=0;
        // root = test;

        var margin = {top: 20, right: 120, bottom: 20, left: 120},
            width = 960 - margin.right - margin.left,
            height = 800 - margin.top - margin.bottom;

        var i = 0;

        var tree = d3.layout.tree()
            .size([400, 400]);

        var diagonal = d3.svg.diagonal()
            .projection(function(d) { return [d.y, d.x]; });

        var svg = d3.select(this.refs.anchor).append("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Add tooltip div
        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 1e-6)
            .on("mouseover", tipMouseover)
            .on("mouseout", tipMouseout)



        root.x0 = height / 2;
        root.y0 = 0;
        
        function update(source) {

        
            // Compute the new tree layout.
            var nodes = tree.nodes(root).reverse(),
                links = tree.links(nodes);
        
            // Normalize for fixed-depth.
            nodes.forEach(function(d) { d.y = d.depth * 180; });
        
            // Update the nodes…
            var node = svg.selectAll("g.node")
                .data(nodes, function(d) { return d.id || (d.id = ++i); });
        
            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
                .on("click", click)
                .on("mouseover", mouseover)
                .on("mouseout", mouseout)
                .on("mousemove", function(d){mousemove(d);});

        
            nodeEnter.append("circle")
                .attr("r", 1e-6)
                .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });
        
            nodeEnter.append("text")
                .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
                .attr("dy", ".35em")
                .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
                .text(function(d) { return d.name; })
                .style('fill', '#6FB3D2')
                .style("fill-opacity", 1e-6);
        
            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });
        
            nodeUpdate.select("circle")
                .attr("r", 7)
                .style("fill", function(d) { return d._children ? "#A1C658" : "#D381C3"; });
        
            nodeUpdate.select("text")
                .style("fill-opacity", 1);
        
            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
                .remove();
        
            nodeExit.select("circle")
                .attr("r", 1e-6);
        
            nodeExit.select("text")
                .style("fill-opacity", 1e-6);
        
            // Update the links…
            var link = svg.selectAll("path.link")
                .data(links, function(d) { return d.target.id; });
        
            // Enter any new links at the parent's previous position.
            link.enter().insert("path", "g")
                .attr("class", "link")
                .attr("d", function(d) {
                var o = {x: source.x0, y: source.y0};
                return diagonal({source: o, target: o});
                });
        
            // Transition links to their new position.
            link.transition()
                .duration(duration)
                .attr("d", diagonal);
        
            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
                .duration(duration)
                .attr("d", function(d) {
                var o = {x: source.x, y: source.y};
                return diagonal({source: o, target: o});
                })
                .remove();
        
            // Stash the old positions for transition.
            nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
            });
        }
        
        // Toggle children on click.
        function click(d) {
            if (d.children) {
            d._children = d.children;
            d.children = null;
            } else {
            d.children = d._children;
            d._children = null;
            }
            update(d);
        }
        
        // Show state on mouse over
        function mouseover(d) {
            // d3.select(this).append("text")
            //     .attr("class", "hover")
            //     .attr('transform', function(d){ 
            //         return 'translate(5, -10)';
            //     })
            //     .text(d.state === undefined ? '' : JSON.stringify(d.state));

            div.transition()
                .duration(300)
                .style("display", "block")
                .style("opacity", 1)
        }
        
        function mouseout(d) {
            // d3.select(this).select("text.hover").remove();

            div.transition()
                .duration(3000)
                .style("opacity", 1e-6)
                .style("display", "none");
        }

        function tipMouseover(d){
            div.transition()
                .duration(300)
                .style("opacity", 1);
        }

        function tipMouseout(d) {
            // d3.select(this).select("text.hover").remove();

            div.transition()
                .duration(3000)
                .style("opacity", 1e-6)
                .style("display", "none");
        }


        function mousemove(d){
            div
                .text(d.state == undefined ? 'No state found' : JSON.stringify(d.state,null,4))
                .style("left", (d3.event.pageX ) + "px")
                .style("top", (d3.event.pageY) + "px");
        }
        
        function collapse(d) {
            if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
            }
        }
        
        // root.children.forEach(collapse);
        update(root);
        duration = 750;
        
        // d3.select(self.frameElement).style("height", "800px");
            
    }

    render(){
        return <div ref="anchor" className={'d3Container'} width={'100%'}></div>
    }
}


export default Chart;
