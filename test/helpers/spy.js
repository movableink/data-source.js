export default function watch (obj, methodName) {
  if (typeof obj[methodName] === "function") {
    const spy = new Spy(obj, methodName);
    spy.watch();

    return spy;
  }
}

class Spy {
  constructor(obj, methodName) {
    this.object = obj;
    this.methodName = methodName;
    this.callCount = 0;
  }

  watch() {
    this._original = this.object[this.methodName];
    this.object[this.methodName] = this.watcher.bind(this);
  }

  watcher(...args) {
    this._original.apply(this.object, args);
    this.callCount++;
  }

  called(count) {
    return count == this.callCount;
  }

  restore() {
    this.object[this.methodName] = this._original;
  }
}
