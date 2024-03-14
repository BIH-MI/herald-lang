
/**
 * @module
 * CrossSectionalAnalaysisPlugin / Entry Point and Execution Logic
 */


/**
 * Loads all scripts needed for the plugin
 */
function ghdmLoadScripts(callback) {
	
	loadScripts([	// External
					'libs/popper.min.js',
					'libs/bootstrap.min.js',
					'libs/d3.v7.min.js',
					'libs/html2canvas.min.js',
					'libs/jquery-3.6.0.min.js',
					'libs/jspdf.umd.min.js',
					'libs/jstat.min.js',
					'libs/plotly-latest.min.js',
					'libs/query-builder.standalone.min.js',
					'libs/sql-parser.min.js',
					'libs/flatpickr.js',
					'libs/moo.min.js',
					'libs/nearley.min.js',

					// Internal (Do not change the order!)
					'ghdm-data/ghdm-data-model.js',
					'ghdm-data/ghdm-data-wrangling.js',

					'ghdm-ui/ghdm-ui-generic.js',
					'ghdm-ui/ghdm-ui-modals.js',
					
					'herald-logic/herald-lexer.js',
					'herald-logic/herald-grammar.js',
					'herald-logic/herald-interpreter.js',
					
					'herald-ui/herald-ui-fields.js',
					'herald-ui/herald-ui-generic.js',
					'herald-ui/herald-ui-binding.js',
					'herald-ui/herald-ui-editor.js',
					
					'analytics-demo/ghdm-render-comparison.js',
					'analytics-demo/ghdm-render-description.js',
					'analytics-demo/ghdm-render-quality.js',
					'analytics-demo/ghdm-render-scatter.js',
					'analytics-demo/ghdm-render-time-to-event.js'
				], callback);
}

/**
 * Loads all styles needed for the plugin
 */
function ghdmLoadStyles(callback) {
	
	loadStyles([// External
				'libs/bootstrap.min.css',
				'libs/query-builder.default.min.css',
				'libs/flatpickr.min.css',
				// Internal
				'ghdm-ui/ghdm-styles.css',
				'herald-ui/herald-query-builder-styles.css',
                'herald-ui/herald-selection-styles.css'
				], callback);
}

/**
 * Loads content needed for the plugin
 */
function ghdmLoadContent(callback) {
	fetch("analytics-content.html" /*, options */)
	  .then((response) => response.text())
	  .then((html) => {
		let previousContent = document.getElementById("ghdmContent").innerHTML;
		document.getElementById("ghdmContent").innerHTML = previousContent + html;
	    if (callback) {
	    	callback();
	    }
	  })
	  .catch((error) => {
	    console.warn(error);
	  });
}


/**
 * Main entry point of the plugin
 */
function pluginMain(cohorts) {

	GHDMUI.initGHDMUtils(cohorts, () => 
		HeraldUI.initializeHeraldUI(cohorts, () => 
			pluginVisualize(cohorts)
		)
	);

}


function pluginVisualize(cohorts) {
	// Handle visualize
	document.getElementById("visualize").addEventListener("click", (event) => {
	
		// Get selected cohorts
		const checkedBoxes = document.querySelectorAll('#cohortSelect .form-check-input:checked');
		const selectedCohorts = Array.from(checkedBoxes).map(checkbox => checkbox.value);
		const includeAge = document.getElementById("ageCheckbox").checked;
	    const includeSex = document.getElementById("sexCheckbox").checked;
	
		// Prevent colors from being removed immediately
		event.stopPropagation();

		// Run test
		let tables = HeraldUI.checkSpecBuildTables(cohorts);

        // Check
		let dataAvailable = tables !== null && tables !== undefined && tables.length > 0;
		let minColumns = 1;
		if (includeAge) minColumns++;
		if (includeSex) minColumns++;
		for (table of tables) {
			dataAvailable = dataAvailable && table !== null && table !== undefined && table.length > 1 && table[0].length > minColumns;
		}

		// Warn and stop
		if (!dataAvailable) {
			
			// Clear
			const outputDiv = document.getElementById("output");
			outputDiv.innerHTML = "";

			// Warning
			outputDiv.appendChild(GHDMUI.createNoDataAlert());

			// Break
			return;
		}

		// Get selected visualization
		const selectedVisualization = document.querySelector('#visualizationSelect .form-check-input:checked').value;
	
		// Visualize
	    if (selectedVisualization === "description") {
		  renderDescriptiveStatistics(selectedCohorts, tables, "output");
	    } else if (selectedVisualization === "time-to-event") {
		  renderTimeToEvent(selectedCohorts, tables, "output");
	    } else if (selectedVisualization === "comparison") {
		  renderComparison(selectedCohorts, tables, "output");
	    } else if (selectedVisualization === "quality") {
		  renderQualityReport(selectedCohorts, tables, "output");
		} else if (selectedVisualization === "scatter") {
		  renderScatterPlots(selectedCohorts, tables, "output");
		}

	});
}
