<template>
  <el-dialog
    :title="!ins ? '创建产品类别' : '修改产品类别'"
    :visible.sync="dialogVisible"
    width="500px"
    @close="close"
  >
    <el-form ref="model" :model="model" :rules="rules" label-width="120px">
      <el-form-item label="产品类别名称" prop="name">
        <el-input v-model="model.name" />
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
import { createCategory, updateCategory } from '@/api/category'

export default {
  name: 'CreateCategory',
  emits: ['success'],
  data() {
    return {
      loading: false,
      ins: null,
      model: {
        name: '',
        remark: ''
      },
      dialogVisible: false,
      rules: {
        name: [{ required: true, message: '请输入产品类别名称', trigger: ['blur', 'change'] }]
      }
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
        name: this.model.name,
        remark: this.model.remark
      }
    },
    async create() {
      try {
        this.loading = true
        await createCategory(this.handleParams())
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
        await updateCategory(this.handleParams())
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
      this.model.name = this.ins.name
      this.model.remark = this.ins.remark
    },
    open(ins) {
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
