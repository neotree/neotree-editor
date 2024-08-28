import Cookies from "js-cookie";

const getCookie: typeof Cookies.get = Cookies.get;

const setCookie: typeof Cookies.set = Cookies.set;

const removeCookie: typeof Cookies.remove = Cookies.remove;

const cookies = {
    get: getCookie,
    set: setCookie,
    remove: removeCookie,
};

export default cookies;
