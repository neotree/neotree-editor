import queryString from "query-string";

export async function getImageDimensions(url: string) {
    return new Promise<{ width: number; height: number; }>((resolve, reject) => {
        const img = new Image();

        img.onload = function() {
            resolve({
                width: img.width,
                height: img.height,
            });
        };

        img.onerror = (function(event, source, lineno, colno, error) {
            reject(error || new Error('Failed to load image'));
        });

        img.src = url;
    });
}

export function getContainerImageSize({ 
    imageWidth: imageWidth,
    imageHeight: imageHeight,
    containerWidth,
}: {
    imageWidth: number;
    imageHeight: number;
    containerWidth: number;
}) {
    if (imageWidth > containerWidth) {
        imageHeight = imageHeight * (containerWidth / imageWidth)
        imageWidth = containerWidth;
    }

    return {
        imageWidth,
        imageHeight,
    };
}
