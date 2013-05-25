var tdviz = tdviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };


// Draws a d3.js networkDiagram based on a layout
// Parameters
// idName => DOM id for drawing diagram
// width => SVG width
// height => SVG height
// transTime => transitions time (milliseconds)
// loadingMessage => message to display while loading data
// myLog => logging function

tdviz.viz.networkCompaniesDiagram= function (options)
{

    // Object

    var self = {};

    // Global vars

    self.MAX_NODE_SIZE = 1.5;
    self.MIN_NODE_SIZE = 0.2;
    self.LINK_WIDTH = 0.05;

    // Get options data

    for (key in options){
        self[key] = options[key];
    }

    self.parentSelect = "#"+self.idName;

    self.init = function()
    {


        // svg init

        self.myLog("Iniciando network diagram... en ",3);
        self.myLog(self.parentSelect,3);
        self.svg = d3.select(self.parentSelect).append("svg")
            .attr("width",self.width)
            .attr("height",self.height)
            .call(d3.behavior.zoom().on("zoom", self.redraw))
            .append("g");

        self.legendSVG = d3.select("#"+self.legendId).append("svg")
            .attr("width",200)
            .attr("height",200)
            .append("g");

        // g de los enlaces

        self.linksGroup = self.svg.append("g").attr("class","linksG");


        // g de los nodos

        self.nodesGroup = self.svg.append("g").attr("class","nodesG");

        // escalas de posicion

        self.scalePosX = d3.scale.linear().domain([0,1]).range([0,self.width]);
        self.scalePosY = d3.scale.linear().domain([0,1]).range([0,self.height]);

        // escalas de color para las telco

//        self.scaleCompany = d3.scale.ordinal().domain(["METEOR","VODAFONE","THREE","Tesco","Lyca Mobile","?"]).range(colorbrewer.YlGnBu[6]);
        self.scaleCompany = d3.scale.ordinal().domain(["METEOR","VODAFONE","THREE","Tesco","Lyca Mobile","?"]).range(["#8DD3C7","#FFFFB3","#BEBADA","#FB8072","#80B1D3","#FDB462"]);

        // escalas de tamaño de nodo (radio)

        self.scaleCIS = d3.scale.sqrt().domain([0,1]).range([self.MIN_NODE_SIZE,self.MAX_NODE_SIZE]).clamp(true);
        self.scaleCPS = d3.scale.sqrt().domain([0,0.05]).range([self.MIN_NODE_SIZE,self.MAX_NODE_SIZE]).clamp(true);
        self.scaleDegree = d3.scale.sqrt().domain([1,100]).range([self.MIN_NODE_SIZE,self.MAX_NODE_SIZE]).clamp(true);
        self.scaleMonetary = d3.scale.sqrt().domain([1,600]).range([self.MIN_NODE_SIZE,self.MAX_NODE_SIZE]).clamp(true);


        // escalas de opacidad de los enlaces

        self.scaleLink = d3.scale.linear().domain([0,1]).range([0.3,0.8]).clamp(true);

        // escala ordinal de colores de nodos

       self.scaleState = d3.scale.ordinal().domain(["inactive","active","disconnected"]).range(["#000","#0F0","#F00"]);

        self.scaleState = d3.scale.ordinal().domain(["inactive","active","disconnected"]).range(["#000","#afcb46","#de363a"]);

        // escala ordinal de colores de links

        //self.scaleStateLink = d3.scale.ordinal().domain(["active","infected","disconnected","inactive"]).range(["#FFF","#FF0","#F00","#000"]);

        self.scaleStateLink = d3.scale.ordinal().domain(["active","infected","disconnected","inactive"]).range(["#afcb46","#FFF","#de363a","#000"]);

        // warning message

        self.warningMessage = self.svg.append("text")
            .attr("text-anchor", "middle")
            .attr("class","netChartTextWarning")
            .attr("x", self.width/2)
            .attr("y",self.width/2)
            .text(self.loadingMessage);

        for (var i in self.scaleCompany.domain())
        {

            var company = self.scaleCompany.domain()[i];

            console.log(company);

            self.legendSVG
                .append("circle")
                .attr("class","legendNodes")
                .style("fill",self.scaleCompany(company))
                .attr("cx",10)
                .attr("cy",30+(i*25))
                .attr("r",10);

            self.legendSVG
                .append("text")
                .attr("class","legendTexts")
                .attr("x",30)
                .attr("y",35+(i*25))
                .text(company);
        }


    }

    self.remarkNode = function(d,i)
    {
        nodes = d['links'];

        linkIndexes = [];
        nodeIndexes = [];

        // Añado el propio nodo

        nodeIndexes[self.data['nodesDict'][d.userId]] = true;

        for (var target in nodes)
        {
            var nodeId = nodes[target].target;
            var linkIdFirst = d.userId + " " + nodeId;
            var linkIdSecond = nodeId + " " + d.userId;
            var linkIdFirstIndex = self.data['linksDict'][linkIdFirst];
            var linkIdSecondIndex = self.data['linksDict'][linkIdSecond];
            //console.log(nodeId);
            //console.log(self.data['nodesDict'][nodeId]);
            nodeIndexes[self.data['nodesDict'][nodeId]] = true;
            linkIndexes[linkIdFirstIndex] = true;
            linkIndexes[linkIdSecondIndex] = true;
        }
        //console.log(nodeIndexes);
        //console.log(linkIndexes);

        // Selecciono los nodos

        d3.selectAll(".nodes").data(self.data['nodes'])
            .style("opacity",function(d,i){return i in nodeIndexes ? 1.0:0.2});

        d3.selectAll(".links").data(self.data['links'])
            .style("opacity",function(d,i){return i in linkIndexes ? self.scaleLink(d.weight):0.0});

        // Selecciono los enlaces

    }

    self.unmarkNode = function(d,i)
    {
        d3.selectAll(".nodes").data(self.data['nodes'])
            .style("opacity",1.0);

        d3.selectAll(".links").data(self.data['links'])
            .style("opacity",function(d,i){return self.scaleLink(d.weight);});


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
            return self.scaleCIS(d['cps']);
        }
        if(dataIn=="degree")
        {
            return self.scaleDegree(d['degree']);
        }
        else
        {
            return self.scaleMonetary(d['monetaryValue']);
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

    self.putStrokeColor = function(i)
    {
        if(self.data['nodes'][i]['state']=="disconnected")
        {
            return self.scaleCompany(self.data['nodes'][i]['disCompany']);
        }
        else
        {
            return "#000";
        }
    }

    self.putStrokeWidth = function(i)
    {
        if(self.data['nodes'][i]['state']=="disconnected")
        {
            return 0.5;
        }
        else
        {
            return 0.03;
        }

    }

    self.putStrokeOpacity = function(i)
    {
        if(self.data['nodes'][i]['state']=="disconnected")
        {
            return 1.0;
        }
        else
        {
            return 1.0;
        }

    }

    self.fillCompany = function(state,d)
    {
        if(state=="disconnected")
        {
            return self.scaleCompany(d['disCompany']);
        }
        else
        {
            return self.scaleState(state);
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

    self.render = function(data,nowDate,dataIn)
    {
        self.myLog("En el render....",3)

        self.data = data;

        self.myLog("Datos que me llegan",3);

        self.myLog(data,3);

        self.myLog("La nowDate es:",3);
        self.myLog(nowDate,3);

        self.myLog("dataIn es"+dataIn,3);

        nowDateString = nowDate.clone().format("YYYYMMDD");

        // Ato los nodos

        var nodesBind = self.nodesGroup.selectAll(".nodes").data(self.data['nodes']);

        // Voy con el remove

        nodesBind.exit().transition().duration(self.transTime).style("opacity", 0).remove();

        // Voy con el enter

        nodesBind.enter()
            .append("circle")
            .attr("class","nodes")
            .style("fill",function (d,i) {return self.fillCompany(self.getNodeState(d,i,nowDateString),d);})
            .style("visibility", function(d,i){return self.getNodeState(d,i,nowDateString)=='inactive'? "hidden":"visible";})
            .attr("cx",function (d,i){return self.scalePosX(d['posx']);})
            .attr("cy",function (d,i){return self.scalePosY(d['posy']);})
            .attr("r",function (d,i){return self.scaleNodeSelect(d,dataIn);})
            .on("mouseover",function(d,i){self.remarkNode(d,i);self.nodeInfoCall(d);})
            .on("mouseout",function(d,i){self.unmarkNode(d,i);self.nodeInfoRemove(d);})



        // Voy con el change

        nodesBind
            .style("fill",function (d,i) {return self.fillCompany(self.getNodeState(d,i,nowDateString),d);})
            .style("visibility", function(d,i){return self.getNodeState(d,i,nowDateString)=='inactive'? "hidden":"visible";})
            .attr("cx",function (d,i){return self.scalePosX(d['posx']);})
            .attr("cy",function (d,i){return self.scalePosY(d['posy']);})
            .attr("r",function (d,i){return self.scaleNodeSelect(d,dataIn);});



        // Ato los links

        var linksBind = self.linksGroup.selectAll(".links").data(self.data['links']);

        // Voy con el remove

        linksBind.exit().transition().duration(self.transTime).style("opacity",0).remove();

        // Voy con el enter

        linksBind.enter()
            .append("line")
            .attr("class","links")
            .style("stroke",function(d,i){return self.scaleStateLink(self.getLinkState(d));})
            .style("stroke-width",self.LINK_WIDTH)
            .attr("state",function(d,i){return self.getLinkState(d);})
            .attr("source",function(d,i){return d.source;})
            .attr("target",function(d,i){return d.target;})
//            .attr("visibility","hidden")
            .style("opacity",function(d,i){return self.scaleLink(d.weight);})
            .attr("x1",function(d,i){return self.scalePosX(self.data['nodes'][self.data['nodesDict'][d.source]]['posx']);})
            .attr("y1",function(d,i){return self.scalePosY(self.data['nodes'][self.data['nodesDict'][d.source]]['posy']);})
            .attr("x2",function(d,i){return self.scalePosX(self.data['nodes'][self.data['nodesDict'][d.target]]['posx']);})
            .attr("y2",function(d,i){return self.scalePosY(self.data['nodes'][self.data['nodesDict'][d.target]]['posy']);});

        // Voy con el change

        linksBind
            .style("stroke",function(d,i){return self.scaleStateLink(self.getLinkState(d));})
            .style("stroke-width",self.LINK_WIDTH)
            .attr("state",function(d,i){return self.getLinkState(d);})
            .style("opacity",function(d,i){return self.scaleLink(d.weight);})
//            .attr("visibility","hidden")
            .attr("x1",function(d,i){return self.scalePosX(self.data['nodes'][self.data['nodesDict'][d.source]]['posx']);})
            .attr("y1",function(d,i){return self.scalePosY(self.data['nodes'][self.data['nodesDict'][d.source]]['posy']);})
            .attr("x2",function(d,i){return self.scalePosX(self.data['nodes'][self.data['nodesDict'][d.target]]['posx']);})
            .attr("y2",function(d,i){return self.scalePosY(self.data['nodes'][self.data['nodesDict'][d.target]]['posy']);});


//        $('circle.nodes').tipsy({
//            gravity: 's',
//            opacity: 1.0,
//            html: true
//        });


        // Monetary info display info

        monInfo = self.buildMonetaryInfo();

        // And call the news div update callback...

        self.monetaryCall(monInfo);

        // El remove del warning esta al final porque el primer render tarda...

        self.warningMessage.transition().duration(self.transTime).style("opacity",0.0).remove();

    }

    self.redraw = function()
    {
//        console.log("here", d3.event.translate, d3.event.scale);

        self.svg.attr("transform",
            "translate(" + d3.event.translate + ")"
                + " scale(" + d3.event.scale + ")");
    }

    // Main del objeto

    self.init();

    return self;

}

