export type MailerSettingsItemSelect = {
    id: number;
    settingId: string;
    name: string;
    service: "gmail" | "smtp";
    authUsername: string;
    authPassword: string;
    authType: string | null;
    authMethod: string | null;
    host: string;
    port: number | null;
    encryption: string;
    fromAddress: string;
    fromName: string;
    isActive: boolean;
    secure: boolean;
};

export type MailerSettingsItemInsert = {
    id?: number | undefined;
    settingId?: string | undefined;
    name: string;
    service: "gmail" | "smtp";
    authUsername: string;
    authPassword: string;
    authType?: (string | null) | undefined;
    authMethod?: (string | null) | undefined;
    host?: string | undefined;
    port?: (number | null) | undefined;
    encryption?: string | undefined;
    fromAddress?: string | undefined;
    fromName?: string | undefined;
    isActive?: boolean | undefined;
    secure?: boolean | undefined;
};

export type EmailTemplateSelect = {
    id: number;
    templateId: string;
    name: string;
    data: EmailTemplateSelect;
};

export type EmailTemplateInsert = {
    id?: number | undefined;
    templateId?: string | undefined;
    name: string;
    data: EmailTemplateInsert;
};

export type SysItemSelect = {
    _id: number;
    id: string;
    key: string;
    value: string;
};

export type SysItemInsert = {
    _id?: number | undefined;
    id?: string | undefined;
    key: string;
    value: string;
};

export type TokenSelect = {
    id: number;
    token: number;
    userId: string | null;
    validUntil: Date;
};

export type TokenInsert = {
    id?: number | undefined;
    token: number;
    userId?: (string | null) | undefined;
    validUntil: Date;
};

export type UserRoleSelect = {
    id: number;
    name: "user" | "admin" | "super_user";
    description: string | null;
};

export type UserRoleInsert = {
    id?: number | undefined;
    name: "user" | "admin" | "super_user";
    description?: (string | null) | undefined;
};

export type LanguageSelect = {
    id: number;
    name: string;
    iso: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};

export type LanguageInsert = {
    id?: number | undefined;
    name: string;
    iso: string;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    deletedAt?: (Date | null) | undefined;
};

export type UserSelect = {
    id: number;
    userId: string;
    role: "user" | "admin" | "super_user";
    email: string;
    password: string;
    displayName: string;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
    avatar_sm: string | null;
    avatar_md: string | null;
    activationDate: Date | null;
    lastLoginDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};

export type UserInsert = {
    id?: number | undefined;
    userId?: string | undefined;
    role?: ("user" | "admin" | "super_user") | undefined;
    email: string;
    password: string;
    displayName: string;
    firstName?: (string | null) | undefined;
    lastName?: (string | null) | undefined;
    avatar?: (string | null) | undefined;
    avatar_sm?: (string | null) | undefined;
    avatar_md?: (string | null) | undefined;
    activationDate?: (Date | null) | undefined;
    lastLoginDate?: (Date | null) | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    deletedAt?: (Date | null) | undefined;
};

export type AuthClientSelect = {
    id: number;
    clientId: string;
    clientToken: string;
    userId: string | null;
    validUntil: Date | null;
    createdAt: Date;
};

export type AuthClientInsert = {
    id?: number | undefined;
    clientId?: string | undefined;
    clientToken: string;
    userId?: (string | null) | undefined;
    validUntil?: (Date | null) | undefined;
    createdAt?: Date | undefined;
};

export type ApiKeySelect = {
    id: number;
    apiKeyId: string;
    apiKey: string;
    validUntil: Date | null;
    createdAt: Date;
};

export type ApiKeyInsert = {
    id?: number | undefined;
    apiKeyId?: string | undefined;
    apiKey?: string | undefined;
    validUntil?: (Date | null) | undefined;
    createdAt?: Date | undefined;
};

export type SiteSelect = {
    id: number;
    siteId: string;
    name: string;
    link: string;
    apiKey: string;
    type: "nodeapi" | "webeditor";
    env: "production" | "stage" | "development" | "demo";
    displayName: string | null;
    countryISO: string | null;
    countryName: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};

