var tdviz = tdviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };


tdviz.controller.circlePackingSimple = function(options)
{

    // Referencia a esta instancia

    var self = {};

    // Global vars


    for (key in options){
        self[key] = options[key];
    }


    self.DATA_FILE = self.dataFile;

    self.parentSelect = "#"+self.idName;

    // Copies

    self.headerCopy = "Packing Simple";


    // Funciones auxiliares y de copy

    function myLog(myString, level)
    {

        if ((self.debugLevel!=0)&&(level<=self.debugLevel))
        {
            console.log(myString);
        }
    }

    // remove underscores in category names...

    self.removeUnderscores = function(textInput)
    {
        return textInput.replace(/_/g," ");
    }

    self.displayTipLeaf = function(d)
    {
        var html ="";

        var categories = [];


        // search recursively for oldest parent != root

        var data = d;

        var leafName = d.data.name;

        var name;

        while(data.parent.depth>0)
        {
            data = data.parent;
            name = data.data.name;
            categories.push(self.removeUnderscores(name));
        }

        var catName = categories.reverse().join("/");

        html+="<span class='big'>"+leafName+"</span></b><br>";
        html+=parseFloat(d.value).toFixed(0)+" items";
        html+="<br>"+catName;

        return html;
    }

    self.displayTipNode = function(d)
    {
        var html ="";

        var categories = [];


        // search recursively for oldest parent != root

        var data = d;

        var name = d.data.name;

        categories.push(self.removeUnderscores(name));

        while(data.parent.depth>0)
        {
            data = data.parent;
            name = data.data.name;
            categories.push(self.removeUnderscores(name));
        }

        var catName = categories.reverse().join(" /</br>");

        html+="<span class='big'>"+catName+"</span><br>";
        html+=parseFloat(d.value).toFixed(0)+" items";

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
                    '<div id="zoom" class="zoom"><div id="more" class="zoommore">+</div><div id="less" class="zoomless">-</div> </div>',
                    '<div id="inter" class="inter">',
                        '<div id="title" class="bigLegend">'+self.headerCopy+'</div>',
                    '</div>',
                    '<div id="chartContent" class="chartContent"></div>',
                    '</div>'
        ].join('\n');





        $(self.parentSelect).html(injectString);

        self.circleChart = tdviz.viz.circlePackingSimple(
            {
                'idName':"chartContent",
                'idInfo': self.idInfo,
                'height':window.innerHeight,
                'width':window.innerWidth,
                'transTime':1500,
                'loadingMessage':"Loading data...",
                'colorScale': self.colorScale,
                'backColorScale':self.backColorScale,
                'selectCallBack': self.selectCallBack,
                'myLog':myLog,
                'nameCallback':self.displayTipLeaf,
                'categoryCallback': self.displayTipNode
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
