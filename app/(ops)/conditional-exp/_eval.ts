export type ScreenEntryValue = {
  value?: any;
  value2?: any;
  key2?: any;
  valueText?: any;
  valueLabel?: any;
  unit?: string;
  label?: string;
  key?: string;
  parentKey?: string;
  inputKey?: string;
  type?: string;
  dataType?: string;
  confidential?: boolean;
  exportValue?: any;
  exportLabel?: any;
  exportType?: any;
  calculateValue?: any;
  exclusive?: any;
  error?: any;
  diagnosis?: any;
  problem?: any;
  prePopulate?: any[];
  printable?: boolean;
  printDisplayColumns?: 1 | 2;
  extraLabels?: string[] | {
    title?: string;
    label: string;
    printTitle?: boolean;
  }[];
  selected?: boolean;
  data?: any;
  comments?: { key?: string; label: string; }[];
  listStyle?: 'none' | 'number' | 'bullet';
  score?: number;
};

export type ScreenEntry = {
  value?: ScreenEntryValue[];
  values: ScreenEntryValue[];
  screen: {
    type: string;
  }; 
};

export function evaluateCondition(condition: string, defaultEval = false) {
    let conditionMet = defaultEval;
    try {
        conditionMet = eval(condition);
    } catch (e) {
        // do nothing
    }
    return conditionMet;
}

export function sanitizeCondition(condition: string) {
    let sanitized = condition
        .replace(new RegExp(' and ', 'gi'), ' && ')
        .replace(new RegExp(' or ', 'gi'), ' || ')
        .replace(new RegExp(' = ', 'gi'), ' == ');
    sanitized = sanitized.split(' ')
        .map(s => s[0] === '$' ? `'${s}'` : s).join(' ');
    return sanitized;
}

export function parseConditionString(condition: string, _key = '', value: any) {
    const s = (condition || '').toLowerCase().split('$').join(' $');
    const key = (_key || '').toLowerCase();
    const parsed = s.replace(/\s\s+/g, ' ')
        .split(`$${key} =`).join(`${value} =`)
        .split(`$${key}=`).join(`${value} =`)
        .split(`$${key} >`).join(`${value} >`)
        .split(`$${key}>`).join(`${value} >`)
        .split(`$${key} <`).join(`${value} <`)
        .split(`$${key}<`).join(`${value} <`)
        .split(`$${key}!`).join(`${value} !`)
        .split(`$${key} !`).join(`${value} !`);
    return parsed;
}

const configuration: Record<string, any> = {};

