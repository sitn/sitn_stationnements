<template>
    <!-- 2. RAW PARKING NEEDS -->
    <div class="q-pa-md">

        <q-banner inline-actions class="text-white bg-red q-my-md q-pa-md rounded-borders" v-if="!this.render">
            <template v-slot:avatar>
                <q-icon name="error" color="white" />
            </template>
            <span class="text-body1">Veuillez compléter l'étape précédente</span>
        </q-banner>

        <!-- INFOBOX  -->
        <q-card flat class="bg-grey-1 q-pa-md q-my-md infobox" v-if="this.render">

            <q-card-section horizontal>

                <!-- 
                <q-card-actions vertical class="justify-around q-pa-xs">
                    <q-icon name="info" color="orange-5" size="3em" />
                </q-card-actions>
                -->

                <q-card-section class="q-pa-xs">
                    <div class="text-body2 text-weight-bold q-mb-sm">Informations sur le calcul</div>

                    <div class="text-body2">
                        <ul>
                            <li>Le besoin brut en places de stationnement est calculé selon les ratios du tableau 1 de
                                l’annexe 1 du RELConstr.</li>

                            <li>Pour que le calcul soit fait au plus juste des besoins, il est important de préciser toutes
                                les affectations comprises dans le projet, en particulier pour les projets d’activité.
                                Ainsi, un projet pour une manufacture horlogère comprendra possiblement des surfaces
                                affectées à « industrie et artisanat », « entrepôts et dépôts » et « autres services ».</li>

                            <li>Pour les affectations moins fréquentes les ratios sont à
                                rechercher dans le tableau 1 de la norme VSS 40 281 (2019). Le nombre de places obtenu est à
                                indiquer manuellement.</li>

                            <li>La surface brute de plancher (SBP) correspond à la somme des surfaces utiles principales,
                                des surfaces de dégagement et des surfaces de construction au sens de l’article 16 RELCAT.
                            </li>

                        </ul>
                    </div>
                </q-card-section>

            </q-card-section>

        </q-card>

        <div class="bg-grey-2 q-pa-md q-my-sm rounded-borders" v-if="this.render">

            <q-select outlined bottom-slots bg-color="white" v-model="model" :options="this.project.affectations" option-value="name" option-label="name" @add="addOption()" @remove="removeOption()" @update:model-value="selectOption()" multiple label="Affectation(s)">

                <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                        <q-item-section side>
                            <q-checkbox :model-value="scope.selected" @update:model-value="scope.toggleOption(scope.opt)" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>{{ scope.opt.name }}</q-item-label>
                            <q-item-label caption>{{ scope.opt.description }}</q-item-label>
                            <!-- <q-item-label caption>Selected: {{ scope.selected }}</q-item-label> -->
                            <!-- <q-item-label caption>Active: {{ scope.opt.active }}</q-item-label> -->
                        </q-item-section>
                        <q-item-section side>

                            <q-chip square :color="scope.opt.automatic ? 'blue' : 'orange'" text-color="white" :icon="scope.opt.automatic ? 'calculate' : 'article'">
                                {{ scope.opt.automatic ? 'AUTO' : 'VSS' }}
                            </q-chip>

                        </q-item-section>
                        <q-tooltip>
                            {{ scope.opt.automatic ? 'Le calcul du besoin brute est automatique pour cette affectation' : 'Le calcul du besoin brute doit être fait manuellement selon les formules du tableau 1 de la norme VSS 40 281 (2019) pour cette affectation' }}
                        </q-tooltip>
                    </q-item>
                </template>

                <template v-slot:hint>
                    Choisir une ou plusieurs affectations dans la liste
                </template>
            </q-select>

        </div>

        <q-form ref="form" greedy>

            <div v-if="this.render" class="bg-grey-2 q-pa-md q-my-sm rounded-borders" v-for="(item, key) in this.project.affectations.filter(e => e.active)">

                <label class="text-h7">

                    <q-chip dense square :color="item.automatic ? 'blue' : 'orange'" text-color="white" :icon="item.automatic ? 'calculate' : 'article'">
                        {{ item.automatic ? 'AUTO' : 'VSS' }}
                        <q-tooltip>
                            {{ item.automatic ? 'Le calcul du besoin brute est automatique pour cette affectation' : 'Le calcul du besoin brute doit être fait manuellement selon les formules du tableau 1 de la norme VSS 40 281 (2019) pour cette affectation' }}
                        </q-tooltip>
                    </q-chip>
                    {{ item.name }}
                </label>

                <div class="row q-col-gutter-sm q-py-xs">

                    <!-- input fields -->
                    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-3" v-for="(item2, key2) in item.variables.filter((x) => x.type === 'measurement')">
                        <q-input bg-color="white" outlined label="" type="number" name="" v-model.number="item2.value" :min=item2.min :max=item2.max @update:model-value="check(item2)" :rules="[val => validatePositive(val)]">
                            <!-- :hint="`${item2.min} ≥ x ≤ ${item2.max}`" -->
                            <!-- :rules="[validatePositive]" -->
                            <template v-slot:label>
                                {{ item2.name }}
                            </template>

                            <template v-slot:append>
                                <div class="text-body2" v-html="item2.unit"></div>
                            </template>

                            <template v-slot:hint>

                            </template>

                        </q-input>
                    </div>

                    <!-- output fields -->
                    <div class="col-xs-12 col-sm-12 col-md-12 col-lg-2 self-end" v-for="(item3, key3) in item.factors">
                        <q-input bg-color="light-blue-1" outlined label="" type="number" name="" :model-value="(item.output[key3]).toFixed(2)" readonly hint="">
                            <template v-slot:label>
                                {{ item3.name }} <!-- (key: {{ key3 }}) -->
                                <!-- 
                                In: {{ item.variables.map(x => x.value) }} |
                                Out: {{ item3.formula(item.variables.map(x => x.value), 1.0) }}
                                -->
                            </template>
                        </q-input>

                    </div>

                    <div>
                        <q-btn round flat color="grey" name="delete" @click="deleteItem(item)" icon="delete"></q-btn>
                    </div>

                </div>

            </div>

        </q-form>

    </div>
