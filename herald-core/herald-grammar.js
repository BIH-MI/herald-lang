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
        aggregation: ['AVERAGE', 'COUNT', 'SUM', 'MIN', 'MAX', 'MOST FREQUENT'],
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
    {"name": "query$ebnf$1", "symbols": []},
    {"name": "query$ebnf$1", "symbols": ["query$ebnf$1", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "query$ebnf$2", "symbols": ["temporalRelationship"], "postprocess": id},
    {"name": "query$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "query", "symbols": ["filter", "query$ebnf$1", "query$ebnf$2"], "postprocess": function (d) { return {filter: d[0], time: d[2]}; }},
    {"name": "query$ebnf$3", "symbols": []},
    {"name": "query$ebnf$3", "symbols": ["query$ebnf$3", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "query$ebnf$4", "symbols": []},
    {"name": "query$ebnf$4", "symbols": ["query$ebnf$4", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "query$ebnf$5", "symbols": ["temporalRelationship"], "postprocess": id},
    {"name": "query$ebnf$5", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "query", "symbols": [(lexer.has("aggregation") ? {type: "aggregation"} : aggregation), "query$ebnf$3", "filter", "query$ebnf$4", "query$ebnf$5"], "postprocess": function (d) { return {aggregation: d[0], filter: d[2], time: d[4]}; }},
    {"name": "query$ebnf$6", "symbols": []},
    {"name": "query$ebnf$6", "symbols": ["query$ebnf$6", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "query$ebnf$7", "symbols": []},
    {"name": "query$ebnf$7", "symbols": ["query$ebnf$7", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "query$ebnf$8", "symbols": ["temporalRelationship"], "postprocess": id},
    {"name": "query$ebnf$8", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "query", "symbols": [(lexer.has("selection") ? {type: "selection"} : selection), "query$ebnf$6", "filter", "query$ebnf$7", "query$ebnf$8"], "postprocess": function (d) { return {selection: d[0], filter: d[2], time: d[4]}; }},
    {"name": "query$ebnf$9", "symbols": []},
    {"name": "query$ebnf$9", "symbols": ["query$ebnf$9", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "query$ebnf$10", "symbols": []},
    {"name": "query$ebnf$10", "symbols": ["query$ebnf$10", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "query$ebnf$11", "symbols": []},
    {"name": "query$ebnf$11", "symbols": ["query$ebnf$11", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "query$ebnf$12", "symbols": []},
    {"name": "query$ebnf$12", "symbols": ["query$ebnf$12", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "query$ebnf$13", "symbols": ["temporalRelationship"], "postprocess": id},
    {"name": "query$ebnf$13", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "query", "symbols": [(lexer.has("relationship") ? {type: "relationship"} : relationship), "query$ebnf$9", "filter", "query$ebnf$10", (lexer.has("conjunctionAnd") ? {type: "conjunctionAnd"} : conjunctionAnd), "query$ebnf$11", "filter", "query$ebnf$12", "query$ebnf$13"], "postprocess": function (d) { return {relationship: d[0], filter1: d[2], filter2: d[6], time: d[8]}; }},
    {"name": "query$ebnf$14", "symbols": []},
    {"name": "query$ebnf$14", "symbols": ["query$ebnf$14", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "query$ebnf$15", "symbols": ["temporalRelationship"], "postprocess": id},
    {"name": "query$ebnf$15", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "query", "symbols": ["existenceQuery", "query$ebnf$14", "query$ebnf$15"], "postprocess": function (d) { return {existence: d[0], time: d[2]}; }},
    {"name": "existenceQuery$ebnf$1", "symbols": []},
    {"name": "existenceQuery$ebnf$1", "symbols": ["existenceQuery$ebnf$1", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "existenceQuery$ebnf$2", "symbols": []},
    {"name": "existenceQuery$ebnf$2", "symbols": ["existenceQuery$ebnf$2", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "existenceQuery$ebnf$3", "symbols": []},
    {"name": "existenceQuery$ebnf$3", "symbols": ["existenceQuery$ebnf$3", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "existenceQuery", "symbols": ["existenceQuery$ebnf$1", (lexer.has("existence") ? {type: "existence"} : existence), "existenceQuery$ebnf$2", "filter", "existenceQuery$ebnf$3"], "postprocess": function (d) { return {existence: d[1], filter: d[3]}; }},
    {"name": "existenceQuery$ebnf$4", "symbols": []},
    {"name": "existenceQuery$ebnf$4", "symbols": ["existenceQuery$ebnf$4", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "existenceQuery$ebnf$5", "symbols": []},
    {"name": "existenceQuery$ebnf$5", "symbols": ["existenceQuery$ebnf$5", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "existenceQuery$ebnf$6", "symbols": []},
    {"name": "existenceQuery$ebnf$6", "symbols": ["existenceQuery$ebnf$6", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "existenceQuery$ebnf$7", "symbols": []},
    {"name": "existenceQuery$ebnf$7", "symbols": ["existenceQuery$ebnf$7", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "existenceQuery", "symbols": ["existenceQuery$ebnf$4", "existenceQuery", "existenceQuery$ebnf$5", (lexer.has("conjunctionAnd") ? {type: "conjunctionAnd"} : conjunctionAnd), "existenceQuery$ebnf$6", "existenceQuery", "existenceQuery$ebnf$7"], "postprocess": function (d) { return {left: d[1], conjunction: d[3], right: d[5]}; }},
    {"name": "filter", "symbols": [(lexer.has("lparen") ? {type: "lparen"} : lparen), "expression", (lexer.has("rparen") ? {type: "rparen"} : rparen)], "postprocess": function (d) { return {expression: d[1]}; }},
    {"name": "expression$ebnf$1", "symbols": []},
    {"name": "expression$ebnf$1", "symbols": ["expression$ebnf$1", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "expression$ebnf$2", "symbols": []},
    {"name": "expression$ebnf$2", "symbols": ["expression$ebnf$2", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "expression", "symbols": ["expression$ebnf$1", "orExpression", "expression$ebnf$2"], "postprocess": function(d) { return d[1]; }},
    {"name": "orExpression$ebnf$1", "symbols": []},
    {"name": "orExpression$ebnf$1", "symbols": ["orExpression$ebnf$1", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "orExpression$ebnf$2", "symbols": []},
    {"name": "orExpression$ebnf$2", "symbols": ["orExpression$ebnf$2", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "orExpression$ebnf$3", "symbols": []},
    {"name": "orExpression$ebnf$3$subexpression$1$ebnf$1", "symbols": []},
    {"name": "orExpression$ebnf$3$subexpression$1$ebnf$1", "symbols": ["orExpression$ebnf$3$subexpression$1$ebnf$1", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "orExpression$ebnf$3$subexpression$1$ebnf$2", "symbols": []},
    {"name": "orExpression$ebnf$3$subexpression$1$ebnf$2", "symbols": ["orExpression$ebnf$3$subexpression$1$ebnf$2", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "orExpression$ebnf$3$subexpression$1$ebnf$3", "symbols": []},
    {"name": "orExpression$ebnf$3$subexpression$1$ebnf$3", "symbols": ["orExpression$ebnf$3$subexpression$1$ebnf$3", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "orExpression$ebnf$3$subexpression$1", "symbols": ["orExpression$ebnf$3$subexpression$1$ebnf$1", (lexer.has("conjunctionOr") ? {type: "conjunctionOr"} : conjunctionOr), "orExpression$ebnf$3$subexpression$1$ebnf$2", "andExpression", "orExpression$ebnf$3$subexpression$1$ebnf$3"]},
    {"name": "orExpression$ebnf$3", "symbols": ["orExpression$ebnf$3", "orExpression$ebnf$3$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "orExpression", "symbols": ["orExpression$ebnf$1", "andExpression", "orExpression$ebnf$2", "orExpression$ebnf$3"], "postprocess":  function(d) { 
                              var result = d[1]; // andExpression
        for (var i = 0; i < d[3].length; i++) { // d3 is optional groups in brackets, will be empty array if not present
            var group = d[3][i]; // Next group
            var conjunction = group[1]; // %conjunctionOr
            var rightExpression = group[3]; // andExpression
            result = {left: result, conjunction: conjunction, right: rightExpression};
        }
        return result;
        				   } },
    {"name": "andExpression$ebnf$1", "symbols": []},
    {"name": "andExpression$ebnf$1", "symbols": ["andExpression$ebnf$1", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "andExpression$ebnf$2", "symbols": []},
    {"name": "andExpression$ebnf$2", "symbols": ["andExpression$ebnf$2", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "andExpression$ebnf$3", "symbols": []},
    {"name": "andExpression$ebnf$3$subexpression$1$ebnf$1", "symbols": []},
    {"name": "andExpression$ebnf$3$subexpression$1$ebnf$1", "symbols": ["andExpression$ebnf$3$subexpression$1$ebnf$1", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "andExpression$ebnf$3$subexpression$1$ebnf$2", "symbols": []},
    {"name": "andExpression$ebnf$3$subexpression$1$ebnf$2", "symbols": ["andExpression$ebnf$3$subexpression$1$ebnf$2", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "andExpression$ebnf$3$subexpression$1$ebnf$3", "symbols": []},
    {"name": "andExpression$ebnf$3$subexpression$1$ebnf$3", "symbols": ["andExpression$ebnf$3$subexpression$1$ebnf$3", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "andExpression$ebnf$3$subexpression$1", "symbols": ["andExpression$ebnf$3$subexpression$1$ebnf$1", (lexer.has("conjunctionAnd") ? {type: "conjunctionAnd"} : conjunctionAnd), "andExpression$ebnf$3$subexpression$1$ebnf$2", "baseExpression", "andExpression$ebnf$3$subexpression$1$ebnf$3"]},
    {"name": "andExpression$ebnf$3", "symbols": ["andExpression$ebnf$3", "andExpression$ebnf$3$subexpression$1"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "andExpression", "symbols": ["andExpression$ebnf$1", "baseExpression", "andExpression$ebnf$2", "andExpression$ebnf$3"], "postprocess":  function(d) { 
                                var result = d[1]; // baseExpression 
                                for (var i = 0; i < d[3].length; i++) { // d3 is optional groups in brackets, will be empty array if not present
        	                        var group = d[3][i]; // Next group
        	                        var conjunction = group[1]; // %conjunctionAnd
        var rightExpression = group[3]; // baseExpression
                                    result = {left: result, conjunction: conjunction, right: rightExpression};
                                }
                                return result; 
                            } },
    {"name": "baseExpression$ebnf$1", "symbols": []},
    {"name": "baseExpression$ebnf$1", "symbols": ["baseExpression$ebnf$1", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "baseExpression$ebnf$2", "symbols": []},
    {"name": "baseExpression$ebnf$2", "symbols": ["baseExpression$ebnf$2", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "baseExpression", "symbols": ["baseExpression$ebnf$1", (lexer.has("lparen") ? {type: "lparen"} : lparen), "expression", (lexer.has("rparen") ? {type: "rparen"} : rparen), "baseExpression$ebnf$2"], "postprocess": function (d) { return {expression: d[2]}; }},
    {"name": "baseExpression$ebnf$3", "symbols": []},
    {"name": "baseExpression$ebnf$3", "symbols": ["baseExpression$ebnf$3", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "baseExpression$ebnf$4", "symbols": []},
    {"name": "baseExpression$ebnf$4", "symbols": ["baseExpression$ebnf$4", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "baseExpression", "symbols": ["baseExpression$ebnf$3", "fieldExpression", "baseExpression$ebnf$4"], "postprocess": function (d) { return {expression: d[1]}; }},
    {"name": "fieldExpression$ebnf$1", "symbols": []},
    {"name": "fieldExpression$ebnf$1", "symbols": ["fieldExpression$ebnf$1", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "fieldExpression$ebnf$2", "symbols": []},
    {"name": "fieldExpression$ebnf$2", "symbols": ["fieldExpression$ebnf$2", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "fieldExpression", "symbols": [(lexer.has("field") ? {type: "field"} : field), "fieldExpression$ebnf$1", (lexer.has("comparator") ? {type: "comparator"} : comparator), "fieldExpression$ebnf$2", (lexer.has("string") ? {type: "string"} : string)], "postprocess": function (d) { return {field: d[0], comparator: d[2], value: d[4]}; }},
    {"name": "fieldExpression$ebnf$3", "symbols": []},
    {"name": "fieldExpression$ebnf$3", "symbols": ["fieldExpression$ebnf$3", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "fieldExpression$ebnf$4", "symbols": []},
    {"name": "fieldExpression$ebnf$4", "symbols": ["fieldExpression$ebnf$4", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "fieldExpression", "symbols": [(lexer.has("string") ? {type: "string"} : string), "fieldExpression$ebnf$3", (lexer.has("comparator") ? {type: "comparator"} : comparator), "fieldExpression$ebnf$4", (lexer.has("string") ? {type: "string"} : string)], "postprocess": function (d) { return {label: d[0], comparator: d[2], value: d[4]}; }},
    {"name": "fieldExpression", "symbols": [(lexer.has("string") ? {type: "string"} : string)], "postprocess": function (d) { return {label: d[0]}; }},
    {"name": "temporalRelationship$ebnf$1", "symbols": []},
    {"name": "temporalRelationship$ebnf$1", "symbols": ["temporalRelationship$ebnf$1", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "temporalRelationship", "symbols": [(lexer.has("temporalRelationship") ? {type: "temporalRelationship"} : temporalRelationship), "temporalRelationship$ebnf$1", "filter"], "postprocess": function (d) { return {temporalRelationship: d[0], filter: d[2]}; }},
    {"name": "temporalRelationship$ebnf$2", "symbols": []},
    {"name": "temporalRelationship$ebnf$2", "symbols": ["temporalRelationship$ebnf$2", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "temporalRelationship", "symbols": [(lexer.has("temporalRelationship") ? {type: "temporalRelationship"} : temporalRelationship), "temporalRelationship$ebnf$2", (lexer.has("date") ? {type: "date"} : date)], "postprocess": function (d) { return {temporalRelationship: d[0], date: d[2]}; }},
    {"name": "temporalRelationship$ebnf$3", "symbols": []},
    {"name": "temporalRelationship$ebnf$3", "symbols": ["temporalRelationship$ebnf$3", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "temporalRelationship$ebnf$4", "symbols": []},
    {"name": "temporalRelationship$ebnf$4", "symbols": ["temporalRelationship$ebnf$4", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "temporalRelationship$ebnf$5", "symbols": []},
    {"name": "temporalRelationship$ebnf$5", "symbols": ["temporalRelationship$ebnf$5", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "temporalRelationship$ebnf$6", "symbols": []},
    {"name": "temporalRelationship$ebnf$6", "symbols": ["temporalRelationship$ebnf$6", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "temporalRelationship", "symbols": [(lexer.has("temporalRelationship") ? {type: "temporalRelationship"} : temporalRelationship), "temporalRelationship$ebnf$3", "filter", "temporalRelationship$ebnf$4", (lexer.has("temporalRelationshipConnector") ? {type: "temporalRelationshipConnector"} : temporalRelationshipConnector), "temporalRelationship$ebnf$5", (lexer.has("digits") ? {type: "digits"} : digits), "temporalRelationship$ebnf$6", (lexer.has("temporalUnit") ? {type: "temporalUnit"} : temporalUnit)], "postprocess": function (d) { return {temporalRelationship: d[0], filter: d[2], time: d[6], unit: d[8]}; }},
    {"name": "temporalRelationship$ebnf$7", "symbols": []},
    {"name": "temporalRelationship$ebnf$7", "symbols": ["temporalRelationship$ebnf$7", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "temporalRelationship$ebnf$8", "symbols": []},
    {"name": "temporalRelationship$ebnf$8", "symbols": ["temporalRelationship$ebnf$8", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "temporalRelationship$ebnf$9", "symbols": []},
    {"name": "temporalRelationship$ebnf$9", "symbols": ["temporalRelationship$ebnf$9", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "temporalRelationship$ebnf$10", "symbols": []},
    {"name": "temporalRelationship$ebnf$10", "symbols": ["temporalRelationship$ebnf$10", (lexer.has("WS") ? {type: "WS"} : WS)], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "temporalRelationship", "symbols": [(lexer.has("temporalRelationship") ? {type: "temporalRelationship"} : temporalRelationship), "temporalRelationship$ebnf$7", (lexer.has("date") ? {type: "date"} : date), "temporalRelationship$ebnf$8", (lexer.has("temporalRelationshipConnector") ? {type: "temporalRelationshipConnector"} : temporalRelationshipConnector), "temporalRelationship$ebnf$9", (lexer.has("digits") ? {type: "digits"} : digits), "temporalRelationship$ebnf$10", (lexer.has("temporalUnit") ? {type: "temporalUnit"} : temporalUnit)], "postprocess": function (d) { return {temporalRelationship: d[0], date: d[2], time: d[6], unit: d[8]}; }}
],
        ParserStart: "query"
    }

/**
 * Namespace object and export
 */
var Herald = window.Herald || {};
Object.assign(Herald, {
  grammar: grammar,
});
window.Herald = Herald;


