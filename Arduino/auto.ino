#include <LEANTEC_ControlMotor.h>
#include <math.h>
ControlMotor control(2,3,7,4,5,6); 
// motorDer1, motorDer2,motorIzq1, motorIzq2
// derecho,izquierdo
#define angulo_porPaso 5
#define RAD_TO_DEG 57.295779

bool llego;
unsigned char option,i;
char lat_actS[11]; char lat_nueS[11]; char long_actS[11]; char long_nueS[11]; char dirS[5],aux;
float lat_actD,lat_nueD,long_actD,long_nueD;
short int dirD;

void setup() {
  Serial.begin(250000);
  llego=false;
}

void loop() {
  if (Serial.available()){
    option=Serial.read();
    switch (option){
      case 'W': //Avanzo (velocidad, direccion)
        Serial.println("ORDEN: Avance");
        control.Motor(255,1);  
      break;
      case 'B': //Atrás
        Serial.println("ORDEN: Retroceso");
        control.Motor(-255,1); 
      break;
      case 'A'://Giro a la izquierda
        Serial.println("ORDEN: Giro a la izquierda");
        control.Motor(255,-100);
      break;
      case 'D'://Giro a la derecha
        Serial.println("ORDEN: Giro a la derecha");
        control.Motor(255,100);
      break;
      case 'P'://Detención
        Serial.println("ORDEN: Detencion");
        control.Motor(0,1);
      break;
      case 'C':  
        Serial.println("ORDEN: Dirigirse al destino solicitado");
        while(!llego){
          detectarDireccion();
          while (!Serial.available());  //Se espera un caractér hasta que la aplicacion web forme el mensaje y lo envie
          aux=Serial.read();
          delay(5);
          if(aux=='L')
            recibirCadena('L'); //Se recibe cadena LARGA
          else if(aux=='S')
            recibirCadena('S'); //Se recibe cadena CORTA
          else //El usuario luego de presionar el mapa y antes de llegar el auto a destino, presiona un boton
            switch (aux){
              case 'W': //Avanzo (velocidad, direccion)
                Serial.println("ORDEN: Avance");
                control.Motor(255,1);  
              break;
              case 'B': //Atrás
                Serial.println("ORDEN: Retroceso");
                control.Motor(-255,1); 
              break;
              case 'A'://Giro a la izquierda
                Serial.println("ORDEN: Giro a la izquierda");
                control.Motor(255,-100);
              break;
              case 'D'://Giro a la derecha
                Serial.println("ORDEN: Giro a la derecha");
                control.Motor(255,100);
              break;
              case 'P'://Detención
                Serial.println("ORDEN: Detencion");
                control.Motor(0,1);
              break;
            } //end 2do switch
        }//while(!llego)
    break;
  }//end 1er switch  
}//end if(serial.available)
}//end loop

void recibirCadena(unsigned char tipoCadena){
    //cadena corta ->Slatact,longact/Ddir*          
    //cadena larga ->//CLlatitud actual,longitudactual/latituddestino,longdestinoDdir*
    //Almaceno latitud actual -> almacena de a un caracter a la vez porque el tipo string no podia ser convertido luego a float
    i=0;
    aux=Serial.read();
    delay(5);
    while(aux!=','){
      lat_actS[i++]=aux;
      aux=Serial.read();  
      delay(5);
    }
    
    //Almaceno longitud actual
    i=0;
    aux=Serial.read();
    while(aux!='/'){
      long_actS[i++]=aux;
      aux=Serial.read();
      delay(5);  
    }
    
    if(tipoCadena=='L'){
      //Almaceno latitud nueva
      i=0;
      aux=Serial.read();
      while(aux!=','){ 
        lat_nueS[i++]=aux;
        aux=Serial.read();
        delay(5);  
      }
      
      //Almaceno longitud nueva
      i=0;
      aux=Serial.read();
      while(aux != 'D'){
        long_nueS[i++]=aux;
        aux=Serial.read();
        delay(5);  
      }
      
      lat_nueD=atof(lat_nueS);  
      long_nueD=atof(long_nueS);
      
    }//end if
    else {//Salteo 'D' 
        aux=Serial.read();
        delay(5);  
    }
     
    //Almaceno dir
    i=0;
    aux=Serial.read();
    while(aux!='*'){ 
      dirS[i++]=aux;
      aux=Serial.read();
      delay(5);  
    }
    
    lat_actD=atof(lat_actS);
    long_actD=atof(long_actS);
    dirD=atof(dirS);

    Serial.println("-----------------------------------------------------------------------------");  
    Serial.print("Latitud actual  : "); Serial.println(lat_actS);
    Serial.print("Longitud actual : "); Serial.println(long_actS);
    Serial.print("Latitud destino : "); Serial.println(lat_nueS);
    Serial.print("Longitud destino: "); Serial.println(long_nueS);
    Serial.print("Direccion actual: "); Serial.println(dirS);
    Serial.println("-----------------------------------------------------------------------------");  
    mover(lat_actD,lat_nueD,long_actD,long_nueD,dirD);    
}

