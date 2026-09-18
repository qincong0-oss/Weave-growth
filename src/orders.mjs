// Fictional, browser-local order workflow. No network, AI inference or ERP writes.
const orderClone = value => JSON.parse(JSON.stringify(value));
const orderTime = sequence => new Date(Date.UTC(2026,8,18,1,0,sequence)).toISOString();
const orderSource = (id,title,type,source,locator,text,classification='enterprise_confirmed') => ({
 id,title,type,source,locator,text,date:'2026-09-18',classification,fictional:true
});
const orderFixtures = {
 'po-v1':orderSource('po-v1','客户 PO · SA-0926 / Rev.1','purchase_order','Seabrook Atelier · 虚构客户','第 1 页，第 1 行','Item HX-W180 | Quantity: 10,000 | Width: total width 150 cm | Navy 6,000 / Stone 4,000. Quantity unit is not specified.','customer_requirement'),
 'quote-v1':orderSource('quote-v1','已确认报价 · Q-HX-0918','quotation','销售陈雅 · 演示资料','报价表，第 8–11 行','HX-W180; usable width 150 cm; quantity 10,000 m; USD 2.40/m. Lead time: 35 days after deposit receipt and all specifications confirmed. Applies to 10,000 m only.'),
 'spec-v1':orderSource('spec-v1','企业签认规格 · HX-W180-S2','specification','技术负责人林工 · 演示资料','规格 S2，幅宽与认可范围','HX-W180 梭织面料；180 g/m²；可用幅宽 150 cm。总幅与可用幅宽是不同字段。本演示未提供实测总幅。规格 S2 是约定依据，不是本批大货检测结果。'),
 'sample-v1':orderSource('sample-v1','客户样品回复 · S-NAVY-04','sample_approval','Seabrook Atelier · 虚构邮件','邮件正文，第 2 句','The navy colour on sample S-NAVY-04 is approved. No approval of shrinkage, hand feel, other performance or bulk lot is recorded.','customer_expression'),
 'width-reply':orderSource('width-reply','客户澄清 · 幅宽口径','customer_email','Seabrook Atelier · 预置演示回复','邮件正文，第 1 段','Please correct our PO: we require a usable width of 150 cm, as quoted. The PO wording "total width 150 cm" was incorrect. This reply does not specify the actual total width.','customer_requirement'),
 'unit-reply':orderSource('unit-reply','客户澄清 · 数量单位','customer_email','Seabrook Atelier · 预置演示回复','邮件正文，第 1 段','The total quantity is 10,000 linear metres (m): 6,000 m navy and 4,000 m stone. The PO omitted the unit.','customer_requirement'),
 'sample-reply':orderSource('sample-reply','客户澄清 · 样品认可范围','customer_email','Seabrook Atelier · 预置演示回复','邮件正文，第 1–2 段','Our approval of S-NAVY-04 is for navy colour only. The order specification is HX-W180-S2. This is not approval of bulk quality or other sample performance; conformity evidence is still required for the delivered lot.','customer_requirement'),
 'change-v2':orderSource('change-v2','客户修订 · SA-0926 / Rev.2','customer_email','Seabrook Atelier · 预置演示回复','邮件正文，第 1 段','Please increase the order from 10,000 m to 12,000 m. All previously clarified width and sample-scope requirements remain unchanged. Please reconfirm the price and lead time for the increased quantity.','customer_requirement'),
 'price-v2':orderSource('price-v2','销售重确认 · 12,000 m 报价','quotation','销售陈雅 · 预置内部确认','报价 Q-HX-0918-R2，第 1 行','For revision 2, total quantity 12,000 m: USD 2.35 per metre. This quotation applies only to the current order revision; customer acceptance must be recorded separately.'),
 'date-v2':orderSource('date-v2','跟单与技术重确认 · 条件交期','delivery_commitment','跟单周敏 / 林工 · 预置内部确认','确认记录 D-HX-R2，第 1 段','For 12,000 m: 42 calendar days after deposit receipt and all specifications confirmed. Neither trigger date is evidenced in this demo. No fixed shipment date has been confirmed.'),
 'acceptance-v1':orderSource('acceptance-v1','客户明确接受 · Rev.1','customer_email','Seabrook Atelier · 预置演示回复','邮件正文，第 1 段','We accept order HX-260918-01 revision 1: 10,000 m at USD 2.40/m, usable width 150 cm, specification HX-W180-S2 and colour-only scope of sample S-NAVY-04. Lead time is 35 days after deposit receipt and all specifications confirmed. This is order acceptance, not receipt or acceptance of delivered goods.','customer_acceptance'),
 'acceptance-v2':orderSource('acceptance-v2','客户明确接受 · Rev.2','customer_email','Seabrook Atelier · 预置演示回复','邮件正文，第 1 段','We accept order HX-260918-01 revision 2: 12,000 m at USD 2.35/m, usable width 150 cm, specification HX-W180-S2 and colour-only scope of sample S-NAVY-04. Lead time is 42 days after deposit receipt and all specifications confirmed. This does not acknowledge payment, delivery or bulk quality.','customer_acceptance'),
 'claim-email':orderSource('claim-email','客户客诉主张 · 批次待核实','customer_claim','Seabrook Atelier · 虚构售后情景','邮件正文，第 1 段','We believe part of the navy fabric has excessive shrinkage. Please investigate. Affected batch, test method, measured values and quantity are not yet provided.','customer_claim')
};
const orderIssue = (id,title,owner,customerText,enterpriseText,evidenceIds,aiSuggestion) => ({
 id,title,owner,severity:'critical',status:'open',customerText,enterpriseText,evidenceIds,
 aiSuggestion,aiStatus:'proposed',decision:null
});

