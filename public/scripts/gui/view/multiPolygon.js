

const himmelblaus = (x, y)=> {
  return(x * x + y - 11) * (x * x + y - 11) + (x + y * y - 7) * (x + y * y - 7);
}

export const getHimmelbauMultiPolygon = () => {
  const n = 240;
  const m = 125;
  let k = 0;
  const values = new Array(n * m);
  for(let j = 0; j < m; ++j) {
    for(let i = 0; i < n; ++i) {
      const x = i / (n - 1) * 10 - 5;
      const y = j / (m - 1) * 10 - 5;
      values[k] = himmelblaus(x, y);
      ++k;
    }
  }
  
  
  // 3. しきい値の設定
  const thresholds = d3.range(0, 20).map(function(p) { return 7*p; });
  
  // 4. データ変換
  const contours = d3.contours()
    .size([n, m])
    .thresholds(thresholds);
  
  const multiPolygon = contours(values)
  return multiPolygon
}


