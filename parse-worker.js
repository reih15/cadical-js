"use strict";

importScripts("parse-cnf.js");

onmessage = (e) => {
  console.log("[parse-worker] Parse start");

  const cls = parseCNF(e.data);

  console.log("[parse-worker] Parse end");
  postMessage(cls);
};
