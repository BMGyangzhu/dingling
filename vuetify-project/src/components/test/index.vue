<template>
    <v-layout full-height>
        <v-navigation-drawer location="right" style="opacity: 0.9;">
        </v-navigation-drawer>
        <v-main style="background-color:aquamarine; width: 100%; height: 100%">
            <v-container style="width: 100%; height: 100%;">
                <v-card style="width:100%; height:100%; background-color:azure;">
                    <video src="@/assets/mov_bbb.mp4" style="object-fit:cover;"></video>
                </v-card>
            </v-container>
        </v-main>
    </v-layout>

</template>

<script setup>
</script>

<style scoped></style>