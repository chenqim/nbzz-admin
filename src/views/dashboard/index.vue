<template>
  <div class="app-container">
    <div style="border: 1px solid #efefef;padding: 16px; border-radius: 5px;">
      <div class="text-right">
        <el-date-picker
          v-model="dateValue"
          type="date"
          placeholder="选择日期"
          value-format="yyyy-MM-dd"
          @change="getAllData"
        />
      </div>
      <h1 class="title">工单执行总览</h1>
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
      </div>
      <h1 class="title mt-4">需求达成率总览</h1>
      <div v-loading="topLoading" class="flex" style="gap: 16px;">
        <el-card v-for="n in list" :key="n.label" class="w-1/5" :class="n.id ? 'cursor-pointer' : ''" @click.native="openWorkOrderModal(n)">
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
      <el-table v-loading="loading" :data="tableData">
        <el-table-column label="工单编号 / 工单名称" prop="name" min-width="160" show-overflow-tooltip>
          <template v-slot="{ row }">
            <span>{{ row.code }}</span>
            <br>
            <span>{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="产品名称" prop="productInfo.name" min-width="180" />
        <el-table-column label="需求日期" prop="needDate" min-width="180">
          <template v-slot="{ row }">
            <span style="color: red;font-weight: bold;">{{ row.needDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="完成数量 / 生产数量" min-width="140">
          <template v-slot="{ row }">
            <span><span :style="{ color: row.completeCount === 0 ? '#F56C6C' : row.completeCount === row.completeCount ? '#67C23A' : '#409EFF' }">{{ row.completeCount }}</span> / {{ row.count }}</span>
          </template>
        </el-table-column>
        <el-table-column label="工单进度" prop="a" min-width="180">
          <template v-slot="{ row }">
            <span>{{ Number((row.completeCount / row.count).toFixed(2)) * 100 }}%</span>
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
      width="500px"
    >
      <div v-loading="dialogLoading">
        <div v-for="p in ins.procedureList" :key="p.id" class="mb-4">
          <div class="head">{{ p.workingProcedure.name }} [ {{ p.workingProcedure.code }} ]</div>
          <div>
            <el-progress :stroke-width="12" :color="customColors" :percentage="p.count === 0 ? 0 : Number(((p.completeCount / p.count) * 100).toFixed(0))" />
          </div>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">关闭</el-button>
      </span>
    </el-dialog>
    <el-dialog
      :title="titleMap[workOrderTitle]"
      :visible.sync="workOrderShow"
      width="80%"
    >
      <el-table v-loading="dialogTableLoading" height="478px" :data="dialogTableData">
        <el-table-column type="index" label="序号" width="60" align="center" />
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
        <el-table-column label="需求日期" min-width="90">
          <template v-slot="{ row }">
            <span style="color: red;font-weight: bold;">{{ row.needDate }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="150" show-overflow-tooltip />
        <el-table-column label="创建时间" prop="createTime" min-width="150" />
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
import { queryLatelyByPage, queryOrderAchieveTotal, queryProduceExecuteTotal, getWorkOrderDetail, queryTotalOrderList } from '@/api/workOrder'

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
      dialogTableData: []
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
        }).then(res => {
          const { totalOrderCount, completedOrderCount, executedOrderCount, processOrderCount, completedOrderRatio } = res.data
          this.list = [
            { label: '今日总工单数 >', value: totalOrderCount, id: 'total', class: 'el-icon-s-platform' },
            { label: '今日已发货 >', value: completedOrderCount, id: 'delivered', class: 'el-icon-s-promotion' },
            { label: '今日待发货 >', value: executedOrderCount, id: 'pendingDelivered', class: 'el-icon-s-goods' },
            { label: '今日未完成 >', value: processOrderCount, id: 'notFinsh', class: 'el-icon-s-release' },
            { label: '今日需求达成率', value: completedOrderRatio + '%', class: 'el-icon-s-flag' }
          ]
        }),
        queryProduceExecuteTotal({
          targetDate: this.dateValue
        }).then(res => {
          const { totalWorkerCount, totalArtifactCount, totalOrderCount, successArtifactCount, successOrderCount } = res.data
          this.list2 = [
            { label: '今日在制工单数 >', value: totalOrderCount, id: 'circle', class: 'el-icon-s-order' },
            { label: '今日完工工单数 >', value: successOrderCount, id: 'finsh', class: 'el-icon-s-claim' },
            { label: '今日生产人数', value: totalWorkerCount, class: 'el-icon-s-custom' },
            { label: '今日在制产品数', value: totalArtifactCount, class: 'el-icon-s-shop' },
            { label: '今日完工产品数', value: successArtifactCount, class: 'el-icon-s-claim' }
          ]
        })
      ]).then(() => {
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
        path: `/production/workOrder/detail/${row.id}`
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
.head {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}
</style>
