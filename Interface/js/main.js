function require(script) {
    $.ajax({
        url: script,
        dataType: "script",
        async: false,
        success: function () {
        },
        error: function () {
            throw new Error("Could not load script " + script);
        }
    });
}

function init() {
    require("js/widgets/arc.js");
    require("js/widgets/hand.js");
    require("js/widgets/kiblet.js");
    require("js/widgets/bg.js");
    require("js/widgetsettings.js");
    return initPage();
}
