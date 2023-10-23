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

                <q-btn id="print-btn" color="white" text-color="black" icon="print" label="Imprimer PDF" @click="print(project)" class="no-print" />
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
import { print } from '../helpers/print.js';
import { store } from '../store/store.js'

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
    props: {}, // { 'project': Object },
    emits: [],
    setup() {
        return {
        }
    },
    data() {
        return {
            store,
            project: store.project,
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
        print,
    }
}
</script>

<style scoped>
@import '../assets/styles/table.css';
</style>