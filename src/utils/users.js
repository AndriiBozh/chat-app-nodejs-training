const users = [];

const addUser = ({ id, username, room }) => {
  // clean data provided by a user joining a chat
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  // validate the data
  if (!username || !room) {
    return {
      error: "Username and room are required",
    };
  }
  // check if user already exists
  const userExists = users.find((user) => {
    // check if user exists in a specific room
    return user.room === room && user.username === username;
  });
  //   validate username
  if (userExists) {
    return {
      error: "Please choose a different username",
    };
  }
  //   store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  // returns index of the element if found, or -1 if not found
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    // delete 1 element at the given index (change the original 'users' array)
    // and return the deleted user (splice() returns an array with deleted elements) ==> [0]
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  const user = users.find((user) => user.id === id);
  return user;
};

const getUsersInRoom = (room) => {
  const usersInRoom = users.filter((user) => user.room === room);
  return usersInRoom;
};

module.exports = { addUser, removeUser, getUser, getUsersInRoom };
