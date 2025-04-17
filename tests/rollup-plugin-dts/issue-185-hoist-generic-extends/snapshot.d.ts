// index.d.ts

//#region rolldown:runtime



//#endregion
//#region tests/rollup-plugin-dts/issue-185-hoist-generic-extends/a.d.ts

declare namespace a_d_exports {
  export { Props, System, }
}
declare type Props = Record<string, number>;
declare class System<T extends Props> {
  _obj: T;
  constructor(src: T);
}

//#endregion
export { a_d_exports as A };