<template>
    <!-- 5. SUMMARY -->
    <div class="q-pa-md">

        <q-banner inline-actions class="text-white bg-red q-my-md q-pa-md rounded-borders" v-if="!this.render">
            <template v-slot:avatar>
                <q-icon name="error" color="white" />
            </template>
            <span class="text-body1">Veuillez compléter l'étape précédente</span>
        </q-banner>

        <div class="row" v-if="this.render">
            <div id="summary-container" class="col-xs-12 col-sm-6 col-md-6">
                <div class="bg-white q-pa-md q-my-sm rounded-borders">

                    <table id="summary-table">
                        <thead>
                            <tr>
                                <th>Affectation</th>
                                <th>Type de place</th>
                                <th class="text-right"># Places</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="item in this.project.affectations.filter(e => e.active)">
                                <tr v-for="(subitem, iSub) in item.reducedOutput2">
                                    <td v-if="iSub === 0" :rowspan="item.factors.length" class="">{{ item.name }}</td>
                                    <td>{{ subitem.name }}</td>
                                    <td class="bg-light-blue-1 text-right">{{ Math.ceil(subitem.value) }}</td>
                                </tr>
                            </template>
                            <tr>
                                <td class="text-weight-bold">Total</td>
                                <td class="text-weight-bold"></td>
                                <td class="bg-light-blue-1 text-weight-bold text-right">
                                    {{ this.project.affectations.filter(e => e.active).map((x) =>
                                        x.totalReducedOutputCeil).reduce((acc, obj) => { return acc + obj }, 0) }}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- 
                    <table id="summary-table">
                        <tr>
                            <th>Affectation</th>
                            <th class="text-right"># Places</th>
                        </tr>

                        <tr v-for="(affectation, index) in this.project.affectations.filter(e => e.active)" :key="index">
                            <td>{{ affectation.name }}</td>
                            <td class="bg-light-blue-1 text-right">
                                {{
                                Math.ceil(affectation.totalReducedOutput)
                                }}</td>
                        </tr>

                        <tr>
                            <td class="text-weight-bold">Total (arrondi supérieur)</td>
                            <td class="bg-light-blue-1 text-weight-bold text-right">
                                {{ this.project.affectations.filter(e => e.active).map((x) =>
                                Math.ceil(x.totalReducedOutput)).reduce((acc, obj) => { return acc + obj }, 0) }}
                            </td>
                        </tr>

                    </table>
                    -->

                </div>


                <q-btn id="print-btn" color="white" text-color="black" icon="print" label="Imprimer PDF" @click="printPDF2"
                    class="no-print" />
            </div>

        </div>

    </div>
</template>

<script>

// https://github.com/vitejs/vite/issues/1041
// https://github.com/bpampuch/pdfmake/issues/1459
// https://github.com/bpampuch/pdfmake/issues/2486
// https://www.youtube.com/watch?v=vK0WIrbxxcw
// https://github.com/bpampuch/pdfmake/issues/1877

import pdfFonts from 'pdfmake/build/fonts.js';
import pdfMake from 'pdfmake/build/pdfmake';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { logo } from './logo.js';
import { MapBrowserEventHandler } from 'ol';

