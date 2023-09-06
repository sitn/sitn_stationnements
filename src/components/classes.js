import communes_json from '../assets/data/communes.json'

// sort alphabetically
export var communes = communes_json.sort((a, b) => a.comnom.toLowerCase().localeCompare(b.comnom.toLowerCase()))


class Formula {

  // constructor
  constructor(name, equation) {
    this.name = name
    this.equation = equation
  }

}


export class Affectation {

  // constructor
  constructor(type, name, description, variables = [], factors = [], reductions = []) {
    this.type = type
    this.name = name
    this.description = description
    this.variables = variables
    this.factors = factors
    this.reductions = reductions
    this.active = false
  }

  // getters
  get valid() {
    return this.variables.map((x) => x.value >= x.min && x.value <= x.max).every(Boolean)
  }

  get output() {
    return this.factors.map(o => o.formula(this.variables.filter((x) => x.type === "measurement").map(x => x.value), 1.0, 0.0))
  }

  get netOutput() {
    return this.factors.map(o => o.formula(this.variables.filter((x) => x.type === "measurement").map(x => x.value), this.ordinaryReduction, 0.0))
  }

  get reducedOutput() {
    return this.factors.map(o => o.formula(this.variables.filter((x) => x.type === "measurement").map(x => x.value), this.ordinaryReduction, this.specialReduction))
  }

  get totalOutput() {
    return this.reducedOutput.reduce((acc, obj) => { return acc + obj }, 0)
  }

  get ordinaryReduction() {
    return this.variables.filter((x) => x.type === "reduction").reduce((acc, obj) => { return acc + obj.value }, 0)
    // return Math.min(this.variables.filter((x) => x.type === "reduction").reduce((acc, obj) => { return acc + obj.value }, 0), 1.0)
  }


  get specialReduction() {
    return Math.min(this.variables.filter((x) => x.type === "special reduction").reduce((acc, obj) => { return acc + obj.value }, 0), 100.0)
  }


  /*
  get netReduction() {
    return Math.min(this.reductions.filter((x) => x.type === "reduction").reduce((acc, obj) => { return acc + obj.value }, 0), 1.0)
  }
  */

  /*
  get totalReduction() {
    return Math.min(this.reductions.reduce((acc, obj) => { return acc + obj.value }, 0), 1.0)
  }
  */


  // setters
  /*
  set reduction(val) {
    this.reductions.find(e => e.type === "reduction") = val
  }
  */

  // methods

}


