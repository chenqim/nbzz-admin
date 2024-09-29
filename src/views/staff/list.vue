<template>
  <div class="app-container">
    <div class="search-panel">
      <el-form inline :model="queryForm">
        <el-form-item label="用户名">
          <el-input v-model="queryForm.username" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="queryForm.name" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="query">查询</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="list-panel">
      <el-button type="primary">创建</el-button>
      <el-table v-loading="loading" border :data="tableData" style="margin-top: 16px;">
        <el-table-column label="ID" prop="id" min-width="180" />
        <el-table-column label="用户名" prop="userAccount" min-width="180" />
        <el-table-column label="姓名" prop="userName" min-width="180" />
        <el-table-column label="角色" min-width="180">
          <template v-slot="{ row }">
            <span>{{ row.roles || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="绑定微信号" min-width="180">
          <template v-slot="{ row }">
            <span>{{ row.wxUserId || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" min-width="180" />
        <el-table-column label="更新时间" prop="updateTime" min-width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template v-slot="{ row }">
            <el-button type="text" @click="update(row)">修改</el-button>
            <el-button type="text" @click="del(row)">删除</el-button>
            <el-button type="text" @click="unbindWx(row)">解绑微信号</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div style="text-align: right; margin-top: 16px;">
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
import { getStaffList } from '@/api/staff'

export default {
  name: 'StaffList',
  data() {
    return {
      queryForm: {
        username: '',
        name: ''
      },
      loading: false,
      tableData: [],
      pageConfig: {
        page: 1,
        size: 10,
        total: 0
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      getStaffList({
        userAccount: this.queryForm.username || undefined,
        userName: this.queryForm.name || undefined,
        page: this.pageConfig.page,
        size: this.pageConfig.size
      }).then(res => {
        this.tableData = res.data.records
        this.pageConfig.total = res.data.total
        this.loading = false
      })
    },
    query() {
      this.pageConfig.page = 1
      this.getList()
    },
    reset() {
      this.pageConfig.page = 1
      this.getList()
    },
    update() {},
    del() {},
    unbindWx() {},
    sizeChange() {},
    pageChange() {}
  }
}
</script>

<style lang="scss" scoped>
.w-full {
  width: 100% !important;
}
</style>
