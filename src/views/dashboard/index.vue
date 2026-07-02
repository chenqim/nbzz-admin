<template>
  <div class="app-container">
    <div style="border: 1px solid #efefef;padding: 16px; border-radius: 5px;">
      <!-- <h1 class="title">工单执行总览</h1>
      <div v-loading="topLoading" class="flex" style="gap: 16px;">
        <el-card v-for="n in list2" :key="n.label" class="w-1/5" :class="n.id ? 'cursor-pointer' : ''" @click.native="openWorkOrderModal(n)">
          <div class="flex">
            <div>
              <i class="fz-60 icon-color" :class="n.class" />
            </div>
            <div class="flex-1 pr-4">
              <div class="label">{{ n.label }}</div>
              <div class="value">{{ n.value }}</div>
            </div>
          </div>
        </el-card>
      </div> -->
      <!-- <h1 class="title mt-4">需求达成率总览</h1> -->
      <div class="flex justify-between items-center mb-4">
        <h1 class="title" style="margin-bottom: 0;">总览</h1>
        <div>
          <el-date-picker
            v-model="dateValue"
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd"
            @change="getAllData"
          />
        </div>
      </div>
      <div v-loading="topLoading" class="flex flex-wrap" style="gap: 12px;">
        <el-card v-for="n in list" :key="n.label" class="card-col" :class="n.id ? 'cursor-pointer' : ''" @click.native="openWorkOrderModal(n)">
          <div class="flex">
            <div>
              <i class="fz-60 icon-color" :class="n.class" />
            </div>
            <div class="flex-1 pr-4">
              <div class="label">{{ n.label }}</div>
              <div class="value">{{ n.value }}</div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
    <h1 class="title mt-4">工单执行情况</h1>
    <div class="search-panel">
      <el-form inline :model="queryForm" class="mt-4">
        <el-form-item label="工单编号">
          <el-input v-model="queryForm.no" placeholder="请输入工单编号进行模糊查询" clearable class="w-64" />
        </el-form-item>
        <el-form-item label="工单名称">
          <el-input v-model="queryForm.name" placeholder="请输入工单名称进行模糊查询" clearable class="w-64" />
        </el-form-item>
        <el-form-item label="产品名称">
          <el-input v-model="queryForm.product" placeholder="请输入产品名称进行模糊查询" clearable class="w-64" />
        </el-form-item>
        <!-- <el-form-item label="工单级别">
          <el-select v-model="queryForm.grade" clearable>
            <el-option v-for="n in Object.keys(config.gradeMap)" :key="n" :value="n" :label="config.gradeMap[n]" />
          </el-select>
        </el-form-item>
        <el-form-item label="工单状态">
          <el-select v-model="queryForm.status" clearable>
            <el-option v-for="n in Object.keys(config.statusMap)" :key="n" :value="n" :label="config.statusMap[n]" />
          </el-select>
        </el-form-item> -->
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="query">查询</el-button>
          <el-button icon="el-icon-refresh" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="list-panel">
      <el-table
        v-loading="loading"
        class="dashboard-lately-order-table"
        :data="tableData"
        :row-class-name="needDateRowClassName"
        border
      >
        <el-table-column label="工单编号 / 工单名称" prop="name" min-width="160" show-overflow-tooltip>
          <template v-slot="{ row }">
            <span>{{ row.code }}</span>
            <br>
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="工单类型" min-width="90">
          <template v-slot="{ row }">
            <span>{{ config.typeMap[row.type] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="产品名称" prop="productInfo.name" min-width="180" show-overflow-tooltip />
        <el-table-column label="需求日期" prop="needDate" min-width="120">
          <template v-slot="{ row }">
            <span style="font-weight: bold;">{{ row.needDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="完成数量 / 生产数量" min-width="130">
          <template v-slot="{ row }">
            <span><span :style="{ color: row.completeCount === 0 ? '#F56C6C' : row.completeCount === row.completeCount ? '#67C23A' : '#409EFF' }">{{ row.completeCount }}</span> / {{ row.count }}</span>
          </template>
        </el-table-column>
        <el-table-column label="工单进度" prop="a" min-width="120">
          <template v-slot="{ row }">
            <span>{{ Number((row.completeCount / row.count).toFixed(2)) * 100 }}%</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="200">
          <template v-slot="{ row }">
            <div class="dashboard-remark-cell">
              <div class="dashboard-remark-cell__text-wrap">
                <el-tooltip
                  popper-class="dashboard-remark-tooltip"
                  placement="top"
                  :content="row.remark ? String(row.remark) : ''"
                  :disabled="!row.remark"
                >
                  <span class="dashboard-remark-cell__text">{{ row.remark || '-' }}</span>
                </el-tooltip>
              </div>
              <el-button
                type="text"
                class="dashboard-remark-cell__edit"
                icon="el-icon-edit-outline"
                style="font-size: 16px;"
                @click.stop="openRemarkDialog(row)"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="工序进度" width="180">
          <template v-slot="{ row }">
            <el-button type="text" @click="processDetail(row)">查看工序进度</el-button>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template v-slot="{ row }">
            <el-button type="text" @click="detail(row)">查看工单详情</el-button>
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
    <el-dialog
      title="工序进度"
      :visible.sync="dialogVisible"
      width="560px"
    >
      <div v-loading="dialogLoading" class="process-progress-list">
        <div v-for="p in ins.procedureList" :key="p.id" class="process-progress-item">
          <div class="process-progress-item__head">
            <div class="process-progress-item__meta">
              <span class="process-progress-item__name">{{ p.workingProcedure.name }}</span>
              <span class="process-progress-item__code">{{ p.workingProcedure.code }}</span>
            </div>
            <span class="process-progress-item__user">{{ p.userName || '暂无认领人' }}</span>
          </div>
          <el-progress
            class="process-progress-item__bar"
            :stroke-width="8"
            :color="customColors"
            :percentage="p.count === 0 ? 0 : Number(((p.completeCount / p.count) * 100).toFixed(0))"
          />
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">关闭</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="修改备注"
      :visible.sync="remarkDialogVisible"
      width="480px"
      append-to-body
      @close="resetRemarkForm"
    >
      <el-form :model="remarkForm" label-width="80px">
        <el-form-item label="备注">
          <el-input
            v-model="remarkForm.remark"
            type="textarea"
            :rows="4"
            resize="none"
            placeholder="请输入备注"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="remarkDialogVisible = false">取 消</el-button>
        <el-button type="primary" :loading="remarkSubmitting" @click="submitRemark">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :title="titleMap[workOrderTitle]"
      :visible.sync="workOrderShow"
      width="80%"
    >
      <el-table v-loading="dialogTableLoading" height="478px" :data="dialogTableData">
        <el-table-column type="index" label="序号" width="60" align="center" fixed="left" />
        <el-table-column label="工单编号 / 工单名称" prop="name" min-width="160" fixed="left" show-overflow-tooltip>
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
        <el-table-column label="需求日期" min-width="100">
          <template v-slot="{ row }">
            <span style="color: red;font-weight: bold;">{{ row.needDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="150" show-overflow-tooltip />
        <el-table-column label="发货方式 / 发货日期" prop="deliveryAttr" min-width="140" fixed="right">
          <template v-slot="{ row }">
            <p v-if="row.deliveryAttr">{{ row.deliveryAttr }}</p>
            <p v-else>-</p>
            <p v-if="row.deliveryDate">{{ row.deliveryDate }}</p>
            <p v-else>-</p>
          </template>
        </el-table-column>
        <!-- <el-table-column label="创建时间" prop="createTime" min-width="150" /> -->
        <!-- <el-table-column label="更新时间" prop="updateTime" min-width="150" /> -->
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="workOrderShow = false">取 消</el-button>
        <el-button type="primary" @click="workOrderShow = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import config from '../workOrder/config.js'
import { queryLatelyByPage, queryOrderAchieveTotal, queryProduceExecuteTotal, getWorkOrderDetail, queryTotalOrderList, updateWorkOrderRemark } from '@/api/workOrder'

export default {
  name: 'Dashboard',
  data() {
    return {
      topLoading: false,
      list: [],
      list2: [],
      dateValue: dayjs().format('YYYY-MM-DD'),
      queryForm: {
        no: '',
        name: '',
        product: ''
      },
      loading: false,
      tableData: [],
      pageConfig: {
        page: 1,
        size: 20,
        total: 0
      },
      config,
      dialogVisible: false,
      ins: {},
      dialogLoading: false,
      customColors: [
        { color: '#f56c6c', percentage: 20 },
        { color: '#e6a23c', percentage: 50 },
        { color: '#409eff', percentage: 99 },
        { color: '#67c23a', percentage: 100 }
      ],
      workOrderShow: false,
      workOrderTitle: '',
      titleMap: {
        circle: '今日在制工单数',
        finsh: '今日完工工单数',
        total: '今日总工单数',
        delivered: '今日已发货',
        pendingDelivered: '今日待发货',
        notFinsh: '今日未完成'
      },
      paramMap: {
        circle: 'artifactOrderCount',
        finsh: 'successOrderCount',
        total: 'totalOrderCount',
        delivered: 'completedOrderCount',
        pendingDelivered: 'executedOrderCount',
        notFinsh: 'processOrderCount'
      },
      dialogTableLoading: false,
      dialogTableData: [],
      remarkDialogVisible: false,
      remarkSubmitting: false,
      remarkRow: null,
      remarkForm: {
        remark: ''
      }
    }
  },
  created() {
    this.getAllData()
    this.getList()
  },
  methods: {
    getAllData() {
      this.topLoading = true
      Promise.all([
        queryOrderAchieveTotal({
          targetDate: this.dateValue
        }),
        queryProduceExecuteTotal({
          targetDate: this.dateValue
        })
      ]).then((result) => {
        const { totalOrderCount, completedOrderCount, executedOrderCount, processOrderCount, completedOrderRatio } = result[0].data
        this.list = [
          { label: '今日总工单数 >', value: totalOrderCount, id: 'total', class: 'el-icon-s-platform' },
          { label: '今日未完成 >', value: processOrderCount, id: 'notFinsh', class: 'el-icon-s-release' },
          { label: '今日在制工单数 >', value: result[1].data.totalOrderCount, id: 'circle', class: 'el-icon-s-order' },
          { label: '今日需求达成率', value: completedOrderRatio + '%', class: 'el-icon-s-flag' },
          { label: '今日待发货 >', value: executedOrderCount, id: 'pendingDelivered', class: 'el-icon-s-goods' },
          { label: '今日已发货 >', value: completedOrderCount, id: 'delivered', class: 'el-icon-s-promotion' }
        ]
        /* const { totalOrderCount, totalWorkerCount, totalArtifactCount, successArtifactCount, successOrderCount } = result[1].data
        this.list2 = [
          { label: '今日在制工单数 >', value: totalOrderCount, id: 'circle', class: 'el-icon-s-order' },
          { label: '今日完工工单数 >', value: successOrderCount, id: 'finsh', class: 'el-icon-s-claim' },
          { label: '今日生产人数', value: totalWorkerCount, class: 'el-icon-s-custom' },
          { label: '今日在制产品数', value: totalArtifactCount, class: 'el-icon-s-shop' },
          { label: '今日完工产品数', value: successArtifactCount, class: 'el-icon-s-claim' }
        ] */
        this.topLoading = false
      })
    },
    getList() {
      this.loading = true
      queryLatelyByPage({
        queryParam: {
          code: this.queryForm.no || undefined,
          name: this.queryForm.name || undefined,
          productInfoName: this.queryForm.product || undefined
        },
        pageParam: {
          page: this.pageConfig.page,
          size: this.pageConfig.size
        }
      }).then(res => {
        console.log(res)
        this.tableData = res.data.records
        this.pageConfig.total = res.data.total
        this.loading = false
      })
    },
    query() {
      this.pageConfig.page = 1
      this.getList()
    },
    reset() {
      this.queryForm = {
        no: '',
        name: '',
        product: ''
      }
      this.pageConfig.page = 1
      this.getList()
    },
    processDetail(row) {
      this.getDetail(row.id)
      this.dialogVisible = true
    },
    cancel() {
      this.dialogVisible = false
      this.ins = {}
    },
    getDetail(id) {
      this.dialogLoading = true
      getWorkOrderDetail({
        id
      }).then(res => {
        this.ins = res.data
        this.dialogLoading = false
      })
    },
    detail(row) {
      this.$router.push({
        // name: 'WorkOrderDetail',
        // params: {
        //   id: row.id
        // }
        path: `/production/workOrder/detail/${row.id}?from=dashboard`
      })
    },
    sizeChange(v) {
      this.pageConfig.size = v
      this.query()
    },
    pageChange(v) {
      this.pageConfig.page = v
      this.getList()
    },
    /**
     * 行底色：全局 overwrite.scss 对 .el-table td 使用了 background !important，
     * row-style / cell-style 的内联背景无法压过，需用 row-class-name + 同权重 !important。
     * needDate 如 2026-04-03 或带时间的字符串，取前 10 位再解析。
     */
    needDateRowClassName({ row }) {
      const suffix = this.getNeedDateRowTone(row)
      return suffix ? `need-date-row--${suffix}` : ''
    },
    getNeedDateRowTone(row) {
      if (!row || row.needDate === undefined || row.needDate === null || row.needDate === '') {
        return ''
      }
      const raw = String(row.needDate).trim()
      const datePart = raw.length >= 10 ? raw.slice(0, 10) : raw
      const need = dayjs(datePart).startOf('day')
      if (!need.isValid()) return ''
      const diffDays = need.diff(dayjs().startOf('day'), 'day')
      if (diffDays > 3) return 'safe'
      if (diffDays >= 0) return 'warn'
      return 'danger'
    },
    openWorkOrderModal(n) {
      if (n.id) {
        this.workOrderShow = true
        this.workOrderTitle = n.id
        this.dialogTableLoading = true
        queryTotalOrderList({
          byType: this.paramMap[this.workOrderTitle],
          targetDate: this.dateValue
        }).then(res => {
          this.dialogTableData = res.data
          this.dialogTableLoading = false
        })
      }
    },
    openRemarkDialog(row) {
      this.remarkRow = row
      this.remarkForm.remark = row.remark || ''
      this.remarkDialogVisible = true
    },
    resetRemarkForm() {
      this.remarkRow = null
      this.remarkSubmitting = false
      this.remarkForm.remark = ''
    },
    async submitRemark() {
      if (!this.remarkRow) return
      this.remarkSubmitting = true
      try {
        const remark = this.remarkForm.remark === undefined || this.remarkForm.remark === null
          ? ''
          : String(this.remarkForm.remark).trim()
        await updateWorkOrderRemark({
          id: this.remarkRow.id,
          count: this.remarkRow.count,
          remark
        })
        this.$message.success({
          message: '修改成功',
          type: 'success'
        })
        this.remarkDialogVisible = false
        this.getList()
      } catch (error) {
        console.log(error)
      } finally {
        this.remarkSubmitting = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
.icon-color {
  color: #409EFF;
}
.card-col {
  width: calc(33.333% - 8px);
}
.fz-60 {
  font-size: 60px;
}
.title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}
.label {
  line-height: 18px;
  color: rgba(0, 0, 0, .45);
  font-size: 16px;
  margin-bottom: 12px;
  text-align: right;
  font-weight: 700;
}
.value {
  font-size: 20px;
  text-align: right;
  font-weight: 700;
  color: #666666;
}
.process-progress-list {
  max-height: min(60vh, 420px);
  overflow-y: auto;
  padding-right: 4px;
  margin: -4px 0;
}

.process-progress-item {
  padding: 14px 16px;
  margin-bottom: 10px;
  background: #fafbfc;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    border-color: #dcdfe6;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  }
}

.process-progress-item__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.process-progress-item__meta {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px 10px;
  min-width: 0;
}

.process-progress-item__name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  letter-spacing: 0.01em;
  line-height: 1.4;
}

.process-progress-item__code {
  display: inline-block;
  font-size: 12px;
  font-weight: 500;
  color: #606266;
  line-height: 1.4;
  padding: 2px 8px;
  background: #eef0f3;
  border-radius: 4px;
  vertical-align: baseline;
}

.process-progress-item__user {
  font-size: 12px;
  color: #606266;
  text-align: right;
  line-height: 1.5;
}

.process-progress-item__bar {
  margin-top: 2px;
}

/* 压过 src/styles/overwrite.scss 里 .el-table td { background !important } */
.dashboard-lately-order-table ::v-deep tr.need-date-row--safe > td {
  background-color: #e8f5e9 !important;
}
.dashboard-lately-order-table ::v-deep tr.need-date-row--warn > td {
  background-color: #fff9e6 !important;
}
.dashboard-lately-order-table ::v-deep tr.need-date-row--danger > td {
  background-color: #ffebee !important;
}

.dashboard-remark-cell {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  min-width: 0;
}

.dashboard-remark-cell__text-wrap {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

/* el-tooltip 的 reference 是插槽根节点（此处为 span），须随文案收缩宽度，不能用 block 拉满整格 */
.dashboard-remark-cell__text {
  display: inline-block;
  max-width: 100%;
  vertical-align: top;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dashboard-remark-cell__edit {
  flex-shrink: 0;
  padding: 0 2px !important;
  min-width: auto !important;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.dashboard-lately-order-table ::v-deep tr:hover .dashboard-remark-cell__edit {
  opacity: 1;
}
</style>

<style lang="scss">
/* tooltip 挂载在 body，需非 scoped；与 Element 默认单行样式对齐 */
.el-tooltip__popper.dashboard-remark-tooltip {
  max-width: min(360px, 85vw);
  line-height: 1.5;
  white-space: normal;
  word-break: break-word;
}
</style>
