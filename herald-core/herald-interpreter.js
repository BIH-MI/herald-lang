// Human-Centric Extraction for Research and Analysis of Longitudinal Data (HERALD)
//
// Module: Interpreter
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
 * herald / Interpreter
 */

const HERALD_DEBUG = false;

/**
 * Observation
 */
class QueryableObservation {
  constructor(label, start, end, isNumeric, value, unit = null) {
    this.label = label;
    this.start = new Date(start);
    this.end = new Date(end);
    this.isNumeric = Boolean(isNumeric);
    this.value = value;
    this.unit = unit;
  }
  clone() {
    return new QueryableObservation(
      this.label,
      this.start.getTime(),
      this.end.getTime(),
      this.isNumeric,
      this.value,
      this.unit
    );
  }
}

/**
 * Null observation
 */
class NullObservation extends QueryableObservation {
  constructor() {
    super(null, Date(), Date(), false, null, null);
  }
}

/**
 * Unwrap stuff
 */
function unwrapExpression(obj) {
    if (obj && Object.keys(obj).length === 1 && obj.hasOwnProperty("expression") && obj.expression !== null ) {
      return unwrapExpression(obj.expression);
    } else {
      return obj;
    }
  }

/**
 * Parses a string value into an appropriate data type (Number, Date, Boolean, or String).
 * @param {string} value - The string value to parse.
 * @returns {number|Date|boolean|string|null} - The parsed value in the appropriate data type, or null if not valid.
 */
function parseValue(value) {
  
    // Check for number
    if (/^\d+(\.\d*)?$/.test(value)) return parseFloat(value);
  
    // Check for date
    if (/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)?$/.test(value)) return new Date(value);
  
    // Check for boolean
    if (/^true$/.test(value)) return true;
    if (/^false$/.test(value)) return false;
  
    // Otherwise, return as string
    return value;
  }

  function cleanQueryString(value) {
    if (HERALD_DEBUG) console.log("Cleaning: " + value);
    // Remove double quotes around the value
    const slicedValue = String(value).slice(1, -1);
    return slicedValue;
  }
  
  /**
   * Match test against string
   */
  function compareWithWildcard(string, test) {
    if (test.includes('*')) {
    // Escape special characters
    test = test.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Build regex
    let regex = new RegExp(test.replace(/\\\*/g, '.*'));
    // Test regex
    return regex.test(string);
    } else {
    // Standard string comparison
      return string === test;
    }
  }

  /**
   * Compare values
   */
  function compareValues(comparator, value1, value2) {
    // Check if the values are Date objects
    const isDate1 = value1 instanceof Date;
    const isDate2 = value2 instanceof Date;
  
    if (isDate1 && isDate2) {
      value1 = value1.getTime();
      value2 = value2.getTime();
    } else if (isDate1 || isDate2) {
      return false;
    }
  
    // Check if the values have the same type
    if (typeof value1 !== typeof value2) {
      return false;
    }
  
    switch (String(comparator)) {
      case '<':
        return value1 < value2;
      case '<=':
        return value1 <= value2;
      case '=':

      if (typeof value1 === 'string' || value1 instanceof String) {
        return compareWithWildcard(value1, value2);
      } else {
        return value1 === value2;
      }
      case '>=':
        return value1 >= value2;
      case '>':
        return value1 > value2;
      default:
        throw new Error('Invalid comparator: ' + comparator);
    }
  }  

  /**
   * Returns the observation value for the field
   */
  function getObservationValue(observation, field) {
    if (field === "LABEL") {
        return observation.label;
    } else if (field === "VALUE") {
        return observation.value;
    } else if (field === "START") {
        return observation.start;
    } else if (field === "END") {
        return observation.end;
    } else if (field === "NUMERIC") {
        return observation.isNumeric;
    } else if (field === "UNIT") {
        return observation.unit;
    }
  }

  /**
   * Convert time units
   */
  function timeUnitToMilliseconds(time, unit) {
    const multiplier = parseInt(time, 10);
    switch (String(unit)) {
      case 'DAYS':
      case 'DAY':
        return multiplier * 24 * 60 * 60 * 1000;
      case 'WEEKS':
      case 'WEEK':
        return multiplier * 7 * 24 * 60 * 60 * 1000;
      case 'MONTHS':
      case 'MONTH':
        return multiplier * 30 * 24 * 60 * 60 * 1000;
      case 'YEARS':
      case 'YEAR':
        return multiplier * 365 * 24 * 60 * 60 * 1000;
      default:
        throw new Error('Invalid unit: ' + unit);
    }
  }  

