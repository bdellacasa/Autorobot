/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = 
{
    // Application Constructor
    initialize: function() 
    {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
         
    },

/* CUANDO EL DISPOSITIVO ESTA LISTO */
    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() 
    {
        var titulo = document.getElementById('rr');
        var pot = document.getElementById('pot');
        var cerrar = document.getElementById('out');
        var conectar = document.getElementById('conectar');
        var element = document.getElementById('location');
        var info = document.getElementById('boton');
        var open = false;
        var str = '';
        var lastRead = new Date();
        var lat_ant = 0;
        var lng_ant= 0;
        var direccion = 0;
        var url_ip;
        var last_boton;
        var last_id = 0;

        //Inicia el servidor
        cordova.plugins.CameraServer.startServer({
        "www_root" : "/",
        "port" : 8000,
        "localhost_only" : false,
        "json_info": []
        }, function( url ){
            // if server is up, it will return the url of http://:port/
            // the ip is the active network connection
            // if no wifi or no cell, "127.0.0.1" will be returned.
            console.log("CameraServer Started @ " + url); 
            titulo.innerHTML = ""+url ;
            url_ip = url.slice(0,url.lastIndexOf(':')+1);
        }, function( error ){
            console.log("CameraServer Start failed: " + error);titulo.innerHTML = "CameraServer Start failed: " + error;

        });

        //Inicia la captura de imagenes
        cordova.plugins.CameraServer.startCamera(function(){
                console.log("Capture Started");
                pot.innerHTML = "Capture Started";
            },function( error ){
                console.log("CameraServer StartCapture failed: " + error);
                pot.innerHTML = "CameraServer StartCapture failed: " + error;
            });
                
        navigator.geolocation.watchPosition(onSuccess, onError);
        setInterval(function(){ moverse(); }, 100); //Cada 100ms se consulta a la base de datos para mover el auto

        // onError Callback receives a PositionError object
        function onError(error) 
        {
            alert('code: '    + error.code    + '\n' +
                  'message: ' + error.message + '\n');
        };

        function onSuccess(position) 
        {
          
            element.innerHTML = 'Latitude: '  + position.coords.latitude      + '<br />' +
                                'Longitude: ' + position.coords.longitude     + '<br />' +
                                'Direccion: '           + position.coords.heading           + '<br />' +
                                'Velocidad: '             + position.coords.speed             + '<br />' +
                                '<hr />';
                                lat_ant= position.coords.latitude ;
                                lng_ant= position.coords.longitude ;
                                direccion = position.coords.heading;
        };

        function successcallback(response)
        {
            alert(response);
        };


        cerrar.onclick = function() 
        {
            serial.close();
            open = false;
        };

        conectar.onclick = function() 
        {
            // request permission first
            serial.requestPermission
            (
                // if user grants permission
                function(successMessage) 
                {
                    // open serial port
                    serial.open(
                        {baudRate: 250000},
                        // if port is succesfuly opened
                        function(successMessage) {
                            open = true;
                            // register the read callback
                            serial.registerReadCallback(
                                function success(data){
                                    // decode the received message
                                    var view = new Uint8Array(data);
                                    if(view.length >= 1) {
                                        for(var i=0; i < view.length; i++) {
                                            // if we received a \n, the message is complete, display it
                                            if(view[i] == 13) {
                                                var value = str;
                                                pot.innerText = value;
                                                str = '';
                                            }
                                            // if not, concatenate with the begening of the message
                                            else {
                                                var temp_str = String.fromCharCode(view[i]);
                                                var str_esc = escape(temp_str);
                                                str += unescape(str_esc);
                                            }
                                        }
                                    }
                                },
                                // error attaching the callback
                                errorCallback
                            );
                        },
                        // error opening the port
                        errorCallback
                    );
                },
                // user does not grant permission
                errorCallback
            );   
        }

        var errorCallback = function(message) 
        {
            alert('Error: ' + message);
        };

        //Consulta la base de datos y envía por puerto serie la solicitud del usuario.
        function moverse()
        {
        
        $.getJSON(url_ip+"8080/php/mover.php",function(jsonp) 
                { 
                    if(jsonp[0].boton == null)
                    {
                    
                       if (open)  
                            {
                                if (last_id != jsonp[0].id)
                                {
                                    serial.write('C'+'L'+lat_ant+','+lng_ant+'/'+ jsonp[0].lat+','+jsonp[0].lng+'D'+direccion+'*');
                                    info.innerHTML = 'C'+'L'+lat_ant+','+lng_ant+'/'+ jsonp[0].lat+','+jsonp[0].lng+'D'+direccion;
                                    last_id = jsonp[0].id;
                                }
                                else
                                {
                                    serial.write('S'+lat_ant+','+lng_ant+'/'+'D'+direccion+'*');
                                    info.innerHTML = 'S'+lat_ant+','+lng_ant+'/'+'D'+direccion;
                                }
                            }
                    }
                    else
                    {   
                        if(last_boton != jsonp[0].boton)
                        {                        
                            var c = "";
                            switch(jsonp[0].boton)
                            {
                                case "adelante":
                                
                                    c = "W";
                                    break;
                                
                                case "atras":
                                
                                    c = "B";
                                    break;
                                
                                case "izquierda":
                                
                                    c = "A";
                                    break;
                                
                                case "derecha":
                                
                                    c = "D";
                                    break;
                                
                                case "parar":
                                
                                    c = "P";
                                    break;
                                
                            }
                            if (open) serial.write(c);
                            info.innerHTML = "Comando enviado: "+ c ;
                            last_boton = jsonp[0].boton;
                        }
                        
                    }
                   
                }
           )
        .fail(function(xhr, status, error) {
                    alert("error "+ status);
                });
        };  
    }
};

//Se inicializa la aplicacion

app.initialize();