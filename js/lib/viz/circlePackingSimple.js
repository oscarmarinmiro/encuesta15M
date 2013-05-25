var tdviz = tdviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };


tdviz.viz.circlePackingSimple = function (options)
{

    // Object

    var self = {};


    // Get options data

    for (key in options){
        self[key] = options[key];
    }


    // Constants

    self.nearRatio = 2.0;

    // Color for parents and global nodes (should be equal to background color in body)

    self.parentSelect = "#"+self.idName;

    self.init = function(){

    self.bubbleColorScale = self.colorScale;

    self.zoomVar = d3.behavior.zoom();


    // svg init

    self.myLog("Iniciando circlePacking... en ",3);
    self.myLog(self.parentSelect,3);
    self.svg = d3.select(self.parentSelect).append("svg")
        .attr("width",self.width)
        .attr("height",self.height)
        .call(self.zoomVar.on("zoom", self.redraw))
        .append("g").on("mousemove", mousemove);


    self.tooltip =  d3.select(self.parentSelect).append("div")
        .attr("id","tooltip")
        .html("")
        .attr("class", "tooltip")
        .style("opacity", 0);

        $('#more').on("click",function(){self.zoomIn();});
        $('#less').on("click",function(){self.zoomOut();});

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

    self.pack = d3.layout.pack()
        .size([self.width, self.height])
        .padding(1)
        .value(function(d) { return d.size; });

    self.zoom = 1.0;

    self.translate = "0,0";

    self.svg.attr("transform",
        "translate(" + self.translate + ")"
            + " scale(" + self.zoom + ")");

    self.firstRender = true;

    }

    self.zoomIn = function()
    {
        var myZoom = self.zoomVar.scale()*2;

        var centerX = (self.width/2)/myZoom;
        var centerY = (self.height/2)/myZoom;

        self.zoomVar.translate()[0] = (centerX -(self.width/2))*myZoom;
        self.zoomVar.translate()[1] = (centerY -(self.height/2))*myZoom;

        self.zoomVar.scale(myZoom);

        self.svg
            .transition().duration(self.transTime)
            .attr("transform",
                "translate(" + self.zoomVar.translate() + ")"
                    + " scale(" + self.zoomVar.scale() + ")");

    }

    self.zoomOut = function()
    {
        var myZoom = self.zoomVar.scale()/2;

        var centerX = (self.width/2)/myZoom;
        var centerY = (self.height/2)/myZoom;

        self.zoomVar.translate()[0] = (centerX -(self.width/2))*myZoom;
        self.zoomVar.translate()[1] = (centerY -(self.height/2))*myZoom;

        self.zoomVar.scale(myZoom);

        self.svg
            .transition().duration(self.transTime)
            .attr("transform",
                "translate(" + self.zoomVar.translate() + ")"
                    + " scale(" + self.zoomVar.scale() + ")");



    }
    self.redraw = function()
    {

        self.svg.attr("transform",
            "translate(" + d3.event.translate + ")"
                + " scale(" + d3.event.scale + ")");

        self.zoom = d3.event.scale;

    }


    self.resetZoom = function()
    {
        var myZoom = 1.0;

        var centerX = (self.width/2)/myZoom;
        var centerY = (self.height/2)/myZoom;

        self.zoomVar.translate()[0] = (centerX -(self.width/2))*myZoom;
        self.zoomVar.translate()[1] = (centerY -(self.height/2))*myZoom;

        self.zoomVar.scale(myZoom);

        self.svg
            .transition().duration(self.transTime)
            .attr("transform",
                "translate(" + self.zoomVar.translate() + ")"
                    + " scale(" + self.zoomVar.scale() + ")");
    }




    self.render = function(data)
    {
        self.warningMessage.remove();
        self.data = data;

        var leaves = self.pack(self.data);

        self.leaves = leaves;


        if(!self.firstRender)
        {
//            console.log("Otro render...");
        }
        else
        {

//        console.log("Primer render...");

        var node = self.svg.selectAll('.node')
              .data(leaves,function(d){return d.data.name;});

        // The groups...

        self.news = node.enter().insert("g",".leaf")
            .attr("class", function(d) { return d.children ? "parent node" : "leaf node"; })
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });


        // The bubbles...

        self.nodes = self.news.append("circle")
            .on("mouseover",function(d,i){
                // Si no tiene hijas, nameCallback
                if(!d.children)
                {

                      self.tooltip.style("opacity",1.0).html(self.nameCallback(d));

                }
                else
                {

                    if(d.depth!=0)
                    {
                        self.tooltip.style("opacity",1.0).html(self.categoryCallback(d));

                    }

                }
            })
            .on("mouseout", function(d,i)
            {

                   self.tooltip.style("opacity",0.0);
            })
            .attr('class',function(d){ return d.children ? "parent circleNode" : "leaf circleNode"; })
            .style("fill",function(d){
                    if (d.children)
                    {
                        return self.backColorScale(d.depth);
                    }
                    else
                    {
                        // search recursively for oldest parent != root
                        var data = d;

                        var name = d.data.name;

                        while(data.parent.depth>0)
                        {
                            data = data.parent;
                            name = data.data.name;
                        }

                        return self.bubbleColorScale(name);

                    }
                })
            .attr('r',0)
            .transition()
            .duration(self.transTime)
            .attr("r", function(d) { return d.r; });


        self.news.append("text")
            .attr("class",function (d,i){return !d.children ? "leyendaInterior" : "";})
            .attr("text-anchor","middle")
            .style("opacity",0.1)
            .transition()
            .text(function(d){return (!d.children ? d.data.name : "");})
            .duration(self.transTime)
            .style("font-size", "24px") // initial guess
            .style("font-size", function(d) { return (2 * (d.r*8/10) ) / this.getComputedTextLength() * 2 + "px"; })
            .style("opacity",1.0)
            .attr("dy", ".3em");


        self.firstRender=false;

        }

    }



    // Main del objeto

    self.init();

    return self;


}
