<?php
// $conn= mysqli_connect("localhost", "maxparseFFSadmin", "W+.xHael*cBc", "maxparseFFS");
$conn= mysqli_connect("mysql.etrbe.com", "maxparseffsadmin", "W+.xHael*cBc", "maxparseffs");
$rows=$_POST["numrows"];
$sql = "DELETE FROM parse ORDER BY id DESC limit $rows";

if ($conn->query($sql) === TRUE) {
    echo "Record deleted successfully";
} else {
    echo "Error deleting record: " . $conn->error;
}

$conn->close();
?>