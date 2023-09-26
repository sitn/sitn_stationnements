import communes_json from '../assets/data/communes.json'

// sort alphabetically
export var communes = communes_json.sort((a, b) => a.comnom.toLowerCase().localeCompare(b.comnom.toLowerCase()))

export class Affectation {

  // constructor
  constructor(type, name, description, automatic = false, variables = [], factors = []) {
    this.type = type
    this.name = name
    this.description = description
    this.variables = variables // input
    this.factors = factors // output
    this.active = false
    this.automatic = automatic
  }

  // getters
  get valid() {
    return this.variables.map((x) => x.value >= x.min && x.value <= x.max).every(Boolean)
  }

  get output() {
    return this.factors.map(o => o.formula(this.variables.filter((x) => x.type === "measurement").map(x => x.value), 100.0, 0.0))
  }

  get netOutput() {
    return this.factors.map(o => o.formula(this.variables.filter((x) => x.type === "measurement").map(x => x.value), this.ordinaryReduction, 0.0))
  }

  get netOutput2() {
    return this.factors.map(o => ({ name: o.name, value: o.formula(this.variables.filter((x) => x.type === "measurement").map(x => x.value), this.ordinaryReduction, 0.0) }))
  }

  get reducedOutput() {
    return this.factors.map(o => o.formula(this.variables.filter((x) => x.type === "measurement").map(x => x.value), this.ordinaryReduction, this.specialReduction))
  }

  get reducedOutput2() {
    return this.factors.map(o => ({ name: o.name, value: o.formula(this.variables.filter((x) => x.type === "measurement").map(x => x.value), this.ordinaryReduction, this.specialReduction) }))
  }

