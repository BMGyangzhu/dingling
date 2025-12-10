<template>
  <el-container style="height: 100vh">
    <!-- 顶部 -->
    <el-header height="60px">
      <defaultHeader :isCollapse="leftMenu" @toggle-menu="clickEvent" />
    </el-header>

    <!-- 内容区域 -->
    <el-container>
      <!-- 左侧导航 -->
      <el-aside width="250px">
        <navigation :collapse="leftMenu"  />
      </el-aside>

      <!-- 主内容 -->
      <el-main style="padding: 16px">
      
        <!-- 页面内容 -->
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref } from 'vue'
import defaultHeader from './header.vue'
import navigation from './navigation.vue'

const leftMenu = ref(false)

const clickEvent = () => {
    leftMenu.value = !leftMenu.value
}
</script>
