import communes_json from '../assets/data/communes.json'

// sort alphabetically
export var communes = communes_json.sort((a, b) => a.comnom.toLowerCase().localeCompare(b.comnom.toLowerCase()))

export var project_types = [
  { "name": "Nouvelle construction", "description": "Ouvrage construit durablement destiné à être chauffé, ventilé, refroidi ou humidifié", "equipement": true, "icon": "img/ev_station_white_24dp.svg" },
  { "name": "Extension", "description": "Augmentation du volume du bâtiment", "equipement": true, "icon": "img/ev_station_white_24dp.svg" },
  { "name": "Rénovation d'envergure", "description": "Évacuation des murs intérieurs et des dalles d’un bâtiment ou passage d’un volume non chauffé dédié à un dépôt, une écurie/grange en des appartements et/ou surfaces commerciales", "equipement": true, "icon": "img/ev_station_white_24dp.svg" },
  { "name": "Transformation et changement d'affectation", "description": "Élément de construction délimitant le volume chauffé touché au-delà qu’un simple rafraîchissement ou de réparations mineures ou changement d’utilisation des locaux qui entraîne une modification de la température ambiante", "equipement": false, "icon": "img/no_ev_station_white_24dp.svg" },
]


export class Affectation {

  // constructor
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
    this.variables = variables // input
    this.outputs = outputs // output
    this.active = active
    this.automatic = automatic
  }

  get variableMap() {
    return new Map(this.variables.map(x => [x.id, x.value]))
    // return new Map(this.variables.filter((x) => x.type === "measurement").map(x => [x.id, x.value]))
  }

  // getters
  get valid() {

    return this.variables.map((x) => x.value >= x.min && x.value <= x.max).every(Boolean)

  }

  getVariables(types) {

    return this.variables.filter(o => types.includes(o.type))

  }

  getOutputs(groups) {

    return this.outputs.filter(o => groups.includes(o.group))

  }

  // RETURNS RAW OUTPUT ("BESOIN BRUT")
  getRawOutputs(groups) {

    return this.getOutputs(groups).map(o => ({ name: o.name, group: o.group, value: o.formula(this.variableMap, 100.0, 0.0) }))

  }

  // RETURNS NET OUTPUT ("BESOIN NET")
  getNetOutputs(groups) {

    return this.getOutputs(groups).map(o => ({ name: o.name, group: o.group, value: o.formula(this.variableMap, this.ordinaryReduction, 0.0) }))

  }

  // RETURNS REDUCED OUTPUT ("BESOIN NET REDUIT")
  getReducedOutputs(groups) {

    return this.getOutputs(groups).map(o => ({ name: o.name, group: o.group, value: o.formula(this.variableMap, this.ordinaryReduction, this.specialReduction) }))

  }

  // RETURNS TOTAL (SUM) OF RAW OUTPUT ("BESOIN BRUT TOTAL")
  getTotalOutput(groups) {

    return this.getRawOutputs(groups).reduce((acc, obj) => { return acc + obj.value }, 0)

  }

  // RETURNS TOTAL (SUM) OF NET OUTPUT ("BESOIN NET TOTAL")
  getTotalNetOutput(groups) {

    return this.getNetOutputs(groups).reduce((acc, obj) => { return acc + obj.value }, 0)

  }

  // RETURNS TOTAL (SUM) OF REDUCED OUTPUT ("BESOIN REDUIT TOTAL")
  getTotalReducedOutput(groups) {

    return this.getReducedOutputs(groups).reduce((acc, obj) => { return acc + obj.value }, 0)

  }

  // RETURNS TOTAL (SUM) OF CEILING OF REDUCED OUTPUT ("BESOIN REDUIT TOTAL ARRONDI")
  getTotalReducedOutputCeil(groups) {

    return this.getReducedOutputs(groups).reduce((acc, obj) => { return acc + Math.ceil(obj.value) }, 0)

  }


  get ordinaryReduction() {
    return this.variables.filter((x) => x.type === "reduction").reduce((acc, obj) => { return acc + obj.value }, 0)
  }

  get specialReduction() {
    return Math.min(this.variables.filter((x) => x.type === "special reduction").reduce((acc, obj) => { return acc + obj.value }, 0), 100.0)
  }

}

