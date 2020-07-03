export default (items = [], key, value) => {
  const item = items.filter((c) => `${c[key]}` === value)[0];
  return {
    item,
    index: items.indexOf(item),
  };
};