export function parseCondition(
    _condition = '', 
    entries: ScreenEntry[] = []
) {
    _condition = `${_condition || ''}`.split('\n').map(_condition => {
        const _form = [...entries];

        _condition = _condition.replace(/\[(.*?)\]/gi, (_, match: string) => {
            return parseCondition(match, _form);
        });

        if (
            _condition.match(/ excludes /gi) ||
            _condition.match(/ includes /gi)
        ) {
            const [key, vals] = _condition.match(/ excludes /gi) ?
                _condition.split(/ excludes /gi).map(s => s.trim())
                :
                _condition.split(/ includes /gi).map(s => s.trim());

            const entryVals = _form.map(e => {
                    let found: string[] = [];
                    const entryVals = e.value || e.values || [];
                    entryVals.forEach(v => {
                        if (`$${v.key?.toLowerCase?.()}` === key?.toLowerCase?.()) {
                            const val = Array.isArray(v.value) ? v.value : [v.value];
                            val.forEach(v => {
                                if (v.key) {
                                    found.push(v.key);
                                }
                            });
                        }
                    });
                    return found.filter(v => v);
                }).reduce((acc, arr) => [...acc, ...arr], []);

            _condition = `${vals || ''}`
                .replace(/\((.*?)\)/, '$1')
                .split(',')
                .map(v => v.trim().replaceAll('"', '').replaceAll("'", '').replaceAll('`', '').replaceAll('`', ''))
                .map(v => {
                    let includes = entryVals.map(v => v.toLowerCase()).includes(v.toLowerCase());
                    if (_condition.match(/ excludes /gi)) {
                        includes = !includes;
                    }
                    return includes;
                })
                .join(' or ');

            return _condition;
        }

        const parseValue = (condition = '', { value, calculateValue, type, inputKey, key, dataType }: ScreenEntryValue) => {
            value = ((calculateValue === null) || (calculateValue === undefined)) ? value : calculateValue;
            value = ((value === null) || (value === undefined)) ? 'no value' : value;
            const t = dataType || type;
    
            switch (t) {
                case 'boolean':
                    value = value === 'false' ? false : Boolean(value);
                    break;
                default:
                    if(key==='createdAt'){
                        value=value
                    }else{
                        value = JSON.stringify(value)
                    }
            }
    
            return parseConditionString(condition, inputKey || key, value);
        };
    
        let parsedCondition = _form.reduce((condition: string, { screen, values, value }: ScreenEntry) => {
            values = value || values || [];

            values = values.reduce((acc: typeof values, v) => {
                acc = [...acc, v];
                if (v.value2 && v.key2) acc = [...acc, { value: v.value2, key: v.key2, }];
                return acc;
            }, []);
            
            // First filter out null/undefined values
            values = values.filter(e => (e.value !== null) && (e.value !== undefined));
            
            // Handle both array and non-array values
            values = values
                .reduce((acc: ScreenEntryValue[], e) => {
                    acc = [
                        ...acc,
                        ...(e.value && Array.isArray(e.value) ? e.value : [e]),
                    ];

                    acc.forEach(v => {
                        if (v.value2) {
                            acc.push({
                                ...v,
                                value: v.value2,
                            });
                        }
                    });

                    return acc;
                }, []);
    
            let c = values.reduce((acc, v) => parseValue(acc, v), condition);

            let chunks: string[] = values.filter(v => v.parentKey)
                .map(v => parseValue(condition, {
                    ...v,
                    key: v.parentKey,
                }))
                .filter(c => c !== condition);
    
            if (screen) {
                switch (screen.type) {
                    case 'multi_select':
                        chunks = values.map(v => parseValue(condition, v)).filter(c => c !== condition);
                        break;
                    default:
                    // do nothing
                }
            }

            if (chunks.length) {
                c = chunks.map(c => `(${c})`).join(' || ');
            }
    
            return c || condition;
        }, _condition);
    
        if (configuration) {
            parsedCondition = Object.keys(configuration).reduce((acc, key) => {
                return parseConditionString(acc, key, configuration[key] ? true : false);
            }, parsedCondition);
        }
    
        return `(${sanitizeCondition(parsedCondition)})`;
    }).join(' && ');

    return _condition.toLowerCase();
}

export const screenTypes = [
    { type: 'fluids', },
    { type: 'drugs', },
    { type: 'yesno', },
    { type: 'checklist', },
    { type: 'multi_select', },
    { type: 'single_select', },
    { type: 'form', },
    { type: 'timer', },
    { type: 'progress', },
    { type: 'management', },
    { type: 'list', },
    { type: 'diagnosis', },
    { type: 'problems', },
    { type: 'zw_edliz_summary_table', },
    { type: 'mwi_edliz_summary_table', },
    { type: 'edliz_summary_table', },
];

export const entryTypes = [
    {
        type: 'boolean',
    },
    {
        type: 'date',
    },
    {
        type: 'dropdown',
    },
    {
        type: 'multi_select',
    },
    {
        type: 'text',
    },     
    {
        type: 'single_select',
    },    
    {
        type: 'yesno',
    },
    {
        type: 'timer',
    },
    {
        type: 'time',
    },  
    {
        type: 'diagnosis',
    },
    {
        type: 'problem',
    },
    {
        type: 'drug',
    },
    {
        type: 'fluid',
    },
    {
        type: 'checklist',
    },
];
