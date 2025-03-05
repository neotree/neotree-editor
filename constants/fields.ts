export const nuidSearchOptions = [
	{ value: 'allSearches', label: 'Found in all searches', },
	{ value: 'admissionSearches', label: 'Found in admission searches', },
	{ value: 'twinSearches', label: 'Found in twin searches', },
];

export const PERIOD_FIELD_FORMATS = [
  { label: 'Days & hours', value: 'days_hours', },
  { label: 'Years & Months', value: 'years_months', },
];

export const DefaultValueType = {
    COMPUTE: 'compute',
    DATE_NOW: 'date_now',
    DATE_NOON: 'date_noon',
    DATE_MIDNIGHT: 'date_midnight',
    EMPTY: '',
    UID: 'uid'
  };
  
  export const DataType = {
    BOOLEAN: 'boolean',
    DATETIME: 'datetime',
    DATE: 'date',
    ID: 'id',
    NUMBER: 'number',
    PERIOD: 'period',
    SET_ID: 'set<id>',
    STRING: 'string',
    TIME: 'time',
    VOID: 'void'
  };
  
  export const FieldTypes = [
    { name: 'date', label: 'Date' },
    { name: 'datetime', label: 'Date + Time' },
    { name: 'dropdown', label: 'Dropdown' },
    { name: 'number', label: 'Number' },
    { name: 'text', label: 'Text' },
    { name: 'time', label: 'Time' },
    { name: 'period', label: 'Time period' },
  ];
  
  export const ScreenTypes = [
    { name: 'diagnosis', label: 'Diagnosis' },
    { name: 'checklist', label: 'Checklist' },
    { name: 'form', label: 'Form' },
    { name: 'management', label: 'Management' },
    { name: 'multi_select', label: 'Multiple choice list' },
    // { name: 'list', label: 'Simple list' },
    { name: 'single_select', label: 'Single choice list' },
    { name: 'progress', label: 'Progress' },
    { name: 'timer', label: 'Timer' },
    { name: 'yesno', label: 'Yes/No' },
    { name: 'zw_edliz_summary_table', label: 'EDLIZ summary table (ZW)' },
    { name: 'mwi_edliz_summary_table', label: 'EDLIZ summary table (MWI)' },
    {name:'dynamic_form',label:'Dynamic Form'}
  ];
  
  export const SymptomTypes = [
    { name: 'risk', label: 'Risk factor', },
    { name: 'sign', label: 'Sign/Symptom', },
  ];

  
export const defaultField = {
    calculation: null,
    condition: '',
    confidential: false,
    dataType: null,
    defaultValue: null,
    format: null,
    type: null,
    key: null,
    refKey: null,
    label: null,
    minValue: null,
    maxValue: null,
    optional: false,
    minDate: null,
    maxDate: null,
    minTime: null,
    maxTime: null,
    minDateKey: '',
    maxDateKey: '',
    minTimeKey: '',
    maxTimeKey: '',
    values: '',
};

export const defaultNuidSearchFields = {
    admission: [
        {
            ...defaultField,
            type: 'dropdown',
            key: 'BabyTransfered',
            values: 'Y,Yes\nN,No',
            label: 'Has the baby been transfered from another facility',
        },
        {
            ...defaultField,
            type: 'text',
            key: 'patientNUID',
            label: "Search patient's NUID",
            condition: "$BabyTransfered = 'Y'",
        },
        {
            ...defaultField,
            type: 'dropdown',
            key: 'BabyTwin',
            values: 'Y,Yes\nN,No',
            label: 'Does the baby have a twin?',
        },
        {
            ...defaultField,
            type: 'text',
            key: 'BabyTwinNUID',
            label: "Search twin's NUID",
            condition: "$BabyTwin = 'Y'",
        },
    ],
    other: [
        {
            ...defaultField,
            type: 'text',
            key: 'patientNUID',
            values: 'Y,Yes\nN,No',
            label: "Search patient's NUID",
        },
    ],
};
