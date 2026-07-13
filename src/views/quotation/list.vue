<template>
  <div class="app-container">
    <div class="search-panel">
      <el-button icon="el-icon-plus" type="primary" @click="create">创建报价单</el-button>
      <el-form inline :model="queryForm" class="mt-4">
        <el-form-item label="ID">
          <el-input v-model="queryForm.id" clearable placeholder="请输入ID" />
        </el-form-item>
        <el-form-item label="报价单号">
          <el-input v-model="queryForm.quotationNo" clearable placeholder="请输入报价单号" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" clearable placeholder="请选择">
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="客户">
          <el-select v-model="queryForm.customerId" clearable filterable placeholder="请选择客户">
            <el-option
              v-for="item in customerList"
              :key="item.id"
              :label="item.customerName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="客户名称">
          <el-input v-model="queryForm.customerName" clearable placeholder="模糊查询" />
        </el-form-item>
        <el-form-item label="产品名称">
          <el-input v-model="queryForm.productName" clearable placeholder="模糊查询" />
        </el-form-item>
        <el-form-item label="规格型号">
          <el-input v-model="queryForm.spec" clearable placeholder="模糊查询" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="query">查询</el-button>
          <el-button icon="el-icon-refresh" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="list-panel">
      <el-table v-loading="loading" :data="tableData">
        <el-table-column label="ID" min-width="100">
          <template v-slot="{ row }">
            <copy-text :value="row.id" />
          </template>
        </el-table-column>
        <el-table-column label="报价单号" prop="quotationNo" min-width="160" show-overflow-tooltip />
        <el-table-column label="客户名称" prop="customerName" min-width="140" show-overflow-tooltip />
        <el-table-column label="产品名称" min-width="140" show-overflow-tooltip>
          <template v-slot="{ row }">
            {{ (row.itemList && row.itemList.length) ? row.itemList[0].productName : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="规格型号" min-width="140" show-overflow-tooltip>
          <template v-slot="{ row }">
            {{ (row.itemList && row.itemList.length) ? row.itemList[0].spec : '-' }}
          </template>
        </el-table-column>
        <el-table-column label="总金额" min-width="120">
          <template v-slot="{ row }">
            <span class="amount-text">{{ formatAmount(row.totalAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="100">
          <template v-slot="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="版本号" min-width="80">
          <template v-slot="{ row }">v{{ row.versionNo }}</template>
        </el-table-column>
        <el-table-column label="负责业务员" prop="businessPersonName" min-width="110" show-overflow-tooltip />
        <el-table-column label="创建时间" min-width="170" show-overflow-tooltip>
          <template v-slot="{ row }">{{ formatTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="更新时间" min-width="170" show-overflow-tooltip>
          <template v-slot="{ row }">{{ formatTime(row.updateTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template v-slot="{ row }">
            <el-button type="text" @click="detail(row)">详情</el-button>
            <el-button
              v-if="row.status === 'DRAFT'"
              type="text"
              @click="edit(row)"
            >编辑</el-button>
            <el-button
              v-if="row.status === 'DRAFT'"
              type="text"
              @click="publish(row)"
            >发布</el-button>
            <el-button
              v-if="row.status !== 'CANCELLED'"
              type="text"
              @click="cancel(row)"
            >作废</el-button>
            <el-button type="text" @click="clone(row)">克隆</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-4 text-right">
        <el-pagination
          background
          :current-page="pageConfig.page"
          :total="pageConfig.total"
          @size-change="sizeChange"
          @current-change="pageChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { queryQuotationPage, publishQuotation, cancelQuotation, cloneQuotation } from '@/api/quotation'
import { queryCustomerList } from '@/api/customer'

const STATUS_MAP = {
  DRAFT: { label: '草稿', type: 'info' },
  CONFIRMED: { label: '正式报价', type: 'success' },
  CANCELLED: { label: '已作废', type: 'danger' }
}

export default {
  name: 'QuotationList',
  data() {
    return {
      statusOptions: Object.entries(STATUS_MAP).map(([value, { label }]) => ({ value, label })),
      queryForm: {
        id: '',
        quotationNo: '',
        status: '',
        customerId: '',
        customerName: '',
        productName: '',
        spec: ''
      },
      customerList: [],
      loading: false,
      tableData: [],
      pageConfig: {
        page: 1,
        size: 20,
        total: 0
      }
    }
  },
  created() {
    this.loadCustomerList()
    this.getList()
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
    loadCustomerList() {
      queryCustomerList({}).then((res) => {
        this.customerList = res.data || []
      }).catch(() => {})
    },
    buildListQueryBody() {
      return {
        id: this.queryForm.id || undefined,
        quotationNo: this.queryForm.quotationNo || undefined,
        status: this.queryForm.status || undefined,
        customerId: this.queryForm.customerId || undefined,
        customerName: this.queryForm.customerName || undefined,
        productName: this.queryForm.productName || undefined,
        spec: this.queryForm.spec || undefined
      }
    },
    getList() {
      this.loading = true
      queryQuotationPage({
        queryParam: {
          ...this.buildListQueryBody()
        },
        pageParam: {
          page: this.pageConfig.page,
          size: this.pageConfig.size
        }
      })
        .then((res) => {
          this.tableData = res.data.records
          this.pageConfig.total = res.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    query() {
      this.pageConfig.page = 1
      this.getList()
    },
    reset() {
      this.queryForm = {
        id: '',
        quotationNo: '',
        status: '',
        customerId: '',
        customerName: '',
        productName: '',
        spec: ''
      }
      this.pageConfig.page = 1
      this.getList()
    },
    create() {
      this.$router.push({ name: 'QuotationCreate' })
    },
    detail(row) {
      this.$router.push({
        name: 'QuotationDetail',
        params: { id: row.id }
      })
    },
    edit(row) {
      this.$router.push({
        name: 'QuotationEdit',
        params: { id: row.id }
      })
    },
    async publish(row) {
      try {
        await this.$confirm(`确定发布报价单【${row.quotationNo}】吗？`, '系统提示', { type: 'warning' })
        await publishQuotation({ id: row.id })
        this.$message.success('发布成功')
        this.getList()
      } catch (e) {
        console.log(e)
      }
    },
    async cancel(row) {
      try {
        await this.$confirm(`确定作废报价单【${row.quotationNo}】吗？`, '系统提示', { type: 'warning' })
        await cancelQuotation({ id: row.id })
        this.$message.success('作废成功')
        this.getList()
      } catch (e) {
        console.log(e)
      }
    },
    async clone(row) {
      try {
        await this.$confirm(`确定克隆报价单【${row.quotationNo}】吗？`, '系统提示', { type: 'warning' })
        const res = await cloneQuotation({ sourceId: row.id })
        this.$message.success('克隆成功')
        this.$router.push({
          name: 'QuotationDetail',
          params: { id: res.data.id }
        })
      } catch (e) {
        console.log(e)
      }
    },
    sizeChange(v) {
      this.pageConfig.size = v
      this.query()
    },
    pageChange(v) {
      this.pageConfig.page = v
      this.getList()
    }
  }
}
</script>

<style lang="scss" scoped>
.amount-text {
  font-weight: 600;
  color: #409eff;
}
</style>
