import test from 'node:test';
import assert from 'node:assert/strict';
import {seedOrderState,restoreOrderState,reduceOrder,orderSummary,orderEvidence,orderPack} from '../src/orders.mjs';

const orderStep=(s,type,extra={})=>reduceOrder(s,{type,...extra}).state;
const orderResolveInitial=s=>['width','unit','sample'].reduce((result,field)=>orderStep(result,'RESOLVE',{field}),s);
const orderApproved=()=>orderStep(orderResolveInitial(seedOrderState()),'APPROVE');

test('seed preserves missing unit, total width, limited sample approval and three independent blockers',()=>{
 const s=seedOrderState();assert.equal(orderSummary(s).unresolved,3);assert.equal(s.unit,null);
 assert.equal(s.width.totalCm,null);assert.equal(s.sample.bulkApproved,false);assert.deepEqual(s.sample.approvedScope,['navy_colour']);
 assert.equal(orderSummary(s).amount,null);assert.equal(s.delivery.promisedDate,null);
});
test('duplicate initial PO reuses existing records without increasing business or audit counts',()=>{
 const s=seedOrderState(),a=reduceOrder(s,{type:'IMPORT'});assert.equal(a.state,s);assert.equal(a.ok,true);
 assert.equal(Object.keys(a.state.evidence).length,4);assert.equal(a.state.imports.length,1);
 assert.equal(reduceOrder(s,{type:'IMPORT',hash:'unrecognised-file'}).ok,false);
});
test('human rejection of AI width equivalence preserves unknown and requires separate explicit reply',()=>{
 const a=orderStep(seedOrderState(),'CORRECT_WIDTH');assert.equal(a.issues[0].aiStatus,'rejected');
 assert.equal(a.issues[0].status,'open');assert.equal(a.width.usableCm,null);assert.equal(orderSummary(a).unresolved,3);
 const b=orderStep(a,'RESOLVE',{field:'width'});assert.equal(b.width.usableCm,150);assert.equal(b.width.totalCm,null);
 assert.equal(b.issues[0].correction.scope,b.id);assert.equal(b.issues[0].aiStatus,'rejected');
 assert.equal(b.evidence['width-reply'].classification,'customer_requirement');
});
test('accepting one fixture reply resolves only its field and never auto-approves',()=>{
 const s=orderStep(seedOrderState(),'RESOLVE',{field:'unit'});assert.equal(s.unit,'m');assert.equal(orderSummary(s).unresolved,2);
 assert.equal(s.issues.find(x=>x.id==='sample').status,'open');assert.equal(s.approval,null);
 assert.equal(reduceOrder(s,{type:'APPROVE'}).ok,false);assert.equal(reduceOrder(s,{type:'EXPORT'}).ok,false);
});
test('sample clarification preserves colour-only scope and does not invent bulk testing or acceptance',()=>{
 const s=orderStep(seedOrderState(),'RESOLVE',{field:'sample'});assert.equal(s.sample.scopeConfirmed,true);
 assert.equal(s.sample.bulkApproved,false);assert.deepEqual(s.sample.approvedScope,['navy_colour']);
 assert.equal(orderPack(s).status.goodsAccepted,false);
});
test('English draft contains current unresolved questions and never sends itself',()=>{
 const s=orderStep(seedOrderState(),'DRAFT');assert.match(s.draft.body,/usable width/);assert.match(s.draft.body,/quantity unit/);
 assert.match(s.draft.body,/limited to navy colour/);assert.equal(s.draft.sent,false);assert.equal(s.draft.valid,true);
 const r=orderStep(s,'RESOLVE',{field:'unit'});assert.equal(r.draft.valid,false);
 const next=orderStep(r,'DRAFT');assert.equal(next.draftHistory.length,1);assert.equal(next.draftHistory[0].valid,false);
 assert.doesNotMatch(next.draft.body,/Please confirm the quantity unit/);assert.equal(next.draft.valid,true);
});
test('internal approval, customer acceptance, exported file and ERP receipt are separate states',()=>{
 const a=orderApproved();assert.equal(orderSummary(a).currentApproved,true);assert.equal(orderSummary(a).currentAccepted,false);
 assert.equal(orderSummary(a).erpStatus,'not_exported');assert.equal(orderSummary(a).executionReady,false);
 const e=orderStep(a,'EXPORT');assert.equal(e.erp.status,'exported');assert.equal(e.erp.receipt,null);assert.equal(e.customerAcceptance,null);
 const ack=orderStep(e,'ERP_ACK');assert.equal(ack.erp.status,'acknowledged');assert.equal(ack.erp.receipt.status,'staged');
 assert.equal(ack.erp.receipt.executionStatus,'not_confirmed');assert.equal(orderPack(ack).status.executed,false);
 const accepted=orderStep(ack,'CUSTOMER_ACCEPT');assert.equal(accepted.customerAcceptance.version,1);
 assert.equal(orderSummary(accepted).executionReady,true);assert.equal(orderPack(accepted).status.payment,'unknown');
});
test('manual draft edits preserve original history and cannot edit stale or concurrently replaced drafts',()=>{
 const initial=seedOrderState();assert.equal(reduceOrder(initial,{type:'EDIT_DRAFT',text:'Hi'}).ok,false);
 const drafted=orderStep(initial,'DRAFT'),oldText=drafted.draft.body;
 const edited=orderStep(drafted,'EDIT_DRAFT',{text:'Reviewed wording',expectedDraftId:drafted.draft.id,expectedVersion:1});
 assert.equal(edited.draft.body,'Reviewed wording');assert.equal(edited.draft.sent,false);assert.equal(edited.draftHistory[0].body,oldText);
 assert.equal(reduceOrder(edited,{type:'EDIT_DRAFT',text:'stale edit',expectedDraftId:drafted.draft.id}).ok,false);
 assert.equal(reduceOrder(edited,{type:'EDIT_DRAFT',text:''}).ok,false);
 const stale=orderStep(edited,'RESOLVE',{field:'width'});assert.equal(reduceOrder(stale,{type:'DRAFT_EDIT',body:'stale overwrite'}).ok,false);
});
test('customer acceptance requires a complete internally checked version and loads explicit source',()=>{
 assert.equal(reduceOrder(seedOrderState(),{type:'CUSTOMER_ACCEPT'}).ok,false);
 assert.equal(reduceOrder(orderResolveInitial(seedOrderState()),{type:'CUSTOMER_ACCEPT'}).ok,false);
 const accepted=orderStep(orderApproved(),'CUSTOMER_ACCEPT');assert.ok(accepted.evidence['acceptance-v1']);
 assert.deepEqual(accepted.customerAcceptance.evidenceIds,['acceptance-v1']);
});
test('ERP receipt cannot precede export and exports are bound to approved business version',()=>{
 const a=orderApproved();assert.equal(reduceOrder(a,{type:'ERP_ACK'}).ok,false);
 const e=orderStep(a,'EXPORT');assert.equal(e.exports.length,1);assert.equal(e.exports[0].version,1);
 assert.equal(e.exports[0].snapshot.status.customerAccepted,false);
 const again=orderStep(e,'EXPORT');assert.deepEqual(again,e);
 const accepted=orderStep(e,'CUSTOMER_ACCEPT'),updated=orderStep(accepted,'EXPORT');
 assert.equal(updated.exports.length,2);assert.equal(updated.exports[1].snapshot.status.customerAccepted,true);
 assert.equal(updated.exports[0].snapshot.status.customerAccepted,false);
});
test('quantity revision invalidates related current decisions while preserving unrelated facts and immutable history',()=>{
 let s=orderStep(orderApproved(),'CUSTOMER_ACCEPT');s=orderStep(s,'DRAFT');s=orderStep(s,'EXPORT');s=orderStep(s,'ERP_ACK');
 const old=structuredClone(s),next=orderStep(s,'CHANGE');
 assert.equal(next.version,2);assert.equal(next.quantity,12000);assert.equal(next.unit,'m');
 assert.deepEqual(next.issues.slice(0,3),old.issues);assert.deepEqual(next.width,old.width);assert.deepEqual(next.sample,old.sample);
 assert.equal(next.approval,null);assert.equal(next.customerAcceptance,null);assert.equal(next.draft.valid,false);
 assert.equal(next.erp.status,'not_exported');assert.deepEqual(next.exports,old.exports);assert.deepEqual(next.approvals,old.approvals);
 assert.equal(next.versionHistory[0].erp.status,'acknowledged');assert.equal(next.price.status,'needs_reconfirmation');
 assert.equal(next.delivery.status,'needs_reconfirmation');assert.equal(orderSummary(next).amount,null);
 assert.equal(orderSummary(next).unresolved,2);assert.deepEqual(s,old);
});
test('revision 2 needs both reconfirmations before approval and never computes a shipment date from missing triggers',()=>{
 let s=orderStep(orderApproved(),'CHANGE');s=orderStep(s,'RESOLVE',{field:'change-price'});
 assert.equal(s.price.amount,2.35);assert.equal(reduceOrder(s,{type:'APPROVE'}).ok,false);
 s=orderStep(s,'RESOLVE',{field:'change-date'});s=orderStep(s,'APPROVE');
 assert.equal(s.approval.version,2);assert.equal(s.delivery.days,42);assert.equal(s.delivery.promisedDate,null);
 assert.equal(s.delivery.triggerDate,null);assert.equal(s.customerAcceptance,null);
 s=orderStep(s,'CUSTOMER_ACCEPT');assert.deepEqual(s.customerAcceptance.evidenceIds,['acceptance-v2']);
 assert.equal(orderSummary(s).amount,28200);
});
test('replayed action keys and repeat clicks never duplicate records or reset later revisions',()=>{
 let s=orderStep(seedOrderState(),'CORRECT_WIDTH',{key:'correct-1'});
 assert.deepEqual(orderStep(s,'CORRECT_WIDTH',{key:'correct-1'}),s);
 s=orderResolveInitial(s);assert.deepEqual(orderStep(s,'RESOLVE',{field:'unit'}),s);
 s=orderStep(s,'APPROVE');assert.deepEqual(orderStep(s,'APPROVE'),s);
 s=orderStep(s,'CHANGE',{key:'change-1'});assert.deepEqual(orderStep(s,'CHANGE'),s);
 assert.deepEqual(orderStep(s,'CHANGE',{key:'change-1',expectedVersion:1}),s);
});
test('stale expected versions block approvals, resolution and ERP effects after customer change',()=>{
 const s=orderStep(orderApproved(),'CHANGE');
 for(const type of ['APPROVE','RESOLVE','CUSTOMER_ACCEPT','EXPORT','ERP_ACK']){
  const result=reduceOrder(s,{type,field:'change-price',expectedVersion:1});assert.equal(result.ok,false);assert.equal(result.state,s);
 }
});
test('complaint links known evidence but batch, affected version, liability and settlement remain unknown',()=>{
 const s=orderStep(orderApproved(),'CLAIM_OPEN');assert.equal(s.claim.responsibility,'unknown');assert.equal(s.claim.affectedBatch,null);
 assert.equal(s.claim.orderVersion,null);assert.equal(s.claim.settlement,null);assert.ok(s.claim.evidenceIds.includes('sample-v1'));
 const next=orderStep(s,'CLAIM_REQUEST_EVIDENCE');assert.equal(next.claim.status,'awaiting_evidence');assert.equal(next.claim.closedAt,null);
 assert.equal(next.claim.requests[0].status,'draft_not_sent');assert.equal(next.claim.responsibility,'unknown');
 assert.deepEqual(orderStep(next,'CLAIM_REQUEST_EVIDENCE'),next);assert.equal(orderPack(next).status.goodsAccepted,false);
});
test('source reads and serializable export do not expose mutable state references',()=>{
 const s=orderApproved(),source=orderEvidence('po-v1',s),pack=orderPack(s);source.text='changed';pack.issues[0].decision.text='changed';
 assert.notEqual(s.evidence['po-v1'].text,'changed');assert.notEqual(s.issues[0].decision.text,'changed');
 assert.equal(orderEvidence('missing',s),null);assert.doesNotThrow(()=>JSON.stringify(pack));
});
test('restore rejects invalid storage and reset returns deterministic complete fixtures',()=>{
 const s=orderStep(orderApproved(),'CHANGE');assert.deepEqual(restoreOrderState(JSON.stringify(s)),s);
 assert.deepEqual(restoreOrderState('{oops'),seedOrderState());assert.deepEqual(restoreOrderState({schemaVersion:1}),seedOrderState());
 assert.deepEqual(restoreOrderState({...s,issues:[]}),seedOrderState());
 assert.deepEqual(orderStep(s,'RESET'),seedOrderState());
});
