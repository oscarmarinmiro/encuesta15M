var tdviz = tdviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };

// dateSlider implementation w/ configurable step
// params:
// parentId: Id of DOM Container
// className: Class of DOM Container
// imgPath: path to image access
// beginDate: first day
// endDate: last day
// callback: Function to call on date change
// myLog: Custom log from parent [w/ logging levels]
// interval: ms between auto date change
// increment: day step between slider change

tdviz.extras.dateSlider = function(options)
{
    var self = {};

    // Pillo los parametros como global vars

    // Pongo lo que me venga por opciones en el self

    for (key in options){
        self[key] = options[key];
    }

    self.increment = self.increment || 1;

    self.parentSelect = "#" + self.parentId;

    // Global de playing

    self.playing = false;



    self.init = function ()
    {

        console.log("inyectando el div de fecha en");
        console.log(self.parentSelect);

        var injectString =
            ['<div class="play"><img class="playImg" src="'+self.imgPath+self.playName+'" height="25" width="25"></div>',
                '<div class="slider"></div>',
                '<div class="fechaText"></div>'
            ].join('\n');

        $(self.parentSelect).html(injectString);

        // Inserto el componente slider

        var sliderSelect = self.parentSelect + " .slider";

        // Y calculo el número de días

        self.numDays = self.endDate.clone().diff(self.beginDate.clone(),'days')+1;

        self.nowDate = self.beginDate.clone();

        self.slider = $(sliderSelect).slider({
            value:1,
            min: 1,
            max: self.numDays,
            step: self.increment,
            disabled: false
        });

        // Pongo el contenido de la fecha inicial

        $(self.parentSelect+" .fechaText").html(self.nowDate.format("DD.MM.YYYY"));



        // Ato el evento del cambio de slider

        self.slider.bind( "slidechange", function(event, ui)
        {

            self.nowDate = self.beginDate.clone().add('days',ui.value-1);

            $(self.parentSelect+" .fechaText").html(self.nowDate.format("DD.MM.YYYY"));

            // Y llamo al callback

            self.callBack(self.nowDate.clone());
        });

        // Voy con las alarmas y los clicks

        self.avanzaPlay = function ()
        {

            if((self.playing==true) && (self.nowDate<self.endDate))
            {


                self.nowDate = self.nowDate.clone().add('days',self.increment);


                $( self.parentSelect + " .slider" ).slider('value', $( self.parentSelect + " .slider" ).slider('value') + self.increment);
            }

            // Es el ultimo dia: me paro y pongo a play el boton (estoy en pause)

            var myDiff = self.endDate.clone().diff(self.nowDate,'days');


            if ((self.playing==true) && (self.endDate.clone().diff(self.nowDate,'days')<1))
            {
                $(self.parentSelect+" .play").html('<img src="'+self.imgPath+self.playName+'" height="25" width="25">');
                self.playing = false;
            }

        }

        // Manejo de play/pause


        $(self.parentSelect+" .play").click(function (){

            if(self.playing==false)
            {

                // Si esta parado, pero estoy en el ultimo dia...

                if((self.endDate.clone().diff(self.nowDate.clone(),'days')<1))
                {
                    clearInterval(self.refreshId);

                    self.nowDate = self.beginDate.clone().add('days',0);

                    $(self.parentSelect + " .slider" ).slider('value', 1);

                    self.refreshId = setInterval(self.avanzaPlay, self.interval);
                }

                self.playing = true;

                $(self.parentSelect+" .play").html('<img src="'+self.imgPath+self.pauseName+'" height="25" width="25">');

            }
            else
            {

                self.playing = false;

                $(self.parentSelect+" .play").html('<img src="'+self.imgPath+self.playName+'" height="25" width="25">');

            }

        });

        self.refreshId = setInterval(self.avanzaPlay, self.interval);

        // NOOOOO--> Condicion de carrera

        // Llamo al callback para la fecha de ahora [primer render]

        //this.callBack.call(this.nowDate.clone());


        // Bug del setInterval de javascript: Cuando me cambio de ventana, me paro

        window.addEventListener('blur', function() {
            self.playing = false;

            $(self.parentSelect+" .play").html('<img src="'+self.imgPath+self.playName+'" height="25" width="25">');

        });

    }

    self.init();

    return self;
}

