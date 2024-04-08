import pdfMake from 'pdfmake/build/pdfmake'
import { logo } from './logo.js';

// https://github.com/vitejs/vite/issues/1041
// https://github.com/bpampuch/pdfmake/issues/1459
// https://github.com/bpampuch/pdfmake/issues/2486
// https://www.youtube.com/watch?v=vK0WIrbxxcw
// https://github.com/bpampuch/pdfmake/issues/1877

const url = `${window.location.href}`

// load TTF fonts (instead of Virtual File System), see issue https://github.com/bpampuch/pdfmake/issues/1877
// pdfMake.vfs = pdfFonts.pdfMake.vfs;
pdfMake.fonts = {
    Roboto: {
        normal: `${url}/fonts/Roboto-Regular.ttf`,
        bold: `${url}/fonts/Roboto-Medium.ttf`,
        italics: `${url}/fonts/Roboto-Italic.ttf`,
        bolditalics: `${url}fonts/Roboto-MediumItalic.ttf`,
    },
    /*
    Montserrat: {
        normal: `${url}/fonts/Montserrat-Regular.ttf`,
        bold: `${url}/fonts/Montserrat-Bold.ttf`,
        italics: `${url}/fonts/Montserrat-Italic.ttf`,
        bolditalics: `${url}/fonts/Montserrat-BoldItalic.ttf`,
    }
    */
}

const mmToPoints = (mm) => {
    let arr = [mm]
    return arr.flat(1).map(x => 2.834645 * x)
}

