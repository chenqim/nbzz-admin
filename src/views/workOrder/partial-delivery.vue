<template>
  <div class="app-container">
    <el-dialog
      title="部分发货"
      :visible.sync="dialogVisible"
      width="520px"
      append-to-body
      @close="resetForm"
    >
      <el-alert
        title="请确保线下发货后再进行该操作。"
        type="warning"
        :closable="false"
        class="mb-4"
      />
      <el-form
        ref="formRef"
        :model="form"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="全部发货" prop="isAllDelivery">
          <el-radio-group v-model="form.isAllDelivery">
            <el-radio label="1">是</el-radio>
            <el-radio label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="报废数量" prop="scrapCount">
          <el-input-number
            v-model="form.scrapCount"
            :min="0"
            :max="row?.count || 1000000"
            :precision="0"
            controls-position="right"
            class="w-full"
          />
        </el-form-item>

        <div
          v-for="(item, index) in form.deliveryList"
          :key="index"
          class="delivery-item"
        >
          <div class="delivery-item-header">
            <span class="delivery-item-title">发货明细 {{ index + 1 }}</span>
            <el-button
              v-if="form.deliveryList.length > 1"
              type="text"
              class="delivery-item-remove"
              @click="removeItem(index)"
              :disabled="!!item.id"
            >
              <i class="el-icon-delete" /> 删除
            </el-button>
          </div>

          <el-form-item
            label="发货数量"
            :prop="'deliveryList.' + index + '.deliveryCount'"
            :rules="{ required: true, message: '请输入发货数量', trigger: 'change' }"
          >
            <el-input-number
              v-model="item.deliveryCount"
              :min="0"
              :max="row?.count || 1000000"
              :precision="0"
              controls-position="right"
              class="w-full"
            />
          </el-form-item>

          <el-form-item
            label="发货类型"
            :prop="'deliveryList.' + index + '.trackingType'"
            :rules="{ required: true, message: '请选择发货类型', trigger: 'change' }"
          >
            <el-radio-group v-model="item.trackingType">
              <el-radio
                v-for="n in Object.keys(config.trackingTypeMap)"
                :key="n"
                :label="n"
              >{{ config.trackingTypeMap[n] }}</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item
            :label="getDateLabel(item.trackingType)"
            :prop="'deliveryList.' + index + '.deliveryDate'"
            :rules="{ required: true, message: getDatePlaceholder(item.trackingType), trigger: 'change' }"
          >
            <el-date-picker
              v-model="item.deliveryDate"
              type="date"
              :placeholder="getDatePlaceholder(item.trackingType)"
              value-format="yyyy-MM-dd"
              style="width: 100%"
            />
          </el-form-item>

          <el-form-item
            :label="getNumberLabel(item.trackingType)"
            :prop="'deliveryList.' + index + '.trackingNumber'"
            :rules="{ required: true, message: getNumberPlaceholder(item.trackingType), trigger: 'blur' }"
          >
            <el-input
              v-model="item.trackingNumber"
              :placeholder="getNumberPlaceholder(item.trackingType)"
              clearable
            />
          </el-form-item>

          <el-form-item
            label="备注"
            :prop="'deliveryList.' + index + '.remark'"
          >
            <el-input
              v-model="item.remark"
              type="textarea"
              :rows="2"
              placeholder="请输入备注"
              clearable
            />
          </el-form-item>
        </div>

        <div class="delivery-add-btn">
          <el-button type="text" icon="el-icon-plus" @click="addItem">添加发货明细</el-button>
        </div>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button
          type="primary"
          :loading="submitting"
          @click="submit"
        >确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import config from './config'
import { partialDeliveryOrder, queryDeliveryDetail } from '@/api/workOrder'
import dayjs from 'dayjs'

function createEmptyItem() {
  return {
    deliveryCount: 0,
    trackingType: '3',
    deliveryDate: dayjs().format('YYYY-MM-DD'),
    trackingNumber: '',
    remark: ''
  }
}

