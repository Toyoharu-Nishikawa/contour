import {clearContour} from "./draw.js"

const elements = {
  clear: document.getElementById("clear")
}

export const initialize = () => {
  elements.clear.onclick = clearExe
}

const clearExe = () => {
  clearContour()
}
