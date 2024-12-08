<template>
  <div class="app-container">
    <div class="search-panel">
      <el-button icon="el-icon-plus" type="primary" @click="create">创建</el-button>
      <el-form inline :model="queryForm" class="mt-4">
        <el-form-item label="中转区编号">
          <el-input v-model="queryForm.code" />
        </el-form-item>
        <el-form-item label="中转区名称">
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
        <el-table-column label="中转区编号" prop="code" min-width="180" />
        <el-table-column label="中转区名称" prop="name" min-width="180" />
        <el-table-column label="中转区位置" prop="location" min-width="180" />
        <el-table-column label="状态" min-width="180">
          <template v-slot="{ row }">
            <el-tag :type="statusTypeMap[row.status]">{{ statusMap[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <!-- <el-table-column label="备注" prop="remark" min-width="180" /> -->
        <el-table-column label="创建时间" prop="createTime" min-width="180" />
        <el-table-column label="更新时间" prop="updateTime" min-width="180" />
        <el-table-column label="操作" width="180" fixed="right">
          <template v-slot="{ row }">
            <el-button type="text" @click="update(row)">修改</el-button>
            <el-button type="text" @click="del(row)">删除</el-button>
            <el-button type="text" @click="downloadQRCode(row)">下载二维码</el-button>
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
    <!-- <div class="qrcode" ref="qrCodeUrl"></div> -->
  </div>
</template>

<script>
import QRCode from 'qrcodejs2'
import { getStagePage, deleteStage } from '@/api/stage'
import Create from './create'

export default {
  name: 'StageList',
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
      getStagePage({
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
        await this.$confirm('确定删除该中转区吗？删除后无法恢复。', '系统提示', {
          type: 'warning'
        })
        await deleteStage({
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
    downloadQRCode(row) {
      this.downLoad(row.code, '500*500')
    },
    sizeChange(v) {
      this.pageConfig.size = v
      this.query()
    },
    pageChange(v) {
      this.pageChange.page = v
      this.getList()
    },
    createQRCode(text, el, size) {
      const [width, height] = size.split('*')
      new QRCode(el, {
        text: text,
        width: width,
        height: height,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      })
    },
    downLoad(text, size) {
      const div = document.createElement('div')
      this.createQRCode(text, div, size)
      const canvas = div.querySelector('canvas')
      const imgurl = canvas.toDataURL('image/jpeg')
      const a = document.createElement('a')
      a.href = imgurl
      a.download = text // 图片名称
      a.click()
    }
  }
}
</script>

<style lang="scss" scoped>
// .qrcode{
//   display: inline-block;
//   img {
//     width: 132px;
//     height: 132px;
//     background-color: #fff; //设置白色背景色
//     padding: 6px; // 利用padding的特性，挤出白边
//     box-sizing: border-box;
//   }
// }
</style>