export default {
  name: 'WorkOrderPartialDelivery',
  data() {
    return {
      config,
      dialogVisible: false,
      submitting: false,
      row: null,
      form: {
        isAllDelivery: '0',
        scrapCount: 0,
        deliveryList: [createEmptyItem()]
      },
      formRules: {
        isAllDelivery: [
          { required: true, message: '请选择是否全部发货', trigger: 'change' }
        ],
        scrapCount: [
          { required: true, message: '请输入报废数量', trigger: ['blur', 'change'] }
        ],
      }
    }
  },
  methods: {
    getDateLabel(trackingType) {
      return trackingType === '3' ? '发货日期' : trackingType === '2' ? '送货日期' : '自提日期'
    },
    getDatePlaceholder(trackingType) {
      return trackingType === '3' ? '请选择发货日期' : trackingType === '2' ? '请选择送货日期' : '请选择自提日期'
    },
    getNumberLabel(trackingType) {
      return trackingType === '3' ? '快递单号' : trackingType === '2' ? '送货人员' : '自提人员'
    },
    getNumberPlaceholder(trackingType) {
      return trackingType === '3' ? '请输入快递单号' : trackingType === '2' ? '请输入送货人员' : '请输入自提人员'
    },
    async open(row) {
      this.row = row
      this.dialogVisible = true
      this.form.isAllDelivery = '0'
      this.form.scrapCount = row.scrapCount || 0
      try {
        const res = await queryDeliveryDetail({ id: row.id })
        const data = res.data
        if (data && data.length > 0) {
          this.form.deliveryList = data.sort((a, b) => dayjs(a.createTime).unix() - dayjs(b.createTime).unix()).map((item) => ({
            id: item.id,
            deliveryCount: item.deliveryCount || 0,
            trackingType: String(item.deliveryType || '3'),
            deliveryDate: item.deliveryDate || dayjs().format('YYYY-MM-DD'),
            trackingNumber: item.shipmentNo || '',
            remark: item.remark || ''
          }))
        } else {
          this.form.deliveryList = [createEmptyItem()]
        }
      } catch (error) {
        console.log(error)
        this.form.deliveryList = [createEmptyItem()]
      }
      this.$nextTick(() => {
        this.$refs.formRef && this.$refs.formRef.clearValidate()
      })
    },
    addItem() {
      this.form.deliveryList.push(createEmptyItem())
    },
    async removeItem(index) {
      try {
        await this.$confirm('确定删除该发货明细吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        this.form.deliveryList.splice(index, 1)
      } catch (error) {
        // 取消删除
      }
    },
    resetForm() {
      this.row = null
      this.submitting = false
      this.$refs.formRef && this.$refs.formRef.resetFields()
    },
    handleCancel() {
      this.dialogVisible = false
    },
    async submit() {
      if (!this.row) return
      const valid = await this.$refs.formRef.validate().catch(() => false)
      if (!valid) return

      for (let i = 0; i < this.form.deliveryList.length; i++) {
        const item = this.form.deliveryList[i]
        if (!(item.trackingNumber || '').trim()) {
          this.$message.warning(`发货明细 ${i + 1}：请输入${this.getNumberLabel(item.trackingType)}`)
          return
        }
      }

      this.submitting = true
      try {
        await partialDeliveryOrder({
          workOrderId: this.row.id,
          isDeliveryCompleted: this.form.isAllDelivery === '1',
          scrapCount: this.form.scrapCount,
          deliveryList: this.form.deliveryList.map((item) => ({
            id: item.id || undefined,
            workOrderId: this.row.id,
            deliveryCount: item.deliveryCount,
            deliveryType: item.trackingType,
            deliveryDate: item.deliveryDate,
            shipmentNo: (item.trackingNumber || '').trim(),
            remark: item.remark || ''
          }))
        })
        this.$message.success({
          message: '操作成功',
          type: 'success'
        })
        this.dialogVisible = false
        this.$emit('success')
      } catch (error) {
        console.log(error)
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style scoped>
.delivery-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  /* padding: 12px 12px 0; */
  padding: 8px 12px;
  margin-bottom: 12px;
}
.delivery-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  /* margin-top: 8px;
  margin-left: 12px;
  margin-right: 12px; */
}
.delivery-item-title {
  font-size: 14px;
  font-weight: bold;
  color: #606266;
}
.delivery-item-remove {
  color: #f56c6c;
}
.delivery-add-btn {
  text-align: center;
  margin-top: 8px;
}
</style>
