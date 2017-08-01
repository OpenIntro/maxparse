<?php
// $conn= mysqli_connect("localhost", "maxparseFFSadmin", "W+.xHael*cBc", "maxparseFFS");
$conn= mysqli_connect("mysql.etrbe.com", "maxparseffsadmin", "W+.xHael*cBc", "maxparseffs");
$id=$_POST["id"];
$sql = "DELETE FROM parse WHERE id=$id";

if ($conn->query($sql) === TRUE) {
    echo "Record deleted successfully";
} else {
    echo "Error deleting record: " . $conn->error;
}

$conn->close();
?>