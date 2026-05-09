<template>
  <div v-loading="loading" class="app-container">
    <el-button
      class="mb-4"
      icon="el-icon-back"
      @click="$router.push({ name: 'ProductList' })"
    >返回列表</el-button>
    <el-descriptions class="margin-top" title="产品基本信息" :column="2" border>
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
      <span style="font-size: 16px;font-weight: bold;">系数信息</span>
      <el-button type="primary">选择客户</el-button>
    </div>
    <el-table :data="tableData">
      <el-table-column label="客户名称" prop="name" />
      <el-table-column label="系数" prop="coefficient" />
      <el-table-column label="操作">
        <template v-slot="{ row }">
          <el-button type="text" @click="edit(row)">修改</el-button>
          <el-button type="text" @click="del(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import { getProductDetail } from '@/api/product'

export default {
  name: 'ProductDetail',
  data() {
    return {
      loading: false,
      ins: {
        code: 'CP_1758179972366',
        name: '非球面[夹角59.877度]',
        productCategory: {
          name: '钻石刀具'
        },
        mainName: '非球面',
        spec: '夹角59.877度',
        status: 'enable',
        remark: '',
        createTime: '2025-09-18 15:20:46',
        updateTime: '2025-09-18 15:20:46'
      },
      statusMap: {
        enable: '启用',
        disable: '禁用'
      },
      statusTypeMap: {
        enable: 'success',
        disable: 'danger'
      },
      tableData: [
        { name: '客户1', coefficient: '80%' },
        { name: '客户2', coefficient: '90%' },
        { name: '客户3', coefficient: '100%' }
      ]
    }
  },
  created() {
    // this.getDetail()
  },
  methods: {
    getDetail() {
      this.loading = true
      getProductDetail({
        id: this.$route.params.id
      }).then(res => {
        this.ins = res.data
        this.loading = false
      })
    },
    edit(row) {},
    del(row) {}
  }
}
</script>

<style lang="scss" scoped>
:deep(.el-descriptions-item__content) {
  height: 50px;
  line-height: 50px;
}
</style>
