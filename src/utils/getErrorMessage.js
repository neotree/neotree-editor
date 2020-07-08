export default function getErrorMessage(e) {
  const getMsg = e => {
    if (typeof e === 'string') return e;
    return e.msg || e.message || JSON.stringify(e);
  };
  return !e ? '' : (e.map ? e : [e]).reduce((acc, e) => `${acc}${getMsg(e)}\n`, '');
}
