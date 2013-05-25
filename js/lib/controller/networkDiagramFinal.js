
var tdviz = tdviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };

tdviz.controller.networkDiagramFinal = function(options)
{

    // Referencia a esta instancia

    var self = {};

    // Copies

    self.MOUSEOVER_INFO = 'Mouseover here for help';

    self.MORE_INFO = [
        'Mouse over a node to display its local network and related node info.<br><br>',
        'White color in links are for nodes from different company at the moment, otherwhise, company color is used to link nodes from same company at the moment<br><br>',
        'You can also zoom or pan the visualization with your mouse.<br><br>'
    ].join('\t');

    self.NO_EVENT_STRING = "None";

    // Pongo lo que me venga por opciones en el self

    for (var key in options){
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


    self.getTLValues = function()
    {
        self.eventsTL = {};

        for(var node in self.eventsData)
        {
            self.eventsTL[node] = {};

            var maxDate = "20010101";
            var minDate = "20200101";

            for(var date in self.eventsData[node])
            {
                if(date<minDate)
                {
                    minDate = date;
                }

                if(date>maxDate)
                {
                    maxDate = date;
                }
            }

            if(minDate=="20200101")
            {

                // En este caso, el array va de self.miDate a self.maxDate (fechas del tirador)

                var nowDate = self.minDate.clone();

                for(var i=0;i<self.numDays+1;i++)
                {
                    var myDate = nowDate.clone().add('days',i);

                    var nowDateString = myDate.clone().format("YYYYMMDD");

                    self.eventsTL[node][nowDateString] = {};
                    self.eventsTL[node][nowDateString]['cis'] = 0.0;
                    self.eventsTL[node][nowDateString]['cps'] = 0.0;

                }

            }
            else
            {
                // En este caso, hago un bucle desde minDate hasta maxDate, haciendo lookups...

                var minDateMom = moment(minDate,"YYYYMMDD");
                var maxDateMom = moment(maxDate,"YYYYMMDD");

                // Si resulta que la maxima del data de events del nodo es menor que la de la viz...

                if (maxDateMom.clone().diff(self.maxDate.clone(),'days')-1)
                {
                    maxDateMom = self.maxDate.clone();

                }


                var nowDate = minDateMom.clone();

                var numDays = maxDateMom.clone().diff(minDateMom.clone(),'days');

                var lastCIS = 0.0;

                var lastCPS = 0.0;

                for(var i=0;i<numDays+1;i++)
                {
                    var myDate = nowDate.clone().add('days',i);

                    var nowDateString = myDate.clone().format("YYYYMMDD");

                    self.eventsTL[node][nowDateString] = {};

                    if((nowDateString in self.eventsData[node]) && ('cis' in self.eventsData[node][nowDateString]))
                    {
                        lastCIS = self.eventsData[node][nowDateString]['cis'];

                    }

                    self.eventsTL[node][nowDateString]['cis'] = lastCIS;

                    if((nowDateString in self.eventsData[node]) && ('cps' in self.eventsData[node][nowDateString]))
                    {
                        lastCPS = self.eventsData[node][nowDateString]['cps'];

                    }

                    self.eventsTL[node][nowDateString]['cps'] = lastCPS;
                }


            }
        }

    }

    // Funciones de copies...

    self.monetaryInfoCall = function(monInfo)
    {

        myHtml="";
        myHtml+="Active nodes: "+monInfo['con']+"<br>Value: "+monInfo['conValue'].toFixed(2)+"<br>";
        myHtml+="Disconnected nodes: "+monInfo['dis']+"<br>Value: "+monInfo['disValue'].toFixed(2)+"<br>";


        $('#newsContent').html(myHtml);


    }

    self.nodeInfoCall = function(node,nowDateString)
    {

        $('#netInfo').html("");

        myHtml= "";

        myHtml+="<span class='opcionesHeader'>Node Info</span><br><br>";

        myHtml+= "<b>PhoneId</b> "+node.userId+"<br>";
        myHtml+= "<b>Status</b> "+node.state+"<br>";
        myHtml+= "<b>ConDate</b> "+node.conDate+"<br>";
        myHtml+= "<b>DisDate</b> "+node.disDate+"<br>";

        var cps = 0.0;

        if(nowDateString in self.eventsTL[node['userId']])
        {
            cps = self.eventsTL[node['userId']][nowDateString]['cps'];
        }


        myHtml+= "<b>CPS</b> "+cps.toFixed(2)+"<br>";

        var cis = 0.0;

        if(nowDateString in self.eventsTL[node['userId']])
        {
            cis = self.eventsTL[node['userId']][nowDateString]['cis'];
        }

        myHtml+= "<b>CIS</b> "+cis.toFixed(2)+"<br>";
        myHtml+= "<b>Degree</b> "+node.links.length+"<br>";
        myHtml+= "<b>Monetary Value</b> "+node.monetaryValue.toFixed(2)+"<br>";

        if(node.state=="disconnected")
        {
            myHtml+= "<b>Company</b> "+node.disCompany+"<br>";
        }
        else
        {
            myHtml+= "<b>Company</b> "+self.scaleCompany.domain()[0]+"<br>";

        }
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
                            '<br><select id="dataset"></select><br><br>',
                            '<div class="newsHeader">Monetary info</div>',
                                '<div id="newsContent" class="newsContent">',
                                '</div>',
                        '</div>',
                        '<div class="opcionesHeader">Node Size Metric</div>',
                        '<div class="opcionesContent">',
                            '<form>',
                                '<select id="dataIn">',
                                    '<option value="cis" selected="selected">CIS</option>',
                                    '<option value="cps">CPS</option>',
                                    '<option value="degree">Degree</option>',
                                    '<option value="mvalue">Monetary Value</option>',
                                '</select>',
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

        self.networkChart = tdviz.viz.networkDiagramFinal(
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
                'scaleCompany': self.scaleCompany,
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

               self.eventsData = netData['events'];

               self.minDate = self.netData['info']['initDate'];

               self.maxDate = self.netData['info']['endDate'];

               myLog ("minDate",0);
               myLog(self.minDate,0);
               myLog ("maxDate",0);
               myLog(self.maxDate,0);


               // paso la minDate y maxDate a moment format

               self.minDate = moment(self.minDate, "YYYYMMDD");

               self.maxDate = moment(self.maxDate, "YYYYMMDD");

               self.nowDate = self.minDate.clone();

               // Y calculo el número de días

               self.numDays = self.maxDate.clone().diff(self.minDate.clone(),'days');

               self.getTLValues();

               myLog("Número de días",3);
               myLog(self.numDays,3);

               function dateCallBack(nowDate)
               {
                    self.nowDate=nowDate;

                    myLog("La nowDate ahora es:",3);

                    myLog(self.nowDate,3);

                   self.networkChart.render(self.netData,self.nowDate,self.dataIn,self.eventsTL);

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

               // Pueblo el select con los datos del json de conf....

               var myHtml = "";

               for(var i in self.dataSets)
               {
                   var fileName = self.dataSets[i];

                   if(fileName==self.dataFile)
                   {
                       myHtml+='<option name="'+fileName+'" selected>'+fileName+'</option>';
                   }
                   else
                   {
                       myHtml+='<option name="'+fileName+'">'+fileName+'</option>';
                   }

               }

               console.log(myHtml);

               $('#dataset').html(myHtml);


               // primer render de la red

               self.networkChart.render(self.netData,self.nowDate,self.dataIn,self.eventsTL);


               $('#dataIn').change(function(){

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
