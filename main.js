"use strict";

input.value = `c Sample CNF
c
c The parser will ignore the header and empty lines.
c Please provide one clause per line.
c '0' at the end of clauses can be omitted.
1 2 3
-1 0
-2 0
`;
button.addEventListener("click", solveCNF);
