define([
	"app/ctrls/translate!admin",
	"dgrid/OnDemandGrid",
	"client/widgets/grid/button"
], function(__, Grid, button) {

	return function(params, srcNodeRef) {
		var access = params.access || {};
		if (access && access['get']) {
			if (access['put']) {
				params.columns.push(button({
					label: '<div class="sprites editSprite"/>',
					title: __('edit'),
					'class': 'controlButton',
					field: 'controlButton',
					sortable: false
				}));
			}
			if (access['delete']) {
				params.columns.push(button({
					label: '<div class="sprites deleteSprite"/>',
					title: __('delete'),
					'class': 'controlButton',
					field: 'controlButton',
					sortable: false
				}));
			}
		} else params = { store: false, columns: [{ label: __("You are not authorized to view this") }]};	
		return new Grid(params, srcNodeRef);	
	};
});