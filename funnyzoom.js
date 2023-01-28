'use strict';

//temp variables
var tx,ty,a,b,x,y,bb,c,c1,d,d1;
var temp;

var zoom=1;
var zoom1=0;
var rotation=0;
var rotation1=0;
var wiggle=0;
var wiggle1=0;
var intensity=3;
var hueOn=false;
var coupleNoise=true;
var HSV=false;
var Red=true;
var Green=true;
var Blue=true;

var time;
var dt=undefined;

var run=true;


var mouseX=0; //mouse position in canvas pixel coords
var mouseY=0;
var pmouseX=0;  //mouse canvas coords last frame
var pmouseY=0;
var rawmx=0;  //mouse pos in raw pixel coords
var rawmy=0;

function clamp(x,min,max){
    return x < min ? min :
           x > max ? max :
           x
    //return ((x-min)%(max-min)+(max-min))%(max-min)+min
}

const canvas = document.getElementById('canvas');
var width=canvas.width;
var height=canvas.height;
const ctx = canvas.getContext('2d');
//https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/
var imageData = ctx.getImageData(0, 0, width, height);
const data = imageData.data;
const dataBuffer1=new Uint8Array(height*width*3);
const dataBuffer2=new Uint8Array(height*width*3);
for(x=0;x<width;x++){
  for(y=0;y<height;y++){
    dataBuffer2[3*(x+width*y)]=Math.round(Math.random()*255);
    dataBuffer2[3*(x+width*y)+1]=Math.round(Math.random()*255);
    dataBuffer2[3*(x+width*y)+2]=Math.round(Math.random()*255);
    data[4*(x+width*y)+3]=255;
  }
}

ctx.putImageData(imageData, 0, 0);

bb = canvas.getBoundingClientRect(); 

document.addEventListener('mousemove',(event)=>{
  rawmx = event.clientX; 
  rawmy = event.clientY;
})

document.addEventListener('touchmove',(event)=>{ //https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/HTML-canvas-guide/AddingMouseandTouchControlstoCanvas/AddingMouseandTouchControlstoCanvas.html
  event.preventDefault();
  rawmx = event.targetTouches[0].clientX; 
  rawmy = event.targetTouches[0].clientY;
})

function mod(x,m){
  return (x%m+m)%m;
}

function HSVtoRGB(h, s, v) { https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
    var r, g, b, i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return [Math.round(r * 255),
            Math.round(g * 255),
            Math.round(b * 255)];
}

function updateImage(){
    if(HSV){
      for(x=0;x<width;x++){
        for(y=0;y<height;y++){
          temp=HSVtoRGB(Red?dataBuffer2[3*(x+width*y)]/255:.75,Blue?dataBuffer2[3*(x+width*y)+1]/255:1,Green?dataBuffer2[3*(x+width*y)+2]/255:1);
          data[4*(x+width*y)]=temp[0];
          data[4*(x+width*y)+1]=temp[1];
          data[4*(x+width*y)+2]=temp[2];
        }
      }
    }
    else{
      for(x=0;x<width;x++){
        for(y=0;y<height;y++){
          data[4*(x+width*y)]=Red?dataBuffer2[3*(x+width*y)]:0;
          data[4*(x+width*y)+1]=Green?dataBuffer2[3*(x+width*y)+1]:0;
          data[4*(x+width*y)+2]=Blue?dataBuffer2[3*(x+width*y)+2]:0;
        }
      }
    }
    ctx.putImageData(imageData, 0, 0);
}

