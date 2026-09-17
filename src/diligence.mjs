// All company-specific records below are fictional demo fixtures, not live bureau data.
export const creditAsOf = '2026-09-17';
export const creditMethods = [
 {id:'advance',name:'全额预付',deposit:100,note:'到账后再安排交付；仍需确认合同、付款主体与质量约定。'},
 {id:'split',name:'30% 预付 / 70% 出货前',deposit:30,note:'尾款到账前不放货；定染、后整理等前期投入仍有买方取消或拒收风险。'},
 {id:'oa30',name:'赊销 OA 30 天',deposit:0,note:'发货后形成应收，需审批交易对手、账期和额度，并核实保险条件。'},
 {id:'oa60',name:'赊销 OA 60 天',deposit:0,note:'长账期增加资金占用；已有逾期或额度不足时，先交财务复核。'},
 {id:'lc',name:'即期信用证',deposit:0,note:'待银行审核开证行、条款与单据要求；不因选择信用证就视为保证收款。'}
];
const northLedger = [
 {id:'DEMO-N101',amount:5000,paid:5000,due:'2026-06-10',paidAt:'2026-06-10',currency:'EUR',note:'全额到账'},
 {id:'DEMO-N102',amount:8000,paid:8000,due:'2026-07-10',paidAt:'2026-07-20',currency:'EUR',note:'延迟 10 天到账'},
 {id:'DEMO-N103',amount:4200,paid:0,due:'2026-08-30',paidAt:null,currency:'EUR',note:'质量扣款争议尚未确认'},
 {id:'DEMO-N104',amount:9600,paid:0,due:'2026-09-30',paidAt:null,currency:'EUR',note:'未到期'}
];
export function overdueDays(due,asOf=creditAsOf){return Math.max(0,Math.floor((Date.parse(asOf+'T00:00:00Z')-Date.parse(due+'T00:00:00Z'))/86400000));}
export function ledgerSummary(rows,asOf=creditAsOf,currency='EUR'){
 const items=rows.filter(x=>x.currency===currency),paid=items.filter(x=>x.paid>=x.amount&&x.paidAt);
 const open=items.filter(x=>x.amount>x.paid),late=open.filter(x=>overdueDays(x.due,asOf)>0);
 return {currency,total:items.length,settled:paid.length,receivables:open.reduce((v,x)=>v+x.amount-x.paid,0),overdue:late.reduce((v,x)=>v+x.amount-x.paid,0),oldest:Math.max(0,...late.map(x=>overdueDays(x.due,asOf))),onTime:paid.length?Math.round(paid.filter(x=>x.paidAt<=x.due).length/paid.length*100):null,averageLate:paid.length?paid.reduce((v,x)=>v+overdueDays(x.due,x.paidAt),0)/paid.length:null,otherCurrencies:[...new Set(rows.filter(x=>x.currency!==currency).map(x=>x.currency))]};
}
export function creditProfile(s,id){
 const a=s.accounts.find(x=>x.id===id);if(!a)return null;
 const established=id==='north',known=['north','lund','seabrook'].includes(id);
 return {id,legalName:a.name+(id==='seabrook'?' Ltd':id==='north'?' AB':id==='lund'?' ApS':' · 法律名称待补全'),registration:known?'DEMO-'+id.toUpperCase():'未取得注册编号',country:a.country,identity:known?'示例登记资料已比对':'主体资料待核实',identityVerified:known,payerVerified:established,ownership:'实际控制人与集团担保关系未核实',incorporated:id==='seabrook'?'2018 年（示例）':'成立年份待补充',domain:id==='seabrook'?'seabrook.example · 示例域名':'域名归属待补充',directBuyer:id==='elta'?false:!!s.replies[id]||established,ledgerAvailable:known,ledger:established?structuredClone(northLedger):[],financials:established?{year:'2025',currency:'EUR',revenue:1250000,previousRevenue:1480000,currentAssets:480000,currentLiabilities:560000,equity:90000,operatingCashFlow:-45000,audited:false}:null,internalLimit:established?20000:null,insurance:'尚无可使用的已核准买方额度',legal:id==='rivage'?'存在同名线索，主体关联待排除':'查询范围未完整覆盖，结论待补充',legalPotential:id==='rivage',trade:known?'公开系列支持产品用途研究，未取得已核实提单':'贸易数据未接入',bank:'付款方、合同买方与银行账户需独立核对；变更账户须通过既有联系方式复核',asOf:creditAsOf,reviewRequested:!!s.creditReviews?.[id]};
}
export function creditAssessment(s,id){
 const p=creditProfile(s,id);if(!p)return null;
 const l=ledgerSummary(p.ledger),reasons=[];
 if(!p.identityVerified)reasons.push('法律主体及注册编号尚未核实');
 if(!p.payerVerified)reasons.push('合同买方与实际付款方的一致性待确认');
 if(l.overdue)reasons.push('本企业存在逾期应收，需先核对回款及争议原因');
 if(!p.financials)reasons.push('尚未取得可核验财务资料');
 if(p.financials?.operatingCashFlow<0)reasons.push('示例财报经营现金流为负，且未经审计');
 if(p.legalPotential)reasons.push('同名法律风险线索尚未排除');
 reasons.push('保险有效范围与买方额度未确认');
 return {profile:p,ledger:l,level:l.overdue||p.legalPotential?'review':'incomplete',label:l.overdue?'逾期优先复核':p.legalPotential?'主体风险待核实':'账期依据待补齐',tradeDecision:l.overdue?'暂停新增赊销，保留业务沟通':'可继续了解需求，暂不据此批准赊销',reasons,approved:false};
}
export function exposurePreview(s,id,methodId='split'){
 const r=creditAssessment(s,id),method=creditMethods.find(x=>x.id===methodId)||creditMethods[1],order=20000;
 const newUnpaid=order*(1-method.deposit/100),total=r.ledger.receivables+newUnpaid;
 return {method,order,newUnpaid,total,limit:r.profile.internalLimit,excess:r.profile.internalLimit===null?null:Math.max(0,total-r.profile.internalLimit)};
}
export function creditEvidence(s,id){
 const p=creditProfile(s,id);return [
 {id:'registry',title:'主体登记与历史变更',status:p.identityVerified?'示例已比对':'待获取',source:'企业登记摘录 · 演示文件',scope:p.country+' · 指定法律主体',date:'2026-09-15',detail:p.identity+'；注册号 '+p.registration+'。存续状态只说明登记状态，不能证明偿付能力。'},
 {id:'ledger',title:'本企业应收与回款',status:p.ledgerAvailable?'示例已接入':'未接入',source:'ERP 应收 / 到账核销快照 · 演示文件',scope:'本企业客户往来 · EUR · 不代表全市场付款表现',date:creditAsOf,detail:p.ledger.length?'4 笔往来：含一笔到期未核销应收。需核对到账在途、退货与扣款。':'当前样本中未找到已核销交易；没有交易记录不等于没有拖欠风险。'},
 {id:'finance',title:'财务与偿债能力',status:p.financials?'买方提供，待核验':'未取得',source:'买方财务报表 · 演示资料',scope:p.financials?'2025 财年 · EUR · 未审计':'待确认报表主体、年度、币种及审计情况',date:p.financials?'2026-04-30':'—',detail:'关注收入趋势、经营现金流、流动负债与净资产；集团数据不能自动代替签约主体数据。'},
 {id:'legal',title:'诉讼、破产与名单筛查',status:p.legalPotential?'同名待排除':'覆盖不足',source:'登记 / 司法 / 制裁查询计划 · 未连接实时数据库',scope:'按司法辖区、名单版本及主体标识分别核验',date:'—',detail:p.legal+'。未检索到、未覆盖、无法访问与已排除须分别记录；名称相似不能直接判定为命中。'},
 {id:'trade',title:'采购链与贸易活动',status:'待核实',source:'官网系列观察 / 历史沟通 · 演示资料',scope:'品牌、贸易商、成衣厂与进口商关系',date:'2026-09-14',detail:p.trade+'。品牌名、提单收货人和付款义务人不能自动视为同一主体，提单也不能证明已付款。'},
 {id:'insurance',title:'资信报告与保险额度',status:'待申请',source:'中国信保 / 商业资信服务 · 真实报告未接入',scope:'具体买方、币种、有效期、账期与保单条件',date:'—',detail:p.insurance+'。授信、承保与理赔均不能由 Demo 自动批准。'},
 {id:'payer',title:'付款主体与账户核验',status:p.payerVerified?'示例历史关系一致':'待核实',source:'合同 / 发票 / 银行到账资料 · 演示文件',scope:'当前订单及签约实体；付款路径变更后重新核验',date:p.payerVerified?'2026-09-16':'—',detail:p.bank}
 ];
}
