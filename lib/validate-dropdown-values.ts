export function validateDropdownValues(_values: string) {
    const errors = [];

    const dropdownValues = (_values || '').split('\n')
        .map((v = '') => v.trim())
        .map((value) => {
            const valueSplit = value.split(',');
            return { value: valueSplit[0], label: valueSplit[1], };
        });

    const values = dropdownValues.map(v => v.value);
    const labels = dropdownValues.map(v => v.label);
    const missing = dropdownValues.filter(v => !v.value || !v.label);
    const duplicateValues = values.filter((item, index) => values.indexOf(item) !== index);
    const duplicateLabels = labels.filter((item, index) => labels.indexOf(item) !== index);

    if (duplicateLabels.length || duplicateValues.length) {
        errors.push('Dropdown values contain duplicate data');
    }
    
    if (missing.length) {
        errors.push('Incorrect dropdown values format');
    }

    return errors;
}
