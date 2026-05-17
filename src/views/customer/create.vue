<template>
  <el-dialog
    :title="!ins ? '创建客户' : '修改客户'"
    :visible.sync="dialogVisible"
    width="580px"
    @close="close"
  >
    <el-form ref="model" :model="model" :rules="rules" label-width="120px">
      <el-form-item label="客户名称" prop="customerName">
        <el-input v-model="model.customerName" placeholder="请输入客户名称" />
      </el-form-item>
      <el-form-item label="客户类型" prop="customerType">
        <el-select v-model="model.customerType" class="w-full" placeholder="请选择客户类型">
          <el-option
            v-for="item in customerTypeOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="客户来源" prop="customerSource">
        <el-select v-model="model.customerSource" class="w-full" placeholder="请选择客户来源">
          <el-option
            v-for="item in customerSourceOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="客户等级" prop="customerLevel">
        <el-select v-model="model.customerLevel" class="w-full" placeholder="请选择客户等级">
          <el-option
            v-for="item in customerLevelOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="所属行业" prop="industryType">
        <el-select v-model="model.industryType" class="w-full" placeholder="请选择所属行业">
          <el-option
            v-for="item in industryTypeOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="所在地区" prop="regionLabels">
        <el-cascader
          v-model="model.regionLabels"
          class="w-full"
          filterable
          clearable
          :options="regionData"
          :props="regionCascaderProps"
          placeholder="请选择省 / 市 / 区"
          @change="onRegionChange"
        />
      </el-form-item>
      <el-form-item label="详细地址" prop="addressDetail">
        <el-input
          v-model="model.addressDetail"
          type="textarea"
          :rows="2"
          placeholder="请输入街道、门牌号等详细信息"
        />
      </el-form-item>
      <el-form-item label="负责业务员" prop="businessPersonName">
        <el-input v-model="model.businessPersonName" placeholder="请输入负责业务员" />
      </el-form-item>
      <el-form-item label="联系方式" prop="businessPersonPhone">
        <el-input v-model="model.businessPersonPhone" placeholder="请输入业务员联系方式" />
      </el-form-item>
      <el-form-item v-if="ins" label="更新时间">
        <span>{{ lastUpdateDisplay || '-' }}</span>
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
import dayjs from 'dayjs'
import { regionData } from 'element-china-area-data'
import { createCustomer, updateCustomer } from '@/api/customer'

function parseRegionAndDetail(fullAddress, options) {
  if (!fullAddress) return { regionLabels: [], addressDetail: '' }
  let rest = String(fullAddress).trim()
  const path = []
  let opts = options
  while (opts && opts.length) {
    const match = opts.find((o) => rest.startsWith(o.label))
    if (!match) break
    path.push(match.label)
    rest = rest.slice(match.label.length).trim()
    opts = match.children || []
  }
  return { regionLabels: path, addressDetail: rest }
}

function composeAddress(regionLabels, addressDetail) {
  const prefix = Array.isArray(regionLabels) ? regionLabels.join('') : ''
  const detail = (addressDetail || '').trim()
  return `${prefix}${detail}`
}

