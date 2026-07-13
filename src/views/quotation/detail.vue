<template>
  <div class="app-container">
    <el-card v-loading="loading">
      <div slot="header" class="card-header">
        <span>报价单详情</span>
        <el-button @click="goBack">返回</el-button>
      </div>

      <div v-if="detail" class="detail-content">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="报价单号">
            <copy-text :value="detail.quotationNo" />
          </el-descriptions-item>
          <el-descriptions-item label="客户名称">{{ detail.customerName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="负责业务员">{{ detail.businessPersonName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(detail.status)" size="small">{{ getStatusLabel(detail.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="版本号">v{{ detail.versionNo }}</el-descriptions-item>
          <el-descriptions-item label="总金额">
            <span class="amount-text">{{ formatAmount(detail.totalAmount) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatTime(detail.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ formatTime(detail.updateTime) }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="3">{{ detail.remark || '-' }}</el-descriptions-item>
        </el-descriptions>

        <div class="section-title">产品明细</div>
        <el-table :data="detail.itemList || []" border style="width: 100%">
          <el-table-column label="#" width="60" type="index" />
          <el-table-column label="产品名称" prop="productName" min-width="160" show-overflow-tooltip />
          <el-table-column label="对客产品名称" prop="customerProductName" min-width="160" show-overflow-tooltip />
          <el-table-column label="规格型号" prop="spec" min-width="140" show-overflow-tooltip />
          <el-table-column label="材质" prop="material" min-width="100" show-overflow-tooltip />
          <el-table-column label="数量" prop="quantity" width="100" />
          <el-table-column label="单价" width="140">
            <template v-slot="{ row }">{{ formatAmount(row.unitPrice) }}</template>
          </el-table-column>
          <el-table-column label="行金额" width="140">
            <template v-slot="{ row }">
              <span class="row-total">{{ formatAmount(row.totalPrice) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="行备注" prop="remark" min-width="140" show-overflow-tooltip />
        </el-table>

        <div class="item-footer">
          <span>产品合计：<strong>{{ (detail.itemList || []).length }}</strong> 项</span>
          <span class="total-amount">报价总金额：<strong>{{ formatAmount(detail.totalAmount) }}</strong></span>
        </div>

        <div class="detail-actions">
          <el-button v-if="detail.status === 'DRAFT'" @click="handleEdit">编辑</el-button>
          <el-button v-if="detail.status === 'DRAFT'" type="primary" @click="handlePublish">发布</el-button>
          <el-button v-if="detail.status !== 'CANCELLED'" type="danger" plain @click="handleCancel">作废</el-button>
          <el-button @click="handleClone">克隆</el-button>
          <el-button :loading="exportingExcel" @click="handleExportExcel">导出 Excel</el-button>
          <el-button :loading="exportingPdf" @click="handleExportPdf">导出 PDF</el-button>
        </div>

        <div class="section-title" style="margin-top: 30px;">版本历史</div>
        <el-table v-loading="historyLoading" :data="versionHistory" border style="width: 100%">
          <el-table-column label="版本号" width="100">
            <template v-slot="{ row }">v{{ row.versionNo }}</template>
          </el-table-column>
          <el-table-column label="操作类型" width="120" prop="operationType" />
          <el-table-column label="操作人" width="120" prop="operatorName" />
          <el-table-column label="变更摘要" prop="changeSummary" min-width="200" show-overflow-tooltip />
          <el-table-column label="该版本备注" prop="remark" min-width="160" show-overflow-tooltip />
          <el-table-column label="总金额" width="140">
            <template v-slot="{ row }">{{ formatAmount(row.totalAmount) }}</template>
          </el-table-column>
          <el-table-column label="创建时间" width="170">
            <template v-slot="{ row }">{{ formatTime(row.createTime) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template v-slot="{ row }">
              <el-button type="text" @click="handleCloneFromVersion(row)">从此版本克隆</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import {
  getQuotationById,
  publishQuotation,
  cancelQuotation,
  cloneQuotation,
  exportQuotationExcel,
  exportQuotationPdf,
  getQuotationVersionHistory,
  cloneQuotationFromVersion
} from '@/api/quotation'

const STATUS_MAP = {
  DRAFT: { label: '草稿', type: 'info' },
  CONFIRMED: { label: '正式报价', type: 'success' },
  CANCELLED: { label: '已作废', type: 'danger' }
}

export default {
  name: 'QuotationDetail',
  data() {
    return {
      loading: false,
      historyLoading: false,
      exportingExcel: false,
      exportingPdf: false,
      detail: null,
      versionHistory: []
    }
  },
  created() {
    this.loadDetail()
    this.loadVersionHistory()
  },
  methods: {
    formatTime(val) {
      if (val === null || val === undefined || val === '') return '-'
      const d = dayjs(val)
      return d.isValid() ? d.format('YYYY-MM-DD HH:mm:ss') : String(val)
    },
    formatAmount(val) {
      if (val === null || val === undefined) return '-'
      return '¥ ' + Number(val).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    getStatusType(status) {
      return STATUS_MAP[status] ? STATUS_MAP[status].type : 'info'
    },
    getStatusLabel(status) {
      return STATUS_MAP[status] ? STATUS_MAP[status].label : status
    },
    loadDetail() {
      const id = this.$route.params.id
      if (!id) {
        this.$message.error('缺少报价单ID')
        this.goBack()
        return
      }
      this.loading = true
      getQuotationById({ id }).then((res) => {
        this.detail = res.data
      }).catch(() => {
        this.$message.error('加载报价单详情失败')
      }).finally(() => {
        this.loading = false
      })
    },
    loadVersionHistory() {
      const id = this.$route.params.id
      if (!id) return
      this.historyLoading = true
      getQuotationVersionHistory({ id }).then((res) => {
        this.versionHistory = res.data || []
      }).catch(() => {}).finally(() => {
        this.historyLoading = false
      })
    },
    handleEdit() {
      this.$router.push({
        name: 'QuotationEdit',
        params: { id: this.detail.id }
      })
    },
    async handlePublish() {
      try {
        await this.$confirm(`确定发布报价单【${this.detail.quotationNo}】吗？`, '系统提示', { type: 'warning' })
        await publishQuotation({ id: this.detail.id })
        this.$message.success('发布成功')
        this.loadDetail()
      } catch (e) {
        console.log(e)
      }
    },
    async handleCancel() {
      try {
        await this.$confirm(`确定作废报价单【${this.detail.quotationNo}】吗？`, '系统提示', { type: 'warning' })
        await cancelQuotation({ id: this.detail.id })
        this.$message.success('作废成功')
        this.loadDetail()
      } catch (e) {
        console.log(e)
      }
    },
    async handleClone() {
      try {
        await this.$confirm(`确定克隆报价单【${this.detail.quotationNo}】吗？`, '系统提示', { type: 'warning' })
        const res = await cloneQuotation({ sourceId: this.detail.id })
        this.$message.success('克隆成功')
        this.$router.push({
          name: 'QuotationDetail',
          params: { id: res.data.id }
        })
      } catch (e) {
        console.log(e)
      }
    },
    async handleExportExcel() {
      this.exportingExcel = true
      try {
        const res = await exportQuotationExcel({ id: this.detail.id })
        const blob = res.data
        if (blob.type && blob.type.includes('application/json')) {
          const text = await blob.text()
          const json = JSON.parse(text)
          this.$message.error(json.message || '导出失败')
          return
        }
        const disposition = res.headers['content-disposition']
        let filename = `报价单_${this.detail.quotationNo || this.detail.id}.xlsx`
        if (disposition) {
          const match = /filename\*?=(?:UTF-8'')?([^;\n]+)/i.exec(disposition)
          if (match && match[1]) {
            filename = decodeURIComponent(match[1].replace(/['"]/g, '').trim())
          }
        }
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        this.$message.success('导出成功')
      } catch (e) {
        console.log(e)
      } finally {
        this.exportingExcel = false
      }
    },
    async handleExportPdf() {
      this.exportingPdf = true
      try {
        const res = await exportQuotationPdf({ id: this.detail.id })
        const blob = res.data
        if (blob.type && blob.type.includes('application/json')) {
          const text = await blob.text()
          const json = JSON.parse(text)
          this.$message.error(json.message || '导出失败')
          return
        }
        const disposition = res.headers['content-disposition']
        let filename = `报价单_${this.detail.quotationNo || this.detail.id}.pdf`
        if (disposition) {
          const match = /filename\*?=(?:UTF-8'')?([^;\n]+)/i.exec(disposition)
          if (match && match[1]) {
            filename = decodeURIComponent(match[1].replace(/['"]/g, '').trim())
          }
        }
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        this.$message.success('导出成功')
      } catch (e) {
        console.log(e)
      } finally {
        this.exportingPdf = false
      }
    },
    async handleCloneFromVersion(row) {
      try {
        await this.$confirm(`确定从版本 v${row.versionNo} 克隆报价单吗？`, '系统提示', { type: 'warning' })
        const res = await cloneQuotationFromVersion({ id: row.id })
        this.$message.success('克隆成功')
        this.$router.push({
          name: 'QuotationDetail',
          params: { id: res.data.id }
        })
      } catch (e) {
        console.log(e)
      }
    },
    goBack() {
      this.$router.push({ name: 'QuotationList' })
    }
  }
}
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}
.amount-text {
  font-weight: 600;
  color: #409eff;
}
.row-total {
  font-weight: 600;
  color: #303133;
}
.item-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 30px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
  font-size: 15px;
}
.total-amount {
  font-size: 18px;
  color: #409eff;
  strong {
    font-size: 22px;
  }
}
.detail-actions {
  margin-top: 20px;
  text-align: center;
}
</style>
