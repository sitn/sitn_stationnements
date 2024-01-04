import pdfMake from 'pdfmake/build/pdfmake'
import { logo } from './logo.js';

// https://github.com/vitejs/vite/issues/1041
// https://github.com/bpampuch/pdfmake/issues/1459
// https://github.com/bpampuch/pdfmake/issues/2486
// https://www.youtube.com/watch?v=vK0WIrbxxcw
// https://github.com/bpampuch/pdfmake/issues/1877

/*
fetch("/img/logo.svg")
    .then(response => response.text())
    .then(console.log(svg))
*/

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
    Montserrat: {
        normal: `${url}/fonts/Montserrat-Regular.ttf`,
        bold: `${url}/fonts/Montserrat-Bold.ttf`,
        italics: `${url}/fonts/Montserrat-Italic.ttf`,
        bolditalics: `${url}/fonts/Montserrat-BoldItalic.ttf`,
    }
}

const mmToPoints = (mm) => {
    let arr = [mm]
    return arr.flat(1).map(x => 2.834645 * x)
}

export const print = (project) => {

    let docDefinition = {
        pageSize: 'A4',
        pageOrientation: 'landscape',
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
                            { text: 'Calcul du nombre de places de stationnement voiture', style: 'header' },
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
                text: `Jutification du type de localisation: ${project.locationTypeJustification}`,
                style: 'body',
                margin: [0, 5, 0, 5], // [left, top, right, bottom]
                render: project.locationTypeJustification !== ''
            },
            {
                text: `Conformément aux articles 26 à 37d du RELConstr., le calcul du nombre de places de stationnement voiture à réaliser pour le projet est détaillé dans le tableau ci-dessous.`,
                style: 'body',
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
                            { text: 'Catégorie', style: 'tableHeader', alignment: 'left' },
                            { text: 'Besoin brut', style: 'tableHeader', alignment: 'right' },
                            { text: '% Loc.', style: 'tableHeader', alignment: 'right' },
                            { text: 'Besoin net', style: 'tableHeader', alignment: 'right' },
                            { text: 'Besoin net réduit', style: 'tableHeader', alignment: 'right' },
                            { text: 'Places à réaliser', style: 'tableHeader', alignment: 'right' },
                        ],
                        ...project.affectations
                            .filter(o => o.active && o.outputs.length > 0)
                            .map(o => [
                                [
                                    { rowSpan: o.outputs.length + 1, text: o.name, style: 'tableBody', alignment: 'left' },
                                    { rowSpan: o.outputs.length + 1, ul: o.variables.filter((x) => x.type === 'measurement').map((x) => (`${x.name} = ${x.value}`)), style: 'tableBody', alignment: 'left', noWrap: false },
                                    { rowSpan: o.outputs.length + 1, ul: o.variables.filter((x) => (x.type === 'special reduction') & (x.value > 0)).map((x) => (`${x.name} = ${x.value} ${x.unit}`)), style: 'tableBody', alignment: 'left' },
                                    { text: o.outputs[0].name, style: 'tableBody', alignment: 'left' },
                                    { text: o.output[0].toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                                    { text: o.variables.filter((x) => x.type === 'reduction').map((x) => (`${x.value} ${x.unit}`)), style: 'tableBody', alignment: 'right', noWrap: true },
                                    { text: o.netOutput[0].toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                                    { text: o.reducedOutput[0].toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                                    { text: o.reducedOutput[0].toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                                    /* { text: Math.ceil(o.reducedOutput[0]), style: 'tableBody', alignment: 'right', noWrap: true }, */
                                ],
                                ...o.outputs.slice(1).map(
                                    (el, i) => [
                                        {},
                                        {},
                                        {},
                                        { text: el.name, style: 'tableBody', alignment: 'left' },
                                        { text: o.output[i + 1].toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                                        { text: o.variables.filter((x) => x.type === 'reduction').map((x) => (`${x.value} ${x.unit}`)), style: 'tableBody', alignment: 'right', noWrap: true },
                                        { text: o.netOutput[i + 1].toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                                        { text: o.reducedOutput[i + 1].toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                                        { text: o.reducedOutput[i + 1].toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                                        /* { text: Math.ceil(o.reducedOutput[i + 1]), style: 'tableBody', alignment: 'right', noWrap: true }, */
                                    ]
                                ),
                                [
                                    {},
                                    {},
                                    {},
                                    { text: 'Sous-total', style: 'tableBody', bold: true, alignment: 'left', noWrap: true },
                                    { text: o.totalOutput.toFixed(1), style: 'tableBody', bold: true, alignment: 'right', noWrap: true },
                                    {},
                                    { text: o.totalNetOutput.toFixed(1), style: 'tableBody', bold: true, alignment: 'right', noWrap: true },
                                    { text: o.totalReducedOutput.toFixed(1), style: 'tableBody', bold: true, alignment: 'right', noWrap: true },
                                    { text: o.totalReducedOutput.toFixed(1), style: 'tableBody', bold: true, alignment: 'right', noWrap: true },
                                    /* { text: o.totalReducedOutputCeil.toFixed(0), style: 'tableBody', bold: true, alignment: 'right', noWrap: true }, */
                                ],
                            ]
                            )
                            .flat(1),
                        [
                            { text: 'Total', style: 'tableHeader', bold: true, alignment: 'left' },
                            { text: '', style: 'tableHeader', alignment: 'left' },
                            { text: '', style: 'tableHeader', alignment: 'left' },
                            { text: '', style: 'tableHeader', alignment: 'left' },
                            { text: '', style: 'tableHeader', alignment: 'right', noWrap: true },
                            { text: '', style: 'tableHeader', alignment: 'left', noWrap: true },
                            { text: '', style: 'tableHeader', alignment: 'right', noWrap: true },
                            { text: '', style: 'tableHeader', alignment: 'right', noWrap: true },
                            { text: Math.ceil(project.affectations.filter(o => o.active && o.outputs.length > 0).map((x) => x.totalReducedOutput).reduce((acc, obj) => { return acc + obj }, 0)), style: 'tableHeader', alignment: 'right', noWrap: true },
                            /*                             { text: project.affectations.filter(o => o.active && o.outputs.length > 0).map((x) => x.totalReducedOutputCeil).reduce((acc, obj) => { return acc + obj }, 0), style: 'tableHeader', alignment: 'right', noWrap: true }, */
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