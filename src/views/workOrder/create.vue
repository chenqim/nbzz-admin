<template>
  <el-dialog
    :title="!ins ? '创建工单' : isForce ? '强制修改工单' : '修改工单'"
    :visible.sync="dialogVisible"
    width="501px"
    @close="close"
  >
    <el-form ref="model" :model="model" :rules="rules" label-width="100px">
      <el-form-item label="工单名称" prop="name">
        <el-input v-model="model.name" />
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
      <el-form-item label="生产数量" prop="count">
        <el-input-number v-model="model.count" :precision="0" :min="1" :max="100000000" class="w-full" />
      </el-form-item>
      <el-form-item label="执行日期" prop="execDate">
        <el-date-picker v-model="model.execDate" type="date" placeholder="选择日期" class="w-full" />
      </el-form-item>
      <el-form-item label="需求日期" prop="needDate">
        <el-date-picker v-model="model.needDate" type="date" placeholder="选择日期" class="w-full" />
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
import { getProductList, queryMainNameList } from '@/api/product'
import { createWorkOrder, updateWorkOrder, forceUpdateWorkOrder, getWorkOrderDetail, queryWorkingProcedureList } from '@/api/workOrder'
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
        count: [{ required: true, message: '请输入生产数量', trigger: ['blur', 'change'] }],
        execDate: [{ required: true, message: '请选择执行日期', trigger: ['change'] }],
        needDate: [{ required: true, message: '请选择需求日期', trigger: ['change'] }],
        procedureList: [{ required: true, type: 'array', min: 1, message: '请选择关联工序', trigger: ['change'] }]
      },
      productCategoryList: [],
      productList: [],
      processList: [],
      config,
      isForce: false,
      mainNameList: []
    }
  },
  created() {},
  methods: {
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
      // const product = this.productList.find(n => n.id === v)
      // this.getProcessList(product.productCategoryId)
    },
    ok() {
      this.$refs.model.validate((valid) => {
        if (valid) {
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
      // this.model.name = this.ins.name
      // this.model.grade = this.ins.grade
      // this.model.type = this.ins.type
      // this.model.productInfoId = this.ins.productInfoId
      // this.model.count = this.ins.count
      // this.model.execDate = this.ins.execDate
      // this.model.needDate = this.ins.needDate
      // this.model.procedureList = procedureList.map(n => n.workingProcedureId)
      // this.model.remark = this.ins.remark
    },
    async open(ins, isForce) {
      this.ins = ins
      this.isForce = isForce
      this.getProductCategoryList()
      if (ins) {
        this.getDetail().then(procedureList => {
          this.setDefault(procedureList)
        })
        this.getMainNameList(ins?.productInfo?.productCategoryId)
        this.getProductList(ins?.productInfo?.productCategoryId, ins?.productInfo?.mainName)
        this.getProcessList(ins?.productInfo?.productCategoryId)
      }
      this.dialogVisible = true
    },
    close() {
      this.dialogVisible = false
      this.loading = false
      this.productCategoryList = []
      this.productList = []
      this.processList = []
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
</style>
