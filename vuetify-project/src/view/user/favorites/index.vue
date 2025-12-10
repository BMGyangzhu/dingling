<template>
    <v-layout>
        <v-navigation-drawer permanent>
            <v-list mandatory :lines="false" nav v-model:selected="currentFavoriteIndex">
                <v-list-item title="我的收藏夹"></v-list-item>
                <v-dialog max-width="500">
                    <template v-slot:activator="{ props: activatorProps }">
                        <v-list-item v-bind="activatorProps" style="background-color: pink; user-select: none; " border
                            rounded="lg" title="添加收藏夹">
                            <template v-slot:prepend>
                                <v-icon icon="mdi-plus"></v-icon>
                            </template>
                        </v-list-item>

                    </template>
                    <template v-slot:default="{ isActive }">
                        <v-card title="添加收藏夹">
                            <v-card-text>
                                <v-text-field label="收藏夹名称" v-model="newFavorite.name"></v-text-field>
                                <v-text-field label="收藏夹描述" v-model="newFavorite.description"></v-text-field>
                            </v-card-text>

                            <v-card-actions>
                                <v-spacer></v-spacer>

                                <v-btn text="保存" @click="saveFavorite(newFavorite);isActive.value = false"></v-btn>
                            </v-card-actions>

                        </v-card>
                    </template>
                </v-dialog>

                <v-list-item 
                    style="background-color: grey; color: white; user-select: none; " 
                    v-for="(item, index) in favorites" :value="index" :active="currentFavoriteIndex == index"
                    color="primary" :key="item.id" :title="item.name" variant="flat"
                    :color="currentFavoriteIndex === index ? 'primary' : undefined"
                    @click="currentFavoriteIndex = index; getFavoritesVideo()">
                    <template v-slot:append>
                        <v-dialog max-width="500">
                            <template v-slot:activator="{ props: activatorProps }">
                                <v-btn icon :variant="'plain'" v-bind="activatorProps">
                                    <v-icon>mdi-pen</v-icon>
                                </v-btn>
                            </template>

                            <template v-slot:default="{ isActive }">
                                <v-card title="修改收藏夹" >
                                    <v-divider class="mt-2" />
                                    <v-card-text>
                                        <v-text-field label="收藏夹名称" v-model="item.name" single-line
                                            :variant="'outlined'"></v-text-field>
                                        <v-text-field label="收藏夹描述" v-model="item.description" single-line
                                            :variant="'outlined'"></v-text-field>
                                    </v-card-text>

                                    <v-card-actions>
                                        <v-btn color="red" text="删除" @click="deleteFavorite(item); isActive.value = false"
                                           ></v-btn>
                                        <v-spacer></v-spacer>
                                        <v-btn color="blue" text="保存" @click="saveFavorite(item); isActive.value = false"></v-btn>
                                    </v-card-actions>
                                </v-card>
                            </template>
                        </v-dialog>
                    </template>
                </v-list-item>
            </v-list>


        </v-navigation-drawer>

        <v-main>
            <VideoList v-if="favoritesVideo.length > 0" :video-list="favoritesVideo" />

            <v-card v-else-if="favoritesVideo.length == 0" style="width: 50vw; height: 50vh;">
                <v-card-text style="text-align: center; font-weight: bolder;">空收藏夹</v-card-text>
            </v-card>
        </v-main>
    </v-layout>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { apiGetFavorites, apiRemoveFavorite, apiSaveFavorite } from '@/api/user/favorites'
import { apiGetVideoByFavoriteId } from '@/api/video'
import VideoList from '@/components/videoList'


const favorites = ref([])
const newFavorite = ref({ name: "", description: ""})
const currentFavoriteIndex = ref(0)
const favoritesVideo = ref([])

const getFavorites = async () => {
    try {
        const res = await apiGetFavorites()
        favorites.value = res.data.data
    } catch (error) {
        console.error(error)
    }
}

const getFavoritesVideo = async () => {

    try {
        const res = await apiGetVideoByFavoriteId(favorites.value[currentFavoriteIndex.value].id)
        favoritesVideo.value = res.data.data
    } catch (error) {
        console.error(error)
    }

}
const saveFavorite = async (item) => {
    try {
        const { data } = await apiSaveFavorite(item)
        if (!data.state) return

        newFavorite.value = { name: "", description: "" }

        await getFavorites()
        await getFavoritesVideo()
    } catch (error) {
        console.error(error)
    }
}

const deleteFavorite = async (item) =>{
    try {
        const { data } = await apiRemoveFavorite(item.id)
        if (!data.state) return

        
        await getFavorites()
        await getFavoritesVideo()
    } catch(error) {
        console.error(error)
    }
   
}
onMounted(() => {

    getFavorites().then(getFavoritesVideo)
})

</script>

<style></style>