<template>
  <el-dialog
    :title="!ins ? '创建工序' : '修改工序'"
    :visible.sync="dialogVisible"
    width="500px"
    @close="close"
  >
    <el-form ref="model" :model="model" :rules="rules" label-width="80px">
      <el-form-item label="工序编号" prop="code">
        <el-input v-model="model.code" />
      </el-form-item>
      <el-form-item label="工序名称" prop="name">
        <el-input v-model="model.name" />
      </el-form-item>
      <el-form-item label="工序排序" prop="sort">
        <el-input-number v-model="model.sort" />
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
import { createProcess, updateProcess } from '@/api/process'

export default {
  name: 'CreateProcess',
  emits: ['success'],
  data() {
    return {
      loading: false,
      ins: null,
      model: {
        code: '',
        name: '',
        sort: 1,
        status: 'enable',
        remark: ''
      },
      dialogVisible: false,
      rules: {
        name: [{ required: true, message: '请输入工序名称', trigger: ['blur', 'change'] }],
        sort: [{ required: true, message: '请输入工序排序', trigger: ['blur', 'change'] }]
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
        code: this.model.code,
        name: this.model.name,
        sort: this.model.sort,
        status: this.model.status,
        remark: this.model.remark
      }
    },
    async create() {
      try {
        this.loading = true
        await createProcess(this.handleParams())
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
        await updateProcess(this.handleParams())
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
      this.model.sort = this.ins.sort
      this.model.status = this.ins.status
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
