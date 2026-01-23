<template>
  <div class="mo-speedometer" :class="{ stopped: stat.numActive === 0 && !importing, importing: importing }">
    <div
      class="mode"
      @click="toggleEngineMode"
    >
      <i v-if="!importing">
        <mo-icon name="speedometer" width="24" height="24" />
      </i>
      <i v-else class="importing-icon">
        <i class="el-icon-loading"></i>
      </i>
      <em>{{ engineMode }}</em>
    </div>
    <!-- 导入进度 + 网速同时显示 -->
    <div class="value import-value" v-if="importing">
      <em>{{ $t('task.batch-import-title') }}</em>
      <span class="import-stats">
        <span class="import-count">{{ importProgress.current }}/{{ importProgress.total }}</span>
        <span class="import-speed">{{ stat.downloadSpeed | bytesToSize }}/s</span>
      </span>
    </div>
    <!-- 仅网速显示 -->
    <div class="value" v-else-if="stat.numActive > 0">
      <em>{{ stat.uploadSpeed | bytesToSize }}/s</em>
      <span>{{ stat.downloadSpeed | bytesToSize }}/s</span>
    </div>
  </div>
</template>

<script>
  import { mapState, mapActions } from 'vuex'
  import { bytesToSize } from '@shared/utils'
  import '@/components/Icons/speedometer'

  export default {
    name: 'mo-speedometer',
    computed: {
      ...mapState('app', [
        'stat',
        'batchImportProgress'
      ]),
      ...mapState('preference', [
        'engineMode'
      ]),
      importing () {
        return this.batchImportProgress !== null && !this.batchImportProgress.done
      },
      importProgress () {
        return this.batchImportProgress || {
          current: 0,
          total: 0
        }
      }
    },
    filters: {
      bytesToSize
    },
    methods: {
      ...mapActions('preference', [
        'toggleEngineMode'
      ])
    }
  }
</script>

<style lang="scss">
  .mo-speedometer {
    font-size: 12px;
    position: relative;
    display: inline-block;
    box-sizing: border-box;
    width: 150px;
    height: 40px;
    padding: 5px 10px 5px 48px;
    border-radius: 100px;
    transition: $--all-transition;
    border: 1px solid $--speedometer-border-color;
    background: $--speedometer-background;
    &:hover {
      border-color: $--speedometer-hover-border-color;
    }
    &.importing {
      width: 200px;
    }
    &.stopped {
      width: 40px;
      padding: 0;
      .mode i {
        color: $--speedometer-stopped-color;
      }
      .mode em {
        display: none;
      }

    }
    em {
      font-style: normal;
    }
    .mode {
      font-size: 0;
      position: absolute;
      top: 5px;
      left: 5px;
    }
    .mode i {
      font-size: 20px;
      font-style: normal;
      line-height: 28px;
      display: inline-block;
      box-sizing: border-box;
      width: 28px;
      height: 28px;
      padding: 2px;
      text-align: center;
      vertical-align: top;
      color: $--speedometer-primary-color;
    }
    .mode .importing-icon {
      font-size: 20px;
      color: $--speedometer-primary-color;
      i {
        animation: importing-spin 1.5s linear infinite;
      }
    }
    .mode em {
      display: inline-block;
      width: 0;
      height: 8px;
      margin-left: 4px;
      font-size: 16px;
      line-height: 15px;
      transform: scale(.5);
      vertical-align: top;
      color: $--speedometer-primary-color;
    }
    .mode.mode-auto em {
      color: $--speedometer-text-color;
    }
    .mode.mode-max em {
      color: $--speedometer-primary-color;
    }
    .value {
      font-size: 0;
      overflow: hidden;
      width: 100%;
      text-align: right;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .value em {
      font-size: 16px;
      line-height: 12px;
      display: block;
      width: 120%;
      transform: scale(.625);
      color: $--speedometer-text-color;
    }
    .value.import-value em {
      color: $--speedometer-primary-color;
      width: 100%;
      transform: none;
      font-size: 12px;
    }
    .value .import-stats {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      line-height: 14px;
      margin-top: 2px;
    }
    .value .import-count {
      color: $--speedometer-primary-color;
      font-weight: bold;
    }
    .value .import-speed {
      color: $--speedometer-text-color;
      margin-left: 8px;
    }
    .value span {
      font-size: 13px;
      line-height: 14px;
      display: block;
      margin-top: 2px;
      color: $--speedometer-primary-color;
    }
    .value.import-value em {
      color: $--speedometer-primary-color;
    }
    .no-active {
      font-size: 14px;
      line-height: 28px;
      color: $--speedometer-primary-color;
    }
  }

  @keyframes importing-spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>
