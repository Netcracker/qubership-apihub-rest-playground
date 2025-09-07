// TTY polyfill for browser environment
function isatty() {
  return false;
}

module.exports = {
  isatty: isatty
};

// Also export as named export for different import patterns
module.exports.isatty = isatty;