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
        <el-table-column label="操作" width="280" fixed="right">
          <template v-slot="{ row }">
            <el-button type="text" @click="detail(row)">详情</el-button>
            <el-button type="text" @click="update(row)">修改</el-button>
            <el-button type="text" @click="openUploadDialog(row)">上传图纸</el-button>
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

    <!-- 上传图纸弹窗 -->
    <el-dialog
      title="上传图纸"
      :visible.sync="uploadDialogVisible"
      width="500px"
      :close-on-click-modal="false"
      @close="onUploadDialogClose"
    >
      <el-form ref="uploadFormRef" label-width="80px">
        <el-form-item v-if="uploadProduct" label="产品编号">
          {{ uploadProduct.code }}
        </el-form-item>
        <el-form-item v-if="uploadProduct" label="产品名称">
          {{ uploadProduct.name }}
        </el-form-item>
        <el-form-item label="图纸">
          <el-upload
            ref="uploadRef"
            action="#"
            :auto-upload="false"
            :file-list="uploadFileList"
            :on-change="onUploadFileChange"
            :on-remove="onUploadFileRemove"
            :before-upload="beforeUpload"
            multiple
          >
            <el-button size="small" type="primary" icon="el-icon-upload2">选择文件</el-button>
            <div slot="tip" class="el-upload__tip">只能上传 pdf/jpg/png 文件，且不超过 10MB</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <!-- <div v-if="uploadProduct" class="upload-product-info">
        <p>产品编号：<b>{{ uploadProduct.code }}</b></p>
        <p>产品名称：<b>{{ uploadProduct.name }}</b></p>
      </div> -->
      <!-- <el-upload
        ref="uploadRef"
        action="#"
        :auto-upload="false"
        :file-list="uploadFileList"
        :on-change="onUploadFileChange"
        :on-remove="onUploadFileRemove"
        :before-upload="beforeUpload"
        multiple
      >
        <el-button size="small" type="primary" icon="el-icon-upload2">选择文件</el-button>
        <div slot="tip" class="el-upload__tip">只能上传 pdf/jpg/png 文件，且不超过 10MB</div>
      </el-upload> -->
      <div slot="footer" class="dialog-footer">
        <el-button @click="uploadDialogVisible = false">取 消</el-button>
        <el-button
          type="primary"
          :loading="uploading"
          :disabled="!uploadFileList.length"
          @click="handleUpload"
        >
          {{ uploading ? '上传中...' : '开始上传' }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as XLSX from 'xlsx'
import dayjs from 'dayjs'
import { getProductPage, deleteProduct, queryMainNameList, createCustomerRelation, exportProductExcel, getOssSignature, saveProductAttachments } from '@/api/product'
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
      mainNameList: [],
      // 上传图纸
      uploadDialogVisible: false,
      uploadProduct: null,
      uploadFileList: [],
      uploading: false
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
    openUploadDialog(row) {
      this.uploadProduct = row
      this.uploadFileList = []
      this.uploadDialogVisible = true
    },
    onUploadDialogClose() {
      this.uploadProduct = null
      this.uploadFileList = []
    },
    beforeUpload(file) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
      const isAllowed = allowedTypes.includes(file.type)
      const isLt10M = file.size / 1024 / 1024 < 10
      if (!isAllowed) {
        this.$message.error('只能上传 pdf/jpg/png 格式的文件')
        return false
      }
      if (!isLt10M) {
        this.$message.error('文件大小不能超过 10MB')
        return false
      }
      return true
    },
    onUploadFileChange(file, fileList) {
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
      const raw = file.raw || file
      if (!allowedTypes.includes(raw.type)) {
        this.$message.error('只能上传 pdf/jpg/png 格式的文件')
        this.$refs.uploadRef.handleRemove(file)
        return
      }
      if (raw.size / 1024 / 1024 >= 10) {
        this.$message.error(`文件 ${file.name} 超过 10MB，已移除`)
        this.$refs.uploadRef.handleRemove(file)
        return
      }
      this.uploadFileList = fileList
    },
    onUploadFileRemove(file, fileList) {
      this.uploadFileList = fileList
    },
    /** 上传单个文件到 OSS，返回 { ossKey, fileName, fileSize, mimeType } */
    async uploadFileToOss(file) {
      const signRes = await getOssSignature()
      const ossData = signRes.data
      const suffix = file.name.substring(file.name.lastIndexOf('.'))
      const ossKey = ossData.dir + '/' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) + suffix
      const formData = new FormData()
      formData.append('OSSAccessKeyId', ossData.accessid)
      formData.append('policy', ossData.policy)
      formData.append('signature', ossData.signature)
      formData.append('key', ossKey)
      formData.append('success_action_status', '200')
      formData.append('file', file)
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', ossData.host, true)
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve()
          } else {
            reject(new Error('OSS 上传失败，状态码：' + xhr.status))
          }
        }
        xhr.onerror = () => reject(new Error('OSS 上传网络异常'))
        xhr.send(formData)
      })
      return {
        ossKey,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream'
      }
    },
    async handleUpload() {
      if (!this.uploadFileList.length || !this.uploadProduct) return
      this.uploading = true
      try {
        const attachments = []
        for (let i = 0; i < this.uploadFileList.length; i++) {
          const raw = this.uploadFileList[i].raw || this.uploadFileList[i]
          const info = await this.uploadFileToOss(raw)
          attachments.push({
            fileName: info.fileName,
            fileSize: info.fileSize,
            mimeType: info.mimeType,
            ossKey: info.ossKey,
            productId: this.uploadProduct.id,
            sortOrder: i
          })
        }
        await saveProductAttachments({ attachments })
        this.$message.success('图纸上传成功')
        this.uploadDialogVisible = false
      } catch (err) {
        console.log(err)
        this.$message.error(err.message || '上传失败，请重试')
      } finally {
        this.uploading = false
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

.upload-product-info {
  margin-bottom: 16px;
  font-size: 14px;
  color: #606266;
}
</style>
