import http from 'node:http';
import https from 'node:https';
import sizeOf from 'image-size';

export async function getRemoteImageSize(url: string) {
    try {
        const chunks: any[] = []

        const res = await new Promise<{ width: number; height: number; }>((resolve, reject) => {
            const _http = `${url || ''}`.substring(0, 5) === 'https' ? https : http;
            _http.get(new URL(url), function (response) {
                
                response.on('data', function (chunk) {
                    chunks.push(chunk)
                })
                .on('end', function () {
                    const buffer = Buffer.concat(chunks);
                    try {
                        const res = sizeOf(buffer, function(e) {
                            if (e) reject(e);
                        });
                        resolve(res);
                    } catch(e) {
                        reject(e);
                    }
                })
                .on('error', function(e) {
                    reject(e);
                });
            });
        });
        
        return res;
    } catch(e) {
        throw e;
    }
}
