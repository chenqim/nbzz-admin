<template>
  <el-dialog
    :title="!ins ? '创建工单' : isForce ? '强制修改工单' : '修改工单'"
    :visible.sync="dialogVisible"
    width="501px"
    @close="close"
  >
    <el-form ref="model" :model="model" :rules="rules" label-width="100px">
      <el-form-item label="工单名称" prop="name">
        <el-autocomplete
          v-model="model.name"
          class="w-full"
          :fetch-suggestions="fetchWorkOrderNameSuggestions"
          placeholder="请输入工单名称"
          clearable
        />
      </el-form-item>
      <el-form-item label="工单级别" prop="grade">
        <el-select v-model="model.grade" class="w-full">
          <el-option v-for="n in Object.keys(config.gradeMap)" :key="n" :value="n" :label="config.gradeMap[n]" />
        </el-select>
      </el-form-item>
      <el-form-item label="工单类型" prop="type">
        <el-select v-model="model.type" class="w-full" :disabled="isForce">
          <el-option v-for="n in Object.keys(config.typeMap)" :key="n" :value="n" :label="config.typeMap[n]" />
        </el-select>
      </el-form-item>
      <el-form-item label="产品类别" prop="productCategoryId">
        <el-select v-model="model.productCategoryId" filterable class="w-full" :disabled="isForce" @change="productCategoryChange">
          <el-option v-for="n in productCategoryList" :key="n.id" :value="n.id" :label="n.name" />
        </el-select>
      </el-form-item>
      <el-form-item label="产品" prop="mainName">
        <el-select
          v-model="model.mainName"
          :disabled="isForce"
          filterable
          class="w-full"
          @change="mainNameChange"
        >
          <el-option
            v-for="item in mainNameList"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="生产产品" prop="productInfoId">
        <el-select v-model="model.productInfoId" filterable class="w-full" :disabled="isForce" @change="productChange">
          <el-option v-for="n in productList" :key="n.id" :value="n.id" :label="n.name" />
        </el-select>
      </el-form-item>
      <el-form-item label="客户" prop="customerId">
        <el-select v-model="model.customerId" filterable class="w-full" :disabled="isForce" @change="customerChange">
          <el-option v-for="n in customerList" :key="n.customerId" :value="n.customerId" :label="n.customerName" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="model.customerId" :label="coefficientLabel">
        <el-input
          :value="currentCoefficient != null ? currentCoefficient : '未配置'"
          disabled
          class="w-full"
          :class="{ 'coefficient-warn': !currentCoefficient }"
        />
        <div v-if="!currentCoefficient" style="color:#F56C6C;font-size:12px;line-height:1.4;margin-top:4px;">
          {{ coefficientLabel }}未配置或为0，无法创建/修改工单
        </div>
      </el-form-item>
      <el-form-item label="生产数量" prop="count">
        <el-input-number v-model="model.count" :precision="0" :min="1" :max="100000000" class="w-full" />
      </el-form-item>
      <el-form-item label="执行日期" prop="execDate">
        <el-date-picker v-model="model.execDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" class="w-full" />
      </el-form-item>
      <el-form-item label="需求日期" prop="needDate">
        <el-date-picker v-model="model.needDate" type="date" value-format="yyyy-MM-dd" placeholder="选择日期" class="w-full" />
      </el-form-item>
      <el-form-item label="关联工序" prop="procedureList">
        <el-checkbox-group v-if="processList?.length" v-model="model.procedureList">
          <el-checkbox v-for="n in processList" :key="n.id" :label="n.id" :disabled="isForce">{{ n.name }}</el-checkbox>
        </el-checkbox-group>
        <span v-else>请先选择产品类别</span>
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
import config from './config'
import { getProductList, queryMainNameList, queryCustomerRelationListByProduct } from '@/api/product'
import { createWorkOrder, updateWorkOrder, forceUpdateWorkOrder, getWorkOrderDetail, queryWorkingProcedureList, queryWorkOrderNameList } from '@/api/workOrder'
import { getCategoryList } from '@/api/category'

