var tdviz = tdviz || {'version': 0.1, 'controller': {}, 'viz': {}, 'extras': {} };


tdviz.controller.sankeyVisitorsHorLevels = function (options) {

    // Referencia a esta instancia

    var self = {};

    // Global vars


    for (key in options) {
        self[key] = options[key];
    }

    self.DATA_FILE = self.dataFile;

    self.bubbleH = 150;

    self.bubbleGap = 30;

    self.sankeyW = 600;
    self.sankeyH = 500;

    self.bubbleW = (self.sankeyW*2);

    self.bubbleSep = (self.sankeyW/2);

    self.maxCircle = (self.bubbleH - self.bubbleGap)/2;

    self.mainNodeColor = "#557";

    self.parentSelect = "#" + self.idName;

    // Funciones auxiliares y de copy

    function myLog(myString, level) {

        if ((self.debugLevel != 0) && (level <= self.debugLevel)) {
            console.log(myString);
        }
    }

    function getNetworkFromSite(siteName) {
        var nodes = [];
        var links = [];

        var network = {};


        var structRoot = self.sankeyData[siteName];

        console.log("Estructura para el site " + siteName);
        console.log(structRoot);

        var index = 0;

        nodes.push({'name': siteName, 'visitors': structRoot['visitors']});

        index++;

        var deltaFan = structRoot['source']['total'] - structRoot['target']['total'];

        var globalTotal = structRoot['source']['total'] - structRoot['target']['total'] > 0 ? structRoot['source']['total'] : structRoot['target']['total']

        console.log("deltaFan");
        console.log(deltaFan);
        console.log(globalTotal);

        // Recorro las categories del source

        for (var node in structRoot['source']['categories']) {

            nodes.push({'name': node, 'visitors': structRoot['source']['categories'][node]['total']});

            links.push({'source': index, 'target': 0, 'value': structRoot['source']['categories'][node]['total']});

            var catIndex = index;

            index++;

            if (structRoot['source']['categories'][node]['children'].length == 0) {
                nodes.push({'name': "_" + node, 'visitors': structRoot['source']['categories'][node]['total']});
                links.push({'source': index, 'target': catIndex, 'value': structRoot['source']['categories'][node]['total']});
                index++;
            }
            else {
                for (var subcat in structRoot['source']['categories'][node]['children']) {
                    var subNode = structRoot['source']['categories'][node]['children'][subcat];

                    nodes.push({'name': subNode['name'], 'visitors': subNode['visitors']});
                    links.push({'source': index, 'target': catIndex, 'value': subNode['weight']});
                    index++;
                }
            }


        }

        if(deltaFan < 0)
        {
            nodes.push({'name': 'Direct', 'visitors': deltaFan*(-1)});

            links.push({'source': index, 'target': 0, 'value': deltaFan*(-1)});

            var catIndex = index;

            index++;

            nodes.push({'name': '_Direct', 'visitors': deltaFan*(-1)});
            links.push({'source': index, 'target': catIndex, 'value': deltaFan*(-1)});
            index++;
        }

        // Recorro las categories del target


        for (var node in structRoot['target']['categories']) {

            nodes.push({'name': node, 'visitors': structRoot['target']['categories'][node]['total']});

            links.push({'target': index, 'source': 0, 'value': structRoot['target']['categories'][node]['total']});

            var catIndex = index;

            index++;

            if (structRoot['target']['categories'][node]['children'].length == 0) {
                nodes.push({'name': "_" + node, 'visitors': structRoot['target']['categories'][node]['total']});
                links.push({'source': catIndex, 'target': index, 'value': structRoot['target']['categories'][node]['total']});
                index++;
            }
            else {
                for (var subcat in structRoot['target']['categories'][node]['children']) {
                    var subNode = structRoot['target']['categories'][node]['children'][subcat];

                    nodes.push({'name': subNode['name'], 'visitors': subNode['visitors']});
                    links.push({'source': catIndex, 'target': index, 'value': subNode['weight']});
                    index++;
                }
            }


        }


        if(deltaFan > 0)
        {
            nodes.push({'name': 'Dropped', 'visitors': deltaFan});

            links.push({'source': 0, 'target': index, 'value': deltaFan});

            var catIndex = index;

            index++;

            nodes.push({'name': '_Dropped', 'visitors': deltaFan});
            links.push({'source': catIndex, 'target': index, 'value': deltaFan});
            index++;
        }


        network['nodes'] = nodes;
        network['links'] = links;
        network['total'] = globalTotal;


        return network;

    }

    self.initBubble = function()
    {
        self.bubble = d3.select("#bubble").append("svg")
            .attr("height", self.bubbleH)
            .attr("width", self.bubbleW)
            .append("g");
    }

    self.paintBubble = function()
    {
        var firstVisitors = self.sankeyData[self.firstSite]['realVisitors'];
        var secondVisitors = self.sankeyData[self.secondSite]['realVisitors'];

        var maxVisitors = firstVisitors > secondVisitors ? firstVisitors:secondVisitors;

        var circleScaleRadius = d3.scale.sqrt().domain([0,maxVisitors]).range([0,self.maxCircle]);

        // Hago append del primer circulo

        var firstX = (self.bubbleW/2) - self.bubbleSep;
        var firstY = (self.bubbleH-self.bubbleGap)/2;

        self.bubble.append("circle")
            .attr("cx", firstX)
            .attr("cy", firstY)
            .attr("class","circleRef")
            .style("fill",self.mainNodeColor)
            .attr("r",circleScaleRadius(firstVisitors))
            .append("title")
            .text(self.sankeyData[self.firstSite]['realVisitors']+" visitors");

        // Hago append del primer texto

        self.bubble.append("text")
            .attr("x",firstX)
            .attr("y",(self.bubbleH-self.bubbleGap)/2 + 5)
            .attr("text-anchor","middle")
            .attr("class","siteText")
            .text(self.firstSite);


        self.bubble.append("text")
            .attr("x",firstX)
            .attr("y",self.bubbleH)
            .attr("text-anchor","middle")
            .attr("class","siteSubText")
            .text(
//                self.sankeyData[self.firstSite]['realVisitors']+" visitors, "+ self.sankeyData[self.firstSite]['visitors']+" sessions"
                self.sankeyData[self.firstSite]['realVisitors']+" visitors"

            );


        // Hago append del segundo circulo

        var secondX = (self.bubbleW/2) + self.bubbleSep;
        var secondY = (self.bubbleH-self.bubbleGap)/2;

        console.log("Visitors...");

        console.log(firstVisitors);
        console.log(secondVisitors);

        self.bubble.append("circle")
            .attr("cx", secondX)
            .attr("cy", secondY)
            .attr("class","circleRef")
            .style("fill",self.mainNodeColor)
            .attr("r",circleScaleRadius(secondVisitors))
            .append("title")
            .text(self.sankeyData[self.secondSite]['realVisitors']+" visitors");

        // Hago append del primer texto

        self.bubble.append("text")
            .attr("x",secondX)
            .attr("y",(self.bubbleH-self.bubbleGap)/2 + 5)
            .attr("text-anchor","middle")
            .attr("class","siteText")
            .text(self.secondSite);


        self.bubble.append("text")
            .attr("x",secondX)
            .attr("y",self.bubbleH)
            .attr("text-anchor","middle")
            .attr("class","siteSubText")
            .text(
                self.sankeyData[self.secondSite]['realVisitors']+" visitors"
            );



//        self.bubble = d3.select("#bubble").append("svg")
//            .attr("height", self.bubbleH)
//            .attr("width", self.bubbleW)
//            .append("g");
    }

    // El document ready

    $(document).ready(function () {
        // El cache del servidor manda

        $.ajaxSetup({cache: true});

        // Inyecto el html

        var injectString =
            [
                '<div id="bubble" class="bubble"></div>',
                '<div id="chartContentOne" class="chartContent"></div>',
                '</div>',
                '<div id="chartContentTwo" class="chartContent"></div>',
                '</div>'
            ].join('\n');


        $(self.parentSelect).html(injectString);


        self.firstSankeyDia = tdviz.viz.sankeyVisitorsHorLevels(
            {
                'idName': "chartContentOne",
                'height': self.sankeyH,
                'width': self.sankeyW,
                'transTime': 1500,
                'loadingMessage': "Loading data...",
                'color': self.colorScale,
                'mainNodeColor': self.mainNodeColor,
                'mainNodeName': self.firstSite,
                'margin': 25,
                'nodeWidth': 25,
                'nodePadding': 10,
                'myLog': myLog
            });


        self.secondSankeyDia = tdviz.viz.sankeyVisitorsHorLevels(
            {
                'idName': "chartContentTwo",
                'height': self.sankeyH,
                'width': self.sankeyW,
                'transTime': 1500,
                'loadingMessage': "Loading data...",
                'color': self.colorScale,
                'mainNodeColor': self.mainNodeColor,
                'mainNodeName': self.secondSite,
                'margin': 25,
                'nodeWidth': 25,
                'nodePadding': 10,
                'myLog': myLog
            });


        d3.json(self.baseJUrl + self.DATA_FILE, function (sankeyData) {
            if (sankeyData != null) {
                self.sankeyData = sankeyData;

                // Paint the bubble svg

                self.initBubble();

                self.paintBubble();

                self.sankeyFirst = getNetworkFromSite(self.firstSite);
                self.sankeySecond = getNetworkFromSite(self.secondSite);


                self.firstSankeyDia.render(self.sankeyFirst);

                self.secondSankeyDia.render(self.sankeySecond);


            }
            else {
                myLog("Could not load file: " + self.baseJUrl + self.DATA_FILE, 1);
            }
        });

    });

}
