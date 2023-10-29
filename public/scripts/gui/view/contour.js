import * as THREE from 'three'
import {makeJETColorFunc} from "./makeColor.js"

const colorJET20 = makeJETColorFunc(20)




export const createContour = (d3MultiPolygon) => {
  console.log("multiPolygon",d3MultiPolygon)

  const cleanedShapes = d3MultiPolygon.map((v,i,arr)=>clearnShape(v?.coordinates,arr[i+1]?.coordinates,i))
  console.log("cleanedShapes",cleanedShapes)
  const mGroup = new THREE.Group()
  cleanedShapes.forEach((v,i)=>{
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
 
  const layer1IncludesList = [...Array(layer1.length)].map(v=>[]) 
  layer2PolygonIncludedList.forEach((v,i)=>[
    layer1IncludesList[v].push(layer2[i])
  ])
  const layer = layer1.flatMap((layer1Polygon,layer1Index)=>{
    const layer2PolygonList = layer1IncludesList[layer1Index]
    if(layer2PolygonList.length==0){
      console.log("pattern A")
      return [layer1Polygon]
    }
    else if(layer1Polygon.length==1){
      console.log("pattern B")
      const incInfoList = getPolygonInHole(layer2PolygonList)
      const layer1Main = [layer1Polygon[0]]
      const shapeList = []
      for(let i=0;i<incInfoList.length;i++){
        const incInfo = incInfoList[i]
        if(incInfo.includedFlag==false){
          layer1Main.push(layer2PolygonList[i][0])
        }
        incInfo.holeInfoList.forEach((val,ind)=>{
          const shape = []
          const layer2Hole = layer2PolygonList[i][ind+1]
          if(val.includes){
            const polygonId = val.polygonId
            const innerOutline = layer2PolygonList[polygonId][0]
            shape.push(layer2Hole, innerOutline)
          }
          else{
            shape.push(layer2Hole)
          }
          shapeList.push([shape])
        })
      }

      const sum = [].concat([layer1Main],...shapeList)
      return sum
    }
    else{
      console.log("pattern C")
      const incInfoList = getPolygonInHole(layer2PolygonList)
 
      const layer1PolygonOutline = layer1Polygon[0]
      const layer1HolesSet = new Set(layer1Polygon.slice(1))

      const layer1Main = [layer1Polygon[0]]
      const shapeList = []
      for(let i=0;i<incInfoList.length;i++){
        const incInfo = incInfoList[i]
        if(incInfo.includedFlag==false){
          layer1Main.push(layer2PolygonList[i][0])
        }
        incInfo.holeInfoList.forEach((val,ind)=>{
          const shape = []
          const layer2Hole = layer2PolygonList[i][ind+1]
          if(val.includes){
            const polygonId = val.polygonId
            const innerOutline = layer2PolygonList[polygonId][0]
            shape.push(layer2Hole,innerOutline) 
          }
          else{
            shape.push(layer2Hole) 
          }
          const includesLayer1Holes = []
          layer1HolesSet.forEach(layer1Hole=>{
            const bool = P1includesP2(layer2Hole,layer1Hole)
            if(bool){
              includesLayer1Holes.push(layer1Hole)
              layer1HolesSet.delete(layer1Hole)
            }
          })
          shape.push(...includesLayer1Holes)
          shapeList.push([shape])
        })
      }

      layer1HolesSet.forEach(layer1Hole=>{
        layer1Main.push(layer1Hole)
      })

      const sum = [].concat([layer1Main],...shapeList)
      return sum
    }
  })
  return layer

}

const polygonIncludesPoint = (polygon, point) => {
  let wn = 0;
  const epsilon = 1E-10
  for(let i = 0; i < polygon.length - 1; i++){
    if ( (polygon[i][1] == point[1]) && (polygon[i+1][1] == point[1]) ) {
      const d2 = (point[0]-polygon[i][0])*(point[0]-polygon[i+1][0])
       if(d2<=epsilon){
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
      if(Math.abs(point[0]-inpX)<epsilon){
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
      if(Math.abs(point[0]-inpX)<epsilon){
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
  let bool = true
  for(let i=0;i<polygon2.length;i++){
    const p = polygon2[i]
    const discrimination = polygonIncludesPoint(polygon1, p)
    if(discrimination=="boundary"){
      continue
    }
    else{
      bool = discrimination=="inside" ? true :false
      break
    }
  }
  return bool 
}


const getPolygonInHole = (layer) => {
  const list = []
  layer.forEach((sPolygonList,i)=>{
    const sOutline = sPolygonList[0]
    layer.slice(i+1).forEach((tPolygonList,j)=>{
      const tOutline = tPolygonList[0]

      const bool1 = P1includesP2(sOutline,tOutline)
      const bool2 = P1includesP2(tOutline,sOutline)
      if(bool1){
        list.push([i,j+i+1])
      }
      else if(bool2){
        list.push([j+i+1,i])
      }
    })
  })
  const incMap = new Map()
  list.forEach(v=>{
    if(!incMap.has(v[0])){
      incMap.set(v[0],new Set())
    }
    const l = incMap.get(v[0])
    l.add(v[1])
    incMap.set(v[0],l)
  })
  incMap.forEach((value,key)=>{
    const ll = [...value]
    ll.forEach((v,i)=>{
      ll.slice(i+1).forEach((u,j)=>{
        const bool1 = P1includesP2(layer[v][0],layer[u][0])
        const bool2 = P1includesP2(layer[u][0],layer[v][0])
        if(bool1){
          value.delete(u)
        }
        else if(bool2){
          value.delete(v)
        }
      })
    })
  })
  const incEntries = [...incMap.entries()].map(v=>[v[0],[...v[1]]])

  const includedSet = new Set()
  const includesSet = new Set([...incMap.keys()])
  incMap.forEach(v=>{
    v.forEach(u=>{
      includedSet.add(u)
    })
  })
    
  const incInfoList = []
  for(let i=0;i<layer.length;i++){
    const includedFlag = includedSet.has(i)
    const includesFlag = includesSet.has(i)
    const type = includedFlag==true && includesFlag==true ?  "INCLUDES_INCLUDED" :
                 includedFlag==true && includesFlag==false ? "INCLUDED" :
                 includedFlag==false && includesFlag==true ? "INCLUDES" :
                                                             "ISOLATED"
    const holes = layer[i].slice(1)
    const candidateOutlinesSet = new Set([...incMap.get(i)||[]])
    const holeInfoList = []
    for(let hi=0; hi<holes.length;hi++){
      if(candidateOutlinesSet.size==0){
        holeInfoList.push({includes:false} )
        continue
      }
      candidateOutlinesSet.forEach(u=>{
        const bool = P1includesP2(holes[hi],layer[u][0])
        if(bool){
          holeInfoList.push({includes:true,polygonId:u} )
          candidateOutlinesSet
        }
        else{
          holeInfoList.push({includes:false} )
        }
      })
    }

    const infoObj = {
      type,
      includedFlag,
      includesFlag,
      holeInfoList,
    } 
    incInfoList.push(infoObj)
  }

  return incInfoList

}
