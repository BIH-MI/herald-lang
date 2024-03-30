// Human-Centric Extraction for Research and Analysis of Longitudinal Data (HERALD)
//
// Module: UI Binding
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
 * herald-ui / UI Binding
 */

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
 * Check if is a comparison query
 */
function isComparisonQuery(parsedResult) {
    return parsedResult.hasOwnProperty('comparison');
}

/**
 * Check if it is an search query
 */
function isSearchQuery(parsedResult) {
    return parsedResult.hasOwnProperty('search');
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
 * Render filter string
*/
function renderFilterString(filter) {
    filter = unwrapExpression(filter);
    if (filter.left && filter.conjunction && filter.right) {
        return `(${renderFilterString(filter.left)} ${filter.conjunction.value} ${renderFilterString(filter.right)})`;
    } else if (filter.field && filter.comparator && filter.value) {
        return `${filter.field.value} ${filter.comparator.value} ${filter.value.value}`;
    } else if (filter.label && filter.comparator && filter.value) {
        return `LABEL ${filter.comparator.value} ${filter.label.value} AND VALUE ${filter.comparator.value} ${filter.value.value}`;
    } else if (filter.label) {
        return `LABEL = ${filter.label.value}`;
    } else {
        return '';
    }
}

/**
 * Parse filter
 */
function bindFilter(input, filter) {
    input.value = renderFilterString(filter);
}

/**
 * Parse temporal relationship
 */
function bindTemporalRelationship(modal, temporalRelationship) {

    if (!temporalRelationship) {
        return;
    }

    // Unwrap
    temporalRelationship = unwrapExpression(temporalRelationship);

    // Get UI elements
    const temporalRelationshipSelect = modal.querySelector('#temporalRelationshipSelect');
    const temporalRelationshipInput = modal.querySelector('#temporalRelationshipInput');
    const timeUnitSelect = modal.querySelector('#timeUnitSelect');
    const temporalRelationshipTypeSelect = modal.querySelector('#temporalRelationshipTypeSelect');
    const temporalRelationshipTypeInput = modal.querySelector('#temporalRelationshipTypeInput');
  
    // Set the temporal relationship type
    temporalRelationshipSelect.value = temporalRelationship.temporalRelationship.value;
    temporalRelationshipSelect.dispatchEvent(new Event('change'));
  
    // Set the time value and unit if available
    if (temporalRelationship.time && temporalRelationship.unit) {
      temporalRelationshipInput.value = temporalRelationship.time;
      let unit = temporalRelationship.unit.value;
      unit = unit.endsWith('S') ? unit : unit + 'S';
      timeUnitSelect.value = unit.toUpperCase();
      timeUnitSelect.dispatchEvent(new Event('change'));
    } else {
      temporalRelationshipInput.value = '';
      timeUnitSelect.value = 'NONE';
      timeUnitSelect.dispatchEvent(new Event('change'));
    }
  
    // Set the anchor type (date or observation) and its value
    if (temporalRelationship.date) {
      temporalRelationshipTypeSelect.value = 'date';
      temporalRelationshipTypeInput.value = temporalRelationship.date;
    } else if (temporalRelationship.filter) {
      temporalRelationshipTypeSelect.value = 'observation';
      bindFilter(temporalRelationshipTypeInput, temporalRelationship.filter);
    }
}

/**
 * Parse selection query
 */
function bindSelectionOrAggregationQuery(modal, query) {

    // Unwrap
    query = unwrapExpression(query);

    // Get UI elements
    const queryKeywordSelect = modal.querySelector('#queryKeywordSelect');
    const queryFilterInput = modal.querySelector('#queryFilterInput');
    
    // Update the query type
    if (query.selection) {
      queryKeywordSelect.value = query.selection.value;
    } else if (query.aggregation) {
      queryKeywordSelect.value = query.aggregation.value;
    } else {
      return;
    }

    // Parse filter
    bindFilter(queryFilterInput, query.filter);
    // Parse temporal relationship
    bindTemporalRelationship(modal, query.time);
}

/**
 * Parse comparison query
 */
function bindComparisonQuery(modal, query) {

    // Unwrap
    query = unwrapExpression(query);

    // Get UI elements
    const queryKeywordSelect = modal.querySelector('#queryKeywordSelect');
    const queryFilterInput = modal.querySelector('#queryFilterInput');
    const comparisonQueryFilterRow = modal.querySelector('#comparisonQueryFilterRow');
    const comparisonQueryFilterInput = modal.querySelector('.comparisonQueryFilterInput');

    // Update the query type
    queryKeywordSelect.value = query.comparison.value;
    // Parse filter
    bindFilter(queryFilterInput, query.filter1);
    bindFilter(comparisonQueryFilterInput, query.filter2);
    // Parse temporal relationship
    bindTemporalRelationship(modal, query.time);

    // Show row
    comparisonQueryFilterRow.parentNode.style.display = 'block';
}

/**
 * Parse search query
 */
function bindSearchQuery(modal, query) {

    // Unwrap
    query = unwrapExpression(query);

    // Get UI elements
    const queryKeywordSelect = modal.querySelector('#queryKeywordSelect');
    const queryFilterInput = modal.querySelector('#queryFilterInput');
  
    // Recursive function for parsing the expression
    function parseSearchStatement(searchQuery, keywordElement, filterElement) {

      // Leaf
      if (searchQuery.search) {
        // Set keyword and filter
        keywordElement.value = searchQuery.search.value;
        bindFilter(filterElement, searchQuery.filter);

      // Inner node
      } else if (searchQuery.left && searchQuery.conjunction) {

        // Create new row
        const lastKeywordFilterRow = modal.querySelector('.keywordFilterRow:last-child');
        addSearchQueryRow(lastKeywordFilterRow);
        const newKeywordElement = lastKeywordFilterRow.querySelector('.searchQueryKeywordSelect');
        const newFilterElement = lastKeywordFilterRow.querySelector('.searchQueryFilterInput');

        // Recurse
        parseSearchStatement(searchQuery.left, keywordElement, filterElement);
        parseSearchStatement(searchQuery.right, newKeywordElement, newFilterElement);
      }
    }

    // Parse search
    parseSearchStatement(query.search, queryKeywordSelect, queryFilterInput);
  
    // Parse temporal relationship
    bindTemporalRelationship(modal, query.time);
  }

/**
 * Bind the query type
 */
function bindQueryType(modal, type) {
  const queryTypeSelect = modal.querySelector('#queryTypeSelect');
  queryTypeSelect.value = type;
  queryTypeSelect.dispatchEvent(new Event('change'));
}
  
/**
 * Parse a query into the modal
 */
function bindQuery(modal, query) {

  let parsedQuery = getParseableSubset(query);
  parsedQuery = unwrapExpression(parsedQuery);
  if (parsedQuery) {
    if (isAggregationQuery(parsedQuery)) {
      bindQueryType(modal, 'aggregation');
      bindSelectionOrAggregationQuery(modal, parsedQuery);
    } else if (isSelectionQuery(parsedQuery)) {
      bindQueryType(modal, 'selection');
      bindSelectionOrAggregationQuery(modal, parsedQuery);
    } else if (isComparisonQuery(parsedQuery)) {
      bindQueryType(modal, 'comparison');
      bindComparisonQuery(modal, parsedQuery);
    } else if (isSearchQuery(parsedQuery)) {
      bindQueryType(modal, 'search');
      bindSearchQuery(modal, parsedQuery);
    }
  }
}

/**
 * Try a certain token combination
 */
function tryTokenCombinations(tokens, index, parser, failCount, maxFail, parsedTokens, onSuccess) {

  // Success
  if (index >= tokens.length) {
    return;
  }

  // Prepare parsing
  const token = tokens[index];
  const stringToken = token.text || token.value;
  const checkpoint = parser.save();

  // Try with the current token
  try {
    parser.feed((index > 0 ? ' ' : '') + stringToken);
    if (parser.results[0]) {
      onSuccess(parsedTokens + 1, parser.results[0]);
    }
    tryTokenCombinations(tokens, index + 1, parser, 0, maxFail, parsedTokens + 1, onSuccess);
  } catch (err) {
    parser.restore(checkpoint);
    if (failCount < maxFail) {
      // Try without the current token if failCount is less than maxFail
      tryTokenCombinations(tokens, index + 1, parser, failCount + 1, maxFail, parsedTokens, onSuccess);
    } else {
      // Reset failCount and continue trying tokens
      tryTokenCombinations(tokens, index + 1, parser, 0, maxFail, parsedTokens, onSuccess);
    }
  }
}

/**
 * Returns a parseable subset
 */
function getParseableSubset(input) {

  // Lexer
  let lexer = Herald.getHeraldLexer(true);

  // Tokenize and filter out errors and whitespaces
  lexer.reset(input);
  const tokens = Array.from(lexer).filter((token) => token.type !== "error" && token.type !== "WS");

  // Initialize the parser
  const parser = new nearley.Parser(nearley.Grammar.fromCompiled(Herald.grammar));

  // Store best result
  let bestResult = null;
  let bestResultTokenCount = -1;

  // Callback function to handle successful parsing
  function onSuccess(tokenCount, result) {
    if (tokenCount > bestResultTokenCount) {
      bestResult = result;
      bestResultTokenCount = tokenCount;
    }
  }

  // Try all token combinations with a maximum of consecutive failed tokens
  let maxConsecutiveFailedTokens = 3;
  tryTokenCombinations(tokens, 0, parser, 0, maxConsecutiveFailedTokens, 0, onSuccess);

  // Return the result with the most tokens
  return bestResult;
}

/**
 * Add parentheses
 */
function addParentheses(str) {
    if (!str.startsWith("(")) {
      str = "(" + str;
    }
  
    if (!str.endsWith(")")) {
      str = str + ")";
    }
  
    return str;
}

/**
 * Abbrevitation function
 */
function abbreviateKeyword(keyword) {
  const abbreviations = {
    "MONTH": "M",
    "YEAR": "Y",
    "AVERAGE": "Avg",
    "AND": "And",
    "OR": "Or",
    "LABEL": "Lbl",
    "VALUE": "Val",
    "UNIT": "Unt",
    "START": "St",
    "END": "Ed",
    "NUMERIC": "Num",
    "COUNT": "Cnt",
    "SUM": "Sum",
    "MIN": "Min",
    "MAX": "Max",
    "MOST": "Mst",
    "FREQUENT": "Frqt",
    "FIRST": "Fst",
    "LAST": "Lst",
    "ANY": "Any",
    "RATIO": "Rat",
    "BETWEEN": "Btw",
    "DIFFERENCE": "Diff", 
    "EQUALITY": "Eq",
    "EXISTS": "Ex",
    "NOT": "Nt",
    "BEFORE": "Bf",
    "AFTER": "Af",
    "APART": "Ap",
    "CLOSE": "Cl",
    "FROM" : "Frm",
    "TO": "To",
    "BEFORE": "Bf",
    "CLOSE": "Cls",
    "AFTER": "Aft",
    "BY": "By",
    "DAYS": "D",
    "WEEKS": "W",
    "MONTHS": "M",
    "YEARS": "Y",
    "DAY": "D",
    "WEEK": "W"
  };
  let str = abbreviations[keyword] || keyword;
  if (!str || typeof str !== 'string') {
    return '';
  }
  // Capitalize
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Map for query names
const queryNameCount = new Map();

/**
 * Render query name
 */
function renderQueryName(query) {

  // Prepare
  const maxLength = 30;
  const allowedChars = /[^a-zA-Z0-9-_]/g;
  const keywords = query.match(/\b\w+\b/g);
  let name = ""

  // Collect words
  for (let i = 0; i < keywords.length ; i++) {

    // Clean and combine
    const keyword = abbreviateKeyword(keywords[i]);
    const cleanedKeyword = keyword.replace(allowedChars, '');
    name = name + cleanedKeyword;

    // Truncate the name if it exceeds maxLength
    if (name.length > maxLength) {
      name = name.substring(0, maxLength);
      break;
    }
  }

  // Ensure uniqueness
  if (queryNameCount.has(name)) {
    const count = queryNameCount.get(name);
    queryNameCount.set(name, count + 1);
    name = name + count;
  } else {
    queryNameCount.set(name, 1);
  }

  // Done
  return name;
}

/**
 * Renders a query from the modal
 */
function renderQuery(modal) {

    // Get UI elements
    const queryTypeSelect = modal.querySelector("#queryTypeSelect");
    const queryKeywordSelect = modal.querySelector("#queryKeywordSelect");
    const queryFilterInput = modal.querySelector("#queryFilterInput");
    const temporalRelationshipSelect = modal.querySelector("#temporalRelationshipSelect");
    const temporalRelationshipInput = modal.querySelector("#temporalRelationshipInput");
    const timeUnitSelect = modal.querySelector("#timeUnitSelect");
    const temporalRelationshipTypeInput = modal.querySelector("#temporalRelationshipTypeInput");
  
    // Define values
    let queryType = queryTypeSelect.value.toUpperCase();
    let keyword = queryKeywordSelect.value.toUpperCase();
    let filter = queryFilterInput.value;
    let temporalRelationship = temporalRelationshipSelect.value.toUpperCase();
    let temporalValue = temporalRelationshipInput.value;
    let timeUnit = timeUnitSelect.value.toUpperCase();
    let temporalAnchorValue = temporalRelationshipTypeInput.value;
  
    // Build temporal comparison
    let temporalRelationshipString = undefined;
    if (temporalRelationship && temporalRelationship !== 'NO TEMPORAL RESTRICTION') {
      if (timeUnit && timeUnit !== 'NONE') {
        temporalRelationshipString = `${temporalRelationship} ${addParentheses(temporalAnchorValue)} BY ${temporalValue} ${timeUnit}`;
      } else {
        temporalRelationshipString = `${temporalRelationship} ${addParentheses(temporalAnchorValue)}`;
      }
    }

    // Build query
    if (queryType === "SELECTION" || queryType === "AGGREGATION") {
      return `${keyword} ${addParentheses(filter)}` + (temporalRelationshipString ? ' ' + temporalRelationshipString : '');

    // Comparison query
    } else if (queryType === "COMPARISON") {
      const comparisonQueryFilterInput = modal.querySelector(".comparisonQueryFilterInput");
      let comparisonFilter = comparisonQueryFilterInput.value;
      return `${keyword} ${addParentheses(filter)} AND ${addParentheses(comparisonFilter)}` + (temporalRelationshipString ? ' ' + temporalRelationshipString : '');
    
    // Search query
    } else if (queryType === "SEARCH") {
      const searchRows = Array.from(modal.querySelectorAll(".keywordFilterRow"));
      searchRows.pop();
      let searchFilters = searchRows.map(row => {
        const keywordSelect = row.querySelector(".searchQueryKeywordSelect");
        const filterInput = row.querySelector(".searchQueryFilterInput");
        return `AND ${keywordSelect.value.toUpperCase()} ${addParentheses(filterInput.value)}`;
      }).join(" ");
      return `${keyword} ${addParentheses(filter)}` + (searchFilters ? ' ' + searchFilters : '') + (temporalRelationshipString ? ' ' + temporalRelationshipString : '');
    } 
    
    // No result
    return "";
}


/**
 * Namespace object and export
 */
var HeraldUI = window.HeraldUI || {};
Object.assign(HeraldUI, {
  renderQueryName: renderQueryName,
  renderQuery: renderQuery,
  bindQuery: bindQuery
});
window.HeraldUI = HeraldUI;
