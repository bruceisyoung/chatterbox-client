// YOUR CODE HERE:
$(document).ready(function() {
  app.init();
  app.fetch();

  $('#submitRoom').on('click', function() {
    var newRoom = $('#newRoom').val();
    app.renderRoom(newRoom);
  });

  $('#refresh').on('click', function() {
    app.clearMessages();
    app.fetch();
  });

  $('#send').on('submit', function() {
    event.preventDefault();
    var username = document.URL.slice(_.lastIndexOf(document.URL, '=') + 1);
    var messageContent = $('#message').val();
    var roomSelect = document.getElementById('roomSelect');
    var roomSelected = roomSelect.options[roomSelect.selectedIndex].text;
    var message = {
      username: username,
      text: messageContent,
      roomname: roomSelected
    };
    app.send(message);
  });

  $(document).on('click', '.tweetUser', function() {
    if (_.indexOf(app.friends, $(this).text()) === -1) {
      app.friends.push($(this).text());
    }
    app.clearMessages();
    app.fetch();
  });

});



const app = {};

app.init = function() {
  app.server = 'https://api.parse.com/1/classes/messages';
  app.friends = [];
};

app.send = function(message) {
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: app.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.fetch = function () {
  $.ajax({
  // This is the url you should use to communicate with the parse API server.
    url: app.server,
    type: 'GET',
    contentType: 'application/json',
    data: {limit: 100, order: '-createdAt'},
    success: function (data) {
      // 'order=-updatedAt';
      _.each(data.results, function(datum) {
        app.renderMessage(datum);
      });
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });

};

app.clearMessages = function() {
  // var chatsNode = document.getElementById('#chats');
  // while (chatsNode.firstChild) {
  //   console.log(chatsNode);
  //   chatsNode.removeChild(chatsNode.firstChild);
  // }
  $('#chats').empty();
};

app.renderMessage = function(message) {
  var tweet;
  var user = $('<a class="tweetUser" href="#"></a>').text(message.username);
  var time = $('<span class="tweetTime"></span>').text(message.updatedAt);
  var msg = $('<p class="tweetMessage"></p>').text(message.text);
  if ((_.indexOf(app.friends, message.username) === -1)) {
    $tweets = $('<div class="tweet"></div>').append(user).append(time).append(msg);
  } else {
    $tweets = $('<div class="tweet friend"></div>').append(user).append(time).append(msg);
  }
  $('#chats').append($tweets);
};

app.renderRoom = function(roomName) {
  var childLength = $('#roomSelect').children().length;
  var newRoom = '<option value = "' + (childLength + 1) + '">' + roomName + '</option>';
  var $newRoom = $(newRoom);
  $('#roomSelect').append($newRoom);
};



  // $('button').on('click', function() {
  //   var username = document.URL.slice(_.lastIndexOf(document.URL, '=') + 1);
  //   var messageContent = $('#messageContent').val();
  //   var roomChoice = document.getElementById('roomChoice');
  //   var roomSelected = roomChoice.options[roomChoice.selectedIndex].text;
  //   var message = {
  //     username: username,
  //     text: messageContent,
  //     roomname: roomSelected
  //   };
  //   app.send(message);
  // });




