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
                </div>

                <q-btn id="print-btn" color="white" text-color="black" icon="print" label="Imprimer PDF" @click="print" class="no-print" />
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

import pdfMake from 'pdfmake/build/pdfmake';
import { logo } from '../helpers/logo.js';

// load TTF fonts (instead of Virtual File System), see issue https://github.com/bpampuch/pdfmake/issues/1877
// pdfMake.vfs = pdfFonts.pdfMake.vfs;
pdfMake.fonts = {
    Roboto: {
        normal: `${window.location.href}/fonts/Roboto-Regular.ttf`,
        bold: `${window.location.href}/fonts/Roboto-Medium.ttf`,
        italics: `${window.location.href}/fonts/Roboto-Italic.ttf`,
        bolditalics: `${window.location.href}fonts/Roboto-MediumItalic.ttf`,
    }
}

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
        // console.log('FORM E - mounted')
        // console.log(this.project.affectations.filter(e => e.active).map(x => ({ name: x.name, value: x.reducedOutput })).flat(1))
    },
    methods: {
        mmToPoints(mm) {
            let arr = [mm]
            return arr.flat(1).map(x => 2.834645 * x)
        },
        print() {

            console.log(`window.location.origin: ${window.location.origin}`)
            console.log(`window.location.href: ${window.location.href}`)

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
                        text: `Date: ${new Date().toLocaleString('fr-CH')} / dossier SATAC: ${this.project.satac} / Commune: ${this.project.commune.comnom} / Biens-fonds: ${this.project.parcels.join(', ')} / Type de localisation ${this.project.locationType.name} ${this.project.eco === true ? '/ Projet de quartier durable' : ''}`,
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
            docDefinition.content = docDefinition.content.filter(o => o.render)
            pdfMake.createPdf(docDefinition).download('ne_calcul_stationnement.pdf');

        },
    }
}
</script>

<style scoped>
@import '../assets/styles/table.css';
</style>