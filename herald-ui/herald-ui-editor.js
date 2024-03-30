// Human-Centric Extraction for Research and Analysis of Longitudinal Data (HERALD)
//
// Module: Query Editor
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
 * herald-ui / Query Editor
 */

/**
 * Map query types to their keywords
 */ 
const queryTypeKeywords = {
  selection: ['FIRST', 'LAST', 'ANY'],
  aggregation: ['AVERAGE', 'COUNT', 'SUM', 'MIN', 'MAX', 'MOST FREQUENT'],
  search: ['EXISTS', 'NOT EXISTS'],
  comparison: ['RATIO BETWEEN', 'DIFFERENCE BETWEEN', 'EQUALITY OF'],
};

/**
 * Map time units
 */
const timeUnits = ['DAYS', 'WEEKS', 'MONTHS', 'YEARS'];

/**
 * Operators
 */
const operators = [
  { type: 'equal', label: '=' },
  { type: 'less', label: '<' },
  { type: 'greater', label: '>' },
  { type: 'less_or_equal', label: '<=' },
  { type: 'greater_or_equal', label: '>=' },
];

/**
 * Get the list of operator types
 */
const operatorTypes = operators.map(operator => operator.type);

/**
 * Filters for query builder
 */
const filters = [
  { id: 'LABEL', label: 'LABEL', type: 'string', operators: operatorTypes, sql: { field: 'field_label' } },
  { id: 'VALUE', label: 'VALUE', type: 'string', operators: operatorTypes, sql: { field: 'field_value' } },
  { id: 'UNIT', label: 'UNIT', type: 'string', operators: operatorTypes, sql: { field: 'field_unit' } },
  { id: 'GHDM_FIELD_START', label: 'START', type: 'date', operators: operatorTypes, sql: { field: 'field_start' } },
  { id: 'GHDM_FIELD_END', label: 'END', type: 'date', operators: operatorTypes, sql: { field: 'field_end' } },
  { id: 'NUMERIC', label: 'NUMERIC', type: 'boolean', sql: { field: 'field_numeric' } },
];

/**
 * Keep track of active filter used in query builder
 */
let activeFilterInput = null;
/** 
 * The current clone of the modal 
 */
let queryModal = null;
/**
 * Current flatpickr instance
 */
let flatpickrInstance = null;

/**
 * Bring up the builder
 */
