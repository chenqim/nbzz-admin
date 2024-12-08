<template>
  <div class="app-container">
    <div class="search-panel">
      <el-button icon="el-icon-plus" type="primary" @click="create">创建</el-button>
      <el-form inline :model="queryForm" class="mt-4">
        <el-form-item label="工单名称">
          <el-input v-model="queryForm.name" />
        </el-form-item>
        <el-form-item label="工单级别">
          <el-select v-model="queryForm.grade" clearable>
            <el-option v-for="n in Object.keys(config.gradeMap)" :key="n" :value="n" :label="config.gradeMap[n]" />
          </el-select>
        </el-form-item>
        <el-form-item label="工单状态">
          <el-select v-model="queryForm.status" clearable>
            <el-option v-for="n in Object.keys(config.statusMap)" :key="n" :value="n" :label="config.statusMap[n]" />
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
        <el-table-column label="工单编号" prop="code" min-width="180" />
        <el-table-column label="工单名称" prop="name" min-width="180" />
        <el-table-column label="工单级别" min-width="100">
          <template v-slot="{ row }">
            <el-tag :type="config.gradeTypeMap[row.grade]">{{ config.gradeMap[row.grade] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="工单类型" min-width="100">
          <template v-slot="{ row }">
            <span>{{ config.typeMap[row.type] }}</span>
          </template>
        </el-table-column>
        <el-table-column label="产品名称" prop="productInfo.name" min-width="180" />
        <el-table-column label="需求日期" prop="needDate" min-width="100" />
        <el-table-column label="生产数量" prop="count" min-width="100" />
        <el-table-column label="备注" prop="remark" min-width="180" />
        <el-table-column label="工单状态" min-width="100">
          <template v-slot="{ row }">
            <el-tag :type="config.statusTypeMap[row.status]">{{ config.statusMap[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" min-width="180" />
        <el-table-column label="更新时间" prop="updateTime" min-width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template v-slot="{ row }">
            <el-button type="text" @click="detail(row)">详情</el-button>
            <el-button type="text" :disabled="row.status !== 'create'" @click="update(row)">修改</el-button>
            <el-button type="text" :disabled="row.status !== 'create'" @click="del(row)">删除</el-button>
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
import config from './config'
import { getWorkOrderPage, deleteWorkOrder } from '@/api/workOrder'
import Create from './create'

export default {
  name: 'WorkOrderList',
  components: {
    Create
  },
  data() {
    return {
      queryForm: {
        name: '',
        grade: '',
        status: ''
      },
      loading: false,
      tableData: [],
      pageConfig: {
        page: 1,
        size: 10,
        total: 0
      },
      config
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      getWorkOrderPage({
        queryParam: {
          name: this.queryForm.name || undefined,
          grade: this.queryForm.grade || undefined,
          status: this.queryForm.status || undefined
        },
        pageParam: {
          page: this.pageConfig.page,
          size: this.pageConfig.size
        }
      }).then(res => {
        console.log(res)
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
        name: '',
        grade: '',
        status: ''
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
        await this.$confirm('确定删除该工单吗？删除后无法恢复。', '系统提示', {
          type: 'warning'
        })
        await deleteWorkOrder({
          id: row.id
        })
        this.$message.success({
          message: '删除成功',
          type: 'success'
        })
        this.getList()
      } catch (error) {
        console.log(error)
      }
    },
    detail(row) {
      this.$router.push({
        name: 'WorkOrderDetail',
        params: {
          id: row.id
        }
      })
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
