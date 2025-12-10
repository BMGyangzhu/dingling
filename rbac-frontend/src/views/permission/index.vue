<template>
  <div>
    <div style="margin-bottom: 10px;">
      <el-button type="primary" @click="handleAdd">新增</el-button>
      <el-button type="warning" @click="handleEdit(selectedRows[0])" :disabled="selectedRows.length !== 1">修改</el-button>
      <el-button type="danger" @click="handleDelete(selectedRows[0]?.id)" :disabled="!selectedRows.length">删除</el-button>
      <!-- ✅ 搜索框 -->
      <el-input v-model="keyword" placeholder="搜索菜单" clearable style="width: 240px; margin-left: 10px;" />
    </div>

    <!-- ✅ 把 :data 改成 filteredData -->
    <el-table
      :data="filteredData"
      style="width: 100%; margin-bottom: 20px"
      height="700px"
      row-key="id"
      border
      default-expand-all
      :tree-props="{ children: 'children', checkStrictly: true }"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="path" label="权限路径" />
      <el-table-column prop="href" label="跳转地址" />
      <el-table-column
        prop="isMenu"
        :formatter="(row) => {
          return row.isMenu === -1
            ? '目录'
            : row.isMenu === 0
              ? '菜单'
              : '按钮';
        }"
        label="菜单类型"
      />
    </el-table>

    <PermissionDialog
      :dialog-visible="dialogVisible"
      :form-data="formData"
      :is-edit-mode="isEditMode"
      :options="permissionCascader"
      @submit="handleSubmit"
      @update:dialogVisible="handleVisible"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { apiGetPermissions, apiGetMenus, apiGetPermissionCascader, apiAddPermission, apiEditPermission, apiDeletePermission } from "@/apis/permission";
import { useFormDialog, useTableManager } from "@/composables";
import PermissionDialog from "./component/PermissionDialog.vue";

const api = {
  getList: apiGetPermissions,
  deleteItem: apiDeletePermission,
  handleAdd: apiAddPermission,
  handleEdit: apiEditPermission,
  handleDelete: apiDeletePermission
};

const permissionCascader = ref([{}]);
const selectedRows = ref([]);

const handleSelectionChange = (val) => {
  selectedRows.value = val;
};

const getPermissionCascader = async () => {
  const res = await apiGetPermissionCascader();
  permissionCascader.value = res.data;
};

const { tableData, handleDelete } = useTableManager(api);
const { dialogVisible, formData, isEditMode, handleAdd, handleEdit, handleVisible, handleSubmit } = useFormDialog(api);

const keyword = ref("");
const originalData = ref([]); // ✅ 原始数据备份

const getPermissions = async () => {
  const res = await apiGetPermissions();
  tableData.value = res.data;
  originalData.value = res.data; // ✅ 同步保存原始数据
};

onMounted(() => {
  apiGetMenus()
    .then(getPermissions)
    .then(getPermissionCascader);
});

/** ✅ 树形过滤函数 **/
function filterTree(data, keyword) {
  if (!keyword) return data;
  const result = [];
  for (const item of data) {
    const children = item.children ? filterTree(item.children, keyword) : [];
    if (item.name.includes(keyword) || item.path?.includes(keyword) || children.length > 0) {
      result.push({ ...item, children });
    }
  }
  return result;
}

/** ✅ 计算属性，实时过滤 **/
const filteredData = computed(() => filterTree(originalData.value, keyword.value));
</script>
