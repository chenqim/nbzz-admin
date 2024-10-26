<template>
  <el-dialog
    :title="!ins ? '创建中转区' : '修改中转区'"
    :visible.sync="dialogVisible"
    width="500px"
    @close="close"
  >
    <el-form ref="model" :model="model" :rules="rules" label-width="100px">
      <el-form-item label="中转区编号" prop="code">
        <el-input v-model="model.code" />
      </el-form-item>
      <el-form-item label="中转区名称" prop="name">
        <el-input v-model="model.name" />
      </el-form-item>
      <el-form-item label="中转区位置" prop="position">
        <el-input v-model="model.position" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="model.status">
          <el-radio label="enable">启用</el-radio>
          <el-radio label="disable">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- <el-form-item label="备注" prop="remark">
        <el-input v-model="model.remark" type="textarea" :rows="3" resize="none" />
      </el-form-item> -->
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
import { createStage, updateStage } from '@/api/stage'

export default {
  name: 'CreateStage',
  emits: ['success'],
  data() {
    return {
      loading: false,
      ins: null,
      model: {
        code: 'ZZQ_' + new Date().getTime(),
        name: '',
        position: '',
        status: 'enable'
        // remark: ''
      },
      dialogVisible: false,
      rules: {
        name: [{ required: true, message: '请输入中转区名称', trigger: ['blur', 'change'] }],
        position: [{ required: true, message: '请输入中转区位置', trigger: ['blur', 'change'] }]
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
        location: this.model.position,
        status: this.model.status
        // remark: this.model.remark
      }
    },
    async create() {
      try {
        this.loading = true
        await createStage(this.handleParams())
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
        await updateStage(this.handleParams())
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
      this.model.position = this.ins.location
      this.model.status = this.ins.status
      // this.model.remark = this.ins.remark
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
