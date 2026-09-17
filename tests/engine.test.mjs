import test from 'node:test';
import assert from 'node:assert/strict';
import {seedState,reduce,assessment,stats} from '../src/engine.mjs';
const step=(s,type,id,extra={})=>reduce(s,{type,id,...extra}).state;
test('continuous research needs no manual mission and does not duplicate a candidate',()=>{
 const s=seedState(),a=step(s,'DISCOVER'),b=step(a,'DISCOVER');
 assert.equal(a.accounts.length,s.accounts.length+1);assert.equal(b.accounts.length,a.accounts.length);assert.equal(s.accounts.length,6);
});
test('paused research and sending do not execute',()=>{
 let s=step(seedState(),'DRAFT','seabrook');s=step(s,'TOGGLE_RUN');
 assert.equal(step(s,'DISCOVER').accounts.length,6);assert.equal(step(s,'SEND','seabrook').drafts.seabrook.sent,false);
});
test('public signals never create explicit customer requirements or sales handoffs',()=>{
 const s=step(seedState(),'REVIEW','seabrook');assert.equal(stats(s).replies,0);assert.equal(stats(step(s,'HANDOFF','seabrook')).handoffs,0);
});
test('pure-linen requirement invalidates only related blend material',()=>{
 let s=step(seedState(),'DRAFT','lund');s=step(s,'DRAFT','seabrook');s=step(s,'PURE_REPLY','lund');
 assert.equal(s.drafts.lund.valid,false);assert.equal(s.drafts.seabrook.valid,true);assert.equal(assessment(s,'lund').kind,'gap');assert.equal(assessment(s,'seabrook').kind,'ready');
 assert.equal(step(s,'SEND','lund').drafts.lund.sent,false);
});
test('repeated replies do not inflate independent demand evidence',()=>{
 let s=step(seedState(),'PURE_REPLY','lund');s=step(s,'PURE_REPLY','lund');assert.equal(stats(s).gaps,1);
 s=step(s,'PURE_REPLY','rivage');assert.equal(stats(s).gaps,2);
});
test('confirmation makes a verified replacement available without silently sending',()=>{
 let s=step(seedState(),'DRAFT','lund');s=step(s,'PURE_REPLY','lund');s=step(s,'CONFIRM_PRODUCT');
 assert.equal(assessment(s,'lund').kind,'ready');assert.equal(s.drafts.lund.valid,false);assert.equal(stats(s).sent,0);
 s=step(s,'DRAFT','lund');assert.equal(s.drafts.lund.product,'HX-L210');assert.equal(s.drafts.lund.valid,true);
});
test('suppression survives new product confirmation',()=>{
 let s=step(seedState(),'PURE_REPLY','lund');s=step(s,'SUPPRESS','lund');s=step(s,'CONFIRM_PRODUCT');
 assert.equal(assessment(s,'lund').kind,'blocked');assert.equal(step(s,'DRAFT','lund').drafts.lund,undefined);
});
test('handoff requires explicit requirement and preserves original owner',()=>{
 let s=step(seedState(),'INTEREST_REPLY','seabrook');s=step(s,'HANDOFF','seabrook');
 assert.equal(s.handoffs.seabrook.owner,'陈雅');assert.equal(s.handoffs.seabrook.crm,'pending');assert.equal(assessment(s,'seabrook').kind,'handoff');
 s=step(s,'SYNC');assert.equal(s.handoffs.seabrook.crm,'synced');assert.equal(stats(step(s,'HANDOFF','seabrook')).handoffs,1);
});
test('send is idempotent and obeys quota',()=>{
 let s=step(seedState(),'DRAFT','seabrook');s=step(s,'SEND','seabrook');const v=s.version;
 s=step(s,'SEND','seabrook');assert.equal(s.version,v);s.settings.dailyLimit=1;s=step(s,'DRAFT','lund');
 assert.equal(step(s,'SEND','lund').drafts.lund.sent,false);
});
test('processed event key is applied once',()=>{
 let s=step(seedState(),'TOGGLE_RUN',undefined,{key:'pause-1'});s=step(s,'TOGGLE_RUN',undefined,{key:'pause-1'});assert.equal(s.running,false);
});
test('replies pause previously scheduled material without rewriting sent history',()=>{
 let s=step(seedState(),'DRAFT','lund');s=step(s,'SEND','lund');s=step(s,'PURE_REPLY','lund');
 assert.equal(s.drafts.lund.sent,true);assert.equal(s.drafts.lund.paused,true);assert.equal(s.drafts.lund.valid,false);
});
test('reset returns deterministic initial business records',()=>{
 let s=step(seedState(),'CONFIRM_PRODUCT');s=step(s,'DISCOVER');s=step(s,'RESET');assert.deepEqual(s,seedState());
});
test('new drafts preserve sent history and message counts',()=>{
 let s=step(seedState(),'DRAFT','lund');s=step(s,'SEND','lund');s=step(s,'PURE_REPLY','lund');s=step(s,'CONFIRM_PRODUCT');s=step(s,'DRAFT','lund');
 assert.equal(stats(s).sent,1);assert.equal(s.sentMessages[0].product,'HX-L240');assert.equal(s.draftHistory.length,1);assert.equal(s.drafts.lund.product,'HX-L210');
});
test('a reply pauses an unsent old followup and blocks sending it',()=>{
 let s=step(seedState(),'DRAFT','seabrook');s=step(s,'INTEREST_REPLY','seabrook');s=step(s,'SEND','seabrook');assert.equal(stats(s).sent,0);
});
test('conflicting product facts invalidate affected material until enterprise confirmation',()=>{
 let s=step(seedState(),'DRAFT','seabrook');s=step(s,'DRAFT','north');s=step(s,'CONFLICT_PRODUCT');
 assert.equal(s.drafts.seabrook.valid,false);assert.equal(s.drafts.north.valid,true);assert.equal(assessment(s,'seabrook').kind,'gap');
 s=step(s,'CONFIRM_PRODUCT','HX-L240');assert.equal(assessment(s,'seabrook').kind,'ready');assert.equal(s.drafts.seabrook.valid,false);
});
test('failed CRM sync preserves handoff and recovers without duplication',()=>{
 let s=step(seedState(),'INTEREST_REPLY','seabrook');s=step(s,'HANDOFF','seabrook');s=step(s,'SYNC_FAIL');
 assert.equal(s.handoffs.seabrook.crm,'pending');assert.equal(s.crmError,true);s=step(s,'SYNC');assert.equal(s.crmError,false);assert.equal(Object.keys(s.handoffs).length,1);
});
