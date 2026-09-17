export const products = [
 {id:'HX-L240',name:'自然肌理棉麻',en:'Linen Cotton Canvas',composition:'55% 亚麻 / 45% 棉',weight:'240 g/㎡',width:'145 cm',moq:'自然色 300 m / 色',condition:'定染起订量另行确认',use:'女装外套 · 裤装 · 自然风系列',tone:'oat',confirmed:true,source:'产品技术卡 v2 · 资料负责人确认'},
 {id:'HX-C180',name:'轻柔水洗全棉',en:'Washed Cotton Poplin',composition:'100% 棉',weight:'180 g/㎡',width:'150 cm',moq:'现货 200 m / 色',condition:'颜色及可用数量需复核',use:'衬衫 · 轻量连衣裙',tone:'sage',confirmed:true,source:'产品技术卡 v1 · 资料负责人确认'},
 {id:'HX-L210',name:'轻盈纯亚麻',en:'Pure Linen Collection',composition:'100% 亚麻',weight:'210 g/㎡',width:'140 cm',moq:'起订量待确认',condition:'关键资料尚待负责人确认',use:'待验证的纯麻系列',tone:'sand',confirmed:false,source:'产品负责人提供的待确认资料'}
];
export const accounts = [
 {id:'seabrook',name:'Seabrook Atelier',initials:'SA',country:'英国',city:'London',type:'女装品牌',role:'品牌选料方',buyer:'采购联系人角色待确认',product:'HX-L240',fit:'suggested',note:'自然风女装系列与现有棉麻的风格接近',source:'官网系列观察 · 演示资料',evidence:'公开系列中出现棉麻外套和自然色长裤，可支持进一步研究。',unknown:'是否直接采购面料、当前项目数量和采购时间',contact:'Emma / 产品团队',owner:'陈雅',relationship:'新发现',palette:'sage'},
 {id:'lund',name:'Lund & Field',initials:'LF',country:'丹麦',city:'Copenhagen',type:'生活方式品牌',role:'品牌选料方',buyer:'历史沟通中的采购联系人',product:'HX-L240',fit:'suggested',note:'历史沟通关注自然肌理，当前项目要求待更新',source:'CRM 沟通摘要 · 演示资料',evidence:'历史选料讨论曾涉及棉麻，尚不能代表这一季仍接受混纺。',unknown:'本季是否接受混纺、采购量与实际下单主体',contact:'Astrid / 采购沟通',owner:'陈雅',relationship:'已有关系',palette:'sand'},
 {id:'rivage',name:'Rivage Studio',initials:'RS',country:'法国',city:'Lyon',type:'成衣工作室',role:'成衣生产方',buyer:'采购角色待核实',product:'HX-L240',fit:'research',note:'新系列出现亚麻材质，需要确认具体成分要求',source:'公开系列观察 · 演示资料',evidence:'公开系列强调 linen，不能据此认定其接受棉麻混纺。',unknown:'是否要求纯麻、是否自采面料',contact:'采购渠道待核实',owner:'陈雅',relationship:'研究中',palette:'rose'},
 {id:'north',name:'North & Form',initials:'NF',country:'瑞典',city:'Stockholm',type:'女装品牌',role:'品牌选料方',buyer:'既有客户关系',product:'HX-C180',fit:'suggested',note:'曾关注轻量衬衫面料，可以核实项目是否继续',source:'CRM 历史记录 · 演示资料',evidence:'上一轮沟通明确讨论过全棉衬衫，当前需求仍需确认。',unknown:'项目是否继续、色号和实际数量',contact:'Sofia / 设计采购',owner:'李明',relationship:'已有负责人',palette:'blue'},
 {id:'elta',name:'Elta Collective',initials:'EC',country:'荷兰',city:'Amsterdam',type:'设计品牌',role:'品牌设计方',buyer:'不直接采购面料',product:'HX-L240',fit:'research',note:'品牌有选料影响力，需先找到合作成衣厂',source:'历史回复 · 演示资料',evidence:'对方表示由合作成衣厂采购，品牌本身不直接下单买布。',unknown:'是否愿意引荐合作成衣厂',contact:'Lena / 设计团队',owner:'陈雅',relationship:'采购链待核实',palette:'sage'},
 {id:'arden',name:'Arden Outdoor',initials:'AO',country:'德国',city:'Hamburg',type:'户外品牌',role:'品牌采购方',buyer:'需要功能性面料',product:'HX-L240',fit:'excluded',note:'已知防水性能要求与当前产品能力不匹配',source:'产品用途观察 · 演示资料',evidence:'当前资料无法证明现有棉麻具备所需防水性能。',unknown:'无适配产品，暂不开发',contact:'未开发',owner:'陈雅',relationship:'当前不适合',palette:'blue'}
];
export const freshAccount={id:'aube',name:'Maison Aube',initials:'MA',country:'法国',city:'Paris',type:'女装品牌',role:'采购角色待确认',buyer:'待核实',product:'HX-C180',fit:'suggested',note:'轻量衬衫系列与水洗全棉用途相近',source:'新增系列观察 · 演示资料',evidence:'公开系列出现轻量棉质衬衫，值得进一步核实采购关系。',unknown:'是否自采面料、克重与颜色要求',contact:'待核实',owner:'陈雅',relationship:'新发现',palette:'rose'};
export function seedState(){return {
 schema:3,creditReviews:{},creditTerms:{},intakeHistory:[],productHistory:[],running:true,version:0,products:structuredClone(products),accounts:structuredClone(accounts),drafts:{},draftHistory:[],sentMessages:[],replies:{},handoffs:{},reviewed:[],suppressed:[],events:[],processed:[],
 gapStatus:'待验证',knowledge:[
  {id:'k-product',title:'HX-L240 成分已统一',body:'亚麻 55%、棉 45%。对外材料沿用已确认的技术卡版本。',type:'已确认事实',source:'产品技术卡 v2',scope:'HX-L240',owner:'资料负责人'},
  {id:'k-moq',title:'起订条件需要连同颜色使用',body:'300 m / 色仅适用于已确认的自然色；不能自动用于所有定染颜色。',type:'业务条件',source:'产品条件记录',scope:'HX-L240 自然色',owner:'资料负责人'},
  {id:'k-elta',title:'Elta 由成衣厂采购',body:'下一步应核实引荐关系，不能直接把品牌视为采购主体。',type:'客户反馈',source:'历史回复',scope:'Elta 当前关系',owner:'陈雅'}
 ],settings:{mode:'review',dailyLimit:5},crmSynced:false,discovered:false
};}

export function restoreState(cached){if(!cached||![2,3].includes(cached.schema)||!Array.isArray(cached.accounts)||!Array.isArray(cached.products))return seedState();return {...seedState(),...cached,schema:3,creditReviews:cached.creditReviews||{},creditTerms:cached.creditTerms||{},intakeHistory:cached.intakeHistory||[],productHistory:cached.productHistory||[]};}
