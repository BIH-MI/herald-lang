/**
 * @module
 * herald / Herald Grammar
 * generated automatically by nearley, version 2.20.1
 */

// Generated automatically by nearley, version 2.20.1
// http://github.com/Hardmath123/nearley
//(function () {
    
    function id(x) { return x[0]; }

    //const moo = require("moo");
    const moo = window.moo;

    let lexer = moo.compile({
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
        aggregation: ['AVERAGE', 'MEDIAN', 'COUNT', 'SUM', 'MIN', 'MAX', 'MOST FREQUENT'],
        selection: ['FIRST', 'LAST', 'ANY'],
        relationship: ['RATIO BETWEEN', 'DIFFERENCE BETWEEN', 'EQUALITY OF'],
        existence: ['EXISTS', 'NOT EXISTS'],
        temporalRelationship: ['BEFORE', 'AFTER', 'APART FROM', 'CLOSE TO', 'BEFORE AND CLOSE TO', 'AFTER AND CLOSE TO'],
        temporalRelationshipConnector: ['BY'],
        temporalUnit: ['DAYS', 'WEEKS', 'MONTHS', 'YEARS', 'DAY', 'WEEK', 'MONTH', 'YEAR'],
    });
    
    var grammar = {
        Lexer: lexer,
        ParserRules: [
        {"name": "query$ebnf$1", "symbols": ["tempRel"], "postprocess": id},
        {"name": "query$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
        {"name": "query", "symbols": ["filter", "_", "query$ebnf$1"], "postprocess": function (d) { return {filter: d[0], time: d[2]}; }},
        {"name": "query$ebnf$2", "symbols": ["tempRel"], "postprocess": id},
        {"name": "query$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
        {"name": "query", "symbols": [(lexer.has("aggregation") ? {type: "aggregation"} : aggregation), "_", "filter", "_", "query$ebnf$2"], "postprocess": function (d) { return {aggregation: d[0], filter: d[2], time: d[4]}; }},
        {"name": "query$ebnf$3", "symbols": ["tempRel"], "postprocess": id},
        {"name": "query$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
        {"name": "query", "symbols": [(lexer.has("selection") ? {type: "selection"} : selection), "_", "filter", "_", "query$ebnf$3"], "postprocess": function (d) { return {selection: d[0], filter: d[2], time: d[4]}; }},
        {"name": "query$ebnf$4", "symbols": ["tempRel"], "postprocess": id},
        {"name": "query$ebnf$4", "symbols": [], "postprocess": function(d) {return null;}},
        {"name": "query", "symbols": [(lexer.has("relationship") ? {type: "relationship"} : relationship), "_", "filter", "_", (lexer.has("conjunctionAnd") ? {type: "conjunctionAnd"} : conjunctionAnd), "_", "filter", "_", "query$ebnf$4"], "postprocess": function (d) { return {relationship: d[0], filter1: d[2], filter2: d[6], time: d[8]}; }},
        {"name": "query$ebnf$5", "symbols": []},
        {"name": "query$ebnf$5$subexpression$1", "symbols": ["_", (lexer.has("conjunctionAnd") ? {type: "conjunctionAnd"} : conjunctionAnd), "_", "existenceQuery"]},
        {"name": "query$ebnf$5", "symbols": ["query$ebnf$5", "query$ebnf$5$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
        {"name": "query$ebnf$6", "symbols": ["tempRel"], "postprocess": id},
        {"name": "query$ebnf$6", "symbols": [], "postprocess": function(d) {return null;}},
        {"name": "query", "symbols": ["existenceQuery", "query$ebnf$5", "_", "query$ebnf$6"], "postprocess":  function (d) {
                var result = d[0];
                for (var i = 0; i < d[1].length; i++) {
                    var conjunctionAnd = d[1][i][1];
                    var existenceQuery = d[1][i][3];
                    result = {left: result, conjunction: conjunctionAnd, right: existenceQuery};
                }
                return {existence: result, time: d[3]};
            } },
        {"name": "existenceQuery", "symbols": [(lexer.has("existence") ? {type: "existence"} : existence), "_", "filter"], "postprocess": function(d) { return {existence: d[0], filter: d[2]}; }},
        {"name": "filter", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "expression", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": function (d) {return {expression: d[2]}; }},
        {"name": "expression", "symbols": ["orExpression"], "postprocess": function(d) { return d[0]; }},
        {"name": "orExpression$ebnf$1", "symbols": []},
        {"name": "orExpression$ebnf$1$subexpression$1", "symbols": ["_", (lexer.has("conjunctionOr") ? {type: "conjunctionOr"} : conjunctionOr), "_", "andExpression"]},
        {"name": "orExpression$ebnf$1", "symbols": ["orExpression$ebnf$1", "orExpression$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
        {"name": "orExpression", "symbols": ["andExpression", "orExpression$ebnf$1"], "postprocess":  function(d) {
                var result = d[0];
                for (var i = 0; i < d[1].length; i++) {
                     var conjunctionOr = d[1][i][1];
                     var andExpression = d[1][i][3];
                     result = {left: result, conjunction: conjunctionOr, right: andExpression};
                }
                return result;
            } },
        {"name": "andExpression$ebnf$1", "symbols": []},
        {"name": "andExpression$ebnf$1$subexpression$1", "symbols": ["_", (lexer.has("conjunctionAnd") ? {type: "conjunctionAnd"} : conjunctionAnd), "_", "baseExpression"]},
        {"name": "andExpression$ebnf$1", "symbols": ["andExpression$ebnf$1", "andExpression$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
        {"name": "andExpression", "symbols": ["baseExpression", "andExpression$ebnf$1"], "postprocess":  function(d) {
                var result = d[0];
                for (var i = 0; i < d[1].length; i++) {
                    var conjunctionAnd = d[1][i][1];
                    var orExpression = d[1][i][3];
                    result = {left: result, conjunction: conjunctionAnd, right: orExpression};
                }
                return result;
            } },
        {"name": "baseExpression", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "_", "expression", "_", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": function (d) { return {expression: d[2]}; }},
        {"name": "baseExpression", "symbols": ["fieldExpression"], "postprocess": function (d) { return {expression: d[0]}; }},
        {"name": "fieldExpression", "symbols": [(lexer.has("field") ? {type: "field"} : field), "_", (lexer.has("comparator") ? {type: "comparator"} : comparator), "_", (lexer.has("string") ? {type: "string"} : string)], "postprocess": function (d) { return {field: d[0], comparator: d[2], value: d[4]}; }},
        {"name": "fieldExpression", "symbols": [(lexer.has("string") ? {type: "string"} : string), "_", (lexer.has("comparator") ? {type: "comparator"} : comparator), "_", (lexer.has("string") ? {type: "string"} : string)], "postprocess": function (d) { return {label: d[0], comparator: d[2], value: d[4]}; }},
        {"name": "fieldExpression", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": function (d) { return {label: d[0]}; }},
        {"name": "tempRel", "symbols": [(lexer.has("temporalRelationship") ? {type: "temporalRelationship"} : temporalRelationship), "_", "filter"], "postprocess": function (d) { return {temporalRelationship: d[0], filter: d[2]}; }},
        {"name": "tempRel", "symbols": [(lexer.has("temporalRelationship") ? {type: "temporalRelationship"} : temporalRelationship), "_", (lexer.has("date") ? {type: "date"} : date)], "postprocess": function (d) { return {temporalRelationship: d[0], date: d[2]}; }},
        {"name": "tempRel", "symbols": [(lexer.has("temporalRelationship") ? {type: "temporalRelationship"} : temporalRelationship), "_", "filter", "_", (lexer.has("temporalRelationshipConnector") ? {type: "temporalRelationshipConnector"} : temporalRelationshipConnector), "_", (lexer.has("digits") ? {type: "digits"} : digits), "_", (lexer.has("temporalUnit") ? {type: "temporalUnit"} : temporalUnit)], "postprocess": function (d) { return {temporalRelationship: d[0], filter: d[2], time: d[6], unit: d[8]}; }},
        {"name": "tempRel", "symbols": [(lexer.has("temporalRelationship") ? {type: "temporalRelationship"} : temporalRelationship), "_", (lexer.has("date") ? {type: "date"} : date), "_", (lexer.has("temporalRelationshipConnector") ? {type: "temporalRelationshipConnector"} : temporalRelationshipConnector), "_", (lexer.has("digits") ? {type: "digits"} : digits), "_", (lexer.has("temporalUnit") ? {type: "temporalUnit"} : temporalUnit)], "postprocess": function (d) { return {temporalRelationship: d[0], date: d[2], time: d[6], unit: d[8]}; }},
        {"name": "__$ebnf$1", "symbols": [(lexer.has("WS") ? {type: "WS"} : WS)]},
        {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
        {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": function(d) {return null }},
        {"name": "_$ebnf$1", "symbols": []},
        {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
        {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function(d) {return null }}
    ]
      , ParserStart: "query"
    }

/**
 * Namespace object and export
 */
var Herald = window.Herald || {};
Object.assign(Herald, {
  grammar: grammar,
});
window.Herald = Herald;


