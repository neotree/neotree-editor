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

// export const isValidURL = (urlString: string) => {
//     const urlPattern = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
//         '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
//         '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
//         '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
//         '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
//         '(\\#[-a-z\\d_]*)?$','i'); // validate fragment locator
//     return !!urlPattern.test(urlString);
// };

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

