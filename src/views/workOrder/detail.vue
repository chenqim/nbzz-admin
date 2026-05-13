<template>
  <div v-loading="loading" class="app-container">
    <el-button
      class="mb-4"
      icon="el-icon-back"
      @click="goBack"
    >返回列表</el-button>
    <el-descriptions title="工单基本信息" :column="2" border :label-style="{ width: '180px' }" :content-style="{ minWidth: '180px',maxWidth: '400px' }">
      <el-descriptions-item label="工单编号">{{ ins.code }}</el-descriptions-item>
      <el-descriptions-item label="工单名称">{{ ins.name }}</el-descriptions-item>
      <el-descriptions-item label="工单级别">
        <el-tag :type="config.gradeTypeMap[ins.grade]">{{ config.gradeMap[ins.grade] }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="工单类型">{{ config.typeMap[ins.type] }}</el-descriptions-item>
      <el-descriptions-item label="工单状态">
        <el-tag :type="config.statusTypeMap[ins.status]">{{ config.statusMap[ins.status] }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="产品名称">{{ ins.productInfo?.name }} [ {{ ins.productInfo?.code }} ]</el-descriptions-item>
      <el-descriptions-item label="完成数量 / 生产数量">{{ ins.completeCount }} / {{ ins.count }}</el-descriptions-item>
      <el-descriptions-item label="执行日期">{{ ins.execDate }}</el-descriptions-item>
      <el-descriptions-item label="需求日期">{{ ins.needDate }}</el-descriptions-item>
      <el-descriptions-item label="备注">{{ ins.remark || '-' }}</el-descriptions-item>
      <el-descriptions-item label="报废数量">{{ ins.scrapCount || 0 }}</el-descriptions-item>
      <el-descriptions-item label="快递单号">{{ ins.trackingNumber || '-' }}</el-descriptions-item>
      <el-descriptions-item label="发货日期">{{ ins.deliveryDate || '-' }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ ins.createTime }}</el-descriptions-item>
      <el-descriptions-item label="更新时间">{{ ins.updateTime }}</el-descriptions-item>
    </el-descriptions>
    <p class="title">工序相关信息</p>
    <div class="procedure-grid">
      <article v-for="p in (ins.procedureList || [])" :key="p.id" class="procedure-card">
        <header class="procedure-card__head">
          <h3 class="procedure-card__title">{{ p.workingProcedure.name }}</h3>
          <span class="procedure-card__code">{{ p.workingProcedure.code }}</span>
        </header>
        <dl class="procedure-card__meta">
          <div class="procedure-card__row">
            <dt>当前认领人</dt>
            <dd>{{ p.userName || '-' }}</dd>
          </div>
          <div class="procedure-card__row">
            <dt>认领时间</dt>
            <dd>{{ p.startTime || '-' }}</dd>
          </div>
          <div class="procedure-card__row">
            <dt>完成情况</dt>
            <dd>{{ p.completeCount }} / {{ p.count }}</dd>
          </div>
        </dl>
        <div class="procedure-card__progress">
          <el-progress
            :stroke-width="10"
            :color="customColors"
            :percentage="p.count === 0 ? 0 : Number(((p.completeCount / p.count) * 100).toFixed(0))"
          />
        </div>
      </article>
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
      loading: false,
      ins: {},
      customColors: [
        { color: '#f56c6c', percentage: 20 },
        { color: '#e6a23c', percentage: 50 },
        { color: '#409eff', percentage: 99 },
        { color: '#67c23a', percentage: 100 }
      ],
      config,
      from: 'WorkOrderList'
    }
  },
  created() {
    this.from = this.$route.query.from || 'workOrderList'
    this.getDetail()
  },
  methods: {
    getDetail() {
      this.loading = true
      getWorkOrderDetail({
        id: this.$route.params.id
      }).then(res => {
        this.ins = res.data
        console.log(res.data)
        this.loading = false
      })
    },
    goBack() {
      if (this.from === 'dashboard') {
        this.$router.push({ name: 'Dashboard' })
      } else {
        this.$router.push({ name: 'WorkOrderList' })
      }
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
.procedure-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;
  @media (min-width: 992px) {
    justify-items: start;
  }
  @media (min-width: 1200px) {
    gap: 20px;
  }
}

.procedure-card {
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  padding: 18px 20px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    border-color: #dcdfe6;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  @media (min-width: 992px) {
    max-width: 50%;
  }
}

.procedure-card__head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px 12px;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid #f0f2f5;
}

.procedure-card__title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
}

.procedure-card__code {
  font-size: 12px;
  font-family: ui-monospace, Menlo, Monaco, Consolas, monospace;
  color: #909399;
  padding: 2px 8px;
  background: #f4f4f5;
  border-radius: 4px;
  letter-spacing: 0.02em;
}

.procedure-card__meta {
  margin: 0;
  display: grid;
  gap: 12px;
}

.procedure-card__row {
  display: grid;
  grid-template-columns: minmax(72px, 34%) 1fr;
  gap: 6px 16px;
  align-items: baseline;
  font-size: 14px;
  line-height: 1.5;

  @media (max-width: 400px) {
    grid-template-columns: 1fr;
    gap: 2px;
  }

  dt {
    margin: 0;
    font-weight: 400;
    color: #909399;
  }

  dd {
    margin: 0;
    color: #606266;
    word-break: break-word;
  }
}

.procedure-card__progress {
  margin-top: 16px;
  padding-top: 4px;
  width: 100%;
  min-width: 0;

  :deep(.el-progress-bar__outer) {
    border-radius: 999px;
  }
}
:deep(.el-descriptions-item__content) {
  height: 50px; /* 设置你希望的高度 */
  line-height: 50px; /* 如果需要，可以设置行高使内容垂直居中 */
}
</style>
