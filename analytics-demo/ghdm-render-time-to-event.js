// Generic Health Data Module (GHDM)
//
// Module: Render Time to Event
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
 * CrossSectionalAnalysisPlugin / Render Time to Event
 */

/**
 * Calculate time-to-event for index event to outcome event
 */
function calculateTimeToEvent(table, indexEventColumn, outcomeEventColumn) {
  
	let timeToEvent = [];

	for(let i = 1; i < table.length; i++) {
		const row = table[i];
		const indexEvent = row[indexEventColumn];
		const observation = row[outcomeEventColumn];

		if (indexEvent !== null && observation !== null) {
			const timeDifference = (observation.start - indexEvent.start) / (1000 * 60 * 60 * 24); // Time difference in days
			if (timeDifference >= 0) {
				timeToEvent.push(timeDifference);
			}
		}
	}

	return timeToEvent;
}

/**
 * Visualizes Kaplan Meier Curves
 */
function visualizeKaplanMeierCurves(cohortLabels, tables, indexEventColumnName, outputDivId) {
	
	// List of colors
	const colors = ['blue', 'orange', 'green', 'red', 'purple', 'brown', 'pink', 'gray', 'cyan', 'magenta'];

	// Finde indices of all columns that are not id, age, sex or index
	const outcomeOventColumns = [];
	for (let i =0; i < tables[0][0].length; i++) {
		let columnName = tables[0][0][i];
		if (columnName !== "Patient ID" && columnName !== "Age" && columnName !== "Sex" && columnName !== indexEventColumnName) {
			outcomeOventColumns.push(i);
		}
	}

	// Index of index event
	const indexEventColumn = tables[0][0].indexOf(indexEventColumnName);

	// For each such column
	outcomeOventColumns.forEach((outcomeEventColumn) => {

		// Get column name
		let columnName = tables[0][0][outcomeEventColumn];

		// Create a separate div
		const cohortDiv = document.createElement('div');
		cohortDiv.id = `column-${outcomeEventColumn}`;
		cohortDiv.style.width = '100%';
		document.getElementById(outputDivId).appendChild(cohortDiv);

		// Create a heading
		const columnHeading = document.createElement('h3');
		columnHeading.textContent = columnName;
		cohortDiv.appendChild(columnHeading);

		// Collect series for each cohort
		const series = [];
		let maxDays = 0;
		for (let i = 0; i < cohortLabels.length; i++) {
			let cohortSeries = calculateTimeToEvent(tables[i], indexEventColumn, outcomeEventColumn);
			if (cohortSeries !== undefined && cohortSeries.length > 0) {
				for (let days of cohortSeries) {
					if (days > maxDays) {
						maxDays = days;
					}
				}
				series.push(cohortSeries);
			}
		}

		// Find best time unit to use
		let timeUnit;
		let timeFactor;
		// One month
		if (maxDays <= 30) {
			timeUnit = 'Days';
			timeFactor = 1;
		// Five years
		} else if (maxDays <= 1460) {
			timeUnit = 'Months';
			timeFactor = 30;
		// More than two years
		} else {
			timeUnit = 'Years';
			timeFactor = 365;
		}

		// Wrap into traces
		// TODO: This does not handle censoring
		const traces = [];
		for (let i = 0; i < cohortLabels.length; i++) {

			// Calculate time to event from index to outcome event
			const plotData = calculateTimeToEvent(tables[i], indexEventColumn, outcomeEventColumn);
			
			// If we have some data
			if (plotData !== undefined && plotData.length > 0) {

				// Sort
				const sortedData = plotData.sort((a, b) => a - b);

				// Build trace. Start at timepoint 0, all individuals are survivors
				const x = [0];
				const y = [1];

				// For each timepoint
				for(let i = 0; i < sortedData.length; i++) {
					// Timepoint
					x.push(sortedData[i] / timeFactor);
					// Number of survivors at this timepoint
					y.push(1 - (i / sortedData.length));
				}

				// Build trace
				const trace = {
					x: x,
					y: y,
					mode: 'lines+markers',
					name: cohortLabels[i],
					line: { color: colors[i % colors.length], shape: 'hv' },
					marker: { size: 0 }
				};

				// Push trace
				traces.push(trace);
			}
		}

		// Create div
		const plotDiv = document.createElement('div');
		plotDiv.style.width = '100%';
		cohortDiv.appendChild(plotDiv);

		// Specify layout
		const layout = {
			title: `Kaplan-Meier Curve for ${columnName}`,
			xaxis: { title: timeUnit },
			yaxis: { title: 'Fraction without event' },
			margin: { l: 50, r: 50, b: 50, t: 50 },
			height: 400,
			autosize: true,
			legend: {
				x: 0.5,
				y: 1.1,
				xanchor: 'center',
				yanchor: 'top',
				orientation: 'h'
			}
		};

		// Config
		const config = { responsive: true };

		// Create plot
		Plotly.newPlot(plotDiv, traces, layout, config);
	});
}

/**
 * Render time-to-event
 */
async function renderTimeToEvent(cohortLabels, tables, outputDivId) {

	// Clear
	const outputDiv = document.getElementById(outputDivId);
	outputDiv.innerHTML = "";

	// If no data, break
	const labels = GHDM.getUniqueConceptLabels(tables);
	if (labels.length <= 1) {
		outputDiv.appendChild(createNoDataAlert());
		return; 
	}

	// Ask for index event
	const indexEvent = await GHDMUI.showConceptSelectionModal('Please select an index event.', tables);
	if (indexEvent === undefined) {
		outputDiv.appendChild(createNoDataAlert());
		return;
	}

	// Draw Kaplan Meier curves
	visualizeKaplanMeierCurves(cohortLabels, tables, indexEvent, outputDivId);
}