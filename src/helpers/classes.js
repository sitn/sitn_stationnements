import communes_json from '../assets/data/communes.json'

// sort alphabetically
export var communes = communes_json.sort((a, b) => a.comnom.toLowerCase().localeCompare(b.comnom.toLowerCase()))

export class Variable {

  // constructor
  constructor({
    name,
    description = "",
    type,
    hint = "",
    unit,
    min = null,
    max = null,
    value = null,
  } = {}) {
    this.name = name
    this.description = description
    this.type = type
    this.hint = hint
    this.unit = unit
    this.min = min
    this.max = max
    this.value = value
  }
}

let didi = new Variable({
  name: "Surface brute de plancher (SBP)",
  description: "",
  type: "measurement",
  hint: "",
  unit: "m<sup>2</sup>",
  min: 1.0,
  max: Infinity,
  value: null,
})

export class Output {


}


export class Affectation {

  // constructor
  //constructor(type, category, name, description, automatic = false, variables = [], outputs = []) {
  constructor({
    type,
    category = "",
    name,
    description = "",
    active = false,
    automatic,
    variables = [],
    outputs = [],
  } = {}) {
    this.type = type // used for parking
    this.category = category // used for EV stations
    this.name = name
    this.description = description
    this._variables = variables // input
    this._outputs = outputs // output
    this.active = active
    this.automatic = automatic
  }

  // getters
  get valid() {
    return this.variables.map((x) => x.value >= x.min && x.value <= x.max).every(Boolean)
  }

  get variables() {
    return Object.values(this._variables)
  }

  set variables(x) {
    this._variables = x;
  }

  get outputs() {
    return Object.values(this._outputs)
  }

  set outputs(x) {
    this._outputs = x;
  }

  // RETURNS SET OF UNIQUE OUTPUT GROUPS (CAR, MOTORCYCLE, BICYCLE, STATION, ETC) 
  get outputGroups() {
    return new Set(this.outputs.map(o => o.group))
  }

  get output() {
    return this.outputs.map(o => o.formula(this.variables.filter((x) => x.type === "measurement").map(x => x.value), 100.0, 0.0))
  }

  // RETURNS RAW OUTPUT ("BESOIN BRUT")
  get rawOutput() {
    return this.ouputs.map(o => ({ name: o.name, group: o.group, value: o.formula(this.variables.filter((x) => x.type === "measurement").map(x => x.value), 100.0, 0.0) }))
    // return this.outputs.map(o => ({ name: o.name, group: o.group, value: o.formula(this.variables.filter((x) => x.type === "measurement").map(x => x.value), 100.0, 0.0) }))
  }

  // RETURNS NET OUTPUT ("BESOIN NET")
  get netOutput() {
    return this.outputs.map(o => o.formula(this.variables.filter((x) => x.type === "measurement").map(x => x.value), this.ordinaryReduction, 0.0))
  }

  get netOutput2() {
    return this.outputs.map(o => ({ name: o.name, group: o.group, value: o.formula(this.variables.filter((x) => x.type === "measurement").map(x => x.value), this.ordinaryReduction, 0.0) }))
  }

  // RETURNS REDUCED OUTPUT ("BESOIN NET REDUIT")
  get reducedOutput() {
    return this.outputs.map(o => o.formula(this.variables.filter((x) => x.type === "measurement").map(x => x.value), this.ordinaryReduction, this.specialReduction))
  }

  get reducedOutput2() {
    return this.outputs.map(o => ({ name: o.name, group: o.group, value: o.formula(this.variables.filter((x) => x.type === "measurement").map(x => x.value), this.ordinaryReduction, this.specialReduction) }))
  }

  get totalOutput() {
    return this.output.reduce((acc, obj) => { return acc + obj }, 0)
  }

  get totalOutput2() {
    return 42 //[{ group: 'car', value: 1.0 }, { group: 'bicycle', value: 2.0 }, { group: 'motorcycle', value: 3.0 }, { group: 'station', value: 4.0 }]
  }


