<!--
  __  __          __   __  _____                    
 |  \/  |   /\    \ \ / / |  __ \                   
 | \  / |  /  \    \ V /  | |__) |_ _ _ __ ___  ___ 
 | |\/| | / /\ \    > <   |  ___/ _` | '__/ __|/ _ \
 | |  | |/ ____ \  / . \  | |  | (_| | |  \__ \  __/
 |_|  |_/_/    \_\/_/ \_\ |_|   \__,_|_|  |___/\___|
                                                    
-->
<html prefix="og: http://ogp.me/ns#">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>MAX Parse</title>
    <meta name="description" content="<?php echo $page_seo ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
    
    <link rel="shortcut icon" href="favicon.png" type="image/x-icon" >
    <link rel="icon" href="favicon.png" type="image/x-icon" >
    
    <link rel="stylesheet" href="assets/css/main.min.css">

    <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,700" rel="stylesheet">
    <link rel="stylesheet" href="https://rawgit.com/enyo/dropzone/master/dist/dropzone.css">

  </head>
<body>

<section class="page-header">
    <h1 class="project-name">MAX Parse</h1>
    <h2 class="project-tagline">Parse customer CSV data</h2>

    <a href="view.php" class="btn btn-download">View Records</a>
</section>

<section class="main-content">
    <div class="container">
        <h2>Upload your file</h2>

        <form action="upload.php" method="post" enctype="multipart/form-data" id="parseform">

            <div class="dropzone" id="dropzone">
                <div class="icon-upload"><i class="fa fa-cloud-upload" aria-hidden="true"></i></div>

                <input type="file" name="file" class="dz-hidden-input" />
            </div>


            <div class="row">
                <div class="col-sm-4">
                    <div class="form-group">
                        <label for="campaignCode">Campaign Code</label>
                        <input type="text" id="campaignCode" name="campaignCode" class="form-control" data-parsley-required="true" value="" placeholder="Campaign Code (required)" maxlength="10">
                    </div>
                </div>

                <div class="col-sm-4">
                    <div class="form-group">
                        <label for="sequenceCode">Sequence Code</label>
                        <input type="text" id="sequenceCode" name="sequenceCode" class="form-control" value="" data-parsley-required="true" placeholder="Sequence Code (required)" maxlength="3">
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-sm-4">
                    <div class="form-group">
                        <label for="vendorEmail">Vendor Email</label>
                        <input type="email" id="vendorEmail" name="vendorEmail" class="form-control" value="sean@leadingresponse.com">
                    </div>
                </div>

                <div class="col-sm-4">
                    <div class="form-group">
                        <label for="vendorEmail">Vendor ID</label>
                        <input type="text" id="vendorID" name="vendorID" class="form-control" value="0000000353">
                    </div>
                </div>
            </div>

            <div class="checkbox">
                <label>
                    <input type="checkbox" id="combine" name="combine" checked="checked"> Combine records into one text file
                </label>
            </div>
        </form>
    </div>
    
    <div class="container">
        <div class="btn btn-download btn-process" id="btn-process">Parse</div>
    </div>

    <br>
</section>

<!-- Download button goes here -->
<section class="result">
    <div class="container" id="result">
        <h2>Results</h2>
    </div>
</section>

<!-- Modal -->
<div class="modal fade general-modal" tabindex="-1" role="dialog" aria-labelledby="generalModal" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">

        </div>
    </div>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js"></script>
<script src="assets/js/all.min.js"></script>

<script>
    // brain is On
    brain.init();
</script>

</body>
</html>
