const getColor = (v,vmin,vmax) => {
   const c = {r:1.0,g:1.0,b:1.0}; // white

   if (v < vmin)
      v = vmin;
   if (v > vmax)
      v = vmax;
   const dv = vmax - vmin;

   if (v < (vmin + 0.25 * dv)) {
      c.r = 0;
      c.g = 4 * (v - vmin) / dv;
   } else if (v < (vmin + 0.5 * dv)) {
      c.r = 0;
      c.b = 1 + 4 * (vmin + 0.25 * dv - v) / dv;
   } else if (v < (vmin + 0.75 * dv)) {
      c.r = 4 * (v - vmin - 0.5 * dv) / dv;
      c.b = 0;
   } else {
      c.g = 1 + 4 * (vmin + 0.75 * dv - v) / dv;
      c.b = 0;
   }

   return(c);
}
export const makeJETColorFunc = (n) =>{
  const min = 0
  const max = n
  const colorList = [...Array(n)].map((v,i)=>getColor(i,0,n)) 
  const f = (i) => colorList[i] 
  return f
}
