// https://github.com/streamich/react-use/blob/master/docs/useMeasure.md

(async () => {
    if (typeof window !== 'undefined') {
        if (!window.ResizeObserver) {
            window.ResizeObserver = (await import('resize-observer-polyfill')).default;
        }
    }
})();
