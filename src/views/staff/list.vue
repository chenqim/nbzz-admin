<template>
  <div class="app-container">
    <div class="search-panel">
      <el-button icon="el-icon-plus" type="primary" @click="create">创建</el-button>
      <el-form inline :model="queryForm" class="mt-4">
        <el-form-item label="用户名">
          <el-input v-model="queryForm.username" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="queryForm.name" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="el-icon-search" @click="query">查询</el-button>
          <el-button icon="el-icon-refresh" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="list-panel">
      <el-table v-loading="loading" :data="tableData">
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
            <el-button type="text" :disabled="row.userAccount === 'admin'" @click="update(row)">修改</el-button>
            <el-button type="text" :disabled="row.userAccount === 'admin'" @click="del(row)">删除</el-button>
            <el-button type="text" @click="unbindWx(row)">解绑微信号</el-button>
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
    <create ref="createRef" @success="getList" />
  </div>
</template>

<script>
import { getStaffList } from '@/api/staff'
import Create from './create'

export default {
  name: 'StaffList',
  components: {
    Create
  },
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
      this.queryForm = {
        username: '',
        name: ''
      }
      this.pageConfig.page = 1
      this.getList()
    },
    create() {
      this.$refs.createRef.open()
    },
    update(row) {
      this.$refs.createRef.open(row)
    },
    async del(row) {
      try {
        await this.$confirm('确定删除该员工吗？删除后无法登录系统。', '系统提示', {
          type: 'warning'
        })
        // await deleteStaff({
        //   ids: [row.id]
        // })
        this.$message.success({
          message: '删除成功',
          type: 'success'
        })
      } catch (error) {
        console.log(error)
      }
    },
    async unbindWx() {
      try {
        await this.$confirm('确定解绑该员工的微信号吗？解绑后无法登录小程序。', '系统提示', {
          type: 'warning'
        })
        // await deleteStaff({
        //   ids: [row.id]
        // })
        this.$message.success({
          message: '解绑成功',
          type: 'success'
        })
      } catch (error) {
        console.log(error)
      }
    },
    sizeChange() {},
    pageChange() {}
  }
}
</script>

<style lang="scss" scoped></style>
