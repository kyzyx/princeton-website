// TODO: Kiblet property saving and updating
// TODO: Kiblet rearranging and deleting
// TODO: Kiblet autosaving and default deletes
var ORIGINAL_CELL_HEIGHT = 0;
function calcAccordionDivHeight() {
    var wsc = $('#widgetsettingscontainer');
    var buttonsheight = $('#widgetpicker').outerHeight() + $('#savebuttons').outerHeight();
    var hdrs = wsc.children('h3');
    var numFrames = hdrs.length;
    var headersheight = Math.max(hdrs.outerHeight(), hdrs.last().outerHeight());
    var padding = parseInt($('.widgetsettings').css('padding-top')) + parseInt($('.widgetsettings').css('padding-bottom')) + 30;
    var newheight = ORIGINAL_CELL_HEIGHT - buttonsheight - numFrames*headersheight - padding;
    return newheight;
}
function refreshAccordion() {
    var wsc = $('#widgetsettingscontainer');
    var state = wsc.accordion("option", "active");
    $('.widgetsettings').height(calcAccordionDivHeight());
    wsc.accordion('destroy').accordion();
    $('.widgetsettings').height(calcAccordionDivHeight());
    wsc.accordion('option', 'active', state);
    $('.widgetsettings').height(calcAccordionDivHeight());
}

function initWidgetSettings(widget, data) {
    var container = $('#' + widget.containerId);
    if (container.length == 0) {
        if (widget.type == 'widget') {
            $('#widgetsettingscontainer').append("<h3 class='widgetsettingheader' id='" + widget.containerId + "hdr'>" + widget.title + "</h3>");
            $('#widgetsettingscontainer').append(widget.settingsstr);
        } else if (widget.type == 'default') {
            $('#widgetsettingscontainer').prepend(widget.settingsstr);
            $('#widgetsettingscontainer').prepend("<h3 class='widgetsettingheader' id='" + widget.containerId + "hdr'>" + widget.title + "</h3>");
        }
        widget.activate();
    }
    // Refresh Accordion
    refreshAccordion();
    if (data) widget.loadSettings(data);
}

function removeWidgetSettings(widget, data) {
    var container = $('#' + widget.containerId);
    container.remove();
    $('#' + widget.containerId + 'hdr').remove();
    refreshAccordion();
}

function initWidgetButton(id, info) {
    $('#widgetpicker').append('<input type="checkbox" id="widget' + id + '"><label for="widget' + id + '"></label>');
    $('#widget'+id).button({icons: {primary: "icon_"+id}});
    $('#widget'+id).change({index:id},function() {
        var k = info.kib.getActiveKiblet();
        var kiblets = info.kib.getKiblets();
        if (this.checked) {
            info.widgets[id].reset(kiblets[k]);
            initWidgetSettings(info.widgets[id]);
            var ind = $('#widgetsettingscontainer').children().length/2 - 1;
            $('#widgetsettingscontainer').accordion("option", "active", ind);
        } else {
            info.widgets[id].remove(kiblets[k]);
            removeWidgetSettings(info.widgets[id]);
        }
    });
}

function saveCurrentKiblet(domwidgets, kib) {
    var ckiblet = kib.getKiblet(kib.getActiveKiblet());
    for (var x in ckiblet) {
        domwidgets[x].saveSettings(ckiblet);
    }
}

function createTimelineKiblet(i, dommanager) {
    var newelt = $(document.createElement("li"));
    newelt.addClass("timelinekiblet");
    var currkiblet = dommanager.kib.getKiblet(i);
    var title = "Kiblet " + i;
    if (currkiblet.kiblet.kiblet_name) title = currkiblet.kiblet.kiblet_name;
    else currkiblet.kiblet.kiblet_name = title;
    // TODO: Make this look better
    newelt.append('<input type="radio" name="timelinekiblets" id="timelinekiblet' + i + '"><label id = "timelinekiblet' + i + '_label" for="timelinekiblet' + i + '">' + title + '</label>');
    $("#timeline").append(newelt);
    $("#timelinekiblet" + i).change({index:i}, function(e) {
        if (this.checked) {
            saveCurrentKiblet(dommanager.widgets, dommanager.kib);
            var k = e.data.index;
            dommanager.kib.setActiveKiblet(k);
            dommanager.loadKibletSettings(dommanager.kib.getKiblet(k));
        }
    });
    $("#timelinekiblet" + i).button().disableSelection();
}
function addKibletsToTimeline(dommanager) {
    $("#timeline").empty();
    var kiblets = dommanager.kib.getKiblets();
    // TODO: Sort
    for (var i = 0; i < kiblets.length; ++i) {
        createTimelineKiblet(i, dommanager);
    }
    var curr = dommanager.kib.getActiveKiblet();
    $("#timelinekiblet" + curr).attr('checked', 'checked').button("refresh");
    
    /*$("#timeline").sortable({update: function(event, ui) {
        // FIXME: Change order in array
    }});
    $("#timeline").disableSelection();*/
}
        
