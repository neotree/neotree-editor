import { headers } from 'next/headers'

export function getHeaders() {
    const headersList = headers();

    const apiKey = headersList.get('x-api-key');
    const bearerToken = headersList.get('x-bearer-token');

    const url = headersList.get('x-url');
    const host = headersList.get('x-next-url-host');
    const href = headersList.get('x-next-url-href');
    const port = headersList.get('x-next-url-port');
    const hostname = headersList.get('x-next-url-hostname');
    const pathname = headersList.get('x-next-url-pathname');
    const search = headersList.get('x-next-url-search');
    const protocol = headersList.get('x-next-url-protocol');
    const username = headersList.get('x-next-url-username');
    const locale = headersList.get('x-next-url-locale');
    const origin = headersList.get('x-next-url-origin');
    const city = headersList.get('x-geo-city');
    const country = headersList.get('x-geo-country');
    const region = headersList.get('x-geo-region');
    const latitude = headersList.get('x-geo-latitude');
    const longitude = headersList.get('x-geo-longitude');
    
    return {
        apiKey,
        bearerToken,
        url: url || '',
        host: host || '',
        href: href || '',
        port: port || '',
        hostname: hostname || '',
        pathname: pathname || '',
        search: search || '',
        protocol: protocol || '',
        username: username || '',
        locale: locale || '',
        origin: origin || '',
        city: city || '',
        country: country || '',
        region: region || '',
        latitude: latitude || '',
        longitude: longitude || '',
    };
}
