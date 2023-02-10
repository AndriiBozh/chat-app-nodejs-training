// will let us send and recieve events from both the client and the server
const socket = io();

const form = document.getElementById("form");
const input = document.getElementById("message-input-field");
const sendMessageBtn = document.getElementById("send-message-btn");
const showMyLocationBtn = document.getElementById("show-my-location-btn");
const messagesContainer = document.getElementById("messages-container");

// Templates
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationTemplate = document.getElementById("location-template").innerHTML;
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;
// End of templates

// Options
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
// End of Options

const autoscroll = () => {
  // // new message element
  // // grab last element, which is a new message, since new messages are added to the bottom
  // const newMessage = messagesContainer.lastElementChild;
  // // get styles of a new message (to find out what are the margins of the new message)
  // const newMessageStyles = getComputedStyle(newMessage);
  // const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  // // height of the new message (integer, without margin. That's why we need to add margin to it)
  // const newMessageHeight = newMessage.offsetHeight + newMessageMargin;
  // console.log(newMessageStyles);
  // // visible height
  // const visibleHeight = messagesContainer.offsetHeight;
  // console.log(visibleHeight);
  // // height of messages container (total height we are able to scroll through)
  // const messagesContainerHeight = messagesContainer.scrollHeight;
  // // how far down we scrolled (the distance we scrolled from the top (distance between the top of the container and the top of the scrollbar) ==> .scrollTop)
  // // + height of the scroll's bar ( = visibleHeight of the container)
  // const scrollOffset = messagesContainer.scrollTop + visibleHeight;
  // // check if we've scrolled to the bottom, but before this new message was added
  // // if we don't accout this (minus newMessageHeight), we'll never be scrolled to the bottom because we are running this code just after we are adding a new message and the user will never get a chance to scroll down
  // // if we were at the bottom before the last massage was added, then autoscroll,
  // // if we were not at the bottom, then do not autoscroll
  // if (messagesContainerHeight - newMessageHeight <= scrollOffset) {
  //   // do autoscroll (this will push us to the bottom) ==>
  //   // ==> messagesContainer.scrollTop ==> how down we've scrolled ==>
  //   // ==> = messagesContainer.scrollHeight ==> to the very bottom
  //   // this line of code could be used separately, to always scroll user to the bottom, so they could always see the (currently) last message
  //   messagesContainer.scrollTop = messagesContainer.scrollHeight;
  // }
  // always scroll user to the bottom, so they could always see the (currently) last message
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
};

//  receive event the server is sending to us
// first argument - name of the event (should match the name from socket.emit('countUpdated') in index.js file)
// second argument - function, which runs when the event occurs
// argument of this function is the value we get from socket.emit() in index.js file
// the name of this argument can be different from the one we use in socket.emit()

// get message from a server
socket.on("message", (message) => {
  console.log("new message: ", message);
  // store the final html to render it later in a
  const html = Mustache.render(messageTemplate, {
    // key is 'message', since we have {{message}} in our template in index.html file
    message: message.text,
    username: message.username,
    createdAt: message.createdAt,
  });

  messagesContainer.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationMessage", (location) => {
  console.log(location);
  const html = Mustache.render(locationTemplate, {
    username: location.username,
    location,
    createdAt: location.createdAt,
  });

  messagesContainer.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.getElementById("sidebar").innerHTML = html;
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  //   disable form submit button and the form itself, after the form has been submitted
  sendMessageBtn.setAttribute("disabled", "disabled");

  const message = input.value;
  //   send event from a client
  //   function (the last (optional) argument) will run, when the event is acknowledged
  // (acknowledgement is the client gets notified that the event was received and processed)
  //   if argument is passed to the last optional argument (arrow function), this is a message from a server
  socket.emit("sendMessage", message, (messageFromServer) => {
    // enable form submit button and the form itself, after the acknowledgement is received from the server
    sendMessageBtn.removeAttribute("disabled");
    // clear input field after the message has been sent
    input.value = "";
    // move focus back to the input field
    input.focus();

    // we get this 'messageFromServer' from a callback('Profanity is not allowed') in 'index.js'. We can name 'messageFromServer' anything we like, e.g., 'error'
    if (messageFromServer) {
      return console.log(messageFromServer);
    }
    console.log("Message delivered");
  });
});

showMyLocationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }

  showMyLocationBtn.setAttribute("disabled", "disabled");

  navigator.geolocation.getCurrentPosition((position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const myLocation = { lat, lon };

    socket.emit("sendLocation", myLocation, () => {
      showMyLocationBtn.removeAttribute("disabled");

      // when the event is acknowledged by the server, console.log()
      console.log("Location shared");
    });
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    // send user to the main page
    location.href = "/";
  }
});
