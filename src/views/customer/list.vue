<template>
  <div class="app-container">
    <div class="search-panel">
      <el-button icon="el-icon-plus" type="primary" @click="create">创建</el-button>
      <el-button
        v-if="hasAdminBossPermission"
        icon="el-icon-upload2"
        :loading="exporting"
        @click="exportExcel"
      >导出客户</el-button>
      <el-form inline :model="queryForm" class="mt-4">
        <el-form-item label="客户名称">
          <el-input v-model="queryForm.customerName" clearable placeholder="请输入客户名称" />
        </el-form-item>
        <el-form-item label="客户类型">
          <el-select v-model="queryForm.customerType" clearable placeholder="请选择">
            <el-option
              v-for="item in optionLists.customerTypes"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="客户来源">
          <el-select v-model="queryForm.customerSource" clearable placeholder="请选择">
            <el-option
              v-for="item in optionLists.sources"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="客户等级">
          <el-select v-model="queryForm.customerLevel" clearable placeholder="请选择">
            <el-option
              v-for="item in optionLists.levels"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属行业">
          <el-select v-model="queryForm.industryType" clearable placeholder="请选择">
            <el-option
              v-for="item in optionLists.industries"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="query">查询</el-button>
          <el-button icon="el-icon-refresh" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="list-panel">
      <el-table v-loading="loading" :data="tableData">
        <el-table-column label="ID" prop="id" min-width="160" show-overflow-tooltip />
        <el-table-column label="客户名称" prop="customerName" min-width="140" show-overflow-tooltip />
        <el-table-column label="客户类型" prop="customerType" min-width="110" show-overflow-tooltip />
        <el-table-column label="客户来源" prop="customerSource" min-width="110" show-overflow-tooltip />
        <el-table-column label="客户等级" prop="customerLevel" min-width="100" show-overflow-tooltip />
        <el-table-column label="所属行业" prop="industryType" min-width="110" show-overflow-tooltip />
        <el-table-column label="所在地区（含详细地址）" prop="address" min-width="220" show-overflow-tooltip />
        <el-table-column label="负责业务员" prop="businessPersonName" min-width="110" show-overflow-tooltip />
        <el-table-column label="联系方式" prop="businessPersonPhone" min-width="120" show-overflow-tooltip />
        <el-table-column label="更新时间" min-width="170" show-overflow-tooltip>
          <template v-slot="{ row }">{{ formatUpdateTime(row.updateTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template v-slot="{ row }">
            <el-button
              v-if="hasAdminBossPermission"
              type="text"
              @click="detail(row)"
            >详情</el-button>
            <el-button type="text" @click="update(row)">修改</el-button>
            <el-button type="text" @click="del(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="mt-4 text-right">
        <el-pagination
          background
          :current-page="pageConfig.page"
          :page-size="pageConfig.size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pageConfig.total"
          :page-sizes="[10, 20, 50, 100]"
          @size-change="sizeChange"
          @current-change="pageChange"
        />
      </div>
    </div>
    <create ref="createRef" @success="getList" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import dayjs from 'dayjs'
import { queryCustomerPage, deleteCustomer, exportCustomerExcel } from '@/api/customer'
import Create from './create'

const OPTION_LISTS = {
  customerTypes: ['企业客户', '个人散户', '代理商', '渠道商', '合伙人'],
  sources: ['抖音', '微信', '转介绍', '展会', '线下拜访', '广告', '老客户推荐'],
  levels: ['A高价值', 'B普通', 'C潜在', 'D流失'],
  industries: ['光学', '膜', '红外', '金属加工', '汽车领域']
}

export default {
  name: 'CustomerList',
  components: {
    Create
  },
  data() {
    return {
      optionLists: OPTION_LISTS,
      queryForm: {
        customerName: '',
        customerType: '',
        customerSource: '',
        customerLevel: '',
        industryType: ''
      },
      loading: false,
      exporting: false,
      tableData: [],
      pageConfig: {
        page: 1,
        size: 20,
        total: 0
      }
    }
  },
  computed: {
    ...mapGetters(['roles']),
    hasAdminBossPermission() {
      return this.roles.some((role) => ['Admin', 'Boss'].includes(role))
    }
  },
  created() {
    this.getList()
  },
  methods: {
    formatUpdateTime(val) {
      if (val === null || val === undefined || val === '') return '-'
      const d = dayjs(val)
      return d.isValid() ? d.format('YYYY-MM-DD HH:mm:ss') : String(val)
    },
    buildListQueryBody() {
      return {
        customerName: this.queryForm.customerName || undefined,
        customerType: this.queryForm.customerType || undefined,
        customerSource: this.queryForm.customerSource || undefined,
        customerLevel: this.queryForm.customerLevel || undefined,
        industryType: this.queryForm.industryType || undefined
      }
    },
    getList() {
      this.loading = true
      queryCustomerPage({
        queryParam: {
          ...this.buildListQueryBody()
        },
        pageParam: {
          page: this.pageConfig.page,
          size: this.pageConfig.size
        }
      })
        .then((res) => {
          this.tableData = res.data.records
          this.pageConfig.total = res.data.total
        })
        .finally(() => {
          this.loading = false
        })
    },
    query() {
      this.pageConfig.page = 1
      this.getList()
    },
    reset() {
      this.queryForm = {
        customerName: '',
        customerType: '',
        customerSource: '',
        customerLevel: '',
        industryType: ''
      }
      this.pageConfig.page = 1
      this.getList()
    },
    create() {
      this.$refs.createRef.open()
    },
    async exportExcel() {
      if (!this.hasAdminBossPermission) {
        this.$message.warning('无权限导出')
        return
      }
      this.exporting = true
      try {
        const res = await exportCustomerExcel(this.buildListQueryBody())
        const blob = res.data
        if (blob.type && blob.type.includes('application/json')) {
          const text = await blob.text()
          const json = JSON.parse(text)
          this.$message.error(json.message || '导出失败')
          return
        }
        const disposition = res.headers['content-disposition']
        let filename = `客户导出_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`
        if (disposition) {
          const match = /filename\*?=(?:UTF-8'')?([^;\n]+)/i.exec(disposition)
          if (match && match[1]) {
            filename = decodeURIComponent(match[1].replace(/['"]/g, '').trim())
          }
        }
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
        this.$message.success('导出成功')
      } catch (e) {
        console.log(e)
      } finally {
        this.exporting = false
      }
    },
    detail(row) {
      if (!this.hasAdminBossPermission) {
        this.$message.warning('无权限查看详情')
        return
      }
      this.$router.push({
        name: 'CustomerDetail',
        params: {
          id: row.id
        }
      })
    },
    update(row) {
      this.$refs.createRef.open(row)
    },
    async del(row) {
      try {
        await this.$confirm(`确定删除客户【 ${row.customerName} 】吗？`, '系统提示', {
          type: 'warning'
        })
        await deleteCustomer({ id: String(row.id) })
        this.$message.success({
          message: '删除成功',
          type: 'success'
        })
        this.getList()
      } catch (error) {
        console.log(error)
      }
    },
    sizeChange(v) {
      this.pageConfig.size = v
      this.query()
    },
    pageChange(v) {
      this.pageConfig.page = v
      this.getList()
    }
  }
}
</script>

<style lang="scss" scoped></style>
