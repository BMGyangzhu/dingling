import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

export function useFormDialog(api, options = {}) {

      const defaultConfig = {
        // 默认消息
        messages: {
            addSuccess: '新增成功',
            editSuccess: '修改成功',
            deleteSuccess: '删除成功',

            addFail: '新增失败',
            editFail: '编辑失败',
            deleteFail: '删除失败',

            success: '操作成功',
            fail: '操作失败',

            confirmDelete: '确定删除该项吗？'
            
        },
        // 回调函数
        onSuccess: null,
        onError: null,
        onRefresh: null
    }

    const config = {
        ...defaultConfig,
        ...options,
        messages: { ...defaultConfig.messages, ...options.messages }
    }

     // 状态管理
    const dialogVisible = ref(false)
    const isEditMode = ref(false)
    const submitLoading = ref(false)
    // const formData = reactive({})
    const formData = ref({})

    // 打开新增对话框
    const handleAdd = () => {
        isEditMode.value = false
        formData.value = {}
        dialogVisible.value = true
    }

    // 打开编辑对话框
    const handleEdit = (row) => {
        isEditMode.value = true
        formData.value = { ...row }
        dialogVisible.value = true
    }
    
    const handleVisible = (newValue) => {
        dialogVisible.value = newValue
    }

    const handleSubmit = async (submitData) => {
        submitLoading.value = true
        try {
            if (isEditMode.value) {
            console.log("submitData:", submitData)

                await api.handleEdit(submitData)
                console.log(api.handleEdit.toString())
                ElMessage.success(config.messages.editSuccess)
            } else {
                await api.handleAdd(submitData)
                ElMessage.success(config.messages.editSuccess)
            }
            dialogVisible.value = false

            // 刷新数据
            if (api.getList) {
                await api.getList()
            }
            if (config.onRefresh) {
                await config.onRefresh()
            }
            return true
        } catch (error) {
            console.error('操作失败:', error)
            isEditMode.value ? ElMessage.error(config.messages.editFail) : ElMessage.error(config.messages.addFail)
            return false
        } finally {
            submitLoading.value = false
        }
    }

    const handleDelete = async (id) => {

        try {
            await ElMessageBox.confirm(config.messages.confirmDelete, "提示", {
            type: "warning",
            });
            await api.handleDelete(id);
            ElMessage.success("删除成功");
            api.getList()
        } catch (error) {
            ElMessage.error(config.messages.deleteFail)
        }
    }

    return {
        dialogVisible,
        formData,
        isEditMode,
        submitLoading,

        handleAdd,
        handleEdit,
        handleDelete,
        handleSubmit,
        handleVisible
    }
}