/**
 * Evaluates a filter expression against a given observation.
 * @param {object} filter - The filter expression object.
 * @param {QueryableObservation} observation - The observation to evaluate against the filter.
 * @returns {boolean} - True if the observation complies with the filter, false otherwise.
 */
function evaluateFilterExpression(filter, observation) {

    filter = unwrapExpression(filter);
    if (HERALD_DEBUG) console.log("Evaluate filter: " + JSON.stringify(filter, null, 2));

    // Handle conjunctions
    if (filter.hasOwnProperty('left') && filter.hasOwnProperty('conjunction') && filter.hasOwnProperty('right')) {
      let left = filter.left;
      let right = filter.right;
      let conjunction = filter.conjunction.value;
      let result = false;
      switch (conjunction) {
        case 'AND':
          result = evaluateFilterExpression(left, observation) &&
                   evaluateFilterExpression(right, observation);
          break;
        case 'OR':
          result = evaluateFilterExpression(left, observation) ||
                   evaluateFilterExpression(right, observation);
          break;
        default:
          throw new Error('Unknown conjunction: ' + conjunction);
      }
      if (HERALD_DEBUG) console.log("(left, " + conjunction + ", right) -> " + result);
      return result;
    } 
    // Handle filter expressions with field, comparator, and value
    else if (filter.hasOwnProperty('field') && filter.hasOwnProperty('comparator') && filter.hasOwnProperty('value')) {
      let obsValue = parseValue(getObservationValue(observation, filter.field.value));
      let filterValue = parseValue(cleanQueryString(filter.value.value));
      let comparator = filter.comparator.value;
      let result = compareValues(comparator, obsValue, filterValue);
      if (HERALD_DEBUG) console.log("(" + obsValue + ", " + comparator + ", " + filterValue + ") -> " + result);
      return result;
    }
    // Handle filter expressions with label, comparator, and value
    else if (filter.hasOwnProperty('label') && filter.hasOwnProperty('comparator') && filter.hasOwnProperty('value')) {
        let observationLabelValue = parseValue(getObservationValue(observation, "LABEL"));
        let filterLabelValue = parseValue(cleanQueryString(filter.label.value));
        let observationValueValue = parseValue(getObservationValue(observation, "VALUE"));
        let filterValueValue = parseValue(cleanQueryString(filter.value.value));
        let filterValueComparator = filter.comparator.value;
        let result = compareValues("=", observationLabelValue, filterLabelValue) && compareValues(filterValueComparator, observationValueValue, filterValueValue);
        if (HERALD_DEBUG) console.log("LABEL(" + observationLabelValue + ", =, " + filterLabelValue + ")" + 
                               "VALUE(" + observationValueValue + ", =, " + filterValueValue + ")" +" -> " + result);
        return result;
    // Handle filter expressions with only label (and check label's equality to the observation label)
    } else if (filter.hasOwnProperty('label')) {
        let observationLabelValue = parseValue(getObservationValue(observation, "LABEL"));
        let filterLabelValue = parseValue(cleanQueryString(filter.label.value));
        let result = compareValues("=", observationLabelValue, filterLabelValue);
        if (HERALD_DEBUG) console.log("LABEL(" + observationLabelValue + ", =, " + filterLabelValue + ") -> " + result);
        return result;
    } else {
      throw new Error('Unknown type of filter expression');
    }
}

/**
 * Apply temporal relationship
 */
