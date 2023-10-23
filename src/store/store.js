import { reactive } from 'vue'
import { classes } from '../helpers/classes.js'

export const store = reactive({
  count: 0
})


class Mob20 {
  constructor(type, area) {
    this.type = type;
    this.area = area;
  }
}

let locations = []
locations.push(new Mob20('I', 1000 * Math.random()))
locations.push(new Mob20('II', 1000 * Math.random()))
locations.push(new Mob20('III', 1000 * Math.random()))
locations.push(new Mob20('IV', 1000 * Math.random()))
locations.push(new Mob20('V', 1000 * Math.random()))
locations.push(new Mob20('VI', 1000 * Math.random()))