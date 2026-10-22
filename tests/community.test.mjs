import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=(await readFile(new URL('../community.js',import.meta.url),'utf8')).replace(/^\uFEFF?import[^\n]+\n/,'');
class Element {
 constructor(tag='div'){this.tag=tag;this.value='';this.files=[];this.children=[];this.elements={};}
 append(...v){this.children.push(...v)}replaceChildren(...v){this.children=v}setAttribute(){}querySelector(){return new Element('button')}replaceWith(){}
}
const elements=new Map();const $=s=>{if(!elements.has(s))elements.set(s,new Element());return elements.get(s)};
const requests=[];let blobs=[],dimensions=[];
const context={config:{apiKey:'test',databaseURL:'https://example.firebaseio.com',adminUid:'owner'},document:{querySelector:$,querySelectorAll:()=>[],createElement:tag=>{const e=new Element(tag);if(tag==='canvas'){e.getContext=()=>({fillRect(){},drawImage(){}});e.toBlob=(done,type)=>{dimensions.push([e.width,e.height]);done(new Blob(['x'.repeat(blobs.shift()??40000)],{type}));};}return e;}},sessionStorage:{getItem:()=>null,setItem(){},removeItem(){}},fetch:async(url,options)=>{requests.push({url:String(url),options});return{ok:true,json:async()=>null}},URL,URLSearchParams,AbortSignal,Blob,Date,Map,Promise,crypto:globalThis.crypto,createImageBitmap:async()=>({width:6000,height:4000,close(){}}),FileReader:class {readAsDataURL(blob){this.result='data:'+blob.type+';base64,'+'A'.repeat(Math.ceil(blob.size/3)*4);this.onload()}},confirm:()=>true};
vm.createContext(context);vm.runInContext(source+'\nglobalThis.test={db,compress,getPhoto:()=>compressed,setSession:s=>session=s};',context);
await new Promise(resolve=>setImmediate(resolve));requests.length=0;
await context.test.db('photos',{query:{orderBy:'$key',limitToLast:12}});
let u=new URL(requests.pop().url);assert.equal(u.searchParams.get('limitToLast'),'12');assert.equal(u.searchParams.get('orderBy'),'"$key"');assert.equal(u.searchParams.has('auth'),false);
await assert.rejects(context.test.db('',{method:'PATCH',body:{}}),/로그인/);
context.test.setSession({localId:'owner',idToken:'temporary',expiresAt:Date.now()+3600000});
await context.test.db('',{method:'PATCH',body:{'photos/id':null,'photoData/id':null}});let r=requests.pop();assert.equal(new URL(r.url).pathname,'/community.json');assert.equal(new URL(r.url).searchParams.get('auth'),'temporary');assert.deepEqual(JSON.parse(r.options.body),{'photos/id':null,'photoData/id':null});
$('#compression').value='50';$('#photoFile').files=[{type:'image/jpeg',size:5000000}];blobs=[90000,70000,60000,55000,40000];await context.test.compress();let photo=context.test.getPhoto();assert.ok(photo.bytes<=51200);assert.ok(photo.width<=1280&&photo.height<=1280);assert.ok(dimensions.length>4,'reduces dimensions when quality alone fails');assert.equal($('#uploadSubmit').disabled,false);
$('#photoFile').files=[{type:'image/svg+xml',size:100}];await context.test.compress();assert.equal(context.test.getPhoto(),null);assert.equal($('#uploadSubmit').disabled,true);
$('#photoFile').files=[{type:'image/jpeg',size:30*1024*1024}];await context.test.compress();assert.equal(context.test.getPhoto(),null);
console.log('PASS: bounded list queries, authenticated atomic writes, compression size/dimension fallback, unsupported and oversized file rejection.');

