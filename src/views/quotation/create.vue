<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="card-header">
        <span>{{ isEdit ? '编辑报价单' : '创建报价单' }}</span>
        <el-button @click="goBack">返回</el-button>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="客户名称" prop="customerId">
              <el-select v-model="form.customerId" filterable placeholder="请选择客户" style="width: 100%" @change="onCustomerChange">
                <el-option
                  v-for="item in customerList"
                  :key="item.id"
                  :label="item.customerName"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="负责业务员" prop="businessPersonId">
              <el-select v-model="form.businessPersonId" filterable clearable placeholder="请选择业务员" style="width: 100%">
                <el-option
                  v-for="item in staffList"
                  :key="item.id"
                  :label="item.realName || item.username"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注说明" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="输入报价备注信息..." />
        </el-form-item>
      </el-form>

      <div class="item-section">
        <div class="item-header">
          <span class="item-title">产品明细</span>
          <el-button icon="el-icon-plus" type="primary" plain size="small" @click="addItem">添加产品行</el-button>
        </div>

        <el-table :data="form.itemList" border style="width: 100%">
          <el-table-column label="#" width="60" type="index" />
          <el-table-column label="产品名称" min-width="180">
            <template v-slot="{ row }">
              <el-input v-model="row.productName" placeholder="产品名称" />
            </template>
          </el-table-column>
          <el-table-column label="规格型号" min-width="160">
            <template v-slot="{ row }">
              <el-input v-model="row.spec" placeholder="规格型号" />
            </template>
          </el-table-column>
          <el-table-column label="数量" width="120">
            <template v-slot="{ row }">
              <el-input-number v-model="row.quantity" :min="1" size="small" style="width: 100%" @change="calcRow(row)" />
            </template>
          </el-table-column>
          <el-table-column label="单价" width="140">
            <template v-slot="{ row }">
              <el-input-number v-model="row.unitPrice" :min="0" :precision="2" size="small" style="width: 100%" @change="calcRow(row)" />
            </template>
          </el-table-column>
          <el-table-column label="行金额" width="140">
            <template v-slot="{ row }">
              <span class="row-total">{{ formatAmount(row.totalPrice) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="行备注" min-width="140">
            <template v-slot="{ row }">
              <el-input v-model="row.remark" placeholder="行备注" size="small" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" fixed="right">
            <template v-slot="{ $index }">
              <el-button type="text" icon="el-icon-delete" style="color: #f56c6c" @click="removeItem($index)" />
            </template>
          </el-table-column>
        </el-table>

        <div class="item-footer">
          <span>产品合计：<strong>{{ form.itemList.length }}</strong> 项</span>
          <span class="total-amount">报价总金额：<strong>{{ formatAmount(totalAmount) }}</strong></span>
        </div>
      </div>

      <div class="form-actions">
        <el-button @click="goBack">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">保存</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { createQuotation, updateQuotation, getQuotationById } from '@/api/quotation'
import { queryCustomerList } from '@/api/customer'
import { getStaffList } from '@/api/staff'

export default {
  name: 'QuotationCreate',
  data() {
    return {
      isEdit: false,
      quotationId: null,
      customerList: [],
      staffList: [],
      saving: false,
      form: {
        customerId: '',
        businessPersonId: '',
        remark: '',
        itemList: []
      },
      rules: {
        customerId: [{ required: true, message: '请选择客户', trigger: 'change' }]
      }
    }
  },
  computed: {
    totalAmount() {
      return this.form.itemList.reduce((sum, item) => {
        return sum + (Number(item.totalPrice) || 0)
      }, 0)
    }
  },
  created() {
    this.loadCustomerList()
    this.loadStaffList()
    if (this.$route.params.id) {
      this.isEdit = true
      this.quotationId = this.$route.params.id
      this.loadQuotation()
    } else {
      this.addItem()
    }
  },
  methods: {
    formatAmount(val) {
      if (val === null || val === undefined) return '-'
      return '¥ ' + Number(val).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    },
    loadCustomerList() {
      queryCustomerList({}).then((res) => {
        this.customerList = res.data || []
      }).catch(() => {})
    },
    loadStaffList() {
      const param = { page: 1, size: 100 }
      getStaffList({ pageParam: param }).then((res) => {
        this.staffList = res.data.records || []
      }).catch(() => {})
    },
    loadQuotation() {
      getQuotationById({ id: this.quotationId }).then((res) => {
        const data = res.data
        this.form.customerId = data.customerId
        this.form.businessPersonId = data.businessPersonId || ''
        this.form.remark = data.remark || ''
        this.form.itemList = (data.itemList || []).map((item) => ({
          ...item,
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0,
          totalPrice: item.totalPrice || 0
        }))
      }).catch(() => {
        this.$message.error('加载报价单失败')
        this.goBack()
      })
    },
    onCustomerChange() {
      // customer selected
    },
    addItem() {
      this.form.itemList.push({
        productName: '',
        spec: '',
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        remark: ''
      })
    },
    removeItem(index) {
      this.form.itemList.splice(index, 1)
    },
    calcRow(row) {
      row.totalPrice = (Number(row.quantity) || 0) * (Number(row.unitPrice) || 0)
    },
    handleSave() {
      this.$refs.formRef.validate((valid) => {
        if (!valid) return
        if (!this.form.itemList.length) {
          this.$message.warning('请至少添加一行产品明细')
          return
        }
        this.saving = true
        const payload = {
          customerId: this.form.customerId,
          businessPersonId: this.form.businessPersonId || undefined,
          remark: this.form.remark || '',
          totalAmount: this.totalAmount,
          itemList: this.form.itemList.map((item, index) => ({
            id: item.id || undefined,
            productName: item.productName,
            spec: item.spec || '',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            remark: item.remark || '',
            sortOrder: index + 1
          }))
        }
        if (this.isEdit) {
          payload.id = this.quotationId
        }
        const api = this.isEdit ? updateQuotation : createQuotation
        api(payload)
          .then((res) => {
            this.$message.success(this.isEdit ? '更新成功' : '创建成功')
            const newId = res.data ? res.data.id : this.quotationId
            this.$router.push({
              name: 'QuotationDetail',
              params: { id: newId }
            })
          })
          .finally(() => {
            this.saving = false
          })
      })
    },
    goBack() {
      this.$router.push({ name: 'QuotationList' })
    }
  }
}
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.item-section {
  margin-top: 20px;
}
.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.item-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
.row-total {
  font-weight: 600;
  color: #303133;
}
.item-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 30px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
  font-size: 15px;
}
.total-amount {
  font-size: 18px;
  color: #409eff;
  strong {
    font-size: 22px;
  }
}
.form-actions {
  margin-top: 24px;
  text-align: center;
}
</style>
