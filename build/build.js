const fs=require("fs");
const base=fs.readFileSync("template.html","utf8");
const YEAR=JSON.parse(fs.readFileSync("data.json","utf8")).year;
const WAREKI="令和"+(YEAR-2018)+"年";
function make(basemap){
  let t=base.split("__YEAR__").join(YEAR).split("__WAREKI__").join(WAREKI); const rep=(k,v)=>{ if(!t.includes(k)) throw k; t=t.split(k).join(v); };
  rep("/*__MAPLIBRE_CSS__*/", fs.readFileSync("maplibre-gl.css","utf8"));
  rep("/*__BASEMAP__*/false", String(basemap));
  rep("/*__DATA__*/null", fs.readFileSync("data.json","utf8"));
  rep("/*__PREF__*/null", fs.readFileSync("pref.geojson","utf8").replace(/\s+/g,""));
  rep("/*__MUNI__*/null", fs.readFileSync("muni_lines.geojson","utf8").replace(/\s+/g,""));
  return t;
}
const wrap=t=>'<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'+t+'</body></html>';
fs.mkdirSync("../dist",{recursive:true});
// Artifact版（外部タイルなし）とローカル版（地理院タイル背景）
fs.writeFileSync("../dist/kijunchika-map.html",make(false));
fs.writeFileSync("../dist/kijunchika-map-gsi.html",wrap(make(true)));
fs.writeFileSync("preview.html",wrap(make(true)));
fs.mkdirSync("../docs",{recursive:true});
fs.copyFileSync("../dist/kijunchika-map-gsi.html","../docs/index.html");
for(const f of ["kijunchika-map.html","kijunchika-map-gsi.html"]) console.log(f,(fs.statSync("../dist/"+f).size/1e6).toFixed(2)+" MB");
