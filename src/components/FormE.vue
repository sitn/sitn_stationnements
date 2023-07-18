<template>
    <!-- 5. SUMMARY -->
    <div class="q-pa-md">
        <!-- <div class="text-h5">5. Nombre de places de stationnement à réaliser (article 30 RELConstr.)</div> -->

        <q-banner inline-actions class="text-white bg-red q-my-md q-pa-md rounded-borders"
            v-if="!this.project.hasAffectation">
            <template v-slot:avatar>
                <q-icon name="error" color="white" />
            </template>
            <span class="text-body1">Veuillez compléter l'étape précédente</span>
        </q-banner>

        <div class="row" v-if="this.project.hasAffectation">
            <div id="summary-container" class="col-xs-12 col-sm-6 col-md-6">
                <!-- <div id="summary-container" class="q-pa-md q-ma-none col-xs-8 col-sm-8 col-md-8"> -->
                <div class="bg-white q-pa-md q-my-sm rounded-borders">

                    <table id="summary-table">
                        <tr>
                            <th>Affectation</th>
                            <th v-if="this.project.hasRange" class="text-right">Min.</th>
                            <th v-if="this.project.hasRange" class="text-right">Max.</th>
                            <th v-if="!this.project.hasRange" class="text-right">Fixe</th>
                        </tr>

                        <tr v-for="(affectation, index) in this.project.affectations.filter(e => e.active)" :key="index">
                            <td>{{ affectation.name }}</td>
                            <td v-if="affectation.hasRange" class="bg-light-blue-1 text-right">{{
                                affectation.totalNeed.min.toFixed(2)
                            }}</td>
                            <td v-if="affectation.hasRange" class="bg-light-blue-1 text-right">{{
                                affectation.totalNeed.max.toFixed(2)
                            }}</td>
                            <td v-if="!affectation.hasRange" class="bg-light-blue-1 text-right">{{
                                affectation.totalNeed.max.toFixed(2)
                            }}</td>
                        </tr>

                        <tr>
                            <td class="text-weight-bold">Total (arrondi supérieur)</td>
                            <td v-if="this.project.hasRange" class="bg-light-blue-1 text-weight-bold text-right">{{
                                Math.ceil(this.project.totalNeed.min) }}</td>
                            <td v-if="this.project.hasRange" class="bg-light-blue-1 text-weight-bold text-right">{{
                                Math.ceil(this.project.totalNeed.max) }}</td>
                            <td v-if="!this.project.hasRange" class="bg-light-blue-1 text-right">{{
                                Math.ceil(this.project.totalNeed.max) }}</td>
                        </tr>

                    </table>

                </div>
                <!-- 
                <q-btn id="print-btn" color="white" text-color="black" icon="print" label="Imprimer la déclaration"
                    @click="print" class="no-print" />
                <q-btn id="print-btn" color="white" text-color="black" icon="print" label="Imprimer DOM" @click="printDiv"
                    class="no-print" />
                    -->
                <q-btn id="print-btn" color="white" text-color="black" icon="print" label="Imprimer PDF" @click="printPDF"
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


// import * as pdfFonts from "pdfmake/build/vfs_fonts";
import pdfFonts from 'pdfmake/build/fonts.js';
import pdfMake from 'pdfmake/build/pdfmake';

//pdfMake.vfs = pdfFonts;

pdfMake.vfs = pdfFonts.pdfMake.vfs;

