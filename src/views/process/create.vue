<template>
  <el-dialog
    :title="!ins ? '创建工序' : '修改工序'"
    :visible.sync="dialogVisible"
    width="500px"
    @close="close"
  >
    <el-form ref="model" :model="model" :rules="rules" label-width="80px">
      <el-form-item label="工序编号" prop="code">
        <el-input v-model="model.code" disabled />
      </el-form-item>
      <el-form-item label="工序名称" prop="name">
        <el-input v-model="model.name" />
      </el-form-item>
      <el-form-item label="工序排序" prop="sort">
        <el-input-number v-model="model.sort" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="model.status">
          <el-radio :label="true">启用</el-radio>
          <el-radio :label="false">禁用</el-radio>
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
// import { createOrUpdateStaff } from '@/api/staff'

export default {
  name: 'CreateProcess',
  emits: ['success'],
  data() {
    return {
      loading: false,
      ins: null,
      model: {
        code: 'PROCESS_202410020001',
        name: '',
        sort: 1,
        status: true,
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
          this.create()
        }
      })
    },
    async create() {
      try {
        this.loading = true
        // await createOrUpdateStaff({
        //   id: this.ins ? this.ins.id : undefined,
        //   userAccount: this.model.username,
        //   userName: this.model.name,
        //   roleIdList: [this.model.role],
        //   status: this.model.status
        // })
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
    setDefault() {
      // this.model.username = this.ins.userAccount
      // this.model.name = this.ins.userName
      // this.model.role = this.ins.roleList.map((item) => item.id)[0]
      // this.model.status = this.ins.status
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
