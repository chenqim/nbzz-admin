<template>
  <div v-loading="loading" class="app-container">
    <el-button
      class="mb-4"
      icon="el-icon-back"
      @click="goBack"
    >返回列表</el-button>
    <el-descriptions
      title="客户基本信息"
      :column="2"
      border
      :label-style="{ width: '180px' }"
      :content-style="{ minWidth: '180px', maxWidth: '400px' }"
    >
      <el-descriptions-item label="ID">{{ ins.id || '-' }}</el-descriptions-item>
      <el-descriptions-item label="客户名称">{{ ins.customerName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="客户类型">{{ ins.customerType || '-' }}</el-descriptions-item>
      <el-descriptions-item label="客户来源">{{ ins.customerSource || '-' }}</el-descriptions-item>
      <el-descriptions-item label="客户等级">{{ ins.customerLevel || '-' }}</el-descriptions-item>
      <el-descriptions-item label="所属行业">{{ ins.industryType || '-' }}</el-descriptions-item>
      <el-descriptions-item label="所在地区（含详细地址）">{{ ins.address || '-' }}</el-descriptions-item>
      <el-descriptions-item label="负责业务员">{{ ins.businessPersonName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="联系方式">{{ ins.businessPersonPhone || '-' }}</el-descriptions-item>
      <el-descriptions-item label="更新时间">{{ formatUpdateTime(ins.updateTime) }}</el-descriptions-item>
      <el-descriptions-item
        label="关联产品"
        :span="2"
        :content-style="{ minWidth: '180px', maxWidth: 'none' }"
      >
        <div v-if="relationProductLoading" class="relation-products relation-products--loading">
          <i class="el-icon-loading" /> 加载中...
        </div>
        <span v-else-if="!relationProducts.length" class="relation-products-empty">-</span>
        <div v-else class="relation-products">
          <div class="relation-products__tags">
            <el-tag
              v-for="(item, index) in displayedRelationProducts"
              :key="relationProductKey(item, index)"
              size="small"
              type="primary"
              effect="plain"
              class="relation-products__tag"
            >
              {{ item.productName || '-' }}
            </el-tag>
            <el-button
              v-if="relationProducts.length > relationProductCollapseLimit"
              type="text"
              size="mini"
              class="relation-products__toggle"
              :icon="showAllRelationProducts ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"
              @click="showAllRelationProducts = !showAllRelationProducts"
            >
              {{ showAllRelationProducts ? '收起' : `展开全部（共 ${relationProducts.length} 个）` }}
            </el-button>
          </div>
        </div>
      </el-descriptions-item>
    </el-descriptions>

    <div class="section-header">
      <span class="section-title">客户经营信息</span>
      <el-button type="primary" size="small" icon="el-icon-edit-outline" @click="editBusiness">修改经营信息</el-button>
    </div>
    <el-descriptions
      :column="2"
      border
      :label-style="{ width: '180px' }"
      :content-style="{ minWidth: '180px', maxWidth: '400px' }"
    >
      <el-descriptions-item label="统一社会信用代码">{{ ins.unifiedSocialCreditCode || '-' }}</el-descriptions-item>
      <el-descriptions-item label="公司注册地址">{{ ins.companyRegisterAddress || '-' }}</el-descriptions-item>
      <el-descriptions-item label="实际经营地址">{{ ins.companyActualAddress || '-' }}</el-descriptions-item>
      <el-descriptions-item label="成立时间">{{ ins.companyEstablishDate || '-' }}</el-descriptions-item>
      <el-descriptions-item label="规模（人数）">{{ ins.companyScale || '-' }}</el-descriptions-item>
      <el-descriptions-item label="主营产品/经营范围" :span="2">{{ ins.mainProducts || '-' }}</el-descriptions-item>
      <el-descriptions-item label="发票抬头">{{ ins.invoiceTitle || '-' }}</el-descriptions-item>
      <el-descriptions-item label="税号">{{ ins.taxNumber || '-' }}</el-descriptions-item>
      <el-descriptions-item label="开户银行">{{ ins.bankAccount || '-' }}</el-descriptions-item>
      <el-descriptions-item label="银行账号">{{ ins.bankAccountNumber || '-' }}</el-descriptions-item>
      <el-descriptions-item label="地址">{{ ins.invoiceAddress || '-' }}</el-descriptions-item>
      <el-descriptions-item label="电话">{{ ins.invoicePhone || '-' }}</el-descriptions-item>
    </el-descriptions>

    <div class="section-header">
      <span class="section-title">客户联系人信息</span>
      <el-button type="primary" size="small" icon="el-icon-plus" @click="addContact">添加联系人</el-button>
    </div>
    <el-table :data="contactList" border stripe>
      <el-table-column prop="contactName" label="联系人姓名" min-width="100" show-overflow-tooltip />
      <el-table-column prop="position" label="职位" min-width="90" show-overflow-tooltip />
      <el-table-column prop="phone" label="手机号码" min-width="120" show-overflow-tooltip />
      <el-table-column prop="backupPhone" label="备用电话" min-width="120" show-overflow-tooltip />
      <el-table-column prop="wechat" label="微信号" min-width="110" show-overflow-tooltip />
      <el-table-column prop="qq" label="QQ号" min-width="100" show-overflow-tooltip />
      <el-table-column prop="email" label="邮箱" min-width="140" show-overflow-tooltip />
      <el-table-column prop="birthday" label="生日/重要纪念日" min-width="130" show-overflow-tooltip />
      <el-table-column prop="relationshipWeight" label="关系权重" min-width="90" show-overflow-tooltip />
      <el-table-column label="是否主要联系人" min-width="120" align="center">
        <template slot-scope="{ row }">
          <el-tag v-if="row.isPrimary" type="success" size="small">是</el-tag>
          <span v-else>否</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right" align="center">
        <template slot-scope="{ row, $index }">
          <el-button type="text" @click="editContact(row, $index)">编辑</el-button>
          <el-button type="text" @click="deleteContact(row, $index)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <edit-business ref="editBusinessRef" @success="getDetail" />
    <edit-contact ref="editContactRef" @success="getDetail" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import dayjs from 'dayjs'
import { getCustomerDetail, updateCustomer } from '@/api/customer'
import { queryCustomerRelationListByCustomer } from '@/api/product'
import EditBusiness from './edit-business'
import EditContact, { normalizeContactItem, parseContactIndex } from './edit-contact'

export default {
  name: 'CustomerDetail',
  components: {
    EditBusiness,
    EditContact
  },
  data() {
    return {
      loading: false,
      relationProductLoading: false,
      ins: {},
      relationProducts: [],
      showAllRelationProducts: false,
      relationProductCollapseLimit: 10
    }
  },
  computed: {
    ...mapGetters(['roles']),
    hasAdminBossPermission() {
      return this.roles.some((role) => ['Admin', 'Boss'].includes(role))
    },
    contactList() {
      return Array.isArray(this.ins.contactList) ? this.ins.contactList : []
    },
    displayedRelationProducts() {
      if (
        this.showAllRelationProducts ||
        this.relationProducts.length <= this.relationProductCollapseLimit
      ) {
        return this.relationProducts
      }
      return this.relationProducts.slice(0, this.relationProductCollapseLimit)
    }
  },
  created() {
    if (!this.hasAdminBossPermission) {
      this.$message.warning('无权限访问客户详情')
      this.$router.replace({ name: 'CustomerList' })
      return
    }
    this.getDetail()
  },
  methods: {
    formatUpdateTime(val) {
      if (val === null || val === undefined || val === '') return '-'
      const d = dayjs(val)
      return d.isValid() ? d.format('YYYY-MM-DD HH:mm:ss') : String(val)
    },
    getDetail() {
      this.loading = true
      getCustomerDetail({
        id: String(this.$route.params.id)
      })
        .then((res) => {
          this.ins = res.data || {}
          this.getRelationProducts()
        })
        .finally(() => {
          this.loading = false
        })
    },
    getRelationProducts() {
      const customerId = this.ins.id || this.$route.params.id
      if (!customerId) {
        this.relationProducts = []
        return
      }
      this.relationProductLoading = true
      this.showAllRelationProducts = false
      queryCustomerRelationListByCustomer({ id: customerId })
        .then((res) => {
          const data = res.data
          this.relationProducts = Array.isArray(data) ? data : (data?.records || [])
        })
        .catch(() => {
          this.relationProducts = []
        })
        .finally(() => {
          this.relationProductLoading = false
        })
    },
    relationProductKey(item, index) {
      return item.id ?? item.productId ?? item.productInfoId ?? index
    },
    editBusiness() {
      this.$refs.editBusinessRef.open(this.ins)
    },
    addContact() {
      this.$refs.editContactRef.open(this.ins)
    },
    editContact(row, index) {
      this.$refs.editContactRef.open(this.ins, row, index)
    },
    async deleteContact(row, index) {
      const name = row.contactName || '该联系人'
      try {
        await this.$confirm(`确定删除联系人【 ${name} 】吗？`, '系统提示', {
          type: 'warning'
        })
        const deleteIndex = parseContactIndex(index)
        if (deleteIndex == null) return
        const contactList = this.contactList
          .filter((_, i) => i !== deleteIndex)
          .map((item) => normalizeContactItem(item))
        await updateCustomer({
          id: this.ins.id,
          contactList
        })
        this.$message({
          type: 'success',
          message: '删除成功'
        })
        this.getDetail()
      } catch (error) {
        console.log(error)
      }
    },
    goBack() {
      this.$router.push({ name: 'CustomerList' })
    }
  }
}
</script>

<style lang="scss" scoped>
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0;
}

.section-title {
  color: #303133;
  font-size: 16px;
  font-weight: bold;
}

.relation-products {
  width: 100%;
  max-width: 100%;

  &--loading {
    color: #909399;
    font-size: 13px;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  &__tag {
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__toggle.el-button--text {
    margin: 0;
    padding: 0 4px;
    height: 24px;
    line-height: 24px;
    color: #909399;

    &:hover,
    &:focus,
    &:active {
      color: #606266;
    }

    [class*='el-icon-'] {
      color: inherit;
    }
  }

  &-empty {
    color: #909399;
  }
}
</style>
