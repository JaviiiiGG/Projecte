'use strict';

let _bootstrapWindow = global.MonacoBootstrapWindow;
if (!_bootstrapWindow)
	_bootstrapWindow = require('../../../../bootstrap-window');

const _prev = _bootstrapWindow.load;

_bootstrapWindow.load = function(modulePaths, resultCallback, options) {

	let prevBeforeLoaderConfig = options.beforeLoaderConfig;
	options.beforeLoaderConfig = function(configuration, loaderConfig) {
		if (loaderConfig === undefined) {
			loaderConfig = configuration;
		}
		if (prevBeforeLoaderConfig && typeof prevBeforeLoaderConfig === 'function')
			prevBeforeLoaderConfig(configuration, loaderConfig);
		loaderConfig.amdModulesPattern = /^vs\/|^monkey-generated\//;
		loaderConfig.paths = {
			"monkey-generated" : "/opt/odoo/.vscode-server/data/User/globalStorage/iocave.monkey-patch/modules"
		};
		require.define("monkey-patch", {
			load: function (name, req, onload, config) {
				req([name], function (value) {
					req([], function() { 						
						onload(value); 
					}, function(error) {
						console.error(error);
						onload(value); 
					});
				});
			}
		});
	}
	if (modulePaths[0] == 'vs/workbench/workbench.main' ||
	    modulePaths[0] == 'vs/workbench/workbench.desktop.main') {
		modulePaths[0] = 'monkey-patch!' + modulePaths[0];
	}
	_prev(modulePaths, resultCallback, options);
};