import { logo } from './logo.js';

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

    },
    methods: {
        print() {
            window.print()
        },
        printPDF() {

            let test = this.project.affectations
                .filter(e => e.valid === true) // .filter(obj => obj.type === 'Activité' && obj.active === true)
                .map(obj =>
                    [
                        [
                            { rowSpan: 2, text: obj.name, alignment: 'left' },
                            { text: 'Besoin net habitant', alignment: 'right' },
                            { text: obj.needs.resident.net.min.toFixed(1), alignment: 'right' },
                            { text: obj.needs.resident.net.max.toFixed(1), alignment: 'right' },
                        ],
                        [
                            {},
                            { text: 'Besoin net visiteur', alignment: 'right' },
                            { text: obj.needs.visitor.net.min.toFixed(1), alignment: 'right' },
                            { text: obj.needs.visitor.net.max.toFixed(1), alignment: 'right' },
                        ]
                    ])
                .flat(1)


            console.log('TEST1')
            console.log(this.project.reductions)

            let test2 = this.project.affectations
                .filter(e => e.valid)
                .map(e => e.reductions.map((obj) => ({ ...obj, label: e.name })))
                .flat(1)

            console.log('TEST2')
            console.log(test2)

            let test3 = this.project.affectations
                .filter(o => o.valid && o.reductions.length > 0)
                .map(o => [
                    [
                        { rowSpan: o.reductions.length, text: o.name, style: 'tableBody', alignment: 'left' },
                        { text: o.reductions[0].name, style: 'tableBody', alignment: 'right' },
                        { text: o.reductions[0].factor, style: 'tableBody', alignment: 'right' },
                    ],
                    ...o.reductions.slice(1).map(
                        e => [
                            {},
                            { text: e.name, style: 'tableBody', alignment: 'right' },
                            { text: e.factor, style: 'tableBody', alignment: 'right' },
                        ]
                    )
                ]
                )

            // o.reductions.slice(1);

            console.log('TEST3')
            console.log(test3)


            // let label = { Logement: { 'Habitant': }, Activité: { 'Employé'} }

            let docDefinition = {
                pageSize: 'A4',
                pageOrientation: 'portrait',
                // [left, top, right, bottom] or [horizontal, vertical] or just a number for equal margins
                pageMargins: [40, 50, 40, 60],
                header: '',
                footer: (currentPage, pageCount) => {
                    return { text: `${currentPage.toString()} / ${pageCount}`, alignment: 'center' }
                },
                content: [
                    {
                        svg: logo,
                        width: 150,
                        margin: [0, 0, 0, 10],
                        render: true
                    },
                    {
                        text: 'Annexe à joindre à la demande de permis',
                        style: 'body',
                        margin: [0, 20, 0, 20],
                        render: true
                    },
                    {
                        text: 'CALCUL DU NOMBRE DE PLACES DE STATIONNEMENT VOITURE',
                        style: 'header',
                        render: true
                    },
                    // A4 measures 210 × 297 millimeters or 8.27 × 11.69 inches. In PostScript, its dimensions are rounded off to 595 × 842 points.
                    {
                        canvas: [{ type: 'line', x1: 0, y1: 5, x2: 595 - 2 * 40, y2: 5, lineWidth: 0.5 }],
                        margin: [0, 10, 0, 10],
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
                        text: 'Besoin brut pour logement',
                        style: 'body',
                        bold: true,
                        render: this.project.affectations.filter(e => e.valid && e.type === 'Logement').length > 0
                    },
                    {
                        style: 'table',
                        table: {
                            headerRows: 1,
                            body: [
                                [
                                    { text: 'Affectation', style: 'tableHeader', alignment: 'left' },
                                    { text: 'SBP m²', style: 'tableHeader', alignment: 'right', noWrap: true },
                                    { text: 'Logements', style: 'tableHeader', alignment: 'right' },
                                    { text: 'Besoin brut habitant', style: 'tableHeader', alignment: 'right' },
                                    { text: 'Besoin brut visiteur', style: 'tableHeader', alignment: 'right' },
                                    { text: 'Besoin brut total', style: 'tableHeader', alignment: 'right' },
                                ],
                                ...this.project.affectations
                                    .filter(obj => obj.type === 'Logement' && obj.active === true)
                                    .map(obj => [
                                        { text: obj.name, style: 'tableBody', alignment: 'left' },
                                        { text: obj.area.toFixed(1), alignment: 'right' },
                                        { text: obj.numberOfHouses, style: 'tableBody', alignment: 'right' },
                                        { text: obj.needs.resident.raw.toFixed(1), style: 'tableBody', alignment: 'right' },
                                        { text: obj.needs.visitor.raw.toFixed(1), style: 'tableBody', alignment: 'right' },
                                        { text: (obj.needs.resident.raw + obj.needs.visitor.raw).toFixed(1), style: 'tableBody', alignment: 'right' },
                                    ])
                            ]
                        },
                        layout: 'lightHorizontalLines',
                        render: this.project.affectations.filter(e => e.valid && e.type === 'Logement').length > 0
                    },
                    {
                        text: 'Besoin brut pour activité',
                        style: 'body',
                        bold: true,
                        render: this.project.affectations.filter(e => e.valid && e.type === 'Activité').length > 0
                    },
                    {
                        style: 'table',
                        table: {
                            headerRows: 1,
                            body: [
                                [
                                    { text: 'Affectation', style: 'tableHeader', alignment: 'left' },
                                    { text: 'SV m²', style: 'tableHeader', alignment: 'right', noWrap: true },
                                    { text: 'Besoin brut employé', style: 'tableHeader', alignment: 'right' },
                                    { text: 'Besoin brut client', style: 'tableHeader', alignment: 'right' },
                                    { text: 'Besoin brut total', style: 'tableHeader', alignment: 'right' },
                                ],
                                ...this.project.affectations
                                    .filter(e => e.valid && e.type === 'Activité')
                                    .map(obj => [
                                        { text: obj.name, style: 'tableBody', alignment: 'left' },
                                        { text: obj.area.toFixed(1), style: 'tableBody', alignment: 'right' },
                                        { text: obj.needs.resident.raw.toFixed(1), style: 'tableBody', alignment: 'right' },
                                        { text: obj.needs.visitor.raw.toFixed(1), style: 'tableBody', alignment: 'right' },
                                        { text: (obj.needs.resident.raw + obj.needs.visitor.raw).toFixed(1), style: 'tableBody', alignment: 'right' },
                                    ])
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
                    {
                        text: `Fourchette du nombre de places:`,
                        style: 'body',
                        bold: true,
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
                    {
                        text: `Besoin net:`,
                        style: 'body',
                        bold: true,
                        render: true
                    },
                    {
                        style: 'table',
                        table: {
                            headerRows: 1,
                            body: [
                                [
                                    { text: 'Affectation', style: 'tableHeader', alignment: 'left' },
                                    { text: 'Catégorie', style: 'tableHeader', alignment: 'left' },
                                    { text: 'Min.', style: 'tableHeader', alignment: 'right', noWrap: true },
                                    { text: 'Max.', style: 'tableHeader', alignment: 'right', noWrap: true },
                                ],
                                ...this.project.affectations
                                    .filter(e => e.valid) // .filter(obj => obj.type === 'Activité' && obj.active === true)
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
                                                { text: 'Sous-total', style: 'tableBody', bold: true, alignment: 'left' },
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
                        style: 'body',
                        bold: true,
                        render: true
                    },
                    {
                        style: 'table',
                        table: {
                            headerRows: 1,
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
                                            { rowSpan: o.reductions.length, text: o.name, style: 'tableBody', alignment: 'left' },
                                            { text: o.reductions[0].name, style: 'tableBody', alignment: 'left' },
                                            { text: `${o.reductions[0].factor} %`, style: 'tableBody', alignment: 'right', noWrap: true },
                                        ],
                                        ...o.reductions.slice(1).map(
                                            e => [
                                                {},
                                                { text: e.name, style: 'tableBody', alignment: 'left' },
                                                { text: `${e.factor} %`, style: 'tableBody', alignment: 'right', noWrap: true },
                                            ]
                                        )
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
                        style: 'body',
                        render: true
                    },
                    {
                        style: 'table',
                        table: {
                            headerRows: 1,
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
                                                { text: 'Sous-total', style: 'tableBody', bold: true, alignment: 'left' },
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
                                        { text: obj.totalNeed.min.toFixed(2), alignment: 'right' },
                                        { text: obj.totalNeed.max.toFixed(2), alignment: 'right' }
                                    ]),
                                [
                                    { text: 'Total (arrondi supérieur)', alignment: 'left', bold: true },
                                    { text: Math.ceil(this.project.totalNeed.min), alignment: 'right', bold: true },
                                    { text: Math.ceil(this.project.totalNeed.max), alignment: 'right', bold: true }
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
                        fontSize: 18,
                        bold: true,
                        margin: [0, 0, 0, 5]
                    },
                    subheader: {
                        fontSize: 12,
                        bold: true,
                        margin: [0, 10, 0, 5]
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
            console.log('PRINT PDF')
            console.log(docDefinition.content.filter(o => o.render))
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