export default {
  name: 'CreateCustomer',
  emits: ['success'],
  data() {
    const validateRegion = (rule, value, callback) => {
      const regions = this.model.regionLabels
      if (!Array.isArray(regions) || regions.length === 0) {
        callback(new Error('请选择所在地区'))
      } else {
        callback()
      }
    }
    const validatePhone = (rule, value, callback) => {
      const phone = (value || '').trim()
      if (!phone) {
        callback(new Error('请输入联系方式'))
        return
      }
      const pattern = /^((0\d{2,3}-?\d{7,8})|(1[3-9]\d{9}))$/
      if (!pattern.test(phone)) {
        callback(new Error('请输入正确的手机号或固定电话'))
      } else {
        callback()
      }
    }
    return {
      regionData,
      loading: false,
      ins: null,
      lastUpdateDisplay: '',
      regionCascaderProps: {
        expandTrigger: 'hover',
        value: 'label',
        label: 'label',
        children: 'children'
      },
      customerTypeOptions: ['企业客户', '个人散户', '代理商', '渠道商', '合伙人'],
      customerSourceOptions: ['抖音', '微信', '转介绍', '展会', '线下拜访', '广告', '老客户推荐'],
      customerLevelOptions: ['A高价值', 'B普通', 'C潜在', 'D流失'],
      industryTypeOptions: ['光学', '膜', '红外', '金属加工', '汽车领域'],
      model: {
        customerName: '',
        customerType: '',
        customerSource: '',
        customerLevel: '',
        industryType: '',
        regionLabels: [],
        addressDetail: '',
        businessPersonName: '',
        businessPersonPhone: ''
      },
      dialogVisible: false,
      rules: {
        customerName: [
          { required: true, message: '请输入客户名称', trigger: ['blur', 'change'] },
          { min: 2, max: 50, message: '客户名称长度为 2 到 50 个字符', trigger: ['blur', 'change'] }
        ],
        customerType: [{ required: true, message: '请选择客户类型', trigger: ['change'] }],
        customerSource: [{ required: true, message: '请选择客户来源', trigger: ['change'] }],
        customerLevel: [{ required: true, message: '请选择客户等级', trigger: ['change'] }],
        industryType: [{ required: true, message: '请选择所属行业', trigger: ['change'] }],
        regionLabels: [{ required: true, validator: validateRegion, trigger: ['change'] }],
        addressDetail: [
          { required: true, message: '请输入详细地址', trigger: ['blur', 'change'] },
          { min: 2, max: 200, message: '详细地址长度为 2 到 200 个字符', trigger: ['blur', 'change'] }
        ],
        businessPersonName: [{ required: true, message: '请输入负责业务员', trigger: ['blur', 'change'] }],
        businessPersonPhone: [{ required: true, validator: validatePhone, trigger: ['blur', 'change'] }]
      }
    }
  },
  methods: {
    onRegionChange() {
      this.$refs.model && this.$refs.model.validateField('regionLabels')
    },
    formatUpdateTime(val) {
      if (val === null || val === undefined || val === '') return ''
      const d = dayjs(val)
      return d.isValid() ? d.format('YYYY-MM-DD HH:mm:ss') : String(val)
    },
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
        const address = composeAddress(this.model.regionLabels, this.model.addressDetail)
        const payload = {
          customerName: this.model.customerName,
          customerType: this.model.customerType,
          customerSource: this.model.customerSource,
          customerLevel: this.model.customerLevel,
          industryType: this.model.industryType,
          address,
          businessPersonName: this.model.businessPersonName,
          businessPersonPhone: this.model.businessPersonPhone
        }
        if (this.ins) {
          payload.id = this.ins.id
          await updateCustomer(payload)
        } else {
          await createCustomer(payload)
        }
        this.$message({
          type: 'success',
          message: !this.ins ? '创建成功' : '保存成功'
        })
        this.close()
        this.$emit('success')
      } catch (error) {
        console.log(error)
      } finally {
        this.loading = false
      }
    },
    setDefault() {
      this.model.customerName = this.ins.customerName || ''
      this.model.customerType = this.ins.customerType || ''
      this.model.customerSource = this.ins.customerSource || ''
      this.model.customerLevel = this.ins.customerLevel || ''
      this.model.industryType = this.ins.industryType || ''
      const parsed = parseRegionAndDetail(this.ins.address, this.regionData)
      this.model.regionLabels = parsed.regionLabels
      this.model.addressDetail = parsed.addressDetail
      this.model.businessPersonName = this.ins.businessPersonName || ''
      this.model.businessPersonPhone = this.ins.businessPersonPhone || ''
      this.lastUpdateDisplay = this.formatUpdateTime(this.ins.updateTime) || '-'
    },
    open(ins) {
      this.ins = ins
      this.lastUpdateDisplay = ''
      if (ins) {
        this.setDefault()
      } else {
        this.model = { ...this.$options.data.call(this).model }
      }
      this.dialogVisible = true
      this.$nextTick(() => {
        this.$refs.model && this.$refs.model.clearValidate()
      })
    },
    close() {
      this.dialogVisible = false
      this.loading = false
      this.ins = null
      this.lastUpdateDisplay = ''
      this.model = { ...this.$options.data.call(this).model }
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
