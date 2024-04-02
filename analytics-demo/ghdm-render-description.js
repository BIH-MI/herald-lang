// Generic Health Data Module (GHDM)
//
// Module: Render Descriptive Statistics
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
 * CrossSectionalAnalysisPlugin / Render Descriptive Statistics
 */

/**
 * Render descriptive statistics
 * @param {*} cohortLabels 
 * @param {*} tables 
 * @param {*} outputDivId 
 */
function renderDescriptiveStatistics(cohortLabels, tables, outputDivId) {
  const outputDiv = document.getElementById(outputDivId);
  outputDiv.innerHTML = "";

  // Step 1: Identify all unique headers and create checkboxes
  const controlsDiv = document.createElement("div");
  controlsDiv.id = "controls";
  
  const instructionText = document.createElement("h5");
  instructionText.innerText = "Select observation(s) to visualize";
  controlsDiv.appendChild(instructionText);

  const uniqueHeaders = new Set(tables.flatMap(table => table[0]));
  uniqueHeaders.forEach(header => {
    if (header === "Patient ID") {
      return;
    }
  
    const formCheckDiv = document.createElement("div");
    formCheckDiv.className = "form-check";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "form-check-input";
    checkbox.checked = true;
    checkbox.onchange = () => renderData();
    checkbox.id = header === "Age" || header === "Sex" 
                  ? `Patient${header.replace(/\s+/g, '')}Checkbox` 
                  : `${header.replace(/\s+/g, '')}Checkbox`;
    checkbox.setAttribute("data-header", header);

    const label = document.createElement("label");
    label.className = "form-check-label";
    // Update the label text based on the header
    label.setAttribute("for", checkbox.id);
    label.innerText = header === "Age" ? "Patient age" : 
                      header === "Sex" ? "Patient sex" : header;

    formCheckDiv.appendChild(checkbox);
    formCheckDiv.appendChild(label);
    controlsDiv.appendChild(formCheckDiv);
    lastFormCheckDiv = formCheckDiv;
  });
  if (lastFormCheckDiv) {
    lastFormCheckDiv.style.paddingBottom = '40px'; // Add padding to the last checkbox
  }

  outputDiv.appendChild(controlsDiv);

  // Step 2: Uncheck boxes that show 100% bars
  function uncheckHeadersWithUniformValues(tables) {
    const uniqueHeaders = new Set(tables.flatMap(table => table[0]));
    uniqueHeaders.forEach(header => {
      let shouldUncheck = true;
  
      // Check each table for uniformity under the current header
      for (const table of tables) {
        const headerIndex = table[0].indexOf(header);
        // If the header doesn't exist in the table, skip this table
        if (headerIndex === -1) continue;
  
        const firstValue = table[1][headerIndex] ? table[1][headerIndex].value : null;
        const isUniformInTable = table.slice(1).every(row => row[headerIndex] && row[headerIndex].value === firstValue);

        // If any table does not have uniform values for this header, do not uncheck
        if (!isUniformInTable) {
          shouldUncheck = false;
          break;
        }
      }
  
      // Uncheck the checkbox if all tables have uniform values for this header
      if (shouldUncheck) {
        const checkboxId = header.replace(/\s+/g, '') + 'Checkbox';
        const checkbox = document.getElementById(checkboxId);
        if (checkbox) {
          checkbox.checked = false;
        }
      }
    });
  }

  // Step 3: Render data based on checked headers
  function renderData() {
    const selectedHeaders = new Set(
      Array.from(document.querySelectorAll("#controls input:checked")).map(input => input.getAttribute("data-header"))
    );
    const cohortContainer = document.createElement("div");
    cohortContainer.style.display = "flex";
    
    // Clear previous data displays before re-rendering
    const existingContainer = document.getElementById("data-container");
    if (existingContainer) outputDiv.removeChild(existingContainer);

    cohortContainer.id = "data-container";
    outputDiv.appendChild(cohortContainer);

    tables.forEach((table, index) => {
      if (!selectedHeaders.size) return; // Don't render if no headers are selected

      const cohortLabel = cohortLabels[index];
      const header = table[0];
      const rows = table.slice(1);
      
      const cohortDiv = document.createElement("div");
      cohortDiv.style.flex = "1";
      cohortDiv.style.padding = "0 10px";
      cohortDiv.style.boxSizing = "border-box";
      cohortDiv.id = `cohort-${index}`;
      
      const title = document.createElement("h2");
      title.innerText = `Cohort: ${cohortLabel}`;
      cohortDiv.appendChild(title);
      cohortContainer.appendChild(cohortDiv);

      if (selectedHeaders.has("Age")) {
        renderAgeDistribution(rows, header, cohortDiv.id);
      }

      if (selectedHeaders.has("Sex")) {
        renderSexDistribution(rows, header, cohortDiv.id);
      }

      renderObservations(rows, header, cohortDiv.id, selectedHeaders);
    });

    // Resize event for Plotly plots layout adjustment
    const event = new Event('resize');
    window.dispatchEvent(event);
  }

  uncheckHeadersWithUniformValues(tables);
  renderData(); // Initial rendering
  
  
}

/**
 * Render age distribution
 * @param {*} rows 
 * @param {*} header 
 * @param {*} cohortDiv 
 */
