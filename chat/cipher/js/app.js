jQuery(document).ready(function($) {


  //////////////////////// Initialization
  var baseRef = new Firebase("https://chatcripto.firebaseio.com");
  var messagesRef = baseRef.child("mensajes");
  var usersRef = baseRef.child("users");
  var userId;

  //get/set the user from local storage
  if (localStorage.getItem('userId') === null) {

    userId = 'user' + parseInt(Math.random() * 1000, 10) + Date.now();
    createUser(userId);
    var user = {
      userId: userId,
      publicKey: mPublicKey,
      n: mN
    };

    usersRef.push(user);

    localStorage.setItem('userId', userId);
    localStorage.setItem('mPublicKey', mPublicKey);
    localStorage.setItem('mPrivateKey', mPrivateKey);
    localStorage.setItem('mN', mN);
  } else {
    userId = localStorage.getItem('userId');
    mPublicKey = localStorage.getItem('mPublicKey');
    mPrivateKey = localStorage.getItem('mPrivateKey');
    mN = localStorage.getItem('mN');
  }
  $("#sysgenerateduserid").text(userId);

  var chatWindow = $("#chatWindow");
  var messageField = $("#mensaje");
  var messageList = $("#messageList");
  var nameField = $("#name");

  //////////////////////// end Initialization 


  //////////////////////// The key enters Management
  //listener for key enter in the keyboard
  messageField.on('keypress', function(e) {
    if (e.keyCode === 13) {
      var nameTmp;

      if (nameField.val() === '') {
        nameTmp = userId;
      } else {
        nameTmp = nameField.val();
      }

      var cypherMessage = sendMessage(messageField.val());
      //create the message
      var message = {
        userId: userId,
        cypherMessage: cypherMessage[0],
        connectedUserSignature: cypherMessage[1]
      };

      //push the message to the firebase model
      messagesRef.push(message);

      putMessage(userId, messageField.val()  + "<br>" + cypherMessage[0] + "<br>" + cypherMessage[1]);

      //clear the message field
      messageField.val('');
    }
  });

  //////////////////////// End enter key management


  //////////////////////// Management  message reception
  messagesRef.limitToLast(20).on('child_added', function(snapshot) {
    //GET DATA
    var data = snapshot.val();
    var connectedUserId = data.userId;
    var cypherMessage = data.cypherMessage || "anonymous";
    var connectedUserSignature = data.connectedUserSignature;

    if (connectedUserId != userId) {
      putMessage(connectedUserId, receiveMessage(cypherMessage, connectedUserSignature) + "<br>" + cypherMessage + "<br>" + connectedUserSignature);
    }

  });

  //////////////////////// Management  message reception
  usersRef.limitToLast(2).on('child_added', function(snapshot) {

    var data = snapshot.val();
    if (data.userId != userId) {
      var publicKey = data.publicKey;
      var n = data.n;
      onConnectedUser(publicKey, n);
    }
  });

  function putMessage(name, message) {
    //CREATE ELEMENTS MESSAGE & SANITIZE TEXT
    var messageElement = $("<li>");
    var nameElement = $("<label></label>");
    nameElement.text(name);
    messageElement.html(message).prepend(nameElement);

    //ADD MESSAGE
    messageList.append(messageElement)

    //SCROLL TO BOTTOM OF MESSAGE LIST
    chatWindow[0].scrollTop = chatWindow[0].scrollHeight;
  }
});

//////////////////////// end management message reception



//////////////////////// Firebase object for comunication
var firebaseManager = (function() {

  var firebaseRef,
    messagesRef,
    userId;

  return {
    init: function(context) {
      // Our endpoint
      firebaseRef = context;

      // Setup some references
      messagesRef = firebaseRef.child("mensajes");

      //gets the user ID
      userId = localStorage.getItem('userId');
    }
  };
  ////////////////////////end object 
})();