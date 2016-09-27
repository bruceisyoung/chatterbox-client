// YOUR CODE HERE:
$(document).ready(() => {
  app.init();
  //changed the way the call app.fetch;
  app.fetch({roomname: 'lobby'});

  $('#submitRoom').on('click', () => {
    var newRoom = $('#newRoom').val();
  //we need to find out whether the room has existed or not
    if (!checkRoom(newRoom)) {
      app.renderRoom(newRoom);
    }
  });

  $('#refresh').on('click', () => {
    app.clearMessages();
    app.fetch();
  });

  $('#gotoNewRoom').on('click', () => {
    var newRoom = $('#newRoom').val();
    if (!checkRoom(newRoom)) {
      app.renderRoom(newRoom);
    }
    if (!checkRoomTab(newRoom)) {
      createRoomTab(newRoom);
    }
    console.log($('.tab').children());
    console.log($('.tab').children().length);
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
  app.renderRoom('lobby');
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

app.fetch = (filterObject) => {
  $.ajax({
  // This is the url you should use to communicate with the parse API server.
    url: app.server,
    type: 'GET',
    contentType: 'application/json',
    //data: {where: {roomname: 'lobby', username: 'sjfkdlsa'}, limit: 50, order: '-createdAt'},
    data: {where: filterObject, limit: 50, order: '-createdAt'},
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


var checkRoom = (roomname) => {
  var childLength = $('#roomSelect').children().length;
  for (var i = 0; i < childLength; i++) {
    if (roomname === $($('#roomSelect').children()[i]).text()) {
      return true;
    }  
  }
  return false;
};

var checkRoomTab = (roomname) => {
  var childLength = $('.tab').children().length;
  for (var i = 0; i < childLength; i++) {
    if (roomname === $($('.tab').children()[i]).text()) {
      return true;
    }
  }
  return false;
}

var createRoomTab = (roomname) => {
  newRoomTab = `<li><a href="#" class="tablinks" onclick="openCity(event, 'London')">${roomname}</a></li>`;
  $('.tab').append($(newRoomTab));
}
