import { reactive } from 'vue'
import { Project, LocationTypes, Mob20, affectations } from '../helpers/classes.js'

const project = new Project(
  [],
  affectations,
  [
    new LocationTypes("I", { housing: { min: 0.2, max: 0.5 }, activity: { min: 0.0, max: 0.4 } }),
    new LocationTypes("II", { housing: { min: 0.5, max: 0.7 }, activity: { min: 0.2, max: 0.5 } }),
    new LocationTypes("III", { housing: { min: 0.7, max: 1.0 }, activity: { min: 0.4, max: 0.7 } }),
    new LocationTypes("IV", { housing: { min: 0.7, max: 1.0 }, activity: { min: 0.5, max: 0.8 } }),
    new LocationTypes("V", { housing: { min: 0.7, max: 1.0 }, activity: { min: 0.7, max: 1.0 } }),
    new LocationTypes("VI", { housing: { min: 0.7, max: 1.0 }, activity: { min: 0.9, max: 1.0 } })
  ]
)

export const store = reactive({
  project: project,
  validity: { 'A': false, 'B': false, 'C': false, 'D': false, 'E': true },
})