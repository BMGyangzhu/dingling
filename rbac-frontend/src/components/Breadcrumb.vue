<template>
    <el-breadcrumb separator="/">
      <el-breadcrumb-item
       v-for="(item, index) in breadcrumbList"
       :key="index"
       :to="item.path !== route.path ? { path: item.path } : null"
       >
       {{ item.meta?.title || item.name }}
      </el-breadcrumb-item>
    </el-breadcrumb>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const breadcrumbList = computed(() => {
    return route.matched
        .map(r => ({
            path: r.path,
            meta: r.meta,
            name: r.name
        }))
})

</script>

<style scoped>
.el-breadcrumb {
  font-size: 14px;
  margin-bottom: 12px;
}
</style>