<template>
    <q-table title="" :rows="rows" :columns="columns" row-key="id" v-model:pagination="pagination" :loading="loading"
        :filter="filter" dense>
        <!-- TABLE BODY -->
        <template v-slot:body="props">
            <q-tr :props="props">
                <!-- label column -->
                <q-td key="label" :props="props">
                    {{ props.row.properties.label }}
                </q-td>
                <!-- commune column -->
                <q-td key="comnom" :props="props">
                    {{ props.row.properties.comnom }}
                </q-td>
                <!-- commune column -->
                <q-td key="type" :props="props">
                    <template v-for="item in props.row.properties.locations">
                        <div>
                            <q-chip square color="grey-3">
                                <q-avatar :color="item.color" text-color="white">{{ item.type }}</q-avatar>
                                {{ item.area.toFixed(1) }} m<sup>2</sup>
                            </q-chip>
                        </div>
                    </template>
                </q-td>
                <!-- actions column -->
                <q-td key="actions" :props="props">
                    <q-btn dense round flat color="grey" name="print" @click="focusItem(props.row)" icon="map"></q-btn>
                    <q-btn dense round flat color="grey" name="delete" @click="deleteItem(props.row)" icon="delete"></q-btn>
                </q-td>
            </q-tr>
        </template>
        <template v-slot:no-data>
            Aucune parcelle sélectionnée
        </template>
    </q-table>
</template>

<script>
export default {
    name: 'LocationTable',
    components: {},
    props: { 'rows': Array, 'model': Object },
    emits: ['deleteItem', 'focusItem', 'action'],
    setup() {
        return {
            // model: ref(null),
        }
    },
    data() {
        return {
            loading: false,
            filter: "",
            pagination: {
                sortBy: "desc",
                descending: false,
                page: 1,
                rowsPerPage: 20,
            },
            columns: [
                {
                    name: "label",
                    align: "left",
                    label: "Parcelle",
                    field: "label",
                    sortable: true,
                },
                {
                    name: "comnom",
                    align: "left",
                    label: "Commune",
                    field: "comnom",
                    sortable: true,
                },
                {
                    name: "type",
                    align: "left",
                    label: "Type(s) de localisation",
                    field: "comnom",
                    sortable: true,
                },
                {
                    name: "actions",
                    align: "center",
                    label: "",
                    field: "",
                    sortable: false,
                },
            ],
        }
    },
    computed() {

    },
    methods: {
        deleteItem(item) {
            console.log(item)
            console.log(`Delete item with id=${item.id}`)
            this.$emit('deleteItem', item.id);
        },
        focusItem(item) {
            console.log(`Table.vue | Focus on item with id=${item.id}`)
            this.$emit('focusItem', item.id);
            this.$emit('action', { type: "focus", id: item.id });
        }
    }
}
</script>

<style scoped></style>