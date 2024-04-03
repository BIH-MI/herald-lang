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
  // Clear the output div
  const outputDiv = document.getElementById(outputDivId);
  outputDiv.innerHTML = "";

  // Prepare x-axis and y-axis select elements
  const xAxisSelect = document.createElement("select");
  const yAxisSelect = document.createElement("select");
  xAxisSelect.className = 'form-control';
  yAxisSelect.className = 'form-control';

  //Populate x-axis and y-axis selects
  const indices = [...Array(tables[0][0].length).keys()].slice(1);
  // Map dropdown indices to data indices
  const dropdownToDataIndexMap = {};
  let numericIndex = 1;
  indices.forEach((index) => {
    const xOption = document.createElement("option");
    const yOption = document.createElement("option");  
    // only include numeric options in dropdown
    let optionIsNumeric = false;
    tables.forEach(table => {
      for (let i = 1; i < table.length; i++) {
        const observation = table[i][index];
        if (observation && observation.isNumeric) {
          optionIsNumeric = true;
        }else if (observation && !observation.isNumeric){
          optionIsNumeric = false;
          return;
        }
      }
    })
    if (optionIsNumeric){
      xOption.textContent = tables[0][0][index];
      yOption.textContent = tables[0][0][index];
      xOption.value = numericIndex;
      yOption.value = numericIndex;
      xAxisSelect.appendChild(xOption);
      yAxisSelect.appendChild(yOption);
      // Map the dropdown index to the actual data index
      dropdownToDataIndexMap[numericIndex] = index;
      numericIndex++;
    }
  });
  
  // Append select elements for x-axis and y-axis to the output div
  outputDiv.appendChild(document.createTextNode("Select x axis"));
  outputDiv.appendChild(xAxisSelect);
  outputDiv.appendChild(document.createElement("br"));
  outputDiv.appendChild(document.createTextNode("Select y axis"));
  outputDiv.appendChild(yAxisSelect);
  outputDiv.appendChild(document.createElement("br"));

  // Print headers for each table
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

  // Function to update all plots based on selected indices
  const updatePlots = () => {
    const xIndex = dropdownToDataIndexMap[parseInt(xAxisSelect.value, 10)];
    const yIndex = dropdownToDataIndexMap[parseInt(yAxisSelect.value, 10)];
    updateAllPlots(tables, cohortLabels, plotHeight, xIndex, yIndex);
  };

  // Attach event listeners to select elements
  xAxisSelect.addEventListener("change", updatePlots);
  yAxisSelect.addEventListener("change", updatePlots);

  // Initialize the plot with the first index for x and the second for y (if possible)
  xAxisSelect.value = indices[0];
  yAxisSelect.value = indices.length > 1 ? indices[1] : indices[0];

  updatePlots(); // Initial plot rendering
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