function renderAgeDistribution(rows, header, cohortDiv) {
  // Extract ages
  const ageIndex = header.indexOf("Age");
  const ages = rows.map(row => parseInt(row[ageIndex]));

  // Create visualization
  const data = [
    {
      x: ages,
      histnorm: 'percent',
      type: 'histogram',
      marker: {
        color: 'steelblue',
      },
      xbins: {
        start: 0,  // Assuming ages start at 0, adjust as needed
        end: 120,  // Assuming ages go up to 120, adjust as needed
        size: 5  // This sets the bin width
      },
    },
  ];

  const layout = {
    title: 'Age distribution',
    xaxis: {
      title: 'Age',
      range: [0, 120], // Set the x-axis range from 0 to 120
	  fixedrange: true,
    },
    yaxis: { title: 'Percentage (%)' },
	  height: 500,
  };

  const config = { responsive: true };
  if (!ages.length) {
    const noDataDiv = createNoDataDiv();
    document.getElementById(cohortDiv).appendChild(noDataDiv);
  } else {
    const agePlotDiv = document.createElement('div');
    document.getElementById(cohortDiv).appendChild(agePlotDiv);
    Plotly.newPlot(agePlotDiv, data, layout, config);
  }
}

/**
 * Render sex distribution
 * @param {*} rows 
 * @param {*} header 
 * @param {*} cohortDiv 
 */
function renderSexDistribution(rows, header, cohortDiv) {

  // Extract sexes
  const sexIndex = header.indexOf("Sex");
  const allCategories = ['M', 'F', 'U'];
  const sexes = rows.map(row => row[sexIndex]).filter(value => allCategories.includes(value));

  // Count occurrences of each sex
  const counts = d3.rollup(sexes, v => v.length, d => d);

  // Ensure all categories are present
  allCategories.forEach(category => {
    if (!counts.has(category)) {
      counts.set(category, 0);
    }
  });

  // Create visualization
  const data = [
    {
      labels: allCategories,
      values: allCategories.map(category => counts.get(category)),
      type: 'pie',
      marker: {
        colors: ['steelblue', 'darkorange', 'mediumseagreen'],
      },
    },
  ];

  const layout = {
    title: 'Sex distribution',
    height: 600,
  };

  const config = { responsive: true };

  const sexPlotDiv = document.createElement('div');
  document.getElementById(cohortDiv).appendChild(sexPlotDiv);

  Plotly.newPlot(sexPlotDiv, data, layout, config);
}

/**
 * Render observation
 * @param {*} rows 
 * @param {*} header 
 * @param {*} cohortDiv 
 * @param {*} selectedHeaders 
 */
function renderObservations(rows, header, cohortDiv, selectedHeaders) {
  
  // Collect data
  const columnData = []; 
  rows.forEach(row => {
    row.forEach((observation, index) => {
      const headerName = header[index];

      if (!selectedHeaders.has(headerName) || ["Age", "Sex", "Patient ID"].includes(headerName)) {
        return;
      }

      if (!columnData[index]) {
        columnData[index] = {
          header: headerName,
          numericValues: [],
          nonNumericValues: [],
        };
      }

      if (observation && observation.isNumeric) {
        columnData[index].numericValues.push(observation.value);
      } else if (observation) {
        columnData[index].nonNumericValues.push(observation.value);
      }
    });
  });

  // Plot
  columnData.forEach(({header, numericValues, nonNumericValues}) => {
    const dataDiv = document.getElementById(cohortDiv);
    
    // Always prefer numeric data, if there is one, and do non-numeric only if no numeric data exists
    if (numericValues.length > 0) {
      const numericData = {
        type: 'violin',
        y: numericValues,
        box: { visible: true },
        points: 'all',
        jitter: 0.3,
        pointpos: -1.8,
        line: { color: 'steelblue' },
        legendgroup: 'hidden', // Add this line to assign a legend group
        showlegend: false // Add this line to hide the legend
      };

      const layout = {
        title: header,
        yaxis: { title: 'Value' },
        margin: { l: 50, r: 50, b: 50, t: 50 },
        height: 500,
      };

      if (numericData.y && numericData.y.length > 0) {
        const plotDiv = document.createElement('div');
        dataDiv.appendChild(plotDiv);
        Plotly.newPlot(plotDiv, [numericData], layout, { responsive: true });
      } else {
        dataDiv.appendChild(createNoDataDiv());
      }
    } else if (nonNumericValues.length > 0) {
      const categories = Array.from(new Set(nonNumericValues));
      const counts = d3.rollup(nonNumericValues, v => (v.length / rows.length) * 100, d => d);

      const categoryData = {
        x: categories,
        y: Array.from(categories, category => counts.get(category)),
        type: 'bar',
        marker: {
          color: 'steelblue',
        },
      };

      const layout = {
        title: header,
        yaxis: { title: 'Percentage (%)' },
        height: 500,
      };

      if (categoryData.x && categoryData.x.length > 0) {
        const plotDiv = document.createElement('div');
        dataDiv.appendChild(plotDiv);
        Plotly.newPlot(plotDiv, [categoryData], layout, { responsive: true });
      } else {
        dataDiv.appendChild(createNoDataDiv());
      }
    } else {
      // Handle the case where there is no data to display for this header
      dataDiv.appendChild(createNoDataDiv());
    }
  });
}


/**
 * 
 * No data div
 */
function createNoDataDiv() {
  const noDataDiv = document.createElement('div');
  noDataDiv.innerText = 'No or not enough data available';
  noDataDiv.className = 'alert alert-primary';
  noDataDiv.setAttribute('role', 'alert');

  noDataDiv.style.padding = '10px';
  noDataDiv.style.margin = '100px 20px';
  noDataDiv.style.display = 'flex';
  noDataDiv.style.justifyContent = 'center';
  noDataDiv.style.alignItems = 'center';
  noDataDiv.style.minHeight = '300px';

  return noDataDiv;
}
