<?php
			

	require_once('conexion.php');
	header('Access-Control-Allow-Origin: *');
	$params = json_decode(file_get_contents('php://input'),true);
	if( isset($params['direccion']) )
    {
    	$direccion = $params['direccion'];
    	if($direccion == 'derecha' || $direccion == 'izquierda' || $direccion == 'adelante' || $direccion == 'atras' || $direccion == 'parar' )
    	{
			$conn = conexion();

			$consulta = "SELECT * from movimientos order by timestamp desc limit 1";
			if(!$resultado = mysqli_query($conn, $consulta)) { print_r(mysql_error); }
        
	        $data = array();
	        //fetch tha data from the database
			while ($row=mysqli_fetch_object($resultado))
			{
			 $data[]=$row;
			}
			//print_r($data);
			if($data['boton'] != $direccion)
			{
				$sql =  "INSERT INTO movimientos (id,lat,lng,boton,timestamp) VALUES (NULL,NULL, NULL,'$direccion',NULL)";
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
			else
			{
				echo "error en igualar";
			}
        }
        else
        {
        	echo "todo mal";
        }
	}
?>