<template>
  <el-dialog
    custom-class="tab-title-dialog add-task-dialog"
    width="67vw"
    :visible="visible"
    :top="dialogTop"
    :show-close="false"
    :before-close="beforeClose"
    @open="handleOpen"
    @opened="handleOpened"
    @closed="handleClosed"
  >
    <el-form ref="taskForm" label-position="left" :model="form" :rules="rules">
      <el-tabs :value="type" @tab-click="handleTabClick">
        <el-tab-pane :label="$t('task.txt-task')" name="txt">
          <el-form-item>
            <div class="txt-upload-area">
              <el-upload
                ref="txtUpload"
                class="txt-uploader"
                drag
                action=""
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleTxtFileChange"
                accept=".txt"
              >
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">{{ $t('task.txt-upload-tips') }}</div>
              </el-upload>
              <div class="txt-file-info" v-if="form.txtFileName">
                <span class="txt-file-name">{{ form.txtFileName }}</span>
                <span class="txt-link-count">{{ $t('task.txt-link-count', { count: txtLinkCount }) }}</span>
                <el-button type="text" @click="clearTxtFile">{{ $t('app.clear') }}</el-button>
              </div>
              <el-input
                ref="txtUris"
                type="textarea"
                auto-complete="off"
                :autosize="{ minRows: 5, maxRows: 10 }"
                :placeholder="$t('task.txt-task-preview')"
                v-model="form.txtUris"
                v-if="form.txtUris"
              >
              </el-input>
            </div>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane :label="$t('task.uri-task')" name="uri">
          <el-form-item>
            <el-input
              ref="uri"
              type="textarea"
              auto-complete="off"
              :autosize="{ minRows: 3, maxRows: 5 }"
              :placeholder="$t('task.uri-task-tips')"
              @paste.native="handleUriPaste"
              v-model="form.uris"
            >
            </el-input>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane :label="$t('task.torrent-task')" name="torrent">
          <el-form-item>
            <mo-select-torrent v-on:change="handleTorrentChange" />
          </el-form-item>
        </el-tab-pane>
      </el-tabs>
      <el-row :gutter="12">
        <el-col :span="15" :xs="24">
          <el-form-item
            :label="`${$t('task.task-out')}: `"
            :label-width="formLabelWidth"
          >
            <el-input
              :placeholder="$t('task.task-out-tips')"
              v-model="form.out"
            >
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="9" :xs="24">
          <el-form-item
            :label="`${$t('task.task-split')}: `"
            :label-width="formLabelWidth"
          >
            <el-input-number
              v-model="form.split"
              controls-position="right"
              :min="1"
              :max="config.engineMaxConnectionPerServer"
              :label="$t('task.task-split')"
            >
            </el-input-number>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item
        :label="`${$t('task.task-dir')}: `"
        :label-width="formLabelWidth"
      >
        <el-input
          placeholder=""
          v-model="form.dir"
          :readonly="isMas"
        >
          <mo-history-directory
            slot="prepend"
            @selected="handleHistoryDirectorySelected"
          />
          <mo-select-directory
            v-if="isRenderer"
            slot="append"
            @selected="handleNativeDirectorySelected"
          />
        </el-input>
      </el-form-item>
      <div class="task-advanced-options" v-if="showAdvanced">
        <el-form-item
          :label="`${$t('task.task-user-agent')}: `"
          :label-width="formLabelWidth"
        >
          <el-input
            type="textarea"
            auto-complete="off"
            :autosize="{ minRows: 2, maxRows: 3 }"
            :placeholder="$t('task.task-user-agent')"
            v-model="form.userAgent"
          >
          </el-input>
        </el-form-item>
        <el-form-item
          :label="`${$t('task.task-authorization')}: `"
          :label-width="formLabelWidth"
        >
          <el-input
            type="textarea"
            auto-complete="off"
            :autosize="{ minRows: 2, maxRows: 3 }"
            :placeholder="$t('task.task-authorization')"
            v-model="form.authorization"
          >
          </el-input>
        </el-form-item>
        <el-form-item
          :label="`${$t('task.task-referer')}: `"
          :label-width="formLabelWidth"
        >
          <el-input
            type="textarea"
            auto-complete="off"
            :autosize="{ minRows: 2, maxRows: 3 }"
            :placeholder="$t('task.task-referer')"
            v-model="form.referer"
          >
          </el-input>
        </el-form-item>
        <el-form-item
          :label="`${$t('task.task-cookie')}: `"
          :label-width="formLabelWidth"
        >
          <el-input
            type="textarea"
            auto-complete="off"
            :autosize="{ minRows: 2, maxRows: 3 }"
            :placeholder="$t('task.task-cookie')"
            v-model="form.cookie"
          >
          </el-input>
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="16" :xs="24">
            <el-form-item
              :label="`${$t('task.task-proxy')}: `"
              :label-width="formLabelWidth"
            >
              <el-input
                placeholder="[http://][USER:PASSWORD@]HOST[:PORT]"
                v-model="form.allProxy">
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8" :xs="24">
            <div class="help-link">
              <span>
                {{ $t('preferences.proxy-tips') }}
              </span>
            </div>
          </el-col>
        </el-row>
        <el-form-item label="" :label-width="formLabelWidth" style="margin-top: 12px;">
          <el-checkbox class="chk" v-model="form.newTaskShowDownloading">
            {{$t('task.navigate-to-downloading')}}
          </el-checkbox>
        </el-form-item>
      </div>
    </el-form>
    <button
      slot="title"
      type="button"
      class="el-dialog__headerbtn"
      aria-label="Close"
      @click="handleClose">
      <i class="el-dialog__close el-icon el-icon-close"></i>
    </button>
    <div slot="footer" class="dialog-footer">
      <el-row>
        <el-col :span="9" :xs="9">
          <el-checkbox class="chk" v-model="showAdvanced">
            {{$t('task.show-advanced-options')}}
          </el-checkbox>
        </el-col>
        <el-col :span="15" :xs="15">
          <el-button @click="handleCancel('taskForm')">
            {{$t('app.cancel')}}
          </el-button>
          <el-button
            type="primary"
            @click="submitForm('taskForm')"
          >
            {{$t('app.submit')}}
          </el-button>
        </el-col>
      </el-row>
    </div>
  </el-dialog>
