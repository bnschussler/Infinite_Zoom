//Based on Jos Stam's paper: http://graphics.cs.cmu.edu/nsp/course/15-464/Fall09/papers/StamFluidforGames.pdf
//coloring inspiration from https://topaz1008.github.io/canvas-fluid-solver/

'use strict';

//temp variables
var tx,ty,a,b,x,y,bb,c,c1,d,d1;
var temp;
var zoom=.95;
var rotation=0;
var intensity=3;
var hueOn=false;

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
var data = imageData.data;
var dataBuffer=[...data];
for(x=0;x<width;x++){
  for(y=0;y<height;y++){
    data[4*(x+width*y)]=Math.random()*255;
    data[4*(x+width*y)+1]=Math.random()*255;
    data[4*(x+width*y)+2]=Math.random()*255;
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

function draw(){
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
      dataBuffer[4*(x+width*y)]=clamp(data[4*(x+width*y)]+(Math.floor(Math.random()*(intensity*2+1))-intensity)*10,0,255);
      dataBuffer[4*(x+width*y)+1]=clamp(data[4*(x+width*y)+1]+(Math.floor(Math.random()*(intensity*2+1))-intensity)*10,0,255);
      dataBuffer[4*(x+width*y)+2]=clamp(data[4*(x+width*y)+2]+(Math.floor(Math.random()*(intensity*2+1))-intensity)*10,0,255);
    }
  }
  for(x=0;x<width;x++){
    for(y=0;y<height;y++){
      tx=(x-mouseX)*zoom;
      ty=(y-mouseY)*zoom;
      temp=tx*Math.cos(rotation)-ty*Math.sin(rotation)+mouseX+Math.random()-.5;
      ty=ty*Math.cos(rotation)+tx*Math.sin(rotation)+mouseY+Math.random()-.5;
      tx=temp;
      a=tx-Math.floor(tx);
      b=ty-Math.floor(ty);
      c=mod(Math.floor(tx),width);
      c1=mod(Math.floor(tx+1),width);
      d=mod(Math.floor(ty),height);
      d1=mod(Math.floor(ty+1),height);
      data[4*(x+width*y)]=dataBuffer[4*(c+width*d)]*(1-a)*(1-b)
                         +dataBuffer[4*(c1+width*d)]*(a)*(1-b)
                         +dataBuffer[4*(c+width*d1)]*(1-a)*(b)
                         +dataBuffer[4*(c1+width*d1)]*(a)*(b);
      data[4*(x+width*y)+1]=dataBuffer[4*(c+width*d)+1]*(1-a)*(1-b)
                           +dataBuffer[4*(c1+width*d)+1]*(a)*(1-b)
                           +dataBuffer[4*(c+width*d1)+1]*(1-a)*(b)
                           +dataBuffer[4*(c1+width*d1)+1]*(a)*(b);
      data[4*(x+width*y)+2]=dataBuffer[4*(c+width*d)+2]*(1-a)*(1-b)
                           +dataBuffer[4*(c1+width*d)+2]*(a)*(1-b)
                           +dataBuffer[4*(c+width*d1)+2]*(1-a)*(b)
                           +dataBuffer[4*(c1+width*d1)+2]*(a)*(b);
    }
  }
  ctx.putImageData(imageData, 0, 0);
  pmouseX=mouseX;
  pmouseY=mouseY;

}

draw();
