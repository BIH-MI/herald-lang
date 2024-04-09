@{%
    let lexer = getHeraldLexer();
%}

@lexer lexer

query -> filter %WS:* temporalRelationship:? {% function (d) { return {filter: d[0], time: d[2]}; } %}
       | %aggregation %WS:* filter %WS:* temporalRelationship:? {% function (d) { return {aggregation: d[0], filter: d[2], time: d[4]}; } %}
       | %selection %WS:* filter %WS:* temporalRelationship:? {% function (d) { return {selection: d[0], filter: d[2], time: d[4]}; } %}
       | %relationship %WS:* filter %WS:* %conjunctionAnd %WS:* filter %WS:* temporalRelationship:? {% function (d) { return {relationship: d[0], filter1: d[2], filter2: d[6], time: d[8]}; } %}
       | existenceQuery %WS:* temporalRelationship:? {% function (d) { return {existence: d[0], time: d[2]}; } %}

existenceQuery -> %WS:* %existence %WS:* filter %WS:* {% function (d) { return {existence: d[1], filter: d[3]}; } %}
                | %WS:* existenceQuery %WS:* %conjunctionAnd %WS:* existenceQuery %WS:* {% function (d) { return {left: d[1], conjunction: d[3], right: d[5]}; } %}

filter -> %lparen expression %rparen {% function (d) { return {expression: d[1]}; } %}

expression -> %WS:* orExpression %WS:* {% function(d) { return d[1]; } %}

orExpression -> %WS:* andExpression %WS:* 
              ( %WS:* %conjunctionOr %WS:* andExpression %WS:*
              ):* {% function(d) { 
                      var result = d[1]; // andExpression
					  for (var i = 0; i < d[3].length; i++) { // d3 is optional groups in brackets, will be empty array if not present
					      var group = d[3][i]; // Next group
					      var conjunction = group[1]; // %conjunctionOr
					      var rightExpression = group[3]; // andExpression
					      result = {left: result, conjunction: conjunction, right: rightExpression};
					  }
					  return result;
				   } %}

andExpression -> %WS:* baseExpression %WS:* 
               ( %WS:* %conjunctionAnd %WS:* baseExpression %WS:*
               ):* {% function(d) { 
                        var result = d[1]; // baseExpression 
                        for (var i = 0; i < d[3].length; i++) { // d3 is optional groups in brackets, will be empty array if not present
	                        var group = d[3][i]; // Next group
	                        var conjunction = group[1]; // %conjunctionAnd
						    var rightExpression = group[3]; // baseExpression
                            result = {left: result, conjunction: conjunction, right: rightExpression};
                        }
                        return result; 
                    } %}

baseExpression -> %WS:* %lparen expression %rparen %WS:* {% function (d) { return {expression: d[2]}; } %}
                | %WS:* fieldExpression %WS:* {% function (d) { return {expression: d[1]}; } %}

fieldExpression -> %field %WS:* %comparator %WS:* %string {% function (d) { return {field: d[0], comparator: d[2], value: d[4]}; } %}
                 | %string %WS:* %comparator %WS:* %string {% function (d) { return {label: d[0], comparator: d[2], value: d[4]}; } %}
                 | %string {% function (d) { return {label: d[0]}; } %}

temporalRelationship -> %temporalRelationship %WS:* filter {% function (d) { return {temporalRelationship: d[0], filter: d[2]}; } %}
                      | %temporalRelationship %WS:* %date {% function (d) { return {temporalRelationship: d[0], date: d[2]}; } %}
                      | %temporalRelationship %WS:* filter %WS:* %temporalRelationshipConnector %WS:* %digits %WS:* %temporalUnit {% function (d) { return {temporalRelationship: d[0], filter: d[2], time: d[6], unit: d[8]}; } %}
			          | %temporalRelationship %WS:* %date %WS:* %temporalRelationshipConnector %WS:* %digits %WS:* %temporalUnit {% function (d) { return {temporalRelationship: d[0], date: d[2], time: d[6], unit: d[8]}; } %}