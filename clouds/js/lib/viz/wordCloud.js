var outliers = outliers || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };


outliers.viz.wordCloud= function (options)
{

    // Object

    var self = {};


    // Get options data

    for (key in options){
        self[key] = options[key];
    }

    self.parentSelect = "#"+self.idName;

    self.init = function(){

        // svg init

        self.myLog("Iniciando wordcloud...",3);


        self.fontScale = d3.scale.linear().domain([0,1]).range([12, 40]);



        self.myLog("Iniciando chordChart... en ",3);
        self.myLog(self.parentSelect,3);
        self.svg = d3.select(self.parentSelect).append("svg")
            .attr("width",self.width)
            .attr("height",self.height)
            .append("g")
            .attr("transform", "translate("+(self.width/2)+","+(self.height/2)+")");

        // warning message

        self.warningMessage = self.svg.append("text")
            .attr("text-anchor", "middle")
            .attr("class","wordChartTextWarning")
            .attr("x", 0)
            .attr("y", 0)
            .text(self.loadingMessage);

        // Si es un layout, lo invoco
        // d3.layout.chord object....

//        self.chord = d3.layout.chord()
//            .padding(self.chordPadding)
//            .sortSubgroups(d3.ascending)
//            .sortChords(d3.ascending);


    }


    self.render = function(data, nowDate)
    {

        self.warningMessage.remove();
        self.data = data;
        self.nowDate = nowDate;

        console.log("Me llegan los datos");
        //console.log(data);

        var wordData = data.slice(0,20);

        //self.myLog("wordData",3);
        //self.myLog(wordData,3);


        var cloudData = [];


        if(wordData.length==0)
        {
            alert("NO HAY DATOS, CHATO");
        }
        else
        {
            var maxSize = wordData[0].score;


            for(i=0;i<wordData.length;i++)
            {
                var unDato = {};

                unDato.text = wordData[i].name;
                unDato.size = self.fontScale (wordData[i].score/maxSize);

                cloudData.push(unDato);

            }

//            console.log("cloudData");

            //self.myLog("cloudData",2);
            //self.myLog(cloudData,2);

            d3.layout.cloud().size([self.width, self.height])
                .words(cloudData)
                .rotate(function() { return 0; })
                .fontSize(function(d) { return d.size; })
                .font(self.font)
                .on("end", draw)
                .padding(self.padding)
                .start();
        }

        function draw(words) {
            //console.log("AAAAAAAAAA");
            //console.log(cloudData);
            //console.log("words");
            //console.log(words);

            var text = self.svg
                .selectAll("text")
                .data(words,function(d) { return d.text;});

            text.transition()
                .duration(self.transTime)
                //.style("fill",function(d){return d.text.charAt(0)=="#" ? "#25A":"#222";})
                .attr("transform", function(d) { return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")"; })
                .style("font-size", function(d) { return d.size + "px"; })
                .style("opacity", function(d) { return self.opacityScale(d.size); })
//                .style("fill", "#000");

            text.enter().append("text")
                .attr("text-anchor", "middle")
                .attr("class","cloudText")
                //.on("click", function(d){self.buildUrl(self.nowDate,d.text);})
                .attr("transform", function(d) {
                    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
                })
                .text(function(d) { return d.text; })
                .style("font-size", function(d) { return d.size + "px"; })
                .style("font-family",self.font)
                //.style("fill",function(d){return d.text.charAt(0)=="#" ? "#25A":"#222";})
                .style("opacity",1e-6)
                .transition()
                .duration(self.transTime)
                .style("opacity", function(d) { return self.opacityScale(d.size); });
//                .style("fill", "#000");

            text.exit().transition().duration(self.transTime).style("opacity",1e-6).remove();
        }

    }

    // Main del objeto

    self.init();

    return self;

}
