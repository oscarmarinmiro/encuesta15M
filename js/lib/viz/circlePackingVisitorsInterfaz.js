var tdviz = tdviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };


tdviz.viz.circlePackingVisitorsInterfaz = function (options)

{

    // Object

    var self = {};


    // Get options data

    for (key in options){
        self[key] = options[key];
    }

    console.log("En la viz la variable es");
    console.log(self.sankeyHTML);

    // Constants

    self.nearRatio = 2.0;

    // Color for parents and global nodes (should be equal to background color in body)

    self.backColor = "#000";

    self.parentSelect = "#"+self.idName;

    self.init = function(){

    self.bubbleColorScale = d3.scale.category20b();

    self.zoomVar = d3.behavior.zoom();

    self.arrSelected = [];

    self.selected = 0;

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

    self.format = d3.format(",d");


    self.pack = d3.layout.pack()
        .size([self.width, self.height])
        .padding(0)
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

//        self.zoomVar.scale(self.zoomVar.scale()*2);
//
//
////        self.zoomVar.translate()[0] =  ((self.width*self.zoomVar.scale())/2);
////        self.zoomVar.translate()[1] =  ((self.height*self.zoomVar.scale())/2);
//
//        self.zoomVar.translate()[0] = 0;
//        self.zoomVar.translate()[1] = 0;
//
////        self.zoomVar.translate()[0] =  -self.width/2*self.zoomVar.scale())/2);
////        self.zoomVar.translate()[1] =  -1*((self.height/2self.zoomVar.scale())/2);
//
//        console.log(self.zoomVar.scale());
//        console.log(self.zoomVar.translate());
//
//        self.svg.attr("transform",
//            "translate(" + self.zoomVar.translate() + ")"
//                + " scale(" + self.zoomVar.scale() + ")");

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

//        console.log(self.zoomVar.translate());
//        console.log(self.zoomVar.scale());

        self.svg.attr("transform",
            "translate(" + d3.event.translate + ")"
                + " scale(" + d3.event.scale + ")");

        self.zoom = d3.event.scale;

    }

    self.sankeyNodes = function()
    {
//        console.log(self.arrSelected);
//        console.log(self.selected);

        if(self.selected!=2)
        {
            alert("You must select two sites to compare");
        }
        else
        {
            console.log("En la redireccion la variable es:");
            console.log(self.sankeyHTML);

            location.href= self.sankeyHTML+'?firstSite='+encodeURIComponent(self.arrSelected[0])+'&secondSite='+encodeURIComponent(self.arrSelected[1]);
        }
    }

    self.resetNodes = function()
    {
        var nodes = d3.selectAll(".leaf");

        nodes.selectAll("text").transition().duration(self.transTime).style("fill","#FFF");
        nodes.selectAll("circle").transition().duration(self.transTime).style("fill",function(d){return d.children? self.backColor : self.bubbleColorScale(d.parent.data.name);});

        self.arrSelected = [];
        self.selected = 0;

        self.selectCallBack(self.arrSelected);

        self.resetZoom();

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

    self.iluminaNews = function(nodo,d,i)
    {

            var node = d3.select(nodo);

            if (!d.children)
            {
                if(node.classed("chosen"))
                {
                    node.classed("chosen",false);
                    node.selectAll("text").transition().duration(self.transTime).style("fill","#FFF");
                    node.selectAll("circle").transition().duration(self.transTime).style("fill",function(d){return d.children? self.backColor : self.bubbleColorScale(d.parent.data.name);});
                    self.selected-=1;
                    self.arrSelected.splice(self.arrSelected.indexOf(d.data.name),1);
//                    console.log(self.arrSelected);
                }
                else
                {
                    if(self.selected<2)
                    {
                        node.classed("chosen",true);
                        node.selectAll("circle").transition().duration(self.transTime).style("fill","#FFF");
                        node.selectAll("text").transition().duration(self.transTime).style("fill",function(d){return d.children? self.backColor : self.bubbleColorScale(d.parent.data.name);});
                        self.selected+=1;
                        self.arrSelected.push(d.data.name);
//                        console.log(self.arrSelected);
                    }
                }
            }

        self.selectCallBack(self.arrSelected);

    }

    self.render = function(data)
    {
        self.warningMessage.remove();
        self.data = data;

        var leaves = self.pack(self.data);

        self.leaves = leaves;


        if(!self.firstRender)
        {
//            console.log("Otros render...");
        }
        else
        {

//        console.log("Primer render...");

        var node = self.svg.selectAll('.node')
              .data(leaves,function(d){return d.data.name;});

        // The groups...

        self.news = node.enter().insert("g",".leaf")
            .attr("class", function(d) { return d.children ? "parent node" : "leaf node"; })
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
            .on("click",function(d,i){return self.iluminaNews(this,d,i);});

//        self.radiusScale = d3.scale.log().domain([1,65000]).range([1,40]).clamp(true);

        // The bubbles...

        self.nodes = self.news.append("circle")
            .on("mouseover",function(d,i){
                if(!d.children)
                {

                self.tooltip.style("opacity",1.0).html(self.nameCallback(d.data.name, d.value.toFixed(2), d.children,d.parent.data.name));

                }
            })
            .on("mouseout", function(d,i){
                if(!d.children)
                {


                    self.tooltip.style("opacity",0.0);


                }
            })
            .attr('class',function(d){ return d.children ? "parent circleNode" : "leaf circleNode"; })
//            .attr("title", function(d){ return d.data.name!='root' ? self.nameCallback(d.data.name, d.value.toFixed(2), d.children) : "";})
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
//            alert("Encontrado en "+x+" "+y);
//
//            self.zoomVar.scale(self.nearZoom);
//
//            var centerX = (self.width/2);
//            var centerY = (self.height/2);
//
//            self.zoomVar.translate()[0] =  (centerX - x);
//            self.zoomVar.translate()[1] =  (centerY - y);
//
//
//            self.svg.attr("transform",
//                "translate(" + self.zoomVar.translate() + ")"
//                    + " scale(" + self.zoomVar.scale() + ")");

// Funciona pero incompatible con el zooom normal

//            var nearZoom = self.height/(r*2)/self.nearRatio;
//
//            var centerX = (self.width/2)/nearZoom;
//            var centerY = (self.height/2)/nearZoom;
//
//            self.zoomVar.translate()[0] =  (centerX - x);
//            self.zoomVar.translate()[1] =  (centerY - y);
//
//            self.zoomVar.scale(nearZoom);
//
//            self.svg.transition().duration(self.transTime).attr("transform",
//                "scale(" + self.zoomVar.scale() + ")"
//                    + " translate(" + self.zoomVar.translate() + ")");


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
            alert("Site not found");
        }
    }

    // Main del objeto

    self.init();

    return self;


}
