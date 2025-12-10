<!-- src/views/DynamicMenu.vue -->
<template>
  <el-menu
  :collapse="collapse"
    class="el-menu-vertical-demo"
    default-active="1"
    active-text-color="#ffd04b"
    router
  >
    <template v-for="item in menus" :key="item.id">
      <MenuItem :item="item" />
    </template>
  </el-menu>
</template>

<script  setup>
import { ref, onMounted } from 'vue'
import MenuItem from '@/components/MenuItem.vue'
import { apiGetMenus } from '@/apis/permission'

const menus = ref([])

const getMenus = async () => {
  const res = await apiGetMenus()
  menus.value = res.data
}

defineProps({
  collapse: Boolean
})

onMounted(() => {
  getMenus()
})
</script>
