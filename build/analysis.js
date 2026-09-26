// note記事用の集計（地図と同じ定義：継続地点の単純平均、3年平均は2023→2026年の年率）
const fs=require("fs");
const D=JSON.parse(fs.readFileSync("data.json","utf8"));
const N=D.x.length, YN=D.year, Y0=D.y0;
const USE={0:"住宅地",3:"宅地見込地",5:"商業地",9:"工業地",20:"林地"};
const hist=i=>{const s=D.h[i];if(!s)return[];const[a,b]=s.split(":");const st=parseInt(a,36);return b.split(",").map((t,k)=>({y:Y0+st+k,v:t===""?0:t[0]==="~"?parseInt(t.slice(1),36):parseInt(t,36)*100}))};
const H=[...Array(N).keys()].map(hist);
const g=(i,y)=>(H[i].find(d=>d.y===y)||{v:0}).v;
const cont=i=>g(i,YN-1)>0;
const c3=i=>{const v=[3,2,1,0].map(k=>g(i,YN-k));return v.every(x=>x>0)?(Math.pow(v[3]/v[0],1/3)-1)*100:NaN};
const pref=i=>D.prefName[D.city[i].slice(0,2)];
const avg=a=>a.reduce((s,x)=>s+x,0)/a.length, med=a=>{a=a.slice().sort((x,y)=>x-y);const m=a.length>>1;return a.length%2?a[m]:(a[m-1]+a[m])/2};
const f1=x=>(x>0?"+":"")+x.toFixed(1);
const out={};
// 用途別
out.byUse={};
for(const u of [0,5,9,null]){ const ids=[...Array(N).keys()].filter(i=>u===null||D.u[i]===u);
  const c=ids.filter(cont), t=ids.filter(i=>!isNaN(c3(i)));
  out.byUse[u===null?"全用途":USE[u]]={n:ids.length, avg1:f1(avg(c.map(i=>D.c[i]))), up:c.filter(i=>D.c[i]>0).length, flat:c.filter(i=>D.c[i]===0).length, down:c.filter(i=>D.c[i]<0).length,
    avg3:f1(avg(t.map(c3))), up3:t.filter(i=>c3(i)>=0.05).length, down3:t.filter(i=>c3(i)<=-0.05).length, n3:t.length, medPrice:med(ids.map(i=>D.p[i]))};
}
// 過去の動き：前年の単純平均（同じ定義）を年ごとに
out.trend={}; for(let y=YN-4;y<=YN;y++){ const r=[]; for(let i=0;i<N;i++){const a=g(i,y-1),b=g(i,y); if(a>0&&b>0) r.push((b/a-1)*100);} out.trend[y]=f1(avg(r)); }
// ランキング
const lab=i=>`${pref(i)} ${D.adr[i].replace(/[０-９]+番.*$/,"")}（${USE[D.u[i]]}）`;
const ids1=[...Array(N).keys()].filter(cont), ids3=[...Array(N).keys()].filter(i=>!isNaN(c3(i)));
out.top1=ids1.sort((a,b)=>D.c[b]-D.c[a]).slice(0,10).map(i=>`${lab(i)} 単年${f1(D.c[i])} 3年${isNaN(c3(i))?"-":f1(c3(i))}`);
out.top3=ids3.slice().sort((a,b)=>c3(b)-c3(a)).slice(0,10).map(i=>`${lab(i)} 3年${f1(c3(i))} 単年${f1(D.c[i])} 23→24:${f1((g(i,YN-2)/g(i,YN-3)-1)*100)} 24→25:${f1((g(i,YN-1)/g(i,YN-2)-1)*100)}`);
out.bottom3=ids3.slice().sort((a,b)=>c3(a)-c3(b)).slice(0,5).map(i=>`${lab(i)} 3年${f1(c3(i))} 単年${f1(D.c[i])}`);
// 単年上位10のうち3年でも上位100に入る数
const r3=new Map(ids3.slice().sort((a,b)=>c3(b)-c3(a)).map((i,k)=>[i,k+1]));
out.top1rank3=ids1.sort((a,b)=>D.c[b]-D.c[a]).slice(0,10).map(i=>r3.get(i)||"-");
// 都道府県中央値
const P={}; for(let i=0;i<N;i++){const p=pref(i);(P[p] ||= {c:[],c3:[]}); if(cont(i))P[p].c.push(D.c[i]); if(!isNaN(c3(i)))P[p].c3.push(c3(i));}
const pr=Object.entries(P).map(([p,v])=>({p,m1:med(v.c),m3:med(v.c3)}));
out.prefPos1=pr.filter(x=>x.m1>0).length; out.prefNeg1=pr.filter(x=>x.m1<0).length; out.prefZero1=pr.filter(x=>x.m1===0).length;
out.prefPos3=pr.filter(x=>x.m3>=0.005).length; out.prefNeg3=pr.filter(x=>x.m3<=-0.005).length;
out.prefTop3=pr.sort((a,b)=>b.m3-a.m3).slice(0,7).map(x=>`${x.p} 3年${f1(x.m3)} 単年${f1(x.m1)}`);
out.prefBottom3=pr.slice(-5).map(x=>`${x.p} 3年${f1(x.m3)} 単年${f1(x.m1)}`);
// 最高値・バブル比較
let rec=0,recN=0,bub=0,bubN=0; const recByUse={};
for(let i=0;i<N;i++){ const h=H[i].filter(d=>d.v>0); if(h.length<10) continue; recN++; const mx=Math.max(...h.map(d=>d.v)); if(D.p[i]>=mx&&h.length>1){rec++; recByUse[USE[D.u[i]]]=(recByUse[USE[D.u[i]]]||0)+1;}
  const b=Math.max(0,...H[i].filter(d=>d.y>=1987&&d.y<=1992).map(d=>d.v)); if(b>0){bubN++; if(D.p[i]>=b)bub++;} }
out.record={rec,recN,recByUse,bub,bubN};
out.priceTop5=[...Array(N).keys()].sort((a,b)=>D.p[b]-D.p[a]).slice(0,5).map(i=>`${lab(i)} ${D.p[i].toLocaleString()} ${f1(D.c[i])}`);
const gz=[...Array(N).keys()].sort((a,b)=>D.p[b]-D.p[a])[0]; out.ginza=H[gz].filter(d=>[1983,1991,2001,2016,2021,2026].includes(d.y)||d.v===Math.max(...H[gz].map(x=>x.v)));
console.log(JSON.stringify(out,null,1));
