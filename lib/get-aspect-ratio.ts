export function getAspectRatio(w: number, h: number) {
    let aspectRatio;
    if (w > h) {
        aspectRatio = w / h;
    } else {
        aspectRatio = h / w;
    }
    return aspectRatio;
}
