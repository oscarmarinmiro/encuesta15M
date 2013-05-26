var outliers = outliers || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };

outliers.controller.wordCloudEncuestas = function(options)
{

    // Referencia a esta instancia

    var self = {};



    for (key in options){
        self[key] = options[key];
    }


    self.parentSelect = "#"+self.idName;

    self.DATA_FILE = self.baseJUrl+self.dataFile;



    // Funciones auxiliares

    function myLog(myString, level)
    {

        if ((self.debugLevel!=0)&&(level<=self.debugLevel))
        {
            console.log(myString);
        }
    }

    self.colorScale = d3.scale.linear().domain([0,1000]).range(["#DDD","#F00"]);
    self.opacityScale = d3.scale.linear().domain([7,40]).range([0.3, 1.0]);

    self.keys = [];
    self.values = {};
    self.key="1";
    self.value="Sí";


    // El document ready

    $(document).ready(function()
    {

        var injectString =
            ['<div id="contenedorTodo" class="contenedorTodo">',
                '<div id="zonaFecha" class="zonaFecha">',
                '</div>',
                '<div class="opcionesContent">',
                //'<form>',
                //'<label><input type="radio" name="dataIn" value="1" checked>1</label>',
                //'<label><input type="radio" name="dataIn" value="5">5</label>',
                //'</form>',
                '</div>',
                '<div id="contenedorCI" class="contenedorCI">',
                '<div id="zonaChart" class="zonaChart">',
            '<div id="chartContent" class="chartContent"></div>',
            '</div>',
            '</div>',
        ].join('\n');


        $(self.parentSelect).html(injectString);

        self.conteo={};
        self.conteo2={};

        self.cloudChart = outliers.viz.wordCloud(
        {
            'idName':"chartContent",
            'idInfo': self.idInfo,
            'width':700,
            'height':300,
            'transTime':1500,
            'opacityScale': self.opacityScale,
            'loadingMessage':"Loading data...",
            'colorScale': self.colorScale,
            'font': self.font,
            'padding': 5,
            'myLog':myLog
        });

        self.cloudChart2 = outliers.viz.wordCloud(
        {
            'idName':"chartContent",
            'idInfo': self.idInfo,
            'width':700,
            'height':300,
            'transTime':1500,
            'opacityScale': self.opacityScale,
            'loadingMessage':"Loading data...",
            'colorScale': self.colorScale,
            'font': self.font,
            'padding': 5,
            'myLog':myLog
        });

        $.getJSON(self.DATA_FILE,function(data){
            console.log(data);
            self.data = data.data;
            self.dataLabel = data.data_tip;
            console.log(self.dataLabel);
            var html = '';
            $.each(self.dataLabel.filterValues,function(key,value){
                var prehtml = '';
                self.keys.push(key);
                self.values[key] = ["Todos"];
                console.log(value.values);
                $.each(value.values,function(i,d){
                    //if(i==0){self.values[key]=[d];}
                    
                    prehtml = prehtml+'<option value="'+d+'">'+d+'</option>'
                });
                html = html+'<select name="dataIn" id='+key+'>'+prehtml+'</select>     '+value.title+'<br>';

            });

            console.log('<form>'+html+'</form>');

            d3.select(".opcionesContent").html('<form>'+html+'</form>');
            
            function refresh()
            {
                self.conteo={};
                self.conteo2={};
                $.each(self.data,function(i,d){
                    //console.log(d["1"]);
                    var flag="ok";
                    for(entry in self.keys){
                        
                        if(self.values[self.keys[entry].toString()].indexOf("Todos")<0 && self.values[self.keys[entry].toString()].indexOf(d[self.keys[entry].toString()])<0){flag="ko";}
                    }
                    if(flag=="ok"){
                    //if(d[self.key]==self.value)
                    //{
                        console.log("OK!!!!!");
                        for(i=0;i<d[self.dataLabel.cloudValues[0]].length;i++)
                        {
                            if(!(d[self.dataLabel.cloudValues[0]][i] in self.conteo))
                            {
    
                                self.conteo[d[self.dataLabel.cloudValues[0]][i]] = 0;
                                //console.log(self.conteo[d["7"][i]]);
                            }
                            self.conteo[d[self.dataLabel.cloudValues[0]][i]]++;
                            //console.log(self.conteo[d["7"][i]]++);
                        }
                        for(j=0;j<d[self.dataLabel.cloudValues[1]].length;j++)
                        {
                            if(!(d[self.dataLabel.cloudValues[1]][j] in self.conteo2))
                            {
                                self.conteo2[d[self.dataLabel.cloudValues[1]][j]] = 0;
                                //console.log(self.conteo[d["7"][i]]);
                            }
                            self.conteo2[d[self.dataLabel.cloudValues[1]][j]]++;
                            //console.log(self.conteo[d["7"][i]]++);
                        }
                    }
    
                });

                self.cloudChart.render(self.getWords(self.conteo),'');
                self.cloudChart2.render(self.getWords(self.conteo2),'');
            }
            $.each(self.data,function(i,d){
                //console.log(d["1"]);
                var flag="ok";
                for(entry in self.keys){
                    //if(d[entry]!=self.values[entry]){flag="ko";}
                    //if(self.values[self.keys[entry].toString()]!="Todos" && d[self.keys[entry].toString()]!=self.values[self.keys[entry].toString()]){flag="ko";}
                    if(self.values[self.keys[entry].toString()].indexOf("Todos")<0 && self.values[self.keys[entry].toString()].indexOf(d[self.keys[entry].toString()])<0){flag="ko";}
                }
                if(flag=="ok"){
                //if(d[self.key]==self.value)
                //{
                    for(i=0;i<d[self.dataLabel.cloudValues[0]].length;i++)
                    {
                        if(!(d[self.dataLabel.cloudValues[0]][i] in self.conteo))
                        {
                            self.conteo[d[self.dataLabel.cloudValues[0]][i]] = 0;
                            //console.log(self.conteo[d["7"][i]]);
                        }
                        self.conteo[d[self.dataLabel.cloudValues[0]][i]]++;
                        //console.log(self.conteo[d["7"][i]]++);
                    }
                    for(j=0;j<d[self.dataLabel.cloudValues[1]].length;j++)
                    {
                        if(!(d[self.dataLabel.cloudValues[1]][j] in self.conteo2))
                        {
                            self.conteo2[d[self.dataLabel.cloudValues[1]][j]] = 0;
                            //console.log(self.conteo[d["7"][i]]);
                        }
                        self.conteo2[d[self.dataLabel.cloudValues[1]][j]]++;
                        //console.log(self.conteo[d["7"][i]]++);
                    }
                }

            });
            $('select[name="dataIn"]').change(function(){
                //console.log("THIS");
                //console.log(self.values);
                console.log(this);
                if(this.id=="18"){
                    var aux = this.value.split('-')
                    self.values[this.id] = [];
                    for(i=aux[0];i<(parseInt(aux[1]));i++){
                        self.values[this.id].push(i.toString());
                    }
                    console.log("yehaaaaaaaaaaaaa!!!!!!!!!!");
                    console.log(self.values[this.id]);
                }
                else{
                    self.values[this.id] = [this.value];
                }
                //console.log(self.values);
                self.key = this.id;
                self.value = this.value;

                refresh();

            });


            self.cloudChart2.render(self.getWords(self.conteo2),'');
            self.cloudChart.render(self.getWords(self.conteo),'');
        });

        self.getWords = function(prewords){
            var tuples = [];
            //console.log("prewords");
            //console.log(prewords);

            for (var key in prewords) tuples.push([key, prewords[key]]);

            tuples.sort(function(a, b) {
                a = a[1];
                b = b[1];

                return a > b ? -1 : (a < b ? 1 : 0);
            });
            var palabras = [];
            for(var i = 0; i < Math.min(tuples.length,25); i++) {
                palabras.push({"score":tuples[i][1],"name":tuples[i][0]});
            }
            //console.log("palabras");
            //console.log(palabras);
            return palabras;
        };

    });

}

