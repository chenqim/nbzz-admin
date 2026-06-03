<template>
  <div class="app-container">
    <el-dialog
      title="全部发货"
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
        <el-button @click="handleCancel">取 消</el-button>
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
import config from './config'
import { deliveryOrder } from '@/api/workOrder'
import dayjs from 'dayjs'

export default {
  name: 'WorkOrderDelivery',
  data() {
    return {
      config,
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
  methods: {
    open(row) {
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
    handleCancel() {
      this.deliveryDialogVisible = false
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
          this.$emit('success')
        } catch (error) {
          console.log(error)
        } finally {
          this.deliverySubmitting = false
        }
      })
    }
  }
}
</script>
