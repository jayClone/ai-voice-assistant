function format(scope, message, meta) {
  return {
    timestamp: new Date().toISOString(),
    scope,
    message,
    ...(meta ? { meta } : {})
  };
}

const logger = {
  info(scope, message, meta) {
    console.log(JSON.stringify(format(scope, message, meta)));
  },
  warn(scope, message, meta) {
    console.warn(JSON.stringify(format(scope, message, meta)));
  },
  error(scope, message, meta) {
    console.error(JSON.stringify(format(scope, message, meta)));
  }
};

module.exports = logger;
