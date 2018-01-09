<?php
			
	require_once('conexion.php');
	header('Access-Control-Allow-Origin: *');
	$params = json_decode(file_get_contents('php://input'),true);
	if( isset($params['lat']) && isset($params['lng']) )
    {
    	$lat = $params['lat'];
    	$lng = $params['lng'];

			$conn = conexion();
			$sql =  "INSERT INTO coordenadas (id,lat,lng,boton) VALUES (NULL,$lat, $lng,NULL)";
			if($result = mysqli_query($conn, $sql)) 
				{ 
					echo 'OK';
				}
				else
				{
					echo 'ERROR';
					die();
				}
        
	}
?>