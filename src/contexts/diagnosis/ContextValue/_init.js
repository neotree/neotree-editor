export default function init({
  state,
  router,
  setState,
}) {
  this.state = state;
  this._setState = setState;
  this.router = router;
}
