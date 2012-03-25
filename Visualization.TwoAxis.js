/*
---
name: Fx.Step
description: "It ♥s ART, over time"
requires: [Fx, Fx/CSS, Color/Color, ART]
provides: [Fx/Step]
...
*/

(function(){
    function makeLine(x1, y1, x2, y2){
        var path = new Visualization.MutablePath();
        path.moveTo(x1, y1);
        path.lineTo(x2, y2);
        var result = new ART.Shape(path);
        result.element.setStyle('stroke', '#737477');
        result.element.setStyle('fill', 'none');
        return result;
    }
    Visualization.TwoAxis = new Class({
        Extends : Visualization,
        graduations : {vertical:{}, horizontal:{}},
        initialize: function(element, options){
            if(!options.rightPadding) options.rightPadding = 10;
            if(!options.leftPadding) options.leftPadding = 10;
            if(!options.topPadding) options.topPadding = 10;
            if(!options.bottomPadding) options.bottomPadding = 10;
            this.parent(element, options);
            this.data.minimum = function(){
                var res;
                Object.each(this.data, function(currentSet, setName){
                    var value = currentSet.minimum();
                    if(res < value) value = res;
                });
                return res;
            };
            this.data.maximum = function(){
                var res;
                Object.each(this.data, function(currentSet, setName){
                    var value = currentSet.maximum();
                    if(res < value) value = res;
                });
                return res;
            };
        },
        computeBoundaries : function(){
            
        },
        bind : function(data){
            this.data = data;
            this.redraw();
        },
        xScale : function(x){
            var x_min = this.data.minimum('x');
            var x_max = this.data.maximum('x');
            var range = x_max - x_min;
            var padSize = this.options.leftPadding + this.options.rightPadding;
            var result = this.options.leftPadding + (x-x_min)*((this.element.getSize().x-padSize)/range);
            return result;
        },
        yScale : function(y){
            var y_min = this.data.minimum('y');
            var y_max = this.data.maximum('y');
            var range = y_max - y_min;
            var padSize = this.options.topPadding + this.options.bottomPadding;
            var result = this.options.topPadding + (y-y_min)*((this.element.getSize().y-padSize)/range);
            return result;
        },
        redraw : function(){
            this.update();
            if( this.data instanceof Visualization.Sets){
                this.data.eachSeries(function(series, seriesName){
                    series.each(function(item, index){
                        if(this.options.node) 
                            if(!this.nodes[seriesName]) this.nodes[seriesName] = [];
                            if(!this.nodes[seriesName][index]) this.nodes[seriesName][index] = this.options.node.create(item, seriesName);
                    }.bind(this));
                }.bind(this));
            }else{
                this.data.data.each(function(item, position){
                    if(this.options.node && !this.nodes[position]){
                        this.nodes[position] = this.options.node.create(item);
                    }
                }.bind(this));
            }
        },
        update : function(){ //global draw elements for the graph
            var x_min = this.data.minimum('x');
            var x_max = this.data.maximum('x');
            var y_min = this.data.minimum('y');
            var y_max = this.data.maximum('y');
            var segments = 8;
            if(
                ( (!this.xMin) || x_min < this.xMin) ||
                ( (!this.yMin) || y_min < this.yMin) ||
                ( (!this.xMax) || x_max > this.xMax) ||
                ( (!this.yMax) || y_max > this.yMax)
            ){
                var horizontal_range = x_max - x_min;
                var horizontal_padding = this.options.leftPadding + this.options.rightPadding;
                var vertical_range = y_max - y_min;
                var vertical_padding = this.options.topPadding + this.options.bottomPadding;
                horizontal_increment = ((horizontal_range)*((this.element.getSize().x-horizontal_padding)/horizontal_range))/(segments-1);
                horizontal_max = this.options.leftPadding + segments * horizontal_increment;
                vertical_increment = ((vertical_range)*((this.element.getSize().y-vertical_padding)/vertical_range))/(segments-1);
                vertical_max = this.options.topPadding + segments * vertical_increment;
                for(var lcv=0; lcv < segments; lcv++){
                    var x = this.options.leftPadding + lcv * horizontal_increment;
                    var y = this.options.topPadding + lcv * vertical_increment;
                    var horizontal_line, vertical_line;
                    if(!this.graduations.horizontal[lcv]){
                        horizontal_line = (makeLine(this.options.leftPadding, y, this.xScale(x_max), y));
                        horizontal_line.inject(this.art);
                        this.graduations.horizontal[lcv] = horizontal_line;
                    }else{
                        //alter
                        this.graduations.horizontal[lcv].path.alterSegment(0, ['M', this.options.leftPadding, y]);
                        this.graduations.horizontal[lcv].path.alterSegment(1, ['L', this.xScale(x_max), y]);
                        this.graduations.horizontal[lcv].repaint();
                    }
                    if(!this.graduations.vertical[lcv]){
                        vertical_line = (makeLine(x, this.options.topPadding, x, this.yScale(y_max)));
                        vertical_line.inject(this.art);
                        this.graduations.vertical[lcv] = vertical_line;
                    }else{
                        //alter
                        this.graduations.vertical[lcv].path.alterSegment(0, ['M', x, this.options.topPadding]);
                        this.graduations.vertical[lcv].path.alterSegment(1, ['L', x, this.yScale(y_max)]);
                        this.graduations.vertical[lcv].repaint();
                    }
                }
                this.xMin = x_min;
                this.yMin = y_min;
                this.xMax = x_max;
                this.yMax = y_max;
            }
        }
    });
})();