export function seedOrderState(){
 const evidence={};
 for(const id of ['po-v1','quote-v1','spec-v1','sample-v1']) evidence[id]=orderClone(orderFixtures[id]);
 return {
  schemaVersion:1,demo:true,id:'HX-260918-01',customer:{id:'seabrook',name:'Seabrook Atelier'},
  product:{id:'HX-W180',name:'180 g/m² 梭织面料'},version:1,sequence:0,quantity:10000,unit:null,
  width:{usableCm:null,totalCm:null},sample:{id:'S-NAVY-04',approvedScope:['navy_colour'],bulkApproved:false,specificationId:'HX-W180-S2',scopeConfirmed:false},
  price:{amount:2.4,currency:'USD',unit:'m',status:'confirmed',sourceId:'quote-v1',appliesToQuantity:10000},
  delivery:{days:35,trigger:'定金到账且全部规格确认',triggerDate:null,promisedDate:null,status:'conditional',sourceId:'quote-v1'},
  issues:[
   orderIssue('width','150 cm 相同，幅宽口径不同','技术 · 林工','PO：总幅 150 cm','报价 / 规格：可用幅宽 150 cm',['po-v1','quote-v1','spec-v1'],'AI 候选：数值同为 150 cm，可能等价。此建议未经确认，不能通过核对。'),
   orderIssue('unit','10,000 的数量单位缺失','跟单 · 周敏','PO：Quantity 10,000，未写单位','报价：10,000 m',['po-v1','quote-v1'],'按报价推测为米，但 PO 需要客户明确澄清。'),
   orderIssue('sample','认可颜色，不等于认可所有性能','销售 · 陈雅','邮件仅认可 S-NAVY-04 的藏青色','规格 S2 与大货质量需要分别确认',['sample-v1','spec-v1'],'保留颜色认可，不把它扩大为缩水、手感或大货认可。')
  ],
  evidence,imports:[{id:'po-v1',hash:'demo:SA-0926:rev1',version:1}],draft:null,draftHistory:[],
  approval:null,approvals:[],customerAcceptance:null,customerAcceptances:[],
  erp:{status:'not_exported',version:null,exportId:null,receipt:null},exports:[],
  history:[{id:'oe-0',type:'SEEDED',message:'已载入四份虚构资料；三个关键问题等待确认。',version:1,at:orderTime(0),actor:'演示初始化'}],
  versionHistory:[],processedKeys:[],claim:null
 };
}

export function restoreOrderState(cached){
 // Reject incompatible or partial storage instead of silently merging missing facts.
 try {
  const parsed=typeof cached==='string'?JSON.parse(cached):cached;
  if(!parsed || parsed.schemaVersion!==1 || parsed.id!=='HX-260918-01' || ![1,2].includes(parsed.version)) return seedOrderState();
  const requiredArrays=['issues','imports','draftHistory','approvals','customerAcceptances','exports','history','versionHistory','processedKeys'];
  if(requiredArrays.some(key=>!Array.isArray(parsed[key])) || !parsed.evidence || !parsed.erp || !parsed.width || !parsed.sample || !parsed.price || !parsed.delivery || !parsed.customer || !parsed.product) return seedOrderState();
  const requiredIssues=['width','unit','sample',...(parsed.version===2?['change-price','change-date']:[])];
  if(requiredIssues.some(id=>parsed.issues.filter(issue=>issue?.id===id).length!==1) || parsed.issues.some(issue=>!['open','resolved'].includes(issue.status) || !Array.isArray(issue.evidenceIds))) return seedOrderState();
  if(!Number.isInteger(parsed.sequence) || parsed.sequence<0 || parsed.quantity!==(parsed.version===1?10000:12000) || ![null,'m'].includes(parsed.unit)) return seedOrderState();
  return orderClone(parsed);
 } catch { return seedOrderState(); }
}

