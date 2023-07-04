<template>
    <!-- 3. NET PARKING NEEDS -->
    <div class="q-pa-md">
        <div class="text-h5">5. Nombre de places de stationnement à réaliser (article 30 RELConstr.)</div>

        <div class="row">
            <div id="summary-container" class="q-pa-md q-ma-none col-xs-8 col-sm-8 col-md-8">
                <div class="bg-grey-2 q-pa-md q-my-sm rounded-borders">

                    <table id="summary-table">
                        <tr>
                            <th>Affectation</th>
                            <th v-if="this.project.hasRange">Min.</th>
                            <th v-if="this.project.hasRange">Max.</th>
                            <th v-if="!this.project.hasRange">Fixe</th>
                        </tr>

                        <tr v-for="(affectation, index) in this.project.affectations.filter(e => e.active)" :key="index">
                            <td>{{ affectation.name }}</td>
                            <td v-if="affectation.hasRange" class="bg-light-blue-1">{{ affectation.totalNeed.min.toFixed(2)
                            }}</td>
                            <td v-if="affectation.hasRange" class="bg-light-blue-1">{{ affectation.totalNeed.max.toFixed(2)
                            }}</td>
                            <td v-if="!affectation.hasRange" class="bg-light-blue-1">{{ affectation.totalNeed.max.toFixed(2)
                            }}</td>
                        </tr>

                        <tr>
                            <td class="text-weight-bold">Total (arrondi supérieur)</td>
                            <td v-if="this.project.hasRange" class="bg-light-blue-1 text-weight-bold">{{
                                Math.ceil(this.project.totalNeed.min) }}</td>
                            <td v-if="this.project.hasRange" class="bg-light-blue-1 text-weight-bold">{{
                                Math.ceil(this.project.totalNeed.max) }}</td>
                            <td v-if="!this.project.hasRange" class="bg-light-blue-1">{{
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
// import pdfMake from "pdfmake/build/pdfmake";
// import pdfFonts from "pdfmake/build/vfs_fonts";
// pdfMake.vfs = pdfFonts.pdfMake.vfs;

import * as pdfFonts from "pdfmake/build/vfs_fonts";
import pdfMake from 'pdfmake/build/pdfmake';
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

            let printDate = new Date().toLocaleString('fr-CH')

            let table = [[
                { text: 'Affectation', style: 'tableHeader' },
                { text: 'Min', style: 'tableHeader' },
                { text: 'Max', style: 'tableHeader' }
            ]]

            this.project.affectations.filter(e => e.active).forEach(affectation => {
                table.push([affectation.name, affectation.totalNeed.min.toFixed(2), affectation.totalNeed.max.toFixed(2)])
            })

            table.push(['Total (arrondi supérieur)', Math.ceil(this.project.totalNeed.min), Math.ceil(this.project.totalNeed.max)])


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
                        margin: [0, 0, 0, 10]
                    },
                    {
                        text: 'Annexe à joindre à la demande de permis',
                        style: 'body',
                        margin: [0, 20, 0, 20]
                    },
                    {
                        text: 'CALCUL DU NOMBRE DE PLACES DE STATIONNEMENT VOITURE',
                        style: 'header'
                    },
                    // A4 measures 210 × 297 millimeters or 8.27 × 11.69 inches. In PostScript, its dimensions are rounded off to 595 × 842 points.
                    {
                        canvas: [{ type: 'line', x1: 0, y1: 5, x2: 595 - 2 * 40, y2: 5, lineWidth: 0.5 }],
                        margin: [0, 10, 0, 10]
                    },
                    {
                        text: `Conformément aux articles 26 à 37d du RELConstr., le calcul du nombre de places de stationnement voiture à réaliser pour le projet sis est détaillé ci-dessous.`,
                        style: 'body'
                    },
                    {
                        text: `Calcul effectué le: ${printDate}`,
                        style: 'body'
                    },
                    {
                        text: `Dossier SATAC n°: ${this.project.satac}`,
                        style: 'body'
                    },
                    {
                        text: `Commune: ${this.project.commune.comnom}`,
                        style: 'body'
                    },
                    {
                        text: 'Biens-fonds:',
                        style: 'body'
                    },
                    {
                        ul: this.project.parcels,
                        style: 'body'
                    },

                    {
                        style: 'tableExample',
                        table: {
                            headerRows: 1,
                            body: table
                        },
                        layout: 'lightHorizontalLines'
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
                        fontSize: 16,
                        bold: true,
                        margin: [0, 10, 0, 5]
                    },
                    body: {
                        fontSize: 10,
                        bold: false,
                        margin: [0, 5, 0, 5]
                    },
                    tableExample: {
                        fontSize: 10,
                        margin: [0, 5, 0, 15]
                    },
                    tableHeader: {
                        bold: true,
                        fontSize: 10,
                        color: 'black',
                        fillColor: '#eeeeee',
                        padding: '10px',
                        margin: [5, 5, 5, 5]
                    }
                },
            }

            pdfMake.createPdf(docDefinition).download();

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