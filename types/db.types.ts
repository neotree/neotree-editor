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
};

export type EditorInfoInsert = {
    id?: number | undefined;
    dataVersion?: number | undefined;
    lastPublishDate?: (Date | null) | undefined;
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
    createdAt: Date;
    updatedAt: Date;
};

export type ConfigKeyDraftInsert = {
    id?: number | undefined;
    configKeyDraftId?: string | undefined;
    configKeyId?: (string | null) | undefined;
    position: number;
    data: ConfigKeyDraftInsert;
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

export type ScriptSelect = {
    id: number;
    scriptId: string;
    oldScriptId: string | null;
    version: number;
    type: "admission" | "discharge" | "neolab";
    position: number;
    source: string | null;
    title: string;
    printTitle: string;
    description: string;
    hospitalId: string | null;
    exportable: boolean;
    nuidSearchEnabled: boolean;
    nuidSearchFields: ScriptSelect;
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
    type?: ("admission" | "discharge" | "neolab") | undefined;
    position: number;
    source?: (string | null) | undefined;
    title: string;
    printTitle: string;
    description?: string | undefined;
    hospitalId?: (string | null) | undefined;
    exportable?: boolean | undefined;
    nuidSearchEnabled?: boolean | undefined;
    nuidSearchFields?: ScriptInsert | undefined;
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
    data: ScriptDraftSelect;
    createdAt: Date;
    updatedAt: Date;
};

export type ScriptDraftInsert = {
    id?: number | undefined;
    scriptDraftId?: string | undefined;
    scriptId?: (string | null) | undefined;
    position: number;
    data: ScriptDraftInsert;
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
    type: "diagnosis" | "checklist" | "form" | "management" | "multi_select" | "single_select" | "progress" | "timer" | "yesno" | "zw_edliz_summary_table" | "mwi_edliz_summary_table";
    position: number;
    source: string | null;
    sectionTitle: string;
    previewTitle: string;
    previewPrintTitle: string;
    condition: string;
    epicId: string;
    storyId: string;
    refId: string;
    refKey: string;
    step: string;
    actionText: string;
    contentText: string;
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
    label: string;
    negativeLabel: string;
    positiveLabel: string;
    timerValue: number | null;
    multiplier: number | null;
    minValue: number | null;
    maxValue: number | null;
    exportable: boolean;
    printable: boolean;
    skippable: boolean;
    confidential: boolean;
    prePopulate: ScreenSelect;
    fields: ScreenSelect;
    items: ScreenSelect;
    publishDate: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
};

export type ScreenInsert = {
    id?: number | undefined;
    screenId?: string | undefined;
    oldScreenId?: (string | null) | undefined;
    oldScriptId?: (string | null) | undefined;
    version: number;
    scriptId: string;
    type: "diagnosis" | "checklist" | "form" | "management" | "multi_select" | "single_select" | "progress" | "timer" | "yesno" | "zw_edliz_summary_table" | "mwi_edliz_summary_table";
    position: number;
    source?: (string | null) | undefined;
    sectionTitle: string;
    previewTitle?: string | undefined;
    previewPrintTitle?: string | undefined;
    condition?: string | undefined;
    epicId?: string | undefined;
    storyId?: string | undefined;
    refId?: string | undefined;
    refKey?: string | undefined;
    step?: string | undefined;
    actionText?: string | undefined;
    contentText?: string | undefined;
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
    label?: string | undefined;
    negativeLabel?: string | undefined;
    positiveLabel?: string | undefined;
    timerValue?: (number | null) | undefined;
    multiplier?: (number | null) | undefined;
    minValue?: (number | null) | undefined;
    maxValue?: (number | null) | undefined;
    exportable?: boolean | undefined;
    printable?: boolean | undefined;
    skippable?: boolean | undefined;
    confidential?: boolean | undefined;
    prePopulate?: ScreenInsert | undefined;
    fields?: ScreenInsert | undefined;
    items?: ScreenInsert | undefined;
    publishDate?: Date | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
    deletedAt?: (Date | null) | undefined;
};

export type ScreenDraftSelect = {
    id: number;
    screenDraftId: string;
    screenId: string | null;
    scriptId: string | null;
    scriptDraftId: string | null;
    type: "diagnosis" | "checklist" | "form" | "management" | "multi_select" | "single_select" | "progress" | "timer" | "yesno" | "zw_edliz_summary_table" | "mwi_edliz_summary_table";
    position: number;
    data: ScreenDraftSelect;
    createdAt: Date;
    updatedAt: Date;
};

export type ScreenDraftInsert = {
    id?: number | undefined;
    screenDraftId?: string | undefined;
    screenId?: (string | null) | undefined;
    scriptId?: (string | null) | undefined;
    scriptDraftId?: (string | null) | undefined;
    type: "diagnosis" | "checklist" | "form" | "management" | "multi_select" | "single_select" | "progress" | "timer" | "yesno" | "zw_edliz_summary_table" | "mwi_edliz_summary_table";
    position: number;
    data: ScreenDraftInsert;
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
    severityOrder: number | null;
    expressionMeaning: string;
    symptoms: DiagnosisSelect;
    text1: string;
    text2: string;
    text3: string;
    image1: DiagnosisSelect | null;
    image2: DiagnosisSelect | null;
    image3: DiagnosisSelect | null;
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
    severityOrder?: (number | null) | undefined;
    expressionMeaning?: string | undefined;
    symptoms?: DiagnosisInsert | undefined;
    text1?: string | undefined;
    text2?: string | undefined;
    text3?: string | undefined;
    image1?: (DiagnosisInsert | null) | undefined;
    image2?: (DiagnosisInsert | null) | undefined;
    image3?: (DiagnosisInsert | null) | undefined;
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
    scriptDraftId: string | null;
    screenDraftId: string | null;
    diagnosisDraftId: string | null;
    configKeyDraftId: string | null;
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
    scriptDraftId?: (string | null) | undefined;
    screenDraftId?: (string | null) | undefined;
    diagnosisDraftId?: (string | null) | undefined;
    configKeyDraftId?: (string | null) | undefined;
    createdAt?: Date | undefined;
};
