<template>
  <el-dialog
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :title="isEditMode ? '编辑用户' : '新增用户'"
    width="700"
    :model-value="props.dialogVisible"
    @update:model-value="handleModelValueUpdate"
    @close="handleClose"
  >
    <el-form :model="localForm">
      <el-form-item label="昵称" prop="nickName">
        <el-input v-model="localForm.nickName" placeholder="请输入昵称" />
      </el-form-item>

      <el-form-item label="描述" prop="description">
        <el-input v-model="localForm.description" />
      </el-form-item>

      <el-form-item label="性别" prop="sex">
        <el-select v-model="localForm.sex" placeholder="请选择性别">
          <el-option label="男" :value="true" />
          <el-option label="女" :value="false" />
        </el-select>
      </el-form-item>

    </el-form>
   
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </template>
  </el-dialog>
  
</template>

<script setup>
import { watch, reactive } from 'vue'

const props = defineProps({
  dialogVisible: Boolean,
  formData: Object,
  isEditMode: Boolean,
})

const emit = defineEmits(['update:dialogVisible', 'submit'])

const localForm = reactive({ 
  ...props.formData   // 只在初始化时复制
})
// 需要 watch 来监听后续变化
watch(() => props.formData, (newVal) => {
  Object.assign(localForm, newVal)
})

watch(() => props.dialogVisible, (visible) => {
  if (visible) {
    if (props.isEditMode) {
      Object.assign(localForm, props.formData || {})
    } else {
      resetForm()
    }
  }
})

const resetForm = () => {
  Object.assign(localForm, {
    nickName: '',
    description: '',
    sex: '' //重置为默认值
  })
}
const handleConfirm = () => {
  emit('submit', { ...localForm })
}

const handleModelValueUpdate = (newValue) => {
  emit('update:dialogVisible', newValue)
}

const handleClose = () => {
  if (props.dialogVisible) {
    emit('update:dialogVisible', false)
  }
}
</script>