export const print = (project) => {

    let docDefinition = {
        pageSize: 'A4',
        pageOrientation: 'landscape',
        // watermark: { text: 'PROTOTYPE', color: 'red', opacity: 0.3, bold: true, italics: false, angle: 45, fontSize: 26 },
        // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
        pageMargins: mmToPoints([12, 12, 12, 20]),
        header: '',
        info: {
            title: 'Calcul du nombre de places de stationnement',
            author: 'Etat de Neuchâtel',
            subject: '',
            keywords: 'stationnement, neuchâtel',
        },
        footer: (currentPage, pageCount) => {

            return {
                columns: [
                    [
                        {
                            text: ['RUE DE TIVOLI 5, CASE POSTALE, CH-2002 NEUCHÂTEL'],
                            width: '*',
                            fontSize: 8,
                            alignment: 'left',
                        },
                        {
                            text: ['TÉL. 032 889 67 40, FAX 032 722 03 84, SERVICE.AMENAGEMENTTERRITOIRE@NE.CH, WWW.NE.CH'],
                            width: '*',
                            fontSize: 8,
                            alignment: 'left',
                        }
                    ],
                    {
                        text: `${currentPage.toString()} / ${pageCount}`,
                        width: 'auto',
                        fontSize: 8,
                        alignment: 'right',
                        noWrap: true
                    }
                ],
                // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
                margin: mmToPoints([12, 5, 12, 12])
            }
        },
        content: [
            {
                columns: [
                    {
                        svg: logo,
                        width: 95,
                        alignment: 'left',
                        margin: [0, 0, 0, 10], // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
                    },
                    {
                        // star-sized columns fill the remaining space
                        // if there's more than one star-column, available width is divided equally
                        width: '*',
                        alignment: 'center',
                        stack: [
                            { text: 'Calcul des stationnements', style: 'header' },
                            { text: 'Annexe à joindre à la demande de permis', style: 'subheader' },
                        ],
                    },
                    {
                        // fixed width
                        width: '140',
                        alignment: 'right',
                        stack: [
                            { text: `DÉPARTEMENT DU DÉVELOPPEMENT TERRITORIAL ET DE L'ENVIRONNEMENT`, fontSize: 7, bold: true },
                            { text: `SERVICE DE L'AMÉNAGEMENT DU TERRITOIRE`, fontSize: 6 },
                        ],
                    },
                ],
                columnGap: 10,
                render: true
            },
            {
                text: `Date: ${new Date().toLocaleString('fr-CH')} / dossier SATAC: ${project.satac} / Commune: ${project.commune.comnom} / Biens-fonds: ${project.parcels.join(', ')} / Type de localisation ${project.locationType.name} ${project.eco === true ? '/ Projet de quartier durable' : ''}`,
                style: 'body',
                margin: [0, 10, 0, 5], // [left, top, right, bottom]
                render: true
            },
            {
                text: `Justification du type de localisation: ${project.locationTypeJustification}`,
                style: 'body',
                margin: [0, 5, 0, 5], // [left, top, right, bottom]
                render: project.locationTypeJustification !== ''
            },

            // SECTION STATIONNEMENTS VOITURES
            {
                // text: `Conformément à l'art. 30 du RELConstr., le nombre de places de stationnement pour voitures à réaliser pour le projet est détaillé dans le tableau ci-dessous.`,
                text: `Stationnements voitures (art. 30 RELConstr.)`,
                style: 'tableTitle',
                margin: [0, 5, 0, 2], // [left, top, right, bottom]
                render: true
            },
            {
                style: 'table',
                table: {
                    headerRows: 1,
                    dontBreakRows: false,
                    widths: ['*', 'auto', 'auto', 'auto', 55, 45, 55, 55, 55],
                    body: [
                        [
                            { text: 'Affectation', style: 'tableHeader', alignment: 'left' },
                            { text: 'Variable(s)', style: 'tableHeader', alignment: 'left' },
                            { text: 'Facteur(s) de réduction', style: 'tableHeader', alignment: 'left' },
                            { text: 'Type de place', style: 'tableHeader', alignment: 'left' },
                            { text: 'Besoin brut', style: 'tableHeader', alignment: 'right' },
                            { text: '% Loc.', style: 'tableHeader', alignment: 'right' },
                            { text: 'Besoin net', style: 'tableHeader', alignment: 'right' },
                            { text: 'Besoin net réduit', style: 'tableHeader', alignment: 'right' },
                            { text: 'Places à réaliser', style: 'tableHeader', alignment: 'right' },
                        ],
                        ...project.getAffectations()
                            .map(o => [

                                // TABLE FIRST ROW
                                [
                                    // Affectation
                                    { rowSpan: o.getOutputs(['car', 'special']).length + 2, text: o.name, style: 'tableBody', alignment: 'left' },

                                    // Variable(s)
                                    { rowSpan: o.getOutputs(['car', 'special']).length + 2, ul: o.getVariables(['measurement']).map((e) => (`${e.name} = ${e.value}`)), style: 'tableBody', alignment: 'left', noWrap: false },

                                    // Facteur(s) de réduction
                                    { rowSpan: o.getOutputs(['car', 'special']).length + 2, ul: o.getVariables(['special reduction']).filter((e) => (e.value > 0)).map((e) => (`${e.name} = ${e.value} ${e.unit}`)), style: 'tableBody', alignment: 'left' },

                                    // Catégorie
                                    { text: o.getOutputs(['car'])[0].name, style: 'tableBody', alignment: 'left' },

                                    // Besoin brut
                                    { text: o.getRawOutputs(['car'])[0].value.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },

                                    // % Loc.
                                    { text: o.getVariables(['reduction']).map((e) => (`${e.value} ${e.unit}`)), style: 'tableBody', alignment: 'right', noWrap: true },

                                    // Besoin net
                                    { text: o.getNetOutputs(['car'])[0].value.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },

                                    // Besoin net réduit
                                    { text: o.getReducedOutputs(['car'])[0].value.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },

                                    // Places à réaliser
                                    { text: o.getReducedOutputs(['car'])[0].value.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },

                                ],

                                // TABLE BODY DATA ROWS - NORMAL CARS
                                ...o.outputs.filter(e => e.group === 'car').slice(1).map(
                                    (el, i) => [
                                        {},
                                        {},
                                        {},

                                        // Catégorie
                                        { text: el.name, style: 'tableBody', alignment: 'left' },

                                        // Besoin brut
                                        { text: o.getRawOutputs(['car'])[i + 1].value.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },

                                        // % Loc.
                                        { text: o.getVariables(['reduction']).map((e) => (`${e.value} ${e.unit}`)), style: 'tableBody', alignment: 'right', noWrap: true },

                                        // Besoin net
                                        { text: o.getNetOutputs(['car'])[i + 1].value.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },

                                        // Besoin net réduit
                                        { text: o.getReducedOutputs(['car'])[i + 1].value.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },

                                        // Places à réaliser
                                        { text: o.getReducedOutputs(['car'])[i + 1].value.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },

                                    ]
                                ),
                                // TABLE BODY SUBTOTAL ROWS - NORMAL CARS    
                                [
                                    {},
                                    {},
                                    {},

                                    // Sous-total
                                    { text: 'Sous-total', style: 'tableBody', bold: true, alignment: 'left', noWrap: true },

                                    // Besoin brut (sous-total)
                                    { text: o.getTotalOutput(['car']).toFixed(1), style: 'tableBody', bold: true, alignment: 'right', noWrap: true },

                                    {},

                                    // Besoin net (sous-total)
                                    { text: o.getTotalNetOutput(['car']).toFixed(1), style: 'tableBody', bold: true, alignment: 'right', noWrap: true },

                                    // Besoin net réduit (sous-total)
                                    { text: o.getTotalReducedOutput(['car']).toFixed(1), style: 'tableBody', bold: true, alignment: 'right', noWrap: true },

                                    // Places à réaliser (sous-total)
                                    { text: o.getTotalReducedOutput(['car']).toFixed(1), style: 'tableBody', bold: true, alignment: 'right', noWrap: true },
                                ],

                                // TABLE BODY DATA ROWS - SPECIAL CARS
                                ...o.outputs.filter(e => e.group === 'special').map(
                                    (el, i) => [
                                        {},
                                        {},
                                        {},

                                        // Catégorie
                                        { text: el.name, style: 'tableBody', alignment: 'left' },

                                        // Besoin brut
                                        { text: '-', style: 'tableBody', alignment: 'right', noWrap: true },

                                        // % Loc.
                                        { text: '-', style: 'tableBody', alignment: 'right', noWrap: true },

                                        // Besoin net
                                        { text: '-', style: 'tableBody', alignment: 'right', noWrap: true },

                                        // Besoin net réduit
                                        { text: '-', style: 'tableBody', alignment: 'right', noWrap: true },

                                        // Places à réaliser
                                        { text: o.getReducedOutputs(['special'])[i].value.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },

                                    ]
                                ),

                                // TABLE BODY SUBTOTAL ROWS - SPECIAL CARS    
                                [
                                    {},
                                    {},
                                    {},

                                    // Sous-total
                                    { text: 'Sous-total', style: 'tableBody', bold: true, alignment: 'left', noWrap: true },

                                    // Besoin brut (sous-total)
                                    { text: '-', style: 'tableBody', bold: true, alignment: 'right', noWrap: true },

                                    {},

                                    // Besoin net (sous-total)
                                    { text: '-', style: 'tableBody', bold: true, alignment: 'right', noWrap: true },

                                    // Besoin net réduit (sous-total)
                                    { text: '-', style: 'tableBody', bold: true, alignment: 'right', noWrap: true },

                                    // Places à réaliser (sous-total)
                                    { text: o.getTotalReducedOutput(['special']).toFixed(1), style: 'tableBody', bold: true, alignment: 'right', noWrap: true },
                                ],

                            ]

                            )
                            .flat(1),


                        [
                            { text: 'Total (arrondi sup.)', style: 'tableHeader', bold: true, alignment: 'left' },
                            { text: '', style: 'tableHeader', alignment: 'left' },
                            { text: '', style: 'tableHeader', alignment: 'left' },
                            { text: '', style: 'tableHeader', alignment: 'left' },
                            { text: '', style: 'tableHeader', alignment: 'right', noWrap: true },
                            { text: '', style: 'tableHeader', alignment: 'left', noWrap: true },
                            { text: '', style: 'tableHeader', alignment: 'right', noWrap: true },
                            { text: '', style: 'tableHeader', alignment: 'right', noWrap: true },
                            { text: Math.ceil(project.getAffectations().map((x) => x.getTotalReducedOutput(['car', 'special'])).reduce((acc, obj) => { return acc + obj }, 0)), style: 'tableHeader', alignment: 'right', noWrap: true },
                        ],
                    ]
                },
                layout: {
                    hLineWidth: function (i, node) {
                        return (i === 0 || i === node.table.body.length) ? 1 : 1;
                    },
                    vLineWidth: (i, node) => ((i === 0 || i === node.table.widths.length) ? 0 : 0),
                },
                render: true
            },

            // SECTION EQUIPEMENTS DE RECHARGE POUR VEHICULES ELECTRIQUES
            /*
            {
                pageBreak: 'before',
                // text: `Conformément à l'art. 34 du RELCEn., le nombre d'équipements pour véhicules électriques à réaliser pour le projet est détaillé dans le tableau ci-dessous.`,
                text: `Équipements pour véhicules électriques (art. 34 RELCEn.)`,
                style: 'tableTitle',
                margin: [0, 5, 0, 2], // [left, top, right, bottom]
                render: project.type.equipement
            },
            {
                style: 'table',
                table: {
                    headerRows: 1,
                    dontBreakRows: false,
                    widths: ['auto', 'auto', 'auto', 55],
                    body: [
                        [
                            { text: 'Catégorie', style: 'tableHeader', alignment: 'left' },
                            { text: 'Affectation(s)', style: 'tableHeader', alignment: 'left' },
                            { text: 'Type d’équipement\n(selon SIA 2060)', style: 'tableHeader', alignment: 'left' },
                            { text: 'Équipements à réaliser', style: 'tableHeader', alignment: 'right' },
                        ],
                        [
                            { text: 'Logements', style: 'tableBody', alignment: 'left' },
                            { text: project.getAffectationNames('Logement').join('; '), style: 'tableBody', alignment: 'left' },
                            { text: 'Niveau D (bornes)', style: 'tableBody', alignment: 'left' },
                            { text: project.getStations('Logement'), style: 'tableBody', alignment: 'right' },
                        ],
                        [
                            { text: 'Activités', style: 'tableBody', alignment: 'left' },
                            { text: project.getAffectationNames('Activité').join('; '), style: 'tableBody', alignment: 'left' },
                            { text: 'Niveau C2', style: 'tableBody', alignment: 'left' },
                            { text: project.getStations('Activité'), style: 'tableBody', alignment: 'right' },
                        ],
                        [
                            { text: 'Logements et activités', style: 'tableBody', alignment: 'left' },
                            { text: 'Cf. affectations ci-dessus', style: 'tableBody', alignment: 'left' },
                            { text: 'Niveau B', style: 'tableBody', alignment: 'left' },
                            { text: Math.ceil(project.getReducedNeeds(['car', 'special'])) - project.getStations('Logement') - project.getStations('Activité') - project.getStations('Pas concerné'), style: 'tableBody', alignment: 'right' },
                        ],
                        [
                            { text: 'Pas concerné', style: 'tableBody', alignment: 'left' },
                            { text: project.getAffectationNames('Pas concerné').join('; '), style: 'tableBody', alignment: 'left' },
                            { text: 'Aucun', style: 'tableBody', alignment: 'left' },
                            { text: project.getStations('Pas concerné'), style: 'tableBody', alignment: 'right' },
                        ],
                        [
                            { text: 'Total', style: 'tableHeader', alignment: 'left' },
                            { text: '', style: 'tableHeader', alignment: 'left' },
                            { text: '', style: 'tableHeader', alignment: 'left' },
                            { text: Math.ceil(project.getReducedNeeds(['car', 'special'])), style: 'tableHeader', alignment: 'right' },
                        ],
                    ]
                },
                layout: {
                    hLineWidth: function (i, node) {
                        return (i === 0 || i === node.table.body.length) ? 1 : 1;
                    },
                    vLineWidth: (i, node) => ((i === 0 || i === node.table.widths.length) ? 0 : 0),
                },
                render: project.type.equipement
            },
            */

            // SECTION STATIONNEMENTS DEUX-ROUES MOTORISES
            {
                pageBreak: 'before',
                // text: `Conformément à l'art. 37c RELConstr., le nombre de places de stationnements pour deux-roues motorisés à réaliser pour le projet est détaillé dans le tableau ci-dessous.`,
                text: `Stationnements deux-roues motorisés (art. 37c RELConstr.)`,
                style: 'tableTitle',
                margin: [0, 5, 0, 2], // [left, top, right, bottom]
                render: true
            },
            {
                style: 'table',
                table: {
                    headerRows: 1,
                    dontBreakRows: false,
                    widths: ['auto', 'auto', 'auto', 55],
                    body: [
                        [
                            { text: 'Affectation', style: 'tableHeader', alignment: 'left' },
                            { text: 'Variable(s)', style: 'tableHeader', alignment: 'left' },
                            { text: 'Type de place', style: 'tableHeader', alignment: 'left' },
                            { text: 'Places à réaliser', style: 'tableHeader', alignment: 'right' },
                        ],
                        ...project.getAffectations()
                            .map(o => [

                                // TABLE FIRST ROW
                                [
                                    // Affectation
                                    { rowSpan: o.getOutputs(['motorcycle']).length + 1, text: o.name, style: 'tableBody', alignment: 'left' },

                                    // Variable(s)
                                    { rowSpan: o.getOutputs(['motorcycle']).length + 1, ul: o.getVariables(['measurement']).map((e) => (`${e.name} = ${e.value}`)), style: 'tableBody', alignment: 'left', noWrap: false },

                                    // Catégorie
                                    { text: o.getOutputs(['motorcycle'])[0].name, style: 'tableBody', alignment: 'left' },

                                    // Places à réaliser
                                    { text: o.getReducedOutputs(['motorcycle'])[0].value.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },

                                ],

                                // TABLE BODY ROWS (ROW 2 -> LAST)
                                ...o.getOutputs(['motorcycle']).slice(1).map(
                                    (el, i) => [
                                        {},
                                        {},

                                        // Catégorie
                                        { text: el.name, style: 'tableBody', alignment: 'left' },

                                        // Places à réaliser
                                        { text: o.getReducedOutputs(['motorcycle'])[i + 1].value.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },

                                    ]
                                ),

                                [
                                    {},
                                    {},

                                    // Sous-total
                                    { text: 'Sous-total', style: 'tableBody', bold: true, alignment: 'left', noWrap: true },

                                    // Places à réaliser (sous-total)
                                    { text: o.getTotalReducedOutput(['motorcycle']).toFixed(1), style: 'tableBody', bold: true, alignment: 'right', noWrap: true },
                                ],

                            ]
                            )
                            .flat(1),
                        [
                            { text: 'Total (arrondi sup.)', style: 'tableHeader', bold: true, alignment: 'left' },
                            { text: '', style: 'tableHeader', alignment: 'left' },
                            { text: '', style: 'tableHeader', alignment: 'left' },
                            { text: Math.ceil(project.getAffectations().map((x) => x.getTotalReducedOutput(['motorcycle'])).reduce((acc, obj) => { return acc + obj }, 0)), style: 'tableHeader', alignment: 'right', noWrap: true },
                        ],
                    ]
                },
                layout: {
                    hLineWidth: function (i, node) {
                        return (i === 0 || i === node.table.body.length) ? 1 : 1;
                    },
                    vLineWidth: (i, node) => ((i === 0 || i === node.table.widths.length) ? 0 : 0),
                },
                render: true
            },

            // SECTION STATIONNEMENTS VELOS
            {
                pageBreak: 'before',
                // text: `Conformément à l'art. 37b du RELConstr., le nombre de places de stationnements pour vélos (y.c. électriques et spéciaux) à réaliser pour le projet est détaillé dans le tableau ci-dessous.`,
                text: `Stationnements vélos, y.c. électriques et spéciaux (art. 37b RELConstr.)`,
                style: 'tableTitle',
                margin: [0, 5, 0, 2], // [left, top, right, bottom]
                render: true
            },
            {
                style: 'table',
                table: {
                    headerRows: 1,
                    dontBreakRows: false,
                    widths: ['auto', 'auto', 'auto', 55],
                    body: [
                        [
                            { text: 'Affectation', style: 'tableHeader', alignment: 'left' },
                            { text: 'Variable(s)', style: 'tableHeader', alignment: 'left' },
                            { text: 'Type de place', style: 'tableHeader', alignment: 'left' },
                            { text: 'Places à réaliser', style: 'tableHeader', alignment: 'right' },
                        ],
                        ...project.getAffectations()
                            .map(o => [

                                // TABLE FIRST ROW
                                [
                                    // Affectation
                                    { rowSpan: o.getOutputs(['bicycle']).length + 1, text: o.name, style: 'tableBody', alignment: 'left' },

                                    // Variable(s)
                                    { rowSpan: o.getOutputs(['bicycle']).length + 1, ul: o.getVariables(['measurement']).map((e) => (`${e.name} = ${e.value}`)), style: 'tableBody', alignment: 'left', noWrap: false },

                                    // Catégorie
                                    { text: o.getOutputs(['bicycle'])[0].name, style: 'tableBody', alignment: 'left' },

                                    // Places à réaliser
                                    { text: o.getReducedOutputs(['bicycle'])[0].value.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },

                                ],

                                // TABLE BODY ROWS (ROW 2 -> LAST)
                                ...o.getOutputs(['bicycle']).slice(1).map(
                                    (el, i) => [
                                        {},
                                        {},

                                        // Catégorie
                                        { text: el.name, style: 'tableBody', alignment: 'left' },

                                        // Places à réaliser
                                        { text: o.getReducedOutputs(['bicycle'])[i + 1].value.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },

                                    ]
                                ),

                                [
                                    {},
                                    {},

                                    // Sous-total
                                    { text: 'Sous-total', style: 'tableBody', bold: true, alignment: 'left', noWrap: true },

                                    // Places à réaliser (sous-total)
                                    { text: o.getTotalReducedOutput(['bicycle']).toFixed(1), style: 'tableBody', bold: true, alignment: 'right', noWrap: true },
                                ],

                            ]
                            )
                            .flat(1),
                        [
                            { text: 'Total (arrondi sup.)', style: 'tableHeader', bold: true, alignment: 'left' },
                            { text: '', style: 'tableHeader', alignment: 'left' },
                            { text: '', style: 'tableHeader', alignment: 'left' },
                            { text: Math.ceil(project.getAffectations().map((e) => e.getTotalReducedOutput(['bicycle'])).reduce((acc, obj) => { return acc + obj }, 0)), style: 'tableHeader', alignment: 'right', noWrap: true },

                        ],
                    ]
                },
                layout: {
                    hLineWidth: function (i, node) {
                        return (i === 0 || i === node.table.body.length) ? 1 : 1;
                    },
                    vLineWidth: (i, node) => ((i === 0 || i === node.table.widths.length) ? 0 : 0),
                },
                render: true
            },
            {
                text: `Pour les logements avec encadrement, une place par appartement est calculée au sens de l'article 37 b alinéa 4 du RELConstr. Le chiffre indiqué dans le tableau est un minimum. Une place par pièce est préconisée selon la norme VSS.`,
                style: 'body',
                margin: [0, 5, 0, 2], // [left, top, right, bottom]
                render: true
            },


        ],
        styles: {
            header: {
                font: 'Roboto',
                fontSize: 13,
                bold: true,
                margin: [0, 0, 0, 3] // [left, top, right, bottom]
            },
            subheader: {
                font: 'Roboto',
                fontSize: 11,
                bold: true,
                margin: [0, 3, 0, 3] // [left, top, right, bottom]
            },
            subsubheader: {
                font: 'Roboto',
                fontSize: 10,
                bold: true,
                margin: [0, 5, 0, 5] // [left, top, right, bottom]
            },
            body: {
                font: 'Roboto',
                fontSize: 10,
                bold: false,
                margin: [0, 5, 0, 5] // [left, top, right, bottom]
            },
            tableTitle: {
                font: 'Roboto',
                fontSize: 11,
                bold: true,
                margin: [0, 5, 0, 5] // [left, top, right, bottom]
            },
            table: {
                font: 'Roboto',
                fontSize: 9,
                margin: [0, 10, 0, 10] // [left, top, right, bottom]
            },
            tableHeader: {
                font: 'Roboto',
                fontSize: 9,
                bold: true,
                color: 'black',
                fillColor: '#eeeeee',
                margin: [2, 4, 2, 4] // [left, top, right, bottom]
            },
            tableBody: {
                font: 'Roboto',
                fontSize: 9,
                margin: [2, 0, 2, 0] // [left, top, right, bottom]
            },
        },
    }

    // filter content to be rendered
    docDefinition.content = docDefinition.content.filter(o => o.render)
    pdfMake.createPdf(docDefinition).download('ne_calcul_stationnement.pdf')

}