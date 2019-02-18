import inspect from 'util-inspect';

enum LogLevel {
  Debug = 'debug',
  Info = 'info',
  Warning = 'warning',
  Error = 'error'
}

const log = (level: LogLevel, what: any) => {
  if (typeof what !== 'string') {
    what = inspect(what);
  }

  const date = new Date();
  const time = `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes()
  ).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;

  SSj.log(time + ' | ' + level + ': ' + what);
};

export default new class Log {
  log(level: LogLevel, ...what: any[]): void {
    for (const whit of what) {
      log(level, whit);
    }
  }

  inspect(what: any): string {
    return inspect(what);
  }

  info(...what: any): void {
    this.log(LogLevel.Info, ...what);
  }

  debug(...what: any): void {
    this.log(LogLevel.Debug, ...what);
  }
}();
