<script setup>
import { ref } from 'vue'

const sqlText = ref('')
const fileContent = ref(null)
const tables = ref([])
const whereClauses = ref([])
const fields = ref([])
const loading = ref(false)
const fileInput = ref(null)
const dragOver = ref(false)

const MAX_SIZE = 10 * 1024 * 1024

function validateFile(file) {
  if (file.size > MAX_SIZE) {
    alert('文件大小不能超过 10MB')
    return false
  }
  const dotIdx = file.name.lastIndexOf('.')
  if (dotIdx !== -1) {
    const ext = file.name.slice(dotIdx).toLowerCase()
    if (ext !== '.sql' && ext !== '.txt') {
      alert('仅支持 .sql 或 .txt 文件，或无后缀文件')
      return false
    }
  }
  return true
}

function readFile(file) {
  if (!validateFile(file)) return
  const reader = new FileReader()
  reader.onload = () => {
    sqlText.value = file.name
    fileContent.value = reader.result
  }
  reader.readAsText(file)
}

function handleFilePick(e) {
  const file = e.target.files?.[0]
  if (file) readFile(file)
  e.target.value = ''
}

function onDrop(e) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) readFile(file)
}

function onInput() {
  fileContent.value = null
}

async function handleSubmit() {
  const sql = fileContent.value ?? sqlText.value
  if (!sql.trim()) {
    alert('请输入SQL或上传文件')
    return
  }

  loading.value = true
  tables.value = []
  whereClauses.value = []
  fields.value = []

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 3000)

  try {
    const res = await fetch('/sql/AP001', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: sql,
      signal: controller.signal,
    })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`请求失败: ${res.status}`)
    const list = await res.json()
    const data = list[0] || {}

    tables.value = (data.stable || []).map(s => s.name)
    whereClauses.value = data.swhere || []
    fields.value = data.sfields || []
  } catch (err) {
    clearTimeout(timer)
    if (err.name === 'AbortError') {
      alert('请求超时')
    } else {
      alert('请求出错: ' + err.message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="sql-analyzer">
    <textarea
      v-model="sqlText"
      class="sql-input"
      :class="{ 'drag-over': dragOver }"
      placeholder="请输入SQL语句，或拖拽文件到此处..."
      spellcheck="false"
      @dragover.prevent="dragOver = true"
      @dragleave.prevent="dragOver = false"
      @drop.prevent="onDrop"
      @input="onInput"
    ></textarea>
    <div class="action-row">
      <button class="btn btn-primary" :disabled="loading" @click="handleSubmit">{{ loading ? '识别中...' : '开始识别' }}</button>
      <button class="btn btn-default" @click="fileInput.click()">上传文件</button>
      <input ref="fileInput" type="file" accept=".sql,.txt" hidden @change="handleFilePick" />
    </div>
    <div class="result-grid">
      <div class="result-col">
        <div class="col-header">table</div>
        <div class="col-body">
          <div v-for="(t, i) in tables" :key="i" class="row-item">{{ t }}</div>
          <div v-if="tables.length === 0" class="empty-row">暂无数据</div>
        </div>
      </div>
      <div class="result-col">
        <div class="col-header">where</div>
        <div class="col-body">
          <div v-for="(w, i) in whereClauses" :key="i" class="row-item">{{ w }}</div>
          <div v-if="whereClauses.length === 0" class="empty-row">暂无数据</div>
        </div>
      </div>
      <div class="result-col">
        <div class="col-header">fields</div>
        <div class="col-body">
          <div v-for="(f, i) in fields" :key="i" class="row-item">{{ f }}</div>
          <div v-if="fields.length === 0" class="empty-row">暂无数据</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sql-analyzer {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sql-input {
  width: 100%;
  min-height: 200px;
  max-height: 60vh;
  padding: 12px;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s;
  background: #fafafa;
}

.sql-input:focus {
  border-color: #4096ff;
  background: #fff;
}

.sql-input.drag-over {
  border-color: #1677ff;
  background: #f0f5ff;
}

.action-row {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 28px;
  font-size: 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.btn-primary {
  color: #fff;
  background: #1677ff;
}

.btn-primary:hover {
  background: #4096ff;
}

.btn-primary:disabled {
  background: #a0c4ff;
  cursor: not-allowed;
}

.btn-default {
  color: #333;
  background: #fff;
  border: 1px solid #d9d9d9;
}

.btn-default:hover {
  border-color: #1677ff;
  color: #1677ff;
}

.result-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}

.result-col {
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
}

.col-header {
  padding: 10px 14px;
  font-weight: 600;
  font-size: 13px;
  background: #fafafa;
  border-bottom: 1px solid #e8e8e8;
  color: #333;
}

.col-body {
  max-height: 400px;
  overflow-y: auto;
}

.row-item {
  padding: 8px 14px;
  font-size: 13px;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  border-bottom: 1px solid #f0f0f0;
  line-height: 1.5;
  word-break: break-all;
}

.row-item:last-child {
  border-bottom: none;
}

.empty-row {
  padding: 24px 14px;
  text-align: center;
  color: #bbb;
  font-size: 13px;
}
</style>
