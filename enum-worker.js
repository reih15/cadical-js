"use strict";

importScripts("cadical-emscripten.js", "cadical.js");

onmessage = (e) => {
  console.log("[enum-worker] Enumerate start");

  Module.onRuntimeInitialized = () => {
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

    let i = 0;
    while (true) {
      const result = cadical.solve();
      if (typeof result === "undefined") {
        postMessage([i, "UNKNOWN"]);
        break;
      } else if (result) {
        i++;
        const sortedVars = Array.from(vars).sort((a, b) => a - b);
        const m = cadical.model(sortedVars);
        const modelStr = `v ${m.join(" ")} 0`;

        postMessage([i, modelStr]);

        cadical.addClause(m.map((v) => -v));
      } else {
        postMessage([i, "UNSATISFIABLE"]);
        break;
      }
    }
    cadical.printStatistics();

    cadical.release();

    console.log("[enum-worker] Enumerate end");
  };
};
