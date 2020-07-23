export default function init({
  state,
  setState,
  router,
}) {
  this.state = state;
  this._setState = setState;
  this.router = router;
}
