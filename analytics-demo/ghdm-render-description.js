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
  const cohortContainer = document.createElement("div");
  cohortContainer.style.display = "flex";
  outputDiv.appendChild(cohortContainer);

   tables.forEach((table, index) => {
    const cohortLabel = cohortLabels[index];
    const header = table[0];
    const rows = table.slice(1);
	
    const cohortDiv = document.createElement("div");
    cohortDiv.style.flex = "1";
    cohortDiv.style.padding = "0 10px";
    cohortDiv.style.boxSizing = "border-box";
	  cohortDiv.id = `cohort-${index}`; // Set a unique id for each cohortDiv

    const title = document.createElement("h2");
    title.innerText = `Cohort: ${cohortLabel}`;
    cohortDiv.appendChild(title);

    cohortContainer.appendChild(cohortDiv);
	
    if (header.includes("Age")) {
      renderAgeDistribution(rows, header, cohortDiv.id);
    }

    if (header.includes("Sex")) {
       renderSexDistribution(rows, header, cohortDiv.id);
    }
     
    renderObservations(rows, header, cohortDiv.id);
  });
  
  // I could not find a better way to make sure that the plot.ly plots are all nicely layed out
  const event = new Event('resize');
  window.dispatchEvent(event);
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
    },
  ];

  const layout = {
    xaxis: {
      title: 'Age',
      range: [0, 120], // Set the x-axis range from 0 to 120
	  fixedrange: true,
    },
    yaxis: { title: 'Percentage (%)' },
	height: 500,
  };

  const config = { responsive: true };

  const agePlotDiv = document.createElement('div');
  document.getElementById(cohortDiv).appendChild(agePlotDiv);
  Plotly.newPlot(agePlotDiv, data, layout, config);
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
 */
function renderObservations(rows, header, cohortDiv) {
  
  // Collect data
  const columnData = [];
  rows.forEach(row => {
    row.forEach((observation, index) => {
      if (header[index] === "Age" || header[index] === "Sex" || header[index] === "Patient ID") {
        return;
      }

      if (!columnData[index]) {
        columnData[index] = {
          header: header[index],
          numericValues: [],
          nonNumericValues: [],
        };
      }

      if (observation) {
        if (observation.isNumeric) {
          columnData[index].numericValues.push(observation.value);
        } else {
          columnData[index].nonNumericValues.push(observation.value);
        }
      }
    });
  });
  
  // Plot
  columnData.forEach(({header, numericValues, nonNumericValues}) => {

    // Always prefer numeric data, if there is one, and do non-numeric only if no numeric data exists
    if (numericValues.length > 0) {
        
      const data = [{
        type: 'violin',
        y: numericValues,
        box: { visible: true },
        points: 'all',
        jitter: 0.3,
        pointpos: -1.8,
        line: { color: 'steelblue' },
        legendgroup: 'hidden', // Add this line to assign a legend group
            showlegend: false // Add this line to hide the legend
      }];

      const layout = {
        xaxis: { title: header },
        yaxis: { title: 'Value' },
        margin: { l: 50, r: 50, b: 50, t: 50 },
        height: 500,
      };

      const config = { responsive: true };

      if (!data[0].y || data[0].y.length === 0) {
          const noDataDiv = createNoDataDiv();
          document.getElementById(cohortDiv).appendChild(noDataDiv);
      } else {
          const plotDiv = document.createElement('div');
          document.getElementById(cohortDiv).appendChild(plotDiv);
          Plotly.newPlot(plotDiv, data, layout, config);
      }

	  // Always prefer numeric data, if there is one, and do non-numeric only if no numeric data exists
    } else if (nonNumericValues.length > 0) {
        
        const categories = Array.from(new Set(nonNumericValues));
        const totalValues = nonNumericValues.length;
        const counts = d3.rollup(nonNumericValues, v => (v.length / rows.length) * 100, d => d);

        const data = [
          {
            x: categories,
            y: Array.from(counts.values()),
            type: 'bar',
            marker: {
              color: 'steelblue',
            },
          },
        ];

        const layout = {
          xaxis: { title: header },
          yaxis: { title: 'Percentage (%)' },
          height: 500,
        };

        const config = { responsive: true };

        if (!data[0].y || data[0].y.length === 0) {
          const noDataDiv = createNoDataDiv();
          document.getElementById(cohortDiv).appendChild(noDataDiv);
        
        } else {

          const plotDiv = document.createElement('div');
          document.getElementById(cohortDiv).appendChild(plotDiv);
          Plotly.newPlot(plotDiv, data, layout, config);
        }
    
    // Render missing data div
    } else {
      const noDataDiv = createNoDataDiv();
      document.getElementById(cohortDiv).appendChild(noDataDiv);
    }
  });
}

function createNoDataDiv() {
  const noDataDiv = document.createElement('div');
  noDataDiv.innerText = 'Not enough data';
  noDataDiv.style.textAlign = 'center';
  noDataDiv.style.padding = '20px';
  return noDataDiv;
}

