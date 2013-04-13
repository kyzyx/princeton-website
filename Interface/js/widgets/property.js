var SliderProperty = function(prefix, lbl, min, max, onslide) {
    var id = prefix;
    var label = lbl;
    var that = {
        update: function(v) {
            v = (v>=min && v <= max)?v:min;
            $('#' + id).slider({
                value:v,
                min:min,
                max:max,
                step:1,
                slide: onslide
            });
            if (onslide) onslide(null,{value:v});
        },
        getHtml: function() {
            return "<div class='setting'>" + label + "<div id='" + id + "' width=200px>" +
		        "</div><span id='" + id + "_label'>" + min + "</span></div>";
        },
        getValue: function() {
            return $('#' + id).slider("value");
        },
        id: id,
    };
    return that;
};
var TextProperty = function(prefix, lbl, def, change) {
    var id = prefix;
    var label = lbl;
    var that = {
        update: function(v) {
            $("#" + id).val(v || def);
            if (change) $("#" + id).change(change);
        },
        getHtml: function() {
            return "<div class='setting'><label id='" + id + "_label' for='" + id + "'>" + label + "</label><br><input type='text' id='" + id + "' value='" + def + "' /></div>";
        },
        getValue: function() {
            return $("#" + id).val();
        },
        id: id,
    };
    return that;
};
var ColorProperty = function(prefix, lbl, def, change, num) {
    var id = prefix;
    var label = lbl;
    var n = num?num:1;
    var that = {
        update: function(v) {
            if (v) {
                var colors = v.split(" ");
                for (var i = 0; i < n; ++i) {
                    $.farbtastic('#' + id + i, change?change:null).setColor(colors[i]);
                }
            } else {
                for (var i = 0; i < n; ++i) {
                    $.farbtastic('#' + id + i, change?change:null).setColor(def);
                }
            }
        },
        getHtml: function() {
            var ret = "<div class='setting'>" + label + "<br><table><tr>";
            for (var i = 0; i < n; ++i) {
                ret += "<td><div id='" + id + i + "'></div></td>";
            }
            return ret + "</tr></table></div>";
        },
        getValue: function(i) {
            if (i >= 0 && i < n) {
                return $.farbtastic('#' + id + i).color;
            } else {
                var ret = "";
                for (var i = 0; i < n; ++i) {
                    ret += $.farbtastic('#' + id + i).color + " ";
                }
                return ret;
            }
        },
        id: id,
    };
    return that;
};
var SelectProperty = function(prefix, lbl, choices) {
    var id = prefix;
    var label = lbl;
    var that = {
        update: function(v) {
            if (v) $("#" + v).attr('checked', 'checked');
            $("#" + id).buttonset();
            for (var i = 0; i < choices.length; ++i) {
                if (choices[i].change) {
                    $('#' + choices[i].id).change({id:id}, choices[i].change);
                }
            }
        },
        getHtml: function() {
            var ret = "<div class='setting'>" + label + "<br><span id='" + id + "'>";
            for (var i = 0; i < choices.length; ++i) {
                ret += "<input type='radio' " + (i?'':"checked ") + "id='" + choices[i].id + "' name='" + id + "_radio'/><label id = '" + choices[i].id + "_label' for='" + choices[i].id + "'>" + choices[i].label + "</label>";
            }
            ret += "</span></div>";
            return ret;
        },
        getValue: function() {
            return $('input[name=' + id + '_radio]:checked').attr('id');
        },
        id: id,
    };
    return that;
};
