// YOUR CODE HERE:
$(document).ready(() => {
  app.init();
  app.fetch();

  $('#submitRoom').on('click', () => {
    var newRoom = $('#newRoom').val();
    app.renderRoom(newRoom);
  });

  $('#refresh').on('click', () => {
    app.clearMessages();
    app.fetch();
  });

  $('#send').on('submit', () => {
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

app.init = () => {
  app.server = 'https://api.parse.com/1/classes/messages';
  app.friends = [];
};

app.send = (message) => {
  $.ajax({
    // This is the url you should use to communicate with the parse API server.
    url: app.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: (data) => {
      console.log('chatterbox: Message sent');
    },
    error: (data) => {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.fetch = () => {
  $.ajax({
  // This is the url you should use to communicate with the parse API server.
    url: app.server,
    type: 'GET',
    contentType: 'application/json',
    data: {limit: 100, order: '-createdAt'},
    success: (data) => {
      // 'order=-updatedAt';
      _.each(data.results, (datum) => {
        app.renderMessage(datum);
      });
    },
    error: (data) => {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
  });

};

app.clearMessages = () => $('#chats').empty();

app.renderMessage = (message) => {
  var tweet;
  var user = $('<a class="tweetUser" href="#"></a>').text(message.username);
  var time = $('<span class="tweetTime"></span>').text(`${jQuery.timeago(message.updatedAt)}`);
  var msg = $('<p class="tweetMessage"></p>').text(message.text);
  $tweets = $('<div class="tweet"></div>').append(user).append(time).append(msg);
  if ((_.indexOf(app.friends, message.username) !== -1)) {
    $tweets.addClass('friend');
  }
  $('#chats').append($tweets);
};

app.renderRoom = (roomName) => {
  var childLength = $('#roomSelect').children().length;
  var newRoom = `<option value = ${childLength + 1}>${roomName}</option>"`;
  $('#roomSelect').append($(newRoom));
};
