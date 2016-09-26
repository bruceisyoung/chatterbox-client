// YOUR CODE HERE:
$(document).ready(function() {
  $('button').on('click', function() {
    var username = document.URL.slice(_.lastIndexOf(document.URL, '=') + 1);
    var messageContent = $('#messageContent').val();
    var roomChoice = document.getElementById('roomChoice');
    var roomSelected = roomChoice.options[roomChoice.selectedIndex].text;
    var message = {
      username: username,
      text: messageContent,
      roomname: roomSelected
    };
    app.send(message);
    // var room = $("#roomChoice option:selected").text();
    // console.log(room);
  });
});

const app = {};
app.server = 'https://api.parse.com/1/classes/messages';
app.init = function() {

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
    success: function (data) {
      console.log(data);
    },
    error: function (data) {
      // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
      console.error('chatterbox: Failed to send message', data);
    }
});

};