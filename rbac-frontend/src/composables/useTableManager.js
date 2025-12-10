// composables/useTableManager.js
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

export function useTableManager(api, options = {}) {
    const {
        pageSize = 10,
        pageSizes = [10, 20, 50, 100],
        immediate = true,
        onSuccess = null,
        onError = null
    } = options

    // 状态管理
    const tableData = ref([])
    const loading = ref(false)
    const searchQuery = ref('')

    const pagination = reactive({
        current: 1,
        limit: pageSize,
        total: 0,
        pageSizes
    })

    // 获取数据
    const getList = async () => {
        loading.value = true
        try {
            const params = {
                page: pagination.current,
                limit: pagination.limit,
                keyword: searchQuery.value,
                ...options.extraParams
            }

            const res = await api.getList(params)

            tableData.value = res.data?.data || []
            pagination.total = res.data?.count || 0

            if (onSuccess) {
                onSuccess()
            }
            
            return res
        } catch (error) {
            console.error('获取数据失败:', error)
            throw error
        } finally {
            loading.value = false
        }
    }

    // 分页处理
    const handleSizeChange = (limit) => {
        pagination.limit = limit
        pagination.current = 1
        getList()
    }

    const handleCurrentChange = (current) => {
        pagination.current = current
        getList()
    }

    // 搜索
    const handleSearch = () => {
        pagination.current = 1
        getList()
    }

    // 重置搜索
    const handleReset = () => {
        searchQuery.value = ''
        pagination.current = 1
        getList()
    }

    // 删除
    const handleDelete = async (id) => {
        try {
            await ElMessageBox.confirm('确定删除吗？', '提示', { type: 'warning'})
            await api.deleteItem(id)
            ElMessage.success('删除成功')
            getList()
        } catch (error) {
            if (error !== 'cancel') {
                console.error('删除失败:', error)
            }
        }
    }

    // 初始化
    if (immediate) {
        getList()
    }

    return {
        // 状态
        tableData,
        loading,
        pagination,
        searchQuery,

        // 方法
        getList,
        handleSizeChange,
        handleCurrentChange,
        handleSearch,
        handleReset,
        handleDelete
    }
}