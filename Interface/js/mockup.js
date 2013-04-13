function initMockup() {
	//$('#bg_style_colorpicker').ColorPicker({flat:true});
	//$('#fg_colorpicker').ColorPicker({flat:true});
	for (var i = 1; i <= 8; ++i) {
		$('#widget'+i).button({icons: {primary: "icon_"+i}});
	}
	$('#bg_style_colorpicker').farbtastic();
	$('#fg_colorpicker').farbtastic();
	$('#bg_style_picker').buttonset();
	$('#kiblet_trigger').buttonset();
	$('#hands_visualization').buttonset();
	$('#arc_visualization').buttonset();
	$('#avatar_style_picker').buttonset();
	$('#widgetsettingscontainer').accordion();
	$('button.kiblet_save').button();
	$('button.kiblet_new').button();
	$('button.ki_save').button();
	$('#arc_discrete_slider').slider({
		value:0,
		min:0,
		max:6,
		step:1,
		slide: function(ev, ui) {
			$('#arc_discrete_label').html(ui.value==0?"Continuous":ui.value);
		}
	});
}
