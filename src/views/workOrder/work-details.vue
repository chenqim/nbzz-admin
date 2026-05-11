<template>
  <div class="app-container">
    <div class="search-panel">
      <el-button
        icon="el-icon-upload2"
        :loading="exporting"
        @click="exportExcel"
      >导出工单明细</el-button>
      <el-form inline :model="queryForm" class="mt-4">
        <el-form-item label="工单编号">
          <el-input
            v-model="queryForm.code"
            placeholder="请输入工单编号进行模糊查询"
            class="w-64"
            clearable
          />
        </el-form-item>
        <el-form-item label="工单名称">
          <el-input
            v-model="queryForm.name"
            placeholder="请输入工单名称进行模糊查询"
            class="w-64"
            clearable
          />
        </el-form-item>
        <el-form-item label="工单级别">
          <el-select
            v-model="queryForm.grade"
            placeholder="请选择工单级别"
            clearable
          >
            <el-option
              v-for="n in Object.keys(config.gradeMap)"
              :key="n"
              :value="n"
              :label="config.gradeMap[n]"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="工单类型">
          <el-select
            v-model="queryForm.type"
            placeholder="请选择工单类型"
            clearable
          >
            <el-option
              v-for="n in Object.keys(config.typeMap)"
              :key="n"
              :value="n"
              :label="config.typeMap[n]"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="工单状态">
          <el-select
            v-model="queryForm.status"
            placeholder="请选择工单状态"
            clearable
          >
            <el-option
              v-for="n in Object.keys(config.statusMap)"
              :key="n"
              :value="n"
              :label="config.statusMap[n]"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="产品名称">
          <el-input
            v-model="queryForm.productName"
            placeholder="请输入产品名称进行模糊查询"
            class="w-64"
            clearable
          />
        </el-form-item>
        <el-form-item label="员工姓名">
          <el-select
            v-model="queryForm.userId"
            placeholder="请选择员工姓名"
            filterable
            clearable
          >
            <el-option
              v-for="n in userList"
              :key="n.id"
              :value="n.id"
              :label="n.userName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="需求日期">
          <el-date-picker
            v-model="queryForm.needDate"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="queryForm.createTime"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="pickerOptions"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            icon="el-icon-search"
            @click="query"
          >查询</el-button>
          <el-button icon="el-icon-refresh" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="list-panel">
      <el-table v-loading="loading" :data="tableData">
        <el-table-column
          label="工单编号 / 工单名称"
          prop="name"
          min-width="160"
          show-overflow-tooltip
        >
          <template v-slot="{ row }">
            <span>{{ row.workOrderCode }}</span>
            <br>
            <span>{{ row.workOrderName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="工单类型" prop="workOrderType" min-width="90" show-overflow-tooltip />
        <el-table-column label="产品类别" prop="productCategoryName" min-width="120" show-overflow-tooltip />
        <el-table-column
          label="产品编号 / 产品名称"
          prop="name"
          min-width="160"
          show-overflow-tooltip
        >
          <template v-slot="{ row }">
            <span>{{ row.productCode }}</span>
            <br>
            <span>{{ row.productName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="生产数量" prop="produceCount" min-width="80" show-overflow-tooltip />
        <el-table-column label="生产工序" prop="workingProcedureName" min-width="160" show-overflow-tooltip />
        <el-table-column
          label="完成人员 / 账号"
          prop="name"
          min-width="120"
          show-overflow-tooltip
        >
          <template v-slot="{ row }">
            <span>{{ row.completeUserName }}</span>
            <br>
            <span>{{ row.completeUserAccount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="完成时间" prop="completeTime" min-width="150" />
        <el-table-column label="创建时间" prop="createTime" min-width="150" />
      </el-table>
      <div class="mt-4 text-right">
        <el-pagination
          background
          :current-page="pageConfig.page"
          :total="pageConfig.total"
          @size-change="sizeChange"
          @current-change="pageChange"
        />
      </div>
    </div>
  </div>
</template>

<script>
import config from './config'
import {
  getWorkDetailsPage,
  exportProcedureExcel
} from '@/api/workOrder'
import { getStaffList } from '@/api/staff'
import dayjs from 'dayjs'

export default {
  name: 'WorkDetailsList',
  data() {
    return {
      queryForm: {
        code: '',
        name: '',
        grade: '',
        type: '',
        status: '',
        productName: '',
        userId: '',
        needDate: [],
        createTime: []
      },
      userList: [],
      loading: false,
      exporting: false,
      tableData: [],
      pageConfig: {
        page: 1,
        size: 20,
        total: 0
      },
      config,
      pickerOptions: {
        shortcuts: [
          {
            text: '最近一周',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      }
    }
  },
  created() {
    this.getList()
    this.getUserList()
  },
  methods: {
    buildListQueryBody() {
      return {
        code: this.queryForm.code || undefined,
        name: this.queryForm.name || undefined,
        grade: this.queryForm.grade || undefined,
        type: this.queryForm.type || undefined,
        status: this.queryForm.status || undefined,
        productInfoName: this.queryForm.productName || undefined,
        userId: this.queryForm.userId || undefined,
        needDateStart: this.queryForm.needDate?.[0] || undefined,
        needDateEnd: this.queryForm.needDate?.[1] || undefined,
        createTimeStart: this.queryForm.createTime?.[0] || undefined,
        createTimeEnd: this.queryForm.createTime?.[1] || undefined
      }
    },
    getList() {
      this.loading = true
      const p = {
        queryParam: {
          ...this.buildListQueryBody()
        },
        pageParam: {
          page: this.pageConfig.page,
          size: this.pageConfig.size
        }
      }
      getWorkDetailsPage(p).then((res) => {
        this.tableData = res.data.records
        this.pageConfig.total = res.data.total
        this.loading = false
      })
    },
    getUserList() {
      getStaffList({
        page: 1,
        size: 99
      }).then((res) => {
        this.userList = res.data.records
          .filter((n) => {
            return ![
              'admin',
              'chenqiming',
              'SunShunJie',
              'WxTestUser'
            ].includes(n.userAccount)
          })
          .sort((a, b) => {
            return a.userName.localeCompare(b.userName)
          })
      })
    },
    query() {
      this.pageConfig.page = 1
      this.getList()
    },
    reset() {
      this.queryForm = {
        code: '',
        name: '',
        grade: '',
        type: '',
        status: '',
        productName: '',
        userId: '',
        needDate: [],
        createTime: []
      }
      this.pageConfig.page = 1
      this.getList()
    },
    async exportExcel() {
      this.exporting = true
      try {
        const res = await exportProcedureExcel(this.buildListQueryBody())
        const blob = res.data
        if (blob.type && blob.type.includes('application/json')) {
          const text = await blob.text()
          const json = JSON.parse(text)
          this.$message.error(json.message || '导出失败')
          return
        }
        const disposition = res.headers['content-disposition']
        let filename = `明细导出_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`
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
