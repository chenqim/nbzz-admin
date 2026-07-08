<template>
  <el-dialog
    :title="!ins ? '新增备忘' : '编辑备忘'"
    :visible.sync="dialogVisible"
    width="600px"
    @close="close"
  >
    <el-form ref="model" :model="model" :rules="rules" label-width="100px">
      <el-form-item label="备忘标题" prop="title">
        <el-input v-model="model.title" placeholder="例如：商标注册证、阿里云后台账号" />
      </el-form-item>
      <el-form-item label="详细内容" prop="content">
        <el-input
          v-model="model.content"
          type="textarea"
          :rows="5"
          placeholder="存放网站地址、账号、密码、备注等长文本"
        />
      </el-form-item>
      <el-form-item label="到期日期" prop="expireDate">
        <el-date-picker
          v-model="model.expireDate"
          type="date"
          placeholder="不填则无期限（纯记录）"
          value-format="yyyy-MM-dd"
          clearable
          style="width: 100%"
        />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="model.remark" type="textarea" placeholder="选填" />
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
import { createMemo, updateMemo } from '@/api/memo'

export default {
  name: 'CreateMemo',
  emits: ['success'],
  data() {
    return {
      loading: false,
      ins: null,
      model: {
        title: '',
        content: '',
        expireDate: '',
        remark: ''
      },
      dialogVisible: false,
      rules: {
        title: [{ required: true, message: '请输入备忘标题', trigger: ['blur', 'change'] }]
      }
    }
  },
  methods: {
    ok() {
      this.$refs.model.validate((valid) => {
        if (valid) {
          this.submit()
        }
      })
    },
    async submit() {
      try {
        this.loading = true
        const data = {
          title: this.model.title,
          content: this.model.content || undefined,
          expireDate: this.model.expireDate || null,
          remark: this.model.remark || undefined
        }
        if (this.ins) {
          data.id = this.ins.id
          await updateMemo(data)
          this.$message.success('编辑成功')
        } else {
          await createMemo(data)
          this.$message.success('创建成功')
        }
        this.close()
        this.$emit('success')
      } catch (error) {
        this.loading = false
      }
    },
    setDefault() {
      this.model.title = this.ins.title || ''
      this.model.content = this.ins.content || ''
      this.model.expireDate = this.ins.expireDate || ''
      this.model.remark = this.ins.remark || ''
    },
    open(ins) {
      this.ins = ins || null
      if (ins) {
        this.setDefault()
      }
      this.dialogVisible = true
    },
    close() {
      this.dialogVisible = false
      this.loading = false
      this.ins = null
      this.model = this.$options.data.call(this).model
      this.$refs.model && this.$refs.model.resetFields()
    }
  }
}
</script>
