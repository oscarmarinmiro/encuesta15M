
var tdviz = tdviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };


// Draws a d3.js networkDiagram based on a layout
// Parameters
// idName => DOM id for drawing diagram
// width => SVG width
// height => SVG height
// transTime => transitions time (milliseconds)
// loadingMessage => message to display while loading data
// myLog => logging function

tdviz.viz.network3DDiagram = function (options)
{

    // Object

    var self = {};

    // Global vars

    self.MAX_NODE_SIZE = 1;
    self.MIN_NODE_SIZE = 1;
    self.MAX_NODE_HEIGHT = 100;
    self.MIN_NODE_HEIGHT = 0;
    self.LINK_WIDTH = 0.05;
    self.CAMERA_HEIGHT = 100;

    // Get options data

    for (key in options){
        self[key] = options[key];
    }

    self.parentSelect = "#"+self.idName;

    self.init = function()
    {
        // requestAnim shim layer by Paul Irish
        window.requestAnimFrame = (function(){
            return  window.requestAnimationFrame       ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame    ||
                window.oRequestAnimationFrame      ||
                window.msRequestAnimationFrame     ||
                function(/* function */ callback, /* DOMElement */ element){
                    window.setTimeout(callback, 1000 / 60);
                };
        })();

        // Loading message...


        $("#infoDiv").css("top",self.height/2+"px");
        $("#infoDiv").css("left",self.width/2+"px");
        $("#infoDiv").css("width","200px");
        $("#infoDiv").html(self.loadingMessage);


        // WebGL init

        var renderer = new THREE.WebGLRenderer({antialias:true});
        renderer.setSize( self.width, self.height );

        $(self.parentSelect).append(renderer.domElement);

        var scene = new THREE.Scene();

        // Camara

        var camera = new THREE.PerspectiveCamera(
            45,         // Field of view
            self.width/ self.height,  // Aspect ratio
            .1,         // Near
            10000       // Far
        );

        self.controls = new THREE.FlyControls(camera);

        camera.position.set( self.width, self.CAMERA_HEIGHT, self.height);
        camera.lookAt(new THREE.Vector3( self.width/4.0, 0, self.height/4.0));
        scene.add( camera );

        self.keyboard = new THREEx.KeyboardState();


        // Test de geometria: cilindro

//        // Geometria: Cubo
//
//        var cube = new THREE.Mesh(
//            new THREE.CylinderGeometry(100, 100, 100),
//
////            new THREE.CubeGeometry( 5, 5, 5 ),
//            new THREE.MeshLambertMaterial( { color: 0xFFFF00 } )
//        );
//        scene.add( cube );

        // Geometria: Linea

        var plane = new THREE.Mesh(new THREE.PlaneGeometry(self.width*2, self.height*2, 10, 10), new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            opacity: 0.1,
            transparent: true,
            wireframe: true
        }));

        plane.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 2));

        scene.add(plane);

        // Luz

        var light = new THREE.PointLight( 0xFFFFFF );
        light.position.set( self.width, 20, self.height );
        scene.add( light );

        renderer.render(scene, camera);

        //lineS.material.color.set(0xffffff);

        // E inserto las variables en el objeto...

        self.renderer = renderer;

        self.scene = scene;

        self.light = light;

        self.camera = camera;

        // Marco el flag de firstRender...

        self.firstRender = true;

        // Un proyector para deshacer el render (onclick)

        self.projector = new THREE.Projector();


//        // svg init
//
//        self.myLog("Iniciando network diagram... en ",3);
//        self.myLog(self.parentSelect,3);
//        self.svg = d3.select(self.parentSelect).append("svg")
//            .attr("width",self.width)
//            .attr("height",self.height)
//            .call(d3.behavior.zoom().on("zoom", self.redraw))
//            .append("g");
//
//        // g de los enlaces
//
//        self.linksGroup = self.svg.append("g").attr("class","linksG");
//
//
//        // g de los nodos
//
//        self.nodesGroup = self.svg.append("g").attr("class","nodesG");
//
//        // escalas de posicion
//
        self.scalePosX = d3.scale.linear().domain([0,1]).range([0,self.width]);
        self.scalePosZ = d3.scale.linear().domain([0,1]).range([0,self.height]);
