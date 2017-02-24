var brain = {
    init: function(settings){
        brain.config = {  
            $processBtn: $("#btn-process"),
            currentDate: new Date(),
            timeStamp: '',
            textData: '',
            headerData: '',
            footerData: '',
            recordCount: 0,
            devMode: false
        };
        $.extend(brain.config, settings);
        brain.ready();
    },
    ready: function(){
        this.config.$processBtn.click(function(e){
            e.preventDefault();
        });

        // init dropzone
        brain.dropzone();

    },
    dropzone: function(){
        Dropzone.options.dropzone = {
            paramName: "file", // The name that will be used to transfer the file
            maxFilesize: 2, // MB
            accept: function(file, done) {
                done();
            },
            renameFilename: brain.cleanFilename,
            acceptedFiles: '.csv',
            addRemoveLinks: true,
            autoProcessQueue: false,
            init: function() {
                myDropzone = this;
                $('#btn-process').on('click', function() {
                    myDropzone.processQueue(); 
                });
                myDropzone.on("complete", function(file) {
                    myDropzone.removeFile(file);
                    console.log(file.name+' has been uploaded.');
                    var name = $(file.previewElement).find('[data-dz-name]').text();
                    brain.createHeader();
                    brain.parseCSV(file,name);
                });
            },
        };
    },
    createHeader: function(){
        var headerCode = 'H';
        var vendorId = $('#vendorID').val();
        var filler1 = brain.createFiller(20-vendorId.length);
        var dateTime = brain.config.timeStamp;
        var version = 'V2';
        var filler2 = brain.createFiller(48);
        var vendorEmail = $('#vendorEmail').val();
        var filler3 = brain.createFiller((80-vendorEmail.length)+1054);

        brain.config.headerData = headerCode+vendorId+filler1+dateTime+version+filler2+vendorEmail+filler3+"\n";
    },
    createFooter: function(){
        var trailerCode = 'T';
        var vendorId = $('#vendorID').val();
        var filler1 = brain.createFiller(20-vendorId.length);
        var dateTime = brain.config.timeStamp;
        var filler2 = brain.createFiller(50);
        var recordCount = brain.config.recordCount;
        var filler3 = brain.createFiller((10-recordCount.toString().length)+1124);

        brain.config.footerData = trailerCode+vendorId+filler1+dateTime+filler2+recordCount+filler3+"\n";
    },
    parseCSV: function(file,name) {
        // Parse local CSV file
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            // step: function(results, parser) {
            //   console.log("Row data:", results.data);
            //   console.log("Row errors:", results.errors);
            // },
            complete: function(results) {
                // console.log("Finished:", results.data);
                // console.log(JSON.stringify(results.data));

                // if(results.slice(-1) ==  '\n') results = results.slice(0, - 1);

                if (results.meta['fields'][0] == "Date") {
                  console.log('This file is from Pandora');
                  brain.parseDataPandora(results.data,name)
                } else if (results.meta['fields'][0] == "id")  {
                  console.log('This file is from Facebook');
                  brain.parseDataFacebook(results.data,name)
                } else if (results.meta['fields'][0] == "Email Address")  {
                  console.log('This file is from Mailchimp');
                  brain.parseDataMailchimp(results.data,name)
                } else if (results.meta['fields'][0] == "created_time")  {
                  console.log('This file is from MAX');
                  brain.parseDataMAX(results.data,name)
                }
            }
        });
    },
    parseDataPandora: function(data,name) {
        brain.config.recordCount = 0; // reset for each file
        var recordData = '';
        var divisionCode = 'FD ';
        var businessFlag = 'I';
        var filler1 = brain.createFiller(57);  // filler before first name
        var filler2 = brain.createFiller(193); // filler for name/address since it's not present in this file
        var countryCode = 'USA';
        var phoneHome = brain.createFiller(10);
        var phoneWork = brain.createFiller(10);
        var campaignCode = $('#campaignCode').val();
        var sequenceCode = $('#sequenceCode').val();
        var qa1 = '0799A';

        $.each(data, function(i, item) {
            recordData = recordData+divisionCode+businessFlag+filler1+filler2+countryCode;
            recordData = recordData+data[i].ZIP+'     '; // Zip plus spaces
            recordData = recordData+phoneHome+phoneWork;
            recordData = recordData+data[i].Email;
            recordData = recordData+brain.createFiller(80-data[i].Email.length);
            recordData = recordData+campaignCode+brain.createFiller(10-campaignCode.length)+sequenceCode;
            recordData = recordData+brain.createFiller(60);
            var date = data[i].Date;
                date = moment(date, "MM/DD/YYYY HH:mm:ss");
                date = date.format("MM/DD/YYYY HH:mm");
            recordData = recordData+date;
            recordData = recordData+brain.createFiller(45);
            recordData = recordData+qa1;
            recordData = recordData+brain.createFiller(715); // Space for Question/Answer Array
            recordData = recordData+'\n'; // end of record

            brain.config.recordCount = brain.config.recordCount + 1;
        });

        console.log(brain.config.recordCount+' records created')

        brain.createFooter();
        brain.config.textData=brain.config.headerData+recordData+brain.config.footerData;
        brain.showResult(name, brain.config.textData, brain.config.recordCount);
    },
    parseDataFacebook: function(data,name) {
        brain.config.recordCount = 0; // reset for each file
        var recordData = '';
        var divisionCode = 'FD ';
        var businessFlag = 'I';
        var filler1 = brain.createFiller(57);  // filler before first name
        var countryCode = 'USA';
        var phoneHome = brain.createFiller(10);
        var phoneWork = brain.createFiller(10);
        var campaignCode = $('#campaignCode').val();
        var sequenceCode = $('#sequenceCode').val();
        var qa1 = '0799A';

        $.each(data, function(i, item) {
            recordData = recordData+divisionCode+businessFlag+filler1;
            var firstName = brain.cleanNameCharacters(data[i].first_name);
            recordData = recordData+firstName+brain.createFiller(30-data[i].first_name.length)+' ';
            var lastName = brain.cleanNameCharacters(data[i].last_name)
            recordData = recordData+lastName+brain.createFiller((35-data[i].last_name.length)+127);
            var zipcode = data[i].zip_code;
            if (zipcode.substr(0,2) == "z:") {
                zipcode = zipcode.substr(2,5);
            }
            recordData = recordData+countryCode+zipcode+'     '; // Zip plus spaces
            recordData = recordData+phoneHome+phoneWork;
            recordData = recordData+data[i].email;
            recordData = recordData+brain.createFiller(80-data[i].email.length);
            recordData = recordData+campaignCode+brain.createFiller(10-campaignCode.length)+sequenceCode;
            recordData = recordData+brain.createFiller(60);
            var datetime = data[i].created_time;
            date = datetime.substr(0, 10);
            time = datetime.substr(11,5);
            date = date+' '+time;
                date = moment(date, "YYYY-MM-DD HH:mm");
                date = date.format("MM/DD/YYYY HH:mm");
            recordData = recordData+date;
            recordData = recordData+brain.createFiller(45);
            recordData = recordData+qa1;
            recordData = recordData+brain.createFiller(715); // Space for Question/Answer Array
            recordData = recordData+'\n'; // end of record

            brain.config.recordCount = brain.config.recordCount + 1;
        });

        console.log(brain.config.recordCount+' records created')

        brain.createFooter();
        brain.config.textData=brain.config.headerData+recordData+brain.config.footerData;
        brain.showResult(name, brain.config.textData, brain.config.recordCount);
    },
    parseDataMailchimp: function(data,name) {
        brain.config.recordCount = 0; // reset for each file
        var recordData = '';
        var divisionCode = 'FD ';
        var businessFlag = 'I';
        var filler1 = brain.createFiller(57);  // filler before first name
        var countryCode = 'USA';
        // var phoneHome = brain.createFiller(10);
        var phoneWork = brain.createFiller(10);
        var campaignCode = $('#campaignCode').val();
        var sequenceCode = $('#sequenceCode').val();
        var qa1 = '0799A';

        $.each(data, function(i, item) {
            recordData = recordData+divisionCode+businessFlag+filler1;
            var firstName = brain.cleanNameCharacters(data[i]['First Name']);
            recordData = recordData+firstName+brain.createFiller(30-data[i]['First Name'].length)+' ';
            var lastName = brain.cleanNameCharacters(data[i]['Last Name']);
            recordData = recordData+lastName+brain.createFiller((35-data[i]['Last Name'].length)+127);
            recordData = recordData+countryCode+data[i]['Zipcode']+'     '; // Zip plus spaces
            var phoneHome = data[i]['Phone'];
                phoneHome = phoneHome.replace(/-/g, ""); // replace dashes in phone number
            recordData = recordData+phoneHome+phoneWork+brain.createFiller(10-phoneHome.length);
            recordData = recordData+data[i]['Email Address']
            recordData = recordData+brain.createFiller(80-data[i]['Email Address'].length);
            recordData = recordData+campaignCode+brain.createFiller(10-campaignCode.length)+sequenceCode;
            recordData = recordData+brain.createFiller(60);
            var date = data[i]['CONFIRM_TIME'];
            if (date.substr(0,2) == "20") {
                date = moment(date, "YYYY-MM-DD HH:mm:ss");
            } else {
                date = moment(date, "MM-DD-YYYY HH:mm:ss");
            }
            date = date.format("MM/DD/YYYY HH:mm");

            recordData = recordData+date;
            recordData = recordData+brain.createFiller(45);
            recordData = recordData+qa1;
            recordData = recordData+brain.createFiller(715); // Space for Question/Answer Array
            recordData = recordData+'\n'; // end of record

            brain.config.recordCount = brain.config.recordCount + 1;
        });

        console.log(brain.config.recordCount+' records created')

        brain.createFooter();
        brain.config.textData=brain.config.headerData+recordData+brain.config.footerData;
        brain.showResult(name, brain.config.textData, brain.config.recordCount);
    },
    parseDataMAX: function(data,name) {
        brain.config.recordCount = 0; // reset for each file
        var recordData = '';
        var divisionCode = 'FD ';
        var businessFlag = 'I';
        var filler1 = brain.createFiller(57);  // filler before first name
        var countryCode = 'USA';
        // var phoneHome = brain.createFiller(10);
        var phoneWork = brain.createFiller(10);
        var campaignCode = $('#campaignCode').val();
        var sequenceCode = $('#sequenceCode').val();
        var qa1 = '0799A';

        $.each(data, function(i, item) {
            recordData = recordData+divisionCode+businessFlag+filler1;
            var firstName = brain.cleanNameCharacters(data[i]['first_name']);
            recordData = recordData+firstName+brain.createFiller(30-data[i]['first_name'].length)+' ';
            var lastName = brain.cleanNameCharacters(data[i]['last_name']);
            recordData = recordData+lastName+brain.createFiller((35-data[i]['last_name'].length)+127);
            recordData = recordData+countryCode+data[i]['zip_code']+'     '; // Zip plus spaces
            var phoneHome = data[i]['phone'];
                phoneHome = phoneHome.replace(/-/g, ""); // replace dashes in phone number
            recordData = recordData+phoneHome+phoneWork+brain.createFiller(10-phoneHome.length);
            recordData = recordData+data[i]['email']
            recordData = recordData+brain.createFiller(80-data[i]['email'].length);
            recordData = recordData+campaignCode+brain.createFiller(10-campaignCode.length)+sequenceCode;
            recordData = recordData+brain.createFiller(60);
             var date = data[i]['created_time'];
                date = moment(date, "MM/DD/YYYY HH:mm");
                date = date.format("MM/DD/YYYY HH:mm");
            recordData = recordData+date;
            recordData = recordData+brain.createFiller(45);
            recordData = recordData+qa1;
            recordData = recordData+brain.createFiller(715); // Space for Question/Answer Array
            recordData = recordData+'\n'; // end of record

            brain.config.recordCount = brain.config.recordCount + 1;
        });

        console.log(brain.config.recordCount+' records created')

        brain.createFooter();
        brain.config.textData=brain.config.headerData+recordData+brain.config.footerData;
        brain.showResult(name, brain.config.textData, brain.config.recordCount);
    },
    createFiller: function(num){
        var max = num; //times to repeat
        var chr = " "; //char to repeat

        if (max > 0) {
            var filler = new Array(max + 1).join(chr);
            return filler;
        } else {
            return ''
        }
    },
    showResult: function(name, textData, numRecords) {
        $('.result').show();
        name = name.replace('csv', 'txt')
        $('#result').append('<p><a href="'+brain.makeTextFile(textData)+'" download="'+name+'" class="">Download '+name+'</a> - '+numRecords+' records</p>').show();
    },
    makeTextFile: function(text){
        var textFile = null;
        var data = new Blob([text], {type: 'text/plain'});

        // If we are replacing a previously generated file we need to
        // manually revoke the object URL to avoid memory leaks.
        if (textFile !== null) {
          window.URL.revokeObjectURL(textFile);
        }

        textFile = window.URL.createObjectURL(data);

        return textFile;
    },
    cleanFilename: function(name){
        name = name.toLowerCase().replace(/[^\w]/gi, '')
        name = name.replace('csv', '')
        name = name + '-' + brain.timeStamp() + ".csv";
        return name;
    },
    cleanNameCharacters: function(name){
        name = name.replace('á', 'a');
        name = name.replace('é', 'e');
        name = name.replace('í', 'i');
        name = name.replace('ó', 'o');
        name = name.replace('ú', 'u');
        name = name.replace('ü', 'u');
        name = name.replace('ñ', 'n');
        return name;
    },
    timeStamp: function(){
        // // Create a date object with the current time
        // var now = new Date();
        // // Create an array with the current month, day and time
        // var date = [ now.getMonth() + 1, now.getDate(), now.getFullYear() ];
        // // Create an array with the current hour, minute and second
        // var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ];
        // // Determine AM or PM suffix based on the hour
        // var suffix = ( time[0] < 12 ) ? "AM" : "PM";
        // // Convert hour from military time
        // time[0] = ( time[0] < 12 ) ? time[0] : time[0] - 12;
        // // If hour is 0, set it to 12
        // time[0] = time[0] || 12;
        // // If seconds and minutes are less than 10, add a zero
        // for ( var i = 1; i < 3; i++ ) {
        //     if ( time[i] < 10 ) {
        //         time[i] = "0" + time[i];
        //     }
        // }
        // // Return the formatted string
        // return date.join("") + time.join("");
        var now     = new Date(); 
        var year    = now.getFullYear();
        var month   = now.getMonth()+1; 
        var day     = now.getDate();
        var hour    = now.getHours();
        var minute  = now.getMinutes();
        var second  = now.getSeconds(); 
        if(month.toString().length == 1) {
            var month = '0'+month;
        }
        if(day.toString().length == 1) {
            var day = '0'+day;
        }   
        if(hour.toString().length == 1) {
            var hour = '0'+hour;
        }
        if(minute.toString().length == 1) {
            var minute = '0'+minute;
        }
        if(second.toString().length == 1) {
            var second = '0'+second;
        }  
        var dateTime = month+day+year+'-'+hour+minute+second;
        brain.config.timeStamp = month+'/'+day+'/'+year+' '+hour+':'+minute;
        return dateTime;
    },
    deleteImage: function(file_name){
        $.ajax({
            url: 'delete.php',
            data: file_name,
            success: function (response) {
                // do something
                console.log('deleted')
            },
            error: function () {
                // do something
                console.log('not deleted')
            }
        });
    }
};