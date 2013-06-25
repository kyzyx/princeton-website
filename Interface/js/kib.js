// KIB is an array of kiblets, which are themselves arrays of kidgets, which are objects with name:value property pairs.
function newKiblet() {
    return {background:{}, kiblet:{}};
}

var Kib = function(s) {
    var kiblets = [newKiblet()];
    var name = s;
    var activeKiblet = 0;
    var activeWidget = 0;
    var that = {
        save: function() {
            return JSON.stringify(kiblets, null, 2);
        },
        load: function(ins) {
            kiblets = JSON.parse(ins);
        },
        getKiblets: function() { return kiblets; },
        getKiblet: function(i) { return kiblets[i]; },
        getActiveKiblet: function() { return activeKiblet; },
        getActiveWidget: function() { return activeWidget; },
        setActiveKiblet: function(i) { activeKiblet = i; activeWidget = 0; },
        setActiveWidget: function(i) { activeWidget = i; },
        deleteActiveKiblet: function() {
            kiblets.splice(activeKiblet, 1);
        },
    };
    // New KIB has one kiblet with background and kiblet settings
    return that;
};
