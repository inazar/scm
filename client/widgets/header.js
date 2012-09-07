// module:
//		client/widgets/header
define([
	"dojo/_base/declare",
	"app/config",
	"dojo/_base/config",
	// template
	"dojo/text!client/views/header.html",
	"dijit/form/Button",
	// declare templated widget
	"dijit/_WidgetBase",
	"dijit/_TemplatedMixin",
	"dijit/_WidgetsInTemplateMixin",
	// preload dependencies for template
	"dijit/form/Button"
], function (declare, config, dojoConfig, template, Button, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin) {
	// summary:
	//		Create application layout
	return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
		templateString: template,
		postCreate: function () {
			this.inherited(arguments);
			var self = this;
			// add language selection buttons
			for (var btn in config.locales) {
				(function (l, id) {
					new Button({
						title: self.nls.locales[l],
						label: '<img alt="'+self.nls.locales[l]+'" src="client/css/img/'+l+'.png"/>', 
						localeId: l,
						'class': 'flagButton',
						onClick: function () {
							if (dojoConfig.locale !== this.localeId) {
								self.setLocale(this.localeId);
							}
						}
					}).placeAt(self.languageChooser);
				})(btn, config.locales[btn]);
			}
		}
	});
});
