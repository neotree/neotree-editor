import { Mode } from "@/types";
import cookies from "@/lib/js-cookie";

export function setMode(_mode: Mode): Mode {
    cookies.set('mode', _mode, { expires: 3600 * 1000 * 24 * 365 * 10, });
    return getMode();
}

export function getMode(): Mode {
    let mode = cookies.get('mode');
    if (!mode) {
        mode = 'view';
        cookies.set('mode', mode, { expires: 3600 * 1000 * 24 * 365 * 10, });
    }
    return mode as Mode;
}