export function orderSummary(state){
 const blocking=state.issues.filter(issue=>issue.status!=='resolved');
 const currentApproved=Boolean(state.approval && state.approval.version===state.version);
 const currentAccepted=Boolean(state.customerAcceptance && state.customerAcceptance.version===state.version);
 const ready=blocking.length===0;
 return {unresolved:blocking.length,blocking,ready,currentApproved,currentAccepted,
  erpStatus:state.erp.version===state.version?state.erp.status:'not_exported',
  canApprove:ready&&!currentApproved,canExport:ready&&currentApproved,
  executionReady:ready&&currentApproved&&currentAccepted,
  quantityText:`${state.quantity.toLocaleString('en-US')} ${state.unit || '（单位待确认）'}`,
  versionLabel:`Rev.${state.version}`,claimOpen:Boolean(state.claim&&state.claim.status!=='closed'),
  sourceCount:Object.keys(state.evidence).length,
  amount:state.unit==='m'&&state.price.status==='confirmed'?Number((state.quantity*state.price.amount).toFixed(2)):null
 };
}

export function orderEvidence(id,state){
 return state.evidence[id]?orderClone(state.evidence[id]):null;
}

function orderAudit(state,event,message,extra={}){
 state.sequence+=1;
 state.history.push({id:`oe-${state.sequence}`,type:event.type,message,version:state.version,at:orderTime(state.sequence),actor:event.actor||'演示操作',...extra});
 if(event.key) state.processedKeys.push(event.key);
}
function orderResult(state,message,ok=true){return {state,message,ok};}
function orderAddEvidence(state,id){state.evidence[id]=orderClone(orderFixtures[id]);}
function orderStaleDraft(state,reason){
 if(state.draft?.valid){state.draft.valid=false;state.draft.status='stale';state.draft.staleReason=reason;}
}
function orderDraftBody(state){
 const unresolved=state.issues.filter(issue=>issue.status!=='resolved');
 const lines={
  width:'Please confirm whether 150 cm means usable width. Your PO states total width; our quotation specifies usable width.',
  unit:'Please confirm the quantity unit. The PO states 10,000 without a unit; our quotation uses linear metres (m).',
  sample:'Please confirm that approval of S-NAVY-04 is limited to navy colour and that HX-W180-S2 is the order specification. Bulk-quality approval has not been recorded.',
  'change-price':'We are reconfirming the price applicable to 12,000 m. Please do not rely on the previous quantity quotation.',
  'change-date':'We are reconfirming lead time for 12,000 m. A fixed shipment date is not yet confirmed.'
 };
 const body=unresolved.length?unresolved.map((issue,i)=>`${i+1}. ${lines[issue.id]}`).join('\n\n'):
  `Please confirm revision ${state.version}: ${state.quantity.toLocaleString('en-US')} m of HX-W180 at USD ${state.price.amount.toFixed(2)}/m; usable width 150 cm; specification HX-W180-S2. Sample S-NAVY-04 approval is limited to navy colour. Lead time: ${state.delivery.days} days after deposit receipt and all specifications confirmed. No fixed shipment date or bulk-quality acceptance is recorded.`;
 return `Subject: Clarification / confirmation — HX-260918-01 Rev.${state.version}\n\nDear Seabrook Atelier team,\n\n${body}\n\nPlease reply with your explicit confirmation or corrections.\n\nBest regards,\nChen Ya\n\n[Demo draft — not sent]`;
}