export type SiteInsert = {
    id?: number | undefined;
    siteId?: string | undefined;
    name: string;
    link: string;
    apiKey: string;
    type: "nodeapi" | "webeditor";
    env?: ("production" | "stage" | "development" | "demo") | undefined;
    displayName?: (string | null) | undefined;
    countryISO?: (string | null) | undefined;
    countryName?: (string | null) | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    deletedAt?: (Date | null) | undefined;
};

export type HospitalSelect = {
    id: number;
    hospitalId: string;
    oldHospitalId: string | null;
    name: string;
    country: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};

export type HospitalInsert = {
    id?: number | undefined;
    hospitalId?: string | undefined;
    oldHospitalId?: (string | null) | undefined;
    name: string;
    country?: (string | null) | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    deletedAt?: (Date | null) | undefined;
};

export type EditorInfoSelect = {
    id: number;
    dataVersion: number;
    lastPublishDate: Date | null;
    lastDataKeysSyncDate: Date | null;
};

export type EditorInfoInsert = {
    id?: number | undefined;
    dataVersion?: number | undefined;
    lastPublishDate?: (Date | null) | undefined;
    lastDataKeysSyncDate?: (Date | null) | undefined;
};

export type DeviceSelect = {
    id: number;
    deviceId: string;
    deviceHash: string;
    details: DeviceSelect | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};

export type DeviceInsert = {
    id?: number | undefined;
    deviceId: string;
    deviceHash: string;
    details?: (DeviceInsert | null) | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    deletedAt?: (Date | null) | undefined;
};

export type FileSelect = {
    id: number;
    fileId: string;
    ownerId: string | null;
    filename: string;
    contentType: string;
    size: number;
    metadata: FileSelect;
    data?: any;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};

export type FileInsert = {
    id?: number | undefined;
    fileId?: string | undefined;
    ownerId?: (string | null) | undefined;
    filename: string;
    contentType: string;
    size: number;
    metadata?: FileInsert | undefined;
    data?: any;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    deletedAt?: (Date | null) | undefined;
};

export type FileChunkSelect = {
    id: number;
    chunkId: string;
    fileId: string;
    data?: any;
};

export type FileChunkInsert = {
    id?: number | undefined;
    chunkId?: string | undefined;
    fileId: string;
    data?: any;
};

export type ConfigKeySelect = {
    id: number;
    configKeyId: string;
    oldConfigKeyId: string | null;
    position: number;
    version: number;
    key: string;
    label: string;
    summary: string;
    source: string | null;
    preferences: ConfigKeySelect;
    publishDate: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};

export type ConfigKeyInsert = {
    id?: number | undefined;
    configKeyId?: string | undefined;
    oldConfigKeyId?: (string | null) | undefined;
    position: number;
    version: number;
    key: string;
    label: string;
    summary: string;
    source?: (string | null) | undefined;
    preferences?: ConfigKeyInsert | undefined;
    publishDate?: Date | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    deletedAt?: (Date | null) | undefined;
};