export default {
  name: 'CreateWorkOrder',
  emits: ['success'],
  data() {
    return {
      loading: false,
      ins: null,
      model: {
        name: '',
        grade: 'middle',
        type: 'produce',
        productCategoryId: '',
        productInfoId: '',
        mainName: '',
        customerId: '',
        count: 1,
        execDate: '',
        needDate: '',
        procedureList: [],
        remark: ''
      },
      dialogVisible: false,
      rules: {
        name: [{ required: true, message: '请输入工单名称', trigger: ['blur', 'change'] }],
        grade: [{ required: true, message: '请选择工单级别', trigger: ['change'] }],
        type: [{ required: true, message: '请选择工单类型', trigger: ['change'] }],
        productCategoryId: [{ required: true, message: '请选择产品类别', trigger: ['change'] }],
        mainName: [{ required: true, message: '请选择产品', trigger: ['change'] }],
        productInfoId: [{ required: true, message: '请选择生产产品', trigger: ['change'] }],
        customerId: [{ required: true, message: '请选择客户', trigger: ['change'] }],
        count: [{ required: true, message: '请输入生产数量', trigger: ['blur', 'change'] }],
        execDate: [{ required: true, message: '请选择执行日期', trigger: ['change'] }],
        needDate: [{ required: true, message: '请选择需求日期', trigger: ['change'] }],
        procedureList: [{ required: true, type: 'array', min: 1, message: '请选择关联工序', trigger: ['change'] }]
      },
      productCategoryList: [],
      productList: [],
      processList: [],
      customerList: [],
      selectedCustomerRelation: null,
      config,
      isForce: false,
      mainNameList: []
    }
  },
  computed: {
    coefficientFieldMap() {
      return {
        produce: 'newToolCoefficient',
        maintenance: 'repairToolCoefficient',
        rework: 'reworkCoefficient'
      }
    },
    coefficientLabelMap() {
      return {
        produce: '新刀系数',
        maintenance: '修刀系数',
        rework: '返工系数'
      }
    },
    coefficientLabel() {
      return this.coefficientLabelMap[this.model.type] || '系数'
    },
    currentCoefficient() {
      if (!this.selectedCustomerRelation) return null
      const field = this.coefficientFieldMap[this.model.type]
      if (!field) return null
      const val = this.selectedCustomerRelation[field]
      return (val === undefined || val === null) ? null : val
    }
  },
  methods: {
    getSuggestions() {
      queryWorkOrderNameList({}).then(res => {
        this.suggestions = res?.data.map(n => ({ value: n })) || []
      })
    },
    fetchWorkOrderNameSuggestions(queryString, cb) {
      const q = (queryString || '').trim()
      if (!q) {
        cb(this.suggestions)
        return
      }
      cb(this.suggestions.filter(n => n.value.toLowerCase().includes(q.toLowerCase())))
    },
    getMainNameList(productCategoryId) {
      this.model.mainName = ''
      if (!productCategoryId) {
        this.mainNameList = []
        return
      }
      queryMainNameList({
        productCategoryId
      }).then(res => {
        this.mainNameList = res.data
      })
    },
    getDetail() {
      return getWorkOrderDetail({ id: this.ins.id }).then(res => {
        return res.data.procedureList
      })
    },
    async getProductCategoryList() {
      const res = await getCategoryList({})
      this.productCategoryList = res.data
    },
    getProductList(productCategoryId, mainName) {
      this.model.productInfoId = ''
      if (!productCategoryId || !mainName) {
        this.productList = []
        return
      }
      getProductList({
        productCategoryId,
        mainName
      }).then(res => {
        this.productList = res.data
      })
    },
    getProcessList(productCategoryId) {
      this.model.procedureList = []
      if (!productCategoryId) {
        this.processList = []
        return
      }
      queryWorkingProcedureList({
        productCategoryId
      }).then(res => {
        this.processList = res.data
      })
    },
    productCategoryChange(v) {
      this.getProcessList(v)
      this.getMainNameList(v)
      this.getProductList(v, this.model.mainName)
    },
    mainNameChange(v) {
      this.getProductList(this.model.productCategoryId, v)
    },
    productChange(v) {
      this.getCustomerList(v)
    },
    customerChange(v) {
      this.selectedCustomerRelation = this.customerList.find(n => n.customerId === v) || null
    },
    getCustomerList(productInfoId, skipReset) {
      if (!skipReset) {
        this.model.customerId = ''
        this.selectedCustomerRelation = null
      }
      if (!productInfoId) {
        this.customerList = []
        return
      }
      queryCustomerRelationListByProduct({ id: productInfoId }).then(res => {
        this.customerList = Array.isArray(res.data) ? res.data : (res.data?.records || [])
        // 如果 model.customerId 已经设置（编辑模式 setDefault 先完成），则同步关联对象
        if (this.model.customerId) {
          this.selectedCustomerRelation = this.customerList.find(n => n.customerId === this.model.customerId) || null
        }
      })
    },
    ok() {
      this.$refs.model.validate((valid) => {
        if (valid) {
          // 校验系数
          if (!this.currentCoefficient) {
            this.$message.error(`${this.coefficientLabel}未配置或为0，无法创建/修改工单`)
            return
          }
          if (this.ins) {
            this.update()
          } else {
            this.create()
          }
        }
      })
    },
    handleParams() {
      return {
        id: this.ins ? this.ins.id : undefined,
        ...this.model
      }
    },
    async create() {
      try {
        this.loading = true
        await createWorkOrder(this.handleParams())
        this.$message({
          type: 'success',
          message: '创建成功'
        })
        this.close()
        this.$emit('success')
      } catch (error) {
        this.loading = false
      }
    },
    async update() {
      try {
        this.loading = true
        if (this.isForce) {
          await forceUpdateWorkOrder(this.handleParams())
        } else {
          await updateWorkOrder(this.handleParams())
        }
        this.$message({
          type: 'success',
          message: '修改成功'
        })
        this.close()
        this.$emit('success')
      } catch (error) {
        this.loading = false
      }
    },
    setDefault(procedureList) {
      this.model = {
        ...this.ins,
        productCategoryId: this.ins.productInfo?.productCategoryId,
        mainName: this.ins.productInfo?.mainName,
        procedureList: procedureList.map(n => n.workingProcedureId)
      }
      // 如果客户列表已加载完成，则同步关联对象
      if (this.model.customerId && this.customerList.length) {
        this.selectedCustomerRelation = this.customerList.find(n => n.customerId === this.model.customerId) || null
      }
    },
    async open(ins, isForce) {
      this.ins = ins
      this.isForce = isForce
      this.getSuggestions()
      this.getProductCategoryList()
      if (ins) {
        this.getDetail().then(procedureList => {
          this.setDefault(procedureList)
        })
        this.getMainNameList(ins?.productInfo?.productCategoryId)
        this.getProductList(ins?.productInfo?.productCategoryId, ins?.productInfo?.mainName)
        this.getProcessList(ins?.productInfo?.productCategoryId)
        // 加载客户列表，skipReset=true 避免覆盖 setDefault 中将要设置的 customerId
        this.getCustomerList(ins.productInfoId, true)
      }
      this.dialogVisible = true
    },
    close() {
      this.dialogVisible = false
      this.loading = false
      this.productCategoryList = []
      this.mainNameList = []
      this.productList = []
      this.processList = []
      this.customerList = []
      this.selectedCustomerRelation = null
      this.model = this.$options.data.call(this).model
      this.$refs.model.resetFields()
    }
  }
}
</script>

<style lang="scss" scoped>
.w-full {
  width: 100% !important;
}
:deep(.coefficient-warn .el-input__inner) {
  color: #F56C6C;
}
</style>
