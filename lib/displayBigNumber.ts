export function displayBigNumber(n: string | number, opts?: {
	separator?: string;
	decimals?: number;
}) {
    const { decimals = 0, separator = ' ' } = { ...opts };

    n = Number(`${n}`.replace(/[^a-z0-9.]+/gi, ''));
    if (isNaN(n)) n = '0';
    n = `${Number(n).toFixed(decimals >= 0 ? decimals : 2)}`;
    const parts = n.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return parts.join(".");
}
