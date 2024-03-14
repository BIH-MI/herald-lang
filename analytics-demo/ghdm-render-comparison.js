// Generic Health Data Module (GHDM)
//
// Module: Render Comparison
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
 * CrossSectionalAnalysisPlugin / Render Comparison
 */

function tTest(arr1, arr2) {
  if (arr1.length === 0 || arr2.length === 0) {
    throw new Error('One of the arrays is empty. t-test cannot be performed on an empty array.');
  }
  
  const mean1 = arr1.reduce((sum, value) => sum + value, 0) / arr1.length;
  const mean2 = arr2.reduce((sum, value) => sum + value, 0) / arr2.length;
  
  const variance1 = arr1.reduce((sum, value) => sum + Math.pow(value - mean1, 2), 0) / (arr1.length - 1);
  const variance2 = arr2.reduce((sum, value) => sum + Math.pow(value - mean2, 2), 0) / (arr2.length - 1);
  
  const t = (mean1 - mean2) / Math.sqrt(variance1 / arr1.length + variance2 / arr2.length);
  const degreesOfFreedom = Math.pow(variance1 / arr1.length + variance2 / arr2.length, 2) /
    (Math.pow(variance1 / arr1.length, 2) / (arr1.length - 1) + Math.pow(variance2 / arr2.length, 2) / (arr2.length - 1));
  
  return { t, degreesOfFreedom };
}

function chiSquareTest(arr1, arr2) {
	
	if (arr1.length === 0 || arr2.length ===3) {
		return {NaN, NaN, NaN};
	}

  // Get the unique categories
  const categories = [...new Set([...arr1, ...arr2])];

  // Calculate the observed frequencies
  const observedFreq = categories.map(cat => {
    const count1 = arr1.filter(val => val === cat).length;
    const count2 = arr2.filter(val => val === cat).length;
    return count1 + count2;
  });

  // Calculate the expected frequencies
  const totalObserved = observedFreq.reduce((acc, val) => acc + val, 0);
  const expectedFreq = observedFreq.map(obs => (obs * arr1.length) / totalObserved);

  // Calculate the test statistic
  const chiSquareStat = observedFreq.reduce((acc, obs, index) => {
    const exp = expectedFreq[index];
    const diff = obs - exp;
    return acc + diff * diff / exp;
  }, 0);

  // Calculate degrees of freedom
  const degreesOfFreedom = categories.length - 1;

  // Calculate the p-value
  const pValue = jStat.chisquare.cdf(chiSquareStat, degreesOfFreedom);

  return { chiSquareStat, degreesOfFreedom, pValue };
}


function renderTTestResults(header, numericValuesList) {
  
  // Significance
  const significanceLevel = 0.05;
  
 // Create the table and header row
  const resultTable = document.createElement('table');
  resultTable.classList.add('table', 'table-striped', 'table-bordered'); // Add Bootstrap classes
  resultTable.innerHTML = `
    <thead>
      <tr>
        <th scope="col">Cohorts</th>
        <th scope="col">t-Value</th>
        <th scope="col">Degrees of freedom</th>
        <th scope="col">p-Value</th>
        <th scope="col">Interpretation</th>
      </tr>
    </thead>
    <tbody>
    </tbody>
  `;

  const tbody = resultTable.querySelector('tbody');

  // Iterate through all possible pairs of cohorts
  for (let i = 0; i < numericValuesList.length - 1; i++) {
    for (let j = i + 1; j < numericValuesList.length; j++) {
      const arr1 = numericValuesList[i];
      const arr2 = numericValuesList[j];

      try {
        const { t, degreesOfFreedom } = tTest(arr1, arr2);
        const pValue = jStat.ttest(t, degreesOfFreedom, 2); // 2-tailed test
        const isSignificant = pValue < significanceLevel;
        const interpretation = isSignificant
          ? 'The distributions are significantly different.'
          : 'The distributions are not significantly different.';

		const color = isSignificant ? 'table-danger' : 'table-success'; // Use Bootstrap contextual classes

        const resultRow = document.createElement('tr');
        resultRow.innerHTML = `
          <td>${header[i]} vs ${header[j]}</td>
          <td>${t.toFixed(4)}</td>
          <td>${degreesOfFreedom.toFixed(4)}</td>
          <td>${pValue.toFixed(6)}</td>
          <td style="background-color: ${color};">${isSignificant ? 'Different' : 'Similar'}</td>
        `;

		if (!isNaN(t) && !isNaN(pValue) && !isNaN(degreesOfFreedom)) {
			tbody.appendChild(resultRow);
		}
		
      } catch (error) {
        console.error(error.message);
      }
    }
  }
  
  // Check if there are any rows with data in the table (excluding the header row)
  if (tbody.getElementsByTagName("tr").length > 0) {
    return resultTable;
  } else {
	return null;
  }
}

