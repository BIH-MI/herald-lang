/**
 * @module
 * herald / Lexer
 */

function getHeraldLexer(ignoreErrors = false) {

    // const moo = require("moo");
    const moo = window.moo;
    let lexerRules = {
       WS: /[ \t]+/,
       string: /"(?:\\["\\]|[^\n"\\])*"/,
       date: /\(\d{4}(?:-\d{2}(?:-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)?)?)?\)/, // Hack: dates need to start with ( and end with ) to avoid mismatches with digits
       digits: /\d+/,
       lparen: '(',
       rparen: ')',
       comparator: /(?:<=|>=|<|=|>)/, // Hack: regex matching ['<=', '>=', '<', '=', '>'], because otherwise hard to distinguish between < and <=
       conjunctionAnd: ['AND'],
       conjunctionOr: ['OR'],
       field: ['LABEL', 'VALUE', 'UNIT', 'START', 'END', 'NUMERIC'],
       aggregation: ['AVERAGE', 'COUNT', 'SUM', 'MIN', 'MAX', 'MOST FREQUENT'],
       selection: ['FIRST', 'LAST', 'ANY'],
       comparison: ['RATIO BETWEEN', 'DIFFERENCE BETWEEN', 'EQUALITY OF'],
       search: ['EXISTS', 'NOT EXISTS'],
       temporalRelationship: ['BEFORE', 'AFTER', 'APART FROM', 'CLOSE TO', 'BEFORE AND CLOSE TO', 'AFTER AND CLOSE TO'],
       temporalRelationshipConnector: ['BY'],
       temporalUnit: ['DAYS', 'WEEKS', 'MONTHS', 'YEARS', 'DAY', 'WEEK', 'MONTH', 'YEAR'],
    };
    if (ignoreErrors) {
       lexerRules.error = moo.error;
    }
    return moo.compile(lexerRules);
}

const heraldTokenColorMap = new Map([
   ['WS', '#000000'], // Black for whitespace
   ['string', '#008b8b'], // Dark cyan for strings
   ['date', '#8a2be2'], // Blue violet for dates
   ['digits', '#a52a2a'], // Brown for digits
   ['lparen', '#000000'], // Black for left parenthesis
   ['rparen', '#000000'], // Black for right parenthesis
   ['comparator', '#ff4500'], // Orange red for comparators
   ['conjunctionAnd', '#da70d6'], // Orchid for AND
   ['conjunctionOr', '#da70d6'], // Orchid for OR
   ['field', '#6a5acd'], // Slate blue for fields
   ['aggregation', '#4682b4'], // Steel blue
   ['selection', '#4682b4'], // Steel blue for selections
   ['comparison', '#4682b4'], // Steel blue
   ['search', '#4682b4'], // Steel blue
   ['temporalRelationship', '#b22222'], // Firebrick for temporal relationships
   ['temporalRelationshipConnector', '#da70d6'], // Orchid
   ['temporalUnit', '#808000'] // Olive for temporal units
 ]);
 
 
 /**
 * Namespace object and export
 */
var Herald = window.Herald || {};
Object.assign(Herald, {
  getHeraldLexer: getHeraldLexer
});
window.Herald = Herald;
