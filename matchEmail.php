<?php
session_start();
header('Content-Type: application/json');
// $conn= mysqli_connect("localhost", "maxparseFFSadmin", "W+.xHael*cBc", "maxparseFFS");
$conn= mysqli_connect("mysql.etrbe.com", "maxparseffsadmin", "W+.xHael*cBc", "maxparseffs");
$function="";
$results = array();
if (isset($_POST["function"])) {
    $function=$_POST["function"];
}
if($function=="getEmails"){
    $campaignCode=$_SESSION["campaignCode"];
    $sequenceCode=$_SESSION["sequenceCode"];
    $query="SELECT * FROM `parse` WHERE campaign_code='$campaignCode' AND sequence_code='$sequenceCode'";
    $result=mysqli_query($conn, $query) or die(mysqli_error($conn));
    foreach ($result as $data)
    {
        $results[]=$data;
    }
    echo json_encode($results);
}
if($function=="update"){
    $campaignCode=$_SESSION["campaignCode"];
    $sequenceCode=$_SESSION["sequenceCode"];
    $email = "";
    $First_Name = "";
    $Last_Name = "";
    $Zipcode = "";
    $City = "";
    $State = "";
    $Address_1 = "";
    $Address_2 = "";
    $Phone = "";
    $Opt_In = "";
    $In_Market_Intent = "";
    $FDAF = "";
    $DMA = "";
    $MEMBER_RATING = "";
    $OPTIN_TIME = "";
    $OPTIN_IP = "";
    $CONFIRM_TIME = "";
    $CONFIRM_IP = "";
    $LATITUDE = "";
    $LONGITUDE = "";
    $GMTOFF = "";
    $DSTOFF = "";
    $TIMEZONE = "";
    $CC = "";
    $REGION = "";
    $LAST_CHANGED = "";
    $EID = "";
    $EUID = "";
    $NOTES = "";
    if (isset($_POST["email"])) {
        $email = mysqli_real_escape_string($conn,$_POST["email"]);
    }
    if (isset($_POST["First_Name"])) {
        $First_Name = mysqli_real_escape_string($conn,$_POST["First_Name"]);
    }
    if (isset($_POST["Last_Name"])) {
        $Last_Name = mysqli_real_escape_string($conn,$_POST["Last_Name"]);
    }
    if (isset($_POST["Zipcode"])) {
        $Zipcode = mysqli_real_escape_string($conn,$_POST["Zipcode"]);
    }
    if (isset($_POST["City"])) {
        $City = mysqli_real_escape_string($conn,$_POST["City"]);
    }
    if (isset($_POST["State"])) {
        $State = mysqli_real_escape_string($conn,$_POST["State"]);
    }
    if (isset($_POST["Address_1"])) {
        $Address_1 = mysqli_real_escape_string($conn,$_POST["Address_1"]);
    }
    if (isset($_POST["Address_2"])) {
        $Address_2 = mysqli_real_escape_string($conn,$_POST["Address_2"]);
    }
    if (isset($_POST["Phone"])) {
        $Phone = mysqli_real_escape_string($conn,$_POST["Phone"]);
    }
    if (isset($_POST["Opt-In"])) {
        $Opt_In = mysqli_real_escape_string($conn,$_POST["Opt-In"]);
    }
    if (isset($_POST["In_Market_Intent"])) {
        $In_Market_Intent = mysqli_real_escape_string($conn,$_POST["In_Market_Intent"]);
    }
    if (isset($_POST["FDAF"])) {
        $FDAF = mysqli_real_escape_string($conn,$_POST["FDAF"]);
    }
    if (isset($_POST["DMA"])) {
        $DMA = mysqli_real_escape_string($conn,$_POST["DMA"]);
    }
    if (isset($_POST["MEMBER_RATING"])) {
        $MEMBER_RATING = mysqli_real_escape_string($conn,$_POST["MEMBER_RATING"]);
    }
    if (isset($_POST["OPTIN_TIME"])) {
        $OPTIN_TIME = mysqli_real_escape_string($conn,$_POST["OPTIN_TIME"]);
    }
    if (isset($_POST["OPTIN_IP"])) {
        $OPTIN_IP = mysqli_real_escape_string($conn,$_POST["OPTIN_IP"]);
    }
    if (isset($_POST["CONFIRM_TIME"])) {
        $CONFIRM_TIME = mysqli_real_escape_string($conn,$_POST["CONFIRM_TIME"]);
    }
    if (isset($_POST["CONFIRM_IP"])) {
        $CONFIRM_IP = mysqli_real_escape_string($conn,$_POST["CONFIRM_IP"]);
    }
    if (isset($_POST["LATITUDE"])) {
        $LATITUDE = mysqli_real_escape_string($conn,$_POST["LATITUDE"]);
    }
    if (isset($_POST["LONGITUDE"])) {
        $LONGITUDE = mysqli_real_escape_string($conn,$_POST["LONGITUDE"]);
    }
    if (isset($_POST["GMTOFF"])) {
        $GMTOFF = mysqli_real_escape_string($conn,$_POST["GMTOFF"]);
    }
    if (isset($_POST["DSTOFF"])) {
        $DSTOFF = mysqli_real_escape_string($conn,$_POST["DSTOFF"]);
    }
    if (isset($_POST["TIMEZONE"])) {
        $TIMEZONE = mysqli_real_escape_string($conn,$_POST["TIMEZONE"]);
    }
    if (isset($_POST["CC"])) {
        $CC = mysqli_real_escape_string($conn,$_POST["CC"]);
    }
    if (isset($_POST["REGION"])) {
        $REGION = mysqli_real_escape_string($conn,$_POST["REGION"]);
    }
    if (isset($_POST["LAST_CHANGED"])) {
        $LAST_CHANGED = mysqli_real_escape_string($conn,$_POST["LAST_CHANGED"]);
    }
    if (isset($_POST["LEID"])) {
        $EID = mysqli_real_escape_string($conn,$_POST["LEID"]);
    }
    if (isset($_POST["EUID"])) {
        $EUID = mysqli_real_escape_string($conn,$_POST["EUID"]);
    }
    if (isset($_POST["NOTES"])) {
        $NOTES = mysqli_real_escape_string($conn,$_POST["NOTES"]);
    }
    $query="UPDATE parse set `email`='$email',`f_name`='$First_Name',`l_name`='$Last_Name',`street_address`='$Address_1 $Address_2',`city`='$City',`state`='$State',`zipcode`='$Zipcode',`phone`='$Phone',`dma`='$DMA',`fadaf`='$FDAF',`optin`='$Opt_In',`intent`='$In_Market_Intent' WHERE email='$email' AND campaign_code='$campaignCode' AND sequence_code='$sequenceCode'";
    $result=mysqli_query($conn, $query) or die(mysqli_error($conn));
    echo json_encode($result);
}
else if($function=="add") {
    $campaignCode=$_SESSION["campaignCode"];
    $vendorEmail=$_SESSION["vendorEmail"];
    $vendorID=$_SESSION["vendorID"];
    $sequenceCode=$_SESSION["sequenceCode"];
    $email = "";
    $First_Name = "";
    $Last_Name = "";
    $Zipcode = "";
    $City = "";
    $State = "";
    $Address_1 = "";
    $Address_2 = "";
    $Phone = "";
    $Opt_In = "";
    $In_Market_Intent = "";
    $FDAF = "";
    $DMA = "";
    $MEMBER_RATING = "";
    $OPTIN_TIME = "";
    $OPTIN_IP = "";
    $CONFIRM_TIME = "";
    $CONFIRM_IP = "";
    $LATITUDE = "";
    $LONGITUDE = "";
    $GMTOFF = "";
    $DSTOFF = "";
    $TIMEZONE = "";
    $CC = "";
    $REGION = "";
    $LAST_CHANGED = "";
    $EID = "";
    $EUID = "";
    $NOTES = "";
    if (isset($_POST["email"])) {
        $email = mysqli_real_escape_string($conn,$_POST["email"]);
    }
    if (isset($_POST["First_Name"])) {
        $First_Name = mysqli_real_escape_string($conn,$_POST["First_Name"]);
    }
    if (isset($_POST["Last_Name"])) {
        $Last_Name = mysqli_real_escape_string($conn,$_POST["Last_Name"]);
    }
    if (isset($_POST["Zipcode"])) {
        $Zipcode = mysqli_real_escape_string($conn,$_POST["Zipcode"]);
    }
    if (isset($_POST["City"])) {
        $City = mysqli_real_escape_string($conn,$_POST["City"]);
    }
    if (isset($_POST["State"])) {
        $State = mysqli_real_escape_string($conn,$_POST["State"]);
    }
    if (isset($_POST["Address_1"])) {
        $Address_1 = mysqli_real_escape_string($conn,$_POST["Address_1"]);
    }
    if (isset($_POST["Address_2"])) {
        $Address_2 = mysqli_real_escape_string($conn,$_POST["Address_2"]);
    }
    if (isset($_POST["Phone"])) {
        $Phone = mysqli_real_escape_string($conn,$_POST["Phone"]);
    }
    if (isset($_POST["Opt-In"])) {
        $Opt_In = mysqli_real_escape_string($conn,$_POST["Opt-In"]);
    }
    if (isset($_POST["In_Market_Intent"])) {
        $In_Market_Intent = mysqli_real_escape_string($conn,$_POST["In_Market_Intent"]);
    }
    if (isset($_POST["FDAF"])) {
        $FDAF = mysqli_real_escape_string($conn,$_POST["FDAF"]);
    }
    if (isset($_POST["DMA"])) {
        $DMA = mysqli_real_escape_string($conn,$_POST["DMA"]);
    }
    if (isset($_POST["MEMBER_RATING"])) {
        $MEMBER_RATING = mysqli_real_escape_string($conn,$_POST["MEMBER_RATING"]);
    }
    if (isset($_POST["OPTIN_TIME"])) {
        $OPTIN_TIME = mysqli_real_escape_string($conn,$_POST["OPTIN_TIME"]);
    }
    if (isset($_POST["OPTIN_IP"])) {
        $OPTIN_IP = mysqli_real_escape_string($conn,$_POST["OPTIN_IP"]);
    }
    if (isset($_POST["CONFIRM_TIME"])) {
        $CONFIRM_TIME = mysqli_real_escape_string($conn,$_POST["CONFIRM_TIME"]);
    }
    if (isset($_POST["CONFIRM_IP"])) {
        $CONFIRM_IP = mysqli_real_escape_string($conn,$_POST["CONFIRM_IP"]);
    }
    if (isset($_POST["LATITUDE"])) {
        $LATITUDE = mysqli_real_escape_string($conn,$_POST["LATITUDE"]);
    }
    if (isset($_POST["LONGITUDE"])) {
        $LONGITUDE = mysqli_real_escape_string($conn,$_POST["LONGITUDE"]);
    }
    if (isset($_POST["GMTOFF"])) {
        $GMTOFF = mysqli_real_escape_string($conn,$_POST["GMTOFF"]);
    }
    if (isset($_POST["DSTOFF"])) {
        $DSTOFF = mysqli_real_escape_string($conn,$_POST["DSTOFF"]);
    }
    if (isset($_POST["TIMEZONE"])) {
        $TIMEZONE = mysqli_real_escape_string($conn,$_POST["TIMEZONE"]);
    }
    if (isset($_POST["CC"])) {
        $CC = mysqli_real_escape_string($conn,$_POST["CC"]);
    }
    if (isset($_POST["REGION"])) {
        $REGION = mysqli_real_escape_string($conn,$_POST["REGION"]);
    }
    if (isset($_POST["LAST_CHANGED"])) {
        $LAST_CHANGED = mysqli_real_escape_string($conn,$_POST["LAST_CHANGED"]);
    }
    if (isset($_POST["LEID"])) {
        $EID = mysqli_real_escape_string($conn,$_POST["LEID"]);
    }
    if (isset($_POST["EUID"])) {
        $EUID = mysqli_real_escape_string($conn,$_POST["EUID"]);
    }
    if (isset($_POST["NOTES"])) {
        $NOTES = mysqli_real_escape_string($conn,$_POST["NOTES"]);
    }

    $qu = "INSERT INTO `parse`(`vendor_email`, `campaign_code`, `vendor_id`, `sequence_code`, `lead_date`, `email`, `f_name`, `l_name`, `street_address`, `city`, `state`, `zipcode`, `phone`, `dma`, `fadaf`, `optin`, `intent`) 
                         VALUES ('$vendorEmail','$campaignCode','$vendorID','$sequenceCode',NOW(),'$email','$First_Name','$Last_Name','$Address_1.' '.$Address_2','$City','$State','$Zipcode','$Phone','$DMA','$FDAF','$Opt_In','$In_Market_Intent')";
    $re = mysqli_query($conn, $qu) or die(mysqli_error($conn));
    echo "done";

}
?>