export const affectations = [

  new Affectation({
    type: "Logement",
    category: "Logement",
    name: "Logements standards",
    description: "",
    automatic: true,
    variables: [
      { id: "floor_area", name: "Surface brute de plancher (SBP)", description: "", type: "measurement", unit: "m<sup>2</sup>", min: 1.0, max: Infinity, value: null, hint: "" },
      { id: "n_housings", name: "Nb. logements", description: "", type: "measurement", unit: "", min: 1.0, max: Infinity, value: null, hint: "" },
      { id: "n_rooms", name: "Nb. pièces (total)", description: "", type: "measurement", unit: "", min: 1.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: null, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" }
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places habitants", formula: ((x, f = 100.0, r = 0.0) => Math.max(0.01 * x.get('floor_area'), x.get('n_housings')) * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "Places visiteurs", formula: ((x, f = 100.0, r = 0.0) => 0.001 * x.get('floor_area') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places habitants/visiteurs", formula: ((x, f = 100.0, r = 0.0) => (x.get('n_housings') > 3) * 0.15 * (Math.max(0.01 * x.get('floor_area'), x.get('n_housings')) + 0.001 * x.get('floor_area')) * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places habitants/visiteurs", formula: ((x) => Math.floor(x.get('n_rooms'))) },
      // { group: "station", icon: "ev_station", name: "Équipements niv. B", formula: ((x, f = 100.0, r = 0.0) => (Math.max(Math.min((Math.max(0.01 * x.get('floor_area'), x.get('n_housings')) + 0.001 * x.get('floor_area')) * (f / 100) * (1 - r / 100) * (x.get('n_housings') > 2.0 ? 2 / 3 : 1.0)), 50), 1)) },
      // { group: "station", icon: "ev_station", name: "Équipements niv. C2", formula: ((x, f = 100.0, r = 0.0) => 0.0) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => ((x.get('n_housings') > 2.0) * ((Math.max(0.01 * x.get('floor_area'), x.get('n_housings')) + 0.001 * x.get('floor_area')) * (f / 100) * (1 - r / 100) + x.get('n_car_shr_prk')))) },
    ]
  }),
  new Affectation({
    type: "Logement",
    category: "Logement",
    name: "Logements avec encadrement",
    description: "",
    automatic: true,
    variables: [
      { id: "floor_area", name: "Surface brute de plancher (SBP)", description: "", type: "measurement", unit: "m<sup>2</sup>", min: 1.0, max: Infinity, value: null, hint: "" },
      { id: "n_housings", name: "Nb. logements", description: "", type: "measurement", unit: "", min: 1.0, max: Infinity, value: null, hint: "" },
      { id: "n_rooms", name: "Nb. pièces (total)", description: "", type: "measurement", unit: "", min: 1.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "lowincome_reduction", name: "Logements avec encadrement ou étudiants", description: "Un facteur de réduction (maximum 50%) peut s'appliquer pour les logements avec encadrement dédiés aux bénéficiaires AVS/AI ou étudiants. Référez-vous à l’article 34 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 50.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places habitants", formula: ((x, f = 100.0, r = 0.0) => Math.max(0.01 * x.get('floor_area'), x.get('n_housings')) * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "Places visiteurs", formula: ((x, f = 100.0, r = 0.0) => 0.001 * x.get('floor_area') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places habitants/visiteurs", formula: ((x, f = 100.0, r = 0.0) => (x.get('n_housings') > 3) * 0.15 * (Math.max(0.01 * x.get('floor_area'), x.get('n_housings')) + 0.001 * x.get('floor_area')) * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places habitants/visiteurs", formula: ((x) => Math.floor(x.get('n_housings'))) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => ((x.get('n_housings') > 2.0) * ((Math.max(0.01 * x.get('floor_area'), x.get('n_housings')) + 0.001 * x.get('floor_area')) * (f / 100) * (1 - r / 100) + x.get('n_car_shr_prk')))) },
    ]
  }),

  new Affectation({
    type: "Logement",
    category: "Logement",
    name: "Logements pour étudiants",
    description: "",
    automatic: true,
    variables: [
      { id: "floor_area", name: "Surface brute de plancher (SBP)", description: "", type: "measurement", unit: "m<sup>2</sup>", min: 1.0, max: Infinity, value: null, hint: "" },
      { id: "n_housings", name: "Nb. logements", description: "", type: "measurement", unit: "", min: 1.0, max: Infinity, value: null, hint: "" },
      { id: "n_rooms", name: "Nb. pièces (total)", description: "", type: "measurement", unit: "", min: 1.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "lowincome_reduction", name: "Logements avec encadrement ou étudiants", description: "Un facteur de réduction (maximum 50%) peut s'appliquer pour les logements avec encadrement dédiés aux bénéficiaires AVS/AI ou étudiants. Référez-vous à l’article 34 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 50.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places habitants", formula: ((x, f = 100.0, r = 0.0) => Math.max(0.01 * x.get('floor_area'), x.get('n_housings')) * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "Places visiteurs", formula: ((x, f = 100.0, r = 0.0) => 0.001 * x.get('floor_area') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places habitants/visiteurs", formula: ((x, f = 100.0, r = 0.0) => (x.get('n_housings') > 3) * 0.15 * (Math.max(0.01 * x.get('floor_area'), x.get('n_housings')) + 0.001 * x.get('floor_area')) * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places habitants/visiteurs", formula: ((x) => Math.floor(x.get('n_rooms'))) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => ((x.get('n_housings') > 2.0) * ((Math.max(0.01 * x.get('floor_area'), x.get('n_housings')) + 0.001 * x.get('floor_area')) * (f / 100) * (1 - r / 100) + x.get('n_car_shr_prk')))) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Industrie, artisanat",
    description: "",
    automatic: true,
    variables: [
      { id: "floor_area", name: "Surface brute de plancher (SBP)", description: "", type: "measurement", unit: "m<sup>2</sup>", min: 1.0, max: Infinity, value: null, hint: "" },
      { id: "n_staff", name: "Nb. postes de travail", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à remplir si vous souhaitez l'utiliser pour le calcul des places vélos, sinon indiquer 0" },
      { id: "n_car_cmp_prk", name: "Nb. places pour véhicules d’entreprise", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel", formula: ((x, f = 100.0, r = 0.0) => 0.01 * x.get('floor_area') * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "Places clients", formula: ((x, f = 100.0, r = 0.0) => 0.002 * x.get('floor_area') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour véhicules d’entreprise", formula: ((x) => x.get('n_car_cmp_prk') * 1.0) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * (0.01 * x.get('floor_area') + 0.002 * x.get('floor_area')) * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_staff') > 0 ? Math.ceil(0.2 * x.get('n_staff')) : Math.ceil(0.004 * x.get('floor_area'))) },
      { group: "bicycle", icon: "directions_bike", name: "Places clients", formula: ((x) => x.get('n_staff') > 0 ? Math.ceil(0.05 * x.get('n_staff')) : Math.ceil(0.001 * x.get('floor_area'))) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => ((0.01 * x.get('floor_area') + 0.002 * x.get('floor_area')) * (f / 100) * (1 - r / 100)) + x.get('n_car_cmp_prk') + x.get('n_car_shr_prk')) },
    ]
  }),

  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Entrepôts et dépôts",
    description: "",
    automatic: true,
    variables: [
      { id: "floor_area", name: "Surface brute de plancher (SBP)", description: "", type: "measurement", unit: "m<sup>2</sup>", min: 1.0, max: Infinity, value: null, hint: "" },
      { id: "n_staff", name: "Nb. postes de travail", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à remplir si vous souhaitez l'utiliser pour le calcul des places vélos, sinon indiquer 0" },
      { id: "n_car_cmp_prk", name: "Nb. places pour véhicules d’entreprise", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel", formula: ((x, f = 100.0, r = 0.0) => 0.001 * x.get('floor_area') * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "Places clients", formula: ((x, f = 100.0, r = 0.0) => 0.0001 * x.get('floor_area') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour véhicules d’entreprise", formula: ((x) => x.get('n_car_cmp_prk') * 1.0) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * (0.001 * x.get('floor_area') + 0.0001 * x.get('floor_area')) * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_staff') > 0 ? Math.ceil(0.2 * x.get('n_staff')) : Math.ceil(0.004 * x.get('floor_area'))) },
      { group: "bicycle", icon: "directions_bike", name: "Places clients", formula: ((x) => x.get('n_staff') > 0 ? Math.ceil(0.05 * x.get('n_staff')) : Math.ceil(0.001 * x.get('floor_area'))) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => ((0.001 * x.get('floor_area') + 0.0001 * x.get('floor_area')) * (f / 100) * (1 - r / 100)) + x.get('n_car_cmp_prk') + x.get('n_car_shr_prk')) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Services à nombreuse clientèle",
    description: "(banque, poste administration publique avec guichets, agence de voyage médecin, dentiste, cabinet de soins, reproduction et copie, nettoyage chimique, coiffeur,…)",
    automatic: true,
    variables: [
      { id: "floor_area", name: "Surface brute de plancher (SBP)", description: "", type: "measurement", unit: "m<sup>2</sup>", min: 1.0, max: Infinity, value: null, hint: "" },
      { id: "n_staff", name: "Nb. postes de travail", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à remplir si vous souhaitez l'utiliser pour le calcul des places vélos, sinon indiquer 0" },
      { id: "n_car_cmp_prk", name: "Nb. places pour véhicules d’entreprise", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel", formula: ((x, f = 100.0, r = 0.0) => (0.02 * x.get('floor_area')) * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "Places clients", formula: ((x, f = 100.0, r = 0.0) => (0.01 * x.get('floor_area')) * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour véhicules d’entreprise", formula: ((x) => x.get('n_car_cmp_prk') * 1.0) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * (0.02 * x.get('floor_area') + 0.01 * x.get('floor_area')) * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_staff') > 0 ? Math.ceil(0.2 * x.get('n_staff')) : Math.ceil(0.01 * x.get('floor_area'))) },
      { group: "bicycle", icon: "directions_bike", name: "Places clients", formula: ((x) => x.get('n_staff') > 0 ? Math.ceil(0.3 * x.get('n_staff')) : Math.ceil(0.015 * x.get('floor_area'))) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => ((0.02 * x.get('floor_area') + 0.01 * x.get('floor_area')) * (f / 100) * (1 - r / 100)) + x.get('n_car_cmp_prk') + x.get('n_car_shr_prk')) },
    ]
  }),

  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Autres services",
    description: "(administration publique sans guichet, bureau d’ingénieur ou d’architecte, étude d’avocat, assurance, caisse maladie, administration d’industries, fiduciaire, laboratoire, entreprise de transport,…)",
    automatic: true,
    variables: [
      { id: "floor_area", name: "Surface brute de plancher (SBP)", description: "", type: "measurement", unit: "m<sup>2</sup>", min: 1.0, max: Infinity, value: null, hint: "" },
      { id: "n_staff", name: "Nb. postes de travail", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à remplir si vous souhaitez l'utiliser pour le calcul des places vélos, sinon indiquer 0" },
      { id: "n_car_cmp_prk", name: "Nb. places pour véhicules d’entreprise", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel", formula: ((x, f = 100.0, r = 0.0) => (0.02 * x.get('floor_area')) * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "Places clients", formula: ((x, f = 100.0, r = 0.0) => (0.005 * x.get('floor_area')) * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour véhicules d’entreprise", formula: ((x) => x.get('n_car_cmp_prk') * 1.0) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * (0.02 * x.get('floor_area') + 0.005 * x.get('floor_area')) * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_staff') > 0 ? Math.ceil(0.2 * x.get('n_staff')) : Math.ceil(0.01 * x.get('floor_area'))) },
      { group: "bicycle", icon: "directions_bike", name: "Places clients", formula: ((x) => x.get('n_staff') > 0 ? Math.ceil(0.05 * x.get('n_staff')) : Math.ceil(0.0025 * x.get('floor_area'))) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => ((0.02 * x.get('floor_area') + 0.005 * x.get('floor_area')) * (f / 100) * (1 - r / 100)) + x.get('n_car_cmp_prk') + x.get('n_car_shr_prk')) },
    ]
  }),

  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Magasins à nombreuse clientèle",
    description: "(alimentation, pharmacie, droguerie, grand magasin, kiosque, …)",
    automatic: true,
    variables: [
      { id: "floor_area", name: "Surface de vente (SV)", description: "", type: "measurement", unit: "m<sup>2</sup>", min: 1.0, max: Infinity, value: null, hint: "" },
      { id: "n_staff", name: "Nb. postes de travail", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à remplir si vous souhaitez l'utiliser pour le calcul des places vélos, sinon indiquer 0" },
      { id: "n_car_cmp_prk", name: "Nb. places pour véhicules d’entreprise", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel", formula: ((x, f = 100.0, r = 0.0) => (0.02 * x.get('floor_area')) * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "Places clients", formula: ((x, f = 100.0, r = 0.0) => (0.08 * x.get('floor_area')) * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour véhicules d’entreprise", formula: ((x) => x.get('n_car_cmp_prk') * 1.0) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * (0.02 * x.get('floor_area') + 0.08 * x.get('floor_area')) * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_staff') > 0 ? Math.ceil(0.2 * x.get('n_staff')) : Math.ceil(0.01 * x.get('floor_area'))) },
      { group: "bicycle", icon: "directions_bike", name: "Places clients", formula: ((x) => x.get('n_staff') > 0 ? Math.ceil(0.25 * x.get('n_staff')) : Math.ceil(0.015 * x.get('floor_area'))) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => ((0.02 * x.get('floor_area') + 0.008 * x.get('floor_area')) * (f / 100) * (1 - r / 100)) + x.get('n_car_cmp_prk') + x.get('n_car_shr_prk')) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Autres magasins",
    description: "(librairie, ménage, quincaillerie horlogerie, bijouterie, ameublement, magasins spécialisés)",
    automatic: true,
    variables: [
      { id: "floor_area", name: "Surface de vente (SV)", description: "", type: "measurement", unit: "m<sup>2</sup>", min: 1.0, max: Infinity, value: null, hint: "" },
      { id: "n_staff", name: "Nb. postes de travail", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à remplir si vous souhaitez l'utiliser pour le calcul des places vélos, sinon indiquer 0" },
      { id: "n_car_cmp_prk", name: "Nb. places pour véhicules d’entreprise", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel", formula: ((x, f = 100.0, r = 0.0) => (0.015 * x.get('floor_area')) * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "Places clients", formula: ((x, f = 100.0, r = 0.0) => (0.035 * x.get('floor_area')) * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour véhicules d’entreprise", formula: ((x) => x.get('n_car_cmp_prk') * 1.0) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * (0.015 * x.get('floor_area') + 0.035 * x.get('floor_area')) * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_staff') > 0 ? Math.ceil(0.2 * x.get('n_staff')) : Math.ceil(0.01 * x.get('floor_area'))) },
      { group: "bicycle", icon: "directions_bike", name: "Places clients", formula: ((x) => x.get('n_staff') > 0 ? Math.ceil(1.0 * x.get('n_staff')) : Math.ceil(0.015 * x.get('floor_area'))) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => ((0.015 * x.get('floor_area') + 0.035 * x.get('floor_area')) * (f / 100) * (1 - r / 100)) + x.get('n_car_cmp_prk') + x.get('n_car_shr_prk')) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Logement",
    name: "Hôtel",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_mix_prk", name: "Nb. places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places clients", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => (x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) + x.get('n_car_shr_prk')) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Logement",
    name: "Auberge de jeunesse",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_mix_prk", name: "Nb. places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places clients", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => (x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) + x.get('n_car_shr_prk')) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Restaurant, café, bar",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_mix_prk", name: "Nb. places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places clients", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => (x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) + x.get('n_car_shr_prk')) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Petit hôpital, clinique",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_emp_prk", name: "Nb. places voitures personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_vis_prk", name: "Nb. places voitures visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_emp_prk') * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "Places visiteurs", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_vis_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => 0.15 * (x.get('n_car_emp_prk') + x.get('n_car_vis_prk')) * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places visiteurs", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => ((x.get('n_car_emp_prk') + x.get('n_car_vis_prk')) * (f / 100) * (1 - r / 100)) + x.get('n_car_shr_prk')) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Etablissement pour personnes âgées, sanatorium",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_emp_prk", name: "Nb. places voitures personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_vis_prk", name: "Nb. places voitures visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_emp_prk') * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "Places visiteurs", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_vis_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => 0.15 * (x.get('n_car_emp_prk') + x.get('n_car_vis_prk')) * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places visiteurs", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => ((x.get('n_car_emp_prk') + x.get('n_car_vis_prk')) * (f / 100) * (1 - r / 100)) + x.get('n_car_shr_prk')) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Cinéma",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_mix_prk", name: "Nb. places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places clients", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => (x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) + x.get('n_car_shr_prk')) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Théâtre, opéra, salle de concert",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_mix_prk", name: "Nb. places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places clients", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => (x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) + x.get('n_car_shr_prk')) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Musée, espace d’exposition, galerie",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_mix_prk", name: "Nb. places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places clients", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => (x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) + x.get('n_car_shr_prk')) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Bibliothèque",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_mix_prk", name: "Nb. places voitures personnel/visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places visiteurs", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => (x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) + x.get('n_car_shr_prk')) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Discothèque",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_mix_prk", name: "Nb. places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places clients", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => (x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) + x.get('n_car_shr_prk')) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Église, mosquée, synagogue",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_mix_prk", name: "Nb. places voitures personnel/visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places visiteurs", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => (x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) + x.get('n_car_shr_prk')) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Pas concerné",
    name: "Cimetière",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_mix_prk", name: "Nb. places voitures personnel/visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places visiteurs", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Crèche, jardin d’enfant",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_emp_prk", name: "Nb. places voitures personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_vis_prk", name: "Nb. places voitures clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_emp_prk') * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "Places clients", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_vis_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * (x.get('n_car_emp_prk') + x.get('n_car_vis_prk')) * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places clients", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => ((x.get('n_car_emp_prk') + x.get('n_car_vis_prk')) * (f / 100) * (1 - r / 100)) + x.get('n_car_shr_prk')) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "École primaire ou secondaire",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_emp_prk", name: "Nb. places voitures personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_vis_prk", name: "Nb. places voitures visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_emp_prk') * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "Places visiteurs", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_vis_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => 0.15 * (x.get('n_car_emp_prk') + x.get('n_car_vis_prk')) * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places visiteurs", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => ((x.get('n_car_emp_prk') + x.get('n_car_vis_prk')) * (f / 100) * (1 - r / 100)) + x.get('n_car_shr_prk')) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Gymnase, lycée",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_emp_prk", name: "Nb. places voitures personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_vis_prk", name: "Nb. places voitures visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_emp_prk') * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "Places visiteurs", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_vis_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => 0.15 * (x.get('n_car_emp_prk') + x.get('n_car_vis_prk')) * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places visiteurs", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => ((x.get('n_car_emp_prk') + x.get('n_car_vis_prk')) * (f / 100) * (1 - r / 100)) + x.get('n_car_shr_prk')) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Conservatoire",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_emp_prk", name: "Nb. places voitures personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_vis_prk", name: "Nb. places voitures visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_emp_prk') * (f / 100) * (1 - r / 100)) },
      { group: "car", icon: "directions_car", name: "Places visiteurs", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_vis_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => 0.15 * (x.get('n_car_emp_prk') + x.get('n_car_vis_prk')) * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places visiteurs", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => ((x.get('n_car_emp_prk') + x.get('n_car_vis_prk')) * (f / 100) * (1 - r / 100)) + x.get('n_car_shr_prk')) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "École professionnelle",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_mix_prk", name: "Nb. places voitures personnel/visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places visiteurs", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => (x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) + x.get('n_car_shr_prk')) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Haute école, université",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_mix_prk", name: "Nb. places voitures personnel/visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places visiteurs", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => (x.get('n_mix_vis_prk') * (f / 100) * (1 - r / 100)) + x.get('n_car_shr_prk')) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Cours pour adultes",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_mix_prk", name: "Nb. places voitures personnel/visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places visiteurs", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => (x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) + x.get('n_car_shr_prk')) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Salle de réunion ou de conférence",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_mix_prk", name: "Nb. places voitures personnel/visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places visiteurs", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => (x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) + x.get('n_car_shr_prk')) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Patinoire",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_mix_prk", name: "Nb. places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places clients", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => (x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) + x.get('n_car_shr_prk')) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Piscine couverte",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_mix_prk", name: "Nb. places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places clients", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => (x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) + x.get('n_car_shr_prk')) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Pas concerné",
    name: "Plage et piscine en plein air",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_mix_prk", name: "Nb. places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places clients", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Halle de gymnastique",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_mix_prk", name: "Nb. places voitures personnel/visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places visiteurs", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => (x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) + x.get('n_car_shr_prk')) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Centre de fitness",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_mix_prk", name: "Nb. places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places clients", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => (x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) + x.get('n_car_shr_prk')) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Pas concerné",
    name: "Stade d'athlétisme avec terrains de jeu",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_mix_prk", name: "Nb. places voitures personnel/visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places visiteurs", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Pas concerné",
    name: "Stade (football, hockey)",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_mix_prk", name: "Nb. places voitures personnel/visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places visiteurs", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Pas concerné",
    name: "Tennis",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_mix_prk", name: "Nb. places voitures personnel/visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places visiteurs", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Pas concerné",
    name: "Stand de tir",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_mix_prk", name: "Nb. places voitures personnel/visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places visiteurs", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Pas concerné",
    name: "Piste en forêt, Parcours Vita",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_mix_prk", name: "Nb. places voitures personnel/visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places visiteurs", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Salon de jeux, casino, local de club",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_mix_prk", name: "Nb. places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places clients", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => (x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) + x.get('n_car_shr_prk')) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Pas concerné",
    name: "Mini-golf",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_mix_prk", name: "Nb. places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places clients", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Activité",
    name: "Salle de billard",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_mix_prk", name: "Nb. places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places clients", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
      { group: "station", icon: "ev_station", name: "Équipements niv. D (bornes)", formula: ((x, f = 100.0, r = 0.0) => (x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) + x.get('n_car_shr_prk')) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Pas concerné",
    name: "Jeu de quilles ou bowling (sans la restauration)",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_mix_prk", name: "Nb. places voitures personnel/clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos clients", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places clients", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/clients", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Pas concerné",
    name: "Manège, écurie",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_mix_prk", name: "Nb. places voitures personnel/visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places visiteurs", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
    ]
  }),
  new Affectation({
    type: "Activité",
    category: "Pas concerné",
    name: "Port de plaisance",
    description: "",
    automatic: false,
    variables: [
      { id: "n_car_mix_prk", name: "Nb. places voitures personnel/visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_emp_prk", name: "Nb. places vélos personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_bcl_clt_prk", name: "Nb. places vélos visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "n_car_shr_prk", name: "Nb. places pour autopartage", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: 0.0, hint: "Facultatif, à justifier si des places sont demandées, sinon indiquer 0" },
      { id: "zone_rdn", name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    outputs: [
      { group: "car", icon: "directions_car", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { group: "special", icon: "directions_car", name: "Places pour autopartage", formula: ((x) => x.get('n_car_shr_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places personnel", formula: ((x) => x.get('n_bcl_emp_prk') * 1.0) },
      { group: "bicycle", icon: "directions_bike", name: "Places visiteurs", formula: ((x) => x.get('n_bcl_clt_prk') * 1.0) },
      { group: "motorcycle", icon: "motorcycle", name: "Places personnel/visiteurs", formula: ((x, f = 100.0, r = 0.0) => 0.15 * x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
    ]
  }),

  /*
  new Affectation({
    "Activité",
    "Test (calcul manuel)",
    "",
    false,
    [
      { name: "Nb. places habitant", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "Nb. places visiteur", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { name: "Nb. pièces", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null, hint: "" },
      { id: "zone_rdn", name: "zone",description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mob_rdn", name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "mltuse_rdn", name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
      { id: "env_rdn", name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0, hint: "" },
    ],
    [
      { name: "Nb. places habitants", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_mix_prk') * (f / 100) * (1 - r / 100)) },
      { name: "Nb. places visiteurs", formula: ((x, f = 100.0, r = 0.0) => x.get('n_car_vis_prk') * (f / 100) * (1 - r / 100)) },
      { name: "Nb. places vélos", formula: ((x, f = 100.0) => x.get('n_bcl_clt_prk') * (f / 100)) }
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
    this.type = null // Type
    this.commune = null // Commune
    this.eco = false // Ecoquartier
  }

  get hasCommune() {
    return this.commune !== null
  }

  get hasLocationType() {
    return this._locationType !== null
  }

  get hasAffectation() {
    return this.getAffectations().length > 0
  }

  get hasZoneFactors() {

    if (!this.hasAffectation) {
      return false
    }

    return this.getAffectations().map(x => x.variableMap.get('zone_rdn')).every(x => x !== null)
  }

  get hasReductions() {

    if (!this.hasAffectation) {
      return false
    }

    return this.getAffectations().filter(e.variables.filter((x) => x.type === 'special reduction').length > 0)

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

  getAffectations() {
    return this.affectations.filter(e => e.active && e.outputs.length > 0)
  }

  getLocationType(name) {
    return this.loctypes.find(obj => obj.name === name)
  }

  getRawNeeds(groups) {
    return this.getAffectations()
      .map((x) => x.getRawOutputs(groups))
      .flat()
      .reduce((acc, obj) => { return acc + obj.value }, 0)
  }

  getNetNeeds(groups) {
    return this.getAffectations()
      .map((x) => x.getNetOutputs(groups))
      .flat()
      .reduce((acc, obj) => { return acc + obj.value }, 0)
  }

  getReducedNeeds(groups) {
    return this.getAffectations()
      .map((x) => x.getReducedOutputs(groups))
      .flat()
      .reduce((acc, obj) => { return acc + obj.value }, 0)
  }

  getAffectationNames(category) {

    let names = this.getAffectations()
      .filter(x => (x.category === category))
      .map(x => x.name)

    return names

  }

  getHousingCount() {
    let n_housings = this.getAffectations()
      .map(x => x.variables)
      .flat()
      .filter(x => (x.id === "n_housings"))
      .reduce((acc, obj) => { return acc + obj.value }, 0)

    return n_housings
  }

  getStations(category) {

    let n_stations_D = this.getAffectations()
      .filter(x => (x.category === category))
      .map(x => x.getReducedOutputs(['station']))
      .flat()
      .reduce((acc, obj) => { return acc + obj.value }, 0)

    let n_parkings = this.getAffectations()
      .filter(x => (x.category === category))
      .map(x => x.getReducedOutputs(['car', 'special']))
      .flat()
      .reduce((acc, obj) => { return acc + obj.value }, 0)

    // let n_housings = this.getHousingCount()
    let n_stations

    /*
    Le Conseil d’État a décidé que dans :
    1.	les bâtiments à construire affectés à l’habitation avec trois logements ou plus, au moins 40% des places de stationnement prescrites selon la législation sur les constructions doivent être équipées selon le niveau d’équipement D, mais au minimum une place de stationnement.
    2.	les bâtiments à construire qui ont d’autres affectations, au moins 20% des places de stationnement prescrites selon la législation sur les constructions doivent être équipées selon le niveau d’équipement D, mais au minimum une place de stationnement et au maximum trente places de stationnement.
    3.	Les bâtiments à construire dont les places de stationnement prescrites selon la législation sur les constructions n’ayant pas un niveau d’équipement D, doivent être toutes équipées au moins selon le niveau d’équipement B.
    */

    // console.log(`Category: ${category}, stations: ${n_stations_D}, parkings: ${n_parkings}`)

    if (n_parkings === 0.0) {

      n_stations = 0.0

    } else {

      switch (category) {

        case "Logement":
          // n_stations = Math.max(Math.round(0.4 * n_parkings), 1.0)
          // n_stations = Math.max(Math.round(0.4 * n_stations_D), 1.0)
          n_stations = Math.max(Math.round(0.4 * Math.ceil(n_stations_D)), 1.0)

          break
        case "Activité":
          // n_stations = Math.max(Math.min(Math.round(0.2 * n_parkings), 30.0), 1.0)
          // n_stations = Math.max(Math.min(Math.round(0.2 * n_stations_D), 30.0), 1.0)
          n_stations = Math.max(Math.min(Math.round(0.2 * Math.ceil(n_stations_D)), 30.0), 1.0)

          break
        case "Pas concerné":
          n_stations = Math.round(n_parkings)
          break
      }
    }

    return n_stations

  }

}
