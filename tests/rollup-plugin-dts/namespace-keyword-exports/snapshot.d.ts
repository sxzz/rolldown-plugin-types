// index.d.ts

//#region rolldown:runtime



//#endregion
//#region tests/rollup-plugin-dts/namespace-keyword-exports/foo.d.ts

declare namespace foo_d_exports {
  export { _in as in, }
}
declare const _in = "foo";

//#endregion
export { foo_d_exports as foo };