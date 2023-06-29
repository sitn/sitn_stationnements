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
  // constructor(name, housingRange, activityRange) {
  constructor(name, ranges) {
    // this.commune = commune
    this.name = name
    this.ranges = ranges
    // this.housingRange = housingRange
    // this.activityRange = activityRange

    this.area = 0.0
    this.ratio = 0.0
  }
  get active() {
    return this.area > 0
  }

}

// Reduction factor
export class Reduction {
  constructor(factor, description) {
    this._factor = factor
    this.description = description
  }
  get factor() {
    return this._factor * 100
  }
  set factor(val) {
    this._factor = val / 100
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
    this.area = parseFloat(area)
    this.numberOfHouses = parseFloat(numberOfHouses)
    this.active = false

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
    console.log('Affectation range')
    console.log(this.range)
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
    this.housingRange = { min: 0.0, max: 1.0 }
    this.activityRange = { min: 0.0, max: 1.0 }
    this._locationType = null
  }

  get hasRange() {
    return false// this.range.min !== this.range.max
  }

  get totalNeed() {
    let activeAffectations = this.affectations.filter(e => e.active)
    if (activeAffectations > 0) {
      let obj = { min: 0.0, max: 0.0 }
      obj.min = activeAffectations.reduce((acc, obj) => { return acc + obj.totalNeed.min }, 0)
      obj.max = activeAffectations.reduce((acc, obj) => { return acc + obj.totalNeed.max }, 0)
      return obj
    } else {
      return { min: 0.0, max: 0.0 }
    }
  }

  get commune() {
    return 'default'
  }

  get locationType() {
    if (this._locationType !== null) {
      return this._locationType
    } else {
      return null
    }
  }

  set locationType(location) {

    // let labels = ['I', 'II', 'III', 'IV', 'V', 'VI']
    //if (labels.includes(location.name)) {

    if (location !== null) {

      console.log(`App.vue | Location type set to: ${location.name}`)
      this._locationType = location
      // let ranges = locationTypes.find(el => el.name === location.name).ranges
      let ranges = this.loctypes.find(el => el.name === location.name).ranges

      // console.log('ranges')
      // console.log(locationType)

      // set project ranges
      this.housingRange = ranges.housing
      this.activityRange = ranges.activity

      this.ranges.housing = ranges.housing
      this.ranges.activity = ranges.activity


      // set ranges for each affectation
      this.affectations.forEach(affectation => {

        switch (affectation.type) {
          case 'Logement':
            affectation.range = ranges.housing // ranges.housingRange
            break
          case 'Activité':
            affectation.range = ranges.activity // ranges.activityRange
            break
        }

      })

    } else {
      this._locationType = null
    }

  }
  getAffectation(name) {
    return this.affectations.find(obj => obj.name === name)
  }

  getLocationType(name) {
    return this.loctypes.find(obj => obj.name === name)
  }

}