function evaluateTemporalRelationship(observation, temporalRelationship, allObservations) {

    temporalRelationship = unwrapExpression(temporalRelationship);
    if (HERALD_DEBUG) console.log("Evaluate temporal relationship: " + JSON.stringify(temporalRelationship, null, 2));

    // Observation
    const { start, end } = observation;
    const observationStart = new Date(start);
    const observationEnd = new Date(end);
  
    // Query
    const relationshipType = temporalRelationship.temporalRelationship;
    
    // Time anchor
    var anchorStart;
    var anchorEnd;
    const dateFilter = temporalRelationship.filter;
    const dateString = temporalRelationship.date;
    if (dateString) {
      anchorStart = new Date(cleanQueryString(dateString));
      anchorEnd = anchorStart;
    } else if (dateFilter) {
      const filteredObservations = allObservations.filter((obs) => evaluateFilterExpression(dateFilter, obs));
      if (filteredObservations.length === 0) return false;
      anchorStart = new Date(filteredObservations[0].start);
      anchorEnd = new Date(filteredObservations[0].end);
    } else {
      throw new Error('Anchor missing in temporal relationship');
    }
  
    // Time delta
    var timeDelta;
    const time = temporalRelationship.time;
    const unit = temporalRelationship.unit;
    if (time && unit) {
      timeDelta = timeUnitToMilliseconds(time, unit);
    }
  
    // If delta has been defined
    if (timeDelta) {
      switch (String(relationshipType)) {
        case 'BEFORE':
          return anchorStart - observationEnd >= timeDelta; // Observation | Anchor
        case 'AFTER':
          return observationStart - anchorEnd >= timeDelta; // Anchor | Observation
        case 'APART FROM':
          if (observationEnd <= anchorStart) {                         
            return anchorStart - observationEnd >= timeDelta; // Observation | Anchor
          } else {
            return observationStart - anchorEnd >= timeDelta; // Anchor | Observation
          }
        case 'CLOSE TO':
          return Math.abs(observationEnd - anchorEnd) <= timeDelta ||
                 Math.abs(observationStart - anchorStart) <= timeDelta;
        case 'BEFORE AND CLOSE TO':
          return observationEnd < anchorStart && anchorStart - observationEnd <= timeDelta; // Observation | Anchor
        case 'AFTER AND CLOSE TO':
          return observationStart > anchorEnd && observationStart - anchorEnd <= timeDelta; // Anchor | Observation
        default:
          throw new Error('Invalid relationship type: ' + relationshipType);
      }
    // Without time delta
    } else {
      switch (String(relationshipType)) {
        case 'BEFORE':
          return observationEnd < anchorStart; // Observation | Anchor
        case 'AFTER':
          return observationStart > anchorEnd; // Anchor | Observation
        case 'APART FROM':
          return observationStart > anchorEnd ||
                 observationEnd < anchorStart;
        case 'CLOSE TO':
          return (observationStart >= anchorStart && observationStart <= anchorEnd) ||
                 (observationEnd >= anchorStart && observationEnd <= anchorEnd);
        case 'BEFORE AND CLOSE TO':
          // We interpret this as a delta of infinity
          return observationEnd < anchorStart; // Observation | Anchor
        case 'AFTER AND CLOSE TO':
          // We interpret this as a delta of infinity
          return observationStart > anchorEnd; // Anchor | Observation
        default:
          throw new Error('Invalid relationship type: ' + relationshipType);
      }
    }
  }

  /**
 * Process a filter query on a list of observations.
 * @param {object} query - The parsed filter query object.
 * @param {QueryableObservation[]} observations - The list of observations to be filtered.
 * @returns {QueryableObservation|null} - The first filtered observation or null if there are no matching observations.
 */
