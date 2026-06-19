<script setup>
import { ref } from 'vue'

const props = defineProps({
  menuItems: { type: Array, required: true }
})

const emit = defineEmits(['feature-select'])

const expandedMap = ref({})

function toggleExpand(id) {
  expandedMap.value[id] = !expandedMap.value[id]
}

function selectFeature(feature) {
  emit('feature-select', feature)
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-title">EasyWork</div>
    <div class="menu-list">
      <div
        v-for="item in menuItems"
        :key="item.id"
        class="menu-group"
      >
        <button
          class="menu-btn"
          @dblclick="toggleExpand(item.id)"
        >
          {{ item.label }}
          <span class="arrow" :class="{ expanded: expandedMap[item.id] }">▶</span>
        </button>
        <div v-if="expandedMap[item.id]" class="sub-list">
          <button
            v-for="feat in item.features"
            :key="feat.key"
            class="sub-btn"
            @click="selectFeature(feat)"
          >
            {{ feat.name }}
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 220px;
  min-width: 220px;
  background: #001529;
  color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.sidebar-title {
  height: 48px;
  line-height: 48px;
  padding: 0 20px;
  font-size: 18px;
  font-weight: 600;
  background: #002140;
  border-bottom: 1px solid #003055;
  user-select: none;
}
.menu-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}
.menu-group {
  margin: 0;
}
.menu-btn {
  width: 100%;
  padding: 12px 20px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.75);
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: background 0.2s, color 0.2s;
}
.menu-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
.arrow {
  font-size: 10px;
  transition: transform 0.2s;
}
.arrow.expanded {
  transform: rotate(90deg);
}
.sub-list {
  background: rgba(0, 0, 0, 0.25);
}
.sub-btn {
  width: 100%;
  padding: 10px 20px 10px 32px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.65);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  display: block;
  transition: background 0.2s, color 0.2s;
}
.sub-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
</style>