</template>

<script>
  import is from 'electron-is'
  import { mapState } from 'vuex'
  import { isEmpty } from 'lodash'
  import HistoryDirectory from '@/components/Preference/HistoryDirectory'
  import SelectDirectory from '@/components/Native/SelectDirectory'
  import SelectTorrent from '@/components/Task/SelectTorrent'
  import {
    initTaskForm,
    buildUriPayload,
    buildTorrentPayload
  } from '@/utils/task'
  import { ADD_TASK_TYPE } from '@shared/constants'
  import { detectResource } from '@shared/utils'
  import '@/components/Icons/inbox'

  export default {
    name: 'mo-add-task',
    components: {
      [HistoryDirectory.name]: HistoryDirectory,
      [SelectDirectory.name]: SelectDirectory,
      [SelectTorrent.name]: SelectTorrent
    },
    props: {
      visible: {
        type: Boolean,
        default: false
      },
      type: {
        type: String,
        default: ADD_TASK_TYPE.URI
      }
    },
    data () {
      return {
        formLabelWidth: '110px',
        showAdvanced: false,
        form: {},
        rules: {}
      }
    },
    computed: {
      isRenderer: () => is.renderer(),
      isMas: () => is.mas(),
      ...mapState('app', {
        taskList: state => state.taskList,
        batchImportProgress: state => state.batchImportProgress
      }),
      ...mapState('preference', {
        config: state => state.config
      }),
      taskType () {
        return this.type
      },
      dialogTop () {
        return this.showAdvanced ? '8vh' : '15vh'
      },
      txtLinkCount () {
        // 优先使用txtTotalCount（从文件解析得到的完整数量）
        if (this.form.txtTotalCount) {
          return this.form.txtTotalCount
        }
        if (!this.form.txtUris) {
          return 0
        }
        const lines = this.form.txtUris.split('\n').filter(line => line.trim() !== '' && !line.startsWith('...'))
        return lines.length
      },
      isImporting () {
        return this.batchImportProgress !== null && !this.batchImportProgress.done
      },
      importProgressPercent () {
        if (!this.batchImportProgress) {
          return 0
        }
        const { current, total } = this.batchImportProgress
        return Math.round((current / total) * 100)
      }
    },
    watch: {
      taskType (current, previous) {
        if (this.visible && previous === ADD_TASK_TYPE.URI) {
          return
        }

        if (current === ADD_TASK_TYPE.URI) {
          setTimeout(() => {
            this.$refs.uri && this.$refs.uri.focus()
          }, 50)
        }
      },
      visible (current) {
        if (current === true) {
          document.addEventListener('keydown', this.handleHotkey)
        } else {
          document.removeEventListener('keydown', this.handleHotkey)
        }
      }
    },
    methods: {
      async autofillResourceLink () {
        const content = await navigator.clipboard.readText()
        const hasResource = detectResource(content)
        if (!hasResource) {
          return
        }

        if (isEmpty(this.form.uris)) {
          this.form.uris = content
        }
      },
      beforeClose () {
        if (isEmpty(this.form.uris) && isEmpty(this.form.torrent) && isEmpty(this.form.txtUris)) {
          this.handleClose()
        }
      },
      handleOpen () {
        this.form = initTaskForm(this.$store.state)
        if (this.taskType === ADD_TASK_TYPE.URI) {
          this.autofillResourceLink()
          setTimeout(() => {
            this.$refs.uri && this.$refs.uri.focus()
          }, 50)
        }
      },
      handleOpened () {
        this.detectThunderResource(this.form.uris)
      },
      handleCancel () {
        this.$store.dispatch('app/hideAddTaskDialog')
      },
      handleClose () {
        this.$store.dispatch('app/hideAddTaskDialog')
        this.$store.dispatch('app/updateAddTaskOptions', {})
      },
      handleClosed () {
        this.reset()
      },
      handleHotkey (event) {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
          event.preventDefault()

          this.submitForm('taskForm')
        }
      },
      handleTabClick (tab) {
        this.$store.dispatch('app/changeAddTaskType', tab.name)
      },
      handleUriPaste () {
        setImmediate(() => {
          const uris = this.$refs.uri.value
          this.detectThunderResource(uris)
        })
      },
      detectThunderResource (uris = '') {
        if (uris.includes('thunder://')) {
          this.$msg({
            type: 'warning',
            message: this.$t('task.thunder-link-tips'),
            duration: 6000
          })
        }
      },
      handleTorrentChange (torrent, selectedFileIndex) {
        this.form.torrent = torrent
        this.form.selectFile = selectedFileIndex
      },
      handleTxtFileChange (file) {
        if (!file || !file.raw) {
          return
        }
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target.result
          // 解析文件中的链接，每行一个，只过滤空行
          // 兼容处理：移除链接前后的双引号或单引号
          const lines = content.split(/\r?\n/).filter(line => {
            const trimmed = line.trim()
            return trimmed !== ''
          }).map(line => {
            let trimmed = line.trim()
            // 移除前后的双引号
            if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
              trimmed = trimmed.slice(1, -1)
            }
            return trimmed
          })

          if (lines.length === 0) {
            this.$msg.warning(this.$t('task.new-task-uris-required'))
            return
          }

          this.$set(this.form, 'txtFileName', file.name)
          // 存储完整的链接数组，而不是字符串
          this.$set(this.form, 'txtLines', lines)
          this.$set(this.form, 'txtTotalCount', lines.length)
          // 只显示前20行预览，避免textarea渲染大量内容导致卡死
          const previewLines = lines.slice(0, 20)
          const previewText = previewLines.join('\n') + (lines.length > 20 ? `\n... 共 ${lines.length} 个链接` : '')
          this.$set(this.form, 'txtUris', previewText)
          this.detectThunderResource(previewText)
        }
        reader.readAsText(file.raw)
      },
      clearTxtFile () {
        this.form.txtFileName = ''
        this.form.txtUris = ''
        this.form.txtLines = []
        this.form.txtTotalCount = 0
        if (this.$refs.txtUpload) {
          this.$refs.txtUpload.clearFiles()
        }
      },
      handleHistoryDirectorySelected (dir) {
        this.form.dir = dir
      },
      handleNativeDirectorySelected (dir) {
        this.form.dir = dir
        this.$store.dispatch('preference/recordHistoryDirectory', dir)
      },
      reset () {
        this.showAdvanced = false
        this.form = initTaskForm(this.$store.state)
      },
      async addTask (type, form) {
        let payload = null
        if (type === ADD_TASK_TYPE.URI) {
          payload = buildUriPayload(form)
          return this.$store.dispatch('task/addUri', payload)
        } else if (type === ADD_TASK_TYPE.TXT) {
          // TXT 类型：优先使用 txtLines 数组（完整的链接列表）
          // 如果没有 txtLines，则回退到解析 txtUris 字符串
          let urisString = ''
          if (form.txtLines && form.txtLines.length > 0) {
            urisString = form.txtLines.join('\n')
          } else {
            urisString = form.txtUris
          }
          const txtForm = { ...form, uris: urisString }
          payload = buildUriPayload(txtForm)
          return this.$store.dispatch('task/addUri', payload)
        } else if (type === ADD_TASK_TYPE.TORRENT) {
          payload = buildTorrentPayload(form)
          return this.$store.dispatch('task/addTorrent', payload)
        } else if (type === 'metalink') {
        // @TODO addMetalink
        } else {
          console.error('[Motrix] Add task fail', form)
        }
      },
      submitForm (formName) {
        this.$refs[formName].validate(async (valid) => {
          if (!valid) {
            return false
          }

          // TXT 类型需要检查 txtUris 是否有内容
          if (this.type === ADD_TASK_TYPE.TXT && isEmpty(this.form.txtUris)) {
            this.$msg.warning(this.$t('task.new-task-uris-required'))
            return false
          }

          try {
            // 检查是否是大量任务导入（超过50个）
            const isBatchImport = this.type === ADD_TASK_TYPE.TXT && this.txtLinkCount > 50

            // 如果是大量任务导入，先关闭AddTask对话框，让进度对话框显示
            if (isBatchImport) {
              this.$store.dispatch('app/hideAddTaskDialog')
            }

            // 等待任务添加完成
            await this.addTask(this.type, this.form)

            // 如果不是大量导入，在这里关闭对话框
            if (!isBatchImport) {
              this.$store.dispatch('app/hideAddTaskDialog')
            }

            if (this.form.newTaskShowDownloading) {
              this.$router.push({
                path: '/task/active'
              }).catch(err => {
                console.log(err)
              })
            }
          } catch (err) {
            this.$msg.error(this.$t(err.message))
          }
        })
      }
    }
  }
