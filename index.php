<!doctype html>
<!--
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
    </section>

    <section class="main-content">
      <div class="container">
        <h2>Upload your file</h2>

        <form action="upload.php" method="post" enctype="multipart/form-data" id="dropzone" class="dropzone">
          <div class="icon-upload"><i class="fa fa-cloud-upload" aria-hidden="true"></i></div>

          <input type="file" name="file" class="dz-hidden-input" />
        </form>
      </div>
    </section>

    <!-- Download button goes here -->
    <section class="result">
      <div class="container" id="result">
        
      </div>
    </section>

    <!-- Modal -->
    <div class="modal fade general-modal" tabindex="-1" role="dialog" aria-labelledby="generalModal" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          
        </div>
      </div>
    </div>

    <script src="assets/js/all.min.js"></script>
  </body>
</html>