//
//
        // escalas de tamaño de nodo (radio)

          self.scaleCIS = d3.scale.sqrt().domain([0,1]).range([self.MIN_NODE_SIZE,self.MAX_NODE_SIZE]).clamp(true);
          self.scaleCPS = d3.scale.sqrt().domain([0,0.05]).range([self.MIN_NODE_SIZE,self.MAX_NODE_SIZE]).clamp(true);
          self.scaleDegree = d3.scale.sqrt().domain([1,100]).range([self.MIN_NODE_SIZE,self.MAX_NODE_SIZE]).clamp(true);

        // escalas de altura de nodo

        self.scaleCISHeight = d3.scale.linear().domain([0,1]).range([self.MIN_NODE_HEIGHT,self.MAX_NODE_HEIGHT]).clamp(true);
        self.scaleCPSHeight = d3.scale.linear().domain([0,0.05]).range([self.MIN_NODE_HEIGHT,self.MAX_NODE_HEIGHT]).clamp(true);
        self.scaleDegreeHeight = d3.scale.linear().domain([1,100]).range([self.MIN_NODE_HEIGHT,self.MAX_NODE_HEIGHT]).clamp(true);
        self.scaleMonetaryHeight = d3.scale.linear().domain([1,600]).range([self.MIN_NODE_HEIGHT,self.MAX_NODE_HEIGHT]).clamp(true);

//
//
//        // escalas de opacidad de los enlaces
//
          self.scaleLink = d3.scale.linear().domain([0,1]).range([0.05,0.1]).clamp(true);
//
//        // escala ordinal de colores de nodos
//
//        self.scaleState = d3.scale.ordinal().domain(["inactive","active","disconnected"]).range(["#000","#0F0","#F00"]);
//
          self.scaleState = d3.scale.ordinal().domain(["inactive","active","disconnected"]).range(["#000","#afcb46","#de363a"]);
//
//        // escala ordinal de colores de links
//
//        //self.scaleStateLink = d3.scale.ordinal().domain(["active","infected","disconnected","inactive"]).range(["#FFF","#FF0","#F00","#000"]);
//
          self.scaleStateLink = d3.scale.ordinal().domain(["active","infected","disconnected","inactive"]).range(["#afcb46","#FF0","#de363a","#000"]);
//

        // escalas de color para las telco

        //colorbrewer.YlGnBu[6][1] = "#E6E6FA";

        self.scaleCompany = d3.scale.ordinal().domain(["METEOR","VODAFONE","THREE","Tesco","Lyca Mobile","?"]).range(colorbrewer.YlGnBu[6]);


