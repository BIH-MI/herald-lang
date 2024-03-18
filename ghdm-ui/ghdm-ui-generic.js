
// Generic Health Data Module (GHDM)
//
// Module: Utility and Helper Functions
// 
// Copyright (C) 2023-2024 - BIH Medical Informatics Group
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//       http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
/**
 * @module
 * ghdm-ui / Utility and Helper Functions
 */
 

/**
 * Helper function to append some string to the main GHDM content div.
 * @param {String} htmlString 
 */
function appendToMainDiv(htmlString) {
    let previousContent = document.getElementById("ghdmContent").innerHTML;
    document.getElementById("ghdmContent").innerHTML = previousContent + htmlString;
}


/**
 * Helper function to prepend some string to the main GHDM content div.
 * @param {String} htmlString 
 */
function prependToMainDiv(htmlString) {
    let previousContent = document.getElementById("ghdmContent").innerHTML;
    document.getElementById("ghdmContent").innerHTML = htmlString + previousContent;
}


/**
 * Initializes the cohort selection checkboxes
 */
function initCohortSelection(cohorts) {
    newHTML = `<div class="container full-width-container">
                <div class="row mt-3">
                    <div class="col-12">
                        <div class="d-flex justify-content-between">
							<label for="cohortSelect" class="form-label">Select cohort(s)</label>
                        </div>
                        <div class="d-flex flex-column position-relative border rounded">
                            <div id="cohortSelect" class="mb-3 my-2 mx-2"></div>
                        </div>
                    </div>
                 </div>
                </div>`;
    prependToMainDiv(newHTML);

    const cohortSelect = document.getElementById("cohortSelect");
	
	cohorts.forEach(cohort => {
	  const cohortName = cohort.label;
	    
	  	// Get the cohort select container
		const cohortSelect = document.getElementById('cohortSelect');
		
		// Create a new div element for the form-check
		const newDiv = document.createElement('div');
		newDiv.classList.add('form-check');
		
		// Create a new checkbox
		const newCheckbox = document.createElement('input');
		newCheckbox.classList.add('form-check-input');
		newCheckbox.type = 'checkbox';
		newCheckbox.value = cohortName;
		newCheckbox.checked = true;
		newCheckbox.id = cohortName;
		
		// Create a new label
		const newLabel = document.createElement('label');
		newLabel.classList.add('form-check-label');
		newLabel.htmlFor = cohortName;
		newLabel.textContent = cohortName;
		
		// Append the new checkbox and label to the div
		newDiv.appendChild(newCheckbox);
		newDiv.appendChild(newLabel);
		
		// Append the new div to the cohort select container
		cohortSelect.appendChild(newDiv);
	});

}



/**
 * Initializes tooltips
 */
function initGHDMUtils(cohorts, callback) {

	initCohortSelection(cohorts);

	if (callback) {
		callback();
	}
}


/**
 * Function returning a "no data" alert div
 * @returns 
 */
function createNoDataAlert() {
    let alert = document.createElement('div');
    alert.className = 'alert alert-primary';
    alert.role = 'alert';
    alert.innerHTML = '<h4 class="alert-heading">No or not enough data available</h4>' +
                      '<p>Make sure to specify (enough) observations and to select at least one cohort.</p>';
    return alert;
}


/**
 * Namespace object and export
 */
var GHDMUI = window.GHDMUI || {};
Object.assign(GHDMUI, {
  appendToMainDiv: appendToMainDiv,
  prependToMainDiv: prependToMainDiv,
  initGHDMUtils: initGHDMUtils,
  createNoDataAlert: createNoDataAlert
});
window.GHDMUI = GHDMUI;


