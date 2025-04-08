function isValidUrl(endpoint: string) {
    try {
        new URL(endpoint);
        return true;
    } catch(e: any) {
        return false;
    }
}

function inputToURL(input: Parameters<typeof fetch>[0]): URL {
    if (input instanceof URL) return input;

    if (input instanceof Request) return new URL(input.url);

    if (isValidUrl(input)) return new URL(input);

    let appURL = process.env.NEXT_PUBLIC_APP_URL || '';
    if (appURL.substring(appURL.length - 1, appURL.length) === '/') appURL = appURL.substring(0, appURL.length - 1);

    if (input[0] === '/') input = input.substring(1, input.length); 

    const url = [appURL, input].filter(s => s).join('/');

    if (isValidUrl(url)) return new URL(url);

    throw new Error('Invalid input');
}

export async function _fetch<ResType = any>(
    input: Parameters<typeof fetch>[0], 
    params?: Parameters<typeof fetch>[1]
): Promise<ResType> {
    const url = inputToURL(input);

    const res = await fetch(url, {
        ...params,
        headers: {
            ...params?.headers,
            'x-api-key': process.env.API_KEY || '',
        },
    });
    const json = await res.json();

    return json as ResType;
}
