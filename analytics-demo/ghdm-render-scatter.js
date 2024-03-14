// Generic Health Data Module (GHDM)
//
// Module: Render Scatter Plot
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
 * CrossSectionalAnalysisPlugin / Render Scatter Plot
 */

/**
 * Render scatter plots
 * @param {*} cohortLabels 
 * @param {*} tables 
 * @param {*} outputDivId 
 */
function renderScatterPlots(cohortLabels, tables, outputDivId) {
  
  // Clear
  const outputDiv = document.getElementById(outputDivId);
  outputDiv.innerHTML = "";

  // Prepare combo box
  const comboBox = document.createElement("select");

  // Collect combinations
  const indices = [...Array(tables[0][0].length).keys()].slice(1);
  const combinations = [];
  indices.forEach((_, i, arr) => {
    arr.slice(i + 1).forEach((elem) => {
      combinations.push([arr[i], elem]);
    });
  });

  // Add to combo box
  combinations.forEach(([xIndex, yIndex], comboIndex) => {
    const cohortHasData = hasDataForCombination(tables, xIndex, yIndex);
    if (cohortHasData.some((hasData) => hasData)) {
      const xConcept = tables[0][0][xIndex];
      const yConcept = tables[0][0][yIndex];

      const option = document.createElement("option");
      option.textContent = `${xConcept} vs ${yConcept}`;
      option.value = comboIndex;
      comboBox.appendChild(option);
    }
  });

  // If no data, break
  if (comboBox.children.length === 0) {
    outputDiv.appendChild(GHDMUI.createNoDataAlert());
    return; 
  }

  // Append combo embedded in bootstrap container for nice look
  const comboBoxContainer = document.createElement("div");
  comboBoxContainer.className = 'd-flex align-items-center border rounded p-2 mb-3';
  outputDiv.appendChild(comboBoxContainer);
  const label = document.createElement("span");
  label.textContent = "Select a combination to visualize:";
  label.className = 'mr-3';
  label.style.whiteSpace = 'nowrap'; 
  comboBoxContainer.appendChild(label);
  comboBox.className = 'form-control flex-fill';
  comboBox.id = `scatter-plot-combobox`;
  comboBoxContainer.appendChild(comboBox);
  outputDiv.appendChild(comboBoxContainer);

  // Print headers
  tables.forEach((table, i) => {
    const label = document.createElement("h3");
    label.textContent = `Scatter plots for ${cohortLabels[i]}`;
    outputDiv.appendChild(label);

    const plotContainer = document.createElement("div");
    plotContainer.id = `scatter-plot-container-${cohortLabels[i]}`;
    outputDiv.appendChild(plotContainer);
  });

  // Default plot height
  const plotHeight = 500;

  // React on changes
  comboBox.addEventListener("change", (e) => {
    const selectedComboIndex = parseInt(e.target.value, 10);
    const [xIndex, yIndex] = combinations[selectedComboIndex];
    updateAllPlots(tables, cohortLabels, plotHeight, xIndex, yIndex);
  });

  // Find the first valid combination that has data
  const firstValidComboIndex = combinations.findIndex(([xIndex, yIndex]) => hasDataForCombination(tables, xIndex, yIndex).some(hasData => hasData));

  // Display the first valid combination by default
  if (firstValidComboIndex !== -1) {
    const [xIndex, yIndex] = combinations[firstValidComboIndex];
    updateAllPlots(tables, cohortLabels, plotHeight, xIndex, yIndex);
  }
}

/**
 * Calculate plot data
 * @param {*} xIndex 
 * @param {*} yIndex 
 * @param {*} table 
 * @returns 
 */
function calculatePlotData(xIndex, yIndex, table) {
	    const xData = [];
	    const yData = [];

	    for (let i = 1; i < table.length; i++) {
	      const xValue = table[i][xIndex];
	      const yValue = table[i][yIndex];

	      if (xValue && yValue && xValue.isNumeric && yValue.isNumeric) {
	        xData.push(Number(xValue.value));
	        yData.push(Number(yValue.value));
	      }
	    }

	    const n = xData.length;
	    const xMean = xData.reduce((a, b) => a + b, 0) / n;
	    const yMean = yData.reduce((a, b) => a + b, 0) / n;
	    const num = xData.reduce((a, b, i) => a + (b - xMean) * (yData[i] - yMean), 0);
	    const den = xData.reduce((a, b) => a + (b - xMean) * (b - xMean), 0);

	    return { xData, yData, xMean, yMean, num, den };
	  }


    /**
     * Update all plots
     * @param {*} tables 
     * @param {*} cohortLabels 
     * @param {*} plotHeight 
     * @param {*} xIndex 
     * @param {*} yIndex 
     */
