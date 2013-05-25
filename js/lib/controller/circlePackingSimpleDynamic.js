var tdviz = tdviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };


tdviz.controller.circlePackingSimpleDynamic = function(options)
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
                    '<div id="change" class="change" style="margin-top:20px;color:#FFF;"><div id="firstDataSet"><a href="#">First DataSet</a></div><div id="secondDataSet"><a href="#">Second DataSet</a></div> </div>',
                    '<div id="inter" class="inter" style="margin-top:50px;left:0px;">',
                        '<div id="title" class="bigLegend">'+self.headerCopy+'</div>',
                    '</div>',
                    '<div id="search" class="search"></div>',
                    '<div id="chartContent" class="chartContent"></div>',
                    '</div>'
        ].join('\n');

        $(self.parentSelect).html(injectString);

        self.circleChart = tdviz.viz.circlePackingSimpleDynamic(
            {
                'idName':"chartContent",
                'idInfo': self.idInfo,
                'height':window.innerHeight,
                'width':window.innerWidth,
                'transTime':self.transTime,
                'loadingMessage':"Loading data...",
                'colorScale': self.colorScale,
                'backColorScale':self.backColorScale,
                'selectCallBack': self.selectCallBack,
                'myLog':myLog,
                'nameCallback':self.displayTipLeaf,
                'categoryCallback': self.displayTipNode
            });

        self.findCallBack = function(value)
        {
            self.circleChart.findNode(value);
        }

        self.searchTool = tdviz.extras.incrementalSearch(
            {
                'parentId':"search",
                'formId':"searchForm",
                'captionText':self.captionText,
                'findCallBack': self.findCallBack,
                'myLog':myLog
            });



        d3.json(self.baseJUrl+self.DATA_FILE, function(circleData)
        {
            if(circleData!=null)
            {
                self.circleData = circleData;

                // Attach change events to links

                $('#firstDataSet').on("click",function (){changeCallBack(self.circleData['first']);});
                $('#secondDataSet').on("click",function (){changeCallBack(self.circleData['second']);});



                function changeCallBack(data)
                {
                    // get final leafs in order to fill autocomplete

                    function findChildren(data,hash)
                    {
                        if(data.children)
                        {
                            for(var i in data.children)
                            {
                                findChildren(data.children[i],hash);
                            }
                        }
                        else
                        {
                            var key = data.name;
                            hash[key] = true;
                        }
                    }

                    var siteHash = {};

                    findChildren(data,siteHash);

                    var keys = [];
                    for (var key in siteHash) keys.push(key);

                    // populate the form autocomplete

                    self.searchTool.populate(keys);

                    self.circleChart.render(data);

                }

                changeCallBack(self.circleData['first']);


            }
            else
            {
                myLog("Could not load file: "+self.baseJUrl+self.DATA_FILE,1);
            }
        });

    });

}
