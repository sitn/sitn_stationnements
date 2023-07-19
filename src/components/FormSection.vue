<template>
    <div class="row justify-center no-print q-my-xl">
        <div class="col-xs-12 col-sm-12 col-md-8">

            <div class="bg-blue-grey-6 text-white text-h5 q-pa-md q-mx-md">{{ title }}</div>
            <div class="bg-white q-pa-md q-mx-md">

                <!-- <q-form ref="form" greedy> -->

                <slot name="content"></slot>

                <!-- </q-form> -->

            </div>
        </div>
    </div>
</template>

<script>
// import { ref } from 'vue'

export default {
    name: 'FormSection',
    components: {},
    props: { 'title': String },
    emits: [],
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
    mounted() {

        // this.$nextTick(() => { this.$refs.form.validate() })

    },
    methods: {
    }
}
</script>

<style scoped></style>