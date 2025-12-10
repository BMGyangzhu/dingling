<template>
    <el-dialog 
     width="700px"
    :close-on-click-modal = "false"
    :close-on-press-escape = "false"
    :title="isEditMode ? '编辑权限' : '新增权限'"
    :model-value="props.dialogVisible"
    @update:model-value="handleModelValueUpdate"
    @close="handleClose"
    >
    <el-form :model="localForm" ref="formRef" 
    >
      <el-form-item label="上级菜单">
       <el-cascader  v-model="localForm.pid" clearable 
       :props="{ checkStrictly: true, emitPath: false}"
       :options="cascaderOptions" />
      </el-form-item>

       <el-form-item label="菜单名称" prop="name">
        <el-input v-model="localForm.name" placeholder="请输入菜单名称" />
      </el-form-item>

      <el-form-item label="菜单地址" prop="href">
        <el-input v-model="localForm.href" placeholder="例如: page/xxx.html" />
      </el-form-item>

      <el-form-item label="权限标识" prop="path">
        <el-input v-model="localForm.path" placeholder="例如: system:list" />
      </el-form-item>

      <el-form-item label="菜单类型" prop="isMenu">
      <el-radio-group v-model="localForm.isMenu">
        <el-radio :value="0">菜单</el-radio>
        <el-radio :value="1">按钮</el-radio>
        <el-radio :value="-1">目录</el-radio>
      </el-radio-group>
      </el-form-item>
 
      <el-form-item label="菜单图标" prop="icon">
        <el-select v-model="localForm.icon" placeholder="请选择图标" filterable clearable style="width: 240px">

           <!-- 前缀展示当前图标 -->
          <template #prefix>
            <component
              v-if="localForm.icon"
              :is="localForm.icon"
              style="font-size: 18px; width: 18px; height: 18px; margin-right: 6px;"
            />
          </template>

          <el-option 
           v-for="iconName in iconList"
           :key="iconName"
           :label="iconName"
           :value="iconName"
           >
            <div style="display: flex; align-items: center;">
              <component
                :is="iconName"
                style="font-size: 16px; width: 16px; height: 16px; margin-right: 8px;"
              />
              <span>{{ iconName }}</span>
            </div>
          </el-option>
        </el-select>
      </el-form-item>
   
    </el-form>
    
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleSubmit">确定</el-button>
    </template>
    </el-dialog>
</template>

<script setup>
import { ref, watch, computed  } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
const props = defineProps({
  dialogVisible: Boolean,
  formData: Object,
  isEditMode: Boolean,
  options: Array // 接收父组件传进来的级联数据
})

const emit = defineEmits(['update:dialogVisible', 'submit'])
const localForm = ref({ ...props.formData }) 

const iconList = Object.keys(ElementPlusIconsVue)

// ✅ 当父组件传入新的 formData 时自动同步
watch(
  () => props.formData,
  (newVal) => {
    // 如果localForm.value = newVal 为真，即newVal存在，不是null或undefined
    // 如果父组件没传对象，就给我一个空对象；如果有对象，我就复制它
   localForm.value = newVal ? { ...newVal } : {}
  },
  { deep: true, immediate: true }
)

// watch(
//   () => props.formData,
//   (newValue) => {
//     if (newValue) {
//       localForm.value = { ...newValue }

//       if (newValue.pid) {
//         cascaderValue.value = findCascaderPath(newValue.pid, props.options)
//       } else {
//         cascaderValue.value = []
//       }
//     } else {
//       localForm.value = {}
//       cascaderValue.value = []
//     }
//   },
//   { deep: true, immediate: true}
// )


// function findCascaderPath(targetId, options, path = []) {
//   console.log('🔍 findCascaderPath 被调用：', targetId, options)

//   for (const item of options) {
//     const currentPath = [...path, item.id]
//     if (item.id === targetId || item.id === Number(targetId)) {
//       console.log('✅ 找到路径:', currentPath)
//       return currentPath
//     }
//     if (item.children && item.children.length > 0) {
//       const found = findCascaderPath(targetId, item.children, currentPath)
//       if (found && found.length) return found
//     }
//   }

//   console.warn('⚠️ 未找到 targetId:', targetId, '当前 path:', path)
//   return []
// }


const formRef = ref(null)
const handleSubmit = async () => {
  try {
    // 菜单名称必填
    if (!localForm.value.name) {
      ElMessage.warning('请输入菜单名称')
      return
    }

    // 菜单类型必须选择
    if (!('isMenu' in localForm.value)) {
      ElMessage.warning('请选择菜单类型')
      return
    }

    const isDir = localForm.value.isMenu === -1
    const isButton = localForm.value.isMenu === 1
    const isMenu = localForm.value.isMenu === 0

    // 校验 href 和 path
    // if (isMenu) {
    //   if (!localForm.value.href) {
    //     ElMessage.warning('菜单类型为“菜单”时必须填写菜单地址')
    //     return
    //   }
    //   if (!localForm.value.path) {
    //     ElMessage.warning('菜单类型为“菜单”时必须填写权限标识')
    //     return
    //   }
    // }

    // 目录和按钮类型可以留空
    if (isDir || isButton) {
      localForm.value.href = localForm.value.href || ''
      localForm.value.path = localForm.value.path || ''
    }

    // 校验 pid（上级菜单）
    if (localForm.value.pid !== 0 && !localForm.value.pid) {
      ElMessage.warning('请选择上级菜单')
      return
    }

    // ✅ 提交表单
    emit('submit', { ...localForm.value })
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}
// 处理级联选择器变化
// const handleChange = (val) => {
//   console.log('选中的上级菜单:', val)
//   localForm.value.pid = val.length > 0 ? val[val.length - 1] : 0
// }

function convertToCascaderOptions(data) {
  return data.map(item => ({
      label: item.name,
      value: item.id,
      children: item.children ? convertToCascaderOptions(item.children) : undefined
    }))
}

const handleModelValueUpdate = (newValue) => {
  emit('update:dialogVisible', newValue)
}
const handleClose = () => {
  if (props.dialogVisible) {
    emit('update:dialogVisible', false)
  }
}

const cascaderOptions = computed(() => {
  return convertToCascaderOptions(props.options || [])
})
</script>