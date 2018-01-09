<?php


	require_once('conexion.php');
		$conn = conexion();
		$sql =  "SELECT * from movimientos order by timestamp desc limit 1";
		if(!$result = mysqli_query($conn, $sql)) { print_r(mysql_error); die();}
        
	        $data = array();
	        //fetch tha data from the database
			while ($row=mysqli_fetch_object($result))
			{
			 $data[]=$row;
			}
			header('Access-Control-Allow-Origin: *');
			header('content-type: application/json; charset=utf-8');
			$json = json_encode($data,JSON_UNESCAPED_UNICODE);
			echo isset($_GET['callback'])
		    ? "{$_GET['callback']}($json)"
		    : $json;
	
?>