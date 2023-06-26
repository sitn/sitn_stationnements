<template>
    <!-- 3. NET PARKING NEEDS -->
    <div class="q-pa-md">
        <div class="text-h5">Étape 4: Calcul du besoin net réduit</div>
        <q-card class="" flat bordered>
            <q-card-section horizontal>
                <q-card-section>
                    <p>Des facteurs de réduction peuvent être appliqués au besoin net,
                        par le réquérant ou par la commune (articles 31 à 34 du
                        RELConstr.). Les facteurs de réduction sont à porter en déduction
                        du besoin net. Le résultat obtenu se nomme le besoin net réduit.
                        Les facteurs de réduction peuvent intervenir lors de l'examen du
                        dossier par la commune ou les services compétents, notamment en ce
                        qui concerne la législation sur l'environnement et la sauvegarde
                        du patrimoine. Pour les logements avec encadrements ou étudiants,
                        il convient de prendre contact en amont avec la commune pour
                        déterminer si un facteur de réduction s'applique.</p>
                </q-card-section>

            </q-card-section>
        </q-card>

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
</style>