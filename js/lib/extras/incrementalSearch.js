var tdviz = tdviz || {'version':0.1, 'controller':{}, 'viz': {} ,'extras': {} };

tdviz.extras.incrementalSearch = function(options)
{
    var self = {};

    // Pillo los parametros como global vars

    // Pongo lo que me venga por opciones en el self

    for (key in options){
        self[key] = options[key];
    }

    self.parentSelect = "#" + self.parentId;


    self.init = function ()
    {

        console.log("inyectando el div de incrementalSearch en");
        console.log(self.parentSelect);

        var injectString =
            [
                        '<form id="'+self.formId+'">',
                             '<input class="textBox" id="searchSite" name="text" placeholder="'+self.captionText+'" type="text" value="">',
                             '<input type="submit" class="buttonBlock" value="Find">',
                         '</form>'
            ].join('\n');

        $(self.parentSelect).html(injectString);

        $("#"+self.formId).submit(function(){self.findCallBack($("#"+self.formId+" .textBox").val());return false;});


    }

    self.populate = function(valueList)
    {
               $( "#"+self.formId+" .textBox").autocomplete({
                    source: valueList
                });
    }

    self.init();

    return self;
}