function showQueryBuilder(filterInput) {

  activeFilterInput = filterInput;

  $(queryModal.querySelector('#queryBuilder')).off('rulesChanged.queryBuilder')
                                              .off('afterUpdateRuleFilter.queryBuilder')
                                              .off('afterUpdateRuleOperator.queryBuilder')
                                              .off('afterUpdateRuleValue.queryBuilder');
  $(queryModal.querySelector('#queryBuilder')).queryBuilder('destroy');
  $(queryModal.querySelector('#queryBuilder')).queryBuilder({
    operators: operators,
    filters: filters,
  });

  // Load the filter string into the Query Builder
  try {

    // Work around conflicts with SQL keywords
    let filterString = filterInput.value;
    filterString = filterString.replace(/(\bEND\b)(?=(?:[^"\\]*(?:\\.|"(?:[^"\\]*\\.)*[^"\\]*"))*[^"]*$)/g, 'GHDM_FIELD_END');
    filterString = filterString.replace(/(\bSTART\b)(?=(?:[^"\\]*(?:\\.|"(?:[^"\\]*\\.)*[^"\\]*"))*[^"]*$)/g, 'GHDM_FIELD_START');

    // Load into builder
    $(queryModal.querySelector('#queryBuilder')).queryBuilder('setRulesFromSQL', filterString);
    
    // Valid
    $(filterInput).removeClass('is-invalid');

  } catch (e) {
    // Invalid
    $(filterInput).addClass('is-invalid');
  }

  // Show
  $(queryModal.querySelector('#queryBuilder')).show();

  // Update the activeFilterInput value when the Query Builder's rules change
  function onQueryBuilderChanged(e) {
    const rules = $(queryModal.querySelector('#queryBuilder')).queryBuilder('getRules');
    if (rules) {

      // Get the SQL string from the Query Builder
      const sqlObj = $(queryModal.querySelector('#queryBuilder')).queryBuilder('getSQL', 'query-builder');
      let filterString = sqlObj.sql;

      // Replace placeholders with their respective values
      sqlObj.params.forEach((param, index) => {

        // Escape double quotes
        const escapedParam = param.replace(/(?<!\\)"/g, '\\"');
        filterString = filterString.replace('?', `"${escapedParam}"`);
      });

      // Work around conflicts with SQL keywords
      filterString = filterString.replace(/GHDM_FIELD_END/g, 'END');
      filterString = filterString.replace(/GHDM_FIELD_START/g, 'START');
      
      // Add parantheses
      if (!filterString.startsWith('(')) {
        filterString = '(' + filterString;
      }        
      if (!filterString.endsWith(')')) {
        filterString = filterString + ')';
      }
      
      if (activeFilterInput) {
        activeFilterInput.value = filterString;
      }
    }
  };    
  $(queryModal.querySelector('#queryBuilder'))
  .on('rulesChanged.queryBuilder', onQueryBuilderChanged)
  .on('afterUpdateRuleFilter.queryBuilder', onQueryBuilderChanged)
  .on('afterUpdateRuleOperator.queryBuilder', onQueryBuilderChanged)
  .on('afterUpdateRuleValue.queryBuilder', onQueryBuilderChanged);
}

/**
 * Open modal
 */
async function showHeraldQueryModal(name, query) {

  // Register listeners on document just once
  if (!queryModal) {
    
    // Close query builder
    document.addEventListener('click', function (event) {
      const queryBuilder = queryModal.querySelector('#queryBuilder');
      if (!queryBuilder.contains(event.target) && event.target !== activeFilterInput) {
        $(activeFilterInput).removeClass('is-invalid');
        hideQueryBuilder();
      }
    });

    // Search query row cloning
    document.addEventListener('click', function (event) {

      // Prepare
      const target = event.target;
      const keywordFilterRow = target.closest('.keywordFilterRow');
      if (!keywordFilterRow) {
        return;
      }
      
      // Add row
      if (target.classList.contains('searchAddButton')) {
          addSearchQueryRow(keywordFilterRow);
      // Remove row
      } else if (target.classList.contains('searchRemoveButton')) {
        if (keywordFilterRow.parentNode.querySelectorAll('.keywordFilterRow').length > 1) {
          removeSearchQueryRow(keywordFilterRow);
        }
      }
    });

    // Auto-complete for query builder
    document.addEventListener("keydown", async function (event) {

      // Define key combination for triggering auto-complete
      const triggerKeyCombination = {
        code : "Space",
        ctrlKey: true
      };
      
      // Check if the key combination is pressed and the target element is input in query builder
      if (event.code === triggerKeyCombination.code &&
          event.ctrlKey === triggerKeyCombination.ctrlKey &&
          event.target.tagName.toLowerCase() === 'input' && 
          event.target.closest('.rule-value-container')) {
            
        // Open modal
        const {value, field} = await HeraldUI.openFieldSelectionModal();
  
        // if value set
        if (value && field) {
          // Get the current cursor position
          const startPos = event.target.selectionStart;
          const endPos = event.target.selectionEnd;
          // Insert the text at the cursor position
          event.target.value = event.target.value.substring(0, startPos) + value + event.target.value.substring(endPos);
          // Set the cursor position after the inserted text
          event.target.selectionStart = event.target.selectionEnd = startPos + value.length;
          event.target.focus();
          event.target.dispatchEvent(new Event('change'));
        }
      }
    });
  }
  // Create a new instance of the modal by cloning queryModal
  queryModal = document.getElementById('queryModal').cloneNode(true);
  document.getElementById('queryModal').insertAdjacentElement('afterend', queryModal);

  // Set up the modal
  const modal = new bootstrap.Modal(queryModal, {
    backdrop: 'static',
    keyboard: false,
  });

  // Set name
  if (name) {
    queryModal.querySelector('#observationLabelInput').value = name;
  }

  // Add event listeners
  queryModal.querySelector('#observationLabelInput').addEventListener('keypress', function (event) {
    // Allowed characters: letters, numbers, hyphens, and underscores
    const allowedCharacters = /^[a-zA-Z0-9-_]$/;
    // If the pressed key doesn't match the allowed characters, prevent the input
    if (!allowedCharacters.test(event.key)) {
      event.preventDefault();
    }
  });
  
  queryModal.querySelector('#queryTypeSelect').addEventListener('change', (event) => {
    const queryType = event.target.value;
    updateQueryConfiguration(queryType);
  });
  queryModal.querySelector('#temporalRelationshipSelect').addEventListener('change', (event) => {
    const temporalRelationship = event.target.value;
    updateTemporalRelationshipInput();
  });
  queryModal.querySelector('#timeUnitSelect').addEventListener('change', (event) => {
    const timeUnitSelect = event.target.value;
    updateTemporalRelationshipInput();
  });
  const searchQueryFilterInput = queryModal.querySelectorAll('.searchQueryFilterInput')[0];
  searchQueryFilterInput.addEventListener('focus', function () {
    showQueryBuilder(this);
  });
  searchQueryFilterInput.addEventListener('input', function () {
    showQueryBuilder(this);
  });
  searchQueryFilterInput.addEventListener('blur', function () {
    $(searchQueryFilterInput).removeClass('is-invalid');
  });
  const comparisonQueryFilterInput = queryModal.querySelector('.comparisonQueryFilterInput');
  comparisonQueryFilterInput.addEventListener('focus', function () {
    showQueryBuilder(this);
  });
  comparisonQueryFilterInput.addEventListener('input', function () {
    showQueryBuilder(this);
  });
  comparisonQueryFilterInput.addEventListener('blur', function () {
    $(comparisonQueryFilterInput).removeClass('is-invalid');
  });
  const queryFilterInput = queryModal.querySelector('#queryFilterInput');
  queryFilterInput.addEventListener('focus', function () {
    showQueryBuilder(this);
  });
  queryFilterInput.addEventListener('input', function () {
    showQueryBuilder(this);
  });
  queryFilterInput.addEventListener('blur', function () {
    $(queryFilterInput).removeClass('is-invalid');
  });
  const temporalRelationshipTypeInput = queryModal.querySelector('#temporalRelationshipTypeInput');
  temporalRelationshipTypeInput.addEventListener('focus', function () {
    if (queryModal.querySelector('#temporalRelationshipTypeSelect').value === 'observation') {
      if (flatpickrInstance) flatpickrInstance.destroy();
      showQueryBuilder(this);
    } else {
      hideQueryBuilder();
      if (flatpickrInstance) flatpickrInstance.destroy();
      flatpickrInstance = flatpickr($(temporalRelationshipTypeInput));
    }
  });
  temporalRelationshipTypeInput.addEventListener('input', function () {
    if (queryModal.querySelector('#temporalRelationshipTypeSelect').value === 'observation') {
      if (flatpickrInstance) flatpickrInstance.destroy();
      showQueryBuilder(this);
    } else {
      hideQueryBuilder();
      if (flatpickrInstance) flatpickrInstance.destroy();
      flatpickrInstance = flatpickr($(temporalRelationshipTypeInput));
    }
  });
  temporalRelationshipTypeInput.addEventListener('blur', function () {
    $(temporalRelationshipTypeInput).removeClass('is-invalid');
  });

  // Init
  updateQueryConfiguration('selection');

  // Parse query
  if (query) {
    HeraldUI.bindQuery(queryModal, query);
  }

  // Open the modal and wait for it to close
  return new Promise((resolve) => {

    // Show
    modal.show();

    // Remove the new instance from the DOM when the modal is hidden
    $(queryModal).on('hidden.bs.modal', function () {
      queryModal.remove();
    });

    // Wait for OK click
    queryModal.querySelector('#okButton').onclick = () => {
      let queryName = queryModal.querySelector('#observationLabelInput').value;
      let result = HeraldUI.renderQuery(queryModal);
      if (!queryName) {
        queryName = HeraldUI.renderQueryName(result);
      }
      modal.hide();
      resolve({name: queryName, query: result});
    };
    
    // Wait for cancel click
    queryModal.querySelector('#cancelButton').onclick = () => {
      modal.hide();
      resolve({name: null, query: null});
    };
  });
}

/**
 * Function to add an search query row
 */
function addSearchQueryRow(keywordFilterRow) {

  const searchQueryAddButton = keywordFilterRow.querySelector('.searchAddButton');
  const searchQueryRemoveButton = keywordFilterRow.querySelector('.searchRemoveButton');
  const searchQueryKeywordSelect = keywordFilterRow.querySelector('.searchQueryKeywordSelect');
  const searchQueryFilterInput = keywordFilterRow.querySelector('.searchQueryFilterInput');

  // Clone row
  const newRow = keywordFilterRow.cloneNode(true);
  keywordFilterRow.parentNode.insertBefore(newRow, keywordFilterRow.nextSibling);

  // Attach listeners to clone
  let newsearchQueryFilterInput = newRow.getElementsByClassName('searchQueryFilterInput')[0];
  newsearchQueryFilterInput.addEventListener('focus', function () {
    showQueryBuilder(this);
  });
  newsearchQueryFilterInput.addEventListener('input', function () {
    showQueryBuilder(this);
  });
  newsearchQueryFilterInput.addEventListener('blur', function () {
    $(newsearchQueryFilterInput).removeClass('is-invalid');
  });
  
  // Update buttons
  searchQueryAddButton.parentNode.style.display = 'none';
  searchQueryRemoveButton.parentNode.style.display = 'none';
  searchQueryKeywordSelect.parentNode.style.display = 'block';
  searchQueryFilterInput.parentNode.style.display = 'block';
  if (keywordFilterRow.parentNode.querySelectorAll('.keywordFilterRow').length > 1) {
    keywordFilterRow.parentNode.querySelectorAll('.searchRemoveButton').forEach(btn => btn.removeAttribute('disabled'));
  }

  // Done
  return newRow;
}

/**
 * Removes an search row
 */
function removeSearchQueryRow(keywordFilterRow) {
  
  // Remove row
  const prevRow = keywordFilterRow.previousElementSibling;
  const parentNode = keywordFilterRow.parentNode;
  keywordFilterRow.remove();

  if (prevRow) {
    // Update buttons
    const prevAddButton = prevRow.querySelector('.searchAddButton');
    const prevRemoveButton = prevRow.querySelector('.searchRemoveButton');
    const prevQueryKeywordSelect = prevRow.querySelector('.searchQueryKeywordSelect');
    const prevQueryFilterInput = prevRow.querySelector('.searchQueryFilterInput');
    prevRemoveButton.parentNode.style.display = 'block';
    prevAddButton.parentNode.style.display = 'block';
    prevQueryKeywordSelect.parentNode.style.display = 'none';
    prevQueryFilterInput.parentNode.style.display = 'none';
  }

  if (parentNode.querySelectorAll('.keywordFilterRow').length === 1) {
    parentNode.querySelector('.searchRemoveButton').setAttribute('disabled', true);
  }
}

/**
 * Update query configuration
 */
function updateQueryConfiguration(queryType) {
  const keywordSelect = queryModal.querySelector('#queryKeywordSelect');
  keywordSelect.innerHTML = '';
  if (queryTypeKeywords[queryType]) {
    for (const keyword of queryTypeKeywords[queryType]) {
      const option = document.createElement('option');
      option.value = keyword;
      option.text = keyword;
      keywordSelect.add(option);
    }
  }
  const searchKeywordFilterRows = queryModal.querySelector('#searchKeywordFilterRows');
  if (queryType === 'search') {
    searchKeywordFilterRows.style.display = 'block';
  } else {
    searchKeywordFilterRows.style.display = 'none';
  }
  const comparisonQueryFilterRows = queryModal.querySelector('#comparisonQueryFilterRow');
  if (queryType === 'comparison') {
    comparisonQueryFilterRows.style.display = 'block';
  } else {
    comparisonQueryFilterRows.style.display = 'none';
  }
}

/**
 * Update input for temporal relationships
 */
function updateTemporalRelationshipInput() {

  const temporalRelationshipSelect = queryModal.querySelector('#temporalRelationshipSelect');
  const temporalRelationshipInput = queryModal.querySelector('#temporalRelationshipInput');
  const timeUnitSelect = queryModal.querySelector('#timeUnitSelect');
  const temporalRelationshipTypeSelect = queryModal.querySelector('#temporalRelationshipTypeSelect');
  const temporalRelationshipTypeInput = queryModal.querySelector('#temporalRelationshipTypeInput');
  const ofElement = queryModal.querySelector('.of-text');
  
  let show = function(element, weight) {
    element.parentNode.classList.add('d-flex', 'flex-grow-' + weight, 'px-1');
    element.parentNode.style.display = 'block';
  }
  let hide = function (element, weight) {
    element.parentNode.classList.remove('d-flex', 'flex-grow-' + weight, 'px-1');
    element.parentNode.style.display = 'none';
  }

  if (!temporalRelationshipSelect.value || (temporalRelationshipSelect.value === 'No temporal restriction')) {
    hide(temporalRelationshipInput, 1);
    hide(timeUnitSelect, 1);
    hide(temporalRelationshipTypeSelect, 1);
    hide(temporalRelationshipTypeInput, 1);
    hide(ofElement, 0);
  } else {
    if (timeUnitSelect.value && timeUnitSelect.value !== 'NONE') {
      show(temporalRelationshipInput, 1);
      show(ofElement, 0);
    } else {
      hide(temporalRelationshipInput, 1);
      hide(ofElement, 0);
    }
    show(timeUnitSelect, 1);
    show(temporalRelationshipTypeSelect, 1);
    show(temporalRelationshipTypeInput, 1);
  }
}

/**
 * Hide the query builder
 */
function hideQueryBuilder() {
  queryModal.querySelector('#queryBuilder').style.display = 'none';
  activeFilterInput = null;
}


/**
 * Initializes the Herald query builder modal (aka the editor)
 */
function initHeraldQueryBuilderModal() {
  newHTML = `
  <!-- Modal for building HERALD queries -->
  <div class="modal" tabindex="-1" id="queryModal">
      <div class="modal-dialog modal-dialog-scrollable">
          <div class="modal-content">
              <div class="modal-header">
              <h5 class="modal-title small">Specify an observation to be used in the analysis</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
              <!-- Observation label input -->
              <div class="row mb-2">
                  <div class="col-auto px-1">
                  <label for="observationLabelInput" class="form-label small">Label:</label>
                  </div>
                  <div class="col px-1">
                  <input type="text" class="form-control small" id="observationLabelInput">
                  </div>
              </div>			  
              <!-- Select query type -->
              <div class="row mb-2">
                  <div class="col px-1">
                  <select class="form-select small" id="queryTypeSelect">
                      <option value="selection" selected>Selection</option>
                      <option value="aggregation">Aggregation</option>
                      <option value="comparison">Comparison</option>
                      <option value="search">Search</option>
                  </select>
                  </div>
              </div>
              <!-- Query keyword -->
              <div class="row mb-2">
                  <div class="col px-1">
                  <select class="form-select small" id="queryKeywordSelect">
                  </select>
                  </div>
                  <div class="col px-1">
                  <input type="text" class="form-control small herald-auto-complete" id="queryFilterInput" placeholder="Filter">
                  </div>
              </div>
              <!-- Additional rows for search queries-->
              <div id="searchKeywordFilterRows" style="display: none;">
                  <div class="keywordFilterRow">
                  <div class="row mb-2">
                      <div class="col px-1" style="display: none;">
                      <select class="form-select small searchQueryKeywordSelect">
                          <option value="EXISTS" selected>AND EXISTS</option>>
                          <option value="NOT EXISTS">AND NOT EXISTS</option>
                      </select>
                      </div>
                      <div class="col px-1" style="display: none;">
                      <input type="text" class="form-control small searchQueryFilterInput herald-auto-complete" placeholder="Filter">
                      </div>
                      <div class="col px-1">
                      <button type="button" class="btn btn-primary btn-sm w-100 searchAddButton">Add</button>
                      </div>
                      <div class="col px-1">
                      <button type="button" class="btn btn-danger btn-sm w-100 searchRemoveButton" disabled>Remove</button>
                      </div>
                  </div>
                  </div>
              </div>
              <!-- Additional row for comparison queries-->
              <div id="comparisonQueryFilterRow" style="display: none;">
                  <div class="comparisonFilterRow">
                  <div class="row mb-2 px-1">
                      <div class="col d-flex justify-content-end px-1">
                          <span class="small">AND</span>
                      </div>
                      <div class="col px-1">
                      <input type="text" class="form-control small comparisonQueryFilterInput herald-auto-complete" placeholder="Filter">
                      </div>
                  </div>
                  </div>
              </div>
              <!-- Temporal relationship -->
              <div class="row mb-2 d-flex">
                  <div class="col d-flex flex-grow-1 px-1">
                      <select class="form-select small flex-grow-1" id="temporalRelationshipSelect">
                          <option value="No temporal restriction" selected>No temporal restriction</option>
                          <option value="BEFORE">BEFORE</option>
                          <option value="AFTER">AFTER</option>
                          <option value="APART FROM">APART FROM</option>
                          <option value="CLOSE TO">CLOSE TO</option>
                          <option value="BEFORE AND CLOSE TO">BEFORE AND CLOSE TO</option>
                          <option value="AFTER AND CLOSE TO">AFTER AND CLOSE TO</option>
                      </select>
                  </div>
                  <div class="col" style="display: none;">
                      <select class="form-select small flex-grow-1" id="temporalRelationshipTypeSelect">
                          <option value="date" selected>Date</option>
                          <option value="observation">Observation</option>
                      </select>
                  </div>
                  <div class="col" style="display: none;">
                      <input type="text" class="form-control small flex-grow-1 herald-auto-complete" id="temporalRelationshipTypeInput" placeholder="Date or filter">
                  </div>
                  <div class="col" style="display: none;">
                      <div class="col of-text text-center flex-grow-0">
                          <span class="small">BY</span>
                      </div>
                  </div>
                  <div class="col" style="display: none;">
                      <input type="number" class="form-control small flex-grow-1" id="temporalRelationshipInput" placeholder="Time" min="0">
                  </div>
                  <div class="col" style="display: none;">
                      <select class="form-select small flex-grow-1" id="timeUnitSelect">
                          <option value="NONE">Without offset</option>
                          <option value="DAYS">DAY(S)</option>
                          <option value="WEEKS">WEEK(S)</option>
                          <option value="MONTHS">MONTH(S)</option>
                          <option value="YEARS">YEAR(S)</option>
                      </select>
                  </div>
              </div>
              <!-- jQuery query builder component -->
              <div id="queryBuilder" style="display: none;"></div>
              <!-- Footer -->
              <div class="modal-footer">
              <button type="button" class="btn btn-secondary small" id="cancelButton" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary small" id="okButton">OK</button>  
              </div>
          </div>
      </div>
  </div>
  </div>`;
  GHDMUI.prependToMainDiv(newHTML);
}

initHeraldQueryBuilderModal();

/**
 * Namespace object and export
 */
var HeraldUI = window.HeraldUI || {};
Object.assign(HeraldUI, {
  showHeraldQueryModal: showHeraldQueryModal
});
window.HeraldUI = HeraldUI;



