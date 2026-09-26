const fs=require("fs");
const YY=process.argv[2]||"26";
const g=JSON.parse(fs.readFileSync(`../data/L02-${YY}.geojson`,"utf8"));
const YEAR=g.features[0].properties.L02_005, Y0=1983, NY=YEAR-Y0+1;
const USE={"000":0,"003":3,"005":5,"009":9,"010":10,"020":20};
const prefName={};
const cols={x:[],y:[],u:[],p:[],c:[],city:[],cn:[],seq:[],adr:[],area:[],cur:[],st:[],sd:[],zone:[],ku:[],h:[]};
for(const f of g.features){
  const q=f.properties,[x,y]=f.geometry.coordinates;
  const pc=q.L02_020.slice(0,2); const pn=q.L02_022.split("　")[0]; prefName[pc]=pn;
  cols.x.push(+x.toFixed(5));cols.y.push(+y.toFixed(5));
  cols.u.push(USE[q.L02_001]??99);cols.p.push(q.L02_006);cols.c.push(q.L02_007);
  cols.city.push(q.L02_020);cols.cn.push(q.L02_021);cols.seq.push(+q.L02_002);
  cols.adr.push(q.L02_022.split("　").slice(1).join(" "));
  cols.area.push(q.L02_024);cols.cur.push(q.L02_025.replace(/@/g,"・"));
  cols.st.push(q.L02_045==="_"?"":q.L02_045);cols.sd.push(q.L02_046);
  cols.zone.push(q.L02_047==="_"?"":q.L02_047);cols.ku.push(q.L02_049);
  // 価格履歴は L02_056（1983年）から調査年まで。最終年の値が当年価格と一致するか検査する
  const h=[];for(let i=56;i<56+NY;i++)h.push(q["L02_"+String(i).padStart(3,"0")]||0);
  if(h[NY-1]!==q.L02_006) throw new Error("価格履歴の列がずれています（仕様変更の可能性）: "+q.L02_022);
  let s=h.findIndex(v=>v>0); cols.h.push(s<0?"":s.toString(36)+":"+h.slice(s).map(v=>v?(v%100===0?(v/100).toString(36):"~"+v.toString(36)):"").join(","));
}
const unknown=[...new Set(cols.u)].filter(u=>u===99); if(unknown.length)console.error("unknown use code");
const out={year:YEAR,y0:Y0,prefName,...cols};
fs.writeFileSync("data.json",JSON.stringify(out));
console.log(fs.statSync("data.json").size, Object.keys(prefName).length);
