<template>
  <el-dialog
    :title="!ins ? '创建员工' : '修改员工'"
    :visible.sync="dialogVisible"
    width="500px"
    @close="close"
  >
    <el-form ref="model" :model="model" :rules="rules" label-width="80px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="model.username" :disabled="!!ins" />
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input v-model="model.name" />
      </el-form-item>
      <el-form-item label="角色" prop="role">
        <el-select v-model="model.role" class="w-full">
          <el-option v-for="role in roles" :key="role.id" :value="role.id" :label="role.roleName" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="model.status">
          <el-radio :label="true">启用</el-radio>
          <el-radio :label="false">禁用</el-radio>
        </el-radio-group>
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
import { getRoleList } from '@/api/role'
import { createOrUpdateStaff } from '@/api/staff'
import { validLoginAccount } from '@/utils/validate'

export default {
  name: 'CreateStaff',
  emits: ['success'],
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!validLoginAccount(value)) {
        callback(new Error('用户名长度 4 到 16 位，只能包含字母、数字、下划线或中划线'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      ins: null,
      model: {
        username: '',
        name: '',
        role: '',
        status: true
      },
      dialogVisible: false,
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: ['blur', 'change'] },
          { validator: validateUsername, trigger: ['blur', 'change'] }
        ],
        name: [{ required: true, message: '请输入姓名', trigger: ['blur', 'change'] }],
        role: [{ required: true, message: '请选择角色', trigger: ['change'] }]
      },
      roles: []
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
        await createOrUpdateStaff({
          id: this.ins ? this.ins.id : undefined,
          userAccount: this.model.username,
          userName: this.model.name,
          roleIdList: [this.model.role],
          status: this.model.status
        })
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
    getRoleList() {
      getRoleList().then((res) => {
        this.roles = res.data
      })
    },
    setDefault() {
      this.model.username = this.ins.userAccount
      this.model.name = this.ins.userName
      this.model.role = this.ins.roleList.map((item) => item.id)[0]
      this.model.status = this.ins.status
    },
    open(ins) {
      this.getRoleList()
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
