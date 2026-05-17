<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="dialogVisible"
    width="640px"
    @close="close"
  >
    <el-form ref="model" :model="model" :rules="rules" label-width="150px">
      <el-form-item label="联系人姓名" prop="contactName">
        <el-input v-model="model.contactName" placeholder="请输入联系人姓名" />
      </el-form-item>
      <el-form-item label="职位" prop="position">
        <el-select v-model="model.position" class="w-full" placeholder="请选择职位">
          <el-option
            v-for="item in positionOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="手机号码" prop="phone">
        <el-input v-model="model.phone" placeholder="请输入手机号码" />
      </el-form-item>
      <el-form-item label="备用电话">
        <el-input v-model="model.backupPhone" placeholder="请输入备用电话" />
      </el-form-item>
      <el-form-item label="微信号">
        <el-input v-model="model.wechat" placeholder="请输入微信号" />
      </el-form-item>
      <el-form-item label="QQ号">
        <el-input v-model="model.qq" placeholder="请输入QQ号" />
      </el-form-item>
      <el-form-item label="邮箱">
        <el-input v-model="model.email" placeholder="请输入邮箱" />
      </el-form-item>
      <el-form-item label="生日/重要纪念日">
        <el-date-picker
          v-model="model.birthday"
          type="date"
          value-format="yyyy-MM-dd"
          placeholder="请选择日期"
          class="w-full"
        />
      </el-form-item>
      <el-form-item label="关系权重" prop="relationshipWeight">
        <el-select v-model="model.relationshipWeight" class="w-full" placeholder="请选择关系权重">
          <el-option
            v-for="item in relationshipWeightOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否主要联系人">
        <el-switch v-model="model.isPrimary" />
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
import { updateCustomer } from '@/api/customer'

const positionOptions = ['老板', '采购', '财务', '技术员', '负责人']
const relationshipWeightOptions = ['决策人', '经办人', '影响人']

const emptyModel = () => ({
  contactName: '',
  position: '',
  phone: '',
  backupPhone: '',
  wechat: '',
  qq: '',
  email: '',
  birthday: '',
  relationshipWeight: '',
  isPrimary: false
})

/** 表格行下标统一转数字，避免 string/number 严格比较导致整行匹配失败或错位 */
export function parseContactIndex(index) {
  if (index == null || index === '') return null
  const n = Number(index)
  return Number.isInteger(n) && n >= 0 ? n : null
}

export function normalizeContactItem(item) {
  const contact = {
    contactName: item.contactName || '',
    position: item.position || '',
    phone: item.phone || '',
    backupPhone: item.backupPhone || '',
    wechat: item.wechat || '',
    qq: item.qq || '',
    email: item.email || '',
    birthday: item.birthday || '',
    relationshipWeight: item.relationshipWeight || '',
    isPrimary: !!item.isPrimary
  }
  const id = item.id != null && item.id !== '' ? item.id : item.contactId
  if (id != null && id !== '') {
    contact.id = id
  }
  return contact
}

function copyContactFields(item) {
  return {
    ...item,
    ...normalizeContactItem(item)
  }
}

/** 按列表下标设置唯一主联系人（编辑/添加流程专用，不依赖 contact.id） */
export function applyPrimaryContactByIndex(contactList, primaryIndex) {
  if (primaryIndex == null || primaryIndex < 0) {
    return contactList
  }
  return contactList.map((item, index) => ({
    ...item,
    isPrimary: index === primaryIndex
  }))
}

export default {
  name: 'EditCustomerContact',
  emits: ['success'],
  data() {
    return {
      loading: false,
      mode: 'add',
      customerId: '',
      existingContactList: [],
      editingContactIndex: null,
      model: emptyModel(),
      dialogVisible: false,
      positionOptions,
      relationshipWeightOptions,
      rules: {
        contactName: [{ required: true, message: '请输入联系人姓名', trigger: 'blur' }],
        position: [{ required: true, message: '请选择职位', trigger: 'change' }],
        phone: [{ required: true, message: '请输入手机号码', trigger: 'blur' }],
        relationshipWeight: [{ required: true, message: '请选择关系权重', trigger: 'change' }]
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.mode === 'edit' ? '编辑联系人' : '添加联系人'
    }
  },
  methods: {
    ok() {
      this.$refs.model.validate((valid) => {
        if (valid) this.submit()
      })
    },
    buildContactPayload() {
      return {
        contactName: this.model.contactName,
        position: this.model.position,
        phone: this.model.phone,
        backupPhone: this.model.backupPhone || '',
        wechat: this.model.wechat || '',
        qq: this.model.qq || '',
        email: this.model.email || '',
        birthday: this.model.birthday || '',
        relationshipWeight: this.model.relationshipWeight,
        isPrimary: !!this.model.isPrimary
      }
    },
    fillModelFromContact(contact) {
      const m = emptyModel()
      Object.keys(m).forEach((key) => {
        if (key === 'isPrimary') {
          m.isPrimary = !!contact.isPrimary
        } else {
          m[key] = contact[key] != null && contact[key] !== '' ? contact[key] : ''
        }
      })
      this.model = m
    },
    buildContactList() {
      const payload = this.buildContactPayload()
      let contactList = this.existingContactList.map((item) => normalizeContactItem(item))

      if (this.mode === 'edit') {
        const editIndex = this.editingContactIndex
        if (editIndex == null) {
          return contactList
        }
        contactList = contactList.map((item, index) => {
          if (index !== editIndex) return item
          const updated = { ...payload }
          if (item.id != null && item.id !== '') {
            updated.id = item.id
          }
          return updated
        })
      } else {
        contactList = [...contactList, payload]
      }

      if (payload.isPrimary) {
        const primaryIndex = this.mode === 'edit'
          ? this.editingContactIndex
          : contactList.length - 1
        contactList = applyPrimaryContactByIndex(contactList, primaryIndex)
      }

      return contactList
    },
    async submit() {
      try {
        this.loading = true
        await updateCustomer({
          id: this.customerId,
          contactList: this.buildContactList()
        })
        this.$message({
          type: 'success',
          message: this.mode === 'edit' ? '保存成功' : '添加成功'
        })
        this.close()
        this.$emit('success')
      } catch (error) {
        console.log(error)
      } finally {
        this.loading = false
      }
    },
    open(ins, contact, index) {
      this.customerId = ins.id
      this.existingContactList = Array.isArray(ins.contactList)
        ? ins.contactList.map((item) => copyContactFields(item))
        : []

      if (contact != null) {
        this.mode = 'edit'
        this.editingContactIndex = parseContactIndex(index)
        this.fillModelFromContact(contact)
      } else {
        this.mode = 'add'
        this.editingContactIndex = null
        this.model = emptyModel()
      }

      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.model && this.$refs.model.clearValidate()
      })
    },
    close() {
      this.dialogVisible = false
      this.loading = false
      this.mode = 'add'
      this.customerId = ''
      this.existingContactList = []
      this.editingContactIndex = null
      this.model = emptyModel()
      this.$refs.model && this.$refs.model.resetFields()
    }
  }
}
</script>

<style lang="scss" scoped>
.w-full {
  width: 100%;
}
</style>
