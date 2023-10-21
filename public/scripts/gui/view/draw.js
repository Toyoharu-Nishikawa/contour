import * as THREE from 'three';
//import Stats from "Stats" 
//import { GUI } from "GUI" 
import { TrackballControls } from "TrackballControls"
import {createContour} from "./contour.js"
import {
  getHimmelbauMultiPolygon,
  getNHimmelbauMultiPolygon,
  getCosSinPolygon,
  getCos_SinPolygon,
  getCos_Sin_ExpPolygon
} from "./multiPolygon.js"

//const getMultiPolygonFunc = getCos_Sin_ExpPolygon
const getMultiPolygonFunc = getNHimmelbauMultiPolygon

const elements = {
  draw: document.getElementById("draw"),
  main: document.querySelector("main"),
}

//let scene, camera, renderer
let perspectiveCamera, orthographicCamera, controls, scene, renderer, stats
let initialWidth, initialHeight, initialWindowWidth, initialWindowHeight
let resizeFlg

const meshList = new Set()


export const initialize = () => {
  init()
  animate();
  window.onresize = windowResizeFunc

}
const frustumSize = 400
const params = {
  orthographicCamera: false
}
export const init = () => {
  //element
  const mainElem = elements.main
  const drawElem = elements.draw
  const width = drawElem.clientWidth
  const height = drawElem.clientHeight
  initialWindowWidth = window.innerWidth 
  initialWindowHeight =  window.innerHeight 
  initialWidth = width 
  initialHeight =  height 
  const aspect = width / height

  
  //clock
  const clock = new THREE.Clock()

  //secne
  scene = new THREE.Scene();

  //camera
//  perspectiveCamera = new THREE.PerspectiveCamera(45, aspect, 1, 1000);
  orthographicCamera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 1000 );

//  perspectiveCamera.up.set( 0, 0, 1 );
//  perspectiveCamera.position.set( 100, 100, 100 );

  orthographicCamera.up.set( 0, 0, 1 );
  orthographicCamera.position.set( 100, 100, 100 );


  //renderer
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
  })
  renderer.setSize(width, height);
  drawElem.appendChild(renderer.domElement);


  //objects
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry( 50, 50, 50 ),
    new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } )
  );
  scene.add(mesh)
  meshList.add(mesh)

  const d3MultiPolygon = getMultiPolygonFunc()
  //const d3MultiPolygon = getHimmelbauMultiPolygon()
  //const d3MultiPolygon = getCosSinPolygon()
  //const d3MultiPolygon = getCos_SinPolygon()
  const contour = createContour(d3MultiPolygon)
  scene.add(contour)
  meshList.add(contour)

  //axes
  const axes = new THREE.AxesHelper(100);
  scene.add(axes);
  meshList.add(axes)

  //grid helper
  const gridHelper = new THREE.GridHelper( 50, 50 );
  gridHelper.rotation.x=Math.PI/2
  scene.add( gridHelper );
  meshList.add(gridHelper)


  //lights
  const directionalLightP = new THREE.DirectionalLight(0xffffff)
  const directionalLightO = new THREE.DirectionalLight(0xffffff)
  directionalLightP.position.set(100,100,100)
  directionalLightO.position.set(100,100,100)
  directionalLightP.visible = true
  directionalLightO.visible = false
  orthographicCamera.add(directionalLightO)
  scene.add(orthographicCamera)
 
  createControls(orthographicCamera)


}


const	createControls = camera => {
  controls = new TrackballControls( camera, renderer.domElement );
  controls.rotateSpeed = 3.0;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.keys = [ 'KeyA', 'KeyS', 'KeyD' ];
}

const animate = () => {
  requestAnimationFrame( animate )
	controls.update()
	render();
}

const render = () => {
	const camera =  orthographicCamera;
	renderer.render( scene, camera );
}



const resizeElement = () => {
  const windowWidth = window.innerWidth 
  const windowHeight =  window.innerHeight 
  const deltaWidth = windowWidth - initialWindowWidth
  const deltaHeight = windowHeight - initialWindowHeight

  const width = initialWidth + deltaWidth
  const height = initialHeight + deltaHeight

  const aspect = width/height
  perspectiveCamera.aspect = aspect;
  perspectiveCamera.updateProjectionMatrix();
  orthographicCamera.left = - frustumSize * aspect / 2;
  orthographicCamera.right = frustumSize * aspect / 2;
  orthographicCamera.top = frustumSize / 2;
  orthographicCamera.bottom = - frustumSize / 2;
  orthographicCamera.updateProjectionMatrix();
  renderer.setSize(width, height);
  controls.handleResize();

}


const windowResizeFunc = () =>{
  if (resizeFlg !== false) {
    clearTimeout(resizeFlg)
  }
  resizeFlg = setTimeout(()=> {
    resizeElement()
  }, 100);
}



