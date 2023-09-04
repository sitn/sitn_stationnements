import communes_json from '../assets/data/communes.json'
// import affectations_json from '../assets/data/affectations.json'

export var communes = communes_json

export class MyAffectation {

  // constructor
  constructor(type, name, description, variables = [], factors = []) {
    this.type = type
    this.name = name
    this.description = description
    this.variables = variables
    this.factors = factors
    this.active = false
  }

  // getters

  // setters

  // methods

}


export const myaffectations = [
  new MyAffectation(
    "Logement",
    "Logements standards",
    "blablabla 1",
    [
      { name: "Surface brute de plancher [SBP]", unit: "m<sup>2</sup>", value: null },
      { name: "Nombre de logements", unit: "", value: null },
    ],
    [
      { name: "Habitant", formula: ((x, r = 1.0) => Math.max(0.01 * x[0], x[1]) * r) },
      { name: "Visiteur", formula: ((x, r = 1.0) => Math.max(0.001 * x[0], x[1]) * r) }
      // { name: "Habitant", formula: ((x, y, r = 1.0) => Math.max(0.01 * x, y) * r) },
      // { name: "Visiteur", formula: ((x, y, r = 1.0) => Math.max(0.001 * x, y) * r) }
    ]
  ),
  new MyAffectation(
    "Logement",
    "Logements avec encadrement ou étudiants",
    "blablabla 2",
    [
      { name: "Surface brute de plancher [SBP]", unit: "m<sup>2</sup>", value: null },
      { name: "Nombre de logements", unit: "", value: null },
    ],
    [
      { name: "Habitant", formula: ((x, r = 1.0) => Math.max(0.01 * x[0], x[1]) * r) },
      { name: "Visiteur", formula: ((x, r = 1.0) => Math.max(0.001 * x[0], x[1]) * r) }
    ]
  ),
  new MyAffectation(
    "Activité",
    "Industrie, artisanat",
    "blablabla 3",
    [
      { name: "Surface de vente", unit: "m<sup>2</sup>", value: null },
    ],
    [
      { name: "Habitant", formula: ((x) => 0.01 * x[0]) },
      { name: "Visiteur", formula: ((x) => 0.002 * x[0]) }
    ]
  ),
  new MyAffectation(
    "Activité",
    "Mini-golf",
    "blablabla 4",
    [
      { name: "Nombre d'équipements", unit: "", value: null },
    ],
    [
      { name: "Total", formula: ((x) => 6 * x[0]) }
    ]
  ),
  new MyAffectation(
    "Activité",
    "Gymnase, lycée",
    "blablabla 4",
    [
      { name: "Nombre de salles de classes", unit: "", value: null },
      { name: "Nombre d'élèves >= 18 ans", unit: "", value: null },
    ],
    [
      { name: "Total", formula: ((x) => x[0] + 0.1 * x[1]) },
    ]
  ),
  new MyAffectation(
    "Activité",
    "Test (calcul manuelle)",
    "blablabla 4",
    [
      { name: "Nombre de places habitant", unit: "", value: null },
      { name: "Nombre de places visiteur", unit: "", value: null },
    ],
    [
      { name: "Habitant", formula: ((x) => x[0]) },
      { name: "Visiteur", formula: ((x) => x[1]) }
    ]
  ),
]

// const bibi = new MyAffectation("Logement", "Logements standards", "")


// sort alphabetically
communes = communes.sort((a, b) => a.comnom.toLowerCase().localeCompare(b.comnom.toLowerCase()))

// Classes
const colors = { 'I': 'legend-1', 'II': 'legend-2', 'III': 'legend-3', 'IV': 'legend-4', 'V': 'legend-5', 'VI': 'legend-6' }

// Mob 20
export class Mob20 {

  constructor(type, area) {
    this.type = type;
    this.area = parseFloat(area);
  }

  get color() {
    return colors[this.type]
  }

}

// Location types
export class LocationTypes {

  constructor(name, ranges) {
    this.name = name
    this.ranges = ranges
    this.area = 0.0
    this.ratio = 0.0
  }

  get active() {
    return this.area > 0
  }

}

