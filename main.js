"use strict";

const button = document.getElementById("solve");
const input = document.getElementById("cnf");
const output = document.getElementById("output");
const config = document.getElementById("configuration");

input.value = `c Sample CNF
c
c The parser will ignore the header and empty lines.
c Please provide one clause per line.
c '0' at the end of clauses can be omitted.
c Variable numbers do not need to be consecutive.
1 2 3 0
-1 0
-2
5 10
-5
`;
button.addEventListener("click", solveCNF);

/**
 * solve CNF in textarea
 */
function solveCNF() {
  button.disabled = true;

  output.value = "c parsing ...";
  let start = Date.now();
  const cnf = input.value;

  const parseWorker = new Worker("parse-worker.js");
  parseWorker.postMessage(cnf);

  parseWorker.onmessage = (e) => {
    const cls = e.data;

    if (typeof cls === "undefined") {
      output.value = "c parse failed";
      button.disabled = false;
      return;
    }

    output.value += `\nc done (${(Date.now() - start) / 1000} s)`;

    output.value += "\nc solving ...";
    start = Date.now();
    const solveWorker = new Worker("solve-worker.js");
    solveWorker.postMessage([cls, config.value]);

    solveWorker.onmessage = (e) => {
      output.value += `\nc done (${(Date.now() - start) / 1000} s)`;
      output.value += "\n" + e.data;
      button.disabled = false;
    };
  };
}
