var app = angular.module('app', []);

app.service('Map', servicio);

app.controller('controllerPpal', ['$http','$interval','$filter','$window','$location','Map',constructorPpal]);



function servicio($q)

{

    var map;

    var marker;

    this.addMarker = function(lat,lng) {

        if(this.marker) this.marker.setMap(null);

        this.marker = new google.maps.Marker({

            map: this.map,

            position: {lat: lat, lng: lng},

            animation: google.maps.Animation.DROP,

        });

        return this.marker;
   	 }

    this.init = function() {

        var options = {

            center: new google.maps.LatLng(-34.9204948, -57.9535657),

            zoom: 14,

            disableDefaultUI: true    

        }

        this.map = new google.maps.Map(document.getElementById('map'), options);

   	 }

    this.search = function(str) {

        var d = $q.defer();

        this.places.textSearch({query: str}, function(results, status) {

            if (status == 'OK') {

                d.resolve(results[0]);

            }

            else d.reject(status);

        });

        return d.promise;

    }



}

 function constructorPpal($http,$interval,$filter,$window,$location,Map,$scope)

{          

    var scope = this;
    var picture = document.getElementById('picture');
    console.log($location.host());
    var localImg = "http://"+$location.host()+":8000/live.jpg";

    var obtenerPic = $interval( function(){
	$http.get(localImg).
    success(function(data, status, headers, config) {
        picture.src = localImg;
    }).
    error(function(data, status, headers, config) {
    });}, 1000);

    

    scope.destino =
    {
    	latitud: 0 ,
    	longitud: 0
    }

    scope.posicion =
    {
    	latitud: 0,
    	longitud: 0
    }

    var data;
    var iconCheck = {
    	url: "img/check.png", // url
   		scaledSize: new google.maps.Size(33, 33) // scaled size
		};

	    Map.init();

	    google.maps.event.addListener(Map.map,'click', function(e) 
	    {
		    var marcador = Map.addMarker(e.latLng.lat(),e.latLng.lng());
		    scope.destino.latitud = marcador.getPosition().lat().toFixed(5);
		    scope.destino.longitud = marcador.getPosition().lng().toFixed(5);
		    console.log(scope.destino);
		    document.getElementById('text').text = scope.destino.latitud+", "+ scope.destino.longitud;
		   document.getElementById('ir').style.display = "inline";
		});
	    
	scope.mover = function(direccion)
	{	
		$http.post('./php/agregar_movimiento.php', {'direccion': direccion}
	    	).success(function(response)
	    	{
	    	
	    		if(response == "OK")
	    		{
	    			console.log("perfecto");
	    		}
	    		else
	    		{
	    			console.log("algo fallo");
	    		}
	    		
	    	}).error(function(){
	       alert('Error: no se puede conectar con el auto');
	    	});
	}

	scope.enviar_posicion = function()
	{
		$http.post('./php/agregar_destino.php', {'lat': scope.destino.latitud,'lng':scope.destino.longitud}
	    	).success(function(response)
	    	{
	    		console.log(response);
	    		if(response == "OK")
	    		{
	    			console.log("perfecto");
	    		}
	    		else
	    		{
	    			console.log("algo fallo");
	    		}
	    		
	    	}).error(function(){
	       alert('Error: no se puede conectar con el auto');
	    	});
	}

 }

