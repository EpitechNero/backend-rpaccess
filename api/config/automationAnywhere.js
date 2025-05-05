require('dotenv').config();

module.exports = {
  username: process.env.USERNAME,
  apiKey: process.env.APIKEY,
  controlRoomUrl: process.env.CONTROL_ROOM_URL,
};
