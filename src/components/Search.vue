<template>
    <!--<div class="q-pa-md"> -->

    <!--
        <div class="bg-grey-2 q-pa-md q-my-sm rounded-borders">
            <q-select outlined bottom-slots bg-color="white" v-model="model" :options="this.project.affectations"
                option-value="name" option-label="name" @update:model-value="selectOption()" multiple label="Affectation(s)"
                :disable="!this.project.locationType">

        -->

    <q-select outlined bg-color="white" v-model="model" autofocus use-input hide-selected input-debounce="0"
        :options="options" option-label="features.properties.label" option-value="features.id"
        @update:model-value="selectOption()" @filter="fetchSources" label="N° de parcelle ou EGRID"
        hint="Cliquer pour ajouter une parcelle à la liste" :disable="!this.project.commune">
        <template v-slot:prepend>
            <q-icon name="search" @click.stop.prevent></q-icon>
        </template>

        <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                    <q-icon name="add_circle"></q-icon>
                    <!-- <q-icon :name="scope.opt.icon"></q-icon> -->
                </q-item-section>

                <q-item-section>
                    <q-item-label>{{ scope.opt.properties.label }}
                    </q-item-label>
                    <q-item-label caption>IDMAI: {{ scope.opt.properties.idmai }}</q-item-label>
                    <q-item-label caption>Commune: {{ scope.opt.properties.comnom }} (n° {{
                        scope.opt.properties.comnum }})
                    </q-item-label>
                </q-item-section>
            </q-item>
        </template>

        <template v-slot:no-option>
            <q-item>
                <q-item-section class="text-grey">
                    No results
                </q-item-section>
            </q-item>
        </template>
    </q-select>
</template>

<script>
import { ref } from 'vue'
export default {
    name: 'Search',
    components: {},
    props: { 'geojson': Object, 'options': Object, 'model': Object, 'project': Object },
    emits: ['addOption'],
    setup() {
        return {
            model: ref(null),
            options: ref(null),
        }
    },
    data() {
        return {
            // count: 0
        }
    },
    methods: {
        selectOption() {
            if (this.model !== null) {

                // add item
                console.log(`Search.vue | Option selected: ${this.model.properties.label}`);

                // check if value is already in list
                this.$emit('addOption', this.model);

                // reset selection
                this.model = null;
            }
        },
        fetchSources(query, update, abort) {

            // call abort() if query is too short
            if (query.length < 2) {
                abort()
                return
            }



            var requestOptions = {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                redirect: "follow",
            }

            // let query = `${val} ${this.commune.comnom}`
            // let query = `${val}`
            // console.log(`query: ${query}`)


            fetch(`https://sitn.ne.ch/permis_construire/search?query=${encodeURIComponent(query)}`,
                requestOptions
            )
                .then((response) => response.json())
                .then((data) => {

                    update(() => {

                        data.features = data.features.filter(obj => obj.properties.comnom === this.project.commune.comnom)
                        // data.features = data.features.filter(obj => obj.properties.comnum === this.commune.numcom)

                        // remove options that have already been selected
                        let currentOptions = this.geojson.features.map(obj => obj.properties.idmai)
                        this.options = data.features.filter(obj => !currentOptions.includes(obj.properties.idmai))

                        this.options.forEach(option => {
                            // option.disable = true
                            option.icon = ''
                        })

                    })

                })
                .catch((error) => console.log("error", error))




        },
        abortFilterFn() {
            // console.log('delayed filter aborted')
        }
    },
}
</script>

<style scoped></style>