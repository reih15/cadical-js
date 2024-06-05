"use strict";

/**
 * @param {string} cnf - CNF string (header or '0' at the end of clauses can be omitted)
 * @return {number[][]} clauses (undefined: parse error)
 */
function parseCNF1(cnf) {
  const cls = [];
  for (const line of cnf.split("\n")) {
    const lineTrimmed = line.trim();
    if (lineTrimmed === "" || lineTrimmed.startsWith("p") || lineTrimmed.startsWith("c")) continue;

    const cl = parseClause(lineTrimmed);
    if (typeof cl === "undefined") return undefined;

    cls.push(cl);
  }
  return cls;
}

/**
 * @param {string} cnf - DIMACS CNF string (header can be omitted)
 * @return {number[][]} clauses (undefined: parse error)
 */
function parseCNF2(cnf) {
  const cls = [];
  let lits = [];
  for (const line of cnf.split("\n")) {
    const lineTrimmed = line.trim();
    if (lineTrimmed === "" || lineTrimmed.startsWith("p") || lineTrimmed.startsWith("c")) continue;

    for (const s of lineTrimmed.split(/\s+/)) {
      if (s === "0") {
        const cl = parseClause(lits.join(" "));
        if (typeof cl === "undefined") return undefined;

        cls.push(cl);
        lits = [];
      } else {
        lits.push(s);
      }
    }
  }

  if (lits.length > 0) {
    const cl = parseClause(lits.join(" "));
    if (typeof cl === "undefined") return undefined;

    cls.push(cl);
  }

  return cls;
}

/**
 * @param {string} clauseStr - clause string
 * @return {number[]} clause (undefined: parse error)
 */
function parseClause(clauseStr) {
  const clauseStrTrimmed = clauseStr.trim();
  if (clauseStrTrimmed === "") return [];

  const cl = [];
  for (const s of clauseStrTrimmed.split(/\s+/)) {
    const n1 = Number(s);
    const n2 = parseInt(s);
    if (!isNaN(n1) && n1 === n2) {
      cl.push(n2);
    } else {
      return undefined;
    }
  }

  if (cl.at(-1) === 0) cl.pop();
  if (cl.includes(0)) return undefined;

  return cl;
}
