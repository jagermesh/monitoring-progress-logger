const uid          = require('uuid');
const socketClient = require('socket.io-client');

function ProgressOperation(session, name) {

  const _this = this;

  let __isStarted  = false;
  let __isFinished = false;
  let __current    = 0;
  let __total      = 0;
  let __name       = name;
  let __session    = session;

  _this.getName = function() {
    return __name;
  };

  _this.setName = function(value) {
    __name = value;
  };

  _this.setTotal = function(value) {
    __total += value;
  };

  _this.setCurrent = function(value) {
    __current = value;
  };

  _this.getCurrent = function() {
    return __current;
  };

  _this.getTotal = function() {
    return __total;
  };

  _this.isStarted = function() {
    return __isStarted;
  };

  _this.isFinished = function() {
    return __isFinished;
  };

  _this.start = function(total) {
    __isStarted  = true;
    __isFinished = false;
    __current    = 0;
    __total      = total;
    __session.sendData();
  };

  _this.incTotal = function(value) {
    __total += value;
    if (__total > __current) {
      __isFinished = false;
    }
    __session.sendData();
  };

  _this.step = function(increment) {
    increment = increment || 1;
    __current += increment;
    __session.sendData();
  };

  _this.finish = function() {
    __current = __total;
    __isFinished = true;
    __isStarted  = false;
    __session.sendData();
  };

  return _this;

}

function ProgressSession(hubUrl, name) {

  const _this = this;

  let __hubUrl     = hubUrl;
  let __uid        = uid.v4();
  let __name       = name;

  let __registered = false;
  let __operations = [];
  let __hubConnection;

  function connect() {
    __hubConnection = socketClient.connect(__hubUrl, { reconnect: true });

    __hubConnection.on('connect', function() {
      __hubConnection.emit( 'registerSensor', { sensorName: 'localhost'
                                              , metricsList: [ { uid:          _this.getUid()
                                                               , name:         _this.getName()
                                                               , rendererName: 'Progress'
                                                               , metricConfig: { }
                                                               }
                                                             ]
                                              });
    });

    __hubConnection.on('sensorRegistered', function(data) {
      __registered = true;
      _this.sendData();
    });

    __hubConnection.on('disconnect', function(data) {
      __registered = false;
    });
  }

  _this.sendData = function() {
    try {
      if (!__hubConnection) {
        connect();
      }
      if (__hubConnection) {
        if (__hubConnection.connected) {
          if (__registered) {
            let operations = [];
            __operations.map(function(operation) {
              if (operation.isStarted() && !operation.isFinished()) {
                operations.push({ name:    operation.getName()
                                , current: operation.getCurrent()
                                , total:   operation.getTotal()
                                });
              }
            });
            __hubConnection.emit( 'sensorData'
                                , { metricInfo: { uid: __uid }
                                  , metricData: { operations: operations
                                                , title:      _this.getName()
                                                }
                                  ,
                                  }
                                );
          }
        }
      }
    } catch (error) {
      // _this.error('    Metric: ' + metricObj.getName() + ', Error: ' + error);
    }
  };

  _this.getUid = function() {
    return __uid;
  };

  _this.getName = function() {
    return __name;
  };

  _this.createOperation = function(name) {
    let progressOperation = new ProgressOperation(_this, name);
    __operations.push(progressOperation);
    return progressOperation;
  };

  _this.finish = function() {
    __operations.map(function(operation) {
      operation.finish();
    });
    __hubConnection.close();
    __hubConnection = undefined;
  };

  return _this;

}

function ProgressLogger(hubUrl) {

  const _this = this;

  let __hubUrl = hubUrl ? hubUrl : 'http://localhost:8082';

  _this.createSession = function(name) {
    return new ProgressSession(__hubUrl, name);
  };

  return _this;

}

module.exports = ProgressLogger;