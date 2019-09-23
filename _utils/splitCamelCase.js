export default (string, joinWith = ' ') => string.replace(/([a-z0-9])([A-Z])/g, `$1${joinWith}$2`);
