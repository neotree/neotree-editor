/**
 * Value stored at `dataKey.metadata.managed` to mark a data key (and its option
 * children) as provisioned for / owned by NUID Search. Managed keys get special
 * treatment: their `name` (key) and `dataType` are immutable — only the label
 * may change — and they cannot be deleted while managed. See [[managed]].
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
