import http from 'node:http';
import https from 'node:https';
import sizeOf from 'image-size';

export function getRemoteImageSize(url: string) {
    return new Promise<{ width: number; height: number; }>((resolve, reject) => {
        const _http = `${url || ''}`.substring(0, 5) === 'https' ? https : http;
        _http.get(new URL(url), function (response) {
            const chunks: any[] = []
            response.on('data', function (chunk) {
                chunks.push(chunk)
            })
            .on('end', function () {
                const buffer = Buffer.concat(chunks);
                const res = sizeOf(buffer, function(e) {
                    if (e) reject(e);
                });
                resolve(res);
            })
            .on('error', function(e) {
                reject(e);
            });
        });
    });
}
