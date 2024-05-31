"use strict";

/**
 * solve CNF in textarea
 */
function solveCNF() {
  button.disabled = true;

  output.value = "c parsing ...";
  let start = Date.now();
  const cnf = input.value;

  const parseWorker = new Worker(parseWorkerFile);
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
    const solveWorker = new Worker(solveWorkerFile);
    solveWorker.postMessage([cls, config.value]);

    solveWorker.onmessage = (e) => {
      output.value += `\nc done (${(Date.now() - start) / 1000} s)`;
      output.value += "\n" + e.data;
      button.disabled = false;
    };
  };
}
