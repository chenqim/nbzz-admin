<template>
  <div class="app-container">
    <div class="search-panel">
      <el-button
        icon="el-icon-plus"
        type="primary"
        @click="create"
      >创建</el-button>
      <el-button
        icon="el-icon-upload2"
        :loading="exporting"
        @click="exportExcel"
      >导出工单</el-button>
      <el-form inline :model="queryForm" class="mt-4">
        <el-form-item label="工单编号">
          <el-input
            v-model="queryForm.code"
            placeholder="请输入工单编号进行模糊查询"
            class="w-64"
            clearable
          />
        </el-form-item>
        <el-form-item label="工单名称">
          <el-input
            v-model="queryForm.name"
            placeholder="请输入工单名称进行模糊查询"
            class="w-64"
            clearable
          />
        </el-form-item>
        <el-form-item label="工单级别">
          <el-select
            v-model="queryForm.grade"
            placeholder="请选择工单级别"
            clearable
          >
            <el-option
              v-for="n in Object.keys(config.gradeMap)"
              :key="n"
              :value="n"
              :label="config.gradeMap[n]"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="工单类型">
          <el-select
            v-model="queryForm.type"
            placeholder="请选择工单类型"
            clearable
          >
            <el-option
              v-for="n in Object.keys(config.typeMap)"
              :key="n"
              :value="n"
              :label="config.typeMap[n]"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="工单状态">
          <el-select
            v-model="queryForm.status"
            placeholder="请选择工单状态"
            clearable
          >
            <el-option
              v-for="n in Object.keys(config.statusMap)"
              :key="n"
              :value="n"
              :label="config.statusMap[n]"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="产品名称">
          <el-input
            v-model="queryForm.productName"
            placeholder="请输入产品名称进行模糊查询"
            class="w-64"
            clearable
          />
        </el-form-item>
        <el-form-item label="员工姓名">
          <el-select
            v-model="queryForm.userId"
            placeholder="请选择员工姓名"
            filterable
            clearable
          >
            <el-option
              v-for="n in userList"
              :key="n.id"
              :value="n.id"
              :label="n.userName"
            />
          </el-select>
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
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="query"
          >查询</el-button>
          <el-button icon="el-icon-refresh" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="list-panel">
      <el-table v-loading="loading" :data="tableData">
        <!-- <el-table-column label="工单编号" prop="code" min-width="120" show-overflow-tooltip /> -->
        <el-table-column
          label="工单编号 / 工单名称"
          prop="name"
          min-width="160"
          show-overflow-tooltip
        >
          <template v-slot="{ row }">
            <span>{{ row.code }}</span>
            <br>
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="工单级别" min-width="90">
          <template v-slot="{ row }">
            <el-tag :type="config.gradeTypeMap[row.grade]">{{
              config.gradeMap[row.grade]
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="工单类型" min-width="90">
          <template v-slot="{ row }">
            <span>{{ config.typeMap[row.type] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="工单状态" min-width="90">
          <template v-slot="{ row }">
            <el-tag :type="config.statusTypeMap[row.status]">{{
              config.statusMap[row.status]
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="产品名称"
          prop="productInfo.name"
          min-width="180"
          show-overflow-tooltip
        />
        <el-table-column label="完成数量 / 生产数量" min-width="140">
          <template v-slot="{ row }">
            <span><span
              :style="{
                color:
                  row.completeCount === 0
                    ? '#F56C6C'
                    : row.completeCount === row.completeCount
                      ? '#67C23A'
                      : '#409EFF',
              }"
            >{{ row.completeCount }}</span>
              / {{ row.count }}</span>
          </template>
        </el-table-column>
        <el-table-column label="需求日期" prop="needDate" min-width="90" />
        <el-table-column
          label="备注"
          prop="remark"
          min-width="150"
          show-overflow-tooltip
        />
        <el-table-column label="创建时间" prop="createTime" min-width="150" />
        <el-table-column label="更新时间" prop="updateTime" min-width="150" />
        <el-table-column label="操作" width="240" fixed="right">
          <template v-slot="{ row }">
            <el-button type="text" @click="detail(row)">详情</el-button>
            <el-button
              type="text"
              :disabled="row.status !== 'create'"
              @click="update(row)"
            >修改</el-button>
            <el-button
              type="text"
              :disabled="row.status !== 'create'"
              @click="del(row)"
            >删除</el-button>
            <el-button
              type="text"
              :disabled="row.status !== 'executed'"
              @click="send(row)"
            >发货</el-button>
            <el-button type="text" @click="printWorkOrder(row)">打印</el-button>
            <div v-if="hasPermission">
              <el-button
                type="text"
                @click="update(row, true)"
              >强制修改</el-button>
              <el-button
                type="text"
                @click="del(row, true)"
              >强制删除</el-button>
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
    <el-dialog
      title="发货"
      :visible.sync="deliveryDialogVisible"
      width="480px"
      append-to-body
      @close="resetDeliveryForm"
    >
      <el-alert
        title="请确保线下发货后再进行该操作。"
        type="warning"
        :closable="false"
        class="mb-4"
      />
      <el-form
        ref="deliveryFormRef"
        :model="deliveryForm"
        :rules="dynamicDeliveryRules"
        label-width="100px"
      >
        <el-form-item label="报废数量" prop="scrapCount">
          <el-input-number
            v-model="deliveryForm.scrapCount"
            :min="0"
            :max="deliveryRow?.count || 1000000"
            :precision="0"
            controls-position="right"
            class="w-full"
          />
        </el-form-item>
        <el-form-item label="发货类型" prop="trackingType">
          <el-radio-group v-model="deliveryForm.trackingType">
            <!-- <el-radio label="1">上门自提</el-radio>
            <el-radio label="2">送货上门</el-radio>
            <el-radio label="3">快递发货</el-radio> -->
            <el-radio v-for="n in Object.keys(config.trackingTypeMap)" :key="n" :label="n">{{ config.trackingTypeMap[n] }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="dateLabel" prop="deliveryDate">
          <el-date-picker
            v-model="deliveryForm.deliveryDate"
            type="date"
            :placeholder="datePlaceholer"
            value-format="yyyy-MM-dd"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="numberLabel" prop="trackingNumber">
          <el-input
            v-model="deliveryForm.trackingNumber"
            :placeholder="numberPlaceholder"
            clearable
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deliveryDialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          :loading="deliverySubmitting"
          @click="submitDelivery"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import config from './config'
import {
  getWorkOrderPage,
  exportWorkOrderExcel,
  deleteWorkOrder,
  forceDeleteWorkOrder,
  deliveryOrder
} from '@/api/workOrder'
import { getStaffList } from '@/api/staff'
import dayjs from 'dayjs'
import Create from './create'

export default {
  name: 'WorkOrderList',
  components: {
    Create
  },
  data() {
    return {
      queryForm: {
        code: '',
        name: '',
        grade: '',
        type: '',
        status: '',
        productName: '',
        userId: '',
        needDate: [],
        createTime: []
      },
      userList: [],
      loading: false,
      exporting: false,
      tableData: [],
      pageConfig: {
        page: 1,
        size: 20,
        total: 0
      },
      config,
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      deliveryDialogVisible: false,
      deliverySubmitting: false,
      deliveryRow: null,
      deliveryForm: {
        scrapCount: 0,
        trackingType: '',
        deliveryDate: '',
        trackingNumber: ''
      },
      deliveryRules: {
        scrapCount: [
          { required: true, message: '请输入报废数量', trigger: 'change' }
        ],
        trackingType: [
          { required: true, message: '请选择发货类型', trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['roles']),
    hasPermission() {
      return this.roles.includes('Admin')
    },
    dateLabel() {
      return this.deliveryForm.trackingType === '3' ? '发货日期' : this.deliveryForm.trackingType === '2' ? '送货日期' : '自提日期'
    },
    datePlaceholer() {
      return this.deliveryForm.trackingType === '3' ? '请选择发货日期' : this.deliveryForm.trackingType === '2' ? '请选择送货日期' : '请选择自提日期'
    },
    numberLabel() {
      return this.deliveryForm.trackingType === '3' ? '快递单号' : this.deliveryForm.trackingType === '2' ? '送货人员' : '自提人员'
    },
    numberPlaceholder() {
      return this.deliveryForm.trackingType === '3' ? '请输入快递单号' : this.deliveryForm.trackingType === '2' ? '请输入送货人员' : '请输入自提人员'
    },
    dynamicDeliveryRules() {
      return {
        ...this.deliveryRules,
        deliveryDate: [
          { required: true, message: this.datePlaceholer, trigger: 'change' }
        ],
        trackingNumber: [
          { required: true, message: this.numberPlaceholder, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.getUserList()
  },
  methods: {
    buildListQueryBody() {
      return {
        code: this.queryForm.code || undefined,
        name: this.queryForm.name || undefined,
        grade: this.queryForm.grade || undefined,
        type: this.queryForm.type || undefined,
        status: this.queryForm.status || undefined,
        productInfoName: this.queryForm.productName || undefined,
        userId: this.queryForm.userId || undefined,
        needDateStart: this.queryForm.needDate?.[0] || undefined,
        needDateEnd: this.queryForm.needDate?.[1] || undefined,
        createTimeStart: this.queryForm.createTime?.[0] || undefined,
        createTimeEnd: this.queryForm.createTime?.[1] || undefined
      }
    },
    getList() {
      this.loading = true
      getWorkOrderPage({
        queryParam: {
          ...this.buildListQueryBody()
        },
        pageParam: {
          page: this.pageConfig.page,
          size: this.pageConfig.size
        }
      }).then((res) => {
        this.tableData = res.data.records
        this.pageConfig.total = res.data.total
        this.loading = false
      })
    },
    getUserList() {
      getStaffList({
        page: 1,
        size: 99
      }).then((res) => {
        this.userList = res.data.records
          .filter((n) => {
            return ![
              'admin',
              'chenqiming',
              'SunShunJie',
              'WxTestUser'
            ].includes(n.userAccount)
          })
          .sort((a, b) => {
            return a.userName.localeCompare(b.userName)
          })
      })
    },
    query() {
      this.pageConfig.page = 1
      this.getList()
    },
    reset() {
      this.queryForm = {
        code: '',
        name: '',
        grade: '',
        type: '',
        status: '',
        productName: '',
        userId: '',
        needDate: [],
        createTime: []
      }
      this.pageConfig.page = 1
      this.getList()
    },
    create() {
      this.$refs.createRef.open()
    },
    async exportExcel() {
      this.exporting = true
      try {
        const res = await exportWorkOrderExcel(this.buildListQueryBody())
        const blob = res.data
        if (blob.type && blob.type.includes('application/json')) {
          const text = await blob.text()
          const json = JSON.parse(text)
          this.$message.error(json.message || '导出失败')
          return
        }
        const disposition = res.headers['content-disposition']
        let filename = `工单导出_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`
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
        this.exporting = false
      }
    },
    update(row, isForce) {
      this.$refs.createRef.open(row, isForce)
    },
    async del(row, isForce) {
      try {
        await this.$confirm(
          isForce
            ? '确定强制删除该工单吗？删除后无法恢复。'
            : '确定删除该工单吗？删除后无法恢复。',
          '系统提示',
          {
            type: 'warning'
          }
        )
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
    send(row) {
      this.deliveryRow = row
      this.deliveryForm.scrapCount = 0
      this.deliveryForm.trackingType = '3'
      this.deliveryForm.deliveryDate = dayjs().format('YYYY-MM-DD')
      this.deliveryForm.trackingNumber = ''
      this.deliveryDialogVisible = true
      this.$nextTick(() => {
        this.$refs.deliveryFormRef &&
          this.$refs.deliveryFormRef.clearValidate()
      })
    },
    resetDeliveryForm() {
      this.deliveryRow = null
      this.deliverySubmitting = false
      this.$refs.deliveryFormRef && this.$refs.deliveryFormRef.resetFields()
    },
    submitDelivery() {
      if (!this.deliveryRow) return
      this.$refs.deliveryFormRef.validate(async(valid) => {
        if (!valid) return
        const trackingNumber = (this.deliveryForm.trackingNumber || '').trim()
        if (!trackingNumber) {
          this.$message.warning('请输入快递单号')
          return
        }
        this.deliverySubmitting = true
        try {
          await deliveryOrder({
            id: this.deliveryRow.id,
            scrapCount: this.deliveryForm.scrapCount,
            trackingType: this.deliveryForm.trackingType,
            deliveryDate: this.deliveryForm.deliveryDate,
            trackingNumber
          })
          this.$message.success({
            message: '操作成功',
            type: 'success'
          })
          this.deliveryDialogVisible = false
          this.getList()
        } catch (error) {
          console.log(error)
        } finally {
          this.deliverySubmitting = false
        }
      })
    },
    detail(row) {
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
              ${fields
    .map(
      (field) => `
                <div class="print-row">
                  <span class="print-label">${field.label}</span>
                  <span class="print-value">${field.value}</span>
                </div>
              `
    )
    .join('')}
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
        const text =
          value === null || value === undefined || value === ''
            ? '-'
            : String(value)
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
      const gradeType =
        gradeTypeMap[this.config.gradeTypeMap[row.grade]] || 'tag-primary'
      const statusType =
        statusTypeMap[this.config.statusTypeMap[row.status]] || 'tag-primary'
      const spec =
        row.productInfo?.specification ||
        row.productInfo?.spec ||
        row.productInfo?.model ||
        row.productInfo?.code ||
        '-'
      return [
        { label: '工单编号', value: safeText(row.code) },
        { label: '工单名称', value: safeText(row.name) },
        {
          label: '工单级别',
          value: `<span class="tag ${gradeType}">${safeText(
            this.config.gradeMap[row.grade] || '-'
          )}</span>`
        },
        {
          label: '工单类型',
          value: `<span class="tag tag-danger">${safeText(
            this.config.typeMap[row.type] || '-'
          )}</span>`
        },
        { label: '产品名称', value: safeText(row.productInfo?.name) },
        { label: '规格型号', value: safeText(spec) },
        {
          label: '完成数量 / 生产数量',
          value: safeText(`${row.completeCount || 0} / ${row.count || 0}`)
        },
        {
          label: '生产状态',
          value: `<span class="tag ${statusType}">${safeText(
            this.config.statusMap[row.status] || '-'
          )}</span>`
        },
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

<style lang="scss">
/* tooltip 挂载在 body，需非 scoped；与 Element 默认单行样式对齐 */
.el-tooltip__popper {
  max-width: min(360px, 85vw);
  line-height: 1.5;
  white-space: normal;
  word-break: break-word;
}
</style>
