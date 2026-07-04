<template>
  <div v-loading="loading" class="app-container">
    <el-button
      class="mb-4"
      icon="el-icon-back"
      @click="$router.push({ name: 'ProductList' })"
    >返回列表</el-button>
    <el-descriptions title="产品基本信息" :column="2" border>
      <el-descriptions-item label="ID">{{ ins.id }}</el-descriptions-item>
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

    <!-- 图纸信息 -->
    <div class="mt-4 mb-4 flex items-center justify-between">
      <span style="font-size: 16px;font-weight: bold;">图纸信息</span>
      <el-button icon="el-icon-upload2" type="primary" @click="openUploadDrawing">上传图纸</el-button>
    </div>
    <el-table v-loading="attachmentLoading" :data="attachmentList" border stripe>
      <el-table-column label="文件名称" prop="fileName" min-width="200" show-overflow-tooltip />
      <el-table-column label="文件格式" prop="fileSuffix" min-width="90">
        <template v-slot="{ row }">
          <el-tag size="small">{{ (row.fileSuffix || '').toUpperCase() }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="文件大小" prop="fileSize" min-width="110">
        <template v-slot="{ row }">{{ formatFileSize(row.fileSize) }}</template>
      </el-table-column>
      <el-table-column label="上传时间" prop="createTime" min-width="160" show-overflow-tooltip />
      <el-table-column label="操作" width="140" fixed="right">
        <template v-slot="{ row }">
          <el-button type="text" :loading="row._downloading" @click="downloadFile(row)">下载</el-button>
          <el-button type="text" :loading="row._deleting" @click="deleteAttachment(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="mt-4 mb-4 flex items-center justify-between">
      <span style="font-size: 16px;font-weight: bold;">产品系数关联客户信息</span>
      <el-button icon="el-icon-plus" type="primary" @click="addRelation">添加关联关系</el-button>
    </div>
    <el-table v-loading="relationLoading" :data="tableData" border stripe>
      <el-table-column label="客户名称" prop="customerName" min-width="140" show-overflow-tooltip />
      <el-table-column label="新刀系数" prop="newToolCoefficient" min-width="100" />
      <el-table-column label="修刀系数" prop="repairToolCoefficient" min-width="100" />
      <el-table-column label="返工系数" prop="reworkCoefficient" min-width="100" />
      <el-table-column label="系数上一次更新时间" prop="coefficientChangeTime" min-width="100" show-overflow-tooltip />
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
    <upload-drawing ref="uploadDrawingRef" @success="getAttachmentList" />
  </div>
</template>

<script>
import {
  getProductDetail,
  queryCustomerRelationListByProduct,
  deleteCustomerRelation,
  queryProductAttachments,
  generateDownloadUrl,
  deleteProductAttachment
} from '@/api/product'
import RelationDialog from './relation-dialog'
import UploadDrawing from './upload-drawing'

export default {
  name: 'ProductDetail',
  components: {
    RelationDialog,
    UploadDrawing
  },
  data() {
    return {
      loading: false,
      relationLoading: false,
      attachmentLoading: false,
      ins: {},
      attachmentList: [],
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
          this.getAttachmentList()
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
    getAttachmentList() {
      if (!this.ins.id) return
      this.attachmentLoading = true
      queryProductAttachments({ id: this.ins.id })
        .then((res) => {
          this.attachmentList = Array.isArray(res.data) ? res.data : (res.data?.records || [])
        })
        .finally(() => {
          this.attachmentLoading = false
        })
    },
    formatFileSize(bytes) {
      if (!bytes) return '-'
      if (bytes < 1024) return bytes + ' B'
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    },
    async getFileUrl(row) {
      const res = await generateDownloadUrl({
        objectKey: row.ossKey,
        downloadFilename: row.fileName,
        expirationMinutes: 60,
        forceDownload: true
      })
      return res.data.url
    },
    async downloadFile(row) {
      if (!row.ossKey) {
        this.$message.warning('文件地址不存在')
        return
      }
      this.$set(row, '_downloading', true)
      try {
        const url = await this.getFileUrl(row)
        const link = document.createElement('a')
        link.href = url
        link.download = row.fileName || '附件下载'
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (e) {
        this.$message.error('获取文件链接失败')
      } finally {
        this.$set(row, '_downloading', false)
      }
    },
    addRelation() {
      this.$refs.relationDialogRef.openAdd(this.ins.id)
    },
    openUploadDrawing() {
      this.$refs.uploadDrawingRef.open(this.ins)
    },
    edit(row) {
      this.$refs.relationDialogRef.openEdit(row, this.ins.id)
    },
    async deleteAttachment(row) {
      try {
        await this.$confirm(`确定删除文件【 ${row.fileName} 】吗？删除后不可恢复。`, '系统提示', {
          type: 'warning'
        })
        this.$set(row, '_deleting', true)
        await deleteProductAttachment({ id: row.id })
        this.$message.success('删除成功')
        this.getAttachmentList()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      } finally {
        this.$set(row, '_deleting', false)
      }
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
