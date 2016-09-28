// YOUR CODE HERE:
const app = {};

app.init = () => {
  app.server = 'https://api.parse.com/1/classes/messages'; //store the server address
  app.friends = [];                   //create a global array to store friends
  app.renderRoom('lobby');            //make lobby the default room
  $('.tab #lobby').addClass('active'); //make active as the default state of lobby in the tab area 
  app.fetch({roomname: 'lobby'});
};

app.clearMessages = () => $('#chats').html('');

app.send = (message) => {                                           //notice the format of ajax data request
  $.ajax({
    url: app.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: (data) => {
      app.clearMessages();
      app.fetch({roomname: $("#roomSelect").val()});
    },
    error: (data) => {
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.fetch = (filterObject) => {                                     //notice the format of ajax data request
  $.ajax({
    url: app.server,
    type: 'GET',
    contentType: 'application/json',
    data: {where: filterObject, limit: 50, order: '-createdAt'},    //data parse format: {where: {roomname: 'lobby', username: 'sjfkdlsa'}, limit: 50, order: '-createdAt'},
    success: (data) => {
      _.each(data.results, (datum) => {
        app.renderMessage(datum);
      });
    },
    error: (data) => {
      console.error('chatterbox: Failed to send message', data);
    }
  });

};

app.renderMessage = (message) => {
  var tweet;
  var user = $('<a class="tweetUser" href="#"></a>').text(message.username);
  var time = $('<span class="tweetTime"></span>').text(`${jQuery.timeago(message.updatedAt)}`);   //use timeage module to display the time in a user-friendly way
  var msg = $('<p class="tweetMessage"></p>').text(message.text);
  $tweets = $('<div class="tweet"></div>').append(user).append(time).append(msg);
  if ((_.indexOf(app.friends, message.username) !== -1)) {
    $tweets.addClass('friend');
  }
  $('#chats').append($tweets);
};

app.renderRoom = (roomName) => {
  var newRoom = `<option value = "${roomName}">${roomName}</option>"`;
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
};

var createRoomTab = (roomname) => {
  newRoomTab = `<li><a href="#" id="${roomname}" onclick="setActive(event, '${roomname}')">${roomname}</a></li>`;
  $('.tab').append($(newRoomTab));
};

//need to refactor this function
//when a tab is clicked, 
var setActive = (event, roomname) => {
  var childLength = $('.tab').children().length;
  for(var i = 0; i < childLength; i++) {
    $($($('.tab').children()[i]).children()[0]).removeClass('active');
    if(roomname === $($('.tab').children()[i]).text()){
      $($($('.tab').children()[i]).children()[0]).addClass('active');
    }
  }
  setSelectOption(roomname);
  app.clearMessages();
  app.fetch({roomname: roomname});
};

var setSelectOption = (roomname) => {
  $("#roomSelect").val(roomname);
};

$(document).ready(() => {
  //changed the way the call app.fetch;
  app.init();

  $('#refresh').on('click', () => {
    app.clearMessages();
    app.fetch({roomname: $("#roomSelect").val()});
  });

  $('#gotoRoom').on('click', () => {
    var newRoom = $('#newRoom').val();
    if (!checkRoom(newRoom)) {
      app.renderRoom(newRoom);
    }
    if (!checkRoomTab(newRoom)) {
      createRoomTab(newRoom);
    } 
    setSelectOption(newRoom);
    setActive(null, newRoom);
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
    app.fetch({roomname: $("#roomSelect").val()});
  });
});

