// Communes
export var communes = [
  {"numcom": 60, "comnom": "La Chaux-de-Fonds"},
  {"numcom": 58, "comnom": "Les Ponts-de-Martel"},
  {"numcom": 3, "comnom": "Saint-Blaise"},
  {"numcom": 57, "comnom": "La Chaux-du-Milieu"},
  {"numcom": 61, "comnom": "Les Planchettes"},
  {"numcom": 10, "comnom": "Ligni\u00e8res"},
  {"numcom": 55, "comnom": "Le Cerneux-P\u00e9quignot"},
  {"numcom": 56, "comnom": "La Br\u00e9vine"},
  {"numcom": 7, "comnom": "Cressier (NE)"},
  {"numcom": 12, "comnom": "Cortaillod"},
  {"numcom": 33, "comnom": "La C\u00f4te-aux-F\u00e9es"},
  {"numcom": 72, "comnom": "Val-de-Travers"},
  {"numcom": 74, "comnom": "Val-de-Ruz"},
  {"numcom": 59, "comnom": "Brot-Plamboz"},
  {"numcom": 75, "comnom": "Rochefort"},
  {"numcom": 2, "comnom": "Hauterive (NE)"},
  {"numcom": 11, "comnom": "Boudry"},
  {"numcom": 73, "comnom": "Milvignes"},
  {"numcom": 9, "comnom": "Le Landeron"},
  {"numcom": 78, "comnom": "Le Locle"},
  {"numcom": 62, "comnom": "La Sagne"},
  {"numcom": 76, "comnom": "La Grande B\u00e9roche"},
  {"numcom": 6, "comnom": "Cornaux"},
  {"numcom": 77, "comnom": "Neuch\u00e2tel"},
  {"numcom": 8, "comnom": "Enges"},
  {"numcom": 71, "comnom": "La T\u00e8ne"},
  {"numcom": 35, "comnom": "Les Verri\u00e8res"}
]

communes = communes.sort((a, b) => a.comnom.toLowerCase().localeCompare(b.comnom.toLowerCase()))
// communes = communes.sort((a, b) => a.numcom - b.numcom)

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

  constructor(factor, description) {
    this._factor = factor
    this.description = description

  }

  get factor() {
    return this._factor
  }

  set factor(val) {
    this._factor = Math.max(Math.min(val, 100.0), 0.0)
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

  constructor(type, name, factors, reductions, area, numberOfHouses) {
    this.type = type
    this.name = name
    this.factors = factors
    this.range = { min: 0.0, max: 1.0 }
    this.reductions = reductions
    this._area = area
    this._numberOfHouses = parseFloat(numberOfHouses)
    this.active = false
  }

  get labels() {
    switch (this.type) {
      case 'Logement':
        return {primary: 'Habitant', secondary: 'Visiteur'}
      case 'Activité':
        return { primary: 'Employé', secondary: 'Client' }
    }
  }

  get area() {
    return this._area
  }

  set area(val){
    this._area = Math.max(parseFloat(val), 0.0)
  }

  get numberOfHouses() {
    return this._numberOfHouses
  }

  set numberOfHouses(val){
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
    return this.range.min !== this.range.max
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
    this.satac = ''
    this.commune = null
  }

  get hasRange() {
    return this.ranges.housing.min !== this.ranges.housing.max
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