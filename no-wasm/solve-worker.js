"use strict";

importScripts("cadical-emscripten-no-wasm.js", "../cadical.js");

onmessage = (e) => {
  console.log("[solve-worker] Solve start (Without Wasm)");

  const cls = e.data[0];

  const cadical = new Cadical();
  switch (e.data[1]) {
    case "plain":
      cadical.initPlain();
      break;
    case "sat":
      cadical.initSat();
      break;
    case "unsat":
      cadical.initUnsat();
      break;
  }

  const vars = new Set();
  for (const cl of cls) {
    for (const lit of cl) {
      cadical.add(lit);
      vars.add(Math.abs(lit));
    }
    cadical.add(0);
  }

  const result = cadical.solve();
  let resultStr = "";
  if (typeof result === "undefined") {
    resultStr = "c UNKNOWN";
  } else if (result) {
    resultStr = "s SAT";
    const sortedVars = Array.from(vars).sort((a, b) => a - b);
    resultStr += `\nv ${cadical.model(sortedVars).join(" ")} 0`;
  } else {
    resultStr = "s UNSAT";
  }
  cadical.printStatistics();

  cadical.release();

  console.log("[solve-worker] Solve end");
  postMessage(resultStr);
};
