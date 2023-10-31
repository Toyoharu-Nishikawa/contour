import * as THREE from 'three'
import {makeJETColorFunc} from "./makeColor.js"
import {getDifferenceSetOfD3Contour} from "./diffD3Contour.js"

const colorJET20 = makeJETColorFunc(20)



export const createContour = (d3Contour) => {
  console.log("d3Contour",d3Contour)

  const diffD3Contour = getDifferenceSetOfD3Contour(d3Contour)
  const cleanedShapes = diffD3Contour.map(v=>v.coordinates)
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


