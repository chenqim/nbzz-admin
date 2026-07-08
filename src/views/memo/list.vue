<template>
  <div class="app-container">
    <div class="search-panel">
      <el-button icon="el-icon-plus" type="primary" @click="create">新增备忘</el-button>
      <el-form inline :model="queryForm" class="mt-4">
        <el-form-item label="备忘标题">
          <el-input
            v-model="queryForm.title"
            placeholder="请输入备忘标题进行模糊查询"
            class="w-64"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择状态" clearable>
            <el-option value="NORMAL" label="正常" />
            <el-option value="COMPLETED" label="已完成" />
          </el-select>
        </el-form-item>
        <el-form-item label="到期日期">
          <el-select v-model="queryForm.hasExpireDate" placeholder="请选择是否有到期日期" clearable>
            <el-option :value="true" label="有到期日" />
            <el-option :value="false" label="无到期日" />
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
        <el-table-column label="备忘标题" prop="title" min-width="180" show-overflow-tooltip />
        <el-table-column label="详细内容" prop="content" min-width="220" show-overflow-tooltip>
          <template v-slot="{ row }">
            <span>{{ row.content || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="150" show-overflow-tooltip>
          <template v-slot="{ row }">
            <span>{{ row.remark || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="到期日期" prop="expireDate" min-width="110">
          <template v-slot="{ row }">
            <span v-if="row.expireDate" :class="expireClass(row)">{{ row.expireDate }}</span>
            <span v-else class="text-gray">无期限</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="120">
          <template v-slot="{ row }">
            <el-tag :type="row.status === 'COMPLETED' ? 'info' : 'success'">
              {{ row.status === 'COMPLETED' ? '已完成' : '正常' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" min-width="160" />
        <el-table-column label="更新时间" prop="updateTime" min-width="160" />
        <el-table-column label="操作" width="260" fixed="right">
          <template v-slot="{ row }">
            <el-button type="text" @click="detail(row)">详情</el-button>
            <el-button type="text" @click="edit(row)">编辑</el-button>
            <el-button type="text" @click="toggleComplete(row)">
              {{ row.status === 'COMPLETED' ? '取消完成' : '标记完成' }}
            </el-button>
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
import { getMemoPage, toggleMemoComplete, deleteMemo } from '@/api/memo'
import dayjs from 'dayjs'
import Create from './create'

export default {
  name: 'MemoList',
  components: {
    Create
  },
  data() {
    return {
      queryForm: {
        title: '',
        status: '',
        hasExpireDate: ''
      },
      loading: false,
      tableData: [],
      pageConfig: {
        page: 1,
        size: 20,
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
      getMemoPage({
        queryParam: {
          title: this.queryForm.title || undefined,
          status: this.queryForm.status || undefined,
          hasExpireDate: this.queryForm.hasExpireDate === '' ? undefined : this.queryForm.hasExpireDate
        },
        pageParam: {
          page: this.pageConfig.page,
          size: this.pageConfig.size
        }
      }).then(res => {
        this.tableData = res.data.records
        this.pageConfig.total = res.data.total
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    query() {
      this.pageConfig.page = 1
      this.getList()
    },
    reset() {
      this.queryForm = {
        title: '',
        status: '',
        hasExpireDate: ''
      }
      this.pageConfig.page = 1
      this.getList()
    },
    create() {
      this.$refs.createRef.open()
    },
    edit(row) {
      this.$refs.createRef.open(row)
    },
    detail(row) {
      this.$router.push({
        name: 'MemoDetail',
        params: { id: row.id }
      })
    },
    async toggleComplete(row) {
      try {
        const action = row.status === 'COMPLETED' ? '取消完成' : '标记完成'
        await this.$confirm(`确定将该备忘${action}吗？`, '系统提示', { type: 'warning' })
        await toggleMemoComplete({ id: row.id })
        this.$message.success(`${action}成功`)
        this.getList()
      } catch (error) {
        console.log(error)
      }
    },
    async del(row) {
      try {
        await this.$confirm('确定删除该备忘吗？删除后不可恢复。', '系统提示', { type: 'warning' })
        await deleteMemo({ ids: [row.id] })
        this.$message.success('删除成功')
        this.getList()
      } catch (error) {
        console.log(error)
      }
    },
    expireClass(row) {
      if (!row.expireDate || row.status === 'COMPLETED') return ''
      const diff = dayjs(row.expireDate).diff(dayjs(), 'day')
      if (diff <= 0) return 'expire-text expired'
      if (diff < 7) return 'expire-text expiring'
      return ''
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

<style lang="scss" scoped>
.text-gray {
  color: #909399;
}
.expire-text {
  font-weight: 600;
  &.expired {
    color: #F56C6C;
  }
  &.expiring {
    color: #E6A23C;
  }
}
</style>
