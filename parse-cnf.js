"use strict";

/**
 * @param {string} cnf - CNF string (header or trailing zero can be omitted)
 * @return {number[][]} clauses (undefined: parse error)
 */
function parseCNF(cnf) {
  const cls = [];
  for (const line of cnf.split("\n")) {
    const lineTrimmed = line.trim();

    if (lineTrimmed === "" || lineTrimmed.startsWith("p") || lineTrimmed.startsWith("c")) continue;

    const cl = [];
    for (const s of lineTrimmed.split(/\s+/)) {
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

    cls.push(cl);
  }
  return cls;
}
