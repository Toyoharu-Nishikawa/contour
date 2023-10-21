

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

const nhimmelblaus = (x, y)=> {
  return -1*(x**2  + y - 11) **2 - (x + y**2 - 7)**2;
}

export const getNHimmelbauMultiPolygon = () => {
  const n = 240;
  const m = 125;
  let k = 0;
  const values = new Array(n * m);
  for(let j = 0; j < m; ++j) {
    for(let i = 0; i < n; ++i) {
      const x = i / (n - 1) * 10 - 5;
      const y = j / (m - 1) * 10 - 5;
      values[k] = nhimmelblaus(x, y);
      ++k;
    }
  }
  
  
  // 3. しきい値の設定
  const thresholds = d3.range(0, 20).map(function(p) { return 7*p-140 });
  
  // 4. データ変換
  const contours = d3.contours()
    .size([n, m])
    .thresholds(thresholds);
  
  const multiPolygon = contours(values)
  return multiPolygon
}

const cossin = (x, y)=> {
  return Math.cos(x)+Math.sin(y)
}

export const getCosSinPolygon = () => {
  const n = 100;
  const m = 100;
  let k = 0;
  const values = new Array(n * m);
  for(let j = 0; j < m; ++j) {
    for(let i = 0; i < n; ++i) {
      const x = i / 20*Math.PI*2;
      const y = j / 20*Math.PI*2;
      values[k] = cossin(x, y);
      ++k;
    }
  }
  
  // 3. しきい値の設定
  const thresholds = d3.range(0, 20).map(function(p) { return p/5-2; });
  
  // 4. データ変換
  const contours = d3.contours()
    .size([n, m])
    .thresholds(thresholds);
  
  const multiPolygon = contours(values)
  return multiPolygon
}

const cos_sin = (x, y)=> {
  return Math.cos(x)*Math.sin(y)
}

export const getCos_SinPolygon = () => {
  const n = 100;
  const m = 100;
  let k = 0;
  const values = new Array(n * m);
  for(let j = 0; j < m; ++j) {
    for(let i = 0; i < n; ++i) {
      const x = i / 20*Math.PI*2;
      const y = j / 20*Math.PI*2;
      values[k] = cos_sin(x, y);
      ++k;
    }
  }
  
  // 3. しきい値の設定
  const thresholds = d3.range(0, 20).map(function(p) { return p/10-1; });
  
  // 4. データ変換
  const contours = d3.contours()
    .size([n, m])
    .thresholds(thresholds);
  
  const multiPolygon = contours(values)
  return multiPolygon
}

const cos_sin_exp = (x, y)=> {
  return Math.cos(x)*Math.sin(y)*Math.exp(-Math.sqrt(x**2+y**2)/30)
}

export const getCos_Sin_ExpPolygon = () => {
  const n = 100;
  const m = 100;
  let k = 0;
  const values = new Array(n * m);
  for(let j = 0; j < m; ++j) {
    for(let i = 0; i < n; ++i) {
      const x = (i-50) / 20*Math.PI*2;
      const y = (j-50) / 20*Math.PI*2;
      values[k] = cos_sin_exp(x, y);
      ++k;
    }
  }
  
  // 3. しきい値の設定
  const thresholds = d3.range(0, 20).map(function(p) { return p/10-1; });
  
  // 4. データ変換
  const contours = d3.contours()
    .size([n, m])
    .thresholds(thresholds);
  
  const multiPolygon = contours(values)
  return multiPolygon
}