export const affectations = [
  new Affectation(
    "Logement",
    "Logements standards",
    "",
    [
      { name: "Surface brute de plancher [SBP]", type: "measurement", unit: "m<sup>2</sup>", min: 0.0, max: Infinity, value: null },
      { name: "Nombre de logements", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", type: "reduction", unit: "%", min: 0.0, max: 1.0, value: 1.0 },
      { name: "art. 33", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 }
    ],
    [
      { name: "Habitants", formula: ((x, f = 1.0, r = 0.0) => Math.max(0.01 * x[0], x[1]) * f * (1 - r / 100)) },
      { name: "Visiteurs", formula: ((x, f = 1.0, r = 0.0) => 0.001 * x[0] * f * (1 - r / 100)) }
    ],
    [
      { name: "zone", type: "reduction", unit: "%", min: 0.0, max: 1.0, value: 1.0 },
      { name: "art 1", type: "special reduction", unit: "%", min: 0.0, max: 1.0, value: 1.0 },
      { name: "art 2", type: "special reduction", unit: "%", min: 0.0, max: 1.0, value: 1.0 },
    ]
  ),
  new Affectation(
    "Logement",
    "Logements avec encadrement ou étudiants",
    "",
    [
      { name: "Surface brute de plancher [SBP]", type: "measurement", unit: "m<sup>2</sup>", min: 0.0, max: Infinity, value: null },
      { name: "Nombre de logements", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", type: "reduction", unit: "%", min: 0.0, max: 1.0, value: 1.0 },
      { name: "art. 33", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "art. 34", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "Habitants", formula: ((x, f = 1.0, r = 0.0) => Math.max(0.01 * x[0], x[1]) * f * (1 - r / 100)) },
      { name: "Visiteurs", formula: ((x, f = 1.0, r = 0.0) => 0.001 * x[0] * f * (1 - r / 100)) }
    ],
    [
      { name: "zone", type: "reduction", unit: "%", min: 0.0, max: 1.0, value: 1.0 },
      { name: "art 1", type: "special reduction", unit: "%", min: 0.0, max: 1.0, value: 1.0 },
      { name: "art 2", type: "special reduction", unit: "%", min: 0.0, max: 1.0, value: 1.0 },
    ]
  ),
  new Affectation(
    "Activité",
    "Services à nombreuse clientèle",
    "(banque, poste administration publique avec guichets, agence de voyage médecin, dentiste, cabinet de soins, eproduction et copie, nettoyage chimique coiffeur,…)",
    [
      { name: "Surface brute de plancher [SBP]", type: "measurement", unit: "m<sup>2</sup>", min: 0.0, max: Infinity, value: null },
      { name: "zone", type: "reduction", unit: "%", min: 0.0, max: 1.0, value: 1.0 },
      { name: "art. 31", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "art. 32", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "art. 33", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "Personnel", formula: ((x, f = 1.0, r = 0.0) => (0.02 * x[0]) * f * (1 - r / 100)) },
      { name: "Clients", formula: ((x, f = 1.0, r = 0.0) => (0.01 * x[0]) * f * (1 - r / 100)) }
    ],
    [
      { name: "zone", type: "reduction", unit: "%", min: 0.0, max: 1.0, value: 1.0 },
      { name: "art 1", type: "special reduction", unit: "%", min: 0.0, max: 1.0, value: 1.0 },
      { name: "art 2", type: "special reduction", unit: "%", min: 0.0, max: 1.0, value: 1.0 },
    ]
  ),
  new Affectation(
    "Activité",
    "Magasins à nombreuse clientèle",
    "(alimentation, pharmacie, droguerie, grand magasin, kiosque, …)",
    [
      { name: "Surface brute de plancher [SBP]", type: "measurement", unit: "m<sup>2</sup>", min: 0.0, max: Infinity, value: null },
      { name: "zone", type: "reduction", unit: "%", min: 0.0, max: 1.0, value: 1.0 },
      { name: "art. 31", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "art. 32", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "art. 33", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "Personnel", formula: ((x, f = 1.0, r = 0.0) => (0.02 * x[0]) * f * (1 - r / 100)) },
      { name: "Clients", formula: ((x, f = 1.0, r = 0.0) => (0.08 * x[0]) * f * (1 - r / 100)) }
    ],
    [
      { name: "zone", type: "reduction", unit: "%", min: 0.0, max: 1.0, value: 1.0 },
      { name: "art 1", type: "special reduction", unit: "%", min: 0.0, max: 1.0, value: 1.0 },
      { name: "art 2", type: "special reduction", unit: "%", min: 0.0, max: 1.0, value: 1.0 },
    ]
  ),
  new Affectation(
    "Activité",
    "Industrie, artisanat",
    "",
    [
      { name: "Surface de vente", type: "measurement", unit: "m<sup>2</sup>", min: 0.0, max: Infinity, value: null },
      { name: "zone", type: "reduction", unit: "%", min: 0.0, max: 1.0, value: 1.0 },
      { name: "art. 31", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "art. 32", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "art. 33", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "Personnel", formula: ((x, f = 1.0, r = 0.0) => 0.01 * x[0] * f * (1 - r / 100)) },
      { name: "Clients", formula: ((x, f = 1.0, r = 0.0) => 0.002 * x[0] * f * (1 - r / 100)) }
    ],
    [
      { name: "zone", type: "reduction", unit: "%", min: 0.0, max: 1.0, value: 1.0 },
      { name: "art 1", type: "special reduction", unit: "%", min: 0.0, max: 1.0, value: 1.0 },
      { name: "art 2", type: "special reduction", unit: "%", min: 0.0, max: 1.0, value: 1.0 },
    ]
  ),
  new Affectation(
    "Activité",
    "Mini-golf",
    "",
    [
      { name: "Nombre d'équipements", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", type: "reduction", unit: "%", min: 0.0, max: 1.0, value: 1.0 },
      { name: "art. 31", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "art. 32", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "art. 33", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "Total", formula: ((x, f = 1.0, r = 0.0) => 6 * x[0] * f * (1 - r / 100)) }
    ],
    [
      { name: "zone", type: "reduction", unit: "%", min: 0.0, max: 1.0, value: 1.0 },
    ]
  ),
  new Affectation(
    "Activité",
    "Gymnase, lycée",
    "",
    [
      { name: "Nombre de salles de classes", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "Nombre d'élèves >= 18 ans", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", type: "reduction", unit: "%", min: 0.0, max: 1.0, value: 1.0 },
      { name: "art. 31", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "art. 32", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "art. 33", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "Total", formula: ((x, f = 1.0, r = 0.0) => (x[0] + 0.1 * x[1]) * f * (1 - r / 100)) },
    ],
    [
      { name: "zone", type: "reduction", unit: "%", min: 0.0, max: 1.0, value: 1.0 },
    ]
  ),
  new Affectation(
    "Activité",
    "Test (calcul manuel)",
    "",
    [
      { name: "Nombre de places habitant", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "Nombre de places visiteur", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", type: "reduction", unit: "%", min: 0.0, max: 1.0, value: 1.0 },
      { name: "art. 31", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "art. 32", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "art. 33", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "Habitants", formula: ((x, f = 1.0, r = 0.0) => x[0] * f * (1 - r / 100)) },
      { name: "Visiteurs", formula: ((x, f = 1.0, r = 0.0) => x[1] * f * (1 - r / 100)) }
    ],
    [
      { name: "zone", type: "reduction", unit: "%", min: 0.0, max: 1.0, value: 1.0 },
    ]
  ),
]

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

// Project
export class Project {

  constructor(parcels, affectations, loctypes) {
    this.parcels = parcels
    this.loctypes = loctypes
    this.affectations = affectations
    this._locationType = null // Location type is set manually by the user with a dropdown list
    this.locationTypeJustification = '' // Location type justification
    this.satac = '' // N° SATAC
    this.commune = null // Commune
  }

  /*
  get reductions() {
    return this.affectations
      .filter(e => e.valid)
      .map(e => e.reductions.map((o) => ({ ...o, affectationName: e.name })))
      .flat(1)
  }
  */

  get hasAffectation() {
    return this.affectations.filter(e => e.active).length > 0 /* && this.affectations.filter(e => e.active).map(e => e.valid).every(Boolean) */
  }

  get isValid() {
    return this.hasAffectation && this._locationType !== null && this.commune !== null
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
      // this.ranges.housing = ranges.housing
      // this.ranges.activity = ranges.activity

      // set ranges for each affectation
      /*
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
      */
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