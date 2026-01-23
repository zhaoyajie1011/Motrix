<template>
  <transition name="batch-import-fade">
    <div class="mo-batch-import-progress" v-if="visible">
      <div class="import-icon">
        <i class="el-icon-loading"></i>
      </div>
      <div class="import-info">
        <div class="import-text">
          <span class="import-label">{{ $t('task.batch-import-title') }}</span>
          <span class="import-count">{{ progress.current }}/{{ progress.total }}</span>
        </div>
        <el-progress
          :percentage="percentage"
          :stroke-width="4"
          :show-text="false"
        ></el-progress>
      </div>
    </div>
  </transition>
</template>

<script>
  import { mapState } from 'vuex'

  export default {
    name: 'mo-batch-import-progress',
    computed: {
      ...mapState('app', {
        batchImportProgress: state => state.batchImportProgress
      }),
      visible () {
        return this.batchImportProgress !== null && !this.batchImportProgress.done
      },
      progress () {
        return this.batchImportProgress || {
          current: 0,
          total: 0,
          batchIndex: 0,
          batchCount: 0
        }
      },
      percentage () {
        if (!this.progress.total) {
          return 0
        }
        return Math.round((this.progress.current / this.progress.total) * 100)
      }
    }
  }
</script>

<style lang="scss">
.mo-batch-import-progress {
  position: fixed;
  right: 180px;
  bottom: 24px;
  z-index: 20;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  min-width: 180px;
  height: 40px;
  padding: 5px 12px;
  border-radius: 100px;
  border: 1px solid $--speedometer-border-color;
  background: $--speedometer-background;
  transition: $--all-transition;

  &:hover {
    border-color: $--speedometer-hover-border-color;
  }

  .import-icon {
    font-size: 20px;
    color: $--speedometer-primary-color;
    margin-right: 8px;

    i {
      animation: importing-rotate 1.5s linear infinite;
    }
  }

  .import-info {
    flex: 1;
    min-width: 0;
  }

  .import-text {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }

  .import-label {
    font-size: 12px;
    color: $--speedometer-text-color;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .import-count {
    font-size: 12px;
    color: $--speedometer-primary-color;
    margin-left: 8px;
    white-space: nowrap;
  }

  .el-progress {
    .el-progress-bar__outer {
      background-color: rgba(0, 0, 0, 0.1);
    }
  }
}

.batch-import-fade-enter-active,
.batch-import-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.batch-import-fade-enter,
.batch-import-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@keyframes importing-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
