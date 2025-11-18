type EntityDeleteAction =
  | "script"
  | "screen"
  | "diagnosis"
  | "config_key"
  | "drugs_library"
  | "data_key"

type DeleteActionMetadata = {
  historyAction: string
  description: string
}

export const CHANGELOG_DELETE_ACTIONS: Record<EntityDeleteAction, DeleteActionMetadata> = {
  script: {
    historyAction: "delete_script",
    description: "Delete script",
  },
  screen: {
    historyAction: "delete_screen",
    description: "Delete screen",
  },
  diagnosis: {
    historyAction: "delete_diagnosis",
    description: "Delete diagnosis",
  },
  config_key: {
    historyAction: "delete_config_key",
    description: "Delete config key",
  },
  drugs_library: {
    historyAction: "delete_drugs_library_item",
    description: "Delete drugs library item",
  },
  data_key: {
    historyAction: "delete_data_key",
    description: "Delete data key",
  },
}

export function getDeleteActionMetadata(entity: EntityDeleteAction): DeleteActionMetadata {
  return CHANGELOG_DELETE_ACTIONS[entity]
}
