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
    markers: {},
    line:{},
    lineShape:{},
    closing:{},
    initialize: function(element, options){
        this.data = new Visualization.Sets();
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
            if(!options.node.create) options.node.create = function(node, name){
                var marker = new ART.Ellipse(options.node.size, options.node.size);
                marker.offset = options.node.size/2;
                marker.xa = node[options.x_axis];
                marker.ya = node[options.y_axis];
                marker.moveTo(this.xScale(marker.xa)-marker.offset, this.yScale(marker.ya)-marker.offset);
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
                if(!this.markers[name]) this.markers[name] = [];
                this.markers[name].push(marker);
                if(options.node.events && options.node.events.create) options.node.events.create(marker);
                return marker;
            }.bind(this);
        }
        this.parent(element, options);
    },
    node : function(seriesName, id){
        if(typeOf(id) == 'string'){
            var result = false;
            this.markers[seriesName].each(function(marker){ if(marker.id == id) result = marker; });
            return result;
        }else{ //by position
            return this.markers[seriesName][id];
        }
    },
    bind : function(data, name){
        if(data instanceof Visualization.Sets){
            this.data = data;
            this.data.eachSeries(function(series, name){
                this.createElements(series, name);
            }.bind(this));
        }else{
            this.data.add(name, data);
            this.createElements(data, name);
        }
    },
    makeDraggable : function(){
        var viz = this.element.getChildren()[0];
        var resize = function(){
            viz.setStyle('height', this.element.getStyle('height'));
            viz.setStyle('width', this.element.getStyle('width'));
            this.data.eachSeries(function(series, seriesName){
                this.lineShape[seriesName].repaint();
                this.markers[seriesName].each(function(marker){
                    marker.moveTo(this.xScale(marker.xa)-marker.offset, this.yScale(marker.ya)-marker.offset);
                }.bind(this))
            }.bind(this));
            this.update();
        }.bind(this);
        this.element.makeResizable({
            onDrag : resize,
            grid : 100
        });
    },
    createElements : function(data, name){
        this.redraw();
        data.addEvent('change', function(changes){
            changes = Array.from(changes);
            changes.each(function(item, changePosition){
                shape = this.node(name, changePosition);
                graph = this;
                var seriesName = name;
                var offset = this.options.node.size/2;
                var effect = new Fx.Step(shape, {
                    link : 'chain',
                    setter : function(x, y){
                        var position = graph.data.position(seriesName, item);
                        var thisShape = graph.node(seriesName, changePosition);
                        thisShape.centroidMoveTo(x, y);
                        if(position == 0) graph.line[seriesName].alterSegment(changePosition, ['M', x, y]);
                        else graph.line[seriesName].alterSegment(changePosition, ['L', x, y]);
                        graph.lineShape[seriesName].repaint();
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
        this.data.eachSeries(function(series, seriesName){
            //console.log('updating series '+seriesName);
            if(!this.line[seriesName]){
                this.line[seriesName] = new Visualization.MutablePath();
                //if(this.closing[seriesName]) this.line[seriesName].alterSegment(position, [ 'M', x, y ]);
                series.each(function(node, position){
                    var x = this.xScale(node[this.options.x_axis]);
                    var y = this.yScale(node[this.options.y_axis]);
                    if(position == 0) this.line[seriesName].alterSegment(position, [ 'M', x, y ]);
                    else this.line[seriesName].alterSegment(position, [ 'L', x, y ]);
                }.bind(this));
            }else{
                series.each(function(node, position){
                    var x = this.xScale(node[this.options.x_axis]);
                    var y = this.yScale(node[this.options.y_axis]);
                    if(position == 0) this.line[seriesName].alterSegment(position, [ 'M', x, y ]);
                    else this.line[seriesName].alterSegment(position, [ 'L', x, y ]);
                }.bind(this));
            }
            if(!this.lineShape[seriesName]){ //create
                this.lineShape[seriesName] = new ART.Shape(this.line[seriesName], size.x, size.y);
                this.lineShape[seriesName].element.setStyle('stroke-width', '2px');
                this.lineShape[seriesName].inject(this.art);
                if(this.options.events && this.options.events.create) this.options.events.create.bind(this)(this.lineShape[seriesName], this.line[seriesName]);
            }else{ //update
                this.lineShape[seriesName].repaint();
            }
        }.bind(this));
    },
    select : function(node){
    
    }
});
})();

