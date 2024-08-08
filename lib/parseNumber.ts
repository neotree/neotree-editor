export function parseNumber(
    n: any, 
    opts?: { 
        notNull?: boolean; 
        separator?: string;
    },
): number | null { 
    if (`${n}` === '0') return 0;
    
    let parsedNumber = `${n || ''}`.replaceAll(' ', '');
    if (opts?.separator) parsedNumber = parsedNumber.replaceAll(opts.separator, '');
    if (parsedNumber.includes('.')) {
        parsedNumber = parsedNumber.replaceAll(',', '');
    } else if (parsedNumber.split(',').length > 2) {
        parsedNumber = parsedNumber.replaceAll(',', '');
    } else {
        parsedNumber = parsedNumber.replaceAll(',', '.');
    }

    const [left, right] = parsedNumber.split('.');
    let _number = !left || isNaN(Number(left)) ? '' : left;
    _number += !right || isNaN(Number(right)) ? '' : `.${right}`;

    const isEmpty = (_number === null) || (_number === '') || (_number === undefined);

    if (isEmpty || isNaN(Number(_number))) return opts?.notNull ? 0 : null;

    return Number(_number);
}

export function isNumber(n: any) {
    const number = parseNumber(n);
    if (number === null) return false; 
    return !isNaN(number);
}
