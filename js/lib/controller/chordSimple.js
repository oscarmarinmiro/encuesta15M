var tdviz = tdviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };


tdviz.controller.chordSimple = function(options)
{
    // Referencia a esta instancia

    var self = {};


    // Copies

    //self.MORE_INFO = "Mouseover the chart for more info";

    self.MORE_INFO = [
        'General info copy<br><br>'
    ].join('\t');


    // Pongo lo que me venga por opciones en el self

    for (key in options){
        self[key] = options[key];
    }

    self.parentSelect = "#"+self.idName;


    // Funciones auxiliares

    function myLog(myString, level)
    {

        if ((self.debugLevel!=0)&&(level<=self.debugLevel))
        {
            console.log(myString);
        }
    }

    // Copy functions



    self.detailText = "Detailed Info";

    self.idInfo = "chordInfo";
    self.idInfoHeader = "chordInfoHeader";

    self.quitaInfoChord = function (d,i)
    {
        $("#"+self.idInfo).html(self.MORE_INFO);
    }

    self.quitaInfoGroup = function (d,i)
    {
        $("#"+self.idInfo).html(self.MORE_INFO);
    }

    self.rellenaInfoChord = function(d,i)
    {
        var html="<div class='chordInfoHeader'>"+self.detailText+"</div>";

        html+="chord info text";

        myLog(d,0);


        $("#"+self.idInfo).html(html);
    }

    self.rellenaInfoGroup = function(d,i)
    {
        var html="<div class='chordInfoHeader'>"+self.detailText+"</div>";

        html+="Group info text";

        myLog(d,0);

        $("#"+self.idInfo).html(html);
    }

    // El document ready

    $(document).ready(function()
    {
        // El cache del servidor manda

        $.ajaxSetup({cache: true});

        // Inyecto el html en el div padre

        var injectString =
            ['<div id="contenedorTodo" class="contenedorTodo">',
                '<div id="contenedorCI" class="contenedorCI">',
                '<div id="zonaChart" class="zonaChart">',
                '<div id="chartContent" class="chartContent"></div>',
                '</div>',
                '<div id="zonaInfo" class="zonaInfo">',
                '<div class="chordInfoContent" id="chordInfo">'+self.MORE_INFO+'</div>',
                '</div>',
                '</div>',
                '<div id="footer" class="footer"></div>'
            ].join('\n');


        $(self.parentSelect).html(injectString);

        self.colorScale = d3.scale.category20();
//
//        // Instancio el objeto chordChart
//
        self.chordChart = tdviz.viz.chordSimple(
            {
                'idName':"chartContent",
                'idInfo': self.idInfo,
                'width':800,
                'height':700,
                'transTime':1000,
                'chordPadding':0.05,
                'loadingMessage':"Loading data...",
                'colorScale': self.colorScale,
                'myLog':myLog,
                'colorRule':self.colorRule,
                'legendDict':self.legendDict,
                // Funciones de copy
                'quitaInfoChord':self.quitaInfoChord,
                'quitaInfoGroup':self.quitaInfoGroup,
                'rellenaInfoChord':self.rellenaInfoChord,
                'rellenaInfoGroup':self.rellenaInfoGroup
            });

        // Pido el fichero de datos

        d3.json(self.baseJUrl+self.dataFile, function(chordData)
        {
            if(chordData!=null)
            {

                self.chordData = chordData;
                self.adjacency = self.chordData.adjacency;
                self.dataLabel = self.chordData.dataLabel;

                myLog("Llegan los datos",1);
                myLog(self.adjacency,1);
                myLog(self.dataLabel,1);

                self.chordChart.render(self.adjacency,self.dataLabel);

            }
            else
            {
                myLog("Could not load file: "+self.baseJUrl+self.dataFile,1);
            }
        });

    });
}
