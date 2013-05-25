var tdviz = tdviz || {'version': 0.1, 'controller': {}, 'viz': {}, 'extras': {} };


// Draws a d3.js networkDiagram based on a layout
// Parameters
// idName => DOM id for drawing diagram
// width => SVG width
// height => SVG height
// transTime => transitions time (milliseconds)
// loadingMessage => message to display while loading data
// myLog => logging function

tdviz.viz.sankeyVisitorsHorLevels = function (options) {

    // Object

    var self = {};


    // Get options data

    for (key in options) {
        self[key] = options[key];
    }

    self.parentSelect = "#" + self.idName;

    self.init = function () {


        // svg init

        self.myLog("Iniciando sankey diagram... en ", 3);
        self.myLog(self.parentSelect, 3);
        self.svg = d3.select(self.parentSelect).append("svg")
            .attr("width", self.width)
            .attr("height", self.height)
            .append("g")
            .attr("transform", "translate(" + self.margin / 2 + "," + self.margin / 2 + ")");


        self.warningMessage = self.svg.append("text")
            .attr("text-anchor", "middle")
            .attr("class", "sankeyChartTextWarning")
            .attr("x", self.width / 2)
            .attr("y", self.height / 2)
            .text(self.loadingMessage);

        self.sankey = d3.sankey()
            .nodeWidth(self.nodeWidth)
            .nodePadding(self.nodePadding)
            .size([self.width - self.margin, self.height - self.margin]);

        self.path = self.sankey.link();

        self.formatNumber = d3.format(",.2f");
        self.format = function (d) {
            return self.formatNumber(d) + " %";
        };


    }

    self.render = function (data) {
        self.myLog("En el render....", 3)

        self.data = data;

        self.myLog("Datos que me llegan", 3);

        self.myLog(data, 3);


        self.sankey
            .nodes(self.data.nodes)
            .links(self.data.links)
            .layout(320);

        var link = self.svg.append("g").selectAll(".link")
            .data(self.data.links)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", self.path)
            .attr("visibility", function (d, i) {
                if (d.source.name.substring(0, 1) == "_" || d.target.name.substring(0, 1) == "_") {
                    return "hidden";
                }
                else {
                    return "visible";
                }
            })
            .style("stroke-width", function (d) {
                return Math.max(1, d.dy);
            })
            .sort(function (a, b) {
                return b.dy - a.dy;
            });


        link.append("title")
            .text(function (d) {
                var fraction = (d.value/(self.data.total+0.0))*100;
                return d.source.name + " → " + d.target.name + "\n" + self.format(fraction)+"\n" + d.value +" coocurrences";
            });

        var node = self.svg.append("g").selectAll(".node")
            .data(self.data.nodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function (d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        node.append("rect")
            .attr("height", function (d) {
                return d.dy;
            })
            .attr("width", self.sankey.nodeWidth())
            .style("fill", function (d) {

                    return d.name == self.mainNodeName ? self.mainNodeColor : d.color = self.color(d.name.replace(/ .*/, ""));
            })
            .attr("class",function(d)
            {
                if(d.name=="Direct" || d.name=="Dropped")
                {
                    return "special";
                }
                else
                {
                    return "normal";
                }
            })
            .style("stroke", function (d) {

                return d3.rgb(d.color).darker(2);
            })
            .attr("visibility", function (d) {
                return d.name.substring(0, 1) == "_" ? "hidden" : "visible";
            })
            .append("title")
            .text(function (d) {
                console.log(d.value);
                console.log(self.data.total);
                var fraction = (d.value/(self.data.total+0.0))*100;
                console.log(fraction);
                return d.name + "\n" + self.format(fraction)+"\n" + d.value +" coocurrences";
            });

        node.append("text")
            .attr("x", -6)
            .attr("y", function (d) {
                return d.name == self.mainNodeName ? -d.y : d.dy / 2;
            })
            .attr("dy", ".35em")
            .attr("text-anchor", function (d) {
                return d.name == self.mainNodeName ? "middle" : "end";
            })
            .attr("transform", null)
            .style("font-size", function (d) {
                return d.name == self.mainNodeName ? "1px" : "12px";
            })
            .text(function (d) {
                return d.name == self.mainNodeName ? "": d.name;
            })
            .attr("visibility", function (d) {
                return d.name.substring(0, 1) == "_" ? "hidden" : "visible";
            })
            .style("font-style",function(d){
                if(d.name=="Direct" || d.name=="Dropped")
                {
                    return "italic";
                }
                else
                {
                    return "normal";
                }
            }
            )
            .filter(function (d) {
                return d.x < self.width / 2;
            })
            .attr("x", function (d, i) {
                return d.name == self.mainNodeName ? self.sankey.nodeWidth() / 2 : 6 + self.sankey.nodeWidth()
            })
            .attr("text-anchor", function (d) {
                return d.name == self.mainNodeName ? "middle" : "begin";
            });

//
        // El remove del warning esta al final porque el primer render tarda...

        self.warningMessage.transition().duration(self.transTime).style("opacity", 0.0).remove();

    }


    // Main del objeto

    self.init();

    return self;

}

