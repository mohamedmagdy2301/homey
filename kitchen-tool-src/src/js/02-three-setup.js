// =================== THREE SETUP ===================
const canvas=document.getElementById("c");
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(55,1,0.05,80);
const hemi=new THREE.HemisphereLight(0xffffff,0xb9b2a6,0.75); scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff4e0,0.8);
sun.position.set(1.4,4,-4); sun.target.position.set(0.9,0,2);
sun.castShadow=true; sun.shadow.mapSize.set(1024,1024);
Object.assign(sun.shadow.camera,{left:-4,right:4,top:4,bottom:-4,near:0.5,far:15});
scene.add(sun,sun.target);
// keep the sun's shadow box over the whole room (a fixed ±4 m box clipped shadows in big rooms / the apartment)
function fitSun(cx,cz,s){ sun.target.position.set(cx,0,cz); sun.position.set(cx+0.5,4,cz-6); sun.target.updateMatrixWorld(); const c=sun.shadow.camera; c.left=c.bottom=-s; c.right=c.top=s; c.near=0.5; c.far=Math.hypot(0.5,4,6)+s+4; c.updateProjectionMatrix(); }
const bulb=new THREE.PointLight(0xfff1d6,0.45,7); bulb.position.set(0.9,2.6,2); scene.add(bulb);
let root=new THREE.Group(); scene.add(root);
// render on demand: the loop only draws while something changes (saves battery on phones)
let DIRTY=2; function poke(n){ DIRTY=Math.max(DIRTY,n||30); }
for(const ev of ["pointerdown","pointermove","pointerup","wheel","keydown","input","change","click"]) addEventListener(ev,()=>poke(),{capture:true,passive:true});
let walls={};
