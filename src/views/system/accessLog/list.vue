<template>
  <div class="app-container">
    <div class="search-panel">
      <el-form inline :model="queryForm" class="mt-4">
        <el-form-item label="类名">
          <el-select v-model="queryForm.className" clearable filterable placeholder="请选择类名" @change="onClassNameChange">
            <el-option
              v-for="item in classNameList"
              :key="item.className"
              :label="item.classNameCn"
              :value="item.className"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="方法名">
          <el-select v-model="queryForm.functionName" clearable filterable placeholder="请选择方法名">
            <el-option
              v-for="item in functionNameList"
              :key="item.functionName"
              :label="item.functionNameCn"
              :value="item.functionName"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="操作用户">
          <el-select v-model="queryForm.userId" clearable filterable placeholder="请选择用户">
            <el-option
              v-for="item in userList"
              :key="item.id"
              :label="item.userName"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间">
          <el-date-picker
            v-model="queryForm.dateRange"
            type="daterange"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="query">查询</el-button>
          <el-button icon="el-icon-refresh" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="list-panel">
      <el-table v-loading="loading" :data="tableData">
        <el-table-column label="操作用户" prop="userName" min-width="100" />
        <el-table-column label="类名(中文)" prop="classNameCn" min-width="150" show-overflow-tooltip />
        <el-table-column label="方法名(中文)" prop="functionNameCn" min-width="150" show-overflow-tooltip />
        <el-table-column label="类名" prop="className" min-width="180" show-overflow-tooltip />
        <el-table-column label="方法名" prop="functionName" min-width="180" show-overflow-tooltip />
        <el-table-column label="主机名" prop="hostName" min-width="120" show-overflow-tooltip />
        <el-table-column label="请求参数" prop="paramData" min-width="150" show-overflow-tooltip />
        <el-table-column label="返回数据" prop="returnData" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作时间" prop="operateDate" min-width="170" />
        <!-- <el-table-column label="操作信息" prop="msg" min-width="100" show-overflow-tooltip /> -->
        <el-table-column label="操作" width="100" fixed="right">
          <template v-slot="{ row }">
            <el-button type="text" @click="detail(row)">查看</el-button>
          </template>
        </el-table-column>
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
import { queryLogPage, getControllerMethods } from '@/api/accessLog'
import { getStaffList } from '@/api/staff'

export default {
  name: 'AccessLogList',
  data() {
    return {
      queryForm: {
        className: '',
        functionName: '',
        userId: '',
        dateRange: []
      },
      loading: false,
      tableData: [],
      pageConfig: {
        page: 1,
        size: 20,
        total: 0
      },
      controllerMethods: [],
      classNameList: [],
      functionNameList: [],
      userList: []
    }
  },
  created() {
    this.getList()
    this.fetchControllerMethods()
    this.getUserList()
  },
  methods: {
    getList() {
      this.loading = true
      const queryParam = {}
      if (this.queryForm.className) {
        queryParam.className = this.queryForm.className
      }
      if (this.queryForm.functionName) {
        queryParam.functionName = this.queryForm.functionName
      }
      if (this.queryForm.userId) {
        queryParam.userId = this.queryForm.userId
      }
      if (this.queryForm.dateRange && this.queryForm.dateRange.length === 2) {
        queryParam.startTime = this.queryForm.dateRange[0]
        queryParam.endTime = this.queryForm.dateRange[1]
      }
      queryLogPage({
        pageParam: {
          orders: [],
          page: this.pageConfig.page,
          size: this.pageConfig.size
        },
        queryParam
      }).then(res => {
        this.tableData = res.data.records
        this.pageConfig.total = res.data.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    fetchControllerMethods() {
      getControllerMethods().then(res => {
        this.controllerMethods = res.data || []
        this.classNameList = this.controllerMethods
      })
    },
    onClassNameChange(className) {
      this.queryForm.functionName = ''
      if (className) {
        const selected = this.controllerMethods.find(item => item.className === className)
        this.functionNameList = (selected && selected.methods) ? selected.methods : []
      } else {
        this.functionNameList = []
      }
    },
    getUserList() {
      getStaffList({
        page: 1,
        size: 99
      }).then(res => {
        this.userList = (res.data.records || []).sort((a, b) => {
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
        className: '',
        functionName: '',
        userId: '',
        dateRange: []
      }
      this.functionNameList = []
      this.pageConfig.page = 1
      this.getList()
    },
    detail(row) {
      this.$router.push({
        name: 'AccessLogDetail',
        query: { data: JSON.stringify(row) }
      })
    },
    sizeChange(v) {
      this.pageConfig.size = v
      this.pageConfig.page = 1
      this.getList()
    },
    pageChange(v) {
      this.pageConfig.page = v
      this.getList()
    }
  }
}
</script>

<style lang="scss" scoped></style>
