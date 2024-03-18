// Human-Centric Extraction for Research and Analysis of Longitudinal Data (HERALD)
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
 * herald-ui / Utility and Helper Functions
 */

/**
 * Registers an event listener for the auto-complete feature in field boxes
 */
function addListenerAutocomplete() {
	document.addEventListener("keydown", async function (event) {
			
		// Define key combination for triggering auto-complete
		const triggerKeyCombination = {
			code : "Space",
			ctrlKey: true
		};
		
		// Check if the key combination is pressed and the target element has the specified class
		if (event.code === triggerKeyCombination.code &&
			event.ctrlKey === triggerKeyCombination.ctrlKey &&
			event.target.classList.contains("herald-auto-complete")) {
			event.preventDefault(); // Prevent the default action (inserting a space)
			
			// Open modal
			const {value, field} = await HeraldUI.openFieldSelectionModal();

			// if value set
			if (value && field) {
				// Text to set
				let text = field + ' = "' + value.replace(/"/g, '\\"') + '"';
				// Get the current cursor position
				const startPos = event.target.selectionStart;
				const endPos = event.target.selectionEnd;
				// Insert the text at the cursor position
				event.target.value = event.target.value.substring(0, startPos) + text + event.target.value.substring(endPos);
				// Set the cursor position after the inserted text
				event.target.selectionStart = event.target.selectionEnd = startPos + text.length;
				event.target.focus();
			}
		}
	});
}


/**
 * Registers event listeners to show and hide the tool-tip for autocomplete fields
 */
function addListenerTooltip() {
    let tooltipTimeout;
	document.addEventListener('focusin', (event) => {
		if (event.target.classList.contains('herald-auto-complete')) {
			let tooltipInstance = new bootstrap.Tooltip(event.target, {
				title: 'Press [Ctrl + Space] for auto-complete',
				placement: 'bottom',
				customClass: 'tooltip-nowrap',
				trigger: 'focus'
			});
			tooltipInstance.show();

			// Automatically hide the tooltip after 3 seconds
			tooltipTimeout = setTimeout(() => {
				if (tooltipInstance) {
					tooltipInstance.dispose();
				}
			}, 3000);
		}
	});

	// Event listener: Hide tool-tip for autocomplete fields
	document.addEventListener('focusout', (event) => {
		if (event.target.classList.contains('herald-auto-complete')) {
			let tooltipInstance = bootstrap.Tooltip.getInstance(event.target);
			if (tooltipInstance) {
				tooltipInstance.dispose();
				if (tooltipTimeout) {
					clearTimeout(tooltipTimeout);
				}
			}
		}
	});
}


/**
 * Registers an event listener for the query action menu and its items.
 */
function addListenerQueryAction() {
    document.addEventListener('click', async function(event) {

		// Only actions for herald queries
		if (!event.target.classList.contains('herald-query-action')) {
		  return;
		}
	  
		// Get the action from the data attribute
		const action = event.target.getAttribute('data-action');
		// Find the closest ancestor with the 'heraldQueryRow' class
		const queryRow = event.target.closest('.heraldQueryRow');
		// Check
		if (!queryRow) {
		  return;
		}
	  
		// Elements
		const labelInput = queryRow.querySelector('.heraldQueryLabel');
		const queryInput = queryRow.querySelector('.heraldQuery');

		// Implement different actions for row
		switch (action) {
		  case 'editor':
			const {name, query} = await HeraldUI.showHeraldQueryModal(labelInput.value, queryInput.value);
			if (name && query) {
				labelInput.value = name;
				queryInput.value = query;
			}
			break;
		  case 'up':
			const previousRow = queryRow.previousElementSibling;
			if (previousRow) {
			  queryRow.parentNode.insertBefore(queryRow, previousRow);
			} 
			break;
		  case 'down':
			const nextRow = queryRow.nextElementSibling;
			if (nextRow) {
				queryRow.parentNode.insertBefore(nextRow, queryRow);
			}
			break;
		  case 'clear':
			labelInput.value = '';
			queryInput.value = '';
			break;
		  case 'delete':
			const allRows = document.querySelectorAll('.heraldQueryRow');
			if (allRows.length > 1) {
			  queryRow.remove();
			}
			break;
		  case 'clone':
			const clonedRow = queryRow.cloneNode(true);
			clonedRow.querySelector('.heraldQueryLabel').value = "C" + queryRow.querySelector('.heraldQueryLabel').value;
  			queryRow.parentNode.insertBefore(clonedRow, queryRow.nextSibling);
			break;
		  default:
			console.error(`Unknown action: ${action}`);
		}
    });
}


/**
 * Registers an event listener for the quick add function.
 */
function addListenerQuickAdd() {
	document.addEventListener('click', async function(event) {

		// Only actions for herald queries
		if (!event.target.classList.contains('herald-quick-add')) {
		  return;
		}
	  
		// Get the keyword from the data attribute
		const keyword = event.target.getAttribute('data-action');
		
		// Open modal
	    const {value, field} = await HeraldUI.openFieldSelectionModal();
		if (value && field) {

			// Find the closest ancestor with the 'heraldQueryRow' class
			const queryRow = document.querySelector('.heraldQueryRow:last-child');

			// Get labels
			let labelInput = queryRow.querySelector('.heraldQueryLabel');
			let queryInput = queryRow.querySelector('.heraldQuery');

			// Check if both inputs are empty
			if (labelInput.value.trim() !== '' || queryInput.textContent.trim() !== '') {

				// If not, clone the row
				const clonedRow = queryRow.cloneNode(true);
				clonedRow.querySelector('.heraldQueryLabel').value = "C" + labelInput.value;
				queryRow.parentNode.insertBefore(clonedRow, queryRow.nextSibling);

				// Update the labelInput and queryInput to the ones in the cloned row
				labelInput = clonedRow.querySelector('.heraldQueryLabel');
				queryInput = clonedRow.querySelector('.heraldQuery');
			}

			// Assign
			let query = keyword + ' (' + field + ' = "' + value.replace(/"/g, '\\"') + '")';
			labelInput.value = HeraldUI.renderQueryName(query);
			queryInput.value = query;
		}
    });

}


/**
 * Function to build the cross-sectional table and highlight query status in the UI
 */
function checkSpecBuildTables(cohorts) {

    // Get selected cohorts
    const checkedBoxes = document.querySelectorAll('#cohortSelect .form-check-input:checked');
    const selectedCohorts = Array.from(checkedBoxes).map(checkbox => checkbox.value);

    // Prepare
    const queryRows = document.querySelectorAll('.heraldQueryRow');
    const observationLabels = [];
    const observationQueries = [];
    const observationLabelsInput = [];
    const observationQueriesInput = [];
    const includeAge = document.getElementById("ageCheckbox").checked;
    const includeSex = document.getElementById("sexCheckbox").checked;
    
    // Collect info
    queryRows.forEach((queryRow) => {
        observationLabelsInput.push(queryRow.querySelector('.heraldQueryLabel'));
        observationQueriesInput.push(queryRow.querySelector('.heraldQuery'));
        observationLabels.push(queryRow.querySelector('.heraldQueryLabel').value);
        observationQueries.push(queryRow.querySelector('.heraldQuery').value);
    });

    // Execute
    let {tables, labelSuccesses, querySuccesses} = GHDM.getCrossSectionalTables(cohorts, 
                                                                            selectedCohorts, 
                                                                            includeAge,
                                                                            includeSex,
                                                                            observationLabels,
                                                                            observationQueries);

    // Mark input fields
    for (let i = 0; i < labelSuccesses.length; i++) {
        if (labelSuccesses[i]) {
            observationLabelsInput[i].classList.add('border-green');
        } else {
            observationLabelsInput[i].classList.add('border-red');
        }
        if (querySuccesses[i]) {
            observationQueriesInput[i].classList.add('border-green');
        } else {
            observationQueriesInput[i].classList.add('border-red');
        }
    }

    // Done
    return tables;

}


/**
 * Initializes the Herald query boxes and its functions
 */
function initHeraldQueryBoxes(cohorts) {

    // Reset input borders
    function removeColoredBorders(inputs) {
        const colors = ['border-green', 'border-orange', 'border-red'];
        inputs.forEach(input => {
            colors.forEach(color => {
                input.classList.remove(color);
            });
        });
    }
    // Event listener for input borders
    window.addEventListener('click', () => {
        removeColoredBorders(document.querySelectorAll('.heraldQueryLabel'));
        removeColoredBorders(document.querySelectorAll('.heraldQuery'));
    });
    window.addEventListener('focusin', () => {
        removeColoredBorders(document.querySelectorAll('.heraldQueryLabel'));
        removeColoredBorders(document.querySelectorAll('.heraldQuery'));
    });


    // Event listener: Handle build table & specificaiton checking
	document.getElementById('buildTable').addEventListener('click', (event) => {
	
		// Prevent colors from being removed immediately
		event.stopPropagation();

		// Run test
		checkSpecBuildTables(cohorts);
	});

}

/**
 * Inject label and query text manually into Herald query boxes
 */
function setLabelAndQueryManually(labelText, queryText) {
    const queryRows = document.querySelectorAll('.heraldQueryRow');
    let rowFound = false;

    for (let queryRow of queryRows) {
        const labelInput = queryRow.querySelector('.heraldQueryLabel');
        const queryInput = queryRow.querySelector('.heraldQuery');

        // Check if the current row is empty
        if (labelInput.value === '' && queryInput.value === '') {
            labelInput.value = labelText;
            queryInput.value = queryText;
            rowFound = true;
            break; // Exit after filling the first empty row
        }
    }

    // If no empty row is found, clone the last row and set its values
    if (!rowFound && queryRows.length > 0) {
        const lastRow = queryRows[queryRows.length - 1];
        const nextRow = lastRow.cloneNode(true);
        lastRow.parentNode.appendChild(nextRow);

        // Clear the cloned row's values and set them to the new values
        const labelInput = nextRow.querySelector('.heraldQueryLabel');
        const queryInput = nextRow.querySelector('.heraldQuery');
        labelInput.value = labelText;
        queryInput.value = queryText;
    }
}

/**
 * Initializes the Herald query entry form
 */
function initHeraldQueryEntryForm() {
    newHTML = ` <div class="container full-width-container">
        <div class="row mt-3">
            <div class="col">
                <label for="conceptSelect" class="form-label">Specify observation(s) to analyze</label>
                <div class="d-flex flex-column position-relative border rounded">
                    <div id="conceptOptions" class="flex-grow-1">
                        <div class="row heraldQueryRow d-flex align-items-center flex-nowrap my-2 mx-1">
                            <div class="col-auto">
                                <input type="text" class="form-control heraldQueryLabel" placeholder="Label">
                            </div>
                            <div class="col px-0 d-flex">
                                <div class="flex-grow-1">
                                    <input type="text" class="form-control w-100 heraldQuery herald-auto-complete" placeholder="Query">
                                </div>
                            </div>
                            <div class="col-auto">
                                <div class="btn-group">
                                    <button type="button" class="btn btn-sm btn-secondary dropdown-toggle" id="queryEdit" data-bs-toggle="dropdown" aria-expanded="false">Edit</button>
                                    <div class="dropdown-menu" aria-labelledby="queryEdit">
                                        <button class="dropdown-item herald-query-action" data-action="editor" id="buttonEditor">Editor</button>
                                        <button class="dropdown-item herald-query-action" data-action="up" id="buttonUp">Up</button>
                                        <button class="dropdown-item herald-query-action" data-action="down" id="buttonDown">Down</button>
                                        <button class="dropdown-item herald-query-action" data-action="clear" id="buttonClear">Clear</button>
                                        <button class="dropdown-item herald-query-action" data-action="delete" id="buttonDelete">Delete</button>
                                        <button class="dropdown-item herald-query-action" data-action="clone" id="buttonClone">Clone</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-3 mb-3">
            <div class="col-auto">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="age" id="ageCheckbox" checked>
                    <label class="form-check-label" for="ageCheckbox">Patient age</label>
                </div>
            </div>
            <div class="col-auto">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="sex" id="sexCheckbox" checked>
                    <label class="form-check-label" for="sexCheckbox">Patient sex</label>
                </div>
            </div>
            <div class="col-auto">
                <div class="btn-group">
                    <button type="button" class="btn btn-sm btn-secondary dropdown-toggle" id="observationAdd" data-bs-toggle="dropdown" aria-expanded="false">Quick add</button>
                    <div class="dropdown-menu" aria-labelledby="observationAdd">
                        <button class="dropdown-item herald-quick-add" data-action="FIRST">FIRST</button>
                        <button class="dropdown-item herald-quick-add" data-action="LAST">LAST</button>
                        <button class="dropdown-item herald-quick-add" data-action="ANY">ANY</button>
                        <button class="dropdown-item herald-quick-add" data-action="EXISTS">EXISTS</button>
                        <button class="dropdown-item herald-quick-add" data-action="NOT EXISTS">NOT EXISTS</button>
                        <button class="dropdown-item herald-quick-add" data-action="AVERAGE">AVERAGE</button>
                        <button class="dropdown-item herald-quick-add" data-action="COUNT">COUNT</button>
                        <button class="dropdown-item herald-quick-add" data-action="SUM">SUM</button>
                        <button class="dropdown-item herald-quick-add" data-action="MIN">MIN</button>
                        <button class="dropdown-item herald-quick-add" data-action="MOST FREQUENT">MOST FREQUENT</button>
                        <button class="dropdown-item herald-quick-add" data-action="MAX">MAX</button>
                    </div>
                </div>
            </div>
            <div class="col-auto">
            <button type="button" class="btn btn-sm btn-primary" id="buildTable">Check specification</button>
            </div>
        </div>`;


	// Due to the loading order of scripts, this div would be inserted last.
	// But it needs to be between cohort selection (see GHDM UI) and the plugins own selection and visualization options.
	const ghdmContent = document.querySelector('#ghdmContent');
	const firstDiv = ghdmContent.querySelector('div');
	if (firstDiv) {
		firstDiv.insertAdjacentHTML('afterend', newHTML);
	} else {
		ghdmContent.insertAdjacentHTML('beforeend', newHTML);
	}
}

function initializeHeraldUI(cohorts, callback) {

	HeraldUI.initializeFieldSelectionTree(cohorts);
    
	initHeraldQueryEntryForm();
	initHeraldQueryBoxes(cohorts);
	addListenerAutocomplete();
	addListenerQueryAction();
	addListenerQuickAdd();
	addListenerTooltip();
	
	if (callback) {
		callback();
	}
}


/**
 * Namespace object and export
 */
var HeraldUI = window.HeraldUI || {};
Object.assign(HeraldUI, {
  initializeHeraldUI: initializeHeraldUI,
  checkSpecBuildTables: checkSpecBuildTables
});
window.HeraldUI = HeraldUI;


