import {creditAssessment} from './diligence.mjs';
import {stageIntake,resolveIntake} from './ingestion.mjs';
import { seedState, freshAccount } from './data.mjs';
export { seedState };
export function stats(s){return {researched:s.accounts.length,qualified:s.accounts.filter(a=>assessment(s,a.id).kind==='ready').length,replies:Object.keys(s.replies).length,handoffs:Object.keys(s.handoffs).length,knowledge:s.knowledge.length,gaps:Object.values(s.replies).filter(r=>r.kind==='pure').length,sent:s.sentMessages.length};}
export function assessment(s,id){
 const a=s.accounts.find(x=>x.id===id);if(!a)return null;
 const pure=s.replies[id]?.kind==='pure';const p=s.products.find(x=>x.id===(pure?'HX-L210':a.product));
 if(s.suppressed.includes(id))return {kind:'blocked',label:'已停止开发',product:p,reason:'已加入停止触达名单，后续资料更新不会自动解除。'};
 if(s.handoffs[id])return {kind:'handoff',label:'销售已接管',product:p,reason:'业务员已接受需求交接，自动触达保持暂停。'};
 if(p.conflict)return {kind:'gap',label:'产品资料需要核实',product:p,reason:'两份产品资料存在关键参数冲突，相关表述暂停，等待企业确认。'};
 if(!p.confirmed&&!pure)return {kind:'gap',label:'产品资料待确认',product:p,reason:'新导入资料尚未由负责人确认，暂不用于对外介绍。'};
 if(pure&&p.confirmed&&!/^(?:100\s*%\s*(?:亚麻|linen)|亚麻\s*100\s*%)$/i.test(p.composition.trim()))return {kind:'gap',label:'替代产品成分不符',product:p,reason:'已确认成分不是 100% 亚麻，不能继续用于该纯麻项目。'};
 if(pure&&!p.confirmed)return {kind:'gap',label:'现有方案不适合',product:p,reason:'客户当前项目明确要求 100% 亚麻，原棉麻混纺不符合要求。替代产品资料待确认。'};
 if(pure&&p.confirmed)return {kind:'ready',label:'已有替代产品',product:p,reason:'已确认的 HX-L210 为纯亚麻，可继续核实数量、颜色与采购安排。'};
 if(a.fit==='excluded')return {kind:'gap',label:'当前不适合',product:p,reason:a.note};
 if(a.fit==='research')return {kind:'research',label:'需要补充信息',product:p,reason:a.note};
 return {kind:'ready',label:s.replies[id]?'获得明确需求':'值得进一步联系',product:p,reason:a.note};
}
export function draftText(s,id){const a=s.accounts.find(x=>x.id===id),v=assessment(s,id),p=v.product;return `Hi ${a.contact.split(' / ')[0]},\n\nWe came across your collection and thought our ${p.en.toLowerCase()} might be relevant to your material selection.\n\nOur ${p.id} is ${p.composition.replace('亚麻','linen').replace('棉','cotton')}, ${p.weight}. We can share the confirmed product sheet for your review.\n\nCould you let us know whether your team selects fabrics directly, and what composition and application you are considering for this project?\n\nBest regards,\nYa Chen\nHesh Textile\n\n[Demo draft — no message has been sent]`;}
export function reduce(s,event){
 if(event.type==='RESET')return {state:seedState(),message:'已恢复初始演示数据'};
 if(event.key&&s.processed.includes(event.key))return {state:s,message:'该事件已处理，无需重复执行'};
 const n=structuredClone(s),a=n.accounts.find(x=>x.id===event.id);let message='';
 const log=(title,detail)=>n.events.unshift({id:`e-${n.version+1}-${n.events.length}`,title,detail,time:new Date().toISOString()});
 const know=(record)=>{if(!n.knowledge.some(x=>x.id===record.id))n.knowledge.unshift(record);};
 switch(event.type){
 case 'IMPORT_PRODUCTS':{const result=stageIntake(n,event.grid,event.mapping,event.source||'本地 CSV');if(!result.ok)return {state:s,message:result.message};message=result.message;log('企业产品资料已导入',message);break;}
 case 'RESOLVE_IMPORT':{const result=resolveIntake(n,event.id,event.accept===true);if(!result.ok)return {state:s,message:result.message};message=result.message;log('复核产品导入资料',event.id+' · '+message);know({id:'k-import-'+event.id+'-'+n.version,title:event.id+' 导入复核记录',body:message,type:'企业确认',source:'资料负责人 · 演示操作',scope:event.id,owner:'资料负责人'});break;}
 case 'CREDIT_REVIEW':{if(!a)return {state:s,message:'未找到客户'};n.creditReviews??={};if(n.creditReviews[a.id])return {state:s,message:'已提交财务复核，尚未授信'};const credit=creditAssessment(n,a.id);n.creditReviews[a.id]={status:'pending',reasons:credit.reasons,owner:'财务负责人'};message='已交财务复核，未批准额度或账期';log('回款背调进入财务复核',a.name);know({id:'k-credit-'+a.id,title:a.name+' 回款条件待财务复核',body:credit.tradeDecision,type:'复核任务',source:'演示背调资料',scope:a.name+' 当前拟议交易',owner:'财务负责人'});break;}
 case 'CREDIT_TERMS':n.creditTerms??={};n.creditTerms[event.id]=event.value;message='已更新交易条件测算情景，未批准交易';break;
 case 'TOGGLE_RUN':n.running=!n.running;message=n.running?'持续研究已恢复（演示）':'已暂停新的研究与模拟发送';log(message,'已发生的记录继续保留');break;
 case 'DISCOVER':
  if(!n.running)return {state:s,message:'系统已暂停，请先恢复运行'};
  if(n.discovered)return {state:s,message:'本轮演示研究已完成，正在等待新信息'};
  n.accounts.unshift(structuredClone(freshAccount));n.discovered=true;message='新增候选客户 Maison Aube，采购关系待核实';log('持续研究发现新候选客户','来源为演示观察；尚未确认采购需求');break;
 case 'REVIEW':
  if(!a)return {state:s,message:'未找到客户'};
  if(!n.reviewed.includes(a.id))n.reviewed.push(a.id);message='已记录销售认可，尚不代表客户有采购需求';log('销售认可目标客户',a.name);break;
 case 'DRAFT':{
  const v=assessment(n,event.id);
  if(!v||v.kind==='gap'||v.kind==='blocked'||v.kind==='handoff')return {state:s,message:v?.reason||'没有适用产品'};
  if(n.drafts[event.id]?.valid&&n.drafts[event.id]?.product===v.product.id)return {state:s,message:'已打开当前草稿'};
  if(n.drafts[event.id])n.draftHistory.push({account:event.id,...structuredClone(n.drafts[event.id])});
  n.drafts[event.id]={product:v.product.id,text:draftText(n,event.id),valid:true,sent:false,paused:false,revision:n.version+1};message='开发材料已准备，等待审核';log('准备了开发材料',a.name+' · '+v.product.id);break;}
 case 'SEND':{
  const d=n.drafts[event.id];
  if(!n.running)return {state:s,message:'系统已暂停，不能模拟发送'};
  if(n.suppressed.includes(event.id)||n.handoffs[event.id])return {state:s,message:'该客户已停止自动触达'};
  if(!d||!d.valid)return {state:s,message:'草稿已失效，请先更新产品依据'};
  if(d.paused)return {state:s,message:'客户已有反馈，旧跟进已暂停'};
  if(d.sent)return {state:s,message:'这份材料已经模拟发送，不会重复发送'};
  if(stats(n).sent>=n.settings.dailyLimit)return {state:s,message:'达到演示发送额度，等待下一轮'};
  d.sent=true;n.sentMessages.push({account:event.id,product:d.product,text:d.text,revision:d.revision,policyMode:n.settings.mode,simulated:true});message='已模拟发送，未向真实客户发送消息';log('模拟发送完成',a.name+' · 等待回复');break;}
 case 'PURE_REPLY':
  if(!a)return {state:s,message:'未找到客户'};
  if(n.replies[a.id]?.kind==='pure')return {state:s,message:'这条项目要求已记录'};
  n.replies[a.id]={kind:'pure',text:'Our current project requires 100% linen. We are not considering linen-cotton blends.',source:'模拟客户回复',project:'当前季项目'};
  a.fit='research';
  if(n.drafts[a.id]){n.drafts[a.id].valid=false;n.drafts[a.id].paused=true;}
  know({id:'k-pure-'+a.id,title:a.name+' 当前项目只接受纯亚麻',body:'原混纺推荐失效。该要求仅适用于当前项目，不自动成为永久客户偏好。',type:'明确需求',source:'模拟客户回复',scope:a.name+' 当前季项目',owner:a.owner});
  message='已更新项目要求，相关混纺材料已失效';log('客户要求改变了产品判断',a.name+' · 100% 亚麻');break;
 case 'INTEREST_REPLY':
  if(!a)return {state:s,message:'未找到客户'};
  if(n.replies[a.id])return {state:s,message:'已有客户反馈，请查看当前要求'};
  n.replies[a.id]={kind:'interest',text:'We select and purchase fabrics directly. Please share the HX-L240 product sheet for our trouser project. We are considering natural colours; quantity and timing will follow.',source:'模拟客户回复',project:'裤装项目'};
  a.buyer='客户回复确认直接选料与采购';
  if(n.drafts[a.id])n.drafts[a.id].paused=true;
  know({id:'k-interest-'+a.id,title:a.name+' 明确提出 HX-L240 选料需求',body:'客户确认直接采购；数量和时间待确认，交接给销售继续沟通。',type:'明确需求',source:'模拟客户回复',scope:a.name+' 裤装项目',owner:a.owner});
  message='收到明确需求，原自动跟进已暂停';log('客户提出明确选料需求',a.name);break;
 case 'CONFLICT_PRODUCT':{
  const p=n.products.find(x=>x.id==='HX-L240');p.conflict=true;p.confirmed=false;
  Object.values(n.drafts).filter(d=>d.product===p.id).forEach(d=>{d.valid=false;d.paused=true;});
  message='已模拟资料冲突，相关产品表述暂停';log('产品资料出现冲突','HX-L240 成分来源不一致，等待企业确认');break;}
 case 'CONFIRM_PRODUCT':{
  const p=n.products.find(x=>x.id===(event.id||'HX-L210'));if(!p)return {state:s,message:'未找到产品'};if(p.pendingImport)return {state:s,message:'请在产品接入中复核导入差异'};if(p.confirmed&&!p.conflict)return {state:s,message:'产品资料已确认'};
  p.confirmed=true;p.conflict=false;p.moq='自然色 300 m / 色';p.condition='数量、颜色与交期仍按项目确认';p.source='产品负责人确认 · 演示版本 v2';
  if(p.id==='HX-L210')n.gapStatus='已有产品可验证';
  know({id:'k-confirm-'+p.id,title:p.id+' 产品资料已确认',body:p.composition+'，'+p.weight+'。'+p.moq+'。此记录来自模拟负责人确认，不是 AI 推断。',type:'已确认事实',source:'产品负责人确认 · 演示',scope:p.id+' 自然色',owner:'产品负责人'});
  message='产品知识已更新，相关客户已重新评估';log('确认产品条件',p.id+' 相关客户重新评估，停止触达名单仍生效');break;}
 case 'HANDOFF':
  if(!n.replies[event.id])return {state:s,message:'尚无明确需求，不能作为销售交接'};
  if(['gap','blocked'].includes(assessment(n,event.id).kind))return {state:s,message:'仍有关键缺口，先完善交接依据'};
  if(n.handoffs[event.id])return {state:s,message:'销售已经接受交接'};
  n.handoffs[event.id]={accepted:true,owner:a.owner,crm:'pending',credit:{label:creditAssessment(n,event.id).label,approved:false,reviewOwner:'财务负责人'}};n.crmSynced=false;
  message='销售已接受，CRM 处于待同步状态';log('销售接受需求交接',a.name+' · '+a.owner);break;
 case 'SYNC_FAIL':
  n.crmError=true;n.crmSynced=false;Object.values(n.handoffs).forEach(h=>h.crm='pending');message='已模拟连接异常，交接保留为待同步';log('模拟 CRM 连接异常','已接受的交接未丢失，恢复后可重试');break;
 case 'SYNC':
  if(!Object.keys(n.handoffs).length)return {state:s,message:'暂无需要同步的交接'};
  Object.values(n.handoffs).forEach(h=>h.crm='synced');n.crmSynced=true;n.crmError=false;message='已模拟回写 CRM，原客户归属保留';log('模拟 CRM 回写完成','没有连接真实 CRM');break;
 case 'SUPPRESS':
  if(!a)return {state:s,message:'未找到客户'};
  if(!n.suppressed.includes(a.id))n.suppressed.push(a.id);
  if(n.drafts[a.id])n.drafts[a.id].paused=true;message='已停止该客户的触达';log('停止触达',a.name);break;
 case 'GAP_STATUS':n.gapStatus=event.value;message='已记录产品机会判断';log('产品机会状态更新',event.value);break;
 case 'SET_MODE':n.settings.mode=event.value;message='已更新演示运行设置';break;
 default:return {state:s,message:'未知操作'};
 }
 n.version++;if(event.key)n.processed.push(event.key);return {state:n,message};
}
