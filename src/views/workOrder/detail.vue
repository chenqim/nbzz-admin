<template>
  <div class="app-container">
    <el-descriptions class="margin-top" title="工单基本信息" :column="2" border>
      <el-descriptions-item label="工单编号">{{ ins.code }}</el-descriptions-item>
      <el-descriptions-item label="工单名称">{{ ins.name }}</el-descriptions-item>
      <el-descriptions-item label="工单级别">
        <el-tag :type="config.gradeTypeMap[ins.grade]">{{ config.gradeMap[ins.grade] }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="工单类型">{{ config.typeMap[ins.type] }}</el-descriptions-item>
      <el-descriptions-item label="产品名称">{{ ins.productInfo?.name }} ({{ ins.productInfo?.code }})</el-descriptions-item>
      <el-descriptions-item label="生产数量">{{ ins.count }}</el-descriptions-item>
      <el-descriptions-item label="执行日期">{{ ins.execDate }}</el-descriptions-item>
      <el-descriptions-item label="需求日期">{{ ins.needDate }}</el-descriptions-item>
      <el-descriptions-item label="备注">{{ ins.remark }}</el-descriptions-item>
      <el-descriptions-item label="工单状态">
        <el-tag :type="config.statusTypeMap[ins.status]">{{ config.statusMap[ins.status] }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ ins.createTime }}</el-descriptions-item>
      <el-descriptions-item label="更新时间">{{ ins.updateTime }}</el-descriptions-item>
    </el-descriptions>
    <p class="title">工序相关信息</p>
    <div v-for="p in ins.procedureList" :key="p.id" class="gx-box">
      <div class="head">{{ p.workingProcedure.name }} [ {{ p.workingProcedure.code }} ]</div>
      <div class="body">
        <span class="label">当前认领人：</span>
        <span class="value">{{ p.userName || '-' }}</span>
      </div>
      <div class="body">
        <span class="label">认领时间：</span>
        <span class="value">{{ p.startTime || '-' }}</span>
      </div>
      <div class="body">
        <span class="label">完成情况：</span>
        <span class="value">{{ p.completeCount }} / {{ p.count }}</span>
      </div>
      <div>
        <el-progress class="w-1/4" :stroke-width="12" :color="customColors" :percentage="Number(((p.completeCount / p.count) * 100).toFixed(0))" />
      </div>
    </div>
  </div>
</template>

<script>
import config from './config'
import { getWorkOrderDetail } from '@/api/workOrder'

export default {
  name: 'WorkOrderDetail',
  data() {
    return {
      ins: {},
      customColors: [
        { color: '#f56c6c', percentage: 20 },
        { color: '#e6a23c', percentage: 50 },
        { color: '#409eff', percentage: 99 },
        { color: '#67c23a', percentage: 100 }
      ],
      config
    }
  },
  created() {
    this.getDetail()
  },
  methods: {
    getDetail() {
      getWorkOrderDetail({
        id: this.$route.params.id
      }).then(res => {
        this.ins = res.data
        console.log(res.data)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.title {
  color: #303133;
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 20px;
  margin-top: 20px;
}
.gx-box {
  margin-bottom: 20px;
  width: 50%;
  background-color: #fafafa;
  padding: 16px;
  line-height: 26px;
  .body {
    font-size: 14px;
    .label {
      color: #909399;
    }
    .value {
      color: #606266;
    }
  }
  .head {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 8px;
  }
}
</style>
