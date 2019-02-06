import inspect from 'util-inspect';

enum LogLevel {
  Debug = 'debug',
  Info = 'info',
  Warning = 'warning',
  Error = 'error'
}

export default new class Log {
  log(level: LogLevel, what: any): void {
    if (typeof what !== 'string') {
      what = this.inspect(what);
    }

    SSj.log(level + ': ' + what);
  }

  inspect(what: any): string {
    return inspect(what);
  }

  info(what: any): void {
    this.log(LogLevel.Info, what);
  }

  debug(what: any): void {
    this.log(LogLevel.Debug, what);
  }
}();