/*
const locations =  [
  new LocationTypes("I", { housing: { min: 0.2, max: 0.5 }, activity: { min: 0.0, max: 0.3 } }),
  new LocationTypes("II", { housing: { min: 0.5, max: 0.7 }, activity: { min: 0.2, max: 0.5 } }),
  new LocationTypes("III", { housing: { min: 0.7, max: 1.0 }, activity: { min: 0.4, max: 0.7 } }),
  new LocationTypes("IV", { housing: { min: 0.7, max: 1.0 }, activity: { min: 0.5, max: 0.8 } }),
  new LocationTypes("V", { housing: { min: 0.7, max: 0.7 }, activity: { min: 0.7, max: 0.7 } }),
  new LocationTypes("VI", { housing: { min: 0.7, max: 1.0 }, activity: { min: 0.9, max: 1.0 } })
]


export class LocationType {

  constructor(commune, type, affectation, min, max) {
    this.commune = commune
    this.type = type
    this.affectation = affectation
    this.min = 0.0
    this.max = 0.0
  }

}

const mylocations =  [

  new LocationType('Boudry', 'I', 'housing', 0.2, 0.5 ),
  new LocationType('Boudry', 'I', 'activity', 0.0, 0.3 ),
  new LocationType('Boudry', 'II', 'housing', 0.5, 0.7 ),
  new LocationType('Boudry', 'II', 'activity', 0.2, 0.5 ),
  new LocationType('Boudry', 'III', 'housing', 0.7, 1.0 ),
  new LocationType('Boudry', 'III', 'activity', 0.4, 0.7 ),
  new LocationType('Boudry', 'IV', 'housing', 0.7, 1.0 ),
  new LocationType('Boudry', 'IV', 'activity', 0.5, 0.8 ),
  new LocationType('Boudry', 'V', 'housing', 0.7, 1.0 ),
  new LocationType('Boudry', 'V', 'activity', 0.7, 1.0 ),
  new LocationType('Boudry', 'VI', 'housing', 0.7, 1.0 ),
  new LocationType('Boudry', 'VI', 'activity', 0.9, 1.0 ),

  new LocationType('Brot-Plamboz', 'I', 'housing', 0.2, 0.5 ),
  new LocationType('Brot-Plamboz', 'I', 'activity', 0.0, 0.3 ),
  new LocationType('Brot-Plamboz', 'II', 'housing', 0.5, 0.7 ),
  new LocationType('Brot-Plamboz', 'II', 'activity', 0.2, 0.5 ),
  new LocationType('Brot-Plamboz', 'III', 'housing', 0.7, 1.0 ),
  new LocationType('Brot-Plamboz', 'III', 'activity', 0.4, 0.7 ),
  new LocationType('Brot-Plamboz', 'IV', 'housing', 0.7, 1.0 ),
  new LocationType('Brot-Plamboz', 'IV', 'activity', 0.5, 0.8 ),
  new LocationType('Brot-Plamboz', 'V', 'housing', 0.7, 1.0 ),
  new LocationType('Brot-Plamboz', 'V', 'activity', 0.7, 1.0 ),
  new LocationType('Brot-Plamboz', 'VI', 'housing', 0.7, 1.0 ),
  new LocationType('Brot-Plamboz', 'VI', 'activity', 0.9, 1.0 ),

]
*/

// Reduction factor
export class Reduction {

  constructor(name, factor = 0.0, range = { min: 0.0, max: 100 }, description) {
    this.name = name
    this._factor = factor
    this.range = range
    this.description = description
  }

  get factor() {
    return this._factor
  }

  set factor(val) {
    this._factor = Math.max(Math.min(val, this.range.max), this.range.min)
  }

}

// Need
export class Need {

  constructor(type,) {
    this.type = type
    this.factors = factors
  }

}

// Affectation
export class Affectation {

  constructor(type, name, description, factors, reductions, area, numberOfHouses) {
    this.type = type
    this.name = name
    this.description = description
    this.factors = factors
    this.range = { min: 0.0, max: 1.0 }
    this.reductions = reductions
    this._area = area
    this._numberOfHouses = parseFloat(numberOfHouses)
    this.active = false
  }

  get valid() {
    return this._area > 0 && (this._numberOfHouses > 0 || this.type === 'Activité')
  }

  get myReductions() {

  }

  get labels() {
    switch (this.type) {
      case 'Logement':
        return { primary: 'Habitant', secondary: 'Visiteur' }
      case 'Activité':
        return { primary: 'Employé', secondary: 'Client' }
    }
  }

  get area() {
    return this._area
  }

  set area(val) {
    this._area = Math.max(parseFloat(val), 0.0)
  }

  get numberOfHouses() {
    return this._numberOfHouses
  }

  set numberOfHouses(val) {
    this._numberOfHouses = Math.max(parseFloat(val).toFixed(0), 0.0)
  }

  get needs() {
    let obj = { resident: { raw: 0.0, net: 0.0, reduced: 0.0 }, visitor: { raw: 0.0, net: 0.0, reduced: 0.0 } }

    obj.resident.raw = parseFloat(Math.max(this.area * this.factors.area * this.factors.resident, this.numberOfHouses))
    obj.visitor.raw = parseFloat((this.area * this.factors.area * this.factors.visitor))

    obj.resident.net = { min: this.range.min * parseFloat(obj.resident.raw), max: this.range.max * parseFloat(obj.resident.raw) }
    obj.visitor.net = { min: this.range.min * parseFloat(obj.visitor.raw), max: this.range.max * parseFloat(obj.visitor.raw) }

    obj.resident.reduced = { min: (1 - this.totalReduction) * obj.resident.net.min, max: (1 - this.totalReduction) * obj.resident.net.max }
    obj.visitor.reduced = { min: (1 - this.totalReduction) * obj.visitor.net.min, max: (1 - this.totalReduction) * obj.visitor.net.max }

    return obj
  }

