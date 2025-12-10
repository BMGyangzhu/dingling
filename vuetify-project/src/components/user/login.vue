<template>
    <v-card title="登录" style="text-align: center;" @keyup.enter="login">
        <v-form>
            <v-text-field
                v-model="loginInfo.email"
                :rules="accountRules"
                label="邮箱"
                clearable
                required>
            </v-text-field>

            <v-text-field
                v-model="loginInfo.password"
                :rules="passwordRules"
                label="密码"
                clearable
                :append-inner-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                :type="show1 ? 'text' : 'password'"
                @click:append-inner="show1 = !show1"
                
                required>
            </v-text-field>
        </v-form>

        <v-card-actions style="justify-content: center;"   >

            <v-btn
             @click="login"
             :loading="loading"
             color="success"
             size="large"
             type="submit"
             variant="elevated"
             block
              >Sign In</v-btn>
        </v-card-actions>

    </v-card>
</template>

<script setup>
import { reactive, ref }  from 'vue'
import { apiAuth } from '@/api/user/auth'
import { debounce } from '@/util/debounce'
const { showMessage, closeEvent } = defineProps({
    showMessage: {
        type: Function,
        default: () => {}
    },
    closeEvent: {
        type: Function,
        default: () => {}
    }
})

const show1 = ref(false)
const loginInfo = reactive({
    email: "",
    password: ""
})
const loading = ref(false)

const login = debounce(async() => {
  try {
    loading.value = true
    const { data } = await apiAuth(1, loginInfo)
    showMessage(data.message, data.state ? 'success' : 'error')
    if (!data.state) return
    closeEvent({ info: {}, token: data.data.token })
  } catch (err) {
    console.error('登录失败：', err)
  } finally {
    loading.value = false
  }
})
</script>

<style>
</style>
