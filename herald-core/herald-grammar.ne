@{%
    let lexer = getHeraldLexer();
%}

@lexer lexer

query -> filter _ tempRel:? {% function (d) { return {filter: d[0], time: d[2]}; } %}
       | %aggregation _ filter _ tempRel:? {% function (d) { return {aggregation: d[0], filter: d[2], time: d[4]}; } %}
       | %selection _ filter _ tempRel:? {% function (d) { return {selection: d[0], filter: d[2], time: d[4]}; } %}
       | %relationship _ filter _ %conjunctionAnd _ filter _ tempRel:? {% function (d) { return {relationship: d[0], filter1: d[2], filter2: d[6], time: d[8]}; } %}
       | existenceQuery (_ %conjunctionAnd _ existenceQuery):* _ tempRel:? {% function (d) {
                                                                                var result = {existence: d[0]};
                                                                                for (var i = 0; i < d[1].length; i++) {
                                                                                    var conjunctionAnd = d[1][i][1];
                                                                                    var existenceQuery = d[1][i][3];
                                                                                    result = {left: result, conjunction: conjunctionAnd, right: existenceQuery};
                                                                                }
                                                                                return {existence: result, time: d[3]};
                                                                            } %}

existenceQuery -> %existence _ filter {% function(d) { return {existence: d[0], filter: d[2]}; } %}
 
filter -> %lparen _ expression _ %rparen {% function (d) {return {expression: d[2]}; } %}
 
expression -> orExpression {% function(d) { return d[0]; } %}
 
orExpression -> andExpression (_ %conjunctionOr _ andExpression):* {% function(d) {
                                                                        var result = d[0];
                                                                        for (var i = 0; i < d[1].length; i++) {
                                                                             var conjunctionOr = d[1][i][1];
                                                                             var andExpression = d[1][i][3];
                                                                             result = {left: result, conjunction: conjunctionOr, right: andExpression};
                                                                        }
                                                                        return result;
                                                                    } %}

andExpression -> baseExpression (_ %conjunctionAnd _ baseExpression):* {% function(d) {
                                                                            var result = d[0];
                                                                            for (var i = 0; i < d[1].length; i++) {
                                                                                var conjunctionAnd = d[1][i][1];
                                                                                var orExpression = d[1][i][3];
                                                                                result = {left: result, conjunction: conjunctionAnd, right: orExpression};
                                                                            }
                                                                            return result;
                                                                        } %}

baseExpression -> %lparen _ expression _ %rparen {% function (d) { return {expression: d[2]}; } %}
                | fieldExpression {% function (d) { return {expression: d[0]}; } %}
 
fieldExpression -> %field _ %comparator _ %string {% function (d) { return {field: d[0], comparator: d[2], value: d[4]}; } %}
                 | %string _ %comparator _ %string {% function (d) { return {label: d[0], comparator: d[2], value: d[4]}; } %}
                 | %string {% function (d) { return {label: d[0]}; } %}
 
tempRel -> %temporalRelationship _ filter {% function (d) { return {temporalRelationship: d[0], filter: d[2]}; } %}
         | %temporalRelationship _ %date {% function (d) { return {temporalRelationship: d[0], date: d[2]}; } %}
         | %temporalRelationship _ filter _ %temporalRelationshipConnector _ %digits _ %temporalUnit {% function (d) { return {temporalRelationship: d[0], filter: d[2], time: d[6], unit: d[8]}; } %}
         | %temporalRelationship _ %date _ %temporalRelationshipConnector _ %digits _ %temporalUnit {% function (d) { return {temporalRelationship: d[0], date: d[2], time: d[6], unit: d[8]}; } %}

# Whitespaces
__ -> %WS:+ {% function(d) {return null } %}
_ -> %WS:* {% function(d) {return null } %}