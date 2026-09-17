export const intakeFields = [
 ['id','企业料号',true],['name','产品名称',true],['composition','成分比例',true],['weight','克重（g/㎡）',true],['width','幅宽（cm）',true],['moq','起订条件',false],['use','用途',false],['condition','补充条件',false]
];
export const intakeAliases = {id:['企业料号','料号','sku','material_code'],name:['产品名称','品名','name','item_name'],composition:['成分比例','成分','composition'],weight:['克重（g/㎡）','克重','gsm','weight'],width:['幅宽（cm）','幅宽','width_cm','width'],moq:['起订条件','moq'],use:['用途','use','application'],condition:['补充条件','condition','remarks']};
export const intakeTemplate = '企业料号,产品名称,成分比例,克重（g/㎡）,幅宽（cm）,起订条件,用途,补充条件\nHX-T160,轻量莱赛尔斜纹,100% 莱赛尔,160,150,现货 300 m / 色,衬衫,颜色和交期按项目确认\n';
export const intakeApiSample = 'material_code,item_name,composition,gsm,width_cm,moq,application,remarks\nHX-L240,自然肌理棉麻,60% 亚麻 / 40% 棉,240,145,自然色 300 m / 色,外套与裤装,成分与已确认技术卡冲突\nHX-T160,轻量莱赛尔斜纹,100% 莱赛尔,160,150,现货 300 m / 色,衬衫,颜色需复核\nHX-X200,待补全样品,100% 棉,200,,待确认,样品,缺少幅宽不进入产品库\n';
export const intakeDocumentSample = '企业料号,产品名称,成分比例,克重（g/㎡）,幅宽（cm）,起订条件,用途,补充条件\nHX-R190,棉莱赛尔混纺,60% 棉 / 40% 莱赛尔,190,148,待确认,轻量裤装,规格单提取演示：须核对原件再确认\n';
export function parseIntakeCSV(text){
 if(typeof text!=='string'||text.length>262144)throw new Error('请选择小于 256 KB 的 UTF-8 CSV 文件');
 text=text.replace(/^\uFEFF/,'');let rows=[],row=[],cell='',quoted=false;
 for(let i=0;i<text.length;i++){
  const ch=text[i];if(ch==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else if(!quoted&&cell!=='')throw new Error('CSV 引号格式不正确');else quoted=!quoted;}
  else if(ch===','&&!quoted){row.push(cell.trim());cell='';}
  else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cell.trim());if(row.some(Boolean))rows.push(row);row=[];cell='';}
  else cell+=ch;
 }
 if(quoted)throw new Error('CSV 引号未闭合');row.push(cell.trim());if(row.some(Boolean))rows.push(row);
 if(rows.length<2)throw new Error('文件需要表头和至少一行产品资料');
 const headers=rows.shift();if(new Set(headers).size!==headers.length||headers.some(x=>!x))throw new Error('表头重复或为空，请先修正');
 if(rows.length>100)throw new Error('演示每批最多导入 100 行');
 if(rows.some(r=>r.length!==headers.length))throw new Error('部分行的列数与表头不一致，请检查逗号和引号');
 return {headers,rows};
}
export function inferIntakeMapping(headers){return Object.fromEntries(intakeFields.map(([key])=>[key,headers.find(h=>intakeAliases[key].some(a=>a.toLowerCase()===h.toLowerCase()))||'']));}
function intakeMeasure(raw,type){
 const clean=String(raw).trim();const match=clean.match(/^([0-9]+(?:\.[0-9]+)?)\s*(.*)$/);if(!match)return null;
 let value=Number(match[1]),unit=match[2].toLowerCase().replace(/\s/g,'');
 if(type==='width'&&unit==='m')value*=100;
 else if(type==='width'&&!['','cm','厘米'].includes(unit))return null;
 if(type==='weight'&&!['','gsm','g/㎡','g/m²','g/m2','克/平方米'].includes(unit))return null;
 if(!Number.isFinite(value)||value<=0||value>(type==='weight'?3000:1000))return null;
 return String(Math.round(value*100)/100)+(type==='weight'?' g/㎡':' cm');
}
const comparable=v=>String(v).replace(/\s/g,'').toLowerCase();
export function validateIntake(state,grid,mapping){
 const chosen=Object.values(mapping).filter(Boolean),mappingDuplicate=new Set(chosen).size!==chosen.length,seen=new Set();
 return grid.rows.map((row,index)=>{
  const p=Object.fromEntries(intakeFields.map(([key])=>[key,mapping[key]?String(row[grid.headers.indexOf(mapping[key])]??'').trim():''])),errors=[];
  for(const [key,label,required] of intakeFields)if(required&&!p[key])errors.push('缺少'+label);
  if(mappingDuplicate)errors.push('同一源字段不能映射到多个标准字段');
  if(p.id&&!/^[\p{L}\p{N}_.-]{1,64}$/u.test(p.id))errors.push('料号仅支持文字、数字、点、短横线和下划线');
  if(seen.has(p.id))errors.push('本批料号重复');seen.add(p.id);
  const ratios=[...p.composition.matchAll(/(\d+(?:\.\d+)?)\s*%/g)].map(x=>Number(x[1]));
  if(p.composition&&(!ratios.length||Math.abs(ratios.reduce((a,b)=>a+b,0)-100)>.01))errors.push('成分比例合计须为 100%');
  const weight=intakeMeasure(p.weight,'weight'),width=intakeMeasure(p.width,'width');
  if(p.weight&&!weight)errors.push('克重需为有效的 g/㎡ 数值');if(p.width&&!width)errors.push('幅宽需为有效的 cm 或 m 数值');
  const existing=state.products.find(x=>x.id===p.id),product={...p,weight:weight||p.weight,width:width||p.width,moq:p.moq||existing?.moq||'待确认',condition:p.condition||existing?.condition||'未提供的交易条件保持待确认',use:p.use||existing?.use||'用途待确认',en:existing?.en||'Imported fabric',tone:existing?.tone||'sage',confirmed:false};
  const changes=existing?['composition','weight','width','moq','condition','use','name'].filter(k=>comparable(existing[k])!==comparable(product[k])):[];
  return {row:index+2,product,errors,valid:!errors.length,kind:existing?(changes.length?'conflict':'unchanged'):'new',changes,previous:existing?Object.fromEntries(changes.map(k=>[k,existing[k]])):null};
 });
}
export function stageIntake(state,grid,mapping,source){
 const rows=validateIntake(state,grid,mapping),accepted=rows.filter(x=>x.valid&&x.kind!=='unchanged');
 if(!accepted.length)return {ok:false,message:'没有可导入的新资料；请检查错误或重复记录'};
 let count=0;
 for(const row of accepted){
  const p=row.product,existing=state.products.find(x=>x.id===p.id);
  if(existing?.pendingImport&&JSON.stringify(existing.pendingImport.product)===JSON.stringify(p))continue;
  const pendingImport={product:p,source,receivedAt:new Date().toISOString(),sourceRow:row.row,raw:Object.fromEntries(grid.headers.map((h,i)=>[h,grid.rows[row.row-2][i]])),mapping:structuredClone(mapping),priorConfirmed:existing?.pendingImport?.priorConfirmed??existing?.confirmed??false,previous:existing?structuredClone(existing.pendingImport?.previous||{...existing,pendingImport:undefined}):null};
  if(existing){existing.pendingImport=pendingImport;existing.conflict=true;existing.confirmed=false;}
  else state.products.push({...p,source,fromImport:true,pendingImport});
  Object.values(state.drafts).filter(d=>d.product===p.id).forEach(d=>{d.valid=false;d.paused=true;});count++;
 }
 if(!count)return {ok:false,message:'相同资料已在待确认区，无需重复导入'};
 state.intakeHistory??=[];state.intakeHistory.unshift({id:'batch-'+(state.version+1),source,accepted:count,rejected:rows.filter(x=>!x.valid).length,errors:rows.filter(x=>!x.valid).map(x=>({row:x.row,id:x.product.id,errors:x.errors})),time:new Date().toISOString()});
 return {ok:true,message:`${count} 条资料已进入待确认区，原始版本与失效记录保留`};
}
export function resolveIntake(state,id,accept){
 const p=state.products.find(x=>x.id===id),pending=p?.pendingImport;if(!pending)return {ok:false,message:'没有待复核的导入资料'};
 state.productHistory??=[];if(pending.previous)state.productHistory.push({product:pending.previous,source:pending.source,resolvedAt:new Date().toISOString(),accepted:accept});
 if(accept){Object.assign(p,pending.product,{confirmed:true,conflict:false,source:pending.source+' · 负责人确认',sourceAudit:{source:pending.source,row:pending.sourceRow,raw:pending.raw,mapping:pending.mapping,confirmedAt:new Date().toISOString(),confirmedBy:'演示资料负责人'},fromImport:true});delete p.pendingImport;}
 else if(pending.previous){const old=structuredClone(pending.previous);Object.keys(p).forEach(k=>delete p[k]);Object.assign(p,old,{confirmed:pending.priorConfirmed});delete p.pendingImport;}
 else state.products=state.products.filter(x=>x.id!==id);
 return {ok:true,message:accept?'已确认导入资料；失效草稿仍需重新生成':'已保留原资料，导入建议未采用'};
}