function parseFilter(observations, query) {
    
    query = unwrapExpression(query);
    if (HERALD_DEBUG) console.log("Evaluate filter query: " + JSON.stringify(query, null, 2));

    // Check if the query has a temporal relationship and filter the observations accordingly
    const temporalRelationship = query.time ? query.time : null;
    const filteredObservations = observations.filter((observation) => {
      return evaluateFilterExpression(query.filter, observation) && (temporalRelationship ? evaluateTemporalRelationship(observation, temporalRelationship) : true);
    });
  
    return filteredObservations.length > 0 ? filteredObservations[0] : new NullObservation();
  }
  
  /**
   * Processes an aggregation query
  */
  function parseAggregation(observations, query) {
    
    query = unwrapExpression(query);
    if (HERALD_DEBUG) console.log("Evaluate aggregation query: " + JSON.stringify(query, null, 2));

    function filterObservations(observations, filter, temporalRelationship) {
      return observations.filter((obs) => {
        return evaluateFilterExpression(filter, obs) && (temporalRelationship ? evaluateTemporalRelationship(obs, temporalRelationship, observations) : true);
      });
    }
  
    function applyAggregation(observations, aggregation) {
      
      if (observations.length === 0) {
        if (String(aggregation) === 'COUNT') {
          return new QueryableObservation("Count", Date(), Date(), true, 0, null);
        } else {
          return new NullObservation();
        }
      }

      function validateUnit(unit) {
        return (!unit || unit.trim() === "") ? "Unknown" : unit;
      }
      const uniqueUnits = new Set(observations.map(obs => validateUnit(obs.unit)));

      let aggregatedValue;
      let aggregatedUnit;
      let aggregatedIsNumeric = true;

      switch (String(aggregation)) {
        case 'AVERAGE': {
          let sum = 0;
          let count = 0;
          for (let obs of observations) {
              if (obs.isNumeric) {
                  sum += parseFloat(obs.value);
                  count++;
              }
          }
          if (count === 0) {
            // We handle this case later
            aggregatedValue = null;
          } else {
            aggregatedValue = sum / count;
            aggregatedUnit = uniqueUnits.size === 1 ? Array.from(uniqueUnits)[0] : "Multiple units";
            if (isNaN(aggregatedValue)) {
              aggregatedUnit = validateUnit(null);
            }
          }
          break;
        }
        case 'MEDIAN': {
          let numericObservations = observations.filter(obs => obs.isNumeric);
          if(numericObservations && numericObservations.length > 0){
            numericObservations.sort((a, b) => a.value - b.value);
            const count = numericObservations.length;
            const middleIndex = Math.floor(count / 2);
            if (count % 2 === 0) {
              // Return average of two middle values
              aggregatedValue = (parseFloat(numericObservations[middleIndex - 1].value) + parseFloat(numericObservations[middleIndex].value))/2;
              aggregatedUnit = numericObservations[middleIndex - 1].unit === numericObservations[middleIndex].unit ? numericObservations[middleIndex].unit : "Mixed";
            } else {
              // Return value of the middle index
              aggregatedValue = numericObservations[middleIndex].value;
              aggregatedUnit = validateUnit(numericObservations[middleIndex].unit);
            }
          } else {
            aggregatedValue = null;
            aggregatedUnit = validateUnit(null);
          }
          
          break;
        }
        case 'COUNT': {
          aggregatedValue = observations.length;
          aggregatedUnit = validateUnit(null);
          break;
        }
        case 'SUM': {
          let sum = 0;
          let count = 0;
          for (let obs of observations) {
              if (obs.isNumeric) {
                  sum += parseFloat(obs.value);
                  count++;
              }
          }
          if (count === 0) {
            // We handle this case later
            aggregatedValue = null;
          } else {
            aggregatedValue = sum;
            aggregatedUnit = uniqueUnits.size === 1 ? Array.from(uniqueUnits)[0] : "Multiple units";
            if (isNaN(aggregatedValue)) {
              aggregatedUnit = validateUnit(null);
            }
          }
          break;
        }
        case 'MIN': {
          let minValue = Infinity;
          let count = 0;
          for (let obs of observations) {
            if (obs.isNumeric) {
              const currentValue = parseFloat(obs.value);
              if (currentValue < minValue) {
                minValue = currentValue;
              }
              count++;
             }
          }
          if (count === 0) {
             // We handle this case later
             aggregatedValue = null;
          } else {
            aggregatedValue = minValue;
            aggregatedUnit = uniqueUnits.size === 1 ? Array.from(uniqueUnits)[0] : "Multiple units";
            if (isNaN(aggregatedValue)) {
              aggregatedUnit = validateUnit(null);
            }
          }
          break;
        }
        case 'MAX': {
          let maxValue = -Infinity;
          let count = 0;
          for (let obs of observations) {
            if (obs.isNumeric) {
              const currentValue = parseFloat(obs.value);
              if (currentValue > maxValue) {
                maxValue = currentValue;
              }
              count++;
             }
          }
          if (count === 0) {
             // We handle this case later
             aggregatedValue = null;
          } else {
            aggregatedValue = maxValue;
            aggregatedUnit = uniqueUnits.size === 1 ? Array.from(uniqueUnits)[0] : "Multiple units";
            if (isNaN(aggregatedValue)) {
              aggregatedUnit = validateUnit(null);
            }
          }
          break;
        }
        case 'MOST FREQUENT': {
          const valueCounts = {};
          let maxCount = 0;
          let mostFrequentObservation = null;
          for (let obs of observations) {
              valueCounts[obs.value] = (valueCounts[obs.value] || 0) + 1;
              if (valueCounts[obs.value] > maxCount) {
                  maxCount = valueCounts[obs.value];
                  mostFrequentObservation = obs;
              }
          }
          if (mostFrequentObservation) {
              aggregatedValue = mostFrequentObservation.value;
              aggregatedUnit = validateUnit(mostFrequentObservation.unit);
              aggregatedIsNumeric = mostFrequentObservation.isNumeric;
          } else {
              // We handle this case later
              aggregatedValue = null;
          }
          break;
        }
        default:
          throw new Error('Invalid aggregation type: ' + aggregation);
      }

      if (aggregatedValue === null) {
        return new NullObservation();
      }
  
      const start = observations.reduce((min, obs) => (obs.start < min ? obs.start : min), observations[0].start);
      const end = observations.reduce((max, obs) => (obs.end > max ? obs.end : max), observations[0].end);
  
      return new QueryableObservation(observations[0].label,
                                      start,
                                      end,
                                      aggregatedIsNumeric,
                                      aggregatedValue,
                                      aggregatedUnit);
    }
  
    const filteredObservations = filterObservations(observations, query.filter, query.time);
    return applyAggregation(filteredObservations, query.aggregation);
  }
  
  /**
   * Processes a selection query
   */
  function parseSelection(observations, query) {

    query = unwrapExpression(query);
    if (HERALD_DEBUG) console.log("Evaluate selection query: " + JSON.stringify(query, null, 2));

    function filterObservations(observations, filter, temporalRelationship) {
      return observations.filter((obs) => {
        return evaluateFilterExpression(filter, obs) && (temporalRelationship ? evaluateTemporalRelationship(obs, temporalRelationship, observations) : true);
      });
    }
  
    function applySelection(observations, selection) {
      switch (String(selection)) {
        case 'FIRST':
          return observations.length > 0 ? observations.reduce((a, b) => a.start < b.start ? a : b) : new NullObservation();
        case 'LAST':
          return observations.length > 0 ? observations.reduce((a, b) => a.start > b.start ? a : b) : new NullObservation();
        case 'ANY':
          return observations.length > 0 ? observations[Math.floor(Math.random() * observations.length)] : new NullObservation();
        default:
          throw new Error('Invalid selection type: ' + selection);
      }
    }
  
    const filteredObservations = filterObservations(observations, query.filter, query.time);
    return applySelection(filteredObservations, query.selection);
  }
  
  /** 
   * Process relationship query
  */
  function parseRelationship(observations, query) {

    query = unwrapExpression(query);
    if (HERALD_DEBUG) console.log("Evaluate relationship query: " + JSON.stringify(query, null, 2));

    function filterObservations(observations, filter, temporalRelationship) {
      return observations.filter((obs) => {
        return evaluateFilterExpression(filter, obs) && (temporalRelationship ? evaluateTemporalRelationship(obs, temporalRelationship, observations) : true);
      });
    }
  
    function applyRelationship(obs1, obs2, relationship) {
      if (!obs1 || !obs2) return new NullObservation();
  
      const value1 = parseValue(obs1.value);
      const value2 = parseValue(obs2.value);
  
      if (typeof value1 !== 'number' || typeof value2 !== 'number') {
        return new NullObservation();
      }
      
      let resultValue;
      let resultUnit;
      let resultIsNumeric;
      
      function validateUnit(unit) {
        return (!unit || unit.trim() === "") ? "Unknown" : unit;
      }
      let unit1 = validateUnit(obs1.unit);
      let unit2 = validateUnit(obs2.unit);
      
      switch (String(relationship)) {
        case 'RATIO BETWEEN':
          resultValue = value1 / value2;
          resultUnit = "(" + unit1 + ") / (" + unit2 + ")";
          resultIsNumeric = obs1.isNumeric || obs2.isNumeric;
          break;
        case 'DIFFERENCE BETWEEN':
          resultValue = value1 - value2;
          resultUnit = (unit1 === unit2) ? unit1 : "(" + unit1 + ") - (" + unit2 + ")";
          resultIsNumeric = obs1.isNumeric || obs2.isNumeric;
          break;
        case 'EQUALITY OF':
          resultValue = value1 === value2;
          resultUnit = "Boolean";
          resultIsNumeric = false;
          break;
        default:
          throw new Error('Invalid relationship type: ' + relationship);
      }
  
      return new QueryableObservation(obs1.label,
                                      obs1.start < obs2.start ? obs1.start : obs2.start,
                                      obs1.end > obs2.end ? obs1.end : obs2.end,
                                      resultIsNumeric,
                                      resultValue,
                                      resultUnit);
    }
  
    const filteredObservations1 = filterObservations(observations, query.filter1, query.time);
    const filteredObservations2 = filterObservations(observations, query.filter2, query.time);
  
    const obs1 = filteredObservations1.length > 0 ? filteredObservations1[0] : null;
    const obs2 = filteredObservations2.length > 0 ? filteredObservations2[0] : null;
  
    return applyRelationship(obs1, obs2, query.relationship);
  }

  /**
   * Perform existence query
   */
  function parseExistence(observations, query) {

    query = unwrapExpression(query);
    if (HERALD_DEBUG) console.log("Evaluate existence query: " + JSON.stringify(query, null, 2));

    function evaluateExistence(obsList, existenceFilter, temporalRelationship, existence) {
      const exists = obsList.filter((obs) => {
        return evaluateFilterExpression(existenceFilter, obs) && (temporalRelationship ? evaluateTemporalRelationship(obs, temporalRelationship, observations) : true);
      }).length > 0;
      if (existence.value === 'EXISTS') {
        return exists;
      } else if (existence.value === 'NOT EXISTS') {
        return !exists;
      } else {
        throw new Error("Unexpected existence keyword: " + existence.value);
      }
    }
  
    function applyExistenceQuery(existenceQuery, temporalRelationship) {
      if (existenceQuery.existence) {
        return evaluateExistence(observations, existenceQuery.filter, temporalRelationship, existenceQuery.existence);
      } else if (existenceQuery.left && existenceQuery.conjunction) {
        const leftResult = applyExistenceQuery(existenceQuery.left, temporalRelationship);
        const rightResult = applyExistenceQuery(existenceQuery.right, temporalRelationship);
        return leftResult && rightResult;
      }
  
      throw new Error("Invalid existence query format");
    }
  
    const value = applyExistenceQuery(query.existence, query.time) ? "true" : "false";
    const label = "Existence result";
    const unit = "Boolean";
    const start = observations && observations.length > 0 ? observations.reduce((min, obs) => obs.start < min ? obs.start : min, observations[0].start) : Date();
    const end = observations && observations.length > 0 ? observations.reduce((max, obs) => obs.end > max ? obs.end : max, observations[0].end) : Date();
  
    return new QueryableObservation(label,
                                    start,
                                    end,
                                    false,
                                    value,
                                    unit);
  }