</template>

<script>
import { store } from '../store/store.js'

export default {
    name: 'FormB',
    components: {},
    props: {}, // { 'project': Object },
    emits: ['updateProject', 'deleteItem', 'filled'],
    setup() {
        return {}
    },
    data() {
        return {
            store,
            project: store.project,
            model: null,
        }
    },
    computed: {
        render() {
            return (this.project.commune !== null) & (this.project.locationType !== null)
        },
        filled() {

            // console.log('FormB.vue: filled()')
            // console.log(`Has affectations: ${this.project.hasAffectation}`)
            // console.log(`LocationType: ${this.project.locationType !== null}`)

            return this.project.hasAffectation & (this.project.locationType !== null)
            // this.$emit('filled', this.filled);

        }
    },
    watch: {
        filled(val) {
            // console.log(`FormB.vue: filled = ${val}`)
            this.$emit('filled', val)
        }
    },
    methods: {
        validatePositive(val) {
            return val !== null && val !== '' && val > 0.0 || "Veuillez entrer une valeur positive"
        },
        validateRange(val, min, max) {
            let isValid = val !== null && val >= min && val <= max
            if (isValid === false) {
                val = null
            }
            if (max === Infinity) {
                let msg = `Veuillez entrer une valeur ≥ à ${min}`
            } else {
                let msg = `Veuillez entrer une valeur entre ${min} et ${max}`
            }
            return isValid || msg
        },
        check(item) {
            // console.log(item)
            let isValid = item.value >= item.min && item.value <= item.max
            if (!isValid) {
                item.value = null
            } else {
                item.value = item.value
            }
        },
        addOption() {
            // console.log('Add option')
        },
        removeOption() {
            // console.log('Remove option')
        },
        selectOption() {

            let activeOptions = this.model.map(obj => obj.name)

            // all affectations not in the model should be set to non-active
            this.project.affectations.forEach(function (e) {

                if (!activeOptions.includes(e.name)) {
                    e.active = false
                }

            })

            // set all elements in model (selected) to active
            // changing the model here will also change the project prop
            this.model.forEach(function (e) {
                e.active = true
            })

            // console.log('FromB.vue: select option')
            // console.log(this.model)

            this.updateProject()

        },
        deleteItem(item) {

            // console.log(`Delete item with id=${item.name}`)
            this.model = this.model.filter(e => e !== item)

            let index = this.project.affectations.findIndex((obj) => obj.name === item.name)
            this.project.affectations[index].active = false

            this.project.affectations[index].area = 0.0
            this.project.affectations[index].numberOfHouses = 0.0

            this.updateProject()

        },
        updateProject() {
            this.validateForm()
            this.$emit('updateProject', this.project);
        },
        validateForm() {
            if (this.$refs.hasOwnProperty('form')) {
                if (this.$refs.form !== null) {
                    this.$nextTick(() => { this.$refs.form.validate() })
                }
            }
        }
    },
    mounted() {
        // console.log('FORM B - Affectations')
        // console.log(this.project.affectations)
    },
    updated() {
        this.validateForm()
    }
}
</script>

<style scoped>
@import '../assets/styles/table.css';
</style>