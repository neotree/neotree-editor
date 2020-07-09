export default class CustomMiddleware {
  use(fn) {
    this.go = (stack => next => stack(fn.bind(this, next.bind(this))))(this.go);
  }

  go = next => next();
}
