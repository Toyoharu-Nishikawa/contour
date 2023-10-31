import * as view from "./view.js"

export const initialize = () => {
  console.log("initialize")
  view.draw.initialize()
  view.clear.initialize()
  view.importModel.initialize()
}


