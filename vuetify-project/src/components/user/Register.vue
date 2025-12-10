<template>
    <v-card title="注册">

        <v-sheet color="#202225">
            <v-card-item>
                <template v-slot:prepend>
                    <v-card-title>
                        <v-icon icon="mdi-account" start></v-icon>
                        注册账号
                    </v-card-title>
                </template>
            </v-card-item>
        </v-sheet>

        <v-window v-model="step">
            <v-window-item :value="1">
                <v-from :disabled="isLoading">
                    <v-card-text>
                        <v-text-field v-model="registerInfo.email" label="邮箱" hint="tips: 邮箱必须真实有效，它将用于登录账号使用。"
                            placeholder="请输入邮箱"></v-text-field>
                        <v-row no-gutters>
                            <v-col>
                                <v-img :src="captchaImg" @click="getCaptchaImg"></v-img>
                            </v-col>
                            <v-col>
                                <v-text-field v-model="registerInfo.captchaCode" label="图形验证码" hied-details
                                    placeholder="请输入图形验证码"></v-text-field>
                            </v-col>
                        </v-row>
                        <v-btn 
                            color="blue" 
                            block
                            :variant="'flat'"
                            :disabled="codeTimer > 0 || isCodeSending"
                            @click="getEmailCode">
                            {{ codeTimer > 0 ? `${codeTimer}s 后重新获取` : '获取邮箱验证码'}}</v-btn>
                    </v-card-text>
                    <v-otp-input v-model="registerInfo.code" placeholder="0"></v-otp-input>
                </v-from>
            </v-window-item>

            <v-window-item :value="2">
                <v-card-text>
                    <v-text-field v-model="registerInfo.nickName" label="请输入昵称" type="text"></v-text-field>
                    <v-text-field v-model="registerInfo.password" label="请输入密码" type="password"></v-text-field>
                    <v-text-field v-model="registerInfo.confirmPassword" label="请确认密码" type="password"></v-text-field>
                    <span class="text-caption text-grey-darken-1">
                        tips: 请为您的账号设置密码
                    </span>
                </v-card-text>
            </v-window-item>

            <v-window-item :value="3">
                <div class="pa-4 text-center" style="color: greenyellow;">
                    <h3 class="text-h6 font-weight-light mb-2">
                        欢迎
                    </h3>
                    <span class="text-caption text-grey">Thanks for signing up!</span>
                </div>
            </v-window-item>
        </v-window>
        <v-card-actions>
            <v-btn v-if="step == 2" variant="text" @click="step--" :loading="isLoading">
                Back
            </v-btn>
            <v-spacer></v-spacer>
            <v-btn v-if="step < 3" color="blue" variant="flat" @click="stepData[step].next?stepData[step].next():(step++)" :loading="isLoading">
                Next
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script setup>
import { ref, reactive, onUnmounted } from 'vue'
import { apiAuth, apiCheckCode, apiGetCode } from '@/api/user/auth'
import  buildUtil  from '@/util/buildUtil'
import { debounce } from '@/util/debounce'

const codeTimer = ref(0) // 剩余秒数
const codeInterval = ref(null)
const isCodeSending = ref(false)



const startCountdown = () => {
    codeTimer.value = 60

    codeInterval.value = setInterval(() => {
        codeTimer.value--

        if(codeTimer.value <= 0) {
            clearInterval(codeInterval.value)
            codeInterval.value = null
        }
    }, 1000)
}

const step = ref(1)
const stepData = ref({
    1: {
        title: "邮箱验证",
        next: ()=>{
            verifyCode()
        }
    },
    2: {
        title: "设置密码",
        next: ()=>{
            setPassword()
        }
    },
    3: {
        title: "注册成功"
    }
})
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
const isLoading = ref(false)
const captchaImg = ref()
const getCaptchaImg = () => {
    registerInfo.uuid = buildUtil.guid()
    captchaImg.value = apiGetCode(1, registerInfo.uuid)
}
const registerInfo = reactive({
    email: "",
    nickName: "",
    code: "",
    captchaCode: "",
    password: "",
    confirmPassword: "",
    uuid: ""
})

getCaptchaImg()

const getEmailCode = debounce(() => {
    if (codeTimer.value > 0 || isCodeSending.value) return

    isCodeSending.value = true

    apiGetCode(0, { ...registerInfo, code: registerInfo.captchaCode }).then(({ data }) => {
        showMessage( data.message, data.state?"success" : "error")
        if (!data.state) {
            getCaptchaImg()
            return
        }

        // 当且仅当发送成功时启动倒计时
        startCountdown()
    })
    .finally(() => {
        isCodeSending.value = false
    })
}, 300)


const verifyCode = debounce(() => {
    isLoading.value = true
    apiCheckCode({ ...registerInfo}).then(({ data }) => {
        isLoading.value = false

        if (!data.state) {
            showMessage("邮箱验证码无效", 'red')
            getCaptchaImg()
            return
        }
        step.value++
    })
})

const setPassword = debounce(() => {
    apiAuth(0, registerInfo).then(({data}) => {
        if (!data.state) {
            showMessage(data.message, "error")
            return
        }
        step.value++
    })
})

onUnmounted(() => {
    if (codeInterval.value) {
        clearInterval(codeInterval.value)
    }
})
</script>

<style></style>
