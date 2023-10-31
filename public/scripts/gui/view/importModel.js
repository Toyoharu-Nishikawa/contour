import {importFiles} from "../../filereader/index.js"
import {clearContour,drawContour} from "./draw.js"

const elements = {
  importModel: document.getElementById("importModel"),
  importModelFile: document.getElementById("importModelFile"),
}

export const initialize = () => {
  elements.importModel.onclick = importModelExe
}

const importModelExe = async () => {
  const element = elements.importModelFile
  const texts = await importFiles(element,"text")
  console.log("texts",texts)
  const text = texts[0].fileData
  console.log("text",text)
  
  const data = csvParse(text)
  
  const n = 128;
  const m = 128;
  const values = data.map(v=>v[3])
  const min= values.reduce((p,c)=>Math.min(p,c))
  const max= values.reduce((p,c)=>Math.max(p,c))

  const thresholds = d3.range(0, 20).map(function(p) { return (max-min)/20*p+min })
 
  const contours = d3.contours()
    .size([n, m])
    .thresholds(thresholds);
 
  const contour = contours(values)
  clearContour()
  drawContour(contour)

}

const csvParse = csv => csv
  .split(/\r\n|\n|\r/) //split by line feed codes
  .filter((k)=>k.match(/[^,\s\f\n\r\t\v]/)) //remove empty lines
  .map((k)=>k.trim() //remove white spaces of begining and end of line
    .replace(/,\s+/g,",") //remove white spaces
    .split(",") //split by cannma
    .map((l)=>isNaN(l)? l:parseFloat(l)) //convert string to flot
  )