export default {
    name: 'FormE',
    components: {},
    props: { 'project': Object },
    emits: [],
    setup() {
        return {
        }
    },
    data() {
        return {
        }
    },
    computed: {
        render() {
            return (this.project.commune !== null) & (this.project.locationType !== null) & this.project.hasAffectation
        },

    },
    mounted() {
        console.log('FORM E - mounted')
        console.log(this.project.affectations.filter(e => e.active).map(x => ({ name: x.name, value: x.reducedOutput })).flat(1))

        // ...
        var bibi = this.project.affectations
            .filter(o => o.active)
            .map(o => [
                [
                    { rowSpan: o.factors.length + 1, text: o.name, style: 'tableBody', alignment: 'left' },
                    { text: o.name, style: 'tableBody', alignment: 'left' },
                    { text: `khjkjhkh %`, style: 'tableBody', alignment: 'right', noWrap: true },
                ],
                ...o.factors.slice(0).map(
                    e => [
                        {},
                        { text: e.name, style: 'tableBody', alignment: 'left' },
                        { text: `blblb%`, style: 'tableBody', alignment: 'right', noWrap: true },
                    ]
                ),
            ]
            )
            .flat(1)

        console.log('bibi')
        console.log(bibi)


    },
    methods: {
        print() {
            window.print()
        },
        mmToPoints(mm) {
            let arr = [mm]
            return arr.flat(1).map(x => 2.834645 * x)
        },
        printPDF2() {

            let docDefinition = {
                pageSize: 'A4',
                pageOrientation: 'landscape',
                // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
                pageMargins: this.mmToPoints([12, 12, 12, 20]),
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
                        margin: this.mmToPoints([12, 5, 12, 12])
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
                        // optional space between columns
                        columnGap: 10,
                        render: true
                    },
                    {
                        text: `Date: ${new Date().toLocaleString('fr-CH')} / dossier SATAC: ${this.project.satac} / Commune: ${this.project.commune.comnom} / Biens-fonds: ${this.project.parcels.join(', ')} / Type de localisation ${this.project.locationType.name}`,
                        style: 'body',
                        margin: [0, 10, 0, 5], // [left, top, right, bottom]
                        render: true
                    },
                    {
                        text: `Jutification du type de localisation: ${this.project.locationTypeJustification}`,
                        style: 'body',
                        margin: [0, 5, 0, 5], // [left, top, right, bottom]
                        render: this.project.locationTypeJustification !== ''
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
                                ...this.project.affectations
                                    .filter(o => o.active && o.factors.length > 0)
                                    .map(o => [
                                        [
                                            { rowSpan: o.factors.length + 1, text: o.name, style: 'tableBody', alignment: 'left' },
                                            { rowSpan: o.factors.length + 1, ul: o.variables.filter((x) => x.type === 'measurement').map((x) => (`${x.name} = ${x.value}`)), style: 'tableBody', alignment: 'left', noWrap: false },
                                            { rowSpan: o.factors.length + 1, ul: o.variables.filter((x) => (x.type === 'special reduction') & (x.value > 0)).map((x) => (`${x.name} = ${x.value} ${x.unit}`)), style: 'tableBody', alignment: 'left' },
                                            { text: o.factors[0].name, style: 'tableBody', alignment: 'left' },
                                            { text: o.output[0].toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                                            { text: o.variables.filter((x) => x.type === 'reduction').map((x) => (`${x.value} ${x.unit}`)), style: 'tableBody', alignment: 'right', noWrap: true },
                                            { text: o.netOutput[0].toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                                            { text: o.reducedOutput[0].toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                                            { text: Math.ceil(o.reducedOutput[0]), style: 'tableBody', alignment: 'right', noWrap: true },
                                        ],
                                        ...o.factors.slice(1).map(
                                            (el, i) => [
                                                {},
                                                {},
                                                {},
                                                { text: el.name, style: 'tableBody', alignment: 'left' },
                                                { text: o.output[i + 1].toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                                                { text: o.variables.filter((x) => x.type === 'reduction').map((x) => (`${x.value} ${x.unit}`)), style: 'tableBody', alignment: 'right', noWrap: true },
                                                { text: o.netOutput[i + 1].toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                                                { text: o.reducedOutput[i + 1].toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                                                { text: Math.ceil(o.reducedOutput[i + 1]), style: 'tableBody', alignment: 'right', noWrap: true },
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
                                            { text: o.totalReducedOutputCeil.toFixed(0), style: 'tableBody', bold: true, alignment: 'right', noWrap: true },
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
                                    { text: this.project.affectations.filter(o => o.active && o.factors.length > 0).map((x) => x.totalReducedOutputCeil).reduce((acc, obj) => { return acc + obj }, 0), style: 'tableHeader', alignment: 'right', noWrap: true },
                                ],
                            ]
                        },
                        layout: {
                            //   'lightHorizontalLines'
                            hLineWidth: function (i, node) {
                                return (i === 0 || i === node.table.body.length) ? 1 : 1;
                            },
                            vLineWidth: (i, node) => ((i === 0 || i === node.table.widths.length) ? 0 : 0),
                        },
                        render: true
                    },

                ],
                styles: {
                    // margins [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
                    header: {
                        fontSize: 13,
                        bold: true,
                        margin: [0, 0, 0, 3] // [left, top, right, bottom]
                    },
                    subheader: {
                        fontSize: 11,
                        bold: true,
                        margin: [0, 3, 0, 3] // [left, top, right, bottom]
                    },
                    subsubheader: {
                        fontSize: 10,
                        bold: true,
                        margin: [0, 5, 0, 5] // [left, top, right, bottom]
                    },
                    body: {
                        fontSize: 10,
                        bold: false,
                        margin: [0, 5, 0, 5] // [left, top, right, bottom]
                    },
                    table: {
                        fontSize: 9,
                        margin: [0, 10, 0, 10] // [left, top, right, bottom]
                    },
                    tableHeader: {
                        bold: true,
                        fontSize: 9,
                        color: 'black',
                        fillColor: '#eeeeee',
                        margin: [2, 4, 2, 4] // [left, top, right, bottom]
                    },
                    tableBody: {
                        fontSize: 9,
                        margin: [2, 0, 2, 0] // [left, top, right, bottom]
                    },
                },
            }

            // filter content to be rendered
            // docDefinition.content = docDefinition.content.filter(o => o.render)

            pdfMake.createPdf(docDefinition).download('ne_calcul_stationnement.pdf');

        },
        printPDF() {

            let docDefinition = {
                pageSize: 'A4',
                pageOrientation: 'portrait',
                // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
                pageMargins: this.mmToPoints([30, 20, 20, 20]),
                header: '',
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
                        margin: this.mmToPoints([30, 0, 20, 0])
                    }

                },
                info: {
                    title: 'Calcul du nombre de places de stationnement',
                    author: 'Etat de Neuchâtel',
                    subject: '',
                    keywords: 'stationnement, neuchâtel',
                },
                content: [
                    {
                        svg: logo,
                        width: 130,
                        // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
                        margin: [0, 0, 0, 15],
                        render: true
                    },
                    {
                        columns: [
                            {
                                text: `DÉPARTEMENT DU DÉVELOPPEMENT TERRITORIAL ET DE L'ENVIRONNEMENT`,
                                width: 150,
                                fontSize: 8,
                                bold: true,
                                // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
                                margin: [0, 0, 0, 2],
                            }],
                        render: true
                    },
                    {
                        columns: [
                            {
                                text: `SERVICE DE L'AMÉNAGEMENT DU TERRITOIRE`,
                                width: 150,
                                fontSize: 7,
                                bold: false,
                                // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
                                margin: [0, 0, 0, 0],
                            }],
                        render: true
                    },
                    {
                        text: 'Annexe à joindre à la demande de permis',
                        style: 'body',
                        margin: [0, 20, 0, 20],
                        render: true
                    },
                    {
                        text: 'Calcul du nombre de places de stationnement voiture', // 'CALCUL DU NOMBRE DE PLACES DE STATIONNEMENT VOITURE',
                        style: 'header',
                        render: true
                    },
                    // A4 measures 210 × 297 millimeters or 8.27 × 11.69 inches. In PostScript, its dimensions are rounded off to 595 × 842 points.
                    {
                        canvas: [{ type: 'line', x1: 0, y1: 5, x2: 595 - 141.732, y2: 5, lineWidth: 0.4 }],
                        // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
                        margin: [0, 5, 0, 5],
                        render: true
                    },
                    {
                        text: `Conformément aux articles 26 à 37d du RELConstr., le calcul du nombre de places de stationnement voiture à réaliser pour le projet sis est détaillé ci-dessous.`,
                        style: 'body',
                        render: true
                    },
                    {
                        text: `Calcul effectué le: ${new Date().toLocaleString('fr-CH')}`,
                        style: 'body',
                        render: true
                    },
                    {
                        text: `Dossier SATAC n°: ${this.project.satac}`,
                        style: 'body',
                        render: true
                    },
                    {
                        text: `Commune: ${this.project.commune.comnom}`,
                        style: 'body',
                        render: true
                    },
                    {
                        text: `Biens-fonds:`,
                        style: 'body',
                        render: true
                    },
                    {
                        ul: this.project.parcels,
                        style: 'body',
                        render: true
                    },
                    {
                        text: `Type de localisation: ${this.project.locationType.name}`,
                        style: 'body',
                        render: true
                    },
                    {
                        text: 'Justification du type de localisation:',
                        style: 'body',
                        render: this.project.locationTypeJustification.trim() !== ''
                    },
                    {
                        text: `${this.project.locationTypeJustification}`,
                        style: 'body',
                        render: this.project.locationTypeJustification.trim() !== ''
                    },
                    {
                        pageBreak: 'before',
                        text: 'Calcul du besoin brut (article 27 RELConstr.)',
                        style: 'subheader',
                        render: true
                    },
                    {
                        text: 'Besoin brut pour logement:',
                        style: 'subsubheader',
                        render: this.project.affectations.filter(e => e.valid && e.type === 'Logement').length > 0
                    },
                    {
                        style: 'table',
                        table: {
                            headerRows: 1,
                            dontBreakRows: true,
                            widths: ['*', 'auto', 'auto', 'auto', 100],
                            body: [
                                [
                                    { text: 'Affectation', style: 'tableHeader', alignment: 'left' },
                                    { text: 'Logements', style: 'tableHeader', alignment: 'right', noWrap: true },
                                    { text: 'SBP m²', style: 'tableHeader', alignment: 'right', noWrap: true },
                                    { text: 'Catégorie', style: 'tableHeader', alignment: 'left' },
                                    { text: 'Besoin brut', style: 'tableHeader', alignment: 'right', noWrap: true },
                                ],
                                ...this.project.affectations
                                    .filter(obj => obj.type === 'Logement' && obj.valid === true)
                                    .map(obj => [
                                        [
                                            { rowSpan: 3, text: obj.name, style: 'tableBody', alignment: 'left' },
                                            { rowSpan: 3, text: obj.numberOfHouses, style: 'tableBody', alignment: 'right', noWrap: true },
                                            { rowSpan: 3, text: obj.area.toFixed(1), alignment: 'right', noWrap: true },
                                            { text: 'Habitant', style: 'tableBody', alignment: 'left', noWrap: true },
                                            { text: obj.needs.resident.raw.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                                        ],
                                        [
                                            {},
                                            {},
                                            {},
                                            { text: 'Visiteur', style: 'tableBody', alignment: 'left', noWrap: true },
                                            { text: obj.needs.visitor.raw.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                                        ],
                                        [
                                            {},
                                            {},
                                            {},
                                            { text: 'Sous-total', style: 'tableBody', bold: true, alignment: 'left', noWrap: true },
                                            { text: (obj.needs.resident.raw + obj.needs.visitor.raw).toFixed(1), style: 'tableBody', bold: true, alignment: 'right' },
                                        ],
                                    ])
                                    .flat(1)
                            ]
                        },
                        layout: 'lightHorizontalLines',
                        render: this.project.affectations.filter(e => e.valid && e.type === 'Logement').length > 0
                    },
                    {
                        text: 'Besoin brut pour activité:',
                        style: 'subsubheader',
                        render: this.project.affectations.filter(e => e.valid && e.type === 'Activité').length > 0
                    },
                    {
                        style: 'table',
                        table: {
                            headerRows: 1,
                            dontBreakRows: true,
                            widths: ['*', 'auto', 'auto', 100],
                            body: [
                                [
                                    { text: 'Affectation', style: 'tableHeader', alignment: 'left' },
                                    { text: 'SV m²', style: 'tableHeader', alignment: 'right', noWrap: true },
                                    { text: 'Catégorie', style: 'tableHeader', alignment: 'left' },
                                    { text: 'Besoin brut', style: 'tableHeader', alignment: 'right', noWrap: true },
                                ],
                                ...this.project.affectations
                                    .filter(obj => obj.type === 'Activité' && obj.valid === true)
                                    .map(obj => [
                                        [
                                            { rowSpan: 3, text: obj.name, style: 'tableBody', alignment: 'left' },
                                            { rowSpan: 3, text: obj.area.toFixed(1), alignment: 'right' },
                                            { text: 'Employé', style: 'tableBody', alignment: 'left', noWrap: true },
                                            { text: obj.needs.resident.raw.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                                        ],
                                        [
                                            {},
                                            {},
                                            { text: 'Client', style: 'tableBody', alignment: 'left', noWrap: true },
                                            { text: obj.needs.visitor.raw.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                                        ],
                                        [
                                            {},
                                            {},
                                            { text: 'Sous-total', style: 'tableBody', bold: true, alignment: 'left', noWrap: true },
                                            { text: (obj.needs.resident.raw + obj.needs.visitor.raw).toFixed(1), style: 'tableBody', bold: true, alignment: 'right' },
                                        ],
                                    ])
                                    .flat(1)
                            ]
                        },
                        layout: 'lightHorizontalLines',
                        render: this.project.affectations.filter(e => e.valid && e.type === 'Activité').length > 0
                    },
                    {
                        text: 'Calcul du besoin net (article 28 RELConstr.)',
                        style: 'subheader',
                        pageBreak: 'before',
                        render: true
                    },
                    /*
                    {
                        text: `Fourchette du nombre de places:`,
                        style: 'subsubheader',
                        render: true
                    },
                    {
                        style: 'table',
                        table: {
                            headerRows: 1,
                            body: [
                                [
                                    { text: 'Catégorie', style: 'tableHeader', alignment: 'left' },
                                    { text: 'Min. %', style: 'tableHeader', alignment: 'right', noWrap: true },
                                    { text: 'Max. %', style: 'tableHeader', alignment: 'right', noWrap: true }
                                ],
                                [
                                    { text: 'Logement', alignment: 'left' },
                                    { text: `${(this.project.locationType.ranges.housing.min * 100).toFixed(0)} %`, style: 'tableBody', alignment: 'right', noWrap: true },
                                    { text: `${(this.project.locationType.ranges.housing.max * 100).toFixed(0)} %`, style: 'tableBody', alignment: 'right', noWrap: true }
                                ],
                                [
                                    { text: 'Activité', alignment: 'left' },
                                    { text: `${(this.project.locationType.ranges.activity.min * 100).toFixed(0)} %`, style: 'tableBody', alignment: 'right', noWrap: true },
                                    { text: `${(this.project.locationType.ranges.activity.max * 100).toFixed(0)} %`, style: 'tableBody', alignment: 'right', noWrap: true }
                                ]
                            ]
                        },
                        layout: 'lightHorizontalLines',
                        render: true
                    },
                    */
                    {
                        text: `Besoin net pour logement:`,
                        style: 'subsubheader',
                        render: true
                    },
                    {
                        style: 'table',
                        table: {
                            headerRows: 1,
                            dontBreakRows: true,
                            widths: ['*', 'auto', 'auto', 'auto'],
                            body: [
                                [
                                    { text: 'Affectation', style: 'tableHeader', alignment: 'left' },
                                    { text: 'Catégorie', style: 'tableHeader', alignment: 'left' },
                                    { text: `Min. ${(this.project.locationType.ranges.housing.min * 100).toFixed(0)} %`, style: 'tableHeader', alignment: 'right', noWrap: true },
                                    { text: `Max. ${(this.project.locationType.ranges.housing.max * 100).toFixed(0)} %`, style: 'tableHeader', alignment: 'right', noWrap: true },
                                ],
                                ...this.project.affectations
                                    .filter(e => e.valid && e.type === 'Logement')
                                    .map(obj =>
                                        [
                                            [
                                                { rowSpan: 3, text: obj.name, style: 'tableBody', alignment: 'left' },
                                                { text: obj.labels.primary, style: 'tableBody', alignment: 'left' },
                                                { text: obj.needs.resident.net.min.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                                                { text: obj.needs.resident.net.max.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                                            ],
                                            [
                                                {},
                                                { text: obj.labels.secondary, style: 'tableBody', alignment: 'left' },
                                                { text: obj.needs.visitor.net.min.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                                                { text: obj.needs.visitor.net.max.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                                            ],
                                            [
                                                {},
                                                { text: 'Sous-total', style: 'tableBody', bold: true, alignment: 'left', noWrap: true },
                                                { text: (obj.needs.resident.net.min + obj.needs.visitor.net.min).toFixed(1), style: 'tableBody', bold: true, alignment: 'right', noWrap: true },
                                                { text: (obj.needs.resident.net.max + obj.needs.visitor.net.max).toFixed(1), style: 'tableBody', bold: true, alignment: 'right', noWrap: true },
                                            ]
                                        ])
                                    .flat(1)
                            ]
                        },
                        layout: 'lightHorizontalLines',
                        render: true
                    },
                    {
                        text: `Besoin net pour activité:`,
                        style: 'subsubheader',
                        render: true
                    },
                    {
                        style: 'table',
                        table: {
                            headerRows: 1,
                            dontBreakRows: true,
                            widths: ['*', 'auto', 'auto', 'auto'],
                            body: [
                                [
                                    { text: 'Affectation', style: 'tableHeader', alignment: 'left' },
                                    { text: 'Catégorie', style: 'tableHeader', alignment: 'left' },
                                    { text: `Min. ${(this.project.locationType.ranges.activity.min * 100).toFixed(0)} %`, style: 'tableHeader', alignment: 'right', noWrap: true },
                                    { text: `Max. ${(this.project.locationType.ranges.activity.max * 100).toFixed(0)} %`, style: 'tableHeader', alignment: 'right', noWrap: true },
                                ],
                                ...this.project.affectations
                                    .filter(e => e.valid && e.type === 'Activité')
                                    .map(obj =>
                                        [
                                            [
                                                { rowSpan: 3, text: obj.name, style: 'tableBody', alignment: 'left' },
                                                { text: obj.labels.primary, style: 'tableBody', alignment: 'left' },
                                                { text: obj.needs.resident.net.min.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                                                { text: obj.needs.resident.net.max.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                                            ],
                                            [
                                                {},
                                                { text: obj.labels.secondary, style: 'tableBody', alignment: 'left' },
                                                { text: obj.needs.visitor.net.min.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                                                { text: obj.needs.visitor.net.max.toFixed(1), style: 'tableBody', alignment: 'right', noWrap: true },
                                            ],
                                            [
                                                {},
                                                { text: 'Sous-total', style: 'tableBody', bold: true, alignment: 'left', noWrap: true },
                                                { text: (obj.needs.resident.net.min + obj.needs.visitor.net.min).toFixed(1), style: 'tableBody', bold: true, alignment: 'right', noWrap: true },
                                                { text: (obj.needs.resident.net.max + obj.needs.visitor.net.max).toFixed(1), style: 'tableBody', bold: true, alignment: 'right', noWrap: true },
                                            ]
                                        ])
                                    .flat(1)
                            ]
                        },
                        layout: 'lightHorizontalLines',
                        render: true
                    },
                    {
                        text: 'Calcul du besoin net réduit (article 29 RELConstr.)',
                        style: 'subheader',
                        pageBreak: 'before',
                        render: true
                    },
                    {
                        text: 'Facteurs de réduction:',
                        style: 'subsubheader',
                        render: true
                    },
                    {
                        style: 'table',
                        table: {
                            headerRows: 1,
                            dontBreakRows: true,
                            widths: ['*', 'auto', 'auto'],
                            body: [
                                [
                                    { text: 'Affectation', style: 'tableHeader', alignment: 'left' },
                                    { text: 'Facteur de réduction', style: 'tableHeader', alignment: 'left' },
                                    { text: 'Valeur %', style: 'tableHeader', alignment: 'right', noWrap: true }
                                ],
                                ...this.project.affectations
                                    .filter(o => o.valid && o.reductions.length > 0)
                                    .map(o => [
                                        [
                                            { rowSpan: o.reductions.length + 1, text: o.name, style: 'tableBody', alignment: 'left' },
                                            { text: o.reductions[0].name, style: 'tableBody', alignment: 'left' },
                                            { text: `${o.reductions[0].factor.toFixed(1)} %`, style: 'tableBody', alignment: 'right', noWrap: true },
                                        ],
                                        ...o.reductions.slice(1).map(
                                            e => [
                                                {},
                                                { text: e.name, style: 'tableBody', alignment: 'left' },
                                                { text: `${e.factor.toFixed(1)} %`, style: 'tableBody', alignment: 'right', noWrap: true },
                                            ]
                                        ),
                                        [
                                            {},
                                            { text: 'Sous-total', style: 'tableBody', bold: true, alignment: 'left', noWrap: true },
                                            { text: `${(o.totalReduction * 100).toFixed(1)} %`, style: 'tableBody', bold: true, alignment: 'right', noWrap: true },
                                        ],
                                    ]
                                    )
                                    .flat(1)
                            ]
                        },
                        layout: 'lightHorizontalLines',
                        render: true
                    },
                    {
                        text: 'Besoin net réduit:',
                        style: 'subsubheader',
                        render: true
                    },
                    {
                        style: 'table',
                        table: {
                            headerRows: 1,
                            dontBreakRows: true,
                            widths: ['*', 'auto', 'auto', 'auto'],
                            body: [
                                [
                                    { text: 'Affectation', style: 'tableHeader', alignment: 'left' },
                                    { text: 'Catégorie', style: 'tableHeader', alignment: 'left' },
                                    { text: 'Min.', style: 'tableHeader', alignment: 'right' },
                                    { text: 'Max.', style: 'tableHeader', alignment: 'right' },
                                ],
                                ...this.project.affectations
                                    .filter(obj => obj.active === true) // .filter(obj => obj.type === 'Activité' && obj.active === true)
                                    .map(obj =>
                                        [
                                            [
                                                { rowSpan: 3, text: obj.name, style: 'tableBody', alignment: 'left' },
                                                { text: obj.labels.primary, style: 'tableBody', alignment: 'left' },
                                                { text: obj.needs.resident.reduced.min.toFixed(1), style: 'tableBody', alignment: 'right' },
                                                { text: obj.needs.resident.reduced.max.toFixed(1), style: 'tableBody', alignment: 'right' },
                                            ],
                                            [
                                                {},
                                                { text: obj.labels.secondary, style: 'tableBody', alignment: 'left' },
                                                { text: obj.needs.visitor.reduced.min.toFixed(1), style: 'tableBody', alignment: 'right' },
                                                { text: obj.needs.visitor.reduced.max.toFixed(1), style: 'tableBody', alignment: 'right' },
                                            ],
                                            [
                                                {},
                                                { text: 'Sous-total', style: 'tableBody', bold: true, alignment: 'left', noWrap: true },
                                                { text: (obj.needs.resident.reduced.min + obj.needs.visitor.reduced.min).toFixed(1), style: 'tableBody', bold: true, alignment: 'right' },
                                                { text: (obj.needs.resident.reduced.max + obj.needs.visitor.reduced.max).toFixed(1), style: 'tableBody', bold: true, alignment: 'right' },
                                            ]
                                        ])
                                    .flat(1)
                            ]
                        },
                        layout: 'lightHorizontalLines',
                        render: true
                    },
                    {
                        text: 'Nombre de places de stationnement à réaliser (article 30 RELConstr.)',
                        style: 'subheader',
                        pageBreak: 'before',
                        render: true
                    },
                    {
                        style: 'table',
                        table: {
                            headerRows: 1,
                            dontBreakRows: true,
                            body: [
                                [
                                    { text: 'Affectation', style: 'tableHeader', alignment: 'left' },
                                    { text: 'Min.', style: 'tableHeader', alignment: 'right' },
                                    { text: 'Max.', style: 'tableHeader', alignment: 'right' }
                                ],
                                ...this.project.affectations
                                    .filter(obj => obj.active === true)
                                    .map(obj => [
                                        { text: obj.name, alignment: 'left' },
                                        { text: obj.totalNeed.min.toFixed(1), alignment: 'right' },
                                        { text: obj.totalNeed.max.toFixed(1), alignment: 'right' }
                                    ]),
                                [
                                    { text: 'Total (arrondi supérieur)', alignment: 'left', bold: true, noWrap: true },
                                    { text: Math.ceil(this.project.totalNeed.min), alignment: 'right', bold: true, noWrap: true },
                                    { text: Math.ceil(this.project.totalNeed.max), alignment: 'right', bold: true, noWrap: true }
                                ]
                            ]
                        },
                        layout: 'lightHorizontalLines',
                        render: true
                    },
                ],
                styles: {
                    // margins [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
                    header: {
                        fontSize: 13,
                        bold: true,
                        margin: [0, 0, 0, 5]
                    },
                    subheader: {
                        fontSize: 12,
                        bold: true,
                        margin: [0, 10, 0, 5]
                    },
                    subsubheader: {
                        fontSize: 10,
                        bold: true,
                        margin: [0, 5, 0, 5],
                    },
                    body: {
                        fontSize: 10,
                        bold: false,
                        margin: [0, 5, 0, 5],
                    },
                    table: {
                        fontSize: 10,
                        margin: [0, 10, 0, 10],
                    },
                    tableHeader: {
                        bold: true,
                        fontSize: 10,
                        color: 'black',
                        fillColor: '#eeeeee',
                        margin: [2, 5, 2, 5]
                    },
                    tableBody: {
                        fontSize: 10,
                        margin: [2, 0, 2, 0],
                    },
                },
            }

            // filter content to be rendered
            // console.log('PRINT PDF')
            // console.log(docDefinition.content.filter(o => o.render))
            docDefinition.content = docDefinition.content.filter(o => o.render)

            pdfMake.createPdf(docDefinition).download('ne_calcul_stationnement.pdf');

        },

        printDiv() {

            const s = new XMLSerializer()
            const doc = document.implementation.createHTMLDocument("Calcul de stationnement")

            const meta = document.createElement('meta')
            meta.setAttribute("charset", "UTF-8")
            doc.head.appendChild(meta)

            // Title
            var p = doc.createElement("h2")
            p.innerHTML = "Calcul de stationnement"
            doc.body.appendChild(p)

            // Summary table
            var p = doc.createElement("h2")
            p.innerHTML = "Résumé"
            doc.body.appendChild(doc.createElement("p"))

            var table = document.getElementById("summary-table").cloneNode(true)
            table.style.backgroundColor = 'salmon'
            table.style.borderCollapse = 'collapse'
            // header.classList.add(className)  


            doc.body.appendChild(table)


            console.log(doc)
            console.log(doc.head)
            console.log(doc.body.innerHTML)

            // serialize
            var str = s.serializeToString(doc)
            console.log(str)

            /*
            var win2 = window.open('', '', 'height=800, width=800')
            win2.document.write = str
            win2.document.close()
            */

            // win.document.body.innerHTML = doc.body;


            const winUrl = URL.createObjectURL(
                new Blob([str], { type: "text/html" })
            )

            const win = window.open(
                winUrl,
                "win",
                `width=800,height=400,screenX=200,screenY=200`
            )


            /*
            var divContents = document.getElementById("summary-table")
            var a = window.open('', '', 'height=800, width=800')
            a.document.write('<html>')
            a.document.write('<body><h1>Div contents:</h1>')
            a.document.write(divContents.innerHTML)
            a.document.write('</body></html>')
            a.document.close()
            */
            // a.print()

        }
    }
}
</script>

<style scoped>
@import '../assets/table.css';
</style>