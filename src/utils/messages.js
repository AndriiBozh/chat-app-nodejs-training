const { DateTime } = require("luxon");

const generateMessage = (username, text) => {
  return {
    username,
    text,
    createdAt: DateTime.now().toLocaleString(
      DateTime.DATETIME_MED_WITH_SECONDS
    ),
  };
};

const generateLocationMessage = (username, location) => {
  return {
    username,
    location,
    createdAt: DateTime.now().toLocaleString(
      DateTime.DATETIME_MED_WITH_SECONDS
    ),
  };
};

module.exports = { generateMessage, generateLocationMessage };
