#!/usr/bin/env bash
# 行政界（国土地理院「地球地図日本」第2.2版 polbnda_jpn）から
# 都道府県ポリゴン pref.geojson と市区町村境界線 muni_lines.geojson を作る。
# 地球地図日本: https://www.gsi.go.jp/kankyochiri/gm_japan_e.html から取得した shp を gm/ に置く。
# 生成物はリポジトリに含めているので、通常は実行不要。
set -euo pipefail
cd "$(dirname "$0")"
SHP=gm/gm-jpn-all_u_2_2/polbnda_jpn.shp
npx -y mapshaper "$SHP" -each 'pref=adm_code.slice(0,2)' -filter-fields adm_code,pref \
  -dissolve2 adm_code copy-fields=pref -simplify 12% keep-shapes -o format=geojson precision=0.0001 muni.geojson \
  -dissolve2 pref -o format=geojson precision=0.0001 pref.geojson
npx -y mapshaper muni.geojson -innerlines -o format=geojson precision=0.0001 muni_lines.geojson
