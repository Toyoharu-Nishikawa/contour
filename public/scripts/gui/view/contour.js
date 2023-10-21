import * as THREE from 'three'
import {makeJETColorFunc} from "./makeColor.js"

const colorJET20 = makeJETColorFunc(20)

//export const createContour = (d3MultiPolygon) => {
//  console.log("d3multiPolygon", d3multiPolygon)
//
//  const mGroup = new THREE.Group()
//  d3multiPolygon.slice(18,19).forEach((v,i)=>{
//    const sGroup = new THREE.Group()
//    v.coordinates.forEach(u=>{
//      const shapeVec2 = u[0].map(p=>new THREE.Vector2(p[0],p[1]))
//      const shape = new THREE.Shape(shapeVec2)
//      if(u.length>1){
//        u.slice(1).forEach(w=>{
//          const holeVec2 = w.map(p=>new THREE.Vector2(p[0],p[1]))
//          const hole = new THREE.Shape(holeVec2)
//          shape.holes.push(hole)
//        })
//      }
//      const colorRGB = colorJET20(i)
//      const color = new THREE.Color(colorRGB.r,colorRGB.g,colorRGB.b) 
//      const geometry = new THREE.ShapeGeometry( shape );
//      const material = new THREE.MeshBasicMaterial( { color,side: THREE.DoubleSide } );
//      const mesh = new THREE.Mesh( geometry, material ) ;
//      sGroup.add(mesh)
//    })
//    mGroup.add(sGroup)
//  })
//  return mGroup
//}



export const createContour = (d3MultiPolygon) => {
  console.log("multiPolygon",d3MultiPolygon)

  const cleanedShapes = d3MultiPolygon.slice(0,20).map((v,i,arr)=>clearnShape(v?.coordinates,arr[i+1]?.coordinates,i))
  //const cleanedShapes = [d3MultiPolygon[10].coordinates]
  console.log("cleanedShapes",cleanedShapes)
  const mGroup = new THREE.Group()
  cleanedShapes.slice(0,20).forEach((v,i)=>{
    const sGroup = new THREE.Group()
    v.forEach(u=>{
      const shapeVec2 = u[0].map(p=>new THREE.Vector2(p[0],p[1]))
      const shape = new THREE.Shape(shapeVec2)
      if(u.length>1){
        u.slice(1).forEach(w=>{
          const holeVec2 = w.map(p=>new THREE.Vector2(p[0],p[1]))
          const hole = new THREE.Shape(holeVec2)
          shape.holes.push(hole)
        })
      }
      const colorRGB = colorJET20(i)
      const color = new THREE.Color(colorRGB.r,colorRGB.g,colorRGB.b) 
      const geometry = new THREE.ShapeGeometry( shape );
      const material = new THREE.MeshBasicMaterial( { color,side: THREE.DoubleSide } );
      const mesh = new THREE.Mesh( geometry, material ) ;
      sGroup.add(mesh)
    })
    mGroup.add(sGroup)
  })
  return mGroup
}


