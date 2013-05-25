var tdviz = tdviz || {'version': 0.1, 'controller': {}, 'viz': {}, 'extras': {} };


tdviz.controller.sankeySimple = function (options) {

    // Referencia a esta instancia

    var self = {};

    // Global vars


    for (key in options) {
        self[key] = options[key];
    }

    self.DATA_FILE = self.dataFile;



    self.parentSelect = "#" + self.idName;

    // Funciones auxiliares y de copy

    function myLog(myString, level) {

        if ((self.debugLevel != 0) && (level <= self.debugLevel)) {
            console.log(myString);
        }
    }

    self.displayName = function (name,value,children,fatherName)
    {
        var html="";

        if (!children)
        {
        html+="<span class='big'>"+name+"</span></b><br>";
        html+=parseFloat(value).toFixed(0)+" visitors";
        html+="<br>"+fatherName;
        }
        else
        {
            html="";
        }
        if(html=="0")
        {
            html="";
        }
        return html;
    }

    function getNetworkFromItem(itemName) {
        var nodes = [];
        var links = [];

        var network = {};


        var structRoot = self.sankeyData[itemName];

        console.log("Estructura para el item " + itemName);
        console.log(structRoot);

        var index = 0;

        nodes.push({'name': itemName, 'visitors': structRoot['visitors']});

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


    // El document ready

    $(document).ready(function () {
        // El cache del servidor manda

        $.ajaxSetup({cache: true});

        // Inyecto el html

        var injectString =
            [
                '<div id="chartContent" class="chartContent"></div>',
                '</div>'
            ].join('\n');


        $(self.parentSelect).html(injectString);


        self.sankeyDia = tdviz.viz.sankeySimple(
            {
                'idName': "chartContent",
                'height': self.sankeyH,
                'width': self.sankeyW,
                'transTime': 1500,
                'loadingMessage': "Loading data...",
                'color': self.colorScale,
                'mainNodeColor': self.mainNodeColor,
                'mainNodeName': self.item,
                'margin': 25,
                'nodeWidth': 25,
                'nodePadding': 10,
                'myLog': myLog
            });



        d3.json(self.baseJUrl + self.DATA_FILE, function (sankeyData) {
            if (sankeyData != null) {
                self.sankeyData = sankeyData;


                self.sankeyFirst = getNetworkFromItem(self.item);

                self.sankeyDia.render(self.sankeyFirst);


            }
            else {
                myLog("Could not load file: " + self.baseJUrl + self.DATA_FILE, 1);
            }
        });

    });

}
