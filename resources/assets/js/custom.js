$(function() {

    Dropzone.options.dropzone = {
      paramName: "file", // The name that will be used to transfer the file
      maxFilesize: 2, // MB
      accept: function(file, done) {
        done();
        console.log(file.name+' has been uploaded.');

        parseCSV(file);
      },
      renameFilename: cleanFilename,
      acceptedFiles: '.csv'
};

}); // end ready function

function timeStamp() {
// Create a date object with the current time
  var now = new Date();

// Create an array with the current month, day and time
  var date = [ now.getMonth() + 1, now.getDate(), now.getFullYear() ];

// Create an array with the current hour, minute and second
  var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ];

// Determine AM or PM suffix based on the hour
  var suffix = ( time[0] < 12 ) ? "AM" : "PM";

// Convert hour from military time
  time[0] = ( time[0] < 12 ) ? time[0] : time[0] - 12;

// If hour is 0, set it to 12
  time[0] = time[0] || 12;

// If seconds and minutes are less than 10, add a zero
  for ( var i = 1; i < 3; i++ ) {
    if ( time[i] < 10 ) {
      time[i] = "0" + time[i];
    }
  }

// Return the formatted string
  return date.join("") + time.join("");
}

// renames uploaded file with timestamp
var cleanFilename = function (name) {
    name = name.toLowerCase().replace(/[^\w]/gi, '')
    name = name.replace('csv', '')
    name = name + timeStamp() + ".csv";
    return name;
};

function parseCSV(file) {
    // Parse local CSV file
    Papa.parse(file, {
        complete: function(results) {
            console.log("Finished:", results.data);
            console.log(JSON.stringify(results.data))

            $('#result').append('<a href="'+makeTextFile(JSON.stringify(results.data))+'" download="record'+timeStamp()+'" class="btn btn-download">Download Text File</a>').show();
        }
    });
}

  // var create = document.getElementById('create'),
  //   textbox = document.getElementById('textbox');

  // create.addEventListener('click', function () {
  //   var link = document.getElementById('downloadlink');
  //   link.href = makeTextFile(textbox.value);
  //   link.style.display = 'block';
  // }, false);

var textFile = null;
var makeTextFile = function (text) {
    var data = new Blob([text], {type: 'text/plain'});

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);

    return textFile;
};