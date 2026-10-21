const viewport=document.querySelector("#viewport");
const poster=document.querySelector("#poster");
const zoomLevel=document.querySelector("#zoom-level");
const pointers=new Map();
let scale=1,x=0,y=0,pinch=null,drag=null;
const minScale=0.1,maxScale=5;

function paint(){
  poster.style.transform=`translate(${x}px,${y}px) scale(${scale})`;
  zoomLevel.textContent=`${Math.round(scale*100)} %`;
}
function fit(){
  if(!poster.naturalWidth||!viewport.clientWidth||!viewport.clientHeight)return;
  scale=Math.min(viewport.clientWidth/poster.naturalWidth,viewport.clientHeight/poster.naturalHeight);
  scale=Math.max(minScale,Math.min(maxScale,scale));
  x=(viewport.clientWidth-poster.naturalWidth*scale)/2;
  y=(viewport.clientHeight-poster.naturalHeight*scale)/2;
  paint();
}
function zoomAt(next,cx=viewport.clientWidth/2,cy=viewport.clientHeight/2){
  next=Math.max(minScale,Math.min(maxScale,next));
  const imageX=(cx-x)/scale,imageY=(cy-y)/scale;
  scale=next;x=cx-imageX*scale;y=cy-imageY*scale;paint();
}
function point(event){const r=viewport.getBoundingClientRect();return{x:event.clientX-r.left,y:event.clientY-r.top}}
function pinchState(){
  const [a,b]=[...pointers.values()];
  const cx=(a.x+b.x)/2,cy=(a.y+b.y)/2;
  const dx=a.x-b.x,dy=a.y-b.y;
  return{distance:Math.hypot(dx,dy),scale,cx,cy,imageX:(cx-x)/scale,imageY:(cy-y)/scale};
}

poster.addEventListener("load",fit);
window.addEventListener("resize",fit);
viewport.addEventListener("pointerdown",event=>{
  if(event.pointerType==="mouse"&&event.button!==0)return;
  viewport.setPointerCapture(event.pointerId);
  pointers.set(event.pointerId,point(event));
  if(pointers.size===1){drag={start:point(event),originX:x,originY:y};viewport.classList.add("dragging")}
  else if(pointers.size===2){drag=null;pinch=pinchState()}
});
viewport.addEventListener("pointermove",event=>{
  if(!pointers.has(event.pointerId))return;
  pointers.set(event.pointerId,point(event));
  if(pointers.size===2&&pinch){
    const [a,b]=[...pointers.values()],cx=(a.x+b.x)/2,cy=(a.y+b.y)/2;
    const ratio=Math.hypot(a.x-b.x,a.y-b.y)/(pinch.distance||1);
    scale=Math.max(minScale,Math.min(maxScale,pinch.scale*ratio));
    x=cx-pinch.imageX*scale;y=cy-pinch.imageY*scale;paint();
  }else if(pointers.size===1&&drag){
    const p=point(event);x=drag.originX+p.x-drag.start.x;y=drag.originY+p.y-drag.start.y;paint();
  }
});
function endPointer(event){
  pointers.delete(event.pointerId);
  if(pointers.size<2)pinch=null;
  if(pointers.size===1){const p=[...pointers.values()][0];drag={start:p,originX:x,originY:y}}
  else drag=null;
  if(!pointers.size)viewport.classList.remove("dragging");
}
viewport.addEventListener("pointerup",endPointer);
viewport.addEventListener("pointercancel",endPointer);
viewport.addEventListener("wheel",event=>{
  event.preventDefault();const p=point(event);
  const step=Math.max(0.92,Math.min(1.08,Math.exp(-event.deltaY*0.0004)));
  zoomAt(scale*step,p.x,p.y);
},{passive:false});
document.querySelector("#zoom-in").addEventListener("click",()=>zoomAt(scale*1.1));
document.querySelector("#zoom-out").addEventListener("click",()=>zoomAt(scale/1.1));
document.querySelector("#zoom-reset").addEventListener("click",fit);
viewport.addEventListener("keydown",event=>{
  if(event.key==="+")zoomAt(scale*1.1);
  if(event.key==="-")zoomAt(scale/1.1);
  if(event.key==="0")fit();
});
if(poster.complete)fit();
