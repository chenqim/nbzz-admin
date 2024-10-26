<template>
  <el-dialog
    :title="!ins ? '创建产品' : '修改产品'"
    :visible.sync="dialogVisible"
    width="500px"
    @close="close"
  >
    <el-form ref="model" :model="model" :rules="rules" label-width="80px">
      <el-form-item label="产品编号" prop="code">
        <el-input v-model="model.code" />
      </el-form-item>
      <el-form-item label="产品名称" prop="name">
        <el-input v-model="model.name" />
      </el-form-item>
      <el-form-item label="产品类别" prop="category">
        <el-select v-model="model.category" filterable class="w-full">
          <el-option v-for="role in categoryList" :key="role.id" :value="role.id" :label="role.name" />
        </el-select>
      </el-form-item>
      <el-form-item label="规格型号" prop="spec">
        <el-input v-model="model.spec" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="model.status">
          <el-radio label="enable">启用</el-radio>
          <el-radio label="disable">禁用</el-radio>
        </el-radio-group>
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
import { createProduct, updateProduct } from '@/api/product'
import { getCategoryList } from '@/api/category'

export default {
  name: 'CreateProduct',
  emits: ['success'],
  data() {
    return {
      loading: false,
      ins: null,
      model: {
        code: 'CP_' + new Date().getTime(),
        name: '',
        category: '',
        spec: '',
        status: 'enable',
        remark: ''
      },
      dialogVisible: false,
      rules: {
        code: [{ required: true, message: '请输入产品编号', trigger: ['blur', 'change'] }],
        name: [{ required: true, message: '请输入产品名称', trigger: ['blur', 'change'] }],
        category: [{ required: true, message: '请选择产品类别', trigger: ['blur', 'change'] }],
        spec: [{ required: true, message: '请输入规格型号', trigger: ['blur', 'change'] }]
      },
      categoryList: []
    }
  },
  created() {},
  methods: {
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
        code: this.model.code,
        name: this.model.name,
        productCategoryId: this.model.category,
        spec: this.model.spec,
        status: this.model.status,
        remark: this.model.remark
      }
    },
    async create() {
      try {
        this.loading = true
        await createProduct(this.handleParams())
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
        await updateProduct(this.handleParams())
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
    setDefault() {
      this.model.code = this.ins.code
      this.model.name = this.ins.name
      this.model.category = this.ins.productCategoryId
      this.model.spec = this.ins.spec
      this.model.status = this.ins.status
      this.model.remark = this.ins.remark
    },
    getCategoryList() {
      getCategoryList({}).then((res) => {
        this.categoryList = res.data
      })
    },
    open(ins) {
      this.getCategoryList()
      this.ins = ins
      if (ins) {
        this.setDefault()
      }
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
