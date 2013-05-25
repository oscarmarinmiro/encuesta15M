var tdviz = tdviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };


tdviz.controller.sankeyVisitorsHor = function(options)
{

    // Referencia a esta instancia

    var self = {};

    // Global vars


    for (key in options){
        self[key] = options[key];
    }

    self.DATA_FILE = self.dataFile;

    self.parentSelect = "#"+self.idName;

    // Funciones auxiliares y de copy

    function myLog(myString, level)
    {

        if ((self.debugLevel!=0)&&(level<=self.debugLevel))
        {
            console.log(myString);
        }
    }

    function getNetworkFromSite(siteName)
    {
        var nodes = [];
        var links = [];

        var network = {};


        var structRoot = self.sankeyData[siteName];

        var index = 0;

        nodes.push({'name':siteName,'visitors':structRoot['visitors']});

        index++;

        // Recorro los sources

        for(var node in structRoot['source'])
        {
            nodes.push({'name':structRoot['source'][node]['name'],'visitors':structRoot['source'][node]['visitors']});


            links.push({'source':index,'target':0,'value':structRoot['source'][node]['weight']});

            index++;
        }

        // Recorro los targets

        for(var node in structRoot['target'])
        {
            nodes.push({'name':structRoot['target'][node]['name'],'visitors':structRoot['target'][node]['visitors']});

            links.push({'target':index,'source':0,'value':structRoot['target'][node]['weight']});

            index++;
        }


        network['nodes'] = nodes;
        network['links'] = links;

        return network;

    }

    // El document ready

    $(document).ready(function()
    {
        // El cache del servidor manda

        $.ajaxSetup({cache: true});

        // Inyecto el html

        var injectString =
            [
                    '<div id="chartContentOne" class="chartContent"></div>',
                    '</div>',
                    '<div id="chartContentTwo" class="chartContent"></div>',
                    '</div>'
            ].join('\n');



        $(self.parentSelect).html(injectString);


        self.firstSankeyDia = tdviz.viz.sankeyVisitorsHor(
            {
                'idName':"chartContentOne",
                'height':600,
                'width':600,
                'transTime':1500,
                'loadingMessage':"Loading data...",
                'color': self.colorScale,
                'mainNodeColor': "#557",
                'mainNodeName': self.firstSite,
                'margin':50,
                'nodeWidth':25,
                'nodePadding':10,
                'myLog':myLog
            });


        self.secondSankeyDia = tdviz.viz.sankeyVisitorsHor(
            {
                'idName':"chartContentTwo",
                'height':600,
                'width':600,
                'transTime':1500,
                'loadingMessage':"Loading data...",
                'color': self.colorScale,
                'mainNodeColor': "#557",
                'mainNodeName': self.secondSite,
                'margin':50,
                'nodeWidth':25,
                'nodePadding':10,
                'myLog':myLog
            });



        d3.json(self.baseJUrl+self.DATA_FILE, function(sankeyData)
        {
            if(sankeyData!=null)
            {
                self.sankeyData = sankeyData;

                self.sankeyFirst = getNetworkFromSite(self.firstSite);
                self.sankeySecond = getNetworkFromSite(self.secondSite);

//                console.log(self.sankeyFirst);
//                console.log(self.sankeySecond);


                self.firstSankeyDia.render(self.sankeyFirst);

                self.secondSankeyDia.render(self.sankeySecond);


            }
            else
            {
                myLog("Could not load file: "+self.baseJUrl+self.DATA_FILE,1);
            }
        });

    });

}
