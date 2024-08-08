export function getAppUrl(suffix = '') {
    let host = process.env.NEXT_PUBLIC_APP_URL || '';
    if (host.substring(host.length - 1, host.length) === '/') host = host.substring(0, host.length - 1);
    if (suffix[0] === '/') suffix = suffix.substring(1, suffix.length); 
    return [host, suffix].filter(s => s).join('/');
}

export function isValidUrl(urlString: string = '') {
    try {
        const url = new URL(urlString);
        return true;
    } catch(e) {
        return false;
    }
}

export function getUploadUrl(filename: string) {
    const _isValidUrl = isValidUrl(filename);
    if (_isValidUrl) return filename;
    return getAppUrl(`/api/uploads/${filename}`);
}

export function getImageUrl(filename: string, { placeholder }: {
    placeholder?: 'user' | 'image',
} = {}) {
    if (!filename) {
        if (placeholder) return getUploadUrl(`/images/${placeholder === 'image' ? 'placeholder.png' : 'avatar-placeholder.jpg'}`);
        return '';
    }
    return getUploadUrl(filename);
}

