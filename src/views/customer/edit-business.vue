<template>
  <el-dialog
    title="修改经营信息"
    :visible.sync="dialogVisible"
    width="640px"
    @close="close"
  >
    <el-form ref="model" :model="model" label-width="150px">
      <el-form-item label="统一社会信用代码">
        <el-input v-model="model.unifiedSocialCreditCode" placeholder="请输入统一社会信用代码" />
      </el-form-item>
      <el-form-item label="公司注册地址">
        <el-input v-model="model.companyRegisterAddress" placeholder="请输入公司注册地址" />
      </el-form-item>
      <el-form-item label="实际经营地址">
        <el-input v-model="model.companyActualAddress" placeholder="请输入实际经营地址" />
      </el-form-item>
      <el-form-item label="成立时间">
        <el-date-picker
          v-model="model.companyEstablishDate"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择成立时间"
          class="w-full"
        />
      </el-form-item>
      <el-form-item label="规模（人数）">
        <el-input v-model="model.companyScale" placeholder="请输入规模（人数）" />
      </el-form-item>
      <el-form-item label="主营产品/经营范围">
        <el-input
          v-model="model.mainProducts"
          type="textarea"
          :rows="2"
          placeholder="请输入主营产品/经营范围"
        />
      </el-form-item>
      <el-form-item label="发票抬头">
        <el-input v-model="model.invoiceTitle" placeholder="请输入发票抬头" />
      </el-form-item>
      <el-form-item label="税号">
        <el-input v-model="model.taxNumber" placeholder="请输入税号" />
      </el-form-item>
      <el-form-item label="开户银行">
        <el-input v-model="model.bankAccount" placeholder="请输入开户银行" />
      </el-form-item>
      <el-form-item label="银行账号">
        <el-input v-model="model.bankAccountNumber" placeholder="请输入银行账号" />
      </el-form-item>
      <el-form-item label="地址">
        <el-input v-model="model.invoiceAddress" placeholder="请输入地址" />
      </el-form-item>
      <el-form-item label="电话">
        <el-input v-model="model.invoicePhone" placeholder="请输入电话" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div>
        <el-button :disabled="loading" @click="close">取消</el-button>
        <el-button type="primary" :loading="loading" @click="ok">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { updateCustomer } from '@/api/customer'

const emptyModel = () => ({
  unifiedSocialCreditCode: '',
  companyRegisterAddress: '',
  companyActualAddress: '',
  companyEstablishDate: '',
  companyScale: '',
  mainProducts: '',
  invoiceTitle: '',
  taxNumber: '',
  bankAccount: '',
  bankAccountNumber: '',
  invoiceAddress: '',
  invoicePhone: ''
})

export default {
  name: 'EditCustomerBusiness',
  emits: ['success'],
  data() {
    return {
      loading: false,
      customerId: '',
      model: emptyModel(),
      dialogVisible: false
    }
  },
  methods: {
    ok() {
      this.submit()
    },
    async submit() {
      try {
        this.loading = true
        await updateCustomer({
          id: this.customerId,
          ...this.model
        })
        this.$message({
          type: 'success',
          message: '保存成功'
        })
        this.close()
        this.$emit('success')
      } catch (error) {
        console.log(error)
      } finally {
        this.loading = false
      }
    },
    setDefault(ins) {
      const m = emptyModel()
      Object.keys(m).forEach((key) => {
        m[key] = ins[key] != null && ins[key] !== '' ? ins[key] : ''
      })
      this.model = m
    },
    open(ins) {
      this.customerId = ins.id
      this.setDefault(ins)
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.model && this.$refs.model.clearValidate()
      })
    },
    close() {
      this.dialogVisible = false
      this.loading = false
      this.customerId = ''
      this.model = emptyModel()
      this.$refs.model && this.$refs.model.resetFields()
    }
  }
}
</script>

<style lang="scss" scoped>
.w-full {
  width: 100%;
}
</style>
