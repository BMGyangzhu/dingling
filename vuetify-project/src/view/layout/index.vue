<template>
    <v-app class="rounded rounded-md" >
        <Header :drawer="drawer" @update:drawer="val => drawer = val" />
        <Navigation v-model:drawer="drawer"/>
        <v-main class="align-center justify-center" style="min-height: 100%;">
          <router-view />
        </v-main>
    </v-app>
</template>

<script setup>
import Header from './Header.vue'
import { ref, watch } from 'vue'
import Navigation from './Navigation.vue'
import { RouterView } from 'vue-router';

const drawer = ref(true)

watch(
  () => drawer.value,
  (newVal, oldVal) => {
    console.log("drawer changed:", newVal, "from", oldVal)
  }
)

</script>

<style>
/*.navigation{
    width: 10vw;
    height: 100vh;
    background-color: wheat;
    border: 1px solid gray;
}*/

</style>