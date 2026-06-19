<script setup>
import { ref, computed, markRaw, watch } from 'vue'
import { pinyin } from 'pinyin-pro'
import Sidebar from './components/Sidebar.vue'
import UserManage from './components/features/UserManage.vue'
import RoleManage from './components/features/RoleManage.vue'
import OrderManage from './components/features/OrderManage.vue'
import ProductManage from './components/features/ProductManage.vue'
import ReportStats from './components/features/ReportStats.vue'
import DataBoard from './components/features/DataBoard.vue'

const featureMap = { UserManage, RoleManage, OrderManage, ProductManage, ReportStats, DataBoard }

const menuItems = [
  {
    label: 'SQL处理',
    id: 'sys',
    features: [
      { name: '可执行SQL结构分析', key: 'UserManage' },
      { name: 'NameSqlID查询SQL', key: 'RoleManage' },
    ]
  },
  {
    label: '代码信息提取',
    id: 'biz',
    features: [
      { name: '订单管理', key: 'OrderManage' },
      { name: '商品管理', key: 'ProductManage' },
    ]
  },
  {
    label: '数据分析',
    id: 'data',
    features: [
      { name: '报表统计', key: 'ReportStats' },
      { name: '数据看板', key: 'DataBoard' },
    ]
  },
]

const tabs = ref([])
const activeKey = ref(null)

const activeTab = computed(() => tabs.value.find(t => t.key === activeKey.value))

function onFeatureSelect(feature) {
  const comp = featureMap[feature.key]
  if (!comp) return
  const existing = tabs.value.find(t => t.key === feature.key)
  if (existing) {
    activeKey.value = feature.key
    return
  }
  tabs.value.push({
    key: feature.key,
    name: feature.name,
    component: markRaw(comp),
  })
  activeKey.value = feature.key
}

function closeTab(key) {
  const idx = tabs.value.findIndex(t => t.key === key)
  if (idx === -1) return
  tabs.value.splice(idx, 1)
  if (activeKey.value === key) {
    activeKey.value = tabs.value.length > 0 ? tabs.value[Math.min(idx, tabs.value.length - 1)].key : null
  }
}

function closeTabMouseDown(e, key) {
  if (e.button === 1) {
    e.preventDefault()
    closeTab(key)
  }
}

const searchQuery = ref('')
const searchFocused = ref(false)

const allFeatures = computed(() => {
  const list = []
  for (const group of menuItems) {
    for (const feat of group.features) {
      list.push({ ...feat, group: group.label })
    }
  }
  return list
})

const searchResults = computed(() => {
  if (!searchQuery.value.trim()) return []
  const q = searchQuery.value.toLowerCase().replace(/\s/g, '')
  return allFeatures.value.filter(f => {
    if (f.name.toLowerCase().includes(q)) return true
    const py = pinyin(f.name, { toneType: 'none', separator: ' ' }).toLowerCase()
    const pyFlat = py.replace(/\s/g, '')
    if (pyFlat.includes(q)) return true
    const initials = py.split(' ').map(s => s[0] || '').join('')
    return initials.includes(q)
  })
})

function selectSearchResult(feat) {
  searchQuery.value = ''
  searchFocused.value = false
  onFeatureSelect(feat)
}

watch(searchQuery, () => {
  if (searchQuery.value) searchFocused.value = true
})
</script>

<template>
  <div class="app-layout">
    <Sidebar :menuItems="menuItems" @feature-select="onFeatureSelect" />
    <main class="main-content">
      <div class="search-bar">
        <div class="search-wrapper">
          <input
            v-model="searchQuery"
            class="search-input"
            placeholder="搜索功能..."
            @focus="searchFocused = true"
            @blur="setTimeout(() => searchFocused = false, 200)"
          />
          <div v-if="searchFocused && searchResults.length" class="search-dropdown">
            <div
              v-for="feat in searchResults"
              :key="feat.key"
              class="search-item"
              @mousedown.prevent="selectSearchResult(feat)"
            >
              <span class="search-name">{{ feat.name }}</span>
              <span class="search-group">{{ feat.group }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="tabs.length === 0" class="welcome">
        <h1>EasyWork</h1>
        <p>Create By Shaun, Start from 20260619</p>
      </div>
      <template v-else>
        <div class="tab-bar">
          <div
            v-for="tab in tabs"
            :key="tab.key"
            class="tab-item"
            :class="{ active: tab.key === activeKey }"
            @click="activeKey = tab.key"
            @mousedown="closeTabMouseDown($event, tab.key)"
          >
            <span class="tab-name">{{ tab.name }}</span>
            <span class="tab-close" @click.stop="closeTab(tab.key)">×</span>
          </div>
        </div>
        <div class="tab-content">
          <component :is="activeTab?.component" :key="activeKey" />
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f0f2f5;
}
.welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #bbb;
  user-select: none;
}
.welcome h1 {
  font-size: 42px;
  font-weight: 300;
  margin-bottom: 12px;
  color: #ccc;
}
.search-bar {
  display: flex;
  justify-content: center;
  padding: 12px 24px;
  flex-shrink: 0;
}

.search-wrapper {
  position: relative;
  width: 360px;
}

.search-input {
  width: 100%;
  padding: 8px 14px;
  font-size: 14px;
  border: 1px solid #d9d9d9;
  border-radius: 20px;
  outline: none;
  background: #fff;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input:focus {
  border-color: #1677ff;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1);
}

.search-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 280px;
  overflow-y: auto;
  z-index: 100;
}

.search-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  cursor: pointer;
  transition: background 0.15s;
}

.search-item:hover {
  background: #f5f5f5;
}

.search-name {
  font-size: 14px;
  color: #333;
}

.search-group {
  font-size: 12px;
  color: #999;
}

.tab-bar {
  display: flex;
  align-items: center;
  background: #e8e8e8;
  padding: 0;
  overflow-x: auto;
  flex-shrink: 0;
}
.tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f5f5f5;
  border-right: 1px solid #ddd;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
  font-size: 13px;
  min-width: 0;
  transition: background 0.15s;
}
.tab-item:hover {
  background: #fff;
}
.tab-item.active {
  background: #fff;
  font-weight: 600;
  color: #333;
}
.tab-name {
  color: inherit;
}
.tab-close {
  font-size: 16px;
  line-height: 1;
  color: #999;
  border-radius: 2px;
  padding: 0 2px;
}
.tab-close:hover {
  color: #333;
  background: #e8e8e8;
}
.tab-content {
  flex: 1;
  overflow: auto;
  padding: 24px;
}
</style>