</script>

<style lang="scss">
.el-dialog.add-task-dialog {
  max-width: 632px;
  min-width: 380px;
  .task-advanced-options .el-form-item:last-of-type {
    margin-bottom: 0;
  }
  .el-tabs__header {
    user-select: none;
  }
  .el-input-number.el-input-number--mini {
    width: 100%;
  }
  .help-link {
    font-size: 12px;
    line-height: 14px;
    padding-top: 7px;
    > a {
      color: #909399;
    }
  }
  .el-dialog__footer {
    padding-top: 20px;
    background-color: $--add-task-dialog-footer-background;
    border-radius: 0 0 5px 5px;
  }
  .dialog-footer {
    .chk {
      float: left;
      line-height: 28px;
      &.el-checkbox {
        & .el-checkbox__input {
          line-height: 19px;
        }
        & .el-checkbox__label {
          padding-left: 6px;
        }
      }
    }
  }
  .txt-upload-area {
    .txt-uploader {
      .el-upload {
        width: 100%;
      }
      .el-upload-dragger {
        width: 100%;
        height: 120px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
    }
    .txt-file-info {
      margin: 10px 0;
      padding: 8px 12px;
      background-color: #f5f7fa;
      border-radius: 4px;
      display: flex;
      align-items: center;
      .txt-file-name {
        font-weight: bold;
        margin-right: 15px;
      }
      .txt-link-count {
        color: #67c23a;
        margin-right: 15px;
      }
    }
  }
}
</style>
