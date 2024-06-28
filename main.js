"use strict";

const NUM_LINES_TO_KEEP = 200;

const solveButton = document.getElementById("solve");
const dimacsCheckbox = document.getElementById("dimacs-cnf");
const example1Button = document.getElementById("example1");
const example2Button = document.getElementById("example2");
const input = document.getElementById("cnf");
const output = document.getElementById("output");
const config = document.getElementById("configuration");
const enumCheckbox = document.getElementById("enum-all");

loadExampleCNF1();

example1Button.addEventListener("click", loadExampleCNF1);
example2Button.addEventListener("click", loadExampleCNF2);
solveButton.addEventListener("click", solveCNF);

function loadExampleCNF1() {
  input.value = `c example1.cnf

c The parser will ignore the header and empty lines.
c Please provide one clause per line.
c '0' at the end of clauses can be omitted.
c Variable numbers do not need to be consecutive.

c The DIMACS CNF format works as long as each clause is defined on exactly one line.
c To parse multiline clauses or multiple clauses in one line, check "DIMACS CNF".
c See "example2.cnf" for more details.

1 2 3 0
-1 0
-2
c You can add comment lines anywhere.
5 10
-5

c Expected result:
c s SATISFIABLE
c v -1 -2 3 -5 10 0`;
}

function loadExampleCNF2() {
  input.value = `c example2.cnf

c This is an example of a DIMACS CNF file.
c Definition of DIMACS CNF format: https://people.sc.fsu.edu/~jburkardt/data/cnf/cnf.html

c The parser will follow the definition from the site above except:
c - It will ignore the header line.
c - Variable numbers do not need to be consecutive.

c Please make sure that "DIMACS CNF" is checked to parse multiline clauses or multiple clauses in one line.

1
2 3
0
-1 0 -2 0
5 10 0
-5
c You can skip adding '0' to the last clause.

c Expected result:
c s SATISFIABLE
c v -1 -2 3 -5 10 0`;
}

/**
 * @param {string} s
 */
function appendToTextarea(s) {
  output.value += s;

  const lines = output.value.split("\n");
  if (lines.length > NUM_LINES_TO_KEEP) {
    output.value = lines.slice(-NUM_LINES_TO_KEEP).join("\n");
  }
}

/**
 * solve CNF in textarea
 */
function solveCNF() {
  solveButton.disabled = true;

  output.value = "c parsing ...";
  let start = Date.now();
  const cnf = input.value;

  const parseWorker = new Worker("parse-worker.js");
  parseWorker.postMessage([cnf, dimacsCheckbox.checked]);

  parseWorker.onmessage = (e) => {
    const cls = e.data;

    if (typeof cls === "undefined") {
      appendToTextarea("\nc parse failed");
      solveButton.disabled = false;
      return;
    }

    appendToTextarea(`\nc done (${(Date.now() - start) / 1000} s)`);

    if (enumCheckbox.checked) {
      appendToTextarea("\nc enumerating ...");
      let isWriting = false;
      start = Date.now();
      const enumWorker = new Worker("enum-worker.js");
      enumWorker.postMessage([cls, config.value]);

      function appendToTextareaMutex(s, isLast) {
        if (isWriting) {
          setTimeout(() => appendToTextareaMutex(s, isLast), 10);
          return;
        }

        isWriting = true;
        appendToTextarea(s);
        isWriting = false;

        if (isLast) solveButton.disabled = false;
      }

      enumWorker.onmessage = (e) => {
        switch (e.data[1]) {
          case "UNKNOWN":
            appendToTextareaMutex(`\nc UNKNOWN (${(Date.now() - start) / 1000} s)`, true);
            break;
          case "UNSATISFIABLE":
            if (e.data[0] === 0) {
              appendToTextareaMutex(`\nc done (${(Date.now() - start) / 1000} s)\ns UNSATISFIABLE`, true);
            } else {
              appendToTextareaMutex(`\nc done; UNSAT (${(Date.now() - start) / 1000} s)`, true);
            }
            break;
          default:
            appendToTextareaMutex(`\nc model ${e.data[0]} (${(Date.now() - start) / 1000} s)\n${e.data[1]}`, false);
        }

        start = Date.now();
      };
    } else {
      appendToTextarea("\nc solving ...");
      start = Date.now();
      const solveWorker = new Worker("solve-worker.js");
      solveWorker.postMessage([cls, config.value]);

      solveWorker.onmessage = (e) => {
        appendToTextarea(`\nc done (${(Date.now() - start) / 1000} s)\n${e.data}`);
        solveButton.disabled = false;
      };
    }
  };
}