  get totalNeed() {
    return { min: this.needs.resident.reduced.min + this.needs.visitor.reduced.min, max: this.needs.resident.reduced.max + this.needs.visitor.reduced.max }
  }

  get totalReduction() {
    if (this.reductions.length > 0) {
      return Math.min(this.reductions.reduce((acc, obj) => { return acc + obj.factor }, 0), 100) / 100
    } else {
      return 0.0
    }
  }

  get hasRange() {
    // console.log('Affectation range')
    // console.log(this.range)
    // UNCOMMENT NEXT LINE TO ACTIVATE ADAPTIVE COLUMNS (2 COLUMNS IF THE FACTOR HAS A RANGE, 1 COLUMN IF THE FACTOR IS UNIQUE)
    // return this.range.min !== this.range.max
    return true

  }

  get isHousing() {
    return this.type === "Logement"
  }

  get rawResidentNeed() {
    return parseFloat(Math.max(this.area * this.factors.area * this.factors.resident, this.numberOfHouses).toFixed(2))
  }
  get rawVisitorNeed() {
    return parseFloat((this.area * this.factors.area * this.factors.visitor).toFixed(2))
  }
  get rawTotalNeed() {
    return (this.rawResidentNeed + this.rawVisitorNeed).toFixed(2)
  }
  get netResidentNeed() {
    return { min: this.range.min * parseFloat(this.rawResidentNeed), max: this.range.max * parseFloat(this.rawResidentNeed) }
  }
  get netVisitorNeed() {
    return { min: this.range.min * parseFloat(this.rawVisitorNeed), max: this.range.max * parseFloat(this.rawVisitorNeed) }
  }
  get reducedNetResidentNeed() {
    return { min: (1 - this.totalReduction) * this.netResidentNeed.min, max: (1 - this.totalReduction) * this.netResidentNeed.max }
  }
  get reducedNetVisitorNeed() {
    return { min: (1 - this.totalReduction) * this.netVisitorNeed.min, max: (1 - this.totalReduction) * this.netVisitorNeed.max }
  }

}

// Project
export class Project {

  constructor(parcels, affectations, loctypes) {
    this.parcels = parcels
    this.loctypes = loctypes
    this.affectations = affectations
    this.ranges = { housing: { min: 0.0, max: 1.0 }, activity: { min: 0.0, max: 1.0 } }
    this._locationType = null // Location type is set manually by the user with a dropdown list
    this.locationTypeJustification = ''
    this.satac = ''
    this.commune = null
  }

  get reductions() {
    return this.affectations
      .filter(e => e.valid)
      .map(e => e.reductions.map((o) => ({ ...o, affectationName: e.name })))
      .flat(1)
  }

  get hasAffectation() {
    return this.affectations.filter(e => e.active).length > 0 && this.affectations.filter(e => e.active).map(e => e.valid).every(Boolean)
  }

  get isValid() {
    return this.hasAffectation && this._locationType !== null && this.commune !== null
  }

  get hasRange() {
    // UNCOMMENT NEXT LINE TO ACTIVATE ADAPTIVE COLUMNS (2 COLUMNS IF THE FACTOR HAS A RANGE, 1 COLUMN IF THE FACTOR IS UNIQUE)
    // return this.ranges.housing.min !== this.ranges.housing.max
    return true
  }

  get totalNeed() {

    let activeAffectations = this.affectations.filter(e => e.active)
    let obj = { min: 0.0, max: 0.0 }
    if (activeAffectations.length > 0) {
      obj.min = activeAffectations.reduce((acc, obj) => { return acc + obj.totalNeed.min }, 0)
      obj.max = activeAffectations.reduce((acc, obj) => { return acc + obj.totalNeed.max }, 0)
    }
    return obj

  }

  get locationType() {
    if (this._locationType !== null) {
      return this._locationType
    } else {
      return null
    }
  }

  set locationType(val) {

    this._locationType = null

    if (val !== null) {

      this._locationType = val
      let ranges = this.loctypes.find(el => el.name === val.name).ranges

      // set project ranges
      this.ranges.housing = ranges.housing
      this.ranges.activity = ranges.activity

      // set ranges for each affectation
      this.affectations.forEach(affectation => {

        switch (affectation.type) {
          case 'Logement':
            affectation.range = ranges.housing
            break
          case 'Activité':
            affectation.range = ranges.activity
            break
        }

      })

      console.log(`App.vue | Location type set to: ${val.name}`)
      console.log(this.locationType)

    }

  }

  getAffectation(name) {
    return this.affectations.find(obj => obj.name === name)
  }

  getLocationType(name) {
    return this.loctypes.find(obj => obj.name === name)
  }

}