<template>
  <div class="app-container">
    <div class="search-panel">
      <el-button icon="el-icon-plus" type="primary" @click="create">创建</el-button>
      <el-button
        icon="el-icon-upload2"
        :loading="exporting"
        @click="exportExcel"
      >导出产品</el-button>
      <!-- <el-button
        icon="el-icon-download"
        :loading="importing"
        @click="triggerImport"
      >导入关联关系</el-button> -->
      <input
        ref="importFileRef"
        type="file"
        accept=".xlsx,.xls"
        class="hidden-import-input"
        @change="onImportFileChange"
      >
      <el-form inline :model="queryForm" class="mt-4">
        <el-form-item label="ID">
          <el-input v-model="queryForm.id" clearable />
        </el-form-item>
        <el-form-item label="产品编号">
          <el-input v-model="queryForm.code" clearable />
        </el-form-item>
        <el-form-item label="产品名称">
          <el-input v-model="queryForm.name" clearable />
        </el-form-item>
        <el-form-item label="产品类别">
          <el-select v-model="queryForm.category" filterable clearable>
            <el-option v-for="role in categoryList" :key="role.id" :value="role.id" :label="role.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="产品">
          <el-select v-model="queryForm.mainName" filterable clearable>
            <el-option v-for="role in mainNameList" :key="role" :value="role" :label="role" />
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
        <el-table-column label="ID" min-width="200">
          <template v-slot="{ row }">
            <copy-text :value="row.id" />
          </template>
        </el-table-column>
        <el-table-column label="产品编号" prop="code" min-width="180" />
        <el-table-column label="产品名称" prop="name" min-width="180" show-overflow-tooltip />
        <el-table-column label="产品类别" prop="productCategory.name" min-width="100" />
        <el-table-column label="产品" prop="mainName" min-width="100" />
        <el-table-column label="规格型号" prop="spec" min-width="180" show-overflow-tooltip />
        <el-table-column label="状态" min-width="100">
          <template v-slot="{ row }">
            <el-tag :type="statusTypeMap[row.status]">{{ statusMap[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="180" />
        <el-table-column label="创建时间" prop="createTime" min-width="180" />
        <el-table-column label="更新时间" prop="updateTime" min-width="180" />
        <el-table-column label="操作" width="220" fixed="right">
          <template v-slot="{ row }">
            <el-button type="text" @click="detail(row)">详情</el-button>
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
import * as XLSX from 'xlsx'
import dayjs from 'dayjs'
import { getProductPage, deleteProduct, queryMainNameList, createCustomerRelation, exportProductExcel } from '@/api/product'
import { getCategoryList } from '@/api/category'
import Create from './create'

const IMPORT_COLUMN_MAP = {
  customerId: 'customerID',
  productId: 'productID',
  repairToolCoefficient: 'repairCoefficient',
  newToolCoefficient: 'newCoefficient',
  reworkCoefficient: 'reworkCoefficient'
}

export default {
  name: 'ProductList',
  components: {
    Create
  },
  data() {
    return {
      queryForm: {
        id: '',
        code: '',
        name: '',
        category: '',
        mainName: ''
      },
      loading: false,
      exporting: false,
      importing: false,
      tableData: [],
      pageConfig: {
        page: 1,
        size: 20,
        total: 0
      },
      statusMap: {
        enable: '启用',
        disable: '禁用'
      },
      statusTypeMap: {
        enable: 'success',
        disable: 'danger'
      },
      categoryList: [],
      mainNameList: []
    }
  },
  created() {
    this.getCategoryList()
    this.getMainNameList()
    this.getList()
  },
  methods: {
    getCategoryList() {
      getCategoryList({}).then((res) => {
        this.categoryList = res.data
      })
    },
    getMainNameList() {
      queryMainNameList({}).then(res => {
        this.mainNameList = res.data
      })
    },
    buildListQueryBody() {
      return {
        id: this.queryForm.id || undefined,
        code: this.queryForm.code || undefined,
        name: this.queryForm.name || undefined,
        productCategoryId: this.queryForm.category || undefined,
        mainName: this.queryForm.mainName || undefined
      }
    },
    getList() {
      this.loading = true
      getProductPage({
        queryParam: {
          ...this.buildListQueryBody()
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
        id: '',
        code: '',
        name: '',
        category: ''
      }
      this.pageConfig.page = 1
      this.getList()
    },
    create() {
      this.$refs.createRef.open()
    },
    triggerImport() {
      if (this.importing) return
      this.$refs.importFileRef.value = ''
      this.$refs.importFileRef.click()
    },
    parseImportRows(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const workbook = XLSX.read(e.target.result, { type: 'array' })
            const sheetName = workbook.SheetNames[0]
            if (!sheetName) {
              resolve([])
              return
            }
            const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: '' })
            resolve(rows)
          } catch (err) {
            reject(err)
          }
        }
        reader.onerror = () => reject(new Error('读取文件失败'))
        reader.readAsArrayBuffer(file)
      })
    },
    rowToRelationPayload(row) {
      const payload = {}
      Object.keys(IMPORT_COLUMN_MAP).forEach((key) => {
        const col = IMPORT_COLUMN_MAP[key]
        const val = row[col]
        payload[key] = val === null || val === undefined ? '' : String(val).trim()
      })
      return payload
    },
    async onImportFileChange(e) {
      const file = e.target.files && e.target.files[0]
      e.target.value = ''
      if (!file) return
      if (!/\.xlsx?$/i.test(file.name)) {
        this.$message.warning('请选择 .xlsx 或 .xls 文件')
        return
      }
      let rows
      try {
        rows = await this.parseImportRows(file)
      } catch (err) {
        console.log(err)
        this.$message.error('解析 Excel 失败，请检查文件格式')
        return
      }
      const payloads = rows
        .map((row) => this.rowToRelationPayload(row))
        .filter((p) => p.customerId && p.productId)
      if (!payloads.length) {
        this.$message.warning('未找到可导入的数据（需包含 customerID 与 productID）')
        return
      }
      try {
        await this.$confirm(
          `共解析到 ${payloads.length} 条关联关系，确认导入？`,
          '导入产品与客户关联关系',
          { type: 'warning' }
        )
      } catch {
        return
      }
      this.importing = true
      let success = 0
      let failed = 0
      try {
        for (const payload of payloads) {
          try {
            await createCustomerRelation(payload)
            success += 1
          } catch (err) {
            failed += 1
            console.log('import relation failed:', payload, err)
          }
        }
        if (failed === 0) {
          this.$message.success(`导入完成，成功 ${success} 条`)
        } else {
          this.$message.warning(`导入完成：成功 ${success} 条，失败 ${failed} 条`)
        }
      } finally {
        this.importing = false
      }
    },
    detail(row) {
      this.$router.push({ name: 'ProductDetail', params: { id: row.id }})
    },
    update(row) {
      this.$refs.createRef.open(row)
    },
    async del(row) {
      try {
        await this.$confirm('确定删除该产品吗？删除后无法恢复。', '系统提示', {
          type: 'warning'
        })
        await deleteProduct({
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
    async exportExcel() {
      this.exporting = true
      try {
        // 按参数导出后端没实现，暂时导出全量
        const res = await exportProductExcel(this.buildListQueryBody())
        const blob = res.data
        if (blob.type && blob.type.includes('application/json')) {
          const text = await blob.text()
          const json = JSON.parse(text)
          this.$message.error(json.message || '导出失败')
          return
        }
        const disposition = res.headers['content-disposition']
        let filename = `产品导出_${dayjs().format('YYYYMMDDHHmmss')}.xlsx`
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
    pageChange(v) {
      this.pageConfig.page = v
      this.getList()
    }
  }
}
</script>

<style lang="scss" scoped>
.hidden-import-input {
  display: none;
}
</style>
