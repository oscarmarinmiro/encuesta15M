var tdviz = tdviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };


tdviz.controller.circleSplashBig = function(options)
{

    // Referencia a esta instancia

    var self = {};

    // Global vars


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

    // El document ready

    $(document).ready(function()
    {
        // El cache del servidor manda

        $.ajaxSetup({cache: true});

        // Inyecto el html

        var injectString =
            [   '<div id="chartContent" class="chartContent"></div>',
                    '</div>'
        ].join('\n');


        $(self.parentSelect).html(injectString);


        self.colorScale = d3.scale.linear().domain([0,1000]).range(["#DDD","#F00"]);

        self.circleChart = tdviz.viz.circleSplashBig(
            {
                'idName':"chartContent",
                'idInfo': self.idInfo,
//                'height':700,
//                'width':960,
                'height':550,
                'width':690,
                'colorScale': self.colorScale,
                'myLog':myLog,
            });
    });

}