/**
 * Check if this is a filter query
 */
function isFilterQuery(parsedResult) {
    return parsedResult.hasOwnProperty('filter') && !parsedResult.hasOwnProperty('aggregation') && !parsedResult.hasOwnProperty('selection') && !parsedResult.hasOwnProperty('relationship') && !parsedResult.hasOwnProperty('existence');
  }
  
 /**
  * Check if this is an aggregation query
  */
  function isAggregationQuery(parsedResult) {
    return parsedResult.hasOwnProperty('aggregation');
  }
  
  /**
   * Check if this is a selection query
   */
  function isSelectionQuery(parsedResult) {
    return parsedResult.hasOwnProperty('selection');
  }
  
  /**
   * Check if is a relationship query
   */
  function isRelationshipQuery(parsedResult) {
    return parsedResult.hasOwnProperty('relationship');
  }

  /**
   * Check if it is an existence query
   */
  function isExistenceQuery(parsedResult) {
    return parsedResult.hasOwnProperty('existence');
  }

  /**
   * Executes a compiled query
   */
  function executeCompiledHERALD(query, observations) {
    if (isFilterQuery(query)) {
      return parseFilter(observations, query);
    } else if (isAggregationQuery(query)) {
      return parseAggregation(observations, query);
    } else if (isSelectionQuery(query)) {
      return parseSelection(observations, query);
    } else if (isRelationshipQuery(query)) {
      return parseRelationship(observations, query);
    } else if (isExistenceQuery(query)) {
      return parseExistence(observations, query);
    } else {
      throw new Error("Unknown query type");
    }
  }

  /**
   * Executes a (string) query
   */
  function executeHERALD(query, observations) {
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
    let parsedResult;
    try {
      parser.feed(query);
      parsedResult = parser.results[0];
    } catch (e) {
      throw e;
    }
    return executeCompiledHERALD(parsedResult);
  }
  
  
/**
 * Namespace object and export
 */
var Herald = window.Herald || {};
Object.assign(Herald, {
  QueryableObservation: QueryableObservation,
  executeCompiledHERALD: executeCompiledHERALD
});
window.Herald = Herald;

