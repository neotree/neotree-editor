export default () => {
  const loc = global.window.location;
  if (!loc.origin) {
    loc.origin = `${loc.protocol}//${loc.hostname}${(loc.port ? `:${loc.port}` : '')}`;
  }
  return loc;
};
