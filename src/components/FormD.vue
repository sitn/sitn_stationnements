<template>
    <!-- 3. NET PARKING NEEDS -->
    <div class="q-pa-md">
        <div class="text-h5">Étape 4: Calcul du besoin net réduit</div>

        <div class="q-pa-md q-my-md info">
            Des facteurs de réduction peuvent être appliqués au besoin net,
            par le réquérant ou par la commune (articles 31 à 34 du
            RELConstr.). Les facteurs de réduction sont à porter en déduction
            du besoin net. Le résultat obtenu se nomme le besoin net réduit.<br>

            Les facteurs de réduction peuvent intervenir lors de l'examen du
            dossier par la commune ou les services compétents, notamment en ce
            qui concerne la législation sur l'environnement et la sauvegarde
            du patrimoine.<br>
            Pour les logements avec encadrements ou étudiants,
            il convient de prendre contact en amont avec la commune pour
            déterminer si un facteur de réduction s'applique.
        </div>

        <div class="row">
            <div class="q-pa-sm q-ma-none col-xs-12 col-sm-12 col-md-12"
                v-for="(affectation, key) in this.project.affectations.filter(e => e.active && e.reductions.length > 0)">

                <!-- <div class="text-weight-bold">{{ affectation.name }}</div> -->
                <div class="bg-grey-2 q-pa-md q-my-none rounded-borders">

                    <table>

                        <tr>
                            <th>{{ affectation.name }}</th>
                            <th>Réduction (%)</th>
                        </tr>
                        <tr v-for="(reduction, index) in affectation.reductions" :key="index">
                            <td>{{ reduction.description }}</td>
                            <td>
                                <q-input bg-color="white" outlined type="number" name="reduction.factor"
                                    v-model.number="reduction.factor" min="0.0" max="100">

                                    <template v-slot:append>
                                        <div class="text-body2">%</div>
                                    </template>
                                </q-input>
                            </td>
                        </tr>
                        <tr>
                            <td class="text-weight-bold">Total</td>
                            <td class="bg-light-blue-1 text-weight-bold">{{ (affectation.totalReduction * 100).toFixed(1) }}
                                %</td>
                        </tr>

                    </table>

                </div>

            </div>

        </div>

    </div>
</template>

<script>
import { ref } from 'vue'

export default {
    name: 'FormD',
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

    }
}
</script>

<style>
@import "https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900|Material+Icons";
@import '../assets/quasar.prod.css';

.info {
    background-color: #ffbd0033;
    border-left: 0.5rem solid rgb(146, 84, 13);

}
</style>