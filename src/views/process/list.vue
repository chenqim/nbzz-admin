<template>
  <div class="app-container">
    <div class="search-panel">
      <el-button icon="el-icon-plus" type="primary" @click="create">创建</el-button>
      <el-form inline :model="queryForm" class="mt-4">
        <el-form-item label="工序编号">
          <el-input v-model="queryForm.code" />
        </el-form-item>
        <el-form-item label="工序名称">
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
        <el-table-column label="工序编号" prop="code" min-width="180" />
        <el-table-column label="工序名称" prop="name" min-width="180" />
        <el-table-column label="工序排序" prop="sort" min-width="180" />
        <el-table-column label="状态" min-width="180">
          <template v-slot="{ row }">
            <el-tag :type="statusTypeMap[row.status]">{{ statusMap[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="180" />
        <el-table-column label="创建时间" prop="createTime" min-width="180" />
        <el-table-column label="更新时间" prop="updateTime" min-width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template v-slot="{ row }">
            <el-button type="text" @click="update(row)">修改</el-button>
            <el-button type="text" @click="del(row)">删除</el-button>
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
import { getProcessPage, deleteProcess } from '@/api/process'
import Create from './create'

export default {
  name: 'ProcessList',
  components: {
    Create
  },
  data() {
    return {
      queryForm: {
        code: '',
        name: ''
      },
      loading: false,
      tableData: [],
      pageConfig: {
        page: 1,
        size: 10,
        total: 0
      },
      statusMap: {
        enable: '启用',
        disable: '禁用'
      },
      statusTypeMap: {
        enable: 'success',
        disable: 'danger'
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.loading = true
      getProcessPage({
        queryParam: {
          code: this.queryForm.code || undefined,
          name: this.queryForm.name || undefined
        },
        pageParam: {
          page: this.pageConfig.page,
          size: this.pageConfig.size
        }
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
        code: '',
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
        await this.$confirm('确定删除该工序吗？删除后无法恢复。', '系统提示', {
          type: 'warning'
        })
        await deleteProcess({
          ids: [row.id]
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
    sizeChange(v) {
      this.pageConfig.size = v
      this.query()
    },
    pageChange(v) {
      this.pageChange.page = v
      this.getList()
    }
  }
}
</script>

<style lang="scss" scoped></style>
