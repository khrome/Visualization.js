/*
---
name: Fx.Step
description: "It ♥s ART, over time"
requires: [Fx, Fx/CSS, Color/Color, ART]
provides: [Fx/Step]
...
*/

(function(){

Visualization.LineChart = new Class({
    Extends : Visualization.TwoAxis,
    markers: [],
    initialize: function(element, options){
        if(!options) options = {};
        if(!options.x_axis) options.x_axis = 'x';
        if(!options.y_axis) options.y_axis = 'y';
        this.parent(element, options);
        var size = element.getSize();
        var art = new ART(size.x, size.y);
        art.inject(element);
        this.art = art;
        if(options.node){
            if(!options.node.size) options.node.size = 8;
            if(!options.node.mouseover_scale) options.node.mouseover_scale = 2;
            if(!options.node.create) options.node.create = function(node){
                var marker = new ART.Ellipse(options.node.size, options.node.size);
                var offset = options.node.size/2;
                marker.move(this.xScale(node[options.x_axis])-offset, this.yScale(node[options.y_axis])-offset);
                marker.inject(art);
                marker.element.setAttribute('class', 'node');
                marker.element.addEvent('click', function(){
                    if(options.node.events && options.node.events.mouseout) options.node.events.mouseout(marker);
                }.bind(this));
                marker.element.addEvent('mouseover', function(){
                    if(options.node.events && options.node.events.mouseover) options.node.events.mouseover(marker);
                }.bind(this));
                marker.element.addEvent('mouseout', function(){
                    if(options.node.events && options.node.events.mouseout) options.node.events.mouseout(marker);
                }.bind(this));
                marker.id = node.id;
                this.markers.push(marker);
                if(options.node.events && options.node.events.create) options.node.events.create(marker);
                return marker;
            }.bind(this);
        }
        this.parent(element, options);
    },
    node : function(id){
        if(typeOf(id)== 'string'){
            var result = false;
            this.markers.each(function(marker){ if(marker.id == id) result = marker; });
            return result;
        }else{ //by position
            return this.markers[id];
        }
    },
    bind : function(seriesName, data){
        this.data[seriesName] = data;
        this.redraw();
        data.addEvent('change', function(changes){
            changes = Array.from(changes);
            changes.each(function(item, changePosition){
                shape = this.node(changePosition);
                graph = this;
                var offset = this.options.node.size/2;
                var effect = new Fx.Step(shape, {
                    link : 'chain',
                    setter : function(x, y){
                        var position = graph.data.position(item);
                        var thisShape = graph.node(position);
                        thisShape.centroidMoveTo(x, y);
                        if(position == 0) graph.line.alterSegment(position, ['M', x, y]);
                        else graph.line.alterSegment(position, ['L', x, y]);
                        graph.lineShape.repaint();
                    },
                    args : ['x', 'y']
                });
                effect.start(
                    {x:shape.x, y:shape.y}, 
                    {x:(this.xScale(item.x)), y:(this.yScale(item.y))}
                );
                this.redraw();
            }.bind(this));
        }.bind(this));
    },
    update : function(){ //global draw elements for the graph
        this.parent();
        var size = this.element.getSize();
        this.data.each(function(series){
            if(!this.line[series]){
                this.line[series] = new Visualization.MutablePath();
                series.data.each(function(node, position){
                    if(position == 0) this.line.alterSegment(position, [
                        'M', 
                        this.xScale(node[this.options.x_axis]), 
                        this.yScale(node[this.options.y_axis])
                    ]);
                    else this.line.alterSegment(position, [
                        'L', 
                        this.xScale(node[this.options.x_axis]), 
                        this.yScale(node[this.options.y_axis])
                    ]);
                }.bind(this));
            }
            if(!this.lineShape[series]){ //create
                this.lineShape[series] = new ART.Shape(this.line, size.x, size.y);
                this.lineShape[series].inject(this.art);
                if(this.options.events && this.options.events.create) this.options.events.create.bind(this)();
            }else{ //update
                this.lineShape[series].repaint();
            }
        }.bind(this));
    },
    select : function(node){
    
    }
});
})();