export type ConfigKeyDraftSelect = {
    id: number;
    configKeyDraftId: string;
    configKeyId: string | null;
    position: number;
    data: ConfigKeyDraftSelect;
    createdByUserId: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export type ConfigKeyDraftInsert = {
    id?: number | undefined;
    configKeyDraftId?: string | undefined;
    configKeyId?: (string | null) | undefined;
    position: number;
    data: ConfigKeyDraftInsert;
    createdByUserId?: (string | null) | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
};

export type ConfigKeyHistoryItemSelect = {
    id: number;
    version: number;
    configKeyId: string;
    restoreKey: string | null;
    changes: ConfigKeyHistoryItemSelect | null;
    createdAt: Date;
};

export type ConfigKeyHistoryItemInsert = {
    id?: number | undefined;
    version: number;
    configKeyId: string;
    restoreKey?: (string | null) | undefined;
    changes?: (ConfigKeyHistoryItemInsert | null) | undefined;
    createdAt?: Date | undefined;
};

export type DrugsLibraryItemSelect = {
    id: number;
    itemId: string;
    key: string;
    keyId: string;
    type: "drug" | "fluid" | "feed";
    drug: string;
    minGestation: number | null;
    maxGestation: number | null;
    minWeight: number | null;
    maxWeight: number | null;
    minAge: number | null;
    maxAge: number | null;
    hourlyFeed: number | null;
    hourlyFeedDivider: number | null;
    dosage: number | null;
    dosageMultiplier: number | null;
    dayOfLife: string;
    dosageText: string;
    managementText: string;
    gestationKey: string;
    weightKey: string;
    diagnosisKey: string;
    ageKey: string;
    ageKeyId: string;
    gestationKeyId: string;
    weightKeyId: string;
    diagnosisKeyId: string;
    administrationFrequency: string;
    drugUnit: string;
    routeOfAdministration: string;
    position: number;
    condition: string;
    calculator_condition: string;
    validationType: ("default" | "condition") | null;
    version: number;
    publishDate: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};

export type DrugsLibraryItemInsert = {
    id?: number | undefined;
    itemId?: string | undefined;
    key: string;
    keyId?: string | undefined;
    type?: ("drug" | "fluid" | "feed") | undefined;
    drug?: string | undefined;
    minGestation?: (number | null) | undefined;
    maxGestation?: (number | null) | undefined;
    minWeight?: (number | null) | undefined;
    maxWeight?: (number | null) | undefined;
    minAge?: (number | null) | undefined;
    maxAge?: (number | null) | undefined;
    hourlyFeed?: (number | null) | undefined;
    hourlyFeedDivider?: (number | null) | undefined;
    dosage?: (number | null) | undefined;
    dosageMultiplier?: (number | null) | undefined;
    dayOfLife?: string | undefined;
    dosageText?: string | undefined;
    managementText?: string | undefined;
    gestationKey?: string | undefined;
    weightKey?: string | undefined;
    diagnosisKey?: string | undefined;
    ageKey?: string | undefined;
    ageKeyId?: string | undefined;
    gestationKeyId?: string | undefined;
    weightKeyId?: string | undefined;
    diagnosisKeyId?: string | undefined;
    administrationFrequency?: string | undefined;
    drugUnit?: string | undefined;
    routeOfAdministration?: string | undefined;
    position: number;
    condition?: string | undefined;
    calculator_condition?: string | undefined;
    validationType?: (("default" | "condition") | null) | undefined;
    version: number;
    publishDate?: Date | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    deletedAt?: (Date | null) | undefined;
};

export type DrugsLibraryItemDraftSelect = {
    id: number;
    itemDraftId: string;
    itemId: string | null;
    key: string;
    type: "drug" | "fluid" | "feed";
    position: number;
    data: DrugsLibraryItemDraftSelect;
    createdByUserId: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export type DrugsLibraryItemDraftInsert = {
    id?: number | undefined;
    itemDraftId?: string | undefined;
    itemId?: (string | null) | undefined;
    key: string;
    type?: ("drug" | "fluid" | "feed") | undefined;
    position: number;
    data: DrugsLibraryItemDraftInsert;
    createdByUserId?: (string | null) | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
};

export type DrugsLibraryItemHistoryItemSelect = {
    id: number;
    version: number;
    itemId: string;
    restoreKey: string | null;
    changes: DrugsLibraryItemHistoryItemSelect | null;
    createdAt: Date;
};

export type DrugsLibraryItemHistoryItemInsert = {
    id?: number | undefined;
    version: number;
    itemId: string;
    restoreKey?: (string | null) | undefined;
    changes?: (DrugsLibraryItemHistoryItemInsert | null) | undefined;
    createdAt?: Date | undefined;
};

export type ScriptSelect = {
    id: number;
    scriptId: string;
    oldScriptId: string | null;
    version: number;
    type: "admission" | "discharge" | "neolab" | "drecord" | "dff_calculator";
    position: number;
    source: string | null;
    title: string;
    printTitle: string;
    description: string;
    hospitalId: string | null;
    exportable: boolean;
    nuidSearchEnabled: boolean;
    nuidSearchFields: ScriptSelect;
    reviewable: boolean;
    reviewConfigurations: ScriptSelect;
    preferences: ScriptSelect;
    printConfig: ScriptSelect;
    printSections: ScriptSelect;
    publishDate: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};

export type ScriptInsert = {
    id?: number | undefined;
    scriptId?: string | undefined;
    oldScriptId?: (string | null) | undefined;
    version: number;
    type?: ("admission" | "discharge" | "neolab" | "drecord" | "dff_calculator") | undefined;
    position: number;
    source?: (string | null) | undefined;
    title: string;
    printTitle: string;
    description?: string | undefined;
    hospitalId?: (string | null) | undefined;
    exportable?: boolean | undefined;
    nuidSearchEnabled?: boolean | undefined;
    nuidSearchFields?: ScriptInsert | undefined;
    reviewable?: boolean | undefined;
    reviewConfigurations?: ScriptInsert | undefined;
    preferences?: ScriptInsert | undefined;
    printConfig?: ScriptInsert | undefined;
    printSections?: ScriptInsert | undefined;
    publishDate?: Date | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    deletedAt?: (Date | null) | undefined;
};

export type ScriptDraftSelect = {
    id: number;
    scriptDraftId: string;
    scriptId: string | null;
    position: number;
    hospitalId: string | null;
    data: ScriptDraftSelect;
    createdByUserId: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export type ScriptDraftInsert = {
    id?: number | undefined;
    scriptDraftId?: string | undefined;
    scriptId?: (string | null) | undefined;
    position: number;
    hospitalId?: (string | null) | undefined;
    data: ScriptDraftInsert;
    createdByUserId?: (string | null) | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
};

export type ScriptHistoryItemSelect = {
    id: number;
    version: number;
    scriptId: string;
    restoreKey: string | null;
    changes: ScriptHistoryItemSelect | null;
    createdAt: Date;
};

export type ScriptHistoryItemInsert = {
    id?: number | undefined;
    version: number;
    scriptId: string;
    restoreKey?: (string | null) | undefined;
    changes?: (ScriptHistoryItemInsert | null) | undefined;
    createdAt?: Date | undefined;
};

export type ScreenSelect = {
    id: number;
    screenId: string;
    oldScreenId: string | null;
    oldScriptId: string | null;
    version: number;
    scriptId: string;
    type: "diagnosis" | "checklist" | "form" | "management" | "multi_select" | "single_select" | "progress" | "timer" | "yesno" | "drugs" | "fluids" | "feeds" | "zw_edliz_summary_table" | "mwi_edliz_summary_table" | "edliz_summary_table" | "dynamic_form";
    position: number;
    source: string | null;
    sectionTitle: string;
    previewTitle: string;
    previewPrintTitle: string;
    condition: string;
    skipToCondition: string;
    skipToScreenId: string | null;
    epicId: string;
    storyId: string;
    refId: string;
    refIdDataKey: string;
    refKey: string;
    refKeyDataKey: string;
    step: string;
    actionText: string;
    contentText: string;
    contentTextImage: ScreenSelect | null;
    infoText: string;
    title: string;
    title1: string;
    title2: string;
    title3: string;
    title4: string;
    text1: string;
    text2: string;
    text3: string;
    image1: ScreenSelect | null;
    image2: ScreenSelect | null;
    image3: ScreenSelect | null;
    instructions: string;
    instructions2: string;
    instructions3: string;
    instructions4: string;
    hcwDiagnosesInstructions: string;
    suggestedDiagnosesInstructions: string;
    notes: string;
    dataType: string;
    key: string;
    keyId: string;
    label: string;
    negativeLabel: string;
    positiveLabel: string;
    timerValue: number | null;
    multiplier: number | null;
    minValue: number | null;
    maxValue: number | null;
    exportable: boolean;
    printable: boolean | null;
    skippable: boolean;
    confidential: boolean;
    prePopulate: ScreenSelect;
    fields: ScreenSelect;
    items: ScreenSelect;
    preferences: ScreenSelect;
    drugs: ScreenSelect;
    fluids: ScreenSelect;
    feeds: ScreenSelect;
    reasons: ScreenSelect;
    listStyle: "none" | "number" | "bullet";
    publishDate: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    collectionName: string;
    collectionLabel: string;
    repeatable: boolean | null;
};

export type ScreenInsert = {
    id?: number | undefined;
    screenId?: string | undefined;
    oldScreenId?: (string | null) | undefined;
    oldScriptId?: (string | null) | undefined;
    version: number;
    scriptId: string;
    type: "diagnosis" | "checklist" | "form" | "management" | "multi_select" | "single_select" | "progress" | "timer" | "yesno" | "drugs" | "fluids" | "feeds" | "zw_edliz_summary_table" | "mwi_edliz_summary_table" | "edliz_summary_table" | "dynamic_form";
    position: number;
    source?: (string | null) | undefined;
    sectionTitle: string;
    previewTitle?: string | undefined;
    previewPrintTitle?: string | undefined;
    condition?: string | undefined;
    skipToCondition?: string | undefined;
    skipToScreenId?: (string | null) | undefined;
    epicId?: string | undefined;
    storyId?: string | undefined;
    refId?: string | undefined;
    refIdDataKey?: string | undefined;
    refKey?: string | undefined;
    refKeyDataKey?: string | undefined;
    step?: string | undefined;
    actionText?: string | undefined;
    contentText?: string | undefined;
    contentTextImage?: (ScreenInsert | null) | undefined;
    infoText?: string | undefined;
    title: string;
    title1?: string | undefined;
    title2?: string | undefined;
    title3?: string | undefined;
    title4?: string | undefined;
    text1?: string | undefined;
    text2?: string | undefined;
    text3?: string | undefined;
    image1?: (ScreenInsert | null) | undefined;
    image2?: (ScreenInsert | null) | undefined;
    image3?: (ScreenInsert | null) | undefined;
    instructions?: string | undefined;
    instructions2?: string | undefined;
    instructions3?: string | undefined;
    instructions4?: string | undefined;
    hcwDiagnosesInstructions?: string | undefined;
    suggestedDiagnosesInstructions?: string | undefined;
    notes?: string | undefined;
    dataType?: string | undefined;
    key?: string | undefined;
    keyId?: string | undefined;
    label?: string | undefined;
    negativeLabel?: string | undefined;
    positiveLabel?: string | undefined;
    timerValue?: (number | null) | undefined;
    multiplier?: (number | null) | undefined;
    minValue?: (number | null) | undefined;
    maxValue?: (number | null) | undefined;
    exportable?: boolean | undefined;
    printable?: (boolean | null) | undefined;
    skippable?: boolean | undefined;
    confidential?: boolean | undefined;
    prePopulate?: ScreenInsert | undefined;
    fields?: ScreenInsert | undefined;
    items?: ScreenInsert | undefined;
    preferences?: ScreenInsert | undefined;
    drugs?: ScreenInsert | undefined;
    fluids?: ScreenInsert | undefined;
    feeds?: ScreenInsert | undefined;
    reasons?: ScreenInsert | undefined;
    listStyle?: ("none" | "number" | "bullet") | undefined;
    publishDate?: Date | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    deletedAt?: (Date | null) | undefined;
    collectionName?: string | undefined;
    collectionLabel?: string | undefined;
    repeatable?: (boolean | null) | undefined;
};

export type ScreenDraftSelect = {
    id: number;
    screenDraftId: string;
    screenId: string | null;
    scriptId: string | null;
    scriptDraftId: string | null;
    type: "diagnosis" | "checklist" | "form" | "management" | "multi_select" | "single_select" | "progress" | "timer" | "yesno" | "drugs" | "fluids" | "feeds" | "zw_edliz_summary_table" | "mwi_edliz_summary_table" | "edliz_summary_table" | "dynamic_form";
    position: number;
    data: ScreenDraftSelect;
    createdByUserId: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export type ScreenDraftInsert = {
    id?: number | undefined;
    screenDraftId?: string | undefined;
    screenId?: (string | null) | undefined;
    scriptId?: (string | null) | undefined;
    scriptDraftId?: (string | null) | undefined;
    type: "diagnosis" | "checklist" | "form" | "management" | "multi_select" | "single_select" | "progress" | "timer" | "yesno" | "drugs" | "fluids" | "feeds" | "zw_edliz_summary_table" | "mwi_edliz_summary_table" | "edliz_summary_table" | "dynamic_form";
    position: number;
    data: ScreenDraftInsert;
    createdByUserId?: (string | null) | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
};

export type ScreenHistoryItemSelect = {
    id: number;
    version: number;
    screenId: string;
    scriptId: string;
    restoreKey: string | null;
    changes: ScreenHistoryItemSelect | null;
    createdAt: Date;
};

export type ScreenHistoryItemInsert = {
    id?: number | undefined;
    version: number;
    screenId: string;
    scriptId: string;
    restoreKey?: (string | null) | undefined;
    changes?: (ScreenHistoryItemInsert | null) | undefined;
    createdAt?: Date | undefined;
};

export type DiagnosisSelect = {
    id: number;
    diagnosisId: string;
    oldDiagnosisId: string | null;
    oldScriptId: string | null;
    version: number;
    scriptId: string;
    position: number;
    source: string | null;
    expression: string;
    name: string;
    description: string;
    key: string | null;
    keyId: string;
    severityOrder: number | null;
    expressionMeaning: string;
    symptoms: DiagnosisSelect;
    text1: string;
    text2: string;
    text3: string;
    image1: DiagnosisSelect | null;
    image2: DiagnosisSelect | null;
    image3: DiagnosisSelect | null;
    preferences: DiagnosisSelect;
    publishDate: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};

export type DiagnosisInsert = {
    id?: number | undefined;
    diagnosisId?: string | undefined;
    oldDiagnosisId?: (string | null) | undefined;
    oldScriptId?: (string | null) | undefined;
    version: number;
    scriptId: string;
    position: number;
    source?: (string | null) | undefined;
    expression: string;
    name?: string | undefined;
    description?: string | undefined;
    key?: (string | null) | undefined;
    keyId?: string | undefined;
    severityOrder?: (number | null) | undefined;
    expressionMeaning?: string | undefined;
    symptoms?: DiagnosisInsert | undefined;
    text1?: string | undefined;
    text2?: string | undefined;
    text3?: string | undefined;
    image1?: (DiagnosisInsert | null) | undefined;
    image2?: (DiagnosisInsert | null) | undefined;
    image3?: (DiagnosisInsert | null) | undefined;
    preferences?: DiagnosisInsert | undefined;
    publishDate?: Date | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    deletedAt?: (Date | null) | undefined;
};

export type DiagnosisDraftSelect = {
    id: number;
    diagnosisDraftId: string;
    diagnosisId: string | null;
    scriptId: string | null;
    scriptDraftId: string | null;
    position: number;
    data: DiagnosisDraftSelect;
    createdByUserId: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export type DiagnosisDraftInsert = {
    id?: number | undefined;
    diagnosisDraftId?: string | undefined;
    diagnosisId?: (string | null) | undefined;
    scriptId?: (string | null) | undefined;
    scriptDraftId?: (string | null) | undefined;
    position: number;
    data: DiagnosisDraftInsert;
    createdByUserId?: (string | null) | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
};

export type DiagnosisHistoryItemSelect = {
    id: number;
    version: number;
    diagnosisId: string;
    scriptId: string;
    restoreKey: string | null;
    changes: DiagnosisHistoryItemSelect | null;
    createdAt: Date;
};

export type DiagnosisHistoryItemInsert = {
    id?: number | undefined;
    version: number;
    diagnosisId: string;
    scriptId: string;
    restoreKey?: (string | null) | undefined;
    changes?: (DiagnosisHistoryItemInsert | null) | undefined;
    createdAt?: Date | undefined;
};

export type PendingDeletionItemSelect = {
    id: number;
    scriptId: string | null;
    screenId: string | null;
    screenScriptId: string | null;
    diagnosisId: string | null;
    diagnosisScriptId: string | null;
    configKeyId: string | null;
    drugsLibraryItemId: string | null;
    scriptDraftId: string | null;
    screenDraftId: string | null;
    diagnosisDraftId: string | null;
    configKeyDraftId: string | null;
    drugsLibraryItemDraftId: string | null;
    dataKeyId: string | null;
    dataKeyDraftId: string | null;
    aliasId: string | null;
    createdByUserId: string | null;
    createdAt: Date;
};

export type PendingDeletionItemInsert = {
    id?: number | undefined;
    scriptId?: (string | null) | undefined;
    screenId?: (string | null) | undefined;
    screenScriptId?: (string | null) | undefined;
    diagnosisId?: (string | null) | undefined;
    diagnosisScriptId?: (string | null) | undefined;
    configKeyId?: (string | null) | undefined;
    drugsLibraryItemId?: (string | null) | undefined;
    scriptDraftId?: (string | null) | undefined;
    screenDraftId?: (string | null) | undefined;
    diagnosisDraftId?: (string | null) | undefined;
    configKeyDraftId?: (string | null) | undefined;
    drugsLibraryItemDraftId?: (string | null) | undefined;
    dataKeyId?: (string | null) | undefined;
    dataKeyDraftId?: (string | null) | undefined;
    aliasId?: (string | null) | undefined;
    createdByUserId?: (string | null) | undefined;
    createdAt?: Date | undefined;
};