const clearnShape = (layer1, layer2,i) => {
   console.log("index",i)
  if(layer2==undefined){
    return layer1
  }

  const layer2PolygonIncludedList = layer2.map(v=>{
    const l2Outline = v[0]
    if(layer1.length==1){
      const l1PolygonId = 0
      console.log("l1PolygonId",l1PolygonId)
      return l1PolygonId
    }
    else{
      for(let i=0;i<layer1.length;i++){
        const bool = P1includesP2(layer1[i][0],l2Outline)
        if(bool){
          const l1PolygonId = i
          return l1PolygonId
          break
        }
      }
      console.log("Dicrimination error")
      //return 0
    }
  })
 
  console.log("layer2PolygonIncludedList",layer2PolygonIncludedList)
  const layer1IncludesList = [...Array(layer1.length)].map(v=>[]) 
  layer2PolygonIncludedList.forEach((v,i)=>[
    layer1IncludesList[v].push(layer2[i])
  ])
  console.log("layer1IncludesList",layer1IncludesList)
  const layer = layer1.flatMap((layer1Polygon,layer1Index)=>{
    const layer2PolygonList = layer1IncludesList[layer1Index]
    console.log("layer2PolygonList",layer2PolygonList,)
    if(layer2PolygonList.length==0){
      console.log("pattern A")
      return [layer1Polygon]
    }
    else if(layer1Polygon.length==1){
      console.log("pattern B")
      const layer2PolygonOutlines = layer2PolygonList.map(v=>v[0])
      const layer1Main = [layer1Polygon[0], ...layer2PolygonOutlines] 
      const layer2PolygonHoles = layer2PolygonList.flatMap(v=>v.slice(1)).filter(v=>v.length>0).map(v=>[[v]])
      console.log("layer2PolygonHoles",layer2PolygonHoles)
      const sum = [].concat([layer1Main],...layer2PolygonHoles)
      console.log("sum",sum)
      return sum
    }
    else{
      console.log("pattern C")
      const layer1PolygonOutline = layer1Polygon[0]
      const layer1HolesSet = new Set(layer1Polygon.slice(1))
      const layer1Main = [layer1PolygonOutline]
      const shapeList = []
      layer2PolygonList.forEach(layer2Polygon=>{
        layer1Main.push(layer2Polygon[0])
        if(layer2Polygon.length>1){
          const shapes = layer2Polygon.slice(1).map(layer2Hole=>{
            const includesLayer1Holes = []
            layer1HolesSet.forEach(layer1Hole=>{
              const bool = P1includesP2(layer2Hole,layer1Hole)
              if(bool){
                includesLayer1Holes.push(layer1Hole)
                layer1HolesSet.delete(layer1Hole)
              }
            })
            //const includesLayer1Holes = layer1Holes.values().reduce((p,layer1Hole)=>{
            //  const bool = P1includesP2(layer2Hole,layer1Hole)
            //  if(bool){

            //    p.push(layer1Hole)
            //    return p
            //  }
            //  else{
            //    return p
            //  }
            //},[])
            return [layer2Hole, ...includesLayer1Holes]
          })
          shapeList.push(shapes)
        }
      })
      layer1HolesSet.forEach(layer1Hole=>{
        layer1Main.push(layer1Hole)
      })

      //layer2PolygonList.forEach(layer2Polygon=>{
      //  layer1Main.push(layer2Polygon[0])
      //})
      //const shapes = layer2PolygonList.flatMap(layer2Polygon=>
      //  layer2Polygon.slice(1).map(layer2Hole=>{
      //    const includesLayer1Holes = layer1Holes.reduce((p,layer1Hole)=>{
      //      const bool = P1includesP2(layer2Hole,layer1Hole)
      //      if(bool){
      //        p.push(layer1Hole)
      //        return p
      //      }
      //      else{
      //        return p
      //      }
      //    },[])
      //    return [layer2Hole, ...includesLayer1Holes]
      //  })
      //)
      console.log("layer1Main",layer1Main)
      console.log("shapes",shapeList)
      const sum = [].concat([layer1Main],...shapeList)
      console.log("sum",sum)
      return sum
    }
  })
  console.log("layer",layer)
  return layer

}

const polygonIncludesPoint = (polygon, point) => {
  let wn = 0;
  for(let i = 0; i < polygon.length - 1; i++){
    if ( (polygon[i][1] == point[1]) && (polygon[i+1][1] == point[1]) ) {
      const d2 = (point[0]-polygon[i][0])*(point[0]-polygon[i+1][0])
       if(d2<=0){
         return "boundary"
       }
    }
    // 上向きの辺、下向きの辺によって処理が分かれる。
    // 上向きの辺。点Pがy軸方向について、始点と終点の間にある。ただし、終点は含まない。(ルール1)
    else if ( (polygon[i][1] <= point[1]) && (polygon[i+1][1] > point[1]) ) {
      // 辺は点pよりも右側にある。ただし、重ならない。(ルール4)
      // 辺が点pと同じ高さになる位置を特定し、その時のxの値と点pのxの値を比較する。
      const vt = (point[1] - polygon[i][1]) / (polygon[i+1][1] - polygon[i][1]);
      const inpX = vt * (polygon[i+1][0] - polygon[i][0])+ polygon[i][0]
      if(point[0]==inpX){
        return "boundary"
      }
      else if(point[0] < inpX){
          ++wn;  //ここが重要。上向きの辺と交差した場合は+1
      }
    }
    // 下向きの辺。点Pがy軸方向について、始点と終点の間にある。ただし、始点は含まない。(ルール2)
    else if ( (polygon[i][1] > point[1]) && (polygon[i+1][1] <= point[1]) ) {
      // 辺は点pよりも右側にある。ただし、重ならない。(ルール4)
      // 辺が点pと同じ高さになる位置を特定し、その時のxの値と点pのxの値を比較する。
      const vt = (point[1] - polygon[i][1]) / (polygon[i+1][1] - polygon[i][1]);
      const inpX = vt * (polygon[i+1][0] - polygon[i][0])+ polygon[i][0]
      if(point[0]==inpX){
        return "boundary"
      }
      else if(point[0] < inpX){
          --wn;  //ここが重要。下向きの辺と交差した場合は-1
      }
    }
    // ルール1,ルール2を確認することで、ルール3も確認できている。
  }
  const msg = Math.abs(wn)>0 ? "inside": "outside"
  return msg 
}

const P1includesP2 = (polygon1, polygon2) => {
  const p = polygon2[0]
  const discrimination = polygonIncludesPoint(polygon1, p)
  const bool = (discrimination =="boundary" || discrimination =="inside") ? true :false
  return bool 
}

