#!/usr/bin/env bash
# 国土数値情報 都道府県地価調査（L02）の全国版を取得して ../data に展開する
# 使い方: bash fetch-data.sh 26   （26 = 2026年 / 令和8年）
set -euo pipefail
YY="${1:-26}"
cd "$(dirname "$0")/.."
mkdir -p data && cd data
curl -fL -o "L02-${YY}_GML.zip" "https://nlftp.mlit.go.jp/ksj/gml/data/L02/L02-${YY}/L02-${YY}_GML.zip"
unzip -o -q "L02-${YY}_GML.zip"
ls -la "L02-${YY}.geojson"
