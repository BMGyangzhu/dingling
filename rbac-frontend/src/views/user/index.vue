<template>
  <el-button type="primary" @click="handleAdd">新增</el-button>
  
  <el-table :data="tableData" style="width: 100%">
    <el-table-column prop="nickName" label="昵称" />
    <el-table-column prop="description" label="描述"  />
    <el-table-column prop="sex" label="性别" :formatter="formatSex"></el-table-column>
    <el-table-column label="操作">
      <template #default="scope">
        <el-button type="primary" @click="handleEdit(scope.row)">编辑</el-button>
        <el-button type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>

  <div class="pagination">
    <el-pagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.limit"
      :page-sizes="pagination.pageSizes"
      :total="pagination.total"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>

  <UserDialog
    :dialog-visible="dialogVisible"
    :is-edit-mode="isEditMode"
    :form-data="formData"
    @submit="handleSubmit"
    @update:dialogVisible="handleVisible"
  />
</template>

<script setup>
import { useTableManager, useFormDialog } from '@/composables'
import { apiGetUsers, apiAddUser, apiEditUser, apiDeleteUser } from '@/apis/user'
import UserDialog from './component/UserDialog.vue'
import { ElMessage } from 'element-plus'

// 格式化函数
const formatSex = (row) => {
  return row.sex ? '男' : '女'
}

// 对话框提交成功处理
// const handleDialogSuccess = async (formData, isEdit) => {
//   try {
//     if (isEdit) {
//       await apiEditUser(formData)
//       ElMessage.success('修改成功')
//     } else {
//       await apiAddUser(formData)
//       ElMessage.success('新增成功')
//     }
//     getList() // 刷新列表
//   } catch (error) {
//     console.error('操作失败:', error)
//   }
// }




// API 统一接口
const userApi = {
  getList: apiGetUsers,
  deleteItem: apiDeleteUser
}

// 使用组合式函数
const { 
  tableData, 
  pagination, 
  getList, 
  handleSizeChange, 
  handleCurrentChange, 
  handleDelete,
  
} = useTableManager(userApi)

const { 
  dialogVisible, 
  formData, 
  isEditMode, 
  handleAdd, 
  handleEdit,
  handleVisible,
  handleSubmit
} = useFormDialog(userApi)


</script>