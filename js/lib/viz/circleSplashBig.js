var tdviz = tdviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };


tdviz.viz.circleSplashBig = function (options)

{


    // Object

    var self = {};

    self.interval = 5000;

    // Get options data

    for (key in options){
        self[key] = options[key];
    }


    // Color for parents and global nodes (should be equal to background color in body)

    self.backColor = "#000";

    self.parentSelect = "#"+self.idName;

    self.init = function(){

    self.bubbleColorScale = d3.scale.category20b();

    self.animationOn = true;

    // svg init

    self.positions=[];

    for(var i=0;i<100;i++)
    {
        self.positions[i] = {'x':0,'y':0};

    }



    self.myLog("Iniciando circleSplash... en ",3);
    self.myLog(self.parentSelect,3);
    self.svg = d3.select(self.parentSelect).append("svg")
        .attr("width",self.width)
        .attr("height",self.height)
        .on("mousemove",mousemove)
        .attr("id","panel")
        .append("g").on("mousemove", mousemove);

        $('#panel').hover(function(){console.log("in");},function(){console.log("out");});


        $('#panel').mouseenter(function(){console.log("in");self.animationOn=false;});
        $('#panel').mouseleave(function(){console.log("out");self.animationOn=true;});

        $('.leftFrame').mouseenter(function(){console.log("out");self.animationOn=true;});




//        self.info = d3.select(self.parentSelect).append("div")
//            .html('Tres tipos de nodos, con tres colores diferenciados: posts,tags,categorias</br></br> Pasando el ratón por encima aparece el conteo e info abreviada, y clickando, se aterriza en la lista de posts con ese tag/categoria</br></br>El tamaño del nodo corresponde con el conteo de posts asociados </br></br> El ojo debería ser un icono de un telescopio, que se cambia a ojo cuando la info se expande </br>')
//            .attr("class", "info")
//            .style("opacity", 1)
//            .style("left", "50px")
//            .style("top", "50px");

        function mousemove()
        {
//            self.div
//                .style("left", (d3.event.pageX ) + "px")
//                .style("top", (d3.event.pageY - 12) + "px");
        }

        var nodes = d3.range(100).map(function() { return {radius: Math.random() * 25 + 10}; }),
            color = d3.scale.ordinal().range(["#00A0DF","#90D400","#000"]);

        console.log(nodes);

        self.putName = function(i)
        {
            console.log("Me llega el i"+i);
            var type = i % 3;
            console.log("Me llega el type"+type);

            if(type==0)
            {
                return "PostName";
            }
            else
            {
                if(type==1)
                {
                    return "CatName";
                }
                else
                {
                    if(type==2)
                    {
                        return "TagName";
                    }
                    else
                    {
                        return "DontKnow";
                    }
                }
            }
        }

        var force = d3.layout.force()
            .gravity(0.2)
            .charge(function(d, i) { return i ? 0 : 100; })
            .nodes(nodes)
            .friction(0.95)
            .size([self.width, self.height]);

        var root = nodes[0];
        root.radius = 0;
        root.fixed = true;

        self.nodes = nodes;

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
                self.svg.selectAll("image").remove();

                self.svg.selectAll("text.first")
                    .data(nodes.slice(1))
                    .enter().append("svg:text")
                    .filter(function(d,j){return j==i;})
                    .style("fill","FFF")
                    .attr("class","first")
                    .attr("text-anchor","middle")
                    .attr("x",posx)
                    .attr("y",posy-35)
                    .style("font-size",5)
                    .text(function(){return self.putName(i);})
                    .style("opacity",1e-6)
                    .transition().duration(1500)
                    .style("font-size",30)
                    .style("opacity",1.0);


                self.svg.selectAll("image")
                    .data(nodes.slice(1))
                    .enter().append("image")
                    .filter(function(d,j){return j==i;})
                    .attr("class","noevents")
                    .attr("xlink:href","img/imagenBolas.gif")
                    .attr("width","0px")
                    .attr("height","0px")
                    .attr("x",posx)
                    .attr("y",posy)
                    .style("opacity",1e-6)
                    .transition().duration(1500)
                    .attr("x",posx-50)
                    .attr("y",posy-20)
                    .attr("width","100px")
                    .attr("height","100px")
                    .style("opacity",1.0);



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
//
//                self.div.html('<img src="img/eye.gif" height="50" width="50">');
                self.svg.selectAll("text").transition().duration(1500).style("opacity",0.1).remove();
                self.svg.selectAll("circle").transition().duration(1500).style("opacity",1.2).attr("r",function(d) { return d.radius - 2; });
                d3.select(this).transition().duration(1500).attr("r",function(d) { return d.radius - 2; })
                self.svg.selectAll("image").transition().duration(1500)
                    .attr("width","0px")
                    .attr("height","0px")
                    .attr("x", function(d,i){return d.x;})
                    .attr("y", function(d,i){return d.y;})
                    .style("opacity",1e-6).remove();

            });

        self.animaBola = function()
        {
            console.log("animando");

            if (self.animationOn)
            {
                console.log("animo");

                var index = Math.floor((Math.random()*self.nodes.length)+1);

                console.log(index);

                var posx;
                var posy;

                self.svg.selectAll("circle").transition().duration(1500).transition().duration(1500).style("opacity",0.2).attr("r",function(d) { return d.radius - 2; });

                self.svg.selectAll("circle").filter(function(d,i){return i==index;}).transition().duration(1500).transition().duration(1500).each(function(d,i){posx = d.x;posy= d.y;}).style("opacity",1.0).attr("r",100);

                self.svg.selectAll("text").remove();
                self.svg.selectAll("image").remove();

                self.svg.selectAll("text.first")
                    .data(self.nodes.slice(1))
                    .enter().append("svg:text")
                    .filter(function(d,i){return i==index;})
                    .style("fill","FFF")
                    .attr("class","first")
                    .attr("text-anchor","middle")
                    .attr("x", function(d,i){return d.x;})
                    .attr("y", function(d,i){return d.y-35;})
                    .style("font-size",5)
                    .text(function(){return self.putName(index);})
                    .style("opacity",1e-6)
                    .style("font-size",30)
                    .transition().duration(1500)
                    .transition().duration(1500)
                    .style("opacity",1.0);


                self.svg.selectAll("image")
                    .data(nodes.slice(1))
                    .enter().append("image")
                    .filter(function(d,i){return i==index;})
                    .attr("class","noevents")
                    .attr("xlink:href","img/imagenBolas.gif")
                    .attr("width","0px")
                    .attr("height","0px")
                    .attr("x",posx)
                    .attr("y",posy)
                    .style("opacity",1e-6)
                    .transition().duration(1500)
                    .attr("x",posx-50)
                    .attr("y",posy-20)
                    .attr("width","100px")
                    .attr("height","100px")
                    .style("opacity",1.0);


            }
        }
        self.refreshId = setInterval(self.animaBola, self.interval);
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
