var outliers = outliers || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };
outliers.controller.heatmapC = function(options)
{
    // Referencia a esta instancia
    var self = {};
    for (key in options){
        self[key] = options[key];
    }
    self.parentSelect = "#"+self.idName;
    self.GEO_DATA_FILE = self.baseJUrl+self.geoDataFile;
    self.DATA_FILE = self.baseJUrl+self.dataFile;
    // Funciones auxiliares
    function myLog(myString, level)
    {
        if ((self.debugLevel!=0)&&(level<=self.debugLevel))
        {
            console.log(myString);
        }
    }
    // El document ready
    $(document).ready(function(){
        var injectString =
            ['<div id="contenedorTodo" class="contenedorTodo">',
                '<div id="zonaFecha" class="zonaFecha">',
                '</div>',
                '<div class="opcionesContent">',
                '<form>',
                '<label><input type="radio" name="dataIn" value="encuestas" checked>Encuestas completadas</label>',
                '<label><input type="radio" name="dataIn" value="ppt">‰ de los habitantes que han completado la encuesta</label>',
                '</form>',
                '</div>',
                '<div id="contenedorCI" class="contenedorCI">',
                '<div id="zonaChart" class="zonaChart">',
                '<div id="chartContent" class="chartContent"></div>',
                '</div>',
                '</div>',
        ].join('\n');
        $(self.parentSelect).html(injectString);
        self.heatmap = outliers.viz.heatmapV({
           'parentId':"chartContent",
           'idInfo': self.idInfo,
           'width':960,
           'height':600,
           'scale': 1500,
           'translate': [500, 1300],
           'colorRange': [d3.rgb(247,252,245), d3.rgb(0,68,27)],
           'loadingMessage':"Loading data...",
           'padding': '2px',
           'myLog':myLog
        });
        $.getJSON(self.GEO_DATA_FILE,function(data){
            
            d3.csv(self.DATA_FILE, function(d) {
                self.heatmap.prerender(data,d);
                self.heatmap.render("encuestas");
            });
        });

        $('input[name="dataIn"]').change(function(){
               //console.log("THIS");
               //console.log(self.values);
               self.heatmap.render(this.value);
        });
    });
}