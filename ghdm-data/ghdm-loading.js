// Generic Health Data Module (GHDM)
//
// Module: Data and Ressource Loading Functions
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
 * ghdm-data / Data and Ressource Loading Functions
 */


/**
 * Helper function to parse JSON data types.
 * Assumes specific data model represented in JSON format and adds native datatyptes to certain properties.
 */
 function parseJSONDataTypes(data) {
	
	// Function to make sure we have the correct data types
  	let parseDataTypes = function(obj) {

    // Find observations
    if (obj.hasOwnProperty('start') && obj.hasOwnProperty('end')) {

      // Make sure dates are dates
      obj.start = new Date(obj.start);
      obj.end = new Date(obj.end);
      // Make sure isNumeric is a boolean
      if (typeof obj.isNumeric === 'string') {
        obj.isNumeric = obj.isNumeric.toLowerCase() === 'true';
      }
    }
    // Find patients
    if (obj.hasOwnProperty('age')) {
      // Make sure age is an int
      obj.age = parseInt(obj.age);
    }
    // Iterate over the properties of the object
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (Array.isArray(value)) {
          // Call recursively for elements in arrays
          value.forEach(element => parseDataTypes(element));
        } else if (typeof value === 'object' && value !== null) {
          // Call recursively for objects
          parseDataTypes(value);
        }
      }
    }
  }
  
  // Parse
  parseDataTypes(data);
  return data;
}

/**
 * Load all scripts in order
 */
async function loadScripts(urls, callback) {
	try {
	  for (const url of urls) {
		await new Promise((resolve, reject) => {
		  const script = document.createElement('script');
		  script.type = 'text/javascript';
		  script.src = url;
		  script.onload = () => resolve();
		  script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
		  document.head.appendChild(script);
		});
	  }
  
	  if (callback) {
		callback();
	  }
	} catch (error) {
	  console.error(error);
	}
}

/**
 * Load all styles in order
 */
async function loadStyles(urls, callback) {
	try {
		for (const url of urls) {
		  await new Promise((resolve, reject) => {
			const link = document.createElement('link');
			link.rel = 'stylesheet';
			link.type = 'text/css';
			link.href = url;
			link.onload = () => resolve();
			link.onerror = () => reject(new Error(`Failed to load stylesheet: ${url}`));
			document.head.appendChild(link);
		  });
		}
	
		if (callback) {
		  callback();
		}
	} catch (error) {
		console.error(error);
	}
}

/**
 * Namespace object and export
 */
var GHDM = window.GHDM || {};
Object.assign(GHDM, {
  loadStyles: loadStyles,
  loadScripts: loadScripts,
  parseJSONDataTypes: parseJSONDataTypes
});
window.GHDM = GHDM;


