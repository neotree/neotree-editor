export function isNumericQueryValue(value: string) {
    return value.trim().length > 0 && Number.isInteger(Number(value));
}
