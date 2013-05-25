var tdviz = tdviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };


tdviz.viz.circlePackingSimpleDynamic = function (options)
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


    self.findNode = function (nodeName)
    {

        var found = false;
        var x = 0;
        var y = 0;
        var r = 0;

        for(var leave in self.leaves)
        {
            if(self.leaves[leave].children==null)
            {
                if(self.leaves[leave].data.name==nodeName)
                {
                    found = true;
                    x = self.leaves[leave].x;
                    y = self.leaves[leave].y;
                    r = self.leaves[leave].r;
                }
            }
        }

        if(found==true)
        {

            var nearZoom = self.height/(r*2)/self.nearRatio;


            var centerX = (self.width/2)/nearZoom;
            var centerY = (self.height/2)/nearZoom;

            self.zoomVar.translate()[0] =  (centerX - x)*nearZoom;
            self.zoomVar.translate()[1] =  (centerY - y)*nearZoom;

            self.zoomVar.scale(nearZoom);

            self.svg
                .transition().duration(self.transTime)
                .attr("transform",
                    "translate(0,0)"
                        + " scale(1,1)")
                .transition().delay(self.transTime).duration(self.transTime).attr("transform",
                "translate(" + self.zoomVar.translate() + ")"
                    + " scale(" + self.zoomVar.scale() + ")");


        }
        else
        {
            alert("Node not found");
        }
    }


   self.getFullPath = function(d)
   {
        var paths = [];

        // search recursively for oldest parent != root

        var data = d;

        var leafName = d.data.name;

        paths.push(leafName)

        var name;

        while(data.parent && data.parent.depth>0)
        {
            data = data.parent;
            name = data.data.name;
            paths.push(name);
        }

        var fullPath = paths.reverse().join("/");


        return fullPath;


   }

    self.render = function(data)
    {
        self.warningMessage.remove();
        self.data = data;

        var leaves = self.pack(self.data);

        self.leaves = leaves;


        var node = self.svg.selectAll('.node')
              .data(leaves,function(d){return self.getFullPath(d);});


        self.changed = node;


        self.changed
            .attr("class", function(d) { return d.children ? "parent node" : "leaf node"; })
            .transition()
            .duration(self.transTime)
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });


        self.changedCircles = self.svg.selectAll('.node').selectAll('circle')
              .data(leaves,function(d){return self.getFullPath(d);});

        self.changedCircles
               .attr('class',function(d){ return d.children ? "parent circleNode" : "leaf circleNode"; })
                    .transition()
                    .duration(self.transTime)
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
               .attr("r", function(d) { return d.r; });

         self.changedText = self.svg.selectAll('.node').selectAll('text')
              .data(leaves,function(d){return self.getFullPath(d);});

        self.changedText
            .attr("class",function (d,i){return !d.children ? "leyendaInterior" : "";})
            .attr("text-anchor","middle")
            .attr("initSize" , function(d,i){ return d3.select(this).style("font-size");})
            .style("font-size", function(d,i){ return d3.select(this).attr("initSize");}) // initial guess
            .transition()
            .text(function(d){return (!d.children ? d.data.name : "");})
            .duration(self.transTime)
            .style("font-size", function(d) { return (2 * (d.r*8/10) ) / this.getComputedTextLength() * parseInt(d3.select(this).attr("initSize").replace("px",""),10); })
            .attr("dy", ".3em");

       // Entering....

        self.news = node.enter().insert("g",".leaf")
            .attr("class", function(d) { return d.children ? "parent node" : "leaf node"; })
            .attr("transform", function(d) { console.log("Entering");console.log(d);return "translate(" + d.x + "," + d.y + ")"; });


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

        // Exiting....

        self.old = node.exit();

        self.old.transition().duration(self.transTime).remove();

        self.old.selectAll("circle").transition().duration(self.transTime)
            .attr("r",function(d,i){console.log("Exiting");console.log(d);return 0;})
            .remove();

        self.old.selectAll("text").transition().duration(self.transTime)
            .style("opacity",0.0)
            .remove();


        // Final sort

        d3.selectAll(".node")
        .sort(function(a,b) {return  a.depth - b.depth});
        self.firstRender=false;


    }



    // Main del objeto

    self.init();

    return self;


}
