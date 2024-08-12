export function generateDeviceHash(chars = '', length = 4) {
    chars = `${chars || ''}`.replace(/[\W_]+/g,"");
    let result = '';
    for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result.toUpperCase();
}
