"use strict";

importScripts("parse-cnf.js");

onmessage = (e) => {
  console.log("[parse-worker] Parse start");

  const cls = e.data[1] ? parseCNF2(e.data[0]) : parseCNF1(e.data[0]);

  console.log("[parse-worker] Parse end");
  postMessage(cls);
};