  /*
  get totalOutputArray() {
    return this.output.reduce((acc, obj) => {
      if (!acc[obj.group]) { acc[obj.group] = { group: obj.group, value: 0 } }

    }, 0)
  }
  */

  get totalNetOutput() {
    return this.netOutput.reduce((acc, obj) => { return acc + obj }, 0)
  }

  get totalReducedOutput() {
    return this.reducedOutput.reduce((acc, obj) => { return acc + obj }, 0)
  }

  get totalReducedOutputCeil() {
    return this.reducedOutput.reduce((acc, obj) => { return acc + Math.ceil(obj) }, 0)
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

  /*
  new Affectation({
    type: "Logement",
    category: "Logement",
    name: "Logements standards - MAP TEST",
    description: "",
    automatic: true,
    variables: new Map([
      ["floor_area", { name: "Surface brute de plancher (SBP)", description: "", type: "measurement", unit: "m<sup>2</sup>", min: 1.0, max: Infinity, value: null, hint: "" }],
      ["n_housings", { name: "# logements", description: "", type: "measurement", unit: "", min: 1.0, max: Infinity, value: null, hint: "" }],
      ["n_rooms", { name: "# pièces (total)", description: "", type: "measurement", unit: "", min: 1.0, max: Infinity, value: null, hint: "" }],
      ["n_shared", { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" }],
      ["zone_reduction", { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" }],
      ["env_reduction", { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" }]
    ]),
    outputs: new Map([
      ["n_parks_1", { group: "car", icon: "directions_car", name: "# places voitures habitants", formula: ((x, f = 100.0, r = 0.0) => Math.max(0.01 * x.get('floor_area'), x.get('n_housings')) * (f / 100) * (1 - r / 100)) }],
      ["n_parks_2", { group: "car", icon: "directions_car", name: "# places voitures visiteurs", formula: ((x, f = 100.0, r = 0.0) => 0.001 * x.get('floor_area') * (f / 100) * (1 - r / 100)) }],
      ["n_parks_3", { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x.get('n_shared') * 1.0) }],
      ["n_parks_4", { group: "motorcycle", icon: "motorcycle", name: "# places motos habitants/visiteurs", formula: ((x, f = 100.0, r = 0.0) => (x.get('n_housings') > 2) * 0.15 * (Math.max(0.01 * x.get('floor_area'), x.get('n_housings')) + 0.001 * x.get('floor_area')) * (f / 100) * (1 - r / 100)) }],
      ["n_parks_5", { group: "bicycle", icon: "directions_bike", name: "# places vélos habitants/visiteurs", formula: ((x) => Math.floor(x.get('n_rooms'))) }],
      ["n_parks_6", { group: "station", icon: "ev_station", name: "# équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => (x.get('n_housings') > 2) * Math.max(Math.min((Math.max(0.01 * x.get('floor_area'), x.get('n_housings')) + 0.001 * x.get('floor_area')) * (f / 100) * (1 - r / 100) / 3, 50), 1)) }],
    ])
  }),
  */

  new Affectation({
    type: "Logement",
    category: "Logement",
    name: "Logements standards - OBJECT TEST",
    description: "",
    automatic: true,
    variables: {
      floor_area: { name: "Surface brute de plancher (SBP)", description: "", type: "measurement", unit: "m<sup>2</sup>", min: 1.0, max: Infinity, value: null, hint: "" },
      n_housings: { name: "# logements", description: "", type: "measurement", unit: "", min: 1.0, max: Infinity, value: null, hint: "" },
      n_rooms: { name: "# pièces (total)", description: "", type: "measurement", unit: "", min: 1.0, max: Infinity, value: null, hint: "" },
      n_shared: { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      zone_reduction: { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      env_reduction: { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" }
    },
    outputs: {
      n_parks_1: { group: "car", icon: "directions_car", name: "# places voitures habitants", formula: ((x, f = 100.0, r = 0.0) => Math.max(0.01 * x.floor_area, x.n_housings) * (f / 100) * (1 - r / 100)) },
      n_parks_2: { group: "car", icon: "directions_car", name: "# places voitures visiteurs", formula: ((x, f = 100.0, r = 0.0) => 0.001 * x.floor_area * (f / 100) * (1 - r / 100)) },
      n_parks_3: { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x.n_shared * 1.0) },
      n_parks_4: { group: "motorcycle", icon: "motorcycle", name: "# places motos habitants/visiteurs", formula: ((x, f = 100.0, r = 0.0) => (x.n_housings > 2) * 0.15 * (Math.max(0.01 * x.floor_area, x.n_housings) + 0.001 * x.floor_area) * (f / 100) * (1 - r / 100)) },
      n_parks_5: { group: "bicycle", icon: "directions_bike", name: "# places vélos habitants/visiteurs", formula: ((x) => Math.floor(x.n_rooms)) },
      n_parks_6: { group: "station", icon: "ev_station", name: "# équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => (x.n_housings > 2) * Math.max(Math.min((Math.max(0.01 * x.floor_area, x.n_housings) + 0.001 * x.floor_area) * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    }
  }),


  /*
  new Affectation({
    type: "Logement",
    category: "Logement",
    name: "Logements standards",
    description: "",
    automatic: true,
    variables: [
      { name: "Surface brute de plancher (SBP)", description: "", type: "measurement", unit: "m<sup>2</sup>", min: 1.0, max: Infinity, value: null, hint: "" },
      { name: "# logements", description: "", type: "measurement", unit: "", min: 1.0, max: Infinity, value: null, hint: "" },
      { name: "# pièces (total)", description: "", type: "measurement", unit: "", min: 1.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" }
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures habitants", formula: ((x, f = 100.0, r = 0.0) => Math.max(0.01 * x[0], x[1]) * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places voitures visiteurs", formula: ((x, f = 100.0, r = 0.0) => 0.001 * x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos habitants/visiteurs", formula: ((x, f = 100.0, r = 0.0) => (x[1] > 2) * 0.15 * (Math.max(0.01 * x[0], x[1]) + 0.001 * x[0]) * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "# places vélos habitants/visiteurs", formula: ((x) => Math.floor(x[2])) },
      { group: "station", icon: "ev_station", name: "# équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => (x[1] > 2) * Math.max(Math.min((Math.max(0.01 * x[0], x[1]) + 0.001 * x[0]) * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Logement",
    category: "Logement",
    name: "Logements avec encadrement",
    description: "",
    automatic: true,
    variables: [
      { name: "Surface brute de plancher (SBP)", description: "", type: "measurement", unit: "m<sup>2</sup>", min: 1.0, max: Infinity, value: null, hint: "" },
      { name: "# logements", description: "", type: "measurement", unit: "", min: 1.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Logements avec encadrement ou étudiants", description: "Un facteur de réduction (maximum 50%) peut s'appliquer pour les logements avec encadrement dédiés aux bénéficiaires AVS/AI ou étudiants. Référez-vous à l’article 34 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 50.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures habitants", formula: ((x, f = 100.0, r = 0.0) => Math.max(0.01 * x[0], x[1]) * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places voitures visiteurs", formula: ((x, f = 100.0, r = 0.0) => 0.001 * x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[2] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos habitants/visiteurs", formula: ((x, f = 100.0, r = 0.0) => (x[1] > 2) * 0.15 * (Math.max(0.01 * x[0], x[1]) + 0.001 * x[0]) * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "# places vélos habitants/visiteurs", formula: ((x) => Math.floor(x[1])) },
      { group: "station", icon: "ev_station", name: "# équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => (x[1] > 2) * Math.max(Math.min((Math.max(0.01 * x[0], x[1]) + 0.001 * x[0]) * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Logement",
    category: "Logement",
    name: "Logements pour étudiants",
    description: "",
    automatic: true,
    variables: [
      { name: "Surface brute de plancher (SBP)", description: "", type: "measurement", unit: "m<sup>2</sup>", min: 1.0, max: Infinity, value: null, hint: "" },
      { name: "# logements", description: "", type: "measurement", unit: "", min: 1.0, max: Infinity, value: null, hint: "" },
      { name: "# pièces (total)", description: "", type: "measurement", unit: "", min: 1.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Logements avec encadrement ou étudiants", description: "Un facteur de réduction (maximum 50%) peut s'appliquer pour les logements avec encadrement dédiés aux bénéficiaires AVS/AI ou étudiants. Référez-vous à l’article 34 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 50.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures habitants", formula: ((x, f = 100.0, r = 0.0) => Math.max(0.01 * x[0], x[1]) * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places voitures visiteurs", formula: ((x, f = 100.0, r = 0.0) => 0.001 * x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos habitants/visiteurs", formula: ((x, f = 100.0, r = 0.0) => (x[1] > 2) * 0.15 * (Math.max(0.01 * x[0], x[1]) + 0.001 * x[0]) * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "# places vélos habitants/visiteurs", formula: ((x) => Math.floor(x[2])) },
      { group: "station", icon: "ev_station", name: "# équipements niv. C2", formula: ((x, f = 100.0, r = 0.0) => (x[1] > 2) * Math.max(Math.min((Math.max(0.01 * x[0], x[1]) + 0.001 * x[0]) * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Industrie, artisanat",
    description: "",
    automatic: true,
    variables: [
      { name: "Surface brute de plancher (SBP)", description: "", type: "measurement", unit: "m<sup>2</sup>", min: 1.0, max: Infinity, value: null, hint: "" },
      { name: "# postes de travail", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à remplir si vous souhaitez l'utiliser pour le calcul des places vélos, sinon indiquer 0" },
      { name: "# places pour véhicules d’entreprise", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel", formula: ((x, f = 100.0, r = 0.0) => 0.01 * x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places voitures clients", formula: ((x, f = 100.0, r = 0.0) => 0.002 * x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour véhicules d’entreprise", formula: ((x) => x[2] * 1.0) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * (0.01 * x[0] + 0.002 * x[0]) * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "# places vélos personnel", formula: ((x) => x[1] > 0 ? Math.ceil(0.2 * x[1]) : Math.ceil(0.004 * x[0])) },
      { group: "bicycle", icon: "directions_bike", name: "# places vélos visiteurs", formula: ((x) => x[1] > 0 ? Math.ceil(0.05 * x[1]) : Math.ceil(0.001 * x[0])) },
      { group: "station", icon: "ev_station", name: "# équipements niv. C2", formula: ((x, f = 100.0, r = 0.0) => Math.max(Math.min((0.01 * x[0] + 0.002 * x[0]) * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Entrepôts et dépôts",
    description: "",
    automatic: true,
    variables: [
      { name: "Surface brute de plancher (SBP)", description: "", type: "measurement", unit: "m<sup>2</sup>", min: 1.0, max: Infinity, value: null, hint: "" },
      { name: "# postes de travail", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à remplir si vous souhaitez l'utiliser pour le calcul des places vélos, sinon indiquer 0" },
      { name: "# places pour véhicules d’entreprise", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel", formula: ((x, f = 100.0, r = 0.0) => 0.001 * x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places voitures clients", formula: ((x, f = 100.0, r = 0.0) => 0.0001 * x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour véhicules d’entreprise", formula: ((x) => x[2] * 1.0) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * (0.001 * x[0] + 0.0001 * x[0]) * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "# places vélos personnel", formula: ((x) => x[1] > 0 ? Math.ceil(0.2 * x[1]) : Math.ceil(0.004 * x[0])) },
      { group: "bicycle", icon: "directions_bike", name: "# places vélos visiteurs", formula: ((x) => x[1] > 0 ? Math.ceil(0.05 * x[1]) : Math.ceil(0.001 * x[0])) },
      { group: "station", icon: "ev_station", name: "# équipements niv. C2", formula: ((x, f = 100.0, r = 0.0) => Math.max(Math.min((0.001 * x[0] + 0.0001 * x[0]) * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Services à nombreuse clientèle",
    description: "(banque, poste administration publique avec guichets, agence de voyage médecin, dentiste, cabinet de soins, reproduction et copie, nettoyage chimique, coiffeur,…)",
    automatic: true,
    variables: [
      { name: "Surface brute de plancher (SBP)", description: "", type: "measurement", unit: "m<sup>2</sup>", min: 1.0, max: Infinity, value: null, hint: "" },
      { name: "# postes de travail", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à remplir si vous souhaitez l'utiliser pour le calcul des places vélos, sinon indiquer 0" },
      { name: "# places pour véhicules d’entreprise", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places personnel", formula: ((x, f = 100.0, r = 0.0) => (0.02 * x[0]) * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places clients", formula: ((x, f = 100.0, r = 0.0) => (0.01 * x[0]) * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour véhicules d’entreprise", formula: ((x) => x[2] * 1.0) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos habitants/visiteurs", formula: ((x, f = 100.0, r = 0.0) => 0.15 * (0.02 * x[0] + 0.01 * x[0]) * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "# places vélos personnel", formula: ((x) => x[1] > 0 ? Math.ceil(0.2 * x[1]) : Math.ceil(0.01 * x[0])) },
      { group: "bicycle", icon: "directions_bike", name: "# places vélos visiteurs", formula: ((x) => x[1] > 0 ? Math.ceil(0.3 * x[1]) : Math.ceil(0.015 * x[0])) },
      { group: "station", icon: "ev_station", name: "# équipements niv. C2", formula: ((x, f = 100.0, r = 0.0) => Math.max(Math.min((0.02 * x[0] + 0.01 * x[0]) * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Autres services",
    description: "(administration publique sans guichet, bureau d’ingénieur ou d’architecte, étude d’avocat, assurance, caisse maladie, administration d’industries, fiduciaire, laboratoire, entreprise de transport,…)",
    automatic: true,
    variables: [
      { name: "Surface brute de plancher (SBP)", description: "", type: "measurement", unit: "m<sup>2</sup>", min: 1.0, max: Infinity, value: null, hint: "" },
      { name: "# postes de travail", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à remplir si vous souhaitez l'utiliser pour le calcul des places vélos, sinon indiquer 0" },
      { name: "# places pour véhicules d’entreprise", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places personnel", formula: ((x, f = 100.0, r = 0.0) => (0.02 * x[0]) * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places clients", formula: ((x, f = 100.0, r = 0.0) => (0.005 * x[0]) * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour véhicules d’entreprise", formula: ((x) => x[2] * 1.0) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * (0.02 * x[0] + 0.005 * x[0]) * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "# places vélos personnel", formula: ((x) => x[1] > 0 ? Math.ceil(0.2 * x[1]) : Math.ceil(0.01 * x[0])) },
      { group: "bicycle", icon: "directions_bike", name: "# places vélos visiteurs", formula: ((x) => x[1] > 0 ? Math.ceil(0.05 * x[1]) : Math.ceil(0.0025 * x[0])) },
      { group: "station", icon: "ev_station", name: "# équipements niv. C2", formula: ((x, f = 100.0, r = 0.0) => Math.max(Math.min((0.02 * x[0] + 0.005 * x[0]) * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Magasins à nombreuse clientèle",
    description: "(alimentation, pharmacie, droguerie, grand magasin, kiosque, …)",
    automatic: true,
    variables: [
      { name: "Surface de vente (SV)", description: "", type: "measurement", unit: "m<sup>2</sup>", min: 1.0, max: Infinity, value: null, hint: "" },
      { name: "# postes de travail", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à remplir si vous souhaitez l'utiliser pour le calcul des places vélos, sinon indiquer 0" },
      { name: "# places pour véhicules d’entreprise", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places personnel", formula: ((x, f = 100.0, r = 0.0) => (0.02 * x[0]) * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places clients", formula: ((x, f = 100.0, r = 0.0) => (0.08 * x[0]) * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour véhicules d’entreprise", formula: ((x) => x[2] * 1.0) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * (0.02 * x[0] + 0.08 * x[0]) * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "# places vélos personnel", formula: ((x) => x[1] > 0 ? Math.ceil(0.2 * x[1]) : Math.ceil(0.01 * x[0])) },
      { group: "bicycle", icon: "directions_bike", name: "# places vélos visiteurs", formula: ((x) => x[1] > 0 ? Math.ceil(0.25 * x[1]) : Math.ceil(0.015 * x[0])) },
      { group: "station", icon: "ev_station", name: "# équipements niv. C2", formula: ((x, f = 100.0, r = 0.0) => Math.max(Math.min((0.02 * x[0] + 0.08 * x[0]) * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Autres magasins",
    description: "(librairie, ménage, quincaillerie horlogerie, bijouterie, ameublement, magasins spécialisés)",
    automatic: true,
    variables: [
      { name: "Surface de vente (SV)", description: "", type: "measurement", unit: "m<sup>2</sup>", min: 1.0, max: Infinity, value: null, hint: "" },
      { name: "# postes de travail", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à remplir si vous souhaitez l'utiliser pour le calcul des places vélos, sinon indiquer 0" },
      { name: "# places pour véhicules d’entreprise", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places personnel", formula: ((x, f = 100.0, r = 0.0) => (0.015 * x[0]) * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places clients", formula: ((x, f = 100.0, r = 0.0) => (0.035 * x[0]) * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour véhicules d’entreprise", formula: ((x) => x[2] * 1.0) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * (0.015 * x[0] + 0.035 * x[0]) * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "# places vélos personnel", formula: ((x) => x[1] > 0 ? Math.ceil(0.2 * x[1]) : Math.ceil(0.01 * x[0])) },
      { group: "bicycle", icon: "directions_bike", name: "# places vélos visiteurs", formula: ((x) => x[1] > 0 ? Math.ceil(1.0 * x[1]) : Math.ceil(0.015 * x[0])) },
      { group: "station", icon: "ev_station", name: "# équipements niv. C2", formula: ((x, f = 100.0, r = 0.0) => Math.max(Math.min((0.015 * x[0] + 0.035 * x[0]) * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Logement",
    name: "Hôtel",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "# places vélos personnel", formula: ((x) => x[1] * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "# places vélos clients", formula: ((x) => x[2] * 1.0) },
      { group: "station", icon: "ev_station", name: "# équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => Math.max(Math.min(x[0] * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Logement",
    name: "Auberge de jeunesse",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[2] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "# places vélos personnel", formula: ((x) => x[1] * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "# places vélos clients", formula: ((x) => x[2] * 1.0) },
      { group: "station", icon: "ev_station", name: "# équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => Math.max(Math.min(x[0] * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Restaurant, café, bar",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[2] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "# places vélos personnel", formula: ((x) => x[1] * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "# places vélos clients", formula: ((x) => x[2] * 1.0) },
      { group: "station", icon: "ev_station", name: "# équipements niv. C2", formula: ((x, f = 100.0, r = 0.0) => Math.max(Math.min(x[0] * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Petit hôpital, clinique",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places voitures visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places voitures visiteurs", formula: ((x, f = 100.0, r = 0.0) => x[1] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[4] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * (x[0] + x[1]) * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "# places vélos personnel", formula: ((x) => x[2] * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "# places vélos clients", formula: ((x) => x[3] * 1.0) },
      { group: "station", icon: "ev_station", name: "# équipements niv. C2", formula: ((x, f = 100.0, r = 0.0) => Math.max(Math.min((x[0] + x[1]) * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Etablissement pour personnes âgées, sanatorium",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places voitures visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places voitures visiteurs", formula: ((x, f = 100.0, r = 0.0) => x[1] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[4] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * (x[0] + x[1]) * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "# places vélos personnel", formula: ((x) => x[2] * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "# places vélos clients", formula: ((x) => x[3] * 1.0) },
      { group: "station", icon: "ev_station", name: "# équipements niv. C2", formula: ((x, f = 100.0, r = 0.0) => Math.max(Math.min((x[0] + x[1]) * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Cinéma",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
      { group: "station", icon: "ev_station", name: "# équipements niv. C2", formula: ((x, f = 100.0, r = 0.0) => Math.max(Math.min((x[0]) * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Théâtre, opéra, salle de concert",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
      { group: "station", icon: "ev_station", name: "# équipements niv. C2", formula: ((x, f = 100.0, r = 0.0) => Math.max(Math.min((x[0]) * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Musée, espace d’exposition, galerie",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
      { group: "station", icon: "ev_station", name: "# équipements niv. C2", formula: ((x, f = 100.0, r = 0.0) => Math.max(Math.min((x[0]) * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Bibliothèque",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
      { group: "station", icon: "ev_station", name: "# équipements niv. C2", formula: ((x, f = 100.0, r = 0.0) => Math.max(Math.min((x[0]) * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Discothèque",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Église, mosquée, synagogue",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
      { group: "station", icon: "ev_station", name: "# équipements niv. C2", formula: ((x, f = 100.0, r = 0.0) => Math.max(Math.min((x[0]) * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Pas concerné",
    name: "Cimetière",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
      // NO EV STATIONS
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Crèche, jardin d’enfant",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places voitures visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places voitures visiteurs", formula: ((x, f = 100.0, r = 0.0) => x[1] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[4] * 1.0) },
      { group: "station", icon: "ev_station", name: "# équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => Math.max(Math.min((x[0] + x[1]) * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "École primaire ou secondaire",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places voitures visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places voitures visiteurs", formula: ((x, f = 100.0, r = 0.0) => x[1] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[4] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
      { group: "station", icon: "ev_station", name: "# équipements niv. C2", formula: ((x, f = 100.0, r = 0.0) => Math.max(Math.min((x[0]) * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Gymnase, lycée",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places voitures visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places voitures visiteurs", formula: ((x, f = 100.0, r = 0.0) => x[1] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[4] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
      { group: "station", icon: "ev_station", name: "# équipements niv. C2", formula: ((x, f = 100.0, r = 0.0) => Math.max(Math.min((x[0]) * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Conservatoire",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places voitures visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places voitures visiteurs", formula: ((x, f = 100.0, r = 0.0) => x[1] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[4] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * (x[0] + x[1]) * (f / 100) * (1 - r / 100)) },
      { group: "station", icon: "ev_station", name: "# équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => Math.max(Math.min((x[0] + x[1]) * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "École professionnelle",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
      { group: "station", icon: "ev_station", name: "# équipements niv. C2", formula: ((x, f = 100.0, r = 0.0) => Math.max(Math.min((x[0]) * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Haute école, université",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
      { group: "station", icon: "ev_station", name: "# équipements niv. C2", formula: ((x, f = 100.0, r = 0.0) => Math.max(Math.min((x[0]) * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Cours pour adultes",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
      { group: "station", icon: "ev_station", name: "# équipements niv. C2", formula: ((x, f = 100.0, r = 0.0) => Math.max(Math.min((x[0]) * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Salle de réunion ou de conférence",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
      { group: "station", icon: "ev_station", name: "# équipements niv. C2", formula: ((x, f = 100.0, r = 0.0) => Math.max(Math.min((x[0]) * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Patinoire",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
      { group: "station", icon: "ev_station", name: "# équipements niv. C2", formula: ((x, f = 100.0, r = 0.0) => Math.max(Math.min((x[0]) * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Piscine couverte",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
      { group: "station", icon: "ev_station", name: "# équipements niv. C2", formula: ((x, f = 100.0, r = 0.0) => Math.max(Math.min((x[0]) * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Pas concerné",
    name: "Plage et piscine en plein air",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Halle de gymnastique",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
      { group: "station", icon: "ev_station", name: "# équipements niv. C2", formula: ((x, f = 100.0, r = 0.0) => Math.max(Math.min((x[0]) * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Centre de fitness",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
      { group: "station", icon: "ev_station", name: "# équipements niv. C2", formula: ((x, f = 100.0, r = 0.0) => Math.max(Math.min((x[0]) * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Pas concerné",
    name: "Stade d'athlétisme avec terrains de jeu",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Pas concerné",
    name: "Stade (football, hockey)",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Pas concerné",
    name: "Tennis",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Pas concerné",
    name: "Stand de tir",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Pas concerné",
    name: "Piste en forêt, Parcours Vita",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Salon de jeux, casino, local de club",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
      { group: "station", icon: "ev_station", name: "# équipements niv. C2", formula: ((x, f = 100.0, r = 0.0) => Math.max(Math.min((x[0]) * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Pas concerné",
    name: "Mini-golf",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Salle de billard",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
      { group: "station", icon: "ev_station", name: "# équipements niv. C2", formula: ((x, f = 100.0, r = 0.0) => Math.max(Math.min((x[0]) * (f / 100) * (1 - r / 100) / 3, 50), 1)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Pas concerné",
    name: "Jeu de quilles ou bowling (sans la restauration)",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Pas concerné",
    name: "Manège, écurie",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Pas concerné",
    name: "Port de plaisance",
    description: "",
    automatic: false,
    variables: [
      { name: "# places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, 0 par défaut" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "# places voitures personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "# places pour autopartage", formula: ((x) => x[3] * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "# places motos personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x[0] * (f / 100) * (1 - r / 100)) },
    ]
  }),
  */
  /*
  new Affectation({
    "Activité",
    "Test (calcul manuel)",
    "",
    false,
    [
      { name: "# places habitant", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# places visiteur", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "# pièces", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    [
      { name: "# places habitants", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { name: "# places visiteurs", formula: ((x, f = 100.0, r = 0.0) => x[1] * (f / 100) * (1 - r / 100)) },
      { name: "# places vélos", formula: ((x, f = 100.0) => x[2] * (f / 100)) }
    ]
  ),
  */
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
    this.eco = false // Ecoquartier
  }

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
      // console.log(`App.vue | Location type set to: ${val.name}`)
      // console.log(this.locationType)
    }

  }

  getAffectation(name) {
    return this.affectations.find(obj => obj.name === name)
  }

  getLocationType(name) {
    return this.loctypes.find(obj => obj.name === name)
  }

  getRawNeeds(group) {
    return this.affectations.filter(e => e.active)
      .map((x) => x.rawOutput.filter(e => e.group === group))
      .flat()
      .reduce((acc, obj) => { return acc + obj.value }, 0)
  }

  getNetNeeds(group) {
    return this.affectations.filter(e => e.active)
      .map((x) => x.netOutput2.filter(e => e.group === group))
      .flat()
      .reduce((acc, obj) => { return acc + obj.value }, 0)
  }

  getReducedNeeds(group) {
    return this.affectations.filter(e => e.active)
      .map((x) => x.reducedOutput2.filter(e => e.group === group))
      .flat()
      .reduce((acc, obj) => { return acc + obj.value }, 0)
  }


  getAffectationNames(category) {

    let names = this.affectations
      .filter(x => (x.category === category & x.active))
      .map((x) => x.name)

    return names

  }

  getStations(category) {

    let n_parkings = this.affectations
      .filter(x => (x.category === category & x.active))
      .map((x) => x.reducedOutput2.filter(e => e.group === "car"))
      .flat()
      .reduce((acc, obj) => { return acc + obj.value }, 0)

    let n_stations
    if (category === "Pas concerné") {
      n_stations = Math.round(n_parkings)
    } else {
      n_stations = Math.max(Math.min(Math.round(n_parkings / 3), 50.0), 1.0)
    }

    return n_stations

    /*
    switch (category) {
      case "afshin": case "saeed":
        n_stations = Math.max(Math.min(Math.round(n_parkings / 3), 50.0), 1.0)
        break
      case "Pas concerné":
        n_stations = Math.round(n_parkings)
        break
    }
    */

  }

}
