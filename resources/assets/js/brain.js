var duplicate_count=0;
var record_count=0;
function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
        end = new Date().getTime();
    }
}
function count_element(arr){
    var arr=_(arr).toArray();
    var count=0;
    for (var i=0;i<arr.length;i++){
        if(arr[i]!=""){
            count++;
        }
    }
    return count;
}
var brain = {
    init: function(settings){
        brain.config = {
            $processBtn: $("#btn-process"),
            $formName: $("#parseform"),
            currentDate: new Date(),
            timeStamp: '',
            textData: '',
            headerData: '',
            footerData: '',
            recordData: '',
            recordCount: 0,
            translationErrors: [],
            processedEmails: [],
            combineRecords: false,
            filesToProcess: 0,
            devMode: false
        };
        $.extend(brain.config, settings);
        brain.ready();
    },
    ready: function(){
        this.config.$processBtn.click(function(e){
            var isValid = brain.config.$formName.parsley().validate();
            if (isValid) {
                brain.config.uploadedFiles = 0;
                brain.config.combineRecords = $('#combine:checkbox:checked').length > 0;
            }
            e.preventDefault();
        });

        // init dropzone
        brain.dropzone();

    },
    dropzone: function(){
        Dropzone.autoDiscover = false;
        new Dropzone('#dropzone', { 
            url: "upload.php",
            dictDefaultMessage: '<div class="dz-message">Drop files here to upload</div>',
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
                brain.config.$processBtn.on('click', function(e) {
                    var isValid = brain.config.$formName.parsley().validate();
                    if (isValid) {
                        if (brain.config.combineRecords) { brain.config.filesToProcess = myDropzone.files.length; } // how many CSV files are uploaded
                        e.preventDefault();
                        myDropzone.processQueue(); 
                    }
                });

                // this.on("success", function() {
                //    myDropzone.options.autoProcessQueue = true; 
                // });
                myDropzone.on("sending", function(file, xhr, formData) {
                    // Will send the filesize along with the file as POST data.
                    formData.append("vendorEmail", $('#vendorEmail').val());
                    formData.append("campaignCode", $('#campaignCode').val());
                    formData.append("vendorID", $('#vendorID').val());
                    formData.append("sequenceCode", $('#sequenceCode').val());
                    brain.config.$processBtn.addClass('processing').html('<div class="spinner"><div class="bounce1"></div><div class="bounce2"></div><div class="bounce3"></div></div>');
                });
                myDropzone.on("complete", function(file) {
                    myDropzone.removeFile(file);
                    console.log(file.name+' has been uploaded.');
                    var name = $(file.previewElement).find('[data-dz-name]').text();
                    brain.parseCSV(file,name);
                });
            },
        });
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


                // do something...

                // if(results.slice(-1) ==  '\n') results = results.slice(0, - 1);
                if (results.meta['fields'][0] == "Date") {
                    console.log('This file is from Pandora');
                    brain.parseDataPandora(results.data,name);
                } else if (results.meta['fields'][0] == "id")  {
                    console.log('This file is from Facebook');
                    brain.parseDataFacebook(results.data,name);
                    // } else if (results.meta['fields'][11] == "FDAF")  {
                    //   console.log('This file is from Mailchimp with FDAF');
                    //   brain.parseDataMailchimpFull(results.data,name)
                } else if (results.meta['fields'][0] == "Email Address")  {
                    console.log('This file is from Mailchimp');
                    brain.parseDataMailchimp(results.data,name);
                } else if (results.meta['fields'][0] == "created_time")  {
                    console.log('This file is from MAX');
                    brain.parseDataMAX(results.data,name)
                }
            }

        });
    },
    parseDataPandora: function(data,name) {
        window.setTimeout(function () {
            var result = data.reduce(function(memo, e1){
                var matches = memo.filter(function(e2){
                    return e1.Email == e2.Email
                })
                if (matches.length == 0)
                    memo.push(e1)
                return memo;
            }, []);
            var duplicate=data.length-result.length;
            duplicate_count=duplicate_count+duplicate;
            data=result;
            $.ajax({
                type: "POST",
                url: "matchEmail.php",
                async: false,
                data: {
                    "function":"getEmails"
                },
                dataType: "json",
                success: function (data1) {
                    var check=true;
                    for(var i = 0; i < data.length; i++) {
                        var csv_count=count_element(data[i]);
                        check=true;
                        for(var j=0;j<data1.length;j++){
                            var database_csv=count_element(data1[j]);
                            if(data[i]["Email"]==data1[j]["email"]){
                                if(csv_count>database_csv){
                                    $.ajax({
                                        type: "POST",
                                        url: "matchEmail.php",
                                        data: {
                                            "function":"update",
                                            "email": data[i]["Email"],
                                            "First_Name": data[i]["first_name"],
                                            "Last_Name": data[i]["last_name"],
                                            "Zipcode": data[i]["ZIP"],
                                            "City": data[i]["city"],
                                            "State": data[i]["state"],
                                            "Address_1": data[i]["Address 1"],
                                            "Address_2": data[i]["Address 2"],
                                            "Phone": data[i]["phone_number"],
                                            "Opt-In": data[i]["Opt-In"],
                                            "In_Market_Intent": data[i]["In Market Intent (1077)"],
                                            "FDAF": data[i]["FDAF"],
                                            "DMA": data[i]["DMA"],
                                            "MEMBER_RATING": data[i]["MEMBER_RATING"],
                                            "OPTIN_TIME": data[i]["OPTIN_TIME"],
                                            "OPTIN_IP": data[i]["OPTIN_IP"],
                                            "CONFIRM_TIME": data[i]["CONFIRM_TIME"],
                                            "CONFIRM_IP": data[i]["CONFIRM_IP"],
                                            "LATITUDE": data[i]["LATITUDE"],
                                            "LONGITUDE": data[i]["LONGITUDE"],
                                            "GMTOFF": data[i]["GMTOFF"],
                                            "DSTOFF": data[i]["DSTOFF"],
                                            "TIMEZONE": data[i]["TIMEZONE"],
                                            "CC": data[i]["CC"],
                                            "REGION": data[i]["REGION"],
                                            "LAST_CHANGED": data[i]["LAST_CHANGED"],
                                            "LEID": data[i]["LEID"],
                                            "EUID": data[i]["EUID"],
                                            "NOTES": data[i]["NOTES"],
                                        },
                                        dataType: "text",
                                        success: function (data) {
                                        }
                                        ,
                                        error: function (data) {
                                        }
                                    });
                                }
                                else{

                                }
                                data.splice(i, 1);
                                duplicate_count++;
                                i--;
                                check=false;
                                break;
                            }
                        }
                        if(check){
                            record_count++;
                            $.ajax({
                                type: "POST",
                                url: "matchEmail.php",
                                async: true,
                                data: {
                                    "function":"add",
                                    "email": data[i]["Email"],
                                    "First_Name": data[i]["first_name"],
                                    "Last_Name": data[i]["last_name"],
                                    "Zipcode": data[i]["ZIP"],
                                    "City": data[i]["city"],
                                    "State": data[i]["state"],
                                    "Address_1": data[i]["Address 1"],
                                    "Address_2": data[i]["Address 2"],
                                    "Phone": data[i]["phone_number"],
                                    "Opt-In": data[i]["Opt-In"],
                                    "In_Market_Intent": data[i]["In Market Intent (1077)"],
                                    "FDAF": data[i]["FDAF"],
                                    "DMA": data[i]["DMA"],
                                    "MEMBER_RATING": data[i]["MEMBER_RATING"],
                                    "OPTIN_TIME": data[i]["OPTIN_TIME"],
                                    "OPTIN_IP": data[i]["OPTIN_IP"],
                                    "CONFIRM_TIME": data[i]["CONFIRM_TIME"],
                                    "CONFIRM_IP": data[i]["CONFIRM_IP"],
                                    "LATITUDE": data[i]["LATITUDE"],
                                    "LONGITUDE": data[i]["LONGITUDE"],
                                    "GMTOFF": data[i]["GMTOFF"],
                                    "DSTOFF": data[i]["DSTOFF"],
                                    "TIMEZONE": data[i]["TIMEZONE"],
                                    "CC": data[i]["CC"],
                                    "REGION": data[i]["REGION"],
                                    "LAST_CHANGED": data[i]["LAST_CHANGED"],
                                    "LEID": data[i]["LEID"],
                                    "EUID": data[i]["EUID"],
                                    "NOTES": data[i]["NOTES"],
                                },
                                dataType: "text",
                                success: function (data1) {
                                }
                                ,
                                error: function (data1) {
                                }
                            });
                        }
                    }
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
                        if (brain.config.processedEmails.indexOf(data[i]["Email"]) == -1) {
                            brain.config.processedEmails.push(data[i]["Email"]); // add to array of emails in files being processed to check for dupes

                            recordData = recordData+divisionCode+businessFlag+filler1+filler2+countryCode;
                            recordData = recordData+data[i].ZIP+'     '; // Zip plus spaces
                            recordData = recordData+phoneHome+phoneWork;
                            recordData = recordData+data[i].Email;
                            recordData = recordData+brain.createFiller(80-data[i].Email.length);
                            recordData = recordData+campaignCode+brain.createFiller(10-campaignCode.length)+sequenceCode;
                            recordData = recordData+brain.createFiller(60);
                            var date = data[i].Date;
                            date = moment(date, "YYYY-MM-DD HH:mm:ss");
                            date = date.format("MM/DD/YYYY HH:mm");
                            recordData = recordData+date;
                            recordData = recordData+brain.createFiller(45);
                            recordData = recordData+qa1;
                            recordData = recordData+brain.createFiller(715); // Space for Question/Answer Array
                            recordData = recordData+'\n'; // end of record

                            brain.config.recordCount = brain.config.recordCount + 1;
                        } else {
                            duplicate_count++;
                        }
                    });

                    console.log(brain.config.recordCount+' records created')

                    brain.config.recordData = brain.config.recordData + recordData;

                    brain.config.filesToProcess = brain.config.filesToProcess - 1;
                    if (brain.config.filesToProcess <= 0) {
                        brain.showResult(name, 'Pandora');
                    }
                }
                ,
                error: function (data1) {
                }
            });
        },3000);
    },
    parseDataFacebook: function(data,name) {
        window.setTimeout(function () {
            var result = data.reduce(function(memo, e1){
                var matches = memo.filter(function(e2){
                    return e1.email == e2.email
                })
                if (matches.length == 0)
                    memo.push(e1)
                return memo;
            }, []);
            var duplicate=data.length-result.length;
            duplicate_count=duplicate_count+duplicate;
            data=result;
            $.ajax({
                type: "POST",
                url: "matchEmail.php",
                async: false,
                data: {
                    "function":"getEmails"
                },
                dataType: "json",
                success: function (data1) {
                    var check=true;
                    for(var i = 0; i < data.length; i++) {
                        var csv_count=count_element(data[i]);
                        check=true;

                        // pad zip with zeroes if needed
                        var zip = data[i]["post_code"];
                        if (zip && zip.length < 5) {
                            zip = brain.pad(data[i]["post_code"], 5);
                        }
                        var voi = data[i]["voi"];
                        if (voi && voi.length < 3) {
                            voi = brain.pad(data[i]["voi"], 3);
                        }

                        var phone = data[i]["phone_number"];
                            phone = phone.replace(/\D/g,''); // remove all but numbers
                        if (phone.charAt(0) == "1") {
                            phone = phone.substr(1);
                        }
                        phone = phone.substring(0,10);
                        if (phone.length < 10) {
                            phone = '';
                        }

                        for(var j=0;j<data1.length;j++){
                            var database_csv=count_element(data1[j]);
                            if(data[i]["email"]==data1[j]["email"]){
                                if(csv_count>database_csv){
                                    $.ajax({
                                        type: "POST",
                                        url: "matchEmail.php",
                                        data: {
                                            "function":"update",
                                            "email": data[i]["email"],
                                            "First_Name": data[i]["first_name"],
                                            "Last_Name": data[i]["last_name"],
                                            "Zipcode": zip,
                                            "City": data[i]["city"],
                                            "State": data[i]["state"],
                                            "Address_1": data[i]["street_address"],
                                            "Address_2": data[i]["street_address2"],
                                            "Phone": phone,
                                            "Opt-In": data[i]["Opt-In"],
                                            "In_Market_Intent": data[i]["in-market_intent"],
                                            "Purchase_Type": data[i]["purchase_type"],
                                            "Vehicle_Interest": voi,
                                            "FDAF": data[i]["FDAF"],
                                            "DMA": data[i]["DMA"],
                                            "MEMBER_RATING": data[i]["MEMBER_RATING"],
                                            "OPTIN_TIME": data[i]["OPTIN_TIME"],
                                            "OPTIN_IP": data[i]["OPTIN_IP"],
                                            "CONFIRM_TIME": data[i]["CONFIRM_TIME"],
                                            "CONFIRM_IP": data[i]["CONFIRM_IP"],
                                            "LATITUDE": data[i]["LATITUDE"],
                                            "LONGITUDE": data[i]["LONGITUDE"],
                                            "GMTOFF": data[i]["GMTOFF"],
                                            "DSTOFF": data[i]["DSTOFF"],
                                            "TIMEZONE": data[i]["TIMEZONE"],
                                            "CC": data[i]["CC"],
                                            "REGION": data[i]["REGION"],
                                            "LAST_CHANGED": data[i]["LAST_CHANGED"],
                                            "LEID": data[i]["LEID"],
                                            "EUID": data[i]["EUID"],
                                            "NOTES": data[i]["NOTES"],
                                        },
                                        dataType: "text",
                                        success: function (data) {
                                        }
                                        ,
                                        error: function (data) {
                                        }
                                    });
                                }
                                else{

                                }
                                data.splice(i, 1);
                                duplicate_count++;
                                i--;
                                check=false;
                                break;
                            }
                        }
                        if(check){
                            record_count++;
                            $.ajax({
                                type: "POST",
                                url: "matchEmail.php",
                                async: true,
                                data: {
                                    "function":"add",
                                    "email": data[i]["email"],
                                    "First_Name": data[i]["first_name"],
                                    "Last_Name": data[i]["last_name"],
                                    "Zipcode": zip,
                                    "City": data[i]["city"],
                                    "State": data[i]["state"],
                                    "Address_1": data[i]["street_address"],
                                    "Address_2": data[i]["street_address2"],
                                    "Phone": phone,
                                    "Opt-In": data[i]["Opt-In"],
                                    "In_Market_Intent": data[i]["in-market_intent"],
                                    "Purchase_Type": data[i]["purchase_type"],
                                    "Vehicle_Interest": voi,
                                    "FDAF": data[i]["FDAF"],
                                    "DMA": data[i]["DMA"],
                                    "MEMBER_RATING": data[i]["MEMBER_RATING"],
                                    "OPTIN_TIME": data[i]["OPTIN_TIME"],
                                    "OPTIN_IP": data[i]["OPTIN_IP"],
                                    "CONFIRM_TIME": data[i]["CONFIRM_TIME"],
                                    "CONFIRM_IP": data[i]["CONFIRM_IP"],
                                    "LATITUDE": data[i]["LATITUDE"],
                                    "LONGITUDE": data[i]["LONGITUDE"],
                                    "GMTOFF": data[i]["GMTOFF"],
                                    "DSTOFF": data[i]["DSTOFF"],
                                    "TIMEZONE": data[i]["TIMEZONE"],
                                    "CC": data[i]["CC"],
                                    "REGION": data[i]["REGION"],
                                    "LAST_CHANGED": data[i]["LAST_CHANGED"],
                                    "LEID": data[i]["LEID"],
                                    "EUID": data[i]["EUID"],
                                    "NOTES": data[i]["NOTES"],
                                },
                                dataType: "text",
                                success: function (data1) {
                                }
                                ,
                                error: function (data1) {
                                }
                            });
                        }
                    }
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
                    var q2 = 'in-market_intent';
                    var a2 = '';
                    var q3 = 'purchase_type';
                    var a3 = '';

                    $.each(data, function(i, item) {
                        if (brain.config.processedEmails.indexOf(data[i]["email"]) == -1) {
                            brain.config.processedEmails.push(data[i]["email"]); // add to array of emails in files being processed to check for dupes

                            recordData = recordData+divisionCode+businessFlag+filler1;

                            // Name
                            var firstName = brain.scrubName(data[i].first_name);
                            recordData = recordData+firstName+brain.createFiller(30-firstName.length)+' ';
                            var lastName = brain.scrubName(data[i].last_name)
                            recordData = recordData+lastName+brain.createFiller((35-lastName.length)+5); // still adding 5 spaces for suffix which isn't present yet

                            // Street Address
                            if (data[i].street_address != undefined) {
                                var streetAddress1 = data[i].street_address;
                                recordData = recordData+streetAddress1.substr(0,40)+brain.createFiller((40-streetAddress1.length+40)); // still adding 40 spaces for street address 2 which isn't present yet
                                // var streetAddress2 = data[i].street_address2;
                                // recordData = recordData+streetAddress2.substr(0,40)+brain.createFiller((40-streetAddress2));
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
                                if (state.length > 2) {
                                    state = brain.abbrState(state, 'abbr'); // update to state abbreviation
                                }
                                recordData = recordData+state+brain.createFiller((2-state.length));
                            } else {
                                recordData = recordData + brain.createFiller(2);
                            }

                            // Zip Code
                            var zipcode = data[i]["post_code"];
                            if (zipcode && zipcode.length < 5) {
                                zipcode = brain.pad(data[i]["post_code"], 5);
                            }

                            recordData = recordData+countryCode+zipcode+'     '; // Zip plus spaces
                            var phone = data[i]["phone_number"];
                                phone = phone.replace(/\D/g,''); // remove all but numbers
                            if (phone.charAt(0) == "1") {
                                phone = phone.substr(1);
                            }
                            phone = phone.substring(0,10);
                            if (phone.length < 10) {
                                phone = '';
                            }
                            recordData = recordData+phone+phoneWork;
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
                            recordData = recordData+date; // Request Date
                            recordData = recordData+brain.createFiller(17)+brain.createFiller(6); // Vehicle VIN and Preferred Dealer

                            if (data[i].voi != undefined && voi.length > 1) {
                                if (data[i].voi == '2' || data[i].voi == '002') { // 2017 Mustang
                                    recordData = recordData+'002'+brain.createFiller(12); // Fulfillment Code
                                    recordData = recordData+'2017'; // Fulfillment Year
                                } else if (data[i].voi == '6' || data[i].voi == '006') { // 2017 Explorer
                                    recordData = recordData+'006'+brain.createFiller(12); // Fulfillment Code
                                    recordData = recordData+'2017'; // Fulfillment Year
                                } else if (data[i].voi == '7' || data[i].voi == '007') { // 2017 Expedition
                                    recordData = recordData+'007'+brain.createFiller(12); // Fulfillment Code
                                    recordData = recordData+'2017'; // Fulfillment Year
                                } else if (data[i].voi == '8' || data[i].voi == '008') { // 2018 F-150
                                    recordData = recordData+'008'+brain.createFiller(12); // Fulfillment Code
                                    recordData = recordData+'2018'; // Fulfillment Year
                                } else if (data[i].voi == '12' || data[i].voi == '012') { // 2017 Super Duty F-250
                                    recordData = recordData+'012'+brain.createFiller(12); // Fulfillment Code
                                    recordData = recordData+'2017'; // Fulfillment Year
                                } else if (data[i].voi == '48' || data[i].voi == '048') { // 2017 Focus
                                    recordData = recordData+'048'+brain.createFiller(12); // Fulfillment Code
                                    recordData = recordData+'2017'; // Fulfillment Year
                                } else if (data[i].voi == '53' || data[i].voi == '053') { // 2018 Escape
                                    recordData = recordData+'053'+brain.createFiller(12); // Fulfillment Code
                                    recordData = recordData+'2018'; // Fulfillment Year
                                } else if (data[i].voi == '100' || data[i].voi == '100') { // 2018 Edge
                                    recordData = recordData+'100'+brain.createFiller(12); // Fulfillment Code
                                    recordData = recordData+'2018'; // Fulfillment Year
                                } else if (data[i].voi == '211' || data[i].voi == '211') { // 2018 Fusion
                                    recordData = recordData+'211'+brain.createFiller(12); // Fulfillment Code
                                    recordData = recordData+'2018'; // Fulfillment Year
                                }

                                recordData = recordData+'P'; // Fulfillment Channel
                                recordData = recordData+'EN'; // Fulfillment Language
                            } else {
                                recordData = recordData+brain.createFiller(22);
                            }

                            recordData = recordData+qa1;
                            recordData = recordData+brain.createFiller(19); // trailing space for Q1

                            // Intent Question
                            if (data[i][q2] != undefined) {
                                var qa2 = '1077';

                                if (data[i][q2].length > 0)             {a2 = data[i][q2]}
                                else {qa2='    ';a2=' ';}
                                recordData = recordData+qa2+a2+brain.createFiller(19);
                            } else {
                                recordData = recordData+brain.createFiller(24); // space if question is blank
                            }

                            // Purchase Type
                            if (data[i][q3] != undefined) {
                                var qa3 = '0003';

                                if (data[i][q3].length > 0)             {a3 = data[i][q3]}
                                else {qa3='    ';a3=' ';}
                                recordData = recordData+qa3+a3+brain.createFiller(19);
                            } else {
                                recordData = recordData+brain.createFiller(24); // space if question is blank
                            }
                            
                            recordData = recordData+brain.createFiller(648); // Space for Question/Answer Array
                            recordData = recordData+'\n'; // end of record

                            brain.config.recordCount = brain.config.recordCount + 1;
                        } else {
                            duplicate_count++;
                        }
                    });

                    console.log(brain.config.recordCount+' records created')

                    brain.config.recordData = brain.config.recordData + recordData;

                    brain.config.filesToProcess = brain.config.filesToProcess - 1;

                    if (brain.config.filesToProcess <= 0) {
                        brain.showResult(name, 'FB');
                    }
                }
                ,
                error: function (data1) {
                }
            });
        },3000);
    },
    parseDataMailchimp: function(data,name) {
        window.setTimeout(function () {
            var result = data.reduce(function(memo, e1){
                var matches = memo.filter(function(e2){
                    return e1["Email Address"] == e2["Email Address"]
                })
                if (matches.length == 0)
                    memo.push(e1)
                return memo;
            }, []);
            var duplicate=data.length-result.length;
            duplicate_count=duplicate_count+duplicate;
            data=result;
            $.ajax({
                type: "POST",
                url: "matchEmail.php",
                async: false,
                data: {
                    "function":"getEmails"
                },
                dataType: "json",
                success: function (data1) {
                    var check=true;
                    for(var i = 0; i < data.length; i++) {
                        var csv_count=count_element(data[i]);
                        check=true;

                        // pad zip with zeroes if needed
                        var zip = data[i]["Zipcode"];
                        if (zip && zip.length < 5) {
                            zip = brain.pad(data[i]["Zipcode"], 5);
                        }
                        var voi = data[i]["Which model vehicle are you most interested in?"];
                        if (voi && voi.length < 3) {
                            voi = brain.pad(voi, 3);
                        }

                        var phoneHome = data[i]['Phone'];
                            phoneHome = phoneHome.replace(/\D/g,''); // remove all but numbers
                        if (phoneHome.length < 10) {
                            phoneHome = '';
                        }

                        for(var j=0;j<data1.length;j++){
                            var database_csv=count_element(data1[j]);
                            if(data[i]["Email Address"]==data1[j]["email"]){
                                if(csv_count>database_csv){
                                    $.ajax({
                                        type: "POST",
                                        url: "matchEmail.php",
                                        data: {
                                            "function":"update",
                                            "email": data[i]["Email Address"],
                                            "First_Name": data[i]["First Name"],
                                            "Last_Name": data[i]["Last Name"],
                                            "Zipcode": zip,
                                            "City": data[i]["City"],
                                            "State": data[i]["State"],
                                            "Address_1": data[i]["Address 1"],
                                            "Address_2": data[i]["Address 2"],
                                            "Phone": phoneHome,
                                            "Opt-In": data[i]["Opt In"],
                                            "In_Market_Intent": data[i]["How soon are you looking to buy?"],
                                            "Purchase_Type": data[i]["How do you plan to acquire your next vehicle?"],
                                            "Vehicle_Interest": voi,
                                            "FDAF": data[i]["FDAF"],
                                            "DMA": data[i]["DMA"],
                                            "MEMBER_RATING": data[i]["MEMBER_RATING"],
                                            "OPTIN_TIME": data[i]["OPTIN_TIME"],
                                            "OPTIN_IP": data[i]["OPTIN_IP"],
                                            "CONFIRM_TIME": data[i]["CONFIRM_TIME"],
                                            "CONFIRM_IP": data[i]["CONFIRM_IP"],
                                            "LATITUDE": data[i]["LATITUDE"],
                                            "LONGITUDE": data[i]["LONGITUDE"],
                                            "GMTOFF": data[i]["GMTOFF"],
                                            "DSTOFF": data[i]["DSTOFF"],
                                            "TIMEZONE": data[i]["TIMEZONE"],
                                            "CC": data[i]["CC"],
                                            "REGION": data[i]["REGION"],
                                            "LAST_CHANGED": data[i]["LAST_CHANGED"],
                                            "LEID": data[i]["LEID"],
                                            "EUID": data[i]["EUID"],
                                            "NOTES": data[i]["NOTES"],
                                        },
                                        dataType: "text",
                                        success: function (data) {
                                        }
                                        ,
                                        error: function (data) {
                                        }
                                    });
                                }
                                else{
                                }
                                data.splice(i, 1);
                                duplicate_count++;
                                i--;
                                check=false;
                                break;
                            }
                        }
                        if(check){
                            record_count++;
                            $.ajax({
                                type: "POST",
                                url: "matchEmail.php",
                                async: true,
                                data: {
                                    "function":"add",
                                    "email": data[i]["Email Address"],
                                    "First_Name": data[i]["First Name"],
                                    "Last_Name": data[i]["Last Name"],
                                    "Zipcode": zip,
                                    "City": data[i]["City"],
                                    "State": data[i]["State"],
                                    "Address_1": data[i]["Address 1"],
                                    "Address_2": data[i]["Address 2"],
                                    "Phone": phoneHome,
                                    "Opt-In": data[i]["Opt In"],
                                    "In_Market_Intent": data[i]["How soon are you looking to buy?"],
                                    "Purchase_Type": data[i]["How do you plan to acquire your next vehicle?"],
                                    "Vehicle_Interest": voi,
                                    "FDAF": data[i]["FDAF"],
                                    "DMA": data[i]["DMA"],
                                    "MEMBER_RATING": data[i]["MEMBER_RATING"],
                                    "OPTIN_TIME": data[i]["OPTIN_TIME"],
                                    "OPTIN_IP": data[i]["OPTIN_IP"],
                                    "CONFIRM_TIME": data[i]["CONFIRM_TIME"],
                                    "CONFIRM_IP": data[i]["CONFIRM_IP"],
                                    "LATITUDE": data[i]["LATITUDE"],
                                    "LONGITUDE": data[i]["LONGITUDE"],
                                    "GMTOFF": data[i]["GMTOFF"],
                                    "DSTOFF": data[i]["DSTOFF"],
                                    "TIMEZONE": data[i]["TIMEZONE"],
                                    "CC": data[i]["CC"],
                                    "REGION": data[i]["REGION"],
                                    "LAST_CHANGED": data[i]["LAST_CHANGED"],
                                    "LEID": data[i]["LEID"],
                                    "EUID": data[i]["EUID"],
                                    "NOTES": data[i]["NOTES"],
                                },
                                dataType: "text",
                                success: function (data1) {
                                }
                                ,
                                error: function (data1) {
                                }
                            });
                        }
                    }
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
                    var q2 = 'How soon are you looking to buy?';
                    var a2 = '';
                    var q3 = 'How do you plan to acquire your next vehicle?';
                    var a3 = '';

                    $.each(data, function(i, item) {
                        if (brain.config.processedEmails.indexOf(data[i]["Email Address"]) == -1) {
                            brain.config.processedEmails.push(data[i]["Email Address"]); // add to array of emails in files being processed to check for dupes

                            recordData = recordData+divisionCode+businessFlag+filler1;
                            var firstName = brain.scrubName(data[i]['First Name']);
                            recordData = recordData+firstName+brain.createFiller(30-firstName.length)+' ';
                            var lastName = brain.scrubName(data[i]['Last Name']);
                            recordData = recordData+lastName+brain.createFiller((35-lastName.length)+5); // still adding 5 spaces for suffix which isn't present yet

                            // Street Address 1
                            var streetAddress1 = data[i]['Address 1'];
                            if (streetAddress1 != undefined) {
                                recordData = recordData+streetAddress1.substr(0,40)+brain.createFiller((40-streetAddress1.length));
                            } else {
                                recordData = recordData + brain.createFiller(40);
                            }

                            // Street Address 2
                            var streetAddress2 = data[i]['Address 2'];
                            if (streetAddress2 != undefined) {
                                recordData = recordData+streetAddress2.substr(0,40)+brain.createFiller((40-streetAddress2.length));
                            } else {
                                recordData = recordData + brain.createFiller(40);
                            }

                            // City
                            var city = data[i]['City'];
                            if (city != undefined) {
                                recordData = recordData+city+brain.createFiller((40-city.length));
                            } else {
                                recordData = recordData + brain.createFiller(40);
                            }

                            // State
                            var state = data[i]['State'];
                            if (state != undefined) {
                                if (state.length > 2) {
                                    state = brain.abbrState(state, 'abbr'); // update to state abbreviation
                                }
                                recordData = recordData+state+brain.createFiller((2-state.length));
                            } else {
                                recordData = recordData + brain.createFiller(2);
                            }

                            // Zip Code
                            var zipcode = data[i]["Zipcode"];
                            if (zipcode && zipcode.length < 5) {
                                zipcode = brain.pad(zipcode, 5);
                            }

                            recordData = recordData+countryCode+zipcode+'     '; // Zip plus spaces

                            // Phone
                            var phoneHome = data[i]['Phone'];
                                phoneHome = phoneHome.replace(/\D/g,''); // remove all but numbers
                            if (phoneHome.length < 10) {
                                phoneHome = '';
                            }
                            recordData = recordData+phoneHome+phoneWork+brain.createFiller(10-phoneHome.length);

                            // Email
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

                            recordData = recordData+date;  // Request Date
                            
                            recordData = recordData+brain.createFiller(17)+brain.createFiller(6); // Vehicle VIN and Preferred Dealer

                            var voi = data[i]["Which model vehicle are you most interested in?"];
                            if (voi != undefined && voi.length > 1) {
                                if (voi == '2' || voi == '002') { // 2017 Mustang
                                    recordData = recordData+'002'+brain.createFiller(12); // Fulfillment Code
                                    recordData = recordData+'2017'; // Fulfillment Year
                                } else if (voi == '6' || voi == '006') { // 2017 Explorer
                                    recordData = recordData+'006'+brain.createFiller(12); // Fulfillment Code
                                    recordData = recordData+'2017'; // Fulfillment Year
                                } else if (voi == '7' || voi == '007') { // 2017 Expedition
                                    recordData = recordData+'007'+brain.createFiller(12); // Fulfillment Code
                                    recordData = recordData+'2017'; // Fulfillment Year
                                } else if (voi == '8' || voi == '008') { // 2018 F-150
                                    recordData = recordData+'008'+brain.createFiller(12); // Fulfillment Code
                                    recordData = recordData+'2018'; // Fulfillment Year
                                } else if (voi == '12' || voi == '012') { // 2017 Super Duty F-250
                                    recordData = recordData+'012'+brain.createFiller(12); // Fulfillment Code
                                    recordData = recordData+'2017'; // Fulfillment Year
                                } else if (voi == '48' || voi == '048') { // 2017 Focus
                                    recordData = recordData+'048'+brain.createFiller(12); // Fulfillment Code
                                    recordData = recordData+'2017'; // Fulfillment Year
                                } else if (voi == '53' || voi == '053') { // 2018 Escape
                                    recordData = recordData+'053'+brain.createFiller(12); // Fulfillment Code
                                    recordData = recordData+'2018'; // Fulfillment Year
                                } else if (voi == '100' || voi == '100') { // 2018 Edge
                                    recordData = recordData+'100'+brain.createFiller(12); // Fulfillment Code
                                    recordData = recordData+'2018'; // Fulfillment Year
                                } else if (voi == '211' || voi == '211') { // 2018 Fusion
                                    recordData = recordData+'211'+brain.createFiller(12); // Fulfillment Code
                                    recordData = recordData+'2018'; // Fulfillment Year
                                }

                                recordData = recordData+'P'; // Fulfillment Channel
                                recordData = recordData+'EN'; // Fulfillment Language
                            } else {
                                recordData = recordData+brain.createFiller(22);
                            }

                            recordData = recordData+qa1;
                            recordData = recordData+brain.createFiller(19); // trailing space for Q1

                            // Intent Question
                            if (data[i][q2] != undefined) {
                                var qa2 = '1077';

                                if (data[i][q2].length > 0)             {a2 = data[i][q2]}
                                else {qa2='    ';a2=' ';}
                                recordData = recordData+qa2+a2+brain.createFiller(19);
                            } else {
                                recordData = recordData+brain.createFiller(24); // space if question is blank
                            }

                            // Purchase Type
                            if (data[i][q3] != undefined) {
                                var qa3 = '0003';

                                if (data[i][q3].length > 0)             {a3 = data[i][q3]}
                                else {qa3='    ';a3=' ';}
                                recordData = recordData+qa3+a3+brain.createFiller(19);
                            } else {
                                recordData = recordData+brain.createFiller(24); // space if question is blank
                            }
                            
                            recordData = recordData+brain.createFiller(648); // Space for Question/Answer Array

                            recordData = recordData+'\n'; // end of record

                            brain.config.recordCount = brain.config.recordCount + 1;
                        } else {
                            duplicate_count++;
                        }
                    });

                    console.log(brain.config.recordCount+' records created')

                    brain.config.recordData = brain.config.recordData + recordData;

                    brain.config.filesToProcess = brain.config.filesToProcess - 1;
                    if (brain.config.filesToProcess <= 0) {
                        brain.showResult(name, 'MC');
                    }
                }
                ,
                error: function (data1) {
                }
            });
        },3000);
    },
    // This function is not currently being used
    // The function will parse Mailchimp CSVs and split them up by FDAF
    parseDataMailchimpFull: function(data,name) {
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
        var q2 = 'How soon are you looking to buy?';
        var a2 = '';

        $.each(keys, function(k, item) {
            $.each(byFDAF[item], function(i, data) {
                recordData = recordData+divisionCode+businessFlag+filler1;
                var firstName = brain.scrubName(data['First Name']);
                recordData = recordData+firstName+brain.createFiller(30-firstName.length)+' ';
                var lastName = brain.scrubName(data['Last Name']);
                recordData = recordData+lastName+brain.createFiller((35-lastName.length)+5); // still adding 5 spaces for suffix which isn't present yet

                // Street Address 1
                var streetAddress1 = data['Address 1'];
                if (streetAddress1 != undefined) {
                    recordData = recordData+streetAddress1.substr(0,40)+brain.createFiller((40-streetAddress1.length));
                } else {
                    recordData = recordData + brain.createFiller(40);
                }

                // Street Address 2
                var streetAddress2 = data['Address 2'];
                if (streetAddress2 != undefined) {
                    recordData = recordData+streetAddress2.substr(0,40)+brain.createFiller((40-streetAddress2.length));
                } else {
                    recordData = recordData + brain.createFiller(40);
                }

                // City
                var city = data['City'];
                if (city != undefined) {
                    if (state.length > 2) {
                        state = brain.abbrState(state, 'abbr'); // update to state abbreviation
                    }
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
            // Reset local recordData
            recordData = '';

            if (item == '') {item = "Other"}
            brain.showResult(name, item);
        });
    },
    parseDataMAX: function(data,name) {
        window.setTimeout(function () {
            var result = data.reduce(function(memo, e1){
                var matches = memo.filter(function(e2){
                    return e1.email == e2.email
                })
                if (matches.length == 0)
                    memo.push(e1)
                return memo;
            }, []);
            var duplicate=data.length-result.length;
            duplicate_count=duplicate_count+duplicate;
            data=result;
            $.ajax({
                type: "POST",
                url: "matchEmail.php",
                async: false,
                data: {
                    "function":"getEmails"
                },
                dataType: "json",
                success: function (data1) {
                    var check=true;
                    for(var i = 0; i < data.length; i++) {
                        var csv_count=count_element(data[i]);
                        check=true;
                        for(var j=0;j<data1.length;j++){
                            var database_csv=count_element(data1[j]);
                            if(data[i]["email"]==data1[j]["email"]){
                                if(csv_count>database_csv){
                                    $.ajax({
                                        type: "POST",
                                        url: "matchEmail.php",
                                        data: {
                                            "function":"update",
                                            "email": data[i]["email"],
                                            "First_Name": data[i]["first_name"],
                                            "Last_Name": data[i]["last_name"],
                                            "Zipcode": data[i]["zip_code"],
                                            "City": data[i]["city"],
                                            "State": data[i]["state"],
                                            "Address_1": data[i]["Address 1"],
                                            "Address_2": data[i]["Address 2"],
                                            "Phone": data[i]["phone_number"],
                                            "Opt-In": data[i]["Opt-In"],
                                            "In_Market_Intent": data[i]["In Market Intent (1077)"],
                                            "FDAF": data[i]["FDAF"],
                                            "DMA": data[i]["DMA"],
                                            "MEMBER_RATING": data[i]["MEMBER_RATING"],
                                            "OPTIN_TIME": data[i]["OPTIN_TIME"],
                                            "OPTIN_IP": data[i]["OPTIN_IP"],
                                            "CONFIRM_TIME": data[i]["CONFIRM_TIME"],
                                            "CONFIRM_IP": data[i]["CONFIRM_IP"],
                                            "LATITUDE": data[i]["LATITUDE"],
                                            "LONGITUDE": data[i]["LONGITUDE"],
                                            "GMTOFF": data[i]["GMTOFF"],
                                            "DSTOFF": data[i]["DSTOFF"],
                                            "TIMEZONE": data[i]["TIMEZONE"],
                                            "CC": data[i]["CC"],
                                            "REGION": data[i]["REGION"],
                                            "LAST_CHANGED": data[i]["LAST_CHANGED"],
                                            "LEID": data[i]["LEID"],
                                            "EUID": data[i]["EUID"],
                                            "NOTES": data[i]["NOTES"],
                                        },
                                        dataType: "text",
                                        success: function (data) {
                                        }
                                        ,
                                        error: function (data) {
                                        }
                                    });
                                }
                                else{
                                }
                                data.splice(i, 1);
                                duplicate_count++;
                                i--;
                                check=false;
                                break;
                            }
                        }
                        if(check){
                            record_count++;
                            $.ajax({
                                type: "POST",
                                url: "matchEmail.php",
                                async: true,
                                data: {
                                    "function":"add",
                                    "email": data[i]["email"],
                                    "First_Name": data[i]["first_name"],
                                    "Last_Name": data[i]["last_name"],
                                    "Zipcode": data[i]["zip_code"],
                                    "City": data[i]["city"],
                                    "State": data[i]["state"],
                                    "Address_1": data[i]["Address 1"],
                                    "Address_2": data[i]["Address 2"],
                                    "Phone": data[i]["phone_number"],
                                    "Opt-In": data[i]["Opt-In"],
                                    "In_Market_Intent": data[i]["In Market Intent (1077)"],
                                    "FDAF": data[i]["FDAF"],
                                    "DMA": data[i]["DMA"],
                                    "MEMBER_RATING": data[i]["MEMBER_RATING"],
                                    "OPTIN_TIME": data[i]["OPTIN_TIME"],
                                    "OPTIN_IP": data[i]["OPTIN_IP"],
                                    "CONFIRM_TIME": data[i]["CONFIRM_TIME"],
                                    "CONFIRM_IP": data[i]["CONFIRM_IP"],
                                    "LATITUDE": data[i]["LATITUDE"],
                                    "LONGITUDE": data[i]["LONGITUDE"],
                                    "GMTOFF": data[i]["GMTOFF"],
                                    "DSTOFF": data[i]["DSTOFF"],
                                    "TIMEZONE": data[i]["TIMEZONE"],
                                    "CC": data[i]["CC"],
                                    "REGION": data[i]["REGION"],
                                    "LAST_CHANGED": data[i]["LAST_CHANGED"],
                                    "LEID": data[i]["LEID"],
                                    "EUID": data[i]["EUID"],
                                    "NOTES": data[i]["NOTES"],
                                },
                                dataType: "text",
                                success: function (data1) {
                                }
                                ,
                                error: function (data1) {
                                }
                            });
                        }
                    }
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
                        if (brain.config.processedEmails.indexOf(data[i]["email"]) == -1) {
                            brain.config.processedEmails.push(data[i]["email"]); // add to array of emails in files being processed to check for dupes
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
                        } else {
                            duplicate_count++;
                        }
                    });

                    console.log(brain.config.recordCount+' records created')

                    brain.config.recordData = brain.config.recordData + recordData;

                    brain.config.filesToProcess = brain.config.filesToProcess - 1;
                    if (brain.config.filesToProcess <= 0) {
                        brain.showResult(name, 'MAX');
                    }
                }
                ,
                error: function (data1) {
                }
            });
        },3000);
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
    pad: function(a,b){
        return(1e15+a+"").slice(-b); // pads numbers with leading zeroes
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
        $('#result').append('<p><a href="'+brain.makeTextFile(brain.config.textData)+'" download="'+filename+'" class="">Download '+filename+'</a> - '+record_count+' records and '+duplicate_count+" Duplicate records were removed.</p>").show();

        brain.config.$processBtn.removeClass('processing').html('Parse');

        brain.config.recordData = ''; // clear data
        brain.config.textData = ''; // clear data
        brain.config.recordCount = 0;  // clear data
        duplicate_count=0;
        record_count=0;
        brain.config.processedEmails = [];
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
    abbrState: function(input, to){
        var states = [
            ['Arizona', 'AZ'],
            ['Alabama', 'AL'],
            ['Alaska', 'AK'],
            ['Arizona', 'AZ'],
            ['Arkansas', 'AR'],
            ['California', 'CA'],
            ['Colorado', 'CO'],
            ['Connecticut', 'CT'],
            ['Delaware', 'DE'],
            ['Florida', 'FL'],
            ['Georgia', 'GA'],
            ['Hawaii', 'HI'],
            ['Idaho', 'ID'],
            ['Illinois', 'IL'],
            ['Indiana', 'IN'],
            ['Iowa', 'IA'],
            ['Kansas', 'KS'],
            ['Kentucky', 'KY'],
            ['Kentucky', 'KY'],
            ['Louisiana', 'LA'],
            ['Maine', 'ME'],
            ['Maryland', 'MD'],
            ['Massachusetts', 'MA'],
            ['Michigan', 'MI'],
            ['Minnesota', 'MN'],
            ['Mississippi', 'MS'],
            ['Missouri', 'MO'],
            ['Montana', 'MT'],
            ['Nebraska', 'NE'],
            ['Nevada', 'NV'],
            ['New Hampshire', 'NH'],
            ['New Jersey', 'NJ'],
            ['New Mexico', 'NM'],
            ['New York', 'NY'],
            ['North Carolina', 'NC'],
            ['North Dakota', 'ND'],
            ['Ohio', 'OH'],
            ['Oklahoma', 'OK'],
            ['Oregon', 'OR'],
            ['Pennsylvania', 'PA'],
            ['Rhode Island', 'RI'],
            ['South Carolina', 'SC'],
            ['South Dakota', 'SD'],
            ['Tennessee', 'TN'],
            ['Texas', 'TX'],
            ['Utah', 'UT'],
            ['Vermont', 'VT'],
            ['Virginia', 'VA'],
            ['Washington', 'WA'],
            ['West Virginia', 'WV'],
            ['Wisconsin', 'WI'],
            ['Wyoming', 'WY'],
        ];

        if (to == 'abbr'){
            input = input.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
            for(i = 0; i < states.length; i++){
                if(states[i][0] == input){
                    return(states[i][1]);
                }
            }
        } else if (to == 'name'){
            input = input.toUpperCase();
            for(i = 0; i < states.length; i++){
                if(states[i][1] == input){
                    return(states[i][0]);
                }
            }
        }
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
        //     if ( timdata[i] < 10 ) {
        //         timdata[i] = "0" + timdata[i];
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