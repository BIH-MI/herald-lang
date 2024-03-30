@{%
    let lexer = getHeraldLexer();
%}

@lexer lexer

query -> filter %WS:* temporalRelationship:? {% function (d) { return {filter: d[0], time: d[2]}; } %}
       | %aggregation %WS:* filter %WS:* temporalRelationship:? {% function (d) { return {aggregation: d[0], filter: d[2], time: d[4]}; } %}
       | %selection %WS:* filter %WS:* temporalRelationship:? {% function (d) { return {selection: d[0], filter: d[2], time: d[4]}; } %}
       | %comparison %WS:* filter %WS:* %conjunctionAnd %WS:* filter %WS:* temporalRelationship:? {% function (d) { return {comparison: d[0], filter1: d[2], filter2: d[6], time: d[8]}; } %}
       | searchQuery %WS:* temporalRelationship:? {% function (d) { return {search: d[0], time: d[2]}; } %}

searchQuery -> %WS:* %search %WS:* filter %WS:* {% function (d) { return {search: d[1], filter: d[3]}; } %}
                | %WS:* searchQuery %WS:* %conjunctionAnd %WS:* searchQuery %WS:* {% function (d) { return {left: d[1], conjunction: d[3], right: d[5]}; } %}

filter -> %lparen expression %rparen {% function (d) { return {expression: d[1]}; } %}

expression -> %WS:* fieldExpression %WS:* {% function (d) { return {expression: d[1]}; } %}
            | %WS:* expression %WS:* conjunction %WS:* expression %WS:* {% function (d) { return {left: d[1], conjunction: d[3], right: d[5]}; } %}
            | %WS:* %lparen expression %rparen %WS:* {% function (d) { return {expression: d[2]}; } %}

fieldExpression -> %field %WS:* %comparator %WS:* %string {% function (d) { return {field: d[0], comparator: d[2], value: d[4]}; } %}
                 | %string %WS:* %comparator %WS:* %string {% function (d) { return {label: d[0], comparator: d[2], value: d[4]}; } %}
                 | %string {% function (d) { return {label: d[0]}; } %}

conjunction -> %conjunctionAnd {% function (d) { return d[0]; } %}
             | %conjunctionOr {% function (d) { return d[0]; } %}

temporalRelationship -> %temporalRelationship %WS:* filter {% function (d) { return {temporalRelationship: d[0], filter: d[2]}; } %}
                      | %temporalRelationship %WS:* %date {% function (d) { return {temporalRelationship: d[0], date: d[2]}; } %}
                      | %temporalRelationship %WS:* filter %WS:* %temporalRelationshipConnector %WS:* %digits %WS:* %temporalUnit {% function (d) { return {temporalRelationship: d[0], filter: d[2], time: d[6], unit: d[8]}; } %}
			          | %temporalRelationship %WS:* %date %WS:* %temporalRelationshipConnector %WS:* %digits %WS:* %temporalUnit {% function (d) { return {temporalRelationship: d[0], date: d[2], time: d[6], unit: d[8]}; } %}