  get totalOutput() {
    return this.output.reduce((acc, obj) => { return acc + obj }, 0)
  }

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
  new Affectation(
    "Logement",
    "Logements standards",
    "",
    true,
    [
      { name: "Surface brute de plancher (SBP)", description: "", type: "measurement", unit: "m<sup>2</sup>", min: 0.0, max: Infinity, value: null },
      { name: "# logements", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 }
    ],
    [
      { name: "# places habitants", formula: ((x, f = 100.0, r = 0.0) => Math.max(0.01 * x[0], x[1]) * (f / 100) * (1 - r / 100)) },
      { name: "# places visiteurs", formula: ((x, f = 100.0, r = 0.0) => 0.001 * x[0] * (f / 100) * (1 - r / 100)) }
    ]
  ),
  new Affectation(
    "Logement",
    "Logements avec encadrement ou étudiants",
    "",
    true,
    [
      { name: "Surface brute de plancher (SBP)", description: "", type: "measurement", unit: "m<sup>2</sup>", min: 0.0, max: Infinity, value: null },
      { name: "# logements", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Logements avec encadrement ou étudiants", description: "Un facteur de réduction (maximum 50%) peut s'appliquer pour les logements avec encadrement dédiés aux bénéficiaires AVS/AI ou étudiants. Référez-vous à l’article 34 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 50.0, value: 0.0 },
    ],
    [
      { name: "# places habitants", formula: ((x, f = 100.0, r = 0.0) => Math.max(0.01 * x[0], x[1]) * (f / 100) * (1 - r / 100)) },
      { name: "# places visiteurs", formula: ((x, f = 100.0, r = 0.0) => 0.001 * x[0] * (f / 100) * (1 - r / 100)) }
    ]
  ),
  new Affectation(
    "Activité",
    "Industrie, artisanat",
    "",
    true,
    [
      { name: "Surface brute de plancher (SBP)", description: "", type: "measurement", unit: "m<sup>2</sup>", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places personnel", formula: ((x, f = 100.0, r = 0.0) => 0.01 * x[0] * (f / 100) * (1 - r / 100)) },
      { name: "# places clients", formula: ((x, f = 100.0, r = 0.0) => 0.002 * x[0] * (f / 100) * (1 - r / 100)) }
    ]
  ),
  new Affectation(
    "Activité",
    "Entrepôts et dépôts",
    "",
    true,
    [
      { name: "Surface brute de plancher (SBP)", description: "", type: "measurement", unit: "m<sup>2</sup>", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places personnel", formula: ((x, f = 100.0, r = 0.0) => 0.015 * x[0] * (f / 100) * (1 - r / 100)) },
      { name: "# places clients", formula: ((x, f = 100.0, r = 0.0) => 0.035 * x[0] * (f / 100) * (1 - r / 100)) }
    ]
  ),
  new Affectation(
    "Activité",
    "Services à nombreuse clientèle",
    "(banque, poste administration publique avec guichets, agence de voyage médecin, dentiste, cabinet de soins, eproduction et copie, nettoyage chimique coiffeur,…)",
    true,
    [
      { name: "Surface brute de plancher (SBP)", description: "", type: "measurement", unit: "m<sup>2</sup>", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places personnel", formula: ((x, f = 100.0, r = 0.0) => (0.02 * x[0]) * (f / 100) * (1 - r / 100)) },
      { name: "# places clients", formula: ((x, f = 100.0, r = 0.0) => (0.01 * x[0]) * (f / 100) * (1 - r / 100)) }
    ]
  ),
  new Affectation(
    "Activité",
    "Autres services",
    "(administration publique sans guichet, bureau d’ingénieur ou d’architecte, étude d’avocat, assurance, caisse maladie, administration d’industries, fiduciaire, laboratoire, entreprise de transport,…)",
    true,
    [
      { name: "Surface brute de plancher (SBP)", description: "", type: "measurement", unit: "m<sup>2</sup>", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places personnel", formula: ((x, f = 100.0, r = 0.0) => (0.02 * x[0]) * (f / 100) * (1 - r / 100)) },
      { name: "# places clients", formula: ((x, f = 100.0, r = 0.0) => (0.005 * x[0]) * (f / 100) * (1 - r / 100)) }
    ]
  ),
  new Affectation(
    "Activité",
    "Magasins à nombreuse clientèle",
    "(alimentation, pharmacie, droguerie, grand magasin, kiosque, …)",
    true,
    [
      { name: "Surface de vente (SV)", description: "", type: "measurement", unit: "m<sup>2</sup>", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places personnel", formula: ((x, f = 100.0, r = 0.0) => (0.02 * x[0]) * (f / 100) * (1 - r / 100)) },
      { name: "# places clients", formula: ((x, f = 100.0, r = 0.0) => (0.08 * x[0]) * (f / 100) * (1 - r / 100)) }
    ]
  ),
  new Affectation(
    "Activité",
    "Autres magasins",
    "(librairie, ménage, quincaillerie horlogerie, bijouterie, ameublement, magasins spécialisés)",
    true,
    [
      { name: "Surface de vente (SV)", description: "", type: "measurement", unit: "m<sup>2</sup>", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places personnel", formula: ((x, f = 100.0, r = 0.0) => (0.015 * x[0]) * (f / 100) * (1 - r / 100)) },
      { name: "# places clients", formula: ((x, f = 100.0, r = 0.0) => (0.035 * x[0]) * (f / 100) * (1 - r / 100)) }
    ]
  ),
  new Affectation(
    "Activité",
    "Hôtel",
    "",
    false,
    [
      // { name: "# lits", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      // { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => 0.5 * x[0] * (f / 100) * (1 - r / 100)) }
    ]
  ),
  new Affectation(
    "Activité",
    "Auberge de jeunesse",
    "",
    false,
    [
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "Restaurant, café, bar",
    "",
    false,
    [
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "Petit hôpital, clinique",
    "",
    false,
    [
      { name: "# places personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "# places visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places personnel", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { name: "# places visiteurs", formula: ((x, f = 100.0, r = 0.0) => x[1] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "Etablissement pour personnes âgées, sanatorium",
    "",
    false,
    [
      { name: "# places personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "# places visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places personnel", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { name: "# places visiteurs", formula: ((x, f = 100.0, r = 0.0) => x[1] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "Cinéma",
    "",
    false,
    [
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "Théâtre, opéra, salle de concert",
    "",
    false,
    [
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "Musée, espace d’exposition, galerie",
    "",
    false,
    [
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "Bibliothèque",
    "",
    false,
    [
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "Discothèque",
    "",
    false,
    [
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "Église, mosquée, synagogue",
    "",
    false,
    [
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "Cimetière",
    "",
    false,
    [
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "Crèche, jardin d’enfant",
    "",
    false,
    [
      { name: "# places personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "# places visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places personnel", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { name: "# places visiteurs", formula: ((x, f = 100.0, r = 0.0) => x[1] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "École primaire ou secondaire",
    "",
    false,
    [
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "Gymnase, lycée",
    "",
    false,
    [
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "Conservatoire",
    "",
    false,
    [
      { name: "# places personnel", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "# places visiteurs", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places personnel", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
      { name: "# places visiteurs", formula: ((x, f = 100.0, r = 0.0) => x[1] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "École professionnelle",
    "",
    false,
    [
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "Haute école, université",
    "",
    false,
    [
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "Cours pour adultes",
    "",
    false,
    [
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "Salle de réunion ou de conférence",
    "",
    false,
    [
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "Patinoire",
    "",
    false,
    [
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "Piscine couverte",
    "",
    false,
    [
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
    ]
  ),

  new Affectation(
    "Activité",
    "Plage et piscine en plein air",
    "",
    false,
    [
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "Halle de gymnastique",
    "",
    false,
    [
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "Centre de fitness",
    "",
    false,
    [
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "Stade d'athlétisme avec terrains de jeu",
    "",
    false,
    [
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "Stade (football, hockey)",
    "",
    false,
    [
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "Tennis",
    "",
    false,
    [
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "Stand de tir",
    "",
    false,
    [
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "Piste en forêt, Parcours Vita",
    "",
    false,
    [
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "Salon de jeux, casino, local de club",
    "",
    false,
    [
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "Mini-golf",
    "",
    false,
    [
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "Salle de billard",
    "",
    false,
    [
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "Jeu de quilles ou bowling (sans la restauration)",
    "",
    false,
    [
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "Manège, écurie",
    "",
    false,
    [
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  new Affectation(
    "Activité",
    "Port de plaisance",
    "",
    false,
    [
      { name: "# places mixtes", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
    ],
    [
      { name: "# places mixtes", formula: ((x, f = 100.0, r = 0.0) => x[0] * (f / 100) * (1 - r / 100)) },
    ]
  ),
  /*
  new Affectation(
    "Activité",
    "Test (calcul manuel)",
    "",
    false,
    [
      { name: "# places habitant", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "# places visiteur", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "# pièces", description: "", type: "measurement", unit: "", min: 0.0, max: Infinity, value: null },
      { name: "zone", description: "", type: "reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Plan de mobilité", description: "Un facteur de réduction peut s'appliquer en lien avec un plan de mobilité. Référez-vous à l’article 31 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Utilisation multiple", description: "Un facteur de réduction peut s'appliquer en lien avec une utilisation multiple. Référez-vous à l’article 32 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
      { name: "Protection de l’environnement et sauvegarde du patrimoine", description: "Un facteur de réduction peut s'appliquer en lien avec la législation sur l'environnement (notamment OPB ou Opair) ou la sauvegarde du patrimoine (notamment mise sous protection ou ISOS). Référez-vous à l’article 33 du RELConstr. et, si besoin, contactez la commune ou les services compétents.", type: "special reduction", unit: "%", min: 0.0, max: 100.0, value: 0.0 },
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

}