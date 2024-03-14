// Generic Health Data Module (GHDM)
//
// Module: Modals and Modal Helpers
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
 * ghdm-ui / Modals and Modal Helpers
 */

/**
 * Show a blocking alert modal (i.e. the modal has to be closed before proceeding)
 * @param {*} text The text to be displayed inside the alert modal.
 */
function showAlert(text) {
    const messageElement = document.getElementById('blocking-alert-message');
    messageElement.innerText = text;
  
    const modal = new bootstrap.Modal(document.getElementById('blocking-alert-modal'));
    modal.show();
}
  
/**
 * Shows the concept selection modal, a dropdown box offering all concepts defined in tables
 * @param {*} message Message to be displayed in the modal
 * @param {*} tables Contains the concepts offered for selection in the modal 
 * @returns Promise for selected concept or undefined if cancelled.
 */
function showConceptSelectionModal(message, tables) {
    return new Promise((resolve) => {
        const uniqueConceptLabels = GHDM.getUniqueConceptLabels(tables);

        // Set the message content
        const conceptSelectionMessage = document.getElementById("conceptSelectionMessage");
        conceptSelectionMessage.textContent = message;

        // Populate the concept options
        const conceptSelect = document.getElementById("conceptSelect");
        conceptSelect.innerHTML = '';
        uniqueConceptLabels.forEach((label) => {
        const option = document.createElement("option");
        option.textContent = label;
        option.value = label;
        conceptSelect.appendChild(option);
        });

        // Display the modal
        const modal = new bootstrap.Modal(document.getElementById('conceptSelectionModal'), {
        backdrop: 'static',
        keyboard: false
        });
        modal.show();

        // Handle the concept selection
        document.getElementById("conceptSelectConfirmButton").addEventListener("click", () => {
        const selectedConcept = conceptSelect.value;
        modal.hide();
        resolve(selectedConcept);
        });

        // Handle the concept cancellation
        document.getElementById("conceptSelectCancelButton").addEventListener("click", () => {
        modal.hide();
        resolve(undefined);
        });
});
}
  
 /**
   * Shows the feature and target selection modal.
   * @param {*} message 
   * @param {*} tables 
   * @returns List of selected features and selected target
   */
function showFeatureTargetSelectionModal(message, tables) {
    return new Promise((resolve) => {
        const uniqueConceptLabels = GHDM.getUniqueConceptLabels(tables);

        // Check if "Age" and "Sex" are present in the tables
        const patientProperties = ['Age', 'Sex'].filter((property) => {
        const propertyIndex = tables[0][0].indexOf(property);
        return propertyIndex !== -1;
        });

        // Set the message content
        const featureTargetMessage = document.getElementById("featureTargetMessage");
        featureTargetMessage.textContent = message;

        // Populate the features options
        const featuresSelect = document.getElementById("featuresSelect");
        featuresSelect.innerHTML = '';
        patientProperties.concat(uniqueConceptLabels).forEach((label) => {
        const option = document.createElement("option");
        option.textContent = label;
        option.value = label;
        featuresSelect.appendChild(option);
        });

        // Populate the target options
        const targetSelect = document.getElementById("targetSelect");
        targetSelect.innerHTML = '';
        patientProperties.concat(uniqueConceptLabels).forEach((label) => {
        const option = document.createElement("option");
        option.textContent = label;
        option.value = label;
        targetSelect.appendChild(option);
        });

        // Display the modal
        const modal = new bootstrap.Modal(document.getElementById('featureTargetModal'), {
        backdrop: 'static',
        keyboard: false
        });
        modal.show();

        // Handle the selections
        document.getElementById("featureTargetConfirmButton").addEventListener("click", () => {
        const selectedFeatures = Array.from(featuresSelect.selectedOptions).map(option => option.value);
        const selectedTarget = targetSelect.value;
        modal.hide();
        resolve({ features: selectedFeatures, target: selectedTarget });
        });

        // Handle the cancellation
        document.getElementById("featureTargetCancelButton").addEventListener("click", () => {
        modal.hide();
        resolve({ features: [], target: undefined });
        });
    });
}
  

/**
 * Initializes the GHDM alert modal
 */
function initGHDMAlertModal() {
    let newHTML = `<div class="modal" tabindex="-1" id="">
                  <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Attention</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <p id="blocking-alert-message"></p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                  </div>
                </div>`;
    GHDMUI.appendToMainDiv(newHTML);
}


/**
 * Initialize GHDM concept selection modal
 */
function initGHDMConceptSelectionModal() {
    let newHTML = `
        <div class="modal fade" id="conceptSelectionModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Select Concept</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                <!-- will be filled later -->
                <p id="conceptSelectionMessage"></p>
                <form id="conceptSelectionForm">
                    <div class="mb-3">
                    <label for="conceptSelect" class="form-label">Choose Concept:</label>
                    <select class="form-select" id="conceptSelect">
                    </select>
                    </div>
                </form>
                </div>
                <div class="modal-footer">
                <button type="button" class="btn btn-secondary" id="conceptSelectCancelButton" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" id="conceptSelectConfirmButton">Select</button>
                </div>
            </div>
            </div>
        </div>`;
    GHDMUI.appendToMainDiv(newHTML); 
}

/** 
 * Helper function to initialize all GHDM UI elements
 */
function initGHDMModals() {
    initGHDMAlertModal();
    initGHDMConceptSelectionModal();
}

/**
 * Namespace object and export
 */
var GHDMUI = window.GHDMUI || {};
Object.assign(GHDMUI, {
  showConceptSelectionModal: showConceptSelectionModal
});
window.GHDMUI = GHDMUI;

initGHDMModals();