function draw(){
  if(run){
    dt=(dt==undefined)?0:Date.now()-time;
    time=Date.now();
    if(hueOn){
      document.getElementById("hs").value=(parseInt(document.getElementById("hs").value)+11)%360;
      document.getElementById("ht").value=document.getElementById("hs").value;
      updateFilter();
    }

    mouseX = clamp(Math.floor( (rawmx - bb.left) / bb.width * width ),0,width); //from https://stackoverflow.com/questions/72379573/get-canvas-pixel-position-from-mouse-coordinates
    mouseY = clamp(Math.floor( (rawmy - bb.top) / bb.height * height ),0,height);

    window.requestAnimationFrame(draw);

    for(x=0;x<width;x++){
      for(y=0;y<height;y++){
        dataBuffer1[3*(x+width*y)]=HSV?mod(Math.round(dataBuffer2[3*(x+width*y)]+(Math.floor(Math.random()*(intensity*2+1))-intensity)*10),255)
                                      :clamp(Math.round(dataBuffer2[3*(x+width*y)]+(Math.floor(Math.random()*(intensity*2+1))-intensity)*10),0,255);
        dataBuffer1[3*(x+width*y)+1]=clamp(Math.round(dataBuffer2[3*(x+width*y)+1]+(Math.floor(Math.random()*(intensity*2+1))-intensity)*10),0,255);
        dataBuffer1[3*(x+width*y)+2]=clamp(Math.round(dataBuffer2[3*(x+width*y)+2]+(Math.floor(Math.random()*(intensity*2+1))-intensity)*10),0,255);
      }
    }
    for(x=0;x<width;x++){
      for(y=0;y<height;y++){

        tx=(x-mouseX)/width
        ty=(y-mouseY)/height

        tx=tx/Math.exp(zoom*dt/1000);
        ty=ty/Math.exp(zoom*dt/1000);

        temp=tx*.25/(.01+Math.max(Math.abs(tx),Math.abs(ty)))/(.25/(.01+Math.max(Math.abs(tx),Math.abs(ty)))+(zoom1*dt/1000));
        ty=ty*.25/(.01+Math.max(Math.abs(tx),Math.abs(ty)))/(.25/(.01+Math.max(Math.abs(tx),Math.abs(ty)))+(zoom1*dt/1000));
        tx=temp;

        temp=tx+rotation1*dt/50*(16*tx*tx-16*ty*ty+1)/width;
        ty=ty+rotation1*dt/50*(32*tx*ty)/height;
        tx=temp;

        temp=tx*Math.cos(rotation*dt/1000)-ty*Math.sin(rotation*dt/1000);
        ty=ty*Math.cos(rotation*dt/1000)+tx*Math.sin(rotation*dt/1000);
        tx=temp;

        temp=tx+Math.sin(40*(tx+ty))*(.05*wiggle*dt/1000);
        ty=ty+Math.cos(40*(tx-ty))*(.05*wiggle*dt/1000);
        tx=temp;

        temp=tx+(Math.cos(20*ty))*(wiggle1*dt/10000);
        ty=ty+(-2*Math.cos(10*tx)*Math.cos(10*tx))*(wiggle1*dt/10000);
        tx=temp;

        tx=tx*width+mouseX+Math.random()-.5;
        ty=ty*height+mouseY+Math.random()-.5;

        a=tx-Math.floor(tx);
        b=ty-Math.floor(ty);
        c=mod(Math.floor(tx),width);
        c1=mod(Math.floor(tx+1),width);
        d=mod(Math.floor(ty),height);
        d1=mod(Math.floor(ty+1),height);
        dataBuffer2[3*(x+width*y)]=HSV?Math.round(dataBuffer1[3*(c+width*d)]
                                             +(mod(dataBuffer1[3*(c1+width*d)]-dataBuffer1[3*(c+width*d)]+128,256)-128)*(a)*(1-b)
                                             +(mod(dataBuffer1[3*(c+width*d1)]-dataBuffer1[3*(c+width*d)]+128,256)-128)*(1-a)*(b)
                                             +(mod(dataBuffer1[3*(c1+width*d1)]-dataBuffer1[3*(c+width*d)]+128,256)-128)*(a)*(b))
                                      :Math.round(dataBuffer1[3*(c+width*d)]*(1-a)*(1-b)
                                             +dataBuffer1[3*(c1+width*d)]*(a)*(1-b)
                                             +dataBuffer1[3*(c+width*d1)]*(1-a)*(b)
                                             +dataBuffer1[3*(c1+width*d1)]*(a)*(b));
        dataBuffer2[3*(x+width*y)+1]=Math.round(dataBuffer1[3*(c+width*d)+1]*(1-a)*(1-b)
                                               +dataBuffer1[3*(c1+width*d)+1]*(a)*(1-b)
                                               +dataBuffer1[3*(c+width*d1)+1]*(1-a)*(b)
                                               +dataBuffer1[3*(c1+width*d1)+1]*(a)*(b));
        dataBuffer2[3*(x+width*y)+2]=Math.round(dataBuffer1[3*(c+width*d)+2]*(1-a)*(1-b)
                                               +dataBuffer1[3*(c1+width*d)+2]*(a)*(1-b)
                                               +dataBuffer1[3*(c+width*d1)+2]*(1-a)*(b)
                                               +dataBuffer1[3*(c1+width*d1)+2]*(a)*(b));
      }
    }
    updateImage();
    pmouseX=mouseX;
    pmouseY=mouseY;
  }
  else{
    dt=undefined;
  }
}

updateImage();

