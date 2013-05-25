var tdviz = tdviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };


tdviz.viz.svgSplash = function (options)

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

    self.positions=[];

    for(var i=0;i<50;i++)
    {
        self.positions[i] = {'x':0,'y':0};

    }



    self.myLog("Iniciando circleSplash... en ",3);
    self.myLog(self.parentSelect,3);
    self.svg = d3.select(self.parentSelect).append("svg")
        .attr("width",self.width)
        .attr("height",self.height)
        .on("mousemove",mousemove)
        .append("g").on("mousemove", mousemove);

        self.div = d3.select(self.parentSelect).append("div")
            .html('<img src="img/eye.gif" height="50" width="50">')
            .attr("class", "tooltip")
            .style("opacity", 1);

        self.info = d3.select(self.parentSelect).append("div")
            .html('Tres tipos de nodos, con tres colores diferenciados: posts,tags,categorias</br></br> Pasando el ratón por encima aparece el conteo e info abreviada, y clickando, se aterriza en la lista de posts con ese tag/categoria</br></br>El tamaño del nodo corresponde con el conteo de posts asociados </br></br> El ojo debería ser un icono de un telescopio, que se cambia a ojo cuando la info se expande </br>')
            .attr("class", "info")
            .style("opacity", 1)
            .style("left", "50px")
            .style("top", "50px");

        function mousemove()
        {
            self.div
                .style("left", (d3.event.pageX ) + "px")
                .style("top", (d3.event.pageY - 12) + "px");
        }

        var nodes = d3.range(50).map(function() { return {radius: Math.random() * 20 + 10}; }),
            color = d3.scale.category10();

        var force = d3.layout.force()
            .gravity(0.2)
            .charge(function(d, i) { return i ? 0 : 100; })
            .nodes(nodes)
            .friction(0.95)
            .size([self.width, self.height]);

        var root = nodes[0];
        root.radius = 0;
        root.fixed = true;

        force.start();

        self.svg.selectAll("circle")
            .data(nodes.slice(1))
            .enter().append("svg:circle")
            .attr("r", function(d) { return d.radius - 2; })
            .style("fill", function(d, i) { return color(i % 3); })
            .on("mousemove", mousemove)
            .on("mouseover",function(d,i)
            {
                var posx = d.x;
                var posy = d.y;

                console.log(posx);
                console.log(posy);

                self.svg.selectAll("text").remove();
                self.svg.selectAll("text.first")
                    .data(nodes.slice(1))
                    .enter().append("svg:text")
                    .filter(function(d,j){return j==i;})
                    .style("fill","FFF")
                    .attr("class","first")
                    .attr("text-anchor","middle")
                    .attr("x",posx)
                    .attr("y",posy)
                    .style("font-size",5)
                    .text("Tag1")
                    .style("opacity",1e-6)
                    .style("font-size",30)
                    .transition().duration(1500)
                    .style("opacity",1.0);

                self.svg.selectAll("text.second")
                    .data(nodes.slice(1))
                    .enter().append("svg:text")
                    .filter(function(d,j){return j==i;})
                    .style("fill","FFF")
                    .attr("class","second")
                    .attr("text-anchor","middle")
                    .attr("x",posx)
                    .attr("y",posy+20)
                    .text("Click en nodo")
                    .style("opacity",1e-6)
                    .style("font-size",20)
                    .transition().duration(1500)
                    .style("opacity",1.0);

                self.div.transition().duration(1500).style("opacity", 0.3);
                self.svg.selectAll("circle").transition().duration(1500).style("opacity",0.2).attr("r",function(d) { return d.radius - 2; });
                d3.select(this).transition().duration(1500).style("opacity",1.0).attr("r",100).each("end",function()
                {


                }

                );
//                self.svg.selectAll("text").filter(function(d,j){return j==i;}).transition().duration(1500).each("end",function(d,i){d3.select(this).attr("visibility","visible");});
//                self.svg.selectAll("text").filter(function(d,j){return j==i;}).style("opacity",0.0).transition().duration(1500).attr("visibility","visible").style("opacity",1.0);

//                self.svg.selectAll("text").data(nodes.slice(1)).enter().append("text").text("Tag1").style("font-size",20).attr("x", self.positions[i].x).attr("y", self.positions[i].y);
            }
            )
            .on("mouseout",function(d,i)
            {
                self.div.transition().duration(1500).style("opacity",1.0);
//
//                self.div.html('<img src="img/eye.gif" height="50" width="50">');
                self.svg.selectAll("text").transition().duration(1500).style("opacity",0.1).remove();
                self.svg.selectAll("circle").transition().duration(1500).style("opacity",1.2).attr("r",function(d) { return d.radius - 2; });
                d3.select(this).transition().duration(1500).attr("r",function(d) { return d.radius - 2; })
            });


//        self.svg.selectAll("text")
//            .data(nodes.slice(1))
//            .enter().append("svg:text")
//            .style("fill","FFF")
//            .attr("visibility","hidden")
//            .attr("text-anchor","middle")
//            .text("Tag1");

        force.on("tick", function(e) {
            var q = d3.geom.quadtree(nodes),
                i = 0,
                n = nodes.length;

            while (++i < n) {
                q.visit(collide(nodes[i]));
            }

            self.svg.selectAll("circle")
                .attr("cx", function(d,i) { self.positions[i].x = d.x;return d.x; })
                .attr("cy", function(d,i) { self.positions[i].y = d.y;return d.y; });


//            self.svg.selectAll("text")
//                .attr("x", function(d,i) { self.positions[i].x = d.x;return d.x; })
//                .attr("y", function(d,i) { self.positions[i].y = d.y;return d.y; });
//
//                if(force.alpha()<0.11)
//                {
//                    force.alpha(0.11);
//                }
        });

        self.svg.on("mousemove", function() {
//            var p1 = d3.svg.mouse(this);
//            root.px = p1[0];
//            root.py = p1[1];
//            force.end();
        });

        function collide(node) {
            var r = node.radius + 16,
                nx1 = node.x - r,
                nx2 = node.x + r,
                ny1 = node.y - r,
                ny2 = node.y + r;
            return function(quad, x1, y1, x2, y2) {
                if (quad.point && (quad.point !== node)) {
                    var x = node.x - quad.point.x,
                        y = node.y - quad.point.y,
                        l = Math.sqrt(x * x + y * y),
                        r = node.radius + quad.point.radius;
                    if (l < r) {
                        l = (l - r) / l * .5;
                        node.x -= x *= l;
                        node.y -= y *= l;
                        quad.point.x += x;
                        quad.point.y += y;
                    }
                }
                return x1 > nx2
                    || x2 < nx1
                    || y1 > ny2
                    || y2 < ny1;
            };
        }


    }


    self.render = function(data)
    {
        self.data = data;


        console.log("Primer render...");

//        var node = self.svg.selectAll('.node')
//              .data(leaves,function(d){return d.data.name;});



    }

    // Main del objeto

    self.init();


}
