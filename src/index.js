const express = require("express");
const path = require("path");
const { createServer } = require("http");
const { Server } = require("socket.io");
const Filter = require("bad-words");

const {
  generateMessage,
  generateLocationMessage,
} = require("./utils/messages");

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const PORT = 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const welcomeMessage = "Welcome!";

// 'socket' is a connection (user)
io.on("connection", (socket) => {
  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });

    if (error) {
      // stop function execution and let the client know what exactly went wrong
      return callback(error);
    }

    // join a given chatroom (method can be used only on a server)
    // now we'll emit events only to this specific room
    socket.join(user.room);

    // 'welcomeMessage' - is a name (we can name it anything we like) of an event
    //   second argument - is the value we pass to a client (accessed in socket.on() in chat.js file)
    socket.emit("message", generateMessage("Admin", welcomeMessage));
    // send message to all connected clients in a specific room, except the sender
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage("Admin", `${user.username} has joined the room`)
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    // let the client know they were able to join
    callback();
  });

  //   listen for event called 'sendMessage' and when this event takes place, run function
  //   add second (optional) argument 'callback' to an errow function (which is a second argument itself) and then run this argument to acknowledge the event
  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();

    const user = getUser(socket.id);

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }
    // emit event to every connection available in a room:
    io.to(user.room).emit("message", generateMessage(user.username, message));
    // acknowledge the event
    // if argument is passed, then a client will get it as a response from a server
    callback();
  });

  socket.on("sendLocation", (location, callback) => {
    const { lat, lon } = location;
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "locationMessage",
      generateLocationMessage(
        user.username,
        `https://google.com/maps?q=${lat},${lon}`
      )
    );
    // let the client know the event has been acknowledged
    callback();
  });

  // no need to 'emit' event, since 'disconnect' (as well as 'connection') is build-in events, so 'socket.io' library takes control over emitting these events
  socket.on("disconnect", () => {
    const removedUser = removeUser(socket.id);

    if (removedUser) {
      io.to(removedUser.room).emit(
        "message",
        generateMessage("Admin", `${removedUser.username} has left`)
      );
      io.to(removedUser.room).emit("roomData", {
        room: removedUser.room,
        users: getUsersInRoom(removedUser.room),
      });
    }
  });
});

app.use(express.static(publicDirectoryPath));
// console.log("dirname: ", __dirname);
// console.log("directory path: ", publicDirectoryPath);

httpServer.listen(PORT, () => {
  console.log("listening on port: ", PORT);
});
