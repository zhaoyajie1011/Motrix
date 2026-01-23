<template>
  <div class="task-list-container" v-if="taskList.length > 0" ref="container">
    <!-- 当任务数量较大时使用虚拟滚动 -->
    <div v-if="useVirtualScroll" class="virtual-scroll-wrapper" @scroll="handleScroll" ref="scrollWrapper">
      <div class="virtual-scroll-spacer" :style="{ height: totalHeight + 'px' }">
        <div class="virtual-scroll-content" :style="{ position: 'absolute', top: offsetY + 'px', left: 0, right: 0 }">
          <mo-drag-select
            class="task-list task-list-virtual"
            attribute="attr"
            @change="handleDragSelectChange"
          >
            <div
              v-for="item in visibleItems"
              :key="item.gid"
              :attr="item.gid"
              :class="getItemClass(item)"
            >
              <mo-task-item :task="item" />
            </div>
          </mo-drag-select>
        </div>
      </div>
    </div>
    <!-- 任务数量较少时直接渲染 -->
    <mo-drag-select
      v-else
      class="task-list"
      attribute="attr"
      @change="handleDragSelectChange"
    >
      <div
        v-for="item in taskList"
        :key="item.gid"
        :attr="item.gid"
        :class="getItemClass(item)"
      >
        <mo-task-item :task="item" />
      </div>
    </mo-drag-select>
  </div>
  <div class="no-task" v-else>
    <div class="no-task-inner">
      {{ $t('task.no-task') }}
    </div>
  </div>
</template>

<script>
  import { mapState } from 'vuex'
  import { cloneDeep, throttle } from 'lodash'
  import DragSelect from '@/components/DragSelect/Index'
  import TaskItem from './TaskItem'

  // 虚拟滚动阈值，超过此数量使用虚拟滚动
  const VIRTUAL_SCROLL_THRESHOLD = 50
  // 每个任务项的高度（像素）
  const ITEM_HEIGHT = 68
  // 额外渲染的缓冲区任务数量
  const BUFFER_SIZE = 3

  export default {
    name: 'mo-task-list',
    components: {
      [DragSelect.name]: DragSelect,
      [TaskItem.name]: TaskItem
    },
    data () {
      const selectedList = cloneDeep(this.$store.state.task.selectedList) || []
      return {
        selectedList,
        scrollTop: 0,
        containerHeight: 500
      }
    },
    computed: {
      ...mapState('task', {
        taskList: state => state.taskList,
        selectedGidList: state => state.selectedGidList
      }),
      useVirtualScroll () {
        return this.taskList.length > VIRTUAL_SCROLL_THRESHOLD
      },
      totalHeight () {
        return this.taskList.length * ITEM_HEIGHT + 80 // 加上padding
      },
      startIndex () {
        const index = Math.floor(this.scrollTop / ITEM_HEIGHT) - BUFFER_SIZE
        return Math.max(0, index)
      },
      endIndex () {
        const visibleCount = Math.ceil(this.containerHeight / ITEM_HEIGHT)
        const index = Math.floor(this.scrollTop / ITEM_HEIGHT) + visibleCount + BUFFER_SIZE
        return Math.min(this.taskList.length, index)
      },
      visibleItems () {
        return this.taskList.slice(this.startIndex, this.endIndex)
      },
      offsetY () {
        return this.startIndex * ITEM_HEIGHT + 16 // 加上padding-top
      }
    },
    mounted () {
      this.$nextTick(() => {
        this.updateContainerHeight()
      })
      window.addEventListener('resize', this.handleResize)
    },
    beforeDestroy () {
      window.removeEventListener('resize', this.handleResize)
    },
    methods: {
      handleDragSelectChange (selectedList) {
        this.selectedList = selectedList
        this.$store.dispatch('task/selectTasks', cloneDeep(selectedList))
      },
      getItemClass (item) {
        const isSelected = this.selectedList.includes(item.gid)
        return {
          selected: isSelected
        }
      },
      handleScroll: throttle(function (e) {
        this.scrollTop = e.target.scrollTop
      }, 16),
      handleResize: throttle(function () {
        this.updateContainerHeight()
      }, 100),
      updateContainerHeight () {
        if (this.$refs.scrollWrapper) {
          this.containerHeight = this.$refs.scrollWrapper.clientHeight || 500
        } else if (this.$refs.container) {
          this.containerHeight = this.$refs.container.clientHeight || 500
        }
      }
    },
    watch: {
      selectedGidList (newVal) {
        this.selectedList = newVal
      },
      taskList () {
        this.$nextTick(() => {
          this.updateContainerHeight()
        })
      }
    }
  }
</script>

<style lang="scss">
.task-list-container {
  height: 100%;
  overflow: hidden;
}
.virtual-scroll-wrapper {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}
.virtual-scroll-spacer {
  position: relative;
  width: 100%;
}
.virtual-scroll-content {
  width: 100%;
}
.task-list {
  padding: 16px 16px 64px;
  min-height: 100%;
  box-sizing: border-box;
}
.task-list-virtual {
  padding: 0 16px 64px;
}
.no-task {
  display: flex;
  height: 100%;
  text-align: center;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #555;
  user-select: none;
}
.no-task-inner {
  width: 100%;
  padding-top: 360px;
  background: transparent url('~@/assets/no-task.svg') top center no-repeat;
}
</style>
