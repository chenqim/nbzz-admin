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
      <!-- <el-descriptions-item label="产品名称">{{ ins.productInfo?.name }} [ {{ ins.productInfo?.code }} ]</el-descriptions-item> -->
      <el-descriptions-item label="产品名称">{{ ins.productInfo?.name }}<span class="procedure-card__code ml-4">{{ ins.productInfo?.code }}</span></el-descriptions-item>
      <el-descriptions-item label="客户名称">{{ customerName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="系数">{{ coefficientText || '-' }}</el-descriptions-item>
      <el-descriptions-item label="完成数量 / 生产数量">{{ ins.completeCount }} / {{ ins.count }}</el-descriptions-item>
      <el-descriptions-item label="执行日期">{{ ins.execDate }}</el-descriptions-item>
      <el-descriptions-item label="需求日期">{{ ins.needDate }}</el-descriptions-item>
      <el-descriptions-item label="报废数量">{{ ins.scrapCount || 0 }}</el-descriptions-item>
      <el-descriptions-item label="创建时间">{{ ins.createTime }}</el-descriptions-item>
      <el-descriptions-item label="更新时间">{{ ins.updateTime }}</el-descriptions-item>
      <el-descriptions-item label="备注">{{ ins.remark || '-' }}</el-descriptions-item>
    </el-descriptions>

    <!-- 全部发货 -->
    <el-descriptions v-if="deliveryList && deliveryList.length === 0 && ins.trackingType" title="发货信息" :column="3" border :label-style="{ width: '180px' }" :content-style="{ minWidth: '180px',maxWidth: '400px' }" style="margin-top: 20px">
      <el-descriptions-item label="发货类型">{{ config.trackingTypeMap[ins.trackingType] || ins.trackingType }}</el-descriptions-item>
      <el-descriptions-item :label="dateLabel">{{ ins.deliveryDate || '-' }}</el-descriptions-item>
      <el-descriptions-item :label="numberLabel">{{ ins.trackingNumber || '-' }}</el-descriptions-item>
    </el-descriptions>

    <!-- 部分发货 -->
    <template v-if="deliveryList && deliveryList.length > 0">
      <p class="title">发货信息</p>
      <el-descriptions
        v-for="(item, index) in deliveryList"
        :key="item.id || index"
        :title="'发货记录 ' + (index + 1)"
        :column="4"
        border
        :label-style="{ width: '180px' }"
        :content-style="{ minWidth: '180px', maxWidth: '400px' }"
        class="mb-4 delivery-descriptions"
      >
        <el-descriptions-item label="发货数量">{{ item.deliveryCount || 0 }}</el-descriptions-item>
        <el-descriptions-item label="发货类型">{{ getDeliveryTypeLabel(item.deliveryType) }}</el-descriptions-item>
        <el-descriptions-item :label="getDeliveryDateLabel(item.deliveryType)">{{ item.deliveryDate || '-' }}</el-descriptions-item>
        <el-descriptions-item :label="getShipmentNoLabel(item.deliveryType)">{{ item.shipmentNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="4">{{ item.remark || '-' }}</el-descriptions-item>
      </el-descriptions>
    </template>

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
            <dt>完工时间</dt>
            <dd>{{ p.endTime || '-' }}</dd>
          </div>
          <div class="procedure-card__row">
            <dt>耗时</dt>
            <dd>{{ formatProcedureDuration(p.startTime, p.endTime) }}</dd>
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
import { getWorkOrderDetail, queryDeliveryDetail } from '@/api/workOrder'
import { getCustomerDetail } from '@/api/customer'
import { queryCustomerRelationListByProduct } from '@/api/product'
import dayjs from 'dayjs'

export default {
  name: 'WorkOrderDetail',
  data() {
    return {
      loading: false,
      ins: {},
      deliveryList: [],
      customerName: '',
      coefficientText: '',
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
  computed: {
    // 之前没填写过的默认都展示成快递发货的
    dateLabel() {
      return this.ins.trackingType === '1' ? '自提日期' : this.ins.trackingType === '2' ? '送货日期' : '发货日期'
    },
    numberLabel() {
      return this.ins.trackingType === '1' ? '自提人员' : this.ins.trackingType === '2' ? '送货人员' : '快递单号'
    }
  },
  created() {
    this.from = this.$route.query.from || 'workOrderList'
    this.getDetail()
  },
  methods: {
    async getDetail() {
      this.loading = true
      const id = this.$route.params.id
      try {
        const [detailRes, deliveryRes] = await Promise.all([
          getWorkOrderDetail({ id }),
          queryDeliveryDetail({ id })
        ])
        this.ins = detailRes.data
        this.deliveryList = deliveryRes.data.sort((a, b) => dayjs(a.createTime).unix() - dayjs(b.createTime).unix()) || []
        await this.fetchCustomerAndCoefficient()
      } catch (error) {
        console.log(error)
        this.deliveryList = []
      } finally {
        this.loading = false
      }
    },
    async fetchCustomerAndCoefficient() {
      this.customerName = ''
      this.coefficientText = ''
      const customerId = this.ins.customerId
      const productId = this.ins.productInfo?.id
      if (!customerId) return
      try {
        const customerRes = await getCustomerDetail({ id: customerId })
        this.customerName = customerRes.data?.customerName || ''
      } catch (e) {
        console.log(e)
      }
      if (!productId) return
      try {
        const relationRes = await queryCustomerRelationListByProduct({ id: productId })
        const list = relationRes.data || []
        const match = list.find((item) => item.customerId === customerId)
        if (match) {
          const field = config.coefficientFieldMap[this.ins.type]
          // const label = config.coefficientLabelMap[this.ins.type]
          if (field /* && label */) {
            // this.coefficientText = `${label}: ${match[field]}`
            this.coefficientText = match[field] || '-'
          } else {
            // this.coefficientText = Object.keys(config.coefficientFieldMap).map(key => `${config.coefficientLabelMap[key]}: ${match[config.coefficientFieldMap[key]]}`).join(', ')
            this.coefficientText = '-'
          }
        }
      } catch (e) {
        console.log(e)
      }
    },
    goBack() {
      if (this.from === 'dashboard') {
        this.$router.push({ name: 'Dashboard' })
      } else {
        this.$router.push({ name: 'WorkOrderList' })
      }
    },
    getDeliveryTypeLabel(type) {
      return config.trackingTypeMap[type] || type || '-'
    },
    getDeliveryDateLabel(type) {
      return type === '1' ? '自提日期' : type === '2' ? '送货日期' : '发货日期'
    },
    getShipmentNoLabel(type) {
      return type === '1' ? '自提人员' : type === '2' ? '送货人员' : '快递单号'
    },
    formatProcedureDuration(startTime, endTime) {
      if (!startTime || !endTime) {
        return '-'
      }
      const start = new Date(String(startTime).replace(/-/g, '/')).getTime()
      const end = new Date(String(endTime).replace(/-/g, '/')).getTime()
      if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
        return '-'
      }
      let totalSeconds = Math.floor((end - start) / 1000)
      const days = Math.floor(totalSeconds / 86400)
      totalSeconds %= 86400
      const hours = Math.floor(totalSeconds / 3600)
      totalSeconds %= 3600
      const minutes = Math.floor(totalSeconds / 60)
      const seconds = totalSeconds % 60
      const parts = []
      if (days > 0) parts.push(`${days}天`)
      if (hours > 0) parts.push(`${hours}小时`)
      if (minutes > 0) parts.push(`${minutes}分`)
      if (seconds > 0 || parts.length === 0) parts.push(`${seconds}秒`)
      return parts.join('')
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
:deep(.delivery-descriptions .el-descriptions__title) {
  font-size: 14px;
  font-weight: normal;
}
</style>
