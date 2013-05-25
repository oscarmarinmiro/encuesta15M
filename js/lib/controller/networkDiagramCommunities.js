
var tdviz = tdviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };

tdviz.controller.networkCommunities = function(options)
{

    // Referencia a esta instancia

    var self = {};



    // Copies

    self.MOUSEOVER_INFO = 'Mouseover here for help';

    self.MORE_INFO = [
        'Mouse over a node to display its local network and related node info.<br><br>',
        'White links represent possible infection paths: A link between a \'Ported Out\' node and an active node.<br><br>',
        'Red links join infected nodes(both). Green links join healthy nodes (both)<br><br>',
        'You can also zoom or pan the visualization with your mouse.<br><br>'
    ].join('\t');

    self.NO_EVENT_STRING = "None";

    // Pongo lo que me venga por opciones en el self

    for (key in options){
        self[key] = options[key];
    }

    self.parentSelect = "#"+self.idName;

    // Datos iniciales de las opciones de render

    self.dataIn = "cis";

    // Funciones auxiliares

    function myLog(myString, level)
    {

        if ((self.debugLevel!=0)&&(level<=self.debugLevel))
        {
            console.log(myString);
        }
    }

    // Funciones de copies...

    self.monetaryInfoCall = function(monInfo)
    {
        console.log("Rellenando la info monetaria...");
        console.log(monInfo);

        myHtml="";
        myHtml+="<b>Active nodes</b>: "+monInfo['con']+"<br><b>Value</b>: "+monInfo['conValue'].toFixed(2)+"<br>";
        myHtml+="<b>Disconnected nodes</b>: "+monInfo['dis']+"<br><b>Value</b>: "+monInfo['disValue'].toFixed(2)+"<br>";


        $('#newsContent').html(myHtml);


    }

    self.nodeInfoCall = function(node)
    {

        $('#netInfo').html("");

        myHtml= "";

        myHtml+="<span class='opcionesHeader'>Node Info</span><br><br>";

        myHtml+= "<b>PhoneId</b> "+node.userId+"<br>";
        myHtml+= "<b>Status</b> "+node.state+"<br>";
        myHtml+= "<b>ConDate</b> "+node.conDate+"<br>";
        myHtml+= "<b>DisDate</b> "+node.disDate+"<br>";
        myHtml+= "<b>CPS</b> "+node.cps+"<br>";
        myHtml+= "<b>CIS</b> "+node.cis+"<br>";
        myHtml+= "<b>CIV_W</b> "+node.civ_w+"<br>";
        myHtml+= "<b>CIV_I</b> "+node.civ_i+"<br>";
        myHtml+= "<b>Degree</b> "+node.links.length+"<br>";
        myHtml+= "<b>Monetary Value</b> "+node.monetaryValue+"<br>";
        myHtml+= "<b>Migrated To</b> "+node.disCompany+"<br>";
        myHtml+="<b>Communities</b> "+node['communities'].length+"<br>";

        $('#netInfo').css("border","1px solid #777");
        $('#netInfo').css("padding","7px");


        $('#netInfo').html(myHtml);




    }

    self.nodeInfoRemove = function()
    {
        $('#netInfo').html("");

        $('#netInfo').html("<span id='mouseme' class='opcionesHeader'>"+self.MOUSEOVER_INFO+"</span>");

        $('#netInfo').css("border","");
        $('#netInfo').css("padding","");
        $('#mouseme').attr("title",self.MORE_INFO);

        $('#mouseme').tipsy({
            gravity: 's',
            opacity: 1.0,
            html: true
        });


    }

    // El document ready

    $(document).ready(function()
    {
        // El cache del servidor manda

        $.ajaxSetup({cache: true});

        // Inyecto el html en el div padre

        var injectString =
            ['<div id="contenedorTodo" class="contenedorTodo">',
                '<div id="zonaFecha" class="zonaFecha">',
                '</div>',
                '<div id="contenedorCI" class="contenedorCI">',
                    '<div id="zonaChart" class="zonaChart">',
                        '<div id="chartContent" class="chartContent"></div>',
                    '</div>',
                    '<div id="zonaInfo" class="zonaInfo">',
                        '<div class="news">',
                            '<div class="newsHeader">Choose Dataset</div>',
                            '<br><select id="dataset"><option value="c100November.json">c100November.json</option><option value="c100October.json">c100October.json</option></select><br><br>',
                            '<div class="newsHeader">Monetary info</div>',
                                '<div id="newsContent" class="newsContent">',
                                '</div>',
                        '</div>',
                        '<div class="opcionesHeader">Node Size Metric</div>',
                        '<div class="opcionesContent">',
                            '<form>',
                                '<label><input type="radio" name="dataIn" value="cis" checked> CIS</label><br>',
                                '<label><input type="radio" name="dataIn" value="cps"> CPS</label><br>',
                                '<label><input type="radio" name="dataIn" value="degree"> Degree</label><br>',
                                '<label><input type="radio" name="dataIn" value="mvalue"> Monetary Value</label><br>',
                            '</form>',
                        '</div>',
                        '<div class="netInfoContent" id="netInfo"><span id="mouseme" title="'+self.MORE_INFO+'" class="opcionesHeader">'+self.MOUSEOVER_INFO+'</span></div>',
                        '<div class="legend"><div class="opcionesHeader">Color Legends</div><div id="legendContent" class="legendContent"></div></div>',
                    '</div>',
             '</div>',
             '<div id="footer" class="footer"></div>'
            ].join('\n');




        $(self.parentSelect).html(injectString);

        // Selecciono la opcion del combo

        $('#dataset').val(self.dataFile);

        // Tooltip de la ayuda


        $('#mouseme').tipsy({
            gravity: 's',
            opacity: 1.0,
            html: true
        });

        $('#dataset').change(function() {
            window.location = self.urlBase+"?file="+$('#dataset').val();
        });

        // Instancio el objeto networkChart

        self.networkChart = tdviz.viz.networkDiagramCommunities(
            {
                'idName':"chartContent",
                'idInfo': self.idInfo,
                'width':800,
                'height':700,
                'transTime':500,
                'legendId':"legendContent",
                'loadingMessage':"Loading data...",
                'colorScale': self.colorScale,
                'nodeInfoCall': self.nodeInfoCall,
                'nodeInfoRemove': self.nodeInfoRemove,
                'monetaryCall': self.monetaryInfoCall,
                'myLog':myLog
            });

        // Pido el fichero de datos

        d3.json(self.baseJUrl+self.dataFile, function(netData)
        {
           if(netData!=null)
           {
               self.netData = netData;

               self.infoData = netData['info'];
               self.nodesData = netData['nodes'];
               self.nodesDictData = netData['nodesDict'];
               self.nodesDictInvData = netData['nodesDictInv'];
               self.linksData = netData['links'];
               self.linksDictData = netData['linksDict'];
               self.linksDictInvData = netData['linksDictInv'];
               self.statesData = netData['states'];

               // Recorro el json: La idea es coger la fecha minima y la maxima

               myLog("Info de states...",3);

               myLog(self.statesData,3);

               self.minDate = self.initDate;

               self.maxDate = self.minDate;

               // Para coger la maxDate, recorro los states

               for (var date in self.statesData)
               {
                    if (date>self.minDate)
                    {
                        self.maxDate = date;
                    }
               }

               myLog ("minDate",3);
               myLog(self.minDate,3);
               myLog ("maxDate",3);
               myLog(self.maxDate,3);

               // paso la minDate y maxDate a moment format

               self.minDate = moment(self.minDate, "YYYYMMDD");

               self.maxDate = moment(self.maxDate, "YYYYMMDD");

               self.nowDate = self.minDate.clone();

               // Y calculo el número de días

               self.numDays = self.maxDate.clone().diff(self.minDate.clone(),'days');

               myLog("Número de días",3);
               myLog(self.numDays,3);

               function dateCallBack(nowDate)
               {
                    self.nowDate=nowDate;

                    myLog("La nowDate ahora es:",3);

                    myLog(self.nowDate,3);

                   self.networkChart.render(self.netData,self.nowDate,self.dataIn);

               }

               self.mySlider = tdviz.extras.dateSlider(
                   {
                       'parentId': "zonaFecha",
                       'className': self.className,
                       'imgPath': self.imgPath,
                       'beginDate': self.minDate,
                       'endDate': self.maxDate,
                       'playName': 'play-on-dark.gif',
                       'pauseName': 'pause-on-dark.gif',
                       'callBack': dateCallBack,
                       'interval':1000,
                       'increment': 1,
                       'logCallBack': myLog
                   });


               // primer render de la red

               self.networkChart.render(self.netData,self.nowDate,self.dataIn);


               $('input[name="dataIn"]').change(function(){

                   self.dataIn = this.value;

                   dateCallBack(self.nowDate);
               });

           }
           else
           {
               myLog("Could not load file: "+self.baseJUrl+self.EVENTS_FILE,1);
           }
        });

    });
}