export function orderPack(state){
 const summary=orderSummary(state);
 return orderClone({
  schema:'weave.order-confirmation/1',demo:true,notice:'虚构资料；浏览器本地演示。导出不代表客户接受、ERP 执行、发货或回款。',
  id:state.id,version:state.version,sequence:state.sequence,customer:state.customer,product:state.product,
  order:{quantity:state.quantity,unit:state.unit,width:state.width,sample:state.sample,price:state.price,delivery:state.delivery},
  status:{internalApproved:summary.currentApproved,customerAccepted:summary.currentAccepted,erp:summary.erpStatus,
   allRequiredConfirmationsPresent:summary.executionReady,executed:false,goodsAccepted:false,payment:'unknown'},
  issues:state.issues,approval:state.approval,customerAcceptance:state.customerAcceptance,erp:state.erp,
  evidence:state.evidence,draft:state.draft,draftHistory:state.draftHistory,
  approvalHistory:state.approvals,customerAcceptanceHistory:state.customerAcceptances,
  exportHistory:state.exports.map(({snapshot,...record})=>record),versionHistory:state.versionHistory,
  claim:state.claim,history:state.history
 });
}

export function reduceOrder(previous,event={}){
 if(event.type==='RESET') return orderResult(seedOrderState(),'已重置订单演示。');
 if(event.key && previous.processedKeys.includes(event.key)) return orderResult(previous,'该操作已记录，没有重复执行。');
 if(event.expectedVersion!==undefined && event.expectedVersion!==previous.version) return orderResult(previous,'订单版本已变化，请刷新后基于当前版本操作。',false);
 const state=orderClone(previous);
 const summary=orderSummary(state);
 let message='';
 switch(event.type){
 case 'IMPORT': {
  const hash=event.hash||'demo:SA-0926:rev1';
  if(state.imports.some(item=>item.hash===hash)) return orderResult(previous,'相同 PO 已接收：复用现有订单与证据，没有重复建单。');
  return orderResult(previous,'此演示仅提供预置 PO；没有读取或识别任意企业文件。',false);
 }
 case 'CORRECT_WIDTH': {
  const issue=state.issues.find(item=>item.id==='width');
  if(issue.status==='resolved') return orderResult(previous,'幅宽已有明确回复；当前决定保持不变。');
  if(issue.aiStatus==='rejected') return orderResult(previous,'人工纠正已记录，仍等待客户明确口径。');
  issue.aiStatus='rejected';
  issue.correction={text:'总幅不等于可用幅宽。拒绝按相同数值直接判定一致，需客户澄清。',by:'技术 · 林工（演示）',version:state.version,at:orderTime(state.sequence+1),scope:state.id};
  orderStaleDraft(state,'幅宽建议已由技术人员纠正，草稿需复核。');
  message='已保存人工纠正：幅宽仍待澄清；这条决定仅适用于当前订单。';
  break;
 }
 case 'RESOLVE': {
  const issue=state.issues.find(item=>item.id===event.field);
  if(!issue) return orderResult(previous,'没有找到本版本的待确认事项。',false);
  if(issue.status==='resolved') return orderResult(previous,'该事项已确认，没有重复创建记录。');
  const resolutions={
   width:{source:'width-reply',by:'技术 · 林工（演示）',text:'客户明确更正为可用幅宽 150 cm；实际总幅仍未提供。'},
   unit:{source:'unit-reply',by:'跟单 · 周敏（演示）',text:'客户明确数量单位为米（m）。'},
   sample:{source:'sample-reply',by:'销售 · 陈雅（演示）',text:'样品仅认可藏青颜色；订单规格引用 S2，未扩大为其他性能或大货认可。'},
   'change-price':{source:'price-v2',by:'销售 · 陈雅（演示）',text:'12,000 m 的报价重新确认为 USD 2.35/m，仍需客户接受当前版本。'},
   'change-date':{source:'date-v2',by:'跟单 · 周敏 / 林工（演示）',text:'交期重新确认为定金到账且规格确认后 42 天；触发日期未知，固定出运日未知。'}
  };
  const resolution=resolutions[event.field];
  orderAddEvidence(state,resolution.source);
  issue.evidenceIds.push(resolution.source);
  issue.status='resolved';
  issue.decision={text:resolution.text,by:resolution.by,version:state.version,at:orderTime(state.sequence+1),evidenceIds:[resolution.source],scope:state.id};
  if(event.field==='width')state.width.usableCm=150;
  if(event.field==='unit')state.unit='m';
  if(event.field==='sample')state.sample.scopeConfirmed=true;
  if(event.field==='change-price')state.price={amount:2.35,currency:'USD',unit:'m',status:'confirmed',sourceId:'price-v2',appliesToQuantity:12000};
  if(event.field==='change-date')state.delivery={days:42,trigger:'定金到账且全部规格确认',triggerDate:null,promisedDate:null,status:'conditional',sourceId:'date-v2'};
  orderStaleDraft(state,'收到新的明确依据，原草稿需要重新生成或复核。');
  message=`已载入预置确认材料：${resolution.text}`;
  break;
 }
 case 'DRAFT': {
  if(state.draft?.valid && state.draft.version===state.version) return orderResult(previous,'当前版本已有有效草稿，尚未对外发送。');
  if(state.draft)state.draftHistory.push(orderClone(state.draft));
  state.draft={id:`draft-${state.version}-${state.sequence+1}`,version:state.version,valid:true,status:'draft',body:orderDraftBody(state),sent:false,at:orderTime(state.sequence+1),evidenceIds:Object.keys(state.evidence)};
  message='已生成英文草稿，依据和版本已记录；没有发送邮件。';
  break;
 }
 case 'EDIT_DRAFT':
 case 'DRAFT_EDIT': {
  if(!state.draft || !state.draft.valid || state.draft.version!==state.version)return orderResult(previous,'草稿不存在或已失效，请先基于当前资料重新生成。',false);
  if(event.expectedDraftId!==undefined && event.expectedDraftId!==state.draft.id)return orderResult(previous,'草稿已有更新，请重新打开当前草稿再编辑。',false);
  const body=event.text??event.body;
  if(typeof body!=='string' || !body.trim() || body.length>12000)return orderResult(previous,'请输入 1–12,000 个字符的草稿内容。',false);
  if(body===state.draft.body)return orderResult(previous,'草稿内容未变化。');
  state.draftHistory.push(orderClone(state.draft));
  state.draft={...state.draft,id:`draft-${state.version}-${state.sequence+1}`,body,editedBy:'销售 · 陈雅（演示）',editedAt:orderTime(state.sequence+1),manualEdited:true};
  message='已保存人工修改，旧草稿保留在历史中；没有发送邮件。';
  break;
 }
 case 'APPROVE': {
  if(!summary.ready)return orderResult(previous,`还有 ${summary.unresolved} 个关键问题未解决，不能内部批准。`,false);
  if(summary.currentApproved)return orderResult(previous,'当前版本已内部审核，无需重复批准。');
  state.approval={id:`approval-v${state.version}`,version:state.version,by:'跟单负责人 · 演示审核',at:orderTime(state.sequence+1),scope:'订单字段及确认依据',evidenceIds:Object.keys(state.evidence)};
  state.approvals.push(orderClone(state.approval));
  message=`Rev.${state.version} 已内部审核。客户接受与 ERP 导入状态分别记录。`;
  break;
 }
 case 'CUSTOMER_ACCEPT': {
  if(!summary.ready || !summary.currentApproved)return orderResult(previous,'先解决关键问题并完成当前版本的内部审核，再记录明确客户接受。',false);
  if(summary.currentAccepted)return orderResult(previous,'当前版本客户接受已记录，没有重复处理邮件。');
  const evidenceId=`acceptance-v${state.version}`;
  orderAddEvidence(state,evidenceId);
  state.customerAcceptance={id:`accept-v${state.version}`,version:state.version,by:'Seabrook Atelier（虚构客户）',at:orderTime(state.sequence+1),evidenceIds:[evidenceId],scope:'当前订单商业与规格条件；不含实物验收'};
  state.customerAcceptances.push(orderClone(state.customerAcceptance));
  message='已载入客户明确接受的演示邮件；不代表发货、大货验收或回款。';
  break;
 }
 case 'EXPORT': {
  if(!summary.canExport)return orderResult(previous,'关键问题未解决或本版本未经内部审核，不能导出已审确认包。',false);
  const approvalKey=state.approval.id;
  const acceptanceKey=state.customerAcceptance?.version===state.version?state.customerAcceptance.id:'pending';
  const same=state.exports.find(item=>item.version===state.version && item.approvalKey===approvalKey && item.acceptanceKey===acceptanceKey);
  if(same)return orderResult(previous,'当前确认状态的导出记录已存在，可再次下载；没有重复生成执行记录。');
  const id=`export-${state.version}-${state.sequence+1}`;
  state.exports.push({id,version:state.version,approvalKey,acceptanceKey,at:orderTime(state.sequence+1),customerAccepted:summary.currentAccepted,snapshot:orderPack(state)});
  state.erp={status:'exported',version:state.version,exportId:id,receipt:null};
  message='演示确认包已生成；ERP 尚未收到导入回执。';
  break;
 }
 case 'ERP_ACK': {
  if(!summary.canExport || state.erp.version!==state.version || !state.erp.exportId)return orderResult(previous,'先导出当前已审版本，再记录对应的模拟导入回执。',false);
  if(state.erp.status==='acknowledged')return orderResult(previous,'该导出已有模拟导入回执，没有重复建单。');
  state.erp.status='acknowledged';
  state.erp.receipt={id:`ERP-DEMO-${state.erp.exportId}`,at:orderTime(state.sequence+1),version:state.version,exportId:state.erp.exportId,simulated:true,status:'staged',executionStatus:'not_confirmed'};
  message='已记录模拟 ERP 导入回执；这里只确认资料暂存，没有执行真实订单。';
  break;
 }
 case 'CHANGE': {
  if(state.version===2)return orderResult(previous,'Rev.2 的修订邮件已处理，没有重复变更。');
  if(!summary.ready)return orderResult(previous,'先完成三个原始事项的确认，再演示数量变更影响。',false);
  state.versionHistory.push({version:state.version,quantity:state.quantity,unit:state.unit,price:orderClone(state.price),delivery:orderClone(state.delivery),approval:orderClone(state.approval),customerAcceptance:orderClone(state.customerAcceptance),erp:orderClone(state.erp),draft:orderClone(state.draft),at:orderTime(state.sequence+1)});
  state.version=2;state.quantity=12000;
  orderAddEvidence(state,'change-v2');state.imports.push({id:'change-v2',hash:'demo:SA-0926:rev2',version:2});
  state.price={...state.price,status:'needs_reconfirmation'};
  state.delivery={...state.delivery,status:'needs_reconfirmation'};
  state.issues.push(
   orderIssue('change-price','数量增加，原价格适用范围失效','销售 · 陈雅','客户新需求：12,000 m','原报价只覆盖 10,000 m',['change-v2','quote-v1'],'不能沿用旧数量的价格；需销售重新确认。'),
   orderIssue('change-date','增量订单的交期需要重确认','跟单 · 周敏','客户新需求：12,000 m','原交期条件只针对 10,000 m',['change-v2','quote-v1'],'需要跟单与技术重新确认；不推算固定出运日期。')
  );
  orderStaleDraft(state,'客户数量改为 12,000 m；价格及交期必须重新确认。');
  state.approval=null;state.customerAcceptance=null;
  state.erp={status:'not_exported',version:null,exportId:null,receipt:null};
  message='已载入 Rev.2：数量变为 12,000 m。价格、交期、批准及草稿需重确认；幅宽、单位和样品范围决定保留，历史导出未改写。';
  break;
 }
 case 'CLAIM_OPEN': {
  if(state.claim)return orderResult(previous,'客诉情景已登记，继续使用现有案件。');
  orderAddEvidence(state,'claim-email');
  state.claim={id:'CLM-HX-001',status:'open',responsibility:'unknown',claimText:'客户主张部分藏青面料缩水偏大，尚无批次、数量或检测依据。',affectedBatch:null,affectedQuantity:null,owner:'售后 · 周敏',orderId:state.id,orderVersion:null,referenceVersion:state.version,
   scenario:'未来售后情景；当前没有实际发货记录，涉及批次和生效版本待核实。',
   evidenceIds:['claim-email','sample-v1','spec-v1',...(['sample-reply'].filter(id=>state.evidence[id]))],
   missingEvidence:['发货批次及所对应的订单版本','受影响数量与单位','检测方法、条件及实测数据','同批次验货 / 出运记录'],
   requests:[],settlement:null,closedAt:null};
  message='已打开虚构客诉情景并关联原始依据；责任与批次保持未知，没有自动结案。';
  break;
 }
 case 'CLAIM_REQUEST_EVIDENCE': {
  if(!state.claim)return orderResult(previous,'先登记客诉情景，再形成补证清单。',false);
  if(state.claim.status==='awaiting_evidence')return orderResult(previous,'补证事项已分派，没有重复创建提醒。');
  state.claim.status='awaiting_evidence';
  state.claim.requests.push({id:'claim-request-1',owner:'售后 · 周敏',items:orderClone(state.claim.missingEvidence),status:'draft_not_sent',at:orderTime(state.sequence+1)});
  message='已形成补证清单并分派售后；没有发送邮件、承认责任、赔付或结案。';
  break;
 }
 default:return orderResult(previous,'未知订单操作，未改变任何记录。',false);
 }
 orderAudit(state,event,message);
 return orderResult(state,message);
}
