<template>
  <div class="app-container">
    <div class="search-panel">
      <el-button icon="el-icon-plus" type="primary" @click="create">创建</el-button>
      <el-form inline :model="queryForm" class="mt-4">
        <el-form-item label="工单名称">
          <el-input v-model="queryForm.name" placeholder="请输入工单名称进行模糊查询" class="w-64" clearable />
        </el-form-item>
        <el-form-item label="工单级别">
          <el-select v-model="queryForm.grade" placeholder="请选择工单级别" clearable>
            <el-option v-for="n in Object.keys(config.gradeMap)" :key="n" :value="n" :label="config.gradeMap[n]" />
          </el-select>
        </el-form-item>
        <el-form-item label="工单类型">
          <el-select v-model="queryForm.type" placeholder="请选择工单类型" clearable>
            <el-option v-for="n in Object.keys(config.typeMap)" :key="n" :value="n" :label="config.typeMap[n]" />
          </el-select>
        </el-form-item>
        <el-form-item label="工单状态">
          <el-select v-model="queryForm.status" placeholder="请选择工单状态" clearable>
            <el-option v-for="n in Object.keys(config.statusMap)" :key="n" :value="n" :label="config.statusMap[n]" />
          </el-select>
        </el-form-item>
        <el-form-item label="产品名称">
          <el-input v-model="queryForm.productName" placeholder="请输入产品名称进行模糊查询" class="w-64" clearable />
        </el-form-item>
        <el-form-item label="需求日期">
          <el-date-picker
            v-model="queryForm.needDate"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="queryForm.createTime"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="query">查询</el-button>
          <el-button icon="el-icon-refresh" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="list-panel">
      <el-table v-loading="loading" :data="tableData">
        <!-- <el-table-column label="工单编号" prop="code" min-width="120" show-overflow-tooltip /> -->
        <el-table-column label="工单编号 / 工单名称" prop="name" min-width="160" show-overflow-tooltip>
          <template v-slot="{ row }">
            <span>{{ row.code }}</span>
            <br>
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="工单级别" min-width="90">
          <template v-slot="{ row }">
            <el-tag :type="config.gradeTypeMap[row.grade]">{{ config.gradeMap[row.grade] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="工单类型" min-width="90">
          <template v-slot="{ row }">
            <span>{{ config.typeMap[row.type] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="工单状态" min-width="90">
          <template v-slot="{ row }">
            <el-tag :type="config.statusTypeMap[row.status]">{{ config.statusMap[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="产品名称" prop="productInfo.name" min-width="180" show-overflow-tooltip />
        <el-table-column label="完成数量 / 生产数量" min-width="140">
          <template v-slot="{ row }">
            <span><span :style="{ color: row.completeCount === 0 ? '#F56C6C' : row.completeCount === row.completeCount ? '#67C23A' : '#409EFF' }">{{ row.completeCount }}</span> / {{ row.count }}</span>
          </template>
        </el-table-column>
        <el-table-column label="需求日期" prop="needDate" min-width="90" />
        <el-table-column label="备注" prop="remark" min-width="150" show-overflow-tooltip />
        <el-table-column label="创建时间" prop="createTime" min-width="150" />
        <el-table-column label="更新时间" prop="updateTime" min-width="150" />
        <el-table-column label="操作" width="240" fixed="right">
          <template v-slot="{ row }">
            <el-button type="text" @click="detail(row)">详情</el-button>
            <el-button type="text" :disabled="row.status !== 'create'" @click="update(row)">修改</el-button>
            <el-button type="text" :disabled="row.status !== 'create'" @click="del(row)">删除</el-button>
            <el-button type="text" :disabled="row.status !== 'executed'" @click="send(row)">发货</el-button>
            <el-button type="text" @click="printWorkOrder(row)">打印</el-button>
            <div v-if="hasPermission">
              <el-button type="text" @click="update(row, true)">强制修改</el-button>
              <el-button type="text" @click="del(row, true)">强制删除</el-button>
            </div>
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
    <create ref="createRef" @success="getList" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import config from './config'
import { getWorkOrderPage, deleteWorkOrder, forceDeleteWorkOrder, deliveryOrder } from '@/api/workOrder'
import Create from './create'

export default {
  name: 'WorkOrderList',
  components: {
    Create
  },
  data() {
    return {
      queryForm: {
        name: '',
        grade: '',
        type: '',
        status: '',
        productName: '',
        needDate: [],
        createTime: []
      },
      loading: false,
      tableData: [],
      pageConfig: {
        page: 1,
        size: 20,
        total: 0
      },
      config,
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      p: {}
    }
  },
  computed: {
    ...mapGetters(['roles']),
    hasPermission() {
      return this.roles.includes('Admin')
    }
  },
  created() {
    console.log('created')
    this.getList()
    console.log(this.roles)
  },
  methods: {
    // 缓存查询条件,详情页返回时使用
    handleCacheQueryParams() {
      const sp = sessionStorage.getItem('p')
      if (sp) {
        const p = JSON.parse(sp)
        this.pageConfig.page = p.pageParam.page || 1
        this.pageConfig.size = p.pageParam.size || 20
        this.queryForm.name = p.queryParam.name || ''
        this.queryForm.grade = p.queryParam.grade || ''
        this.queryForm.type = p.queryParam.type || ''
        this.queryForm.status = p.queryParam.status || ''
        this.queryForm.productName = p.queryParam.productInfoName || ''
        this.queryForm.needDate = p.queryParam.needDateStart ? [p.queryParam.needDateStart, p.queryParam.needDateEnd] : []
        this.queryForm.createTime = p.queryParam.createTimeStart ? [p.queryParam.createTimeStart, p.queryParam.createTimeEnd] : []
      }
    },
    getList() {
      this.handleCacheQueryParams()
      this.loading = true
      const p = {
        queryParam: {
          name: this.queryForm.name || undefined,
          grade: this.queryForm.grade || undefined,
          type: this.queryForm.type || undefined,
          status: this.queryForm.status || undefined,
          productInfoName: this.queryForm.productName || undefined,
          needDateStart: this.queryForm.needDate?.[0] || undefined,
          needDateEnd: this.queryForm.needDate?.[1] || undefined,
          createTimeStart: this.queryForm.createTime?.[0] || undefined,
          createTimeEnd: this.queryForm.createTime?.[1] || undefined
        },
        pageParam: {
          page: this.pageConfig.page,
          size: this.pageConfig.size
        }
      }
      this.p = p
      getWorkOrderPage(p).then(res => {
        console.log(res)
        this.tableData = res.data.records
        this.pageConfig.total = res.data.total
        this.loading = false
        sessionStorage.clear()
      })
    },
    query() {
      this.pageConfig.page = 1
      this.getList()
    },
    reset() {
      this.queryForm = {
        name: '',
        grade: '',
        type: '',
        status: '',
        productName: '',
        needDate: [],
        createTime: []
      }
      this.pageConfig.page = 1
      this.getList()
    },
    create() {
      this.$refs.createRef.open()
    },
    update(row, isForce) {
      this.$refs.createRef.open(row, isForce)
    },
    async del(row, isForce) {
      try {
        await this.$confirm(isForce ? '确定强制删除该工单吗？删除后无法恢复。' : '确定删除该工单吗？删除后无法恢复。', '系统提示', {
          type: 'warning'
        })
        if (isForce) {
          await forceDeleteWorkOrder({
            id: row.id
          })
        } else {
          await deleteWorkOrder({
            id: row.id
          })
        }
        this.$message.success({
          message: '删除成功',
          type: 'success'
        })
        this.getList()
      } catch (error) {
        console.log(error)
      }
    },
    async send(row) {
      try {
        await this.$confirm('是否确认发货？请确保线下发货后再进行该操作。', '系统提示', {
          type: 'warning'
        })
        await deliveryOrder({
          id: row.id
        })
        this.$message.success({
          message: '操作成功',
          type: 'success'
        })
        this.getList()
      } catch (error) {
        console.log(error)
      }
    },
    detail(row) {
      // 缓存查询条件
      sessionStorage.setItem('p', JSON.stringify(this.p))
      this.$router.push({
        name: 'WorkOrderDetail',
        params: {
          id: row.id
        }
      })
    },
    printWorkOrder(row) {
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        this.$message.warning('请允许浏览器弹窗后再重试打印')
        return
      }
      const fields = this.buildPrintFields(row)
      const html = `
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>工单打印</title>
            <style>
              * { box-sizing: border-box; }
              @page { size: A6 portrait; margin: 6mm; }
              html, body {
                width: 100%;
                margin: 0;
                padding: 0;
                background: #fff;
                color: #303133;
                font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
              }
              .print-sheet {
                width: 100%;
                border: 1px solid #ebeef5;
                border-radius: 4px;
                overflow: hidden;
              }
              .print-row {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                min-height: 28px;
                padding: 8px 10px;
                border-bottom: 1px solid #ebeef5;
                font-size: 12px;
                line-height: 1.4;
              }
              .print-row:last-child { border-bottom: none; }
              .print-label {
                color: #303133;
                margin-right: 8px;
                white-space: nowrap;
              }
              .print-value {
                color: #909399;
                text-align: right;
                margin-left: 10px;
                word-break: break-all;
              }
              .tag {
                display: inline-block;
                border-radius: 3px;
                padding: 1px 6px;
                color: #fff;
                font-size: 11px;
                line-height: 16px;
              }
              .tag-primary { background: #409eff; }
              .tag-danger { background: #f56c6c; }
              .tag-warning { background: #e6a23c; }
              .tag-info {
                color: #409eff;
                background: #ecf5ff;
                border: 1px solid #b3d8ff;
              }
              @media print {
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              }
            </style>
          </head>
          <body>
            <div class="print-sheet">
              ${fields.map(field => `
                <div class="print-row">
                  <span class="print-label">${field.label}</span>
                  <span class="print-value">${field.value}</span>
                </div>
              `).join('')}
            </div>
          </body>
        </html>
      `
      printWindow.document.open()
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 300)
    },
    buildPrintFields(row) {
      const safeText = (value) => {
        const text = value === null || value === undefined || value === '' ? '-' : String(value)
        return text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
      }
      const gradeTypeMap = {
        primary: 'tag-primary',
        danger: 'tag-danger'
      }
      const statusTypeMap = {
        warning: 'tag-warning',
        info: 'tag-info',
        primary: 'tag-primary',
        danger: 'tag-danger'
      }
      const gradeType = gradeTypeMap[this.config.gradeTypeMap[row.grade]] || 'tag-primary'
      const statusType = statusTypeMap[this.config.statusTypeMap[row.status]] || 'tag-primary'
      const spec = row.productInfo?.specification || row.productInfo?.spec || row.productInfo?.model || row.productInfo?.code || '-'
      return [
        { label: '工单编号', value: safeText(row.code) },
        { label: '工单名称', value: safeText(row.name) },
        { label: '工单级别', value: `<span class="tag ${gradeType}">${safeText(this.config.gradeMap[row.grade] || '-')}</span>` },
        { label: '工单类型', value: `<span class="tag tag-danger">${safeText(this.config.typeMap[row.type] || '-')}</span>` },
        { label: '产品名称', value: safeText(row.productInfo?.name) },
        { label: '规格型号', value: safeText(spec) },
        { label: '完成数量 / 生产数量', value: safeText(`${row.completeCount || 0} / ${row.count || 0}`) },
        { label: '生产状态', value: `<span class="tag ${statusType}">${safeText(this.config.statusMap[row.status] || '-')}</span>` },
        { label: '截止时间', value: safeText(row.needDate) },
        { label: '备注', value: safeText(row.remark) }
      ]
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

<style lang="scss" scoped></style>
