import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const {rules}=JSON.parse(await readFile(new URL('../database.rules.json',import.meta.url)));
class Snapshot {
 constructor(tree,path=[]){this.tree=tree;this.path=path}
 val(){let v=this.tree;for(const k of this.path)v=v?.[k];return v??null}
 child(path){return new Snapshot(this.tree,[...this.path,...path.split('/')])}
 parent(){return new Snapshot(this.tree,this.path.slice(0,-1))}
 exists(){return this.val()!==null}
}
const now=1000000,uid='visitor';
const question={name:'방문자',question:'질문',uid,createdAt:now};
function allowed(auth,oldTree,newTree,type='questions',id='q'){
 return vm.runInNewContext(rules.community[type].$id['.write'],{auth,now,$id:id,root:new Snapshot(oldTree),data:new Snapshot(oldTree,['community',type,id]),newData:new Snapshot(newTree,['community',type,id])});
}
const valid={community:{questions:{q:question},rate:{[uid]:now}}};
assert.equal(allowed(null,{},valid),false);
assert.equal(allowed({uid},{},valid),true);
assert.equal(allowed({uid},{community:{rate:{[uid]:now-30000}}},valid),false);
assert.equal(allowed({uid},{},{community:{questions:{q:question}}}),false);
assert.equal(allowed({uid},{},{community:{questions:{q:{...question,answer:'사칭'}},rate:{[uid]:now}}}),false);
assert.equal(allowed({uid},valid,valid),false);
assert.equal(allowed({uid:'REPLACE_WITH_ADMIN_UID'},valid,valid),true);
assert.equal(allowed({uid},{},{community:{photos:{q:{}}}},'photos'),false);
assert.equal(allowed({uid:'REPLACE_WITH_ADMIN_UID'},{},{community:{photos:{q:{}}}},'photos'),true);
console.log('PASS: rule expression checks for owner writes, unauthenticated access, forged replies, existing-question edits and question cooldown. Firebase emulator/compiler not exercised.');

