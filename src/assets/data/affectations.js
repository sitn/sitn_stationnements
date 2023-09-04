export const affectations2 = [
    {
        "name": "Logements standards",
        "type": "Logement",
        "description": "",
        "unit": "Par 100 m2 SBP",
        "factors": [
            {
                "name": "Habitant",
                "input": [
                    "Surface brute de plancher (SBP)",
                    "Nombre de logements"
                ],
                "formula": ((x, y, r = 1.0) => Math.max(0.01 * x, y) * r)
            },
            {
                "name": "Visiteur",
                "input": [
                    "Surface m2"
                ],
                "formula": ((x, y, r = 1.0) => Math.max(0.001 * x, y) * r)
            }
        ]
    },
    {
        "name": "Logements avec encadrement ou étudiants",
        "type": "Logement",
        "description": "",
        "unit": "Par 100 m2 SBP",
        "factors": [
            {
                "name": "Habitant",
                "input": [
                    "Surface brute de plancher (SBP)"
                ],
                "formula": ((x, r = 1.0) => 0.01 * x * r)
            },
            {
                "name": "Visiteur",
                "input": [
                    "Surface m2"
                ],
                "formula": ((x, r = 1.0) => 0.001 * x * r)
            }
        ]
    },
    {
        "name": "Industrie, artisanat",
        "type": "Activité",
        "description": "",
        "unit": "Par 100 m2 SBP",
        "factors": [
            {
                "name": "Employé",
                "input": [
                    "Surface brute de plancher (SBP)"
                ],
                "formula": ((x, r = 1.0) => 0.01 * x * r)
            },
            {
                "name": "Visiteur",
                "input": [
                    "Surface m2"
                ],
                "formula": ((x, r = 1.0) => 0.002 * x * r)
            }
        ]
    },
    {
        "name": "Entrepôts et dépôts",
        "type": "Activité",
        "description": "",
        "unit": "Par 100 m2 SBP"
    },
    {
        "name": "Services à nombreuse clientèle",
        "type": "Activité",
        "description": "(banque, poste administration publique avec guichets, agence de voyage médecin, dentiste, cabinet de soins, eproduction et copie, nettoyage chimique coiffeur,…)",
        "unit": "Par 100 m2 SBP"
    },
    {
        "name": "Autres services",
        "type": "Activité",
        "description": "(administration publique sans guichet, bureau d’ingénieur ou d’architecte, étude d’avocat, assurance, caisse maladie, administration d’industries, fiduciaire, laboratoire, entreprise de transport,…)",
        "unit": "Par 100 m2 SBP"
    },
    {
        "name": "Magasins à nombreuse clientèle",
        "type": "Activité",
        "description": "(alimentation, pharmacie, droguerie, grand magasin, kiosque, …)",
        "unit": "Par 100 m2 SV"
    },
    {
        "name": "Autres magasins",
        "type": "Activité",
        "description": "(librairie, ménage, quincaillerie horlogerie, bijouterie, ameublement, magasins spécialisés)",
        "unit": "Par 100 m2 SV"
    },
    {
        "name": "Hôtel",
        "type": "Activité",
        "description": "",
        "unit": "Par lit"
    },
    {
        "name": "Auberge de jeunesse",
        "type": "Activité",
        "description": "",
        "unit": "Par lit"
    },
    {
        "name": "Restaurant, café, bar",
        "type": "Activité",
        "description": "",
        "unit": "Par place assise"
    },
    {
        "name": "Petit hôpital, clinique",
        "type": "Activité",
        "description": "",
        "unit": "Par lit"
    },
    {
        "name": "Etablissement pour personnes âgées, sanatorium",
        "type": "Activité",
        "description": "",
        "unit": "Par lit"
    },
    {
        "name": "Cinéma",
        "type": "Activité",
        "description": "",
        "unit": "Par place assise"
    },
    {
        "name": "Théâtre, opéra, salle de concert",
        "type": "Activité",
        "description": "",
        "unit": "Par place assise"
    },
    {
        "name": "Musée, espace d’exposition, galerie",
        "type": "Activité",
        "description": "",
        "unit": "Par 100 m2"
    },
    {
        "name": "Bibliothèque",
        "type": "Activité",
        "description": "",
        "unit": "Par 100 m2"
    },
    {
        "name": "Discothèque",
        "type": "Activité",
        "description": "",
        "unit": "Par place assise ou m2 de piste"
    },
    {
        "name": "Eglise, mosquée, synagogue",
        "type": "Activité",
        "description": "",
        "unit": "Par place assise"
    },
    {
        "name": "Cimetière",
        "type": "Activité",
        "description": "",
        "unit": "Par 100 m2"
    },
    {
        "name": "Crèche, jardin d’enfant",
        "type": "Activité",
        "description": "",
        "unit": "Par salle de classe"
    },
    {
        "name": "École primaire ou secondaire",
        "type": "Activité",
        "description": "",
        "unit": "Par salle de classe"
    },
    {
        "name": "Gymnase, lycée",
        "type": "Activité",
        "description": "",
        "unit": "Par salle de classe"
    },
    {
        "name": "Conservatoire",
        "type": "Activité",
        "description": "",
        "unit": "Par salle"
    },
    {
        "name": "École professionnelle",
        "type": "Activité",
        "description": "",
        "unit": "Par élève"
    },
    {
        "name": "Haute école, université",
        "type": "Activité",
        "description": "",
        "unit": "Par étudiant"
    },
    {
        "name": "Cours pour adultes",
        "type": "Activité",
        "description": "",
        "unit": "Par place d’étude"
    },
    {
        "name": "Salle de réunion ou de conférence",
        "type": "Activité",
        "description": "",
        "unit": "Par place assise"
    },
    {
        "name": "Patinoire",
        "type": "Activité",
        "description": "",
        "unit": "Par 100 m² de glace et en plus par spectacteur"
    },
    {
        "name": "Picine couverte",
        "type": "Activité",
        "description": "",
        "unit": "Par place de vestiaire et en plus par spectacteur"
    },
    {
        "name": "Plage et piscine en plein air",
        "type": "Activité",
        "description": "",
        "unit": "Par 100 m² de parcelle"
    },
    {
        "name": "Halle de gymnastique",
        "type": "Activité",
        "description": "",
        "unit": "Par 100 m² de halle et en plus par spectacteur"
    },
    {
        "name": "Centre de fitness",
        "type": "Activité",
        "description": "",
        "unit": "Par place de vestiaire"
    },
    {
        "name": "Stade d'athlétisme avec terrains de jeu",
        "type": "Activité",
        "description": "",
        "unit": "Par 100 m² de surface et en plus par spectacteur"
    },
    {
        "name": "Stade (football, hoykey)",
        "type": "Activité",
        "description": "",
        "unit": "Par spectacteur"
    },
    {
        "name": "Tennis",
        "type": "Activité",
        "description": "",
        "unit": "Par court et en plus par spectacteur"
    },
    {
        "name": "Stand de tir",
        "type": "Activité",
        "description": "",
        "unit": "Par cible"
    },
    {
        "name": "Piste en forêt, Parcours Vita",
        "type": "Activité",
        "description": "",
        "unit": "Par équipement"
    },
    {
        "name": "Piste en forêt, Parcours Vita",
        "type": "Activité",
        "description": "",
        "unit": "Par équipement"
    },
    {
        "name": "Salon de jeu, casino, local de club",
        "type": "Activité",
        "description": "",
        "unit": "Par place assise"
    },
    {
        "name": "Mini-golf",
        "type": "Activité",
        "description": "",
        "unit": "Par équipement"
    },
    {
        "name": "Salle de billard",
        "type": "Activité",
        "description": "",
        "unit": "Par table"
    },
    {
        "name": "Jeu de quilles ou bowling (sans la restauration)",
        "type": "Activité",
        "description": "",
        "unit": "Par piste"
    },
    {
        "name": "Manège, écurie",
        "type": "Activité",
        "description": "",
        "unit": "Par box"
    },
    {
        "name": "Port de plaisance",
        "type": "Activité",
        "description": "",
        "unit": "Par amarrage ou place à quai"
    }
]