//        // warning message
//
//        self.warningMessage = self.svg.append("text")
//            .attr("text-anchor", "middle")
//            .attr("class","netChartTextWarning")
//            .attr("x", self.width/2)
//            .attr("y",self.width/2)
//            .text(self.loadingMessage);
//

        // Listener de eventos para mouseover/click sobre geometrias 3D

      $('#chartContent').mousedown(self.onDocumentMouseDown);

      // Índice del último seleccionado para restaurar su color original....

      self.lastSelected = -1;
      self.lastOriginalColor = "#FFF";


    }

    self.onDocumentMouseDown = function( event,ui)
    {
        event.preventDefault();

        //self.controls.update(5);

        //console.log(self.camera.position);

        var topOffset = $(window).scrollTop();
        var leftOffset = $(window).scrollLeft();

        //console.log("Scroles");

        //console.log(topOffset);

        //console.log(leftOffset);


        var relativeX = event.clientX - ($(this).offset().left);
        var relativeY = event.clientY - ($(this).offset().top);

        relativeX+= leftOffset;
        relativeY+= topOffset;


        var vector = new THREE.Vector3( ( relativeX / $(this).innerWidth() )* 2 - 1, - ( relativeY / $(this).innerHeight() )* 2 + 1, 0.5);

        //console.log(vector);


        self.projector.unprojectVector( vector, self.camera );

        var raycaster = new THREE.Raycaster( self.camera.position, vector.sub( self.camera.position ).normalize() );

        var intersects = raycaster.intersectObjects( self.objects );

        //console.log(self.objects);
        //console.log(intersects);

        if(intersects.length==0)
        {
            // Remove colors and info

                self.render (self.data,self.nowDate,self.dataIn);

                self.nodeInfoRemove();
        }
        else
        {

            self.render (self.data,self.nowDate,self.dataIn);

            for (var i=0;i<intersects.length;i++)
            {
                var index = intersects[i].object.internalIndex;
                //console.log(intersects[i].object.internalIndex);

                var sphere = self.objects[index];

                var color = new THREE.Color( "#FFF");

                sphere.material.color = color;

                // put info with last index

                self.nodeInfoCall(self.data['nodes'][index]);
            }
        }

        //console.log(relativeX);
        //console.log(relativeY);

    }

    self.animate = function()
    {
        requestAnimFrame( self.animate );
        self.renderScene();
    }

    self.renderScene = function()
    {
        self.controls.update(4);
//        if ( self.keyboard.pressed("q") )
//        {
//            console.log("Apretado q");
//            self.camera.position.y+=5;
//        }
//        if ( self.keyboard.pressed("a") )
//        {
//            console.log("Apretado a");
//            self.camera.position.y-=5;
//        }
//
//        if ( self.keyboard.pressed("w") )
//        {
//            console.log("Apretado w");
//            self.camera.rotation.x+=0.1;
//        }
//        if ( self.keyboard.pressed("s") )
//        {
//            console.log("Apretado s");
//            self.camera.rotation.x-=0.1;
//        }
//
//
        self.renderer.render(self.scene,self.camera);

    }


    self.remarkNode = function(d,i)
    {
//        nodes = d['links'];
//
//        linkIndexes = [];
//        nodeIndexes = [];
//
//        // Añado el propio nodo
//
//        nodeIndexes[self.data['nodesDict'][d.userId]] = true;
//
//        for (var target in nodes)
//        {
//            var nodeId = nodes[target].target;
//            var linkIdFirst = d.userId + " " + nodeId;
//            var linkIdSecond = nodeId + " " + d.userId;
//            var linkIdFirstIndex = self.data['linksDict'][linkIdFirst];
//            var linkIdSecondIndex = self.data['linksDict'][linkIdSecond];
//            //console.log(nodeId);
//            //console.log(self.data['nodesDict'][nodeId]);
//            nodeIndexes[self.data['nodesDict'][nodeId]] = true;
//            linkIndexes[linkIdFirstIndex] = true;
//            linkIndexes[linkIdSecondIndex] = true;
//        }
//        //console.log(nodeIndexes);
//        //console.log(linkIndexes);
//
//        // Selecciono los nodos
//
//        d3.selectAll(".nodes").data(self.data['nodes'])
//            .style("opacity",function(d,i){return i in nodeIndexes ? 1.0:0.2});
//
//        d3.selectAll(".links").data(self.data['links'])
//            .style("opacity",function(d,i){return i in linkIndexes ? self.scaleLink(d.weight):0.0});

        // Selecciono los enlaces

    }

    self.unmarkNode = function(d,i)
    {
//        d3.selectAll(".nodes").data(self.data['nodes'])
//            .style("opacity",1.0);
//
//        d3.selectAll(".links").data(self.data['links'])
//            .style("opacity",function(d,i){return self.scaleLink(d.weight);});


    }

    self.buildNodeText = function(node)
    {
        myHtml= "";

        myHtml+="<b>Node Info</b><hr>";

        myHtml+= "<b>PhoneId</b> "+node.userId+"<br>";
        myHtml+= "<b>Status</b> "+node.state+"<br>";
        myHtml+= "<b>ConDate</b> "+node.conDate+"<br>";
        myHtml+= "<b>DisDate</b> "+node.disDate+"<br>";
        myHtml+= "<b>CPS</b> "+node.cps+"<br>";
        myHtml+= "<b>CIS</b> "+node.cis+"<br>";
        myHtml+= "<b>CIV_W</b> "+node.civ_w+"<br>";
        myHtml+= "<b>CIV_I</b> "+node.civ_i+"<br>";
        myHtml+= "<b>Degree</b> "+node.links.length+"<br>";
        myHtml+= "<b>Monetary Value</b> "+node.monetaryValue+"<br>";
        myHtml+= "<b>Migrated To</b> "+node.disCompany+"<br>";

        return myHtml;
    }

    self.getLinkState = function (d)
    {
        // State of the source link

        var sState = self.data['nodes'][self.data['nodesDict'][d.source]]['state'];

        // State of the target link

        var tState = self.data['nodes'][self.data['nodesDict'][d.target]]['state'];

        var finalState = "active";

        if ((tState=='inactive') || (sState=='inactive'))
        {
            finalState = "inactive";
        }
        else
        {
            if ((tState=='disconnected')&&(sState=='disconnected'))
            {
                finalState = "disconnected";
            }
            else
            {
                if ((tState=='disconnected')||(sState=='disconnected'))
                {
                    finalState = "infected";
                }
                else
                {
                    finalState = "active";
                }
            }
        }
        //console.log("retorno el estado para el link:"+sState+ " " + tState + " " + finalState);

        return finalState;

    }
    self.scaleNodeSelect = function(d,dataIn)
    {
        if(dataIn=="cis")
        {
            return self.scaleCIS(d['cis']);
        }
        if(dataIn=="cps")
        {
            return self.scaleCPS(d['cps']);
        }
        else
        {
            return self.scaleDegree(d['degree']);
        }
    }

    self.scaleNodeHeight = function(d,i,nowDateString,dataIn)
    {
        var factor = self.getNodeState(d,i,nowDateString)=='disconnected'? -1.0:1.0;

//        console.log("En el node height");
//        console.log(d);
//        console.log(i);
//        console.log(nowDateString);
//        console.log(dataIn);


        if(dataIn=="cis")
        {
            return self.scaleCISHeight(d['cis'])*factor;
        }
        if(dataIn=="cps")
        {
            return self.scaleCPSHeight(d['cps'])*factor;
        }
        if(dataIn=="degree")
        {
            return self.scaleDegreeHeight(d['degree'])*factor;
        }
        else
        {
            return self.scaleMonetaryHeight((d['monetaryValue']))*factor;
        }
    }

    self.getNodeState = function(node,i,nowDate)
    {

        var state="inactive";
        var conDate = node['conDate'];
        var disDate = node['disDate'];

        if (conDate!='?')
        {
            if ((conDate < nowDate) && (disDate>nowDate))
            {
                state = "active";
            }
            else if(disDate<=nowDate)
            {
                state = "disconnected";
            }
            else
            {
                state = "inactive";
            }
        }
        else if(disDate!='?')
        {
            if (disDate<=nowDate)
            {
                state = "disconnected";
            }
            else
            {
                state = "active";
            }
        }
        else
        {
            state = "active";
        }


        self.data['nodes'][i]['state']=state;

        return(state);
    }

    self.buildGeometry = function(nowDate,dataIn,dataInS)
    {
        self.myLog("Primer render",2);

        self.objects = [];

        var nowDateString = nowDate.clone().format("YYYYMMDD");

        // Recorro el array de nodos y creo esferas

        var nodeData = self.data['nodes'];

        for(var i=0;i<nodeData.length;i++)
        {
            // Paso el dato individual a 'd' para asegurar compatibilidad con código D3

            var d = nodeData[i];

            // Color según estado

            var nodeState = self.getNodeState(d,i,nowDateString);

            var color;

            if (nodeState!="disconnected")
            {
                color = self.scaleState(nodeState);
            }
            else
            {
                //color = self.scaleCompany(d['disCompany']);

                color = self.scaleState(nodeState);

            }

            var posX =  self.scalePosX(d['posx']);

            // La z es la antigua 'y'

            var posZ =  self.scalePosZ(d['posy']);

            // Visibilidad

            var visibility =  self.getNodeState(d,i,nowDateString)=='inactive'? "hidden":"visible";

            // La altura...

            var posY = self.scaleNodeHeight(d,i,nowDateString,dataInS);

            // Radio de la esfera

            var radius = self.scaleNodeSelect(d,dataIn);

            // Y voy creando la geometria, añadiendo a la escena y además a la estructura de nodos

            // create the sphere's material
            var sphereMaterial =
                new THREE.MeshLambertMaterial(
                    {
                        color: color
                    });

            var sphere = new THREE.Mesh(

                new THREE.SphereGeometry(
                    1),

                sphereMaterial);




            d['sphere'] = sphere;
            d['height'] = posY;

            self.scene.add(sphere);

            sphere.position.x = posX;
            sphere.position.y = posY;
            sphere.position.z = posZ;

            sphere.scale.x = radius;
            sphere.scale.y = radius;
            sphere.scale.z = radius;

            sphere.internalIndex = i;

            self.objects.push(sphere);

        }

        // Recorro el array de links y creo lineas

        var linksData = self.data['links'];

        for(i=0;i<linksData.length;i++)
        {
           var d = linksData[i];

           var color = self.scaleStateLink(self.getLinkState(d));

           var opacity = self.scaleLink(d.weight);

           var x1 = self.scalePosX(self.data['nodes'][self.data['nodesDict'][d.source]]['posx']);
           var z1 = self.scalePosZ(self.data['nodes'][self.data['nodesDict'][d.source]]['posy']);
           var y1 = self.data['nodes'][self.data['nodesDict'][d.source]]['height'];


           var x2 = self.scalePosX(self.data['nodes'][self.data['nodesDict'][d.target]]['posx']);
           var z2 = self.scalePosZ(self.data['nodes'][self.data['nodesDict'][d.target]]['posy']);
           var y2 = self.data['nodes'][self.data['nodesDict'][d.target]]['height'];


           var material = new THREE.LineBasicMaterial({
                color: color,
                opacity: opacity,
                transparent: true,
                visible: true
           });

           var geometry = new THREE.Geometry();
           geometry.vertices.push(new THREE.Vector3(x1, y1, z1));
           geometry.vertices.push(new THREE.Vector3(x2, y2, z2));

           var line = new THREE.Line(geometry, material);

           self.scene.add(line);

           d['line'] = line;


//            .style("opacity",function(d,i){return self.scaleLink(d.weight);})
//            .attr("x1",function(d,i){return self.scalePosX(self.data['nodes'][self.data['nodesDict'][d.source]]['posx']);})
//            .attr("y1",function(d,i){return self.scalePosY(self.data['nodes'][self.data['nodesDict'][d.source]]['posy']);})
//            .attr("x2",function(d,i){return self.scalePosX(self.data['nodes'][self.data['nodesDict'][d.target]]['posx']);})
//            .attr("y2",function(d,i){return self.scalePosY(self.data['nodes'][self.data['nodesDict'][d.target]]['posy']);});


        }

    }

    // Build a monetary information structure to be read
    // by the controller callback (to update news info)

    self.buildMonetaryInfo = function()
    {
        var data = self.data['nodes'];

        // Build monetary info struct for the callback

        var monInfo = {'con':0,'dis':0,'conValue':0,'disValue':0,'disMap':{}};

        // Build info node by node. state is updated in every render...

        for(var i=0;i<data.length;i++)
        {

            if(data[i].state=="active")
            {
                monInfo['con']++;
                monInfo['conValue']+=data[i]['monetaryValue'];
            }
            // If disconnected...
            if(data[i].state=="disconnected")
            {
                monInfo['dis']++;
                monInfo['disValue']+=data[i]['monetaryValue'];

                var company = data[i]['disCompany'];

                // Build a company monetary loss structure, with disconnected count and monetary value
                // per company

                if (!(company in monInfo.disMap))
                {
                    monInfo.disMap[company] = {};
                    monInfo.disMap[company]['number'] = 0;
                    monInfo.disMap[company]['value'] = 0;
                }

                monInfo.disMap[company]['number']++;
                monInfo.disMap[company]['value']+= data[i]['monetaryValue'];

            }

        }

        return monInfo;
    }

    self.changeGeometry = function(nowDate,dataIn,dataInS)
    {
        self.myLog("render de cambio",2);
        var nowDateString = nowDate.clone().format("YYYYMMDD");

        // Recorro el array de nodos y creo esferas

        var nodeData = self.data['nodes'];

        for(var i=0;i<nodeData.length;i++)
        {
            // Paso el dato individual a 'd' para asegurar compatibilidad con código D3

            var d = nodeData[i];

            var nodeState = self.getNodeState(d,i,nowDateString);

            // Color según estado

            var color;

            if (nodeState!="disconnected")
            {
                color = self.scaleState(nodeState);
            }
            else
            {
//                color = self.scaleCompany(d['disCompany']);

                color = self.scaleState(nodeState);

            }


            var radius = self.scaleNodeSelect(d,dataIn);


            // La altura...

            var posY = self.scaleNodeHeight(d,i,nowDateString,dataInS);

            d['height'] = posY;

            // Y voy creando la geometria, añadiendo a la escena y además a la estructura de nodos

            // create the sphere's material


            var sphere = d['sphere'];

            var color = new THREE.Color( color);

            sphere.material.color = color;

            sphere.scale.x = radius;
            sphere.scale.y = radius;
            sphere.scale.z = radius;

            sphere.position.y = posY;

            //console.log(sphere);



        }

        // Recorro el array de links y creo lineas

        var linksData = self.data['links'];

        for(i=0;i<linksData.length;i++)
        {
            var d = linksData[i];

            var color = self.scaleStateLink(self.getLinkState(d));

            var opacity = self.scaleLink(d.weight);

            var line = d['line'];

            var color = new THREE.Color( color);

            line.material.color = color;

            line.material.opacity = opacity;


            var previousline = line;

            var previousY1 = line.geometry.vertices[0].y;

            var previousY2 = line.geometry.vertices[1].y;

            line.geometry.vertices[0].y = self.data['nodes'][self.data['nodesDict'][d.source]]['height'];

            line.geometry.vertices[1].y = self.data['nodes'][self.data['nodesDict'][d.target]]['height'];

            if((previousY1!=line.geometry.vertices[0].y) || (previousY2!=line.geometry.vertices[1].y))
            {

                line.geometry.verticesNeedUpdate = true;
            }

        }


    }

    self.render = function(data,nowDate,dataIn)
    {

          self.data = data;

          self.nowDate = nowDate;

          self.dataIn = dataIn;

          self.dataInS = dataIn;

          self.myLog("En el render....",2);

          if (self.firstRender==true)
          {
              self.buildGeometry(nowDate,dataIn,dataIn);

              //console.log("Empiezo el render...");

              self.renderer.render(self.scene, self.camera);

              //console.log("Fin del render...");

              self.firstRender = false;

              self.renderer.render(self.scene,self.camera);

              self.animate();
          }
          else
          {
              self.changeGeometry(nowDate,dataIn,dataIn);
//              self.renderer.render(self.scene,self.camera);

//              self.renderer.render(self.scene,self.camera);
          }

            // Monetary info display info

            monInfo = self.buildMonetaryInfo();

            console.log("monInfo");

            console.log(monInfo);

            // And call the news div update callback...

            self.monetaryCall(monInfo);

            $("#infoDiv").html("");
//
//        self.data = data;
//
//        self.myLog("Datos que me llegan",3);
//
//        self.myLog(data,3);
//
//        self.myLog("La nowDate es:",3);
//        self.myLog(nowDate,3);
//
//        self.myLog("dataIn es"+dataIn,3);
//
//        nowDateString = nowDate.clone().format("YYYYMMDD");
//
//        // Ato los nodos
//
//        var nodesBind = self.nodesGroup.selectAll(".nodes").data(self.data['nodes']);
//
//        // Voy con el remove
//
//        nodesBind.exit().transition().duration(self.transTime).style("opacity", 0).remove();
//
//        // Voy con el enter
//
//        nodesBind.enter()
//            .append("circle")
//            .attr("class","nodes")
//            .attr("title",function(d,i) {return self.buildNodeText(d);})
//            .style("fill",function (d,i) {return self.scaleState(self.getNodeState(d,i,nowDateString));})
//            .style("visibility", function(d,i){return self.getNodeState(d,i,nowDateString)=='inactive'? "hidden":"visible";})
//            .attr("cx",function (d,i){return self.scalePosX(d['posx']);})
//            .attr("cy",function (d,i){return self.scalePosY(d['posy']);})
//            .attr("r",function (d,i){return self.scaleNodeSelect(d,dataIn);})
//            .on("mouseover",function(d,i){self.remarkNode(d,i);self.nodeInfoCall(d);})
//            .on("mouseout",function(d,i){self.unmarkNode(d,i);self.nodeInfoRemove(d);})
//
//
//
//        // Voy con el change
//
//        nodesBind
//            .attr("title",function(d,i) {return self.buildNodeText(d);})
//            .style("fill",function (d,i) {return self.scaleState(self.getNodeState(d,i,nowDateString));})
//            .style("visibility", function(d,i){return self.getNodeState(d,i,nowDateString)=='inactive'? "hidden":"visible";})
//            .attr("cx",function (d,i){return self.scalePosX(d['posx']);})
//            .attr("cy",function (d,i){return self.scalePosY(d['posy']);})
//            .attr("r",function (d,i){return self.scaleNodeSelect(d,dataIn);});
//
//
//
//        // Ato los links
//
//        var linksBind = self.linksGroup.selectAll(".links").data(self.data['links']);
//
//        // Voy con el remove
//
//        linksBind.exit().transition().duration(self.transTime).style("opacity",0).remove();
//
//        // Voy con el enter
//
//        linksBind.enter()
//            .append("line")
//            .attr("class","links")
//            .style("stroke",function(d,i){return self.scaleStateLink(self.getLinkState(d));})
//            .style("stroke-width",self.LINK_WIDTH)
//            .attr("state",function(d,i){return self.getLinkState(d);})
//            .attr("source",function(d,i){return d.source;})
//            .attr("target",function(d,i){return d.target;})
////            .attr("visibility","hidden")
//            .style("opacity",function(d,i){return self.scaleLink(d.weight);})
//            .attr("x1",function(d,i){return self.scalePosX(self.data['nodes'][self.data['nodesDict'][d.source]]['posx']);})
//            .attr("y1",function(d,i){return self.scalePosY(self.data['nodes'][self.data['nodesDict'][d.source]]['posy']);})
//            .attr("x2",function(d,i){return self.scalePosX(self.data['nodes'][self.data['nodesDict'][d.target]]['posx']);})
//            .attr("y2",function(d,i){return self.scalePosY(self.data['nodes'][self.data['nodesDict'][d.target]]['posy']);});
//
//        // Voy con el change
//
//        linksBind
//            .style("stroke",function(d,i){return self.scaleStateLink(self.getLinkState(d));})
//            .style("stroke-width",self.LINK_WIDTH)
//            .attr("state",function(d,i){return self.getLinkState(d);})
//            .style("opacity",function(d,i){return self.scaleLink(d.weight);})
////            .attr("visibility","hidden")
//            .attr("x1",function(d,i){return self.scalePosX(self.data['nodes'][self.data['nodesDict'][d.source]]['posx']);})
//            .attr("y1",function(d,i){return self.scalePosY(self.data['nodes'][self.data['nodesDict'][d.source]]['posy']);})
//            .attr("x2",function(d,i){return self.scalePosX(self.data['nodes'][self.data['nodesDict'][d.target]]['posx']);})
//            .attr("y2",function(d,i){return self.scalePosY(self.data['nodes'][self.data['nodesDict'][d.target]]['posy']);});
//
//
////        $('circle.nodes').tipsy({
////            gravity: 's',
////            opacity: 1.0,
////            html: true
////        });
//
//        // El remove del warning esta al final porque el primer render tarda...
//
//        self.warningMessage.transition().duration(self.transTime).style("opacity",0.0).remove();

    }


    // Main del objeto

    self.init();

    return self;

}

