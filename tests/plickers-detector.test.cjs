const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function detector(){
 const ctx={};vm.createContext(ctx);
 for(const name of ['cv.js','aruco.js'])vm.runInContext(fs.readFileSync('assets/vendor/js-aruco/'+name,'utf8'),ctx);
 return new ctx.AR.Detector();
}
function pixels(id,turn=0){
 const width=280,data=new Uint8ClampedArray(width*width*4).fill(255),patterns=[16,23,9,14];
 for(let y=0;y<196;y++)for(let x=0;x<196;x++){
  const c=Math.floor(x/28),r=Math.floor(y/28);
  const white=c>0&&c<6&&r>0&&r<6&&((patterns[(id>>(2*(5-r)))&3]>>(5-c))&1);
  let u=x,v=y;for(let n=0;n<turn;n++)[u,v]=[195-v,u];
  const offset=((v+42)*width+u+42)*4;
  data[offset]=data[offset+1]=data[offset+2]=white?255:0;
 }
 return {width,height:width,data};
}
test('browser distributions initialize without CommonJS module or require',()=>{assert.equal(typeof detector().detect,'function')});
test('printed-card marker numbers survive detection in all four orientations',()=>{
 for(const id of [1,15,42,60])for(let turn=0;turn<4;turn++){
  const found=detector().detect(pixels(id,turn));assert.equal(found.length,1);assert.equal(found[0].id,id);
 }
});
test('an empty camera image does not create a student scan',()=>{
 const image={width:280,height:280,data:new Uint8ClampedArray(280*280*4).fill(255)};
 assert.equal(detector().detect(image).length,0);
});
