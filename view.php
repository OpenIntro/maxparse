<?php

// $conn= mysqli_connect("localhost", "maxparseFFSadmin", "W+.xHael*cBc", "maxparseFFS");
$conn= mysqli_connect("mysql.etrbe.com", "maxparseffsadmin", "W+.xHael*cBc", "maxparseffs");

$query="SELECT * FROM parse";

$result=mysqli_query($conn, $query) or die(mysqli_error($conn));
?>
<!--
  __  __          __   __  _____                    
 |  \/  |   /\    \ \ / / |  __ \                   
 | \  / |  /  \    \ V /  | |__) |_ _ _ __ ___  ___ 
 | |\/| | / /\ \    > <   |  ___/ _` | '__/ __|/ _ \
 | |  | |/ ____ \  / . \  | |  | (_| | |  \__ \  __/
 |_|  |_/_/    \_\/_/ \_\ |_|   \__,_|_|  |___/\___|
                                                    
-->
<!doctype html>
<html prefix="og: http://ogp.me/ns#">
<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Parse</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">

    <link rel="stylesheet" href="assets/css/main.min.css">
    <link rel="stylesheet" href="https://cdn.datatables.net/1.10.15/css/jquery.dataTables.min.css">

    <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,700" rel="stylesheet">

</head>
<body>

<section class="page-header">
    <h1 class="project-name">MAX Parse</h1>
    <h2 class="project-tagline">View Data</h2>

    <a href="./" class="btn btn-download">Back to Parser</a>
</section>

<div class="container" style="margin: 20px auto;">
    <div class="row">
        <div class="col-md-12 table-responsive">
            <table id="parsetable" class="table table-bordered" style="overflow: scroll;overflow-x: scroll;">
                <thead>
                <tr>
                    <th>Delete</th>
                    <th>Record ID</th> 
                    <th>Campaign</th>
                    <th>Sequence</th>
                    <th>Lead Date</th>
                    <th>Email</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Address</th>
                    <th>City</th>
                    <th>State</th>
                    <th>Zipcode</th>
                    <th>Phone</th>
                    <th>DMA</th>
                    <th>FDAF</th>
                    <th>Optin</th>
                    <th>Intent</th>
                    <th>Vendor ID</th>
                    <th>Vendor Email</th>
                </tr>
                </thead>

                <tbody>



                <?php
                foreach ($result as $data)
                {

                    // print_r($data);
                    // echo "<br/>";
                    ?>
                    <tr>
                        <td style="text-align: center;"><button class="trash"><i class="fa fa-trash-o" aria-hidden="true"></i></button></td>
                        <td class='id'><?php echo $data['id'];?></td>
                        <td><?php echo $data['campaign_code'];?></td>
                        <td><?php echo $data['sequence_code'];?></td>
                        <td><?php echo $data['lead_date'];?></td>
                        <td><?php echo $data['email'];?></td>
                        <td><?php echo $data['f_name'];?></td>
                        <td><?php echo $data['l_name'];?></td>
                        <td><?php echo $data['street_address'];?></td>
                        <td><?php echo $data['city'];?></td>
                        <td><?php echo $data['state'];?></td>
                        <td><?php echo $data['zipcode'];?></td>
                        <td><?php echo $data['phone'];?></td>
                        <td><?php echo $data['dma'];?></td>
                        <td><?php echo $data['fadaf'];?></td>
                        <td><?php echo $data['optin'];?></td>
                        <td><?php echo $data['intent'];?></td>
                        <td><?php echo $data['vendor_id'];?></td>
                        <td><?php echo $data['vendor_email'];?></td>
                    </tr>

                    <?php

                }

                ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<script src="assets/js/all.min.js"></script>

<script src="https://cdn.datatables.net/1.10.15/js/jquery.dataTables.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/notify/0.4.2/notify.js"></script>
<script type="text/javascript">
    $(document).ready(function(){
        $('#parsetable').DataTable();
        $("#parsetable").on('click','.trash',function () {
            var index=$(".trash").index(this);
            var id=$(".id").eq(index).text();
            $.ajax({
                type: "POST",
                url: "deleteRecord.php",
                data: {"id":id},
                dataType: "text",
                success: function (data) {
                    $.notify(data, "success");
                    window.setTimeout(function(){location.reload()},2000)
                }
                ,
                error: function (data) {
                    $.notify(data, "error");
                }
            });
        });
    });
</script>
</body>
</html>
