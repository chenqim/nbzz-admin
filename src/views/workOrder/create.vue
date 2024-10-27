<template>
  <el-dialog
    :title="!ins ? '创建工单' : '修改工单'"
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
        <el-select v-model="model.type" class="w-full">
          <el-option v-for="n in Object.keys(config.typeMap)" :key="n" :value="n" :label="config.typeMap[n]" />
        </el-select>
      </el-form-item>
      <el-form-item label="生产产品" prop="productInfoId">
        <el-select v-model="model.productInfoId" filterable class="w-full">
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
        <el-checkbox-group v-model="model.procedureList">
          <el-checkbox v-for="n in processList" :key="n.id" :label="n.id">{{ n.name }}</el-checkbox>
        </el-checkbox-group>
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
import { getProductList } from '@/api/product'
import { getProcessList } from '@/api/process'
import { createWorkOrder, updateWorkOrder, getWorkOrderDetail } from '@/api/workOrder'

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
        productInfoId: '',
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
        productInfoId: [{ required: true, message: '请选择生产产品', trigger: ['change'] }],
        count: [{ required: true, message: '请输入生产数量', trigger: ['blur', 'change'] }],
        execDate: [{ required: true, message: '请选择执行日期', trigger: ['change'] }],
        needDate: [{ required: true, message: '请选择需求日期', trigger: ['change'] }],
        procedureList: [{ required: true, type: 'array', min: 1, message: '请选择关联工序', trigger: ['change'] }]
      },
      productList: [],
      processList: [],
      config
    }
  },
  created() {},
  methods: {
    getDetail() {
      return getWorkOrderDetail({ id: this.ins.id }).then(res => {
        return res.data.procedureList
      })
    },
    getProductList() {
      getProductList({}).then(res => {
        this.productList = res.data
      })
    },
    getProcessList() {
      getProcessList({}).then(res => {
        this.processList = res.data
      })
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
        await updateWorkOrder(this.handleParams())
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
    open(ins) {
      this.ins = ins
      if (ins) {
        this.getDetail().then(procedureList => {
          this.setDefault(procedureList)
        })
      }
      this.getProductList()
      this.getProcessList()
      this.dialogVisible = true
    },
    close() {
      this.dialogVisible = false
      this.loading = false
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
