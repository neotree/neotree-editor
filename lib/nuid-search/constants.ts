/**
 * Value stored at `dataKey.metadata.managed` to mark a data key (and its option
 * children) as created for NUID Search. A provenance marker only: these keys
 * are edited, merged and deleted like any other key. See managed.ts.
 */
export const NUID_MANAGED = "nuid";

export type NuidOptionSpec = {
  value: string;
  label: string;
};

export type NuidFieldSpec = {
  key: string;
  type: string;
  label: string;
  condition?: string;
  options?: NuidOptionSpec[];
};
