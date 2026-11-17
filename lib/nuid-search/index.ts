export { NUID_MANAGED, type NuidFieldSpec, type NuidOptionSpec } from "./constants";
export { getNuidTemplate, parseTemplateOptionValues } from "./template";
export {
  resolveNuidTemplate,
  indexDataKeysById,
  resolveNuidLibraryKeys,
  type NuidLibraryKey,
  type NuidResolution,
  type ResolvedNuidField,
  type NuidConflict,
} from "./resolve";
export { buildNuidProvisionPayload, type NuidProvisionKey } from "./provision";
export { isNuidManagedDataKey } from "./managed";
export {
  NUID_SEARCH_ROLES,
  NUID_FIELD_TYPE_LABELS,
  NUID_SUPPORTED_KEYS_DESCRIPTION,
  getNuidFieldTypeForDataKey,
  isNuidSupportedDataKey,
  isNuidSearchRole,
  inferNuidSearchRole,
  getLegacyNuidSearchBehaviour,
  getCompatibleNuidSearchRoles,
  describeLegacyNuidSearchBehaviour,
  getNuidSearchRole,
  getNuidSearchRoleLabel,
  parseNuidOptions,
  formatNuidOptions,
  validateNuidSearchFields,
  describeNuidField,
  getActiveNuidSearchFields,
  collectNuidSearchPublishErrors,
  applyLibraryKeyToNuidField,
  type NuidSearchRole,
  type NuidFieldType,
  type NuidSearchBehaviour,
  type NuidSearchFieldLike,
  type NuidLibraryKeyLike,
  type NuidFieldReport,
  type NuidLibraryKeyFull,
} from "./fields";
