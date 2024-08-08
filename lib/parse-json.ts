export function parseJSON<DataType = any>(json: string) {
    try {
        return JSON.parse(json) as DataType;
    } catch(e) {
        return null;
    }
}
