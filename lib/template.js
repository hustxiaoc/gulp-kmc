/**
 * @fileoverview
 * @author 淘杰<taojie.hjp@taobao.com>
 * @module SimpleTemplate
 **/

var EMPTY = '',
    ENTER_REG_EXP=/\\n/g;
/**
 *
 * @class SimpleTemplate
 * @constructor
 * @extends Base
 */

var default_config={
    left:"<%",
    right:"%>"
};


function SimpleTemplate(options,helper) {
    return this instanceof SimpleTemplate?this.init.apply(this,arguments):new SimpleTemplate(options,helper);
}

SimpleTemplate.parse = function() {
    var self = this,
        temp,
        i = 0,
        cached_regexp = this.cached_regexp;

    if(this.right == "}}") {
        temp = self.tpl.replace(/(}})([^}])/g,"$1 $2").split(cached_regexp.split_1);
    }else{
        temp = this.tpl.split(cached_regexp.split);
    }

    temp
    .filter(function(v) {
        v = v && v.trim();
        return v && !(cached_regexp.right).test(v);
    })
    .forEach(function(v) {
        if(cached_regexp.left.test(v)) {
            v = v.replace(/@/g,'__data.');
            if(cached_regexp.left_equal.test(v)) {
                self.body.push(v.replace(cached_regexp.left_replace,'\ttemp.push($1);\n').replace(ENTER_REG_EXP,''));
            } else {
                self.body.push(v.replace(cached_regexp.left_replace_1,'$1\n').replace(ENTER_REG_EXP,''));
            }
        }
        else {
            self.__lines[i] = v;
            self.body.push('\ttemp.push(self.__lines['+(i++)+']);\n');
        }
    });
    return this.body.join("");
};

SimpleTemplate.prototype =  {
    init: function(options,helper) {
        if(typeof options == "string") {
            var tpl = options;
            options = {
                tpl : tpl
            }
        };

        this.tpl = options.tpl;
        this.left = options.left||default_config.left;
        this.right = options.right||default_config.right;
        this.body = [];
        this.__lines = {};
        this.compiled = null;
        this.data = options.data||{};
        this.helper = helper;
        this.cached_regexp = {
            'split': new RegExp('(?='+this.left+')|('+this.right+')'),
            'split_1': new RegExp('(?='+this.left+')|(}})(?:[^}])'),
            'left': new RegExp('^'+this.left),
            'left_equal': new RegExp('^'+this.left+'\\s*='),
            'left_replace': new RegExp('^'+this.left+'\\s*=(.*)'),
            'left_replace_1': new RegExp('^'+this.left+'\\s*(.*)'),
            'right': new RegExp(this.right)
        };
    },
    compile:function() {
        if(!this.compiled) {
            var helpers = [],
                helper = this.helper;

            if(this.helper) {
                for(var h in helper) {
                    if(helper.hasOwnProperty(h) && typeof helper[h] == "function") {
                        helpers.push('var '+h+'=self.helper["'+h+'"]');
                    }
                }
            }
            this.compiled = new Function("__data",helpers.join(";")+';__data = __data||{};var self = this,temp=[];\nwith(__data){'+SimpleTemplate.parse.call(this)+'}\n return temp.join("");');
        }
        return this.compiled;
    },
    render:function(data) {
        return this.compile().call(this,data);
    }
};


module.exports = SimpleTemplate;