var DomWidgetManager = function() {
    // Initialize data and widget objects
    var domwidgets = {
       'arc': ArcWidget,
       'hands': HandWidget, 
       'ball': BallWidget,
       'punch': PunchWidget,
       'clap': ClapWidget,
       'wave': WaveWidget,
       'body': BodyWidget,
       'background': BgWidget,
       'kiblet': KibletWidget
    };
    var kib = Kib("Untitled Kinect Instrument");
    ORIGINAL_CELL_HEIGHT = $('#widgetsettingscontainer').parents('td').first().height();

    // Initialize buttons
	$('button.kiblet_save').button();
	$('button.kiblet_new').button();
	$('button.kiblet_delete').button();
	$('button.kiblet_delete').button("disable");
	$('button.ki_save').button();
	$('#widgetsettingscontainer').accordion();
	$('#widgetsettingscontainer').mousedown(function() {
        saveCurrentKiblet(domwidgets, kib);
    });
    setInterval(function() {
        saveCurrentKiblet(domwidgets, kib);
    },100);


    var ret = {
        widgets: domwidgets, 
        kib: kib,
        loadKibletSettings: function(kiblet) {
            $('#widgetsettingscontainer').empty();
            for (var x in kiblet) {
                initWidgetSettings(domwidgets[x], kiblet);
            }
            $("#widgetpicker").children("input").each(function(ind, elt) {
                var el = $(elt);
                var id = el.attr('id').substring("widget".length);
                if (id in kiblet) el.attr('checked', 'checked');
                else el.attr('checked', false);
                el.button("refresh");
            });
        },
        loadKib: function() {
            addKibletsToTimeline(ret);
            ret.loadKibletSettings(ret.kib.getKiblet(ret.kib.getActiveKiblet()));
            if (ret.kib.getKiblets().length == 1) $("button.kiblet_delete").button('disable');
            else $("button.kiblet_delete").button('enable');
        },
    };
    ret.loadKib();
    // Initialize widget buttons
	for (var x in domwidgets) {
        if (x == 'background' || x == 'kiblet') continue;
        initWidgetButton(x, ret);
	}
    $("#timelinekiblet0").change();
    saveCurrentKiblet(domwidgets, kib);
    $('button.ki_save').click(function() {
        saveCurrentKiblet(domwidgets, kib);
        downloadfile(ret.kib.save());
    });
    $('button.kiblet_save').click(function() {
        saveCurrentKiblet(domwidgets, kib);
    });
    $('button.kiblet_delete').click(function() {
        ret.kib.deleteActiveKiblet();
        var k = ret.kib.getActiveKiblet();
        if (k >= ret.kib.getKiblets().length) {
            k -= 1;
            ret.kib.setActiveKiblet(k)
        }
        ret.loadKib();
        if (ret.kib.getKiblets().length == 1) $('button.kiblet_delete').button('disable');
    });
    $('button.kiblet_new').click(function() {
        $('button.kiblet_delete').button('enable');
        saveCurrentKiblet(domwidgets, kib);
        var kiblets = ret.kib.getKiblets();
        var curr = ret.kib.getActiveKiblet();
        kiblets.splice(curr+1,0,newKiblet())
        ret.kib.setActiveKiblet(curr+1);
        ret.loadKib();
    });
    return ret;
};

function downloadfile(str) {
    var uricontent = "data:text/plain," + encodeURIComponent(str);
    var dl = window.open(uricontent, "KIB Data");
}
