<template>
  <el-dialog
    :title="isEdit ? '修改关联关系' : '添加关联关系'"
    :visible.sync="dialogVisible"
    width="500px"
    @close="close"
  >
    <el-form ref="model" :model="model" :rules="rules" label-width="80px">
      <el-form-item v-if="!isEdit" label="客户" prop="customerId">
        <el-select
          v-model="model.customerId"
          filterable
          class="w-full"
          placeholder="请选择客户"
        >
          <el-option
            v-for="item in customerList"
            :key="item.id"
            :label="item.customerName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="新刀系数" prop="newToolCoefficient">
        <el-input-number
          v-model="model.newToolCoefficient"
          :precision="3"
          :step="0.1"
          :min="0"
          :max="99.999"
          controls-position="right"
          class="w-full"
        />
      </el-form-item>
      <el-form-item label="修刀系数" prop="repairToolCoefficient">
        <el-input-number
          v-model="model.repairToolCoefficient"
          :precision="3"
          :step="0.1"
          :min="0"
          :max="99.999"
          controls-position="right"
          class="w-full"
        />
      </el-form-item>
      <el-form-item label="返工系数" prop="reworkCoefficient">
        <el-input-number
          v-model="model.reworkCoefficient"
          :precision="3"
          :step="0.1"
          :min="0"
          :max="99.999"
          controls-position="right"
          class="w-full"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="model.remark" type="textarea" :rows="3" resize="none" />
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
import { queryCustomerList } from '@/api/customer'
import { createCustomerRelation, updateCustomerRelation } from '@/api/product'

const emptyModel = () => ({
  customerId: '',
  newToolCoefficient: 0.5,
  reworkCoefficient: 0.5,
  repairToolCoefficient: 0.5,
  remark: ''
})

export default {
  name: 'ProductRelationDialog',
  emits: ['success'],
  data() {
    return {
      loading: false,
      dialogVisible: false,
      isEdit: false,
      relationId: null,
      productId: null,
      oriNewToolCoefficient: null,
      oriRepairToolCoefficient: null,
      customerList: [],
      model: emptyModel()
    }
  },
  computed: {
    rules() {
      const base = {
        newToolCoefficient: [{ required: true, message: '请输入新刀系数', trigger: ['blur', 'change'] }],
        reworkCoefficient: [{ required: true, message: '请输入返工系数', trigger: ['blur', 'change'] }],
        repairToolCoefficient: [{ required: true, message: '请输入修刀系数', trigger: ['blur', 'change'] }]
      }
      if (!this.isEdit) {
        base.customerId = [{ required: true, message: '请选择客户', trigger: ['change'] }]
      }
      return base
    }
  },
  methods: {
    loadCustomerList() {
      queryCustomerList({}).then((res) => {
        this.customerList = res?.data || []
      })
    },
    openAdd(productId) {
      this.isEdit = false
      this.relationId = null
      this.productId = productId
      this.oriNewToolCoefficient = null
      this.oriReworkCoefficient = null
      this.oriRepairToolCoefficient = null
      this.model = emptyModel()
      this.loadCustomerList()
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.model?.clearValidate()
      })
    },
    openEdit(row, productId) {
      this.isEdit = true
      this.relationId = row.id
      this.productId = productId
      this.oriNewToolCoefficient = row.newToolCoefficient ?? 0.5
      this.oriReworkCoefficient = row.reworkCoefficient ?? 0.5
      this.oriRepairToolCoefficient = row.repairToolCoefficient ?? 0.5
      this.model = {
        customerId: row.customerId,
        newToolCoefficient: this.oriNewToolCoefficient,
        reworkCoefficient: this.oriReworkCoefficient,
        repairToolCoefficient: this.oriRepairToolCoefficient,
        remark: row.remark || ''
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.model?.clearValidate()
      })
    },
    ok() {
      this.$refs.model.validate((valid) => {
        if (!valid) return
        if (this.isEdit) {
          this.submitUpdate()
        } else {
          this.submitCreate()
        }
      })
    },
    async submitCreate() {
      try {
        this.loading = true
        await createCustomerRelation({
          customerId: this.model.customerId,
          productId: this.productId,
          remark: this.model.remark,
          newToolCoefficient: this.model.newToolCoefficient,
          reworkCoefficient: this.model.reworkCoefficient,
          repairToolCoefficient: this.model.repairToolCoefficient
        })
        this.$message.success('添加成功')
        this.close()
        this.$emit('success')
      } catch (error) {
        console.log(error)
      } finally {
        this.loading = false
      }
    },
    async submitUpdate() {
      try {
        this.loading = true
        const payload = {
          id: this.relationId,
          remark: this.model.remark
        }
        if (Number(this.model.newToolCoefficient) !== Number(this.oriNewToolCoefficient)) {
          payload.newToolCoefficient = this.model.newToolCoefficient
        }
        if (Number(this.model.reworkCoefficient) !== Number(this.oriReworkCoefficient)) {
          payload.reworkCoefficient = this.model.reworkCoefficient
        }
        if (Number(this.model.repairToolCoefficient) !== Number(this.oriRepairToolCoefficient)) {
          payload.repairToolCoefficient = this.model.repairToolCoefficient
        }
        await updateCustomerRelation(payload)
        this.$message.success('修改成功')
        this.close()
        this.$emit('success')
      } catch (error) {
        console.log(error)
      } finally {
        this.loading = false
      }
    },
    close() {
      this.dialogVisible = false
      this.loading = false
      this.oriNewToolCoefficient = null
      this.oriReworkCoefficient = null
      this.oriRepairToolCoefficient = null
      this.model = emptyModel()
      this.$refs.model?.resetFields()
    }
  }
}
</script>
