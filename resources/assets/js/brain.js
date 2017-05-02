var brain = {
    init: function(settings){
        brain.config = {  
            $processBtn: $("#btn-process"),
            currentDate: new Date(),
            timeStamp: '',
            textData: '',
            headerData: '',
            footerData: '',
            recordData: '',
            recordCount: 0,
            translationErrors: [],
            combineRecords: false,
            filesToProcess: 0,
            devMode: false
        };
        $.extend(brain.config, settings);
        brain.ready();
    },
    ready: function(){
        this.config.$processBtn.click(function(e){
            brain.config.uploadedFiles = 0;
            brain.config.combineRecords = $('#combine:checkbox:checked').length > 0;
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
            parallelUploads: 10,
            init: function() {
                myDropzone = this;
                $('#btn-process').on('click', function() {
                    if (brain.config.combineRecords) { brain.config.filesToProcess = myDropzone.files.length; } // how many CSV files are uploaded
                    myDropzone.processQueue(); 
                });

                // this.on("success", function() {
                //    myDropzone.options.autoProcessQueue = true; 
                // });
                myDropzone.on("complete", function(file) {
                    myDropzone.removeFile(file);
                    console.log(file.name+' has been uploaded.');
                    var name = $(file.previewElement).find('[data-dz-name]').text();
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
        console.log(name)
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

        brain.config.recordData = brain.config.recordData + recordData;

        brain.config.filesToProcess = brain.config.filesToProcess - 1;
        if (brain.config.filesToProcess <= 0) {
            brain.showResult(name, brain.config.recordData, brain.config.recordCount);
        }
    },
    parseDataFacebook: function(data,name) {
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
        var q2 = 'how_soon_are_you_looking_to_buy?';
        var a2 = '';

        $.each(data, function(i, item) {
            recordData = recordData+divisionCode+businessFlag+filler1;

            // Name
            var firstName = brain.scrubName(data[i].first_name);
            recordData = recordData+firstName+brain.createFiller(30-firstName.length)+' ';
            var lastName = brain.scrubName(data[i].last_name)
            recordData = recordData+lastName+brain.createFiller((35-lastName.length)+5); // still adding 5 spaces for suffix which isn't present yet

            // Street Address
            if (data[i].street_address != undefined) {
                var streetAddress1 = data[i].street_address;
                recordData = recordData+streetAddress1+brain.createFiller((40-streetAddress1.length+40)); // still adding 40 spaces for street address 2 which isn't present yet
                // var streetAddress2 = data[i].street_address2;
                // recordData = recordData+streetAddress2+brain.createFiller((40-streetAddress2));
            } else {
                recordData = recordData + brain.createFiller(80); 
            }

            // City
            if (data[i].city != undefined) {
                var city = data[i].city;
                recordData = recordData+city+brain.createFiller((40-city.length));
            } else {
                recordData = recordData + brain.createFiller(40); 
            }

            // State
            if (data[i].state != undefined) {
                var state = data[i].state;
                recordData = recordData+state+brain.createFiller((2-state.length));
            } else {
                recordData = recordData + brain.createFiller(2);
            }

            // Zip Code
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

            // Intent Question
            if (data[i][q2] != undefined) {
                var qa2 = '1077';

                if (data[i][q2] == '0-30_Days')             {a2 = 'A';}
                else if (data[i][q2] == '0-30_Days')        {a2 = 'A';}
                else if (data[i][q2]== '1-3_Months')        {a2 = 'B';}
                else if (data[i][q2] == '4-6_Months')       {a2 = 'C';}
                else if (data[i][q2] == '7+_Months')        {a2 = 'D';}
                else if (data[i][q2] == 'No_Definite_Plans'){a2 = 'E';}
                else {qa2='    ';a2=' ';}
                recordData = recordData+brain.createFiller(19);
                recordData = recordData+qa2+a2;
                recordData = recordData+brain.createFiller(691);
            } else {
                recordData = recordData+brain.createFiller(715); // Space for Question/Answer Array
            }
            recordData = recordData+'\n'; // end of record

            brain.config.recordCount = brain.config.recordCount + 1;
        });

        console.log(brain.config.recordCount+' records created')

        brain.config.recordData = brain.config.recordData + recordData;

        brain.config.filesToProcess = brain.config.filesToProcess - 1;

        if (brain.config.filesToProcess <= 0) {
            brain.showResult(name, 'FB');
        }
    },
    parseDataMailchimp: function(data,name) {

        var byFDAF = brain.groupBy(data,'FDAF'); // Sort by FDAF
        var keys = Object.keys(byFDAF); // Get FDAF keys
        
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
        var q2 = 'In Market Intent (1077)';
        var a2 = '';

        $.each(keys, function(k, item) {
            $.each(byFDAF[item], function(i, data) {
                recordData = recordData+divisionCode+businessFlag+filler1;
                var firstName = brain.scrubName(data['First Name']);
                recordData = recordData+firstName+brain.createFiller(30-firstName.length)+' ';
                var lastName = brain.scrubName(data['Last Name']);
                recordData = recordData+lastName+brain.createFiller((35-lastName.length)+5); // still adding 5 spaces for suffix which isn't present yet

                // Street Address 1
                var streetAddress1 = data['Address 1'].substr(0,40);
                if (streetAddress1 != undefined) {
                    recordData = recordData+streetAddress1+brain.createFiller((40-streetAddress1.length));
                } else {
                    recordData = recordData + brain.createFiller(40); 
                }

                // Street Address 2
                var streetAddress2 = data['Address 2'].substr(0,40);
                if (streetAddress2 != undefined) {
                    recordData = recordData+streetAddress2+brain.createFiller((40-streetAddress2.length));
                } else {
                    recordData = recordData + brain.createFiller(40); 
                }

                // City
                var city = data['City'];
                if (city != undefined) {
                    recordData = recordData+city+brain.createFiller((40-city.length));
                } else {
                    recordData = recordData + brain.createFiller(40); 
                }

                // State
                var state = data['State'];
                if (state != undefined) {
                    recordData = recordData+state+brain.createFiller((2-state.length));
                } else {
                    recordData = recordData + brain.createFiller(2);
                }

                // Zipcode
                recordData = recordData+countryCode+data['Zipcode']+'     '; // Zip plus spaces

                // Phone
                var phoneHome = data['Phone'];
                    phoneHome = phoneHome.replace(/-/g, ""); // replace dashes in phone number
                recordData = recordData+phoneHome+phoneWork+brain.createFiller(10-phoneHome.length);

                // Email
                recordData = recordData+data['Email Address']
                recordData = recordData+brain.createFiller(80-data['Email Address'].length);

                recordData = recordData+campaignCode+brain.createFiller(10-campaignCode.length)+sequenceCode;
                recordData = recordData+brain.createFiller(60);
                var date = data['CONFIRM_TIME'];
                if (date.substr(0,2) == "20") {
                    date = moment(date, "YYYY-MM-DD HH:mm:ss");
                } else {
                    date = moment(date, "MM-DD-YYYY HH:mm:ss");
                }
                date = date.format("MM/DD/YYYY HH:mm");

                recordData = recordData+date;
                recordData = recordData+brain.createFiller(45);
                recordData = recordData+qa1;
                
                // Intent Question
                if (data[q2] != undefined) {
                    var a2 = data[q2];
                    if (a2 != '') {
                        var qa2 = '1077';
                     } else {
                        var qa2 = '    ';
                             a2 = ' ';
                     }
                    recordData = recordData+brain.createFiller(19);
                    recordData = recordData+qa2+a2;
                    recordData = recordData+brain.createFiller(691);
                } else {
                    recordData = recordData+brain.createFiller(715); // Space for Question/Answer Array
                }

                recordData = recordData+'\n'; // end of record

                brain.config.recordCount = brain.config.recordCount + 1;
            });

            console.log(brain.config.recordCount+' records created')
        
            brain.config.recordData = brain.config.recordData + recordData;

            if (item == '') {item = "Other"}
            brain.showResult(name, item);
        });



        // brain.config.filesToProcess = brain.config.filesToProcess - 1;
        // if (brain.config.filesToProcess <= 0) {
        //     brain.showResult(name, brain.config.recordData, brain.config.recordCount);
        // }
    },
    parseDataMAX: function(data,name) {
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
            var firstName = brain.scrubName(data[i]['first_name']);
            recordData = recordData+firstName+brain.createFiller(30-firstName.length)+' ';
            var lastName = brain.scrubName(data[i]['last_name']);
            recordData = recordData+lastName+brain.createFiller((35-lastName.length)+127);
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

        brain.config.recordData = brain.config.recordData + recordData;

        brain.config.filesToProcess = brain.config.filesToProcess - 1;
        if (brain.config.filesToProcess <= 0) {
            brain.showResult(name, brain.config.recordCount);
        }
    },
    createFiller: function(num){
        // This function creates the chunks of blank spaces in the text file
        var max = num; //times to repeat
        var chr = " "; //char to repeat

        if (max > 0) {
            var filler = new Array(max + 1).join(chr);
            return filler;
        } else {
            return ''
        }
    },
    showResult: function(name, FDAF) {
        brain.createHeader();
        brain.createFooter();
        // Created the file name for the .txt file
        // FDAF_campaignCode-sequenceCode_NumberOfRecords_MMDDYY

        var filename = FDAF + '_' + $('#campaignCode').val() + '-' + $('#sequenceCode').val() + '_' + brain.config.recordCount + '_' + moment().format('MMDDYY[_]hmmss');

        // Put all content into one variable
        brain.config.textData=brain.config.headerData+brain.config.recordData+brain.config.footerData;

        $('.result').show();
        name = name.replace('csv', 'txt')
        $('#result').append('<p><a href="'+brain.makeTextFile(brain.config.textData)+'" download="'+filename+'" class="">Download '+filename+'</a> - '+brain.config.recordCount+' records</p>').show();

        brain.config.recordData = ''; // clear data
        brain.config.textData = ''; // clear data
        brain.config.recordCount = 0;  // clear data
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
    cleanFilename: function(filename){
        filename = filename.toLowerCase().replace(/[^\w]/gi, '')
        filename = filename.replace('csv', '')
        filename = filename + '-' + brain.timeStamp() + ".csv";
        return filename;
    },
    scrubName: function(name){
        name = name.replace('á', 'a');
        name = name.replace('é', 'e');
        name = name.replace('í', 'i');
        name = name.replace('ó', 'o');
        name = name.replace('ú', 'u');
        name = name.replace('ü', 'u');
        name = name.replace('ñ', 'n');

        name = name.replace('Á', 'A');
        name = name.replace('É', 'E');
        name = name.replace('Í', 'I');
        name = name.replace('Ó', 'O');
        name = name.replace('Ú', 'U');
        name = name.replace('Ü', 'U');
        name = name.replace('Ñ', 'N');

        name = name.replace('ä', 'a');
        name = name.replace('Ä', 'A');
        name = name.replace('ö', 'o');
        name = name.replace('Ö', 'O');
        name = name.replace('ò', 'o');
        name = name.replace('Ò', 'O');

        name = name.replace('Ã©', 'e');
        name = name.replace('Ã',  'i');
        name = name.replace('Ã±', 'n');
        name = name.replace('Ã¡', 'a');
        name = name.replace('Ãº', 'u');
        name = name.replace('Ã³', 'o');
        name = name.replace('Ã“', 'O');
        name = name.replace('Ã‰', 'A');

        // Removes all non-ASCII characters
        name = name.replace(/[^\x00-\x7F]/g, "");
        return name;
    },
    groupBy: function(array, property){
    // Array Sort Function
        var hash = {};
        for (var i = 0; i < array.length; i++) {
            if (!hash[array[i][property]]) hash[array[i][property]] = [];
            hash[array[i][property]].push(array[i]);
        }
        return hash;   
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
        var shortYear = now.getFullYear().toString().substr(-2);
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
        var dateTime = month+day+shortYear;
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