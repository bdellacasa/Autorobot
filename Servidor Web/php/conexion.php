<?php 
function conexion()
    {
        //$servername = $_SERVER['SERVER_NAME'].":3306";
        $servername = "192.168.2.171:3306";
        //$servername = "localhost";
        $username = "root";
        $password = "";
        $database = "mysql";

        // Create connection
        $conn = new mysqli($servername, $username, $password, $database);
        mysqli_query($conn,"SET NAMES 'utf8'");
        // Check connection
        if ($conn->connect_error) {
            die("Connection failed: " . $conn->connect_error);
        } 
        return $conn;
    }
?>