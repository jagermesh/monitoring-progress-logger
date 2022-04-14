class ProgressOperation {
  constructor(session, name) {
    this.isStarted = false;
    this.isFinished = false;
    this.opCurrent = 0;
    this.opTotal = 0;
    this.opName = name;
    this.session = session;
  }

  start(total) {
    this.isStarted = true;
    this.isFinished = false;
    this.opCurrent = 0;
    this.opTotal = total;
    this.session.sendData();
  }

  get total() {
    return this.opTotal;
  }

  set total(value) {
    this.opTotal = value;
    this.session.sendData();
  }

  get current() {
    return this.opCurrent;
  }

  set current(value) {
    this.opCurrent = value;
    this.session.sendData();
  }

  get name() {
    return this.opName;
  }

  set name(value) {
    this.opName = value;
    this.session.sendData();
  }

  finish() {
    this.opCurrent = this.opTotal;
    this.isFinished = true;
    this.isStarted = false;
    this.session.sendData();
  }
}

module.exports = ProgressOperation;
