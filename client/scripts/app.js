// YOUR CODE HERE:
const app = {};

app.init = () => {
  app.server = 'https://api.parse.com/1/classes/messages'; //store the server address
  app.friends = [];                   //create a global array to store friends
  app.latestMessage = {};
  app.latestTab = 'All';
  app.renderRoom('All');
  app.renderRoom('lobby');            //make lobby the default room
  $('.tab #All').addClass('active'); //make active as the default state of lobby in the tab area 
  app.fetch({roomname: $("#roomSelect").val()});
};

app.clearMessages = () => $('#chats').html('');

app.send = (message) => {                                           //notice the format of ajax data request
  $.ajax({
    url: app.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: (data) => {
      app.fetch({roomname: $("#roomSelect").val()});                //
    },
    error: (data) => {
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.fetch = (filterObject) => {                                     //notice the format of ajax data request
  var room = filterObject.roomname;
  if (room === 'All') {
    filterObject = {};
  }
  $.ajax({
    url: app.server,
    type: 'GET',
    contentType: 'application/json',
    data: {where: filterObject, limit: 20, order: '-createdAt'},    //data parse format: {where: {roomname: 'lobby', username: 'sjfkdlsa'}, limit: 50, order: '-createdAt'},
    success: (data) => {
      if(data.results[0] === undefined) {                           //if no message has been sent inside this current room
        app.clearMessages();                                        //clear the message board
      } else if(app.latestMessage[room] == null || app.latestMessage[room] !== data.results[0].objectId || app.lastest !== room) {
        app.clearMessages();                                        //if the room hasn't been created on the tab area and their messages hasn't been loaded before
        _.each(data.results, (datum) => {                           //or the messages fetched last time and the currently received aren't the same
          app.renderMessage(datum);                                 //or the tab displayed last time and this time aren't the same
        });                                                         //clear the messages and display the new ones
        app.latestMessage[room] = data.results[0].objectId;         //update the lastest messages loaded
        app.latestTab = room;                                       //update the current tab
      }
      $('#' + room).text(`${room}`);
    },
    error: (data) => {
      console.error('chatterbox: Failed to fetch messages', data);
    }
  });
};

app.checkMessage = (filterObject) => {
  var room = filterObject.roomname;
  if (room === 'All') {
    filterObject = {};
  }
  $.ajax({
    url: app.server,
    type: 'GET',
    contentType: 'application/json',
    data: {where: filterObject, limit: 20, order: '-createdAt'},
    success: (data) => {
      if(data.results[0] !== undefined && app.latestMessage[room] !== data.results[0].objectId) {
        if ($(`#${filterObject.roomname}`).hasClass('active')) {
          app.fetch(filterObject);
        } else {
          var newMessageCount = 0;
          for (var i = 0; i < data.results.length; i++) {
            if(app.latestMessage[room] === data.results[i].objectId) {
              break;
            } else {
              newMessageCount++;
            }
          }
          $('#' + room).text(`${room}(${newMessageCount})`);
        }
      }
    },
    error: (data) => {
      console.error('chatterbox: Failed to check message status', data);
    }
  });
};

app.renderMessage = (message) => {
  var tweet;
  var user = $('<a class="tweetUser" href="#"></a>').text(message.username);
  var time = $('<span class="tweetTime"></span>').text(`${jQuery.timeago(message.updatedAt)}`);   //use timeage module to display the time in a user-friendly way
  var msg = $('<br><span class="tweetMessage"></span>').text(message.text);
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

var checkRoom = (roomname) => {           //check whether this room has been defined in the select
  var childLength = $('#roomSelect').children().length;
  for (var i = 0; i < childLength; i++) {
    if (roomname === $($('#roomSelect').children()[i]).text()) {
      return true;
    }  
  }
  return false;
};

var checkRoomTab = (roomname) => {        //check whether this room has been created in the tab
  var childLength = $('.tab').children().length;
  for (var i = 0; i < childLength; i++) {
    if ($($('.tab').children()[i]).attr('id') === roomname) {
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
    if($($($('.tab').children()[i]).children()[0]).attr('id') === roomname) {
      $($($('.tab').children()[i]).children()[0]).addClass('active');
    }
  }
  setSelectOption(roomname);
  app.fetch({roomname: roomname});
};

var setSelectOption = (roomname) => {
  $("#roomSelect").val(roomname);
};

$(document).ready(() => {
  //changed the way the call app.fetch;
  app.init();

  $('#refresh').on('click', () => {
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
    app.fetch({roomname: $("#roomSelect").val()});
  });

  setInterval(function() {
    var liGroup = $('.tab').children();
    for(var i = 0; i < liGroup.length; i++) {
      var room = $($(liGroup[i]).children()[0]).attr('id');
      app.checkMessage({roomname: room});
    }
  }, 60000);
});

