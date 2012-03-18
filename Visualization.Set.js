/*
---
name: Fx.Step
description: "It ♥s ART, over time"
requires: [Fx, Fx/CSS, Color/Color, ART]
provides: [Fx/Step]
...
*/

(function(){
    Visualization.Set = new Class({
        data : [],
        groupings : {},
        listeners : {
            'change' : [],
            'add' : [],
            'remove' : [],
            'ready' : []
        },
        cache : {},
        initialize : function(data){
            if(data) this.add(data);
        },
        addEvent : function(type, callback){
            if(!this.listeners[type]) throw('Unsupported event type: '+type);
            this.listeners[type].push(callback);
        },
        position : function(id){
            if(typeOf(id) == 'object') id = id.id;
            var result = false;
            this.data.each(function(item, position){
                if(item.id == id) result = position;
            });
            return result;
        },
        order : function(axis, direction){
            if(!direction) direction ='';
            if(this.data.length == 0) return;
            if(!(this.data[0] && this.data[0][axis])) throw('cannot sort on invalid axis');
            switch(direction.toLowerCase()){
                case 'descending':
                case 'descending':
                    direction = Array.DESCENDING;
                    break;
                case 'ascending':
                case 'asc':
                default:
                    direction = 0;
                    
            }
            if(typeOf(this.data[0][axis]) == 'number') this.data.sortOn(axis, Array.NUMERIC | direction);
            else this.data.sortOn(axis, Array.CASEINSENSITIVE | direction);
            this.listeners.change.each(function(listener){ listener(this.data); }.bind(this));
        },
        minimum : function(axis){
            if(!(this.cache[axis] && this.cache[axis].min)){
                var min = false;
                if(!this.cache[axis]) this.cache[axis] = {};
                this.data.each(function(item){
                    if((!min) || item[axis] < min) min = item[axis];
                });
                this.cache[axis].min = min;
            }
            return this.cache[axis].min;
        },
        maximum : function(axis){
            if(!(this.cache[axis] && this.cache[axis].max)){
                var max = false;
                if(!this.cache[axis]) this.cache[axis] = {};
                this.data.each(function(item){
                    if((!max) || item[axis] > max) max = item[axis];
                });
                this.cache[axis].max = max;
            }
            return this.cache[axis].max;
        },
        alter: function(item, position){
            var func = function(item, position){
                //console.log(['altering', item]);
                if( (!position) && (!item.id) ) throw('no identifier: ambiguous node alter!');
                if(!position) position = this.position(item.id);
                //delete item.id;
                Object.each(item, function(value, key){
                    //console.log(['set', key, value]);
                    this.data[position][key] = value;
                }.bind(this));
            }.bind(this);
            if(typeOf(item) == 'array'){
                //console.log(['AAA', item]);
                item.each(function(obj){
                    func(obj);
                });
            }else func(item, position);
            this.listeners.change.each(function(listener){ listener(this.data[position]); }.bind(this));
        },
        uuid: function(){
            var s = [], itoh = '0123456789ABCDEF';
            for (var i = 0; i <36; i++) s[i] = Math.floor(Math.random()*0x10);
            s[14] = 4; s[19] = (s[19] & 0x3) | 0x8;
            for (var i = 0; i <36; i++) s[i] = itoh[s[i]];
            s[8] = s[13] = s[18] = s[23] = '-';
            return s.join('');
        },
        add: function(item){
            if(typeOf(item) == 'array'){
                item.each(function(member){
                    if(!member.id) member.id = this.uuid();
                    this.data.push(member);
                    
                }.bind(this));
            }else{
                if(!item.id) item.id = this.uuid();
                this.data.push(item);
            }
            this.listeners.add.each(function(listener){ listener(item); });
            this.listeners.change.each(function(listener){ listener(item); });
        },
        remove: function(item){
            if(typeOf(item) == 'array'){
                item.each(function(member){
                    this.data.remove(member);
                }.bind(this));
            }else{
                this.data.remove(item);
            }
            this.listeners.remove.each(function(listener){ listener(item); });
            this.listeners.change.each(function(listener){ listener(item); });
        }
    });
})();

