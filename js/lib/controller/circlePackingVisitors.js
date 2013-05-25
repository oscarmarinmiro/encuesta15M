var tdviz = tdviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };


tdviz.controller.circlePackingVisitors = function(options)
{

    // Referencia a esta instancia

    var self = {};

    // Global vars


    for (key in options){
        self[key] = options[key];
    }

    self.DATA_FILE = self.dataFile;

    self.parentSelect = "#"+self.idName;

    // Funciones auxiliares

    function myLog(myString, level)
    {

        if ((self.debugLevel!=0)&&(level<=self.debugLevel))
        {
            console.log(myString);
        }
    }

    self.reDraw = function (segment)
    {
        self.circleChart.render(self.circleData);
    }

    self.displayName = function (name,value,children,fatherName)
    {
        var html="";

        if (!children)
        {
        html+="<span class='big'>"+name+"</span></b><br>";
        html+=parseFloat(value).toFixed(0)+" visitas";
        html+="<br>"+fatherName;
        }
        else
        {
            html+="<b>"+name+"</b><br>";
        }
        if(html=="0")
        {
            html="";
        }
        return html;
    }

    // El document ready

    $(document).ready(function()
    {
        // El cache del servidor manda

        $.ajaxSetup({cache: true});

        // Inyecto el html

        var injectString =
            [
                    '<div id="chartContent" class="chartContent"></div>',
                    '</div>'
        ].join('\n');


        $(self.parentSelect).html(injectString);

        console.log("Dimensiones");
        console.log(window.innerHeight);
        console.log(window.innerWidth);


        self.colorScale = d3.scale.linear().domain([0,1000]).range(["#DDD","#F00"]);

        self.circleChart = tdviz.viz.circlePackingVisitors(
            {
                'idName':"chartContent",
                'idInfo': self.idInfo,
                'height':window.innerHeight,
                'width':window.innerWidth,
                'transTime':1500,
                'loadingMessage':"Loading data...",
                'colorScale': self.colorScale,
                'myLog':myLog,
                'nameCallback':self.displayName
            });

        d3.json(self.baseJUrl+self.DATA_FILE, function(circleData)
        {
            if(circleData!=null)
            {
                self.circleData = circleData;

                function changeCallBack()
                {

                    self.circleChart.render(self.circleData);

                }


                changeCallBack();


            }
            else
            {
                myLog("Could not load file: "+self.baseJUrl+self.DATA_FILE,1);
            }
        });

    });

}