function updateAllPlots(tables, cohortLabels, plotHeight, xIndex, yIndex) {
	  const cohortHasData = hasDataForCombination(tables, xIndex, yIndex);
	  tables.forEach((table, i) => {
	    const plotContainer = document.getElementById(`scatter-plot-container-${cohortLabels[i]}`);
	    plotContainer.innerHTML = ""; // Clear previous plot or No data div

	    if (cohortHasData[i]) {
	      const xConcept = table[0][xIndex];
	      const yConcept = table[0][yIndex];
	      const { xData, yData, xMean, yMean, num, den } = calculatePlotData(xIndex, yIndex, table);
	      
	      if (den !== 0) {
	        const plotDiv = document.createElement("div");
	        plotDiv.id = `scatter-plot-${cohortLabels[i]}`;
	        plotDiv.style.height = `${plotHeight}px`;
	        plotContainer.appendChild(plotDiv);

	        const trace = createScatterPlotTrace(xData, yData);
	        const regressionTrace = createScatterPlotRegressionTrace(xData, yData, xMean, yMean, num, den);
	        const layout = createScatterPlotLayout(xConcept, yConcept, plotHeight);

	        Plotly.newPlot(plotDiv.id, [trace, regressionTrace], layout);
	      } else {
	        const noDataDiv = createNoDataDiv(plotHeight);
	        plotContainer.appendChild(noDataDiv);
	      }
	    } else {
	      const noDataDiv = createNoDataDiv(plotHeight);
	      plotContainer.appendChild(noDataDiv);
	    }
	  });
	}

/**
 * Create scatter trace
 * @param {*} xData 
 * @param {*} yData 
 * @returns 
 */
function createScatterPlotTrace(xData, yData) {
  return {
    x: xData,
    y: yData,
    mode: "markers",
    type: "scatter",
    marker: { size: 8 },
  };
}

/**
 * Create regression trace
 * @param {*} xData 
 * @param {*} yData 
 * @param {*} xMean 
 * @param {*} yMean 
 * @param {*} num 
 * @param {*} den 
 * @returns 
 */
function createScatterPlotRegressionTrace(xData, yData, xMean, yMean, num, den) {
  const slope = num / den;
  const intercept = yMean - slope * xMean;
  const xLine = [Math.min(...xData), Math.max(...xData)];
  const yLine = xLine.map((x) => slope * x + intercept);
  
  return {
    x: xLine,
    y: yLine,
    mode: "lines",
    type: "scatter",
    name: "Regression Line",
    line: { color: "red" },
  };
}

/**
 * Creates the layout
 * @param {*} xConcept 
 * @param {*} yConcept 
 * @param {*} plotHeight 
 * @returns 
 */
function createScatterPlotLayout(xConcept, yConcept, plotHeight) {
  return {
    title: `${xConcept} vs ${yConcept}`,
    xaxis: {
      title: xConcept,
    },
    yaxis: {
      title: yConcept,
    },
    height: plotHeight,
    showlegend: false, // Disable the legend
  };
}

/**
 * Checks whether data is available
 * @param {*} tables 
 * @param {*} xIndex 
 * @param {*} yIndex 
 * @returns 
 */
function hasDataForCombination(tables, xIndex, yIndex) {
    return tables.map((table) => {
      let xData = [];
      let yData = [];

      for (let i = 1; i < table.length; i++) {
        const xValue = table[i][xIndex];
        const yValue = table[i][yIndex];

        if (xValue && yValue && xValue.isNumeric && yValue.isNumeric) {
          xData.push(Number(xValue.value));
          yData.push(Number(yValue.value));
        }
      }

      if (xData.length === 0 || yData.length === 0) {
        return false;
      }

      const n = xData.length;
      const xMean = xData.reduce((a, b) => a + b, 0) / n;
      const den = xData.reduce((a, b) => a + (b - xMean) * (b - xMean), 0);

      return den !== 0;
    });
  }