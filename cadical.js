"use strict";

class Cadical {
  constructor() {
    this.solverPtr = undefined;
    this.init();
  }

  init() {
    this.release();
    this.solverPtr = Module.ccall("ccadical_init", "number", [], []);
    console.log(`[Cadical.init] ${this.solverPtr}`);
  }

  initPlain() {
    this.init();
    this.setOption("compact", 0);
    this.setOption("decompose", 0);
    this.setOption("deduplicate", 0);
    this.setOption("elim", 0);
    this.setOption("probe", 0);
    this.setOption("subsume", 0);
    this.setOption("ternary", 0);
    this.setOption("transred", 0);
    this.setOption("vivify", 0);
  }

  initSat() {
    this.init();
    this.setOption("elimreleff", 10);
    this.setOption("stabilizeonly", 1);
    this.setOption("subsumereleff", 60);
  }

  initUnsat() {
    this.init();
    this.setOption("stabilize", 0);
    this.setOption("walk", 0);
  }

  release() {
    if (typeof this.solverPtr !== "undefined") {
      console.log(`[Cadical.release] ${this.solverPtr}`);
      Module.ccall("ccadical_release", null, ["number"], [this.solverPtr]);
    }
    this.solverPtr = undefined;
  }

  /**
   * @return {string}
   */
  signature() {
    return Module.ccall("ccadical_signature", "string", [], []);
  }

  /**
   * @param {number} litOrZero
   */
  add(litOrZero) {
    Module.ccall("ccadical_add", null, ["number", "number"], [this.solverPtr, litOrZero]);
  }

  /**
   * @param {number[]} clause
   */
  addClause(clause) {
    for (const lit of clause) {
      this.add(lit);
    }
    this.add(0);
  }

  /**
   * @param {number} lit
   */
  assume(lit) {
    console.log(`[Cadical.assume] ${lit}`);
    Module.ccall("ccadical_assume", null, ["number", "number"], [this.solverPtr, lit]);
  }

  /**
   * @return {boolean} true: SAT, false: UNSAT, undefined: UNKNOWN
   */
  solve() {
    console.log("[Cadical.solve] Start");
    const result = Module.ccall("ccadical_solve", "number", ["number"], [this.solverPtr]);
    console.log("[Cadical.solve] End");
    if (result === 10) {
      return true;
    } else if (result === 20) {
      return false;
    } else {
      return undefined;
    }
  }

  /**
   * @param {number} lit
   * @return {number}
   */
  value(lit) {
    const v = Module.ccall("ccadical_val", "number", ["number", "number"], [this.solverPtr, lit]);
    if (v === 0) {
      return lit;
    } else {
      return v;
    }
  }

  /**
   * @param {number[]} vars
   * @return {number[]}
   */
  model(vars) {
    return vars.map((v) => this.value(v));
  }

  /**
   * @param {number} litOrZero
   */
  constrain(litOrZero) {
    console.log(`[Cadical.constrain] ${litOrZero}`);
    Module.ccall("ccadical_constrain", null, ["number", "number"], [this.solverPtr, litOrZero]);
  }

  /**
   * @param {number[]} clause
   */
  constrainClause(clause) {
    for (const lit of clause) {
      this.constrain(lit);
    }
    this.constrain(0);
  }

  /**
   * @param {string} name
   * @param {number} v
   */
  setOption(name, v) {
    console.log(`[Cadical.setOption] ${name} = ${v}`);
    Module.ccall("ccadical_set_option", null, ["number", "string", "number"], [this.solverPtr, name, v]);
  }

  printStatistics() {
    Module.ccall("ccadical_print_statistics", null, ["number"], [this.solverPtr]);
  }
}
