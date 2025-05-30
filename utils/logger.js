const Log = require('../schemas/LogSchema');

async function writeLog(level, message, meta = {}) {
  try {
    await Log.save({ level, message, meta });
  } catch (e) {
    console.error('Logging failed:', e);
  }
}

module.exports = { writeLog };
