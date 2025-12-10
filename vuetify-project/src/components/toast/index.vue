<template>
    <div class="toast-wrapper">
        <transition-group name="toast">
            <div class="toast-item" v-for="item in notifyQueue" :key="item.id">
                <div class="title">{{ item.title }}</div>
                <div class="content">{{ item.content }}</div>
            </div>
        </transition-group>
    </div>
</template>

<script setup>
import { useUserStore } from '@/store';
import { storeToRefs } from 'pinia';

const userStore = useUserStore()
const { notifyQueue } = storeToRefs(userStore)
</script>

<style scoped>
.toast-wrapper {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
}

.toast-item {
  background: rgba(0, 0, 0, 0.85);
  color: #fff;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 12px;
  min-width: 200px;
  box-shadow: 0 0 10px rgba(0,0,0,0.3);
}

.title {
  font-weight: bold;
  margin-bottom: 4px;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(50px);
}
</style>