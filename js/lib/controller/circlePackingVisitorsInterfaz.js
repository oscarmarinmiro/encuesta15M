var tdviz = tdviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };


tdviz.controller.circlePackingVisitorsInterfaz = function(options)
{

    // Referencia a esta instancia

    var self = {};

    // Global vars


    for (key in options){
        self[key] = options[key];
    }

    console.log("En el controller la variable es");
    console.log(self.sankeyHTML);


    self.DATA_FILE = self.dataFile;

    self.parentSelect = "#"+self.idName;

    // Copies

    self.headerCopy = "Visitors Map";

    self.sitePreffix = "Comparing:<br>";

    self.noneText = "None"

    self.noneSelectedText = self.noneText+" vs "+self.noneText;


    // Funciones auxiliares y de copy

    function myLog(myString, level)
    {

        if ((self.debugLevel!=0)&&(level<=self.debugLevel))
        {
            console.log(myString);
        }
    }

    self.selectCallBack = function(selectArr)
    {
//        console.log(selectArr);
        var firstSite = selectArr[0]!=null ? selectArr[0]:"None";
        var secondSite = selectArr[1]!=null ? selectArr[1]:"None";
        $('#siteOne').html(self.sitePreffix+ firstSite+" vs "+secondSite);
//        console.log($('#siteOne').text());
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
                        '<div id="siteOne" class="smallLegend">'+self.sitePreffix+self.noneSelectedText+'</div>',
                        '<form id="findForm">',
                             '<input class="textBox" id="searchSite" name="text" placeholder="Site Name" type="text" value="">',
                             '<input type="submit" class="buttonBlock" value="Find">',
                         '</form>',
                         '<div class="flow">',
                            '<input type="button" id="compare" class="buttonFlow" value="Compare">',
                            '<input type="button" id="reset" class="buttonFlow" value="Reset All">',
                            '<input type="button" id="resetzoom" class="buttonFlow" value="Reset Zoom">',
                        '</div>',
                    '</div>',
                    '<div id="chartContent" class="chartContent"></div>',
                    '</div>'
        ].join('\n');





        $(self.parentSelect).html(injectString);

        $("#findForm").submit(function(){self.findNode();return false;});

//        console.log("Dimensiones");
//        console.log(window.innerHeight);
//        console.log(window.innerWidth);




        self.colorScale = d3.scale.linear().domain([0,1000]).range(["#DDD","#F00"]);

        self.circleChart = tdviz.viz.circlePackingVisitorsInterfaz(
            {
                'idName':"chartContent",
                'idInfo': self.idInfo,
                'height':window.innerHeight,
                'width':window.innerWidth,
                'transTime':1500,
                'loadingMessage':"Loading data...",
                'colorScale': self.colorScale,
                'selectCallBack': self.selectCallBack,
                'myLog':myLog,
                'sankeyHTML': self.sankeyHTML,
                'nameCallback':self.displayName
            });

        $("#compare").on("click",function(){self.circleChart.sankeyNodes()});
        $("#reset").on("click",function(){self.circleChart.resetNodes();});
        $("#resetzoom").on("click",function(){self.circleChart.resetZoom();});

        self.findNode = function()
        {
            var node = $("#searchSite").val();

            self.circleChart.findNode(node.toLowerCase());
        }

        d3.json(self.baseJUrl+self.DATA_FILE, function(circleData)
        {
            if(circleData!=null)
            {
                self.circleData = circleData;

                self.availableSites = [];

                for(var category in circleData.children)
                {
                    for(var siteIdx in circleData.children[category].children)
                    {
                        self.availableSites.push(circleData.children[category].children[siteIdx].name);
                    }

                }

//                console.log("bind de autocomplete");

                $( "#searchSite" ).autocomplete({
                    source: self.availableSites
                });

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
