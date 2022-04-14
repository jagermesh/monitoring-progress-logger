const ProgressSession = require(`${__dirname}/src/ProgressSession.js`);

class ProgressLogger {
  constructor(hubUrl) {
    this.hubUrl = hubUrl ? hubUrl : 'http://localhost:8082';
  }

  createSession(name, description) {
    return new ProgressSession(this.hubUrl, name, description);
  }
}

module.exports = ProgressLogger;