function renderChiSquaredTestResults(header, categoricalValuesList) {
  
  // Significance
  const significanceLevel = 0.05;
  
  // Create the table and header row
  const resultTable = document.createElement('table');
  resultTable.classList.add('table', 'table-striped', 'table-bordered'); // Add Bootstrap classes
  resultTable.innerHTML = `
    <thead>
      <tr>
        <th scope="col">Cohorts</th>
        <th scope="col">Chi-Square</th>
        <th scope="col">Degrees of freedom</th>
        <th scope="col">p-Value</th>
        <th scope="col">Interpretation</th>
      </tr>
    </thead>
    <tbody>
    </tbody>
  `;

  const tbody = resultTable.querySelector('tbody');

  // Iterate through all possible pairs of cohorts
  for (let i = 0; i < categoricalValuesList.length - 1; i++) {
    for (let j = i + 1; j < categoricalValuesList.length; j++) {
      const arr1 = categoricalValuesList[i];
      const arr2 = categoricalValuesList[j];
	  
      try {
        var { chiSquareStat, degreesOfFreedom, pValue } = chiSquareTest(arr1, arr2);
        const isSignificant = pValue < significanceLevel;
        const interpretation = isSignificant
          ? 'The distributions are significantly different.'
          : 'The distributions are not significantly different.';
        const color = isSignificant ? 'table-danger' : 'table-success'; // Use Bootstrap contextual classes

        if (chiSquareStat === undefined) chiSquareStat = NaN;
		if (degreesOfFreedom === undefined) degreesOfFreedom = NaN;
		if (pValue === undefined) pValue = NaN;
		
        const resultRow = document.createElement('tr');
        resultRow.innerHTML = `
          <td>${header[i]} vs ${header[j]}</td>
          <td>${chiSquareStat.toFixed(4)}</td>
          <td>${degreesOfFreedom.toFixed(4)}</td>
          <td>${pValue.toFixed(6)}</td>
          <td style="background-color: ${color};">${isSignificant ? 'Different' : 'Similar'}</td>
        `;

		if (!isNaN(chiSquareStat) && !isNaN(degreesOfFreedom) && !isNaN(pValue)) {
              tbody.appendChild(resultRow);
		}
      } catch (error) {
        console.error(error.message);
      }
    }
  }
  
  // Check if there are any rows with data in the table (excluding the header row)
  if (tbody.getElementsByTagName("tr").length > 0) {
    return resultTable;
  } else {
    return null;
  }
}

function groupNumericValuesByConcept(rows, header, includeAge = true) {

  const groupedValues = {};

  rows.forEach(row => {
    row.forEach((observation, columnIndex) => {
		
	  const isAge = header[columnIndex] === "Age";
	  
    if ((isAge && !includeAge) || header[columnIndex] === "Sex" || header[columnIndex] === "Patient ID") {
		  return;
	  }

    const concept = header[columnIndex];
    if (!groupedValues[concept]) {
      groupedValues[concept] = [];
    }
    
	  if (isAge) {
		  groupedValues[concept].push(Number(observation));  
	  } else if (observation && observation.isNumeric) {
        groupedValues[concept].push(Number(observation.value));
      }
    });
  });

  return groupedValues;
}

function groupNonNumericValuesByConcept(rows, header, includeSex = true) {

  const groupedValues = {};

  rows.forEach(row => {
    row.forEach((observation, columnIndex) => {
		
	  const isSex = header[columnIndex] === "Sex";
	  
    if ((isSex && !includeSex) || header[columnIndex] === "Age" || header[columnIndex] === "Patient ID") {
		  return;
	  }

    const concept = header[columnIndex];
    if (!groupedValues[concept]) {
      groupedValues[concept] = [];
    }
    
	  if (isSex) {
		  groupedValues[concept].push(observation);  
	  } else if (observation && !observation.isNumeric && observation !== undefined && observation.value !== undefined) {
        groupedValues[concept].push(observation.value);
      }
    });
  });

  return groupedValues;
}

function renderComparison(cohortLabels, tables, outputDivId) {
	
  // Prepare
  const outputDiv = document.getElementById(outputDivId);
  outputDiv.innerHTML = "";
  
  // Check if any table's header contains "Age" or "Sex"
  const includeAge = tables.some(table => table[0].includes("Age"));
  const includeSex = tables.some(table => table[0].includes("Sex"));
	
  // Collect numeric values for each cohort and group by concept
  const groupedValuesList = tables.map((table, index) => {
    const header = table[0];
    const rows = table.slice(1);
    return groupNumericValuesByConcept(rows, header, includeAge);
  });

  // Render
  const numericConcepts = Object.keys(groupedValuesList[0]);
  for (const concept of numericConcepts) {
	
    // Render
    const numericValuesList = groupedValuesList.map(groupedValues => groupedValues[concept]);
    const div = renderTTestResults(cohortLabels, numericValuesList);	
	
	// Append
	if (div !== null) {
       const conceptHeader = document.createElement('h3');
       conceptHeader.textContent = `T-test across cohorts: ${concept}`;
       document.getElementById(outputDivId).appendChild(conceptHeader);
	   document.getElementById(outputDivId).appendChild(div);
	}
  }
  
  // Collect non-numeric values for each cohort and group by concept
  const groupedNonNumericValuesList = tables.map((table, index) => {
    const header = table[0];
    const rows = table.slice(1);
    return groupNonNumericValuesByConcept(rows, header, includeSex);
  });

  // Render
  const nonNumericConcepts = Object.keys(groupedNonNumericValuesList[0]);
  for (const concept of nonNumericConcepts) {
	
	// Render
    const nonNumericValuesList = groupedNonNumericValuesList.map(groupedValues => groupedValues[concept]);
    const div = renderChiSquaredTestResults(cohortLabels, nonNumericValuesList);
	
	// Append
	if (div !== null) {
		const conceptHeader = document.createElement('h3');
		conceptHeader.textContent = `Chi-squared test across cohorts: ${concept}`;
		document.getElementById(outputDivId).appendChild(conceptHeader);
		document.getElementById(outputDivId).appendChild(div);
	}
  }
}