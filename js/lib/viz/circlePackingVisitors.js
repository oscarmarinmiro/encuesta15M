var tdviz = tdviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };


tdviz.viz.circlePackingVisitors = function (options)

{

    // Object

    var self = {};


    // Get options data

    for (key in options){
        self[key] = options[key];
    }


    // Color for parents and global nodes (should be equal to background color in body)

    self.backColor = "#000";

    self.parentSelect = "#"+self.idName;

    self.init = function(){

    self.bubbleColorScale = d3.scale.category20b();

    // svg init

    self.myLog("Iniciando circlePacking... en ",3);
    self.myLog(self.parentSelect,3);
    self.svg = d3.select(self.parentSelect).append("svg")
        .attr("width",self.width)
        .attr("height",self.height)
        .call(d3.behavior.zoom().on("zoom", self.redraw))
        .append("g").on("mousemove", mousemove);


    self.tooltip =  d3.select(self.parentSelect).append("div")
        .attr("id","tooltip")
        .html("")
        .attr("class", "tooltip")
        .style("opacity", 0);

    function mousemove()
    {
        self.tooltip
            .style("left", (d3.event.pageX +20) + "px")
            .style("top", (d3.event.pageY - 12) + "px");
    }
    // warning message

    self.warningMessage = self.svg.append("text")
        .attr("text-anchor", "middle")
        .attr("class","textWarning")
        .attr("x", self.width/2)
        .attr("y",self.height/2)
        .text(self.loadingMessage);

    self.format = d3.format(",d");


    self.pack = d3.layout.pack()
        .size([self.width, self.height])
        .padding(0)
        .value(function(d) { return d.size; });

    self.zoom = 1.0;

    self.firstRender = true;

    }

    self.redraw = function()
    {

        self.svg.attr("transform",
            "translate(" + d3.event.translate + ")"
                + " scale(" + d3.event.scale + ")");

        self.zoom = d3.event.scale;

    }


    self.render = function(data)
    {
        self.warningMessage.remove();
        self.data = data;

        var leaves = self.pack(self.data);


        if(!self.firstRender)
        {
            console.log("Otros render...");
        }
        else
        {

        console.log("Primer render...");

        var node = self.svg.selectAll('.node')
              .data(leaves,function(d){return d.data.name;});

        // The groups...

        self.news = node.enter().insert("g",".leaf")
            .attr("class", function(d) { return d.children ? "parent node" : "leaf node"; })
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

//        self.radiusScale = d3.scale.log().domain([1,65000]).range([1,40]).clamp(true);

        // The bubbles...

        self.nodes = self.news.append("circle")
            .on("mouseover",function(d,i){
                if(!d.children)
                {
                console.log("meto el dato del tooltip");

                self.tooltip.style("opacity",1.0).html(self.nameCallback(d.data.name, d.value.toFixed(2), d.children,d.parent.data.name));

                }
            })
            .on("mouseout", function(d,i){
                if(!d.children)
                {

                    console.log("meto el dato del tooltip");

                    self.tooltip.style("opacity",0.0);


                }
            })
            .attr('class',function(d){ return d.children ? "parent circleNode" : "leaf circleNode"; })
            .attr("title", function(d){ return d.data.name!='root' ? self.nameCallback(d.data.name, d.value.toFixed(2), d.children) : "";})
            .style("fill",function(d){ return d.children? self.backColor : self.bubbleColorScale(d.parent.data.name);})
//            .style("stroke-width",function(d){ if (d.children && d.data.name!='root'){ return "1px"} else {return "0px";}})
            .style("stroke-width",function(d){ return (d.children && d.data.name!='root')?"0.5px":"0px";})
            .style("stroke",function(d){return d.children? self.bubbleColorScale(d.data.name) : self.bubbleColorScale(d.parent.data.name);})
//            .style("stroke",function(d){return "#CCC";})
            .attr('r',0)
            .transition()
            .duration(self.transTime)
            .attr("r", function(d) { return d.r; });


        // Legends inside bubbles...

//        self.news.append("g")
//                .attr("class","cont")
//                .attr("title", function(d){ return d.data.name!='root' ? self.nameCallback(d.data.name, d.value.toFixed(2),d.children) : "";})
//                .attr("transform", function(d) { var l = Math.sqrt(2*Math.pow(d.r,2));var x = l/2;var y = l/6;return "translate(-" + x + ",-" + y +")" })
//                .insert("foreignObject",".leaf")
//                .attr("width", function(d){return Math.sqrt(2*Math.pow(d.r,2)) + 'px';})
//                .attr("height", function(d){return Math.sqrt(2*Math.pow(d.r,2)) + 'px';})
//                .append("xhtml:div")
//                .attr("class",function (d,i){
//                    return !d.children ? "leyendaInterior" : "";
//                })
//                .html(function(d){return '<div class="leyendaHija">'+ (!d.children ? d.data.name : "")+'</div>';});

        self.news.append("text")
            .attr("class",function (d,i){return !d.children ? "leyendaInterior" : "";})
            .attr("title", function(d){ return d.data.name!='root' ? self.nameCallback(d.data.name, d.value.toFixed(2),d.children) : "";})
            .attr("text-anchor","middle")
            .style("opacity",0.1)
            .transition()
            .text(function(d){return (!d.children ? d.data.name : "");})
            .duration(self.transTime)
            .style("font-size", "24px") // initial guess
            .style("font-size", function(d) { return (2 * (d.r*8/10) ) / this.getComputedTextLength() * 2 + "px"; })
            .style("opacity",1.0)
            .attr("dy", ".3em");
//            .transition()
//            .text(function(d){return (!d.children ? d.data.name : "");});



//
//            $('.circleNode').tipsy({
//                    gravity: 's',
//                    opacity: 1.0,
//                    html: true
//                });
//
//        $('.cont').tipsy({
//            gravity: 's',
//            opacity: 1.0,
//            html: true
//        });

        self.firstRender=false;

        }

    }

    // Main del objeto

    self.init();

    return self;


}
