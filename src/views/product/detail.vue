<template>
  <div v-loading="loading" class="app-container">
    <el-button
      class="mb-4"
      icon="el-icon-back"
      @click="$router.push({ name: 'ProductList' })"
    >返回列表</el-button>
    <el-descriptions title="产品基本信息" :column="2" border>
      <el-descriptions-item label="产品编号">{{ ins.code }}</el-descriptions-item>
      <el-descriptions-item label="产品名称">{{ ins.name }}</el-descriptions-item>
      <el-descriptions-item label="产品类别">{{ ins.productCategory?.name }}</el-descriptions-item>
      <el-descriptions-item label="产品">{{ ins.mainName }}</el-descriptions-item>
      <el-descriptions-item label="规格型号">{{ ins.spec }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="statusTypeMap[ins.status]">{{ statusMap[ins.status] }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="备注">{{ ins.remark || '-' }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ ins.createTime }}</el-descriptions-item>
      <el-descriptions-item label="更新时间">{{ ins.updateTime }}</el-descriptions-item>
    </el-descriptions>
    <div class="mt-4 mb-4 flex items-center justify-between">
      <span style="font-size: 16px;font-weight: bold;">产品系数关联客户信息</span>
      <el-button icon="el-icon-plus" type="primary" @click="addRelation">添加关联关系</el-button>
    </div>
    <el-table v-loading="relationLoading" :data="tableData" border stripe>
      <el-table-column label="客户名称" prop="customerName" min-width="140" show-overflow-tooltip />
      <el-table-column label="系数" prop="wageCoefficient" min-width="100" />
      <el-table-column label="系数上一次更新时间" prop="coefficientChangeTime" show-overflow-tooltip />
      <el-table-column label="备注" prop="remark" min-width="160" show-overflow-tooltip>
        <template v-slot="{ row }">{{ row.remark || '-' }}</template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" show-overflow-tooltip />
      <el-table-column label="更新时间" prop="updateTime" show-overflow-tooltip />
      <el-table-column label="操作" width="120" fixed="right" align="center">
        <template v-slot="{ row }">
          <el-button type="text" @click="edit(row)">修改</el-button>
          <el-button type="text" @click="del(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <relation-dialog ref="relationDialogRef" @success="getRelationList" />
  </div>
</template>

<script>
import {
  getProductDetail,
  queryCustomerRelationListByProduct,
  deleteCustomerRelation
} from '@/api/product'
import RelationDialog from './relation-dialog'

export default {
  name: 'ProductDetail',
  components: {
    RelationDialog
  },
  data() {
    return {
      loading: false,
      relationLoading: false,
      ins: {},
      statusMap: {
        enable: '启用',
        disable: '禁用'
      },
      statusTypeMap: {
        enable: 'success',
        disable: 'danger'
      },
      tableData: []
    }
  },
  created() {
    this.getDetail()
  },
  methods: {
    getDetail() {
      this.loading = true
      getProductDetail({
        id: this.$route.params.id
      })
        .then((res) => {
          this.ins = res.data || {}
          this.getRelationList()
        })
        .finally(() => {
          this.loading = false
        })
    },
    getRelationList() {
      if (!this.ins.id) return
      this.relationLoading = true
      queryCustomerRelationListByProduct({
        id: this.ins.id
      })
        .then((res) => {
          this.tableData = Array.isArray(res.data) ? res.data : (res.data?.records || [])
        })
        .finally(() => {
          this.relationLoading = false
        })
    },
    addRelation() {
      this.$refs.relationDialogRef.openAdd(this.ins.id)
    },
    edit(row) {
      this.$refs.relationDialogRef.openEdit(row, this.ins.id)
    },
    async del(row) {
      try {
        await this.$confirm(`确定删除产品【 ${this.ins.name} 】与客户【 ${row.customerName} 】的关联关系吗？`, '系统提示', {
          type: 'warning'
        })
        await deleteCustomerRelation({ id: row.id })
        this.$message.success('删除成功')
        this.getRelationList()
      } catch (error) {
        console.log(error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.el-descriptions-item__content) {
  height: 50px;
  line-height: 50px;
}
</style>
