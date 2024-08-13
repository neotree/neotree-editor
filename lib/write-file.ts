import fs from 'fs';

export function writeFile({
    path,
    data,
}: {
    path: string;
    data: string;
}): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
        fs.writeFile(path, data, e => {
            if (e) {
                console.log(e);
                reject(e);
            } else {
                resolve(true);
            }
        });
    });
}