//Avanzo hacia adelante 0,5 segundos para que sea detectado por el gps y así conocer la dirección, luego se detiene 
void detectarDireccion(){
   control.Motor(100,1);  
   delay(200);
   control.Motor(0,1);
}


//Mueve el auto hasta el lugar destino moviéndose primero en latitud (horizontal) y luego en longitud (vertical)
void mover(float lat_act, float lat_nue,float long_act,float long_nue, short int dir){
  
float dif_lat,dif_long; unsigned char cantMovs=0;
short int nueva_dir;

//Cálculo de la diferencia entre latitudes y longitudes nuevas y actuales
dif_lat=lat_nueD-lat_actD;
dif_long=long_nueD-long_actD;
Serial.print("Diferencia entre latitud destino y actual : "); Serial.println(dif_lat,5);
Serial.print("Diferencia entre longitud destino y actual: "); Serial.println(dif_long,5);

//Chequeo de llegada del robot móvil
//Dado que las operaciones de resta de double/float no son exactas, se toma como margen de llegada un error menor a 0.0001 grados en latitud y longitud
if((abs(dif_lat)<0.0001)&(abs(dif_long)<0.0001)){
    llego=true;
    Serial.println(""); 
    Serial.println("EL ROBOT MOVIL HA LLEGADO A DESTINO"); 
}
else{
Serial.print("Direccion al destino: "); 
  //Cálculo de la nueva direccion que debe poseer el auto
  
  if(dif_long>0){
    if(dif_lat>0){
      Serial.println("Noreste");
      nueva_dir=90-((atan(dif_lat/dif_long))*RAD_TO_DEG);}
    else{
      if(dif_lat==0){
        Serial.println("Este");
        nueva_dir=90;}  
      else{
        if(dif_lat<0){
           Serial.println("Sudeste");  
           nueva_dir=(((atan(dif_lat/dif_long))*RAD_TO_DEG)*(-1))+90;}
        }      
    }
  }

  if(dif_long<0){
    if(dif_lat>0){
      Serial.println("Noroeste");
      nueva_dir=(((atan(dif_lat/dif_long))*RAD_TO_DEG)*(-1))+270;}
    else{
      if(dif_lat<0){
        Serial.println("Sudoeste");
        nueva_dir=270-((atan(dif_lat/dif_long))*RAD_TO_DEG);}
      else{
        if(dif_lat==0){
           Serial.println("Oeste");
           nueva_dir=270;}
        }  
    }  
  }
  
  if(dif_long==0){
    if(dif_lat>0){
      Serial.println("Norte");
      nueva_dir=0;}
    else{
      if(dif_lat<0){
        Serial.println("Sur");
        nueva_dir=180;}
    }  
  }
    
Serial.println("-----------------------------------------------------------------------------");  
    
//El auto gira a la direccion requerida 
if(((nueva_dir-dir)<180)&((nueva_dir-dir)>=0)){
    //giro nueva_dir-dir grados a la DERECHA
    cantMovs=(nueva_dir-dir)/angulo_porPaso;
    Serial.print("Cantidad de giros a la derecha de 5 grados cada uno: ");
    Serial.print(cantMovs);
    Serial.print(" - Total: "); Serial.print(cantMovs*angulo_porPaso); Serial.println(" grados");
    Serial.print("Giro en proceso");
    for(int j=0;j<cantMovs;j++){
      delay(50);
      control.Motor(100,100);   
      delay(50);
      control.Motor(0,1);
      Serial.print(".");
    }
    Serial.println("");      
}  
else{
    if((nueva_dir-dir)<0)
      cantMovs=(dir-nueva_dir)/angulo_porPaso;
    else
      cantMovs=(360-nueva_dir+dir)/angulo_porPaso;
    Serial.print("Cantidad de giros a la izquierda de 5 grados cada uno: ");
    Serial.println(cantMovs);
    Serial.print(" - Total: "); Serial.print(cantMovs*angulo_porPaso); Serial.println(" grados"); 
    Serial.print("Giro en proceso");
    for(int j=0;j<cantMovs;j++){
      delay(50);
      control.Motor(100,-100); 
      delay(50);
      control.Motor(0,1);
      Serial.print(".");
    }
    Serial.println("");
}

//Avanzo
Serial.println("Avance de 10 segundos en linea recta en direccion al punto destino");    
control.Motor(180,1);
delay(10000);
control.Motor(0,1);
Serial.println("El auto se ha detenido.");
Serial.println("Esperando nuevo mensaje con localizacion actual");
}
}
