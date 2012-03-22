/*
---
name: Fx.Step
description: "It ♥s Data"
requires: [Fx, Fx/CSS, Color/Color, ART]
provides: [Fx/Step]
...
*/

(function(){
    this.Visualization = new Class({
        data : {},
        element : null,
        options : {},
        nodes : {},
        initialize: function(element, options){
            if(!options && typeOf(element) == 'object'){
                options = element;
                delete element;
            }
            this.options = options;
            if(element) this.attach(element);
        },
        bind : function(data){
            this.data = data;
        },
        attach : function(element){
            this.element = document.id(element);
        },
    });
})();

