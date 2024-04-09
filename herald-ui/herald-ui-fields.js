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
 * herald-ui / Modals
 */


let fieldValueResolve = null;
let fieldSelectionModal = null;

// Create node
function createFieldSelectionNode(parent, label, field, value, nodeValue) {

    const node = document.createElement("div");
    node.classList.add("tree-node");
  
    // Add the field and value as data attributes
    node.dataset.field = field;
    node.dataset.value = value;
    node.dataset.nodeValue = nodeValue;
  
    const nodeContent = document.createElement("div");
    nodeContent.classList.add("d-flex", "align-items-center");
    node.appendChild(nodeContent);
  
    const button = document.createElement("button");
    button.classList.add("btn", "btn-sm", "btn-toggle");
    button.textContent = "-";
    nodeContent.appendChild(button);
  
    const text = document.createElement("span");
    text.textContent = label;
    text.classList.add("clickable");
    nodeContent.appendChild(text);
  
    parent.appendChild(node);

    // Add event listener for node selection
    node.addEventListener("click", function (event) {   
      // Dont propagate
      event.stopPropagation();

      // Get data from tree
      let field = node.dataset.field;
      let value = node.dataset.value;

      // Get configuration for wildcard matching
      var includeSpecializations = document.getElementById('includeSpecializationsCheck').checked;
      var includeHomonyms = document.getElementById('includeHomonymsCheck').checked;

      // Apply wildcard matching parameters
      if (includeHomonyms) {
        value = "*" + node.dataset.nodeValue.trimStart();
      }
      if (includeSpecializations) {
        value = value.trimEnd() + "*";
      }

      // Hide
      fieldSelectionModal.hide();

      // Done
      fieldValueResolve({ field: field, 
                          value: value});
    });
  
    // Add event listener for collapse/expand button
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      const children = node.querySelectorAll(":scope > .tree-node");
  
      if (button.textContent === "+") {
        button.textContent = "-";
        children.forEach(child => child.style.display = "block");
      } else {
        button.textContent = "+";
        children.forEach(child => child.style.display = "none");
      }
    });
  
    return node;
}


// Open modal
async function openFieldSelectionModal(search = null) {

    // Store
    return new Promise((resolve) => {
      fieldSelectionModal = new bootstrap.Modal(document.getElementById("fieldSelectionTreeModal"), {
        backdrop: "static",
        keyboard: false
      });

      // Clear search
      document.getElementById("fieldSelectionTreeSearch").value = search ? search : "";
      document.getElementById("fieldSelectionTreeSearch").dispatchEvent(new Event("input"));

      // Show all nodes
      const treeNodes = document.querySelectorAll("#fieldSelectionTreeContainer .tree-node");
      for (const node of treeNodes) {
         node.style.display = "block";
         let button = node.querySelector('.btn-toggle');
         if (button && button.textContent === "+") {
          button.textContent = "-";
         }
      }

      // Store
      fieldValueResolve = resolve;
  
      // Show the modal
      fieldSelectionModal.show();
    });
}
  

/**
 * 
 * @param {*} cohorts 
 */
function initializeFieldSelectionTree(cohorts) {

    // Search function
    document.getElementById("fieldSelectionTreeSearch").addEventListener("input", function (event) {
      const keyword = event.target.value.toLowerCase();
      const treeNodes = document.querySelectorAll("#fieldSelectionTreeContainer .tree-node");
    
      for (const node of treeNodes) {
        if (node.textContent.toLowerCase().includes(keyword)) {
          node.style.display = "block";
        } else {
          node.style.display = "none";
        }
      }
    });

    // Cancel function
    document.getElementById("fieldSelectionTreeModal").querySelector(".modal-footer .btn-secondary").addEventListener("click", (event) => {
      event.stopPropagation();
      fieldSelectionModal.hide();
      fieldValueResolve({ field: null, value: null});
    });

    // Root element
    const treeContainer = document.getElementById("fieldSelectionTreeContainer");
  
    // Clear the existing tree
    while (treeContainer.firstChild) {
      treeContainer.removeChild(treeContainer.firstChild);
    }
    
    // Results
    const nodes = new Map();

    // Recursive function to collect
    function traverse(previousElement, concept, path) {

        // Prepare
        path = path === '' ? concept.label : path + ' > ' + concept.label;

        // Create node for concept
        let element = nodes.get(path);
        if (!element) {
            element = createFieldSelectionNode(previousElement, concept.label, "LABEL", path, concept.label);
            nodes.set(path, element);
        }

        // Create node for value and unit
        if (concept.observations.length != 0) {
            for (observation of concept.observations) {
                        
                if (!observation.isNumeric) {
                    let valuePath = path + " VALUE: " + observation.value;
                    let valueElement = nodes.get(valuePath);
                    if (!valueElement) {
                        valueElement = createFieldSelectionNode(element, "Value: " + observation.value, "VALUE", observation.value, observation.value);
                        nodes.set(valuePath, valueElement);
                    }
                }
                if (observation.unit) {
                    let unitPath = path + " UNIT: " + observation.unit;
                    let unitElement = nodes.get(unitPath);
                    if (!unitElement) {
                        unitElement = createFieldSelectionNode(element, "Unit: " + observation.unit, "UNIT", observation.unit, observation.unit);
                        nodes.set(unitPath, unitElement);
                    }
                }
            }
        }

        // Traverse
        for (subConcept of concept.subConcepts) {
            traverse(element, subConcept, path);
        }
    }

    // Call function
    cohorts.forEach(cohort => {
        cohort.patients.forEach(patient => {
            for (concept of patient.concepts) {
                traverse(treeContainer, concept, '');
            }
        });
    });


}


/**
 * Initializes the GHDM field selection modal
 */
function initHERALDFieldSelectionModal() {
    let newHTML = `
        <div class="modal fade" id="fieldSelectionTreeModal" tabindex="-1" aria-labelledby="fieldSelectionTreeModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content modal-content-limited">
                    <div class="modal-header">
                        <h5 class="modal-title" id="fieldSelectionTreeModalLabel">Select field or value</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="container" id="GHDMFieldSelectionModalSearchBox">
                        <input type="text" class="form-control mb-2 mt-2" id="fieldSelectionTreeSearch" placeholder="Search...">
                    </div>

                    <div class="container">
                        <div class="card border rounded p-2 mb-3 mt-2">
                            <div class="row">
                                <div class="col">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" value="" id="includeHomonymsCheck" checked>
                                        <label class="form-check-label" for="includeHomonymsCheck">
                                            Include homonyms
                                        </label>
                                    </div>
                                </div>
                                <div class="col">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" value="" id="includeSpecializationsCheck" checked>
                                        <label class="form-check-label" for="includeSpecializationsCheck">
                                            Include specializations
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal-body modal-body-scrollable">
                        <div id="fieldSelectionTreeContainer" class="tree-scroll-container">
                            <!-- Tree nodes will be created and appended here -->
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    </div>
                </div>
            </div>
        </div>`;
    GHDMUI.appendToMainDiv(newHTML);
}

/** Start initializing the modal. */
initHERALDFieldSelectionModal();



/**
 * Namespace object and export
 */
var HeraldUI = window.HeraldUI || {};
Object.assign(HeraldUI, {
  initializeFieldSelectionTree: initializeFieldSelectionTree,
  openFieldSelectionModal: openFieldSelectionModal
});
window.HeraldUI = HeraldUI;


