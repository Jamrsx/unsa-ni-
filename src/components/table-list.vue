<template>
    <div class="table-responsive">
        <table class="table">
            <thead>
                <tr>
                    <th v-for="col in column_slot" :key="col">
                        <slot :name="col"></slot>
                    </th>
                </tr>
            </thead>
            <tbody>
                <!-- use tr and td -->
                <slot name="content">

                </slot>
            </tbody>
        </table>
    </div>
    
</template>
<script setup>
    const props = defineProps({
        column_slot:{
            type: Array,
            default: () => []
        }
    })
</script>
