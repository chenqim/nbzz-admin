<template>
  <el-dialog
    title="上传图纸"
    :visible.sync="dialogVisible"
    width="500px"
    :close-on-click-modal="false"
    @close="onDialogClose"
  >
    <el-form ref="uploadFormRef" label-width="80px">
      <el-form-item v-if="product" label="产品编号">
        {{ product.code }}
      </el-form-item>
      <el-form-item v-if="product" label="产品名称">
        {{ product.name }}
      </el-form-item>
      <el-form-item label="图纸">
        <el-upload
          ref="uploadRef"
          action="#"
          :auto-upload="false"
          :file-list="fileList"
          :on-change="onFileChange"
          :on-remove="onFileRemove"
          :before-upload="beforeUpload"
          multiple
        >
          <el-button size="small" type="primary" icon="el-icon-upload2">选择文件</el-button>
          <div slot="tip" class="el-upload__tip">只能上传 pdf/jpg/png 文件，且不超过 10MB</div>
        </el-upload>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button
        type="primary"
        :loading="uploading"
        :disabled="!fileList.length"
        @click="handleUpload"
      >
        {{ uploading ? '上传中...' : '开始上传' }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getOssSignature, saveProductAttachments } from '@/api/product'

export default {
  name: 'UploadDrawing',
  data() {
    return {
      dialogVisible: false,
      product: null,
      fileList: [],
      uploading: false
    }
  },
  methods: {
    open(product) {
      this.product = product
      this.fileList = []
      this.dialogVisible = true
    },
    onDialogClose() {
      this.product = null
      this.fileList = []
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
    onFileChange(file, fileList) {
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
      this.fileList = fileList
    },
    onFileRemove(file, fileList) {
      this.fileList = fileList
    },
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
      if (!this.fileList.length || !this.product) return
      this.uploading = true
      try {
        const attachments = []
        for (let i = 0; i < this.fileList.length; i++) {
          const raw = this.fileList[i].raw || this.fileList[i]
          const info = await this.uploadFileToOss(raw)
          attachments.push({
            fileName: info.fileName,
            fileSize: info.fileSize,
            mimeType: info.mimeType,
            ossKey: info.ossKey,
            productId: this.product.id,
            sortOrder: i
          })
        }
        await saveProductAttachments({ attachments })
        this.$message.success('图纸上传成功')
        this.dialogVisible = false
        this.$emit('success')
      } catch (err) {
        console.log(err)
        this.$message.error(err.message || '上传失败，请重试')
      } finally {
        this.uploading = false
      }
    }
  }
}
</script>
