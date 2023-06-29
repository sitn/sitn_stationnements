<template>
    <!-- 2. RAW PARKING NEEDS -->
    <div class="q-pa-md">
        <div class="text-h5">Étape 2: Calcul du besoin brut</div>

        <q-banner inline-actions class="text-white bg-red q-my-md q-pa-md rounded-borders" v-if="!this.project.locationType">
            <template v-slot:avatar>
                <q-icon name="error" color="white" />
            </template>
            <span class="text-body1">Veuillez choisir les parcelles et indiquer le type de localisation à l'étape 1</span>
        </q-banner>

        <div class="bg-grey-2 q-pa-md q-my-sm rounded-borders">
            <q-select outlined bottom-slots bg-color="white" v-model="model" :options="this.project.affectations"
                option-value="name" option-label="name" @update:model-value="selectOption()" multiple
                label="Affectation(s)" :disable="!this.project.locationType">

                <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                        <q-item-section side>
                            <q-checkbox v-model="scope.opt.active" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>{{ scope.opt.name }}</q-item-label>
                            <q-item-label caption>Selected: {{ scope.selected }}</q-item-label>
                            <q-item-label caption>Active: {{ scope.opt.active }}</q-item-label>
                        </q-item-section>
                    </q-item>
                </template>

                <template v-slot:hint>
                    Choisir une ou plusieurs affectations dans la liste
                </template>
            </q-select>
        </div>

        <div class="bg-grey-2 q-pa-md q-my-sm rounded-borders"
            v-for="(item, key) in this.project.affectations.filter(e => e.active)">

            <label class="text-h7 ">{{ item.name }} </label>
            <div class="row q-col-gutter-sm">

                <div class="col">
                    <q-input class="col" bg-color="white" outlined label="" type="number" name="item.area"
                        v-model.number="item.area" min="0.0" max="Inf">

                        <template v-slot:label>
                            {{ item.type == "Logement" ? "Surface brute de plancher (SBP)" : "Surface de vente (SV)" }}
                        </template>

                        <template v-slot:append>
                            <div class="text-body2">m<sup>2</sup></div>
                        </template>

                    </q-input>
                </div>

                <div class="col">
                    <q-input v-if="item.isHousing" class="col" bg-color="white" outlined label="Nombre de logements"
                        type="number" name="item.numberOfHouses" v-model.number="item.numberOfHouses" min="0.0" max="Inf">
                    </q-input>
                </div>

                <div class="col">
                    <q-input bg-color="light-blue-1" outlined label="" type="number" name="item.rawResidentNeed"
                        v-model.number="item.rawResidentNeed" readonly>
                        <template v-slot:label>
                            {{ item.type == "Logement" ? "Besoin brut habitant" : "Besoin brut employé" }}
                        </template>
                    </q-input>
                </div>

                <div class="col">
                    <q-input class="col" bg-color="light-blue-1" outlined label="" type="number" name="item.rawVisitorNeed"
                        v-model.number="item.rawVisitorNeed" readonly>
                        <template v-slot:label>
                            {{ item.type == "Logement" ? "Besoin brut visiteur" : "Besoin brut client" }}
                        </template>
                    </q-input>
                </div>

                <div class="col">
                    <q-input class="col" bg-color="light-blue-1" outlined label="Besoin brut total" type="number"
                        name="item.rawVisitorNeed" v-model.number="item.rawTotalNeed" readonly>
                    </q-input>
                </div>
                <div class="col">
                    <q-btn round flat color="grey" name="delete" @click="deleteItem(item)" icon="delete"></q-btn>
                </div>

            </div>
        </div>

    </div>
</template>

<script>
// import { ref } from 'vue'

export default {
    name: 'FormB',
    components: {},
    props: { 'project': Object },
    emits: ['updateProject', 'deleteItem'],
    setup() {
        return {
            // model: ref(null),
        }
    },
    data() {
        return {
            model: null,
        }
    },
    computed: {
    },
    methods: {
        selectOption() {

            console.log('Select option')
            console.log(this.model)

            this.project.affectations.forEach(function (e) {
                e.active = false
                // e.area = 0.0
                // e.numberOfHouses = 0.0
            });

            this.model.forEach(function (e) {
                e.active = true
            });

            this.updateProject()

        },
        deleteItem(item) {

            console.log(`Delete item with id=${item.name}`)
            this.model = this.model.filter(e => e !== item)

            let index = this.project.affectations.findIndex((obj) => obj.name === item.name)
            this.project.affectations[index].active = false
            this.project.affectations[index].area = 0.0
            this.project.affectations[index].numberOfHouses = 0.0

            //console.log(item)
            //console.log(`Delete item with id=${item.name}`)

            this.updateProject()

        },
        updateProject() {
            this.$emit('updateProject', this.project);
        }
    }
}
</script>

<style scoped>
@import '../assets/table.css';
</style>