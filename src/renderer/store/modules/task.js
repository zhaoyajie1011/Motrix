import api from '@/api'
import { EMPTY_STRING, TASK_STATUS } from '@shared/constants'
import { checkTaskIsBT, intersection } from '@shared/utils'

const state = {
  currentList: 'active',
  taskDetailVisible: false,
  currentTaskGid: EMPTY_STRING,
  enabledFetchPeers: false,
  currentTaskItem: null,
  currentTaskFiles: [],
  currentTaskPeers: [],
  seedingList: [],
  taskList: [],
  selectedGidList: []
}

const getters = {
}

const mutations = {
  UPDATE_SEEDING_LIST (state, seedingList) {
    state.seedingList = seedingList
  },
  UPDATE_TASK_LIST (state, taskList) {
    state.taskList = taskList
  },
  UPDATE_SELECTED_GID_LIST (state, gidList) {
    state.selectedGidList = gidList
  },
  CHANGE_CURRENT_LIST (state, currentList) {
    state.currentList = currentList
  },
  CHANGE_TASK_DETAIL_VISIBLE (state, visible) {
    state.taskDetailVisible = visible
  },
  UPDATE_CURRENT_TASK_GID (state, gid) {
    state.currentTaskGid = gid
  },
  UPDATE_ENABLED_FETCH_PEERS (state, enabled) {
    state.enabledFetchPeers = enabled
  },
  UPDATE_CURRENT_TASK_ITEM (state, task) {
    state.currentTaskItem = task
  },
  UPDATE_CURRENT_TASK_FILES (state, files) {
    state.currentTaskFiles = files
  },
  UPDATE_CURRENT_TASK_PEERS (state, peers) {
    state.currentTaskPeers = peers
  }
}

const actions = {
  changeCurrentList ({ commit, dispatch }, currentList) {
    commit('CHANGE_CURRENT_LIST', currentList)
    commit('UPDATE_SELECTED_GID_LIST', [])
    dispatch('fetchList')
  },
  fetchList ({ commit, state }) {
    return api.fetchTaskList({ type: state.currentList })
      .then((data) => {
        commit('UPDATE_TASK_LIST', data)

        const { selectedGidList } = state
        const gids = data.map((task) => task.gid)
        const list = intersection(selectedGidList, gids)
        commit('UPDATE_SELECTED_GID_LIST', list)
      })
  },
  selectTasks ({ commit }, list) {
    commit('UPDATE_SELECTED_GID_LIST', list)
  },
  selectAllTask ({ commit, state }) {
    const gids = state.taskList.map((task) => task.gid)
    commit('UPDATE_SELECTED_GID_LIST', gids)
  },
  fetchItem ({ dispatch }, gid) {
    return api.fetchTaskItem({ gid })
      .then((data) => {
        dispatch('updateCurrentTaskItem', data)
      })
  },
  fetchItemWithPeers ({ dispatch }, gid) {
    return api.fetchTaskItemWithPeers({ gid })
      .then((data) => {
        console.log('fetchItemWithPeers===>', data)
        dispatch('updateCurrentTaskItem', data)
      })
  },
  showTaskDetailByGid ({ commit, dispatch }, gid) {
    api.fetchTaskItem({ gid })
      .then((task) => {
        dispatch('updateCurrentTaskItem', task)
        commit('UPDATE_CURRENT_TASK_GID', task.gid)
        commit('CHANGE_TASK_DETAIL_VISIBLE', true)
      })
  },
  showTaskDetail ({ commit, dispatch }, task) {
    dispatch('updateCurrentTaskItem', task)
    commit('UPDATE_CURRENT_TASK_GID', task.gid)
    commit('CHANGE_TASK_DETAIL_VISIBLE', true)
  },
  hideTaskDetail ({ commit }) {
    commit('CHANGE_TASK_DETAIL_VISIBLE', false)
  },
  toggleEnabledFetchPeers ({ commit }, enabled) {
    commit('UPDATE_ENABLED_FETCH_PEERS', enabled)
  },
  updateCurrentTaskItem ({ commit }, task) {
    commit('UPDATE_CURRENT_TASK_ITEM', task)
    if (task) {
      commit('UPDATE_CURRENT_TASK_FILES', task.files)
      commit('UPDATE_CURRENT_TASK_PEERS', task.peers)
    } else {
      commit('UPDATE_CURRENT_TASK_FILES', [])
      commit('UPDATE_CURRENT_TASK_PEERS', [])
    }
  },
  updateCurrentTaskGid ({ commit }, gid) {
    commit('UPDATE_CURRENT_TASK_GID', gid)
  },
  addUri ({ dispatch, commit }, data) {
    const { uris, outs, options } = data
    const taskCount = uris.length
    console.log(`[Motrix] addUri: Adding ${taskCount} URIs`)

    // 大量任务时显示进度提示
    const isBatchImport = taskCount > 50

    const onProgress = isBatchImport
      ? (progress) => {
        // 通过commit更新进度状态，可用于UI显示
        commit('app/UPDATE_BATCH_IMPORT_PROGRESS', progress, { root: true })
      }
      : null

    if (isBatchImport) {
      // 初始化进度状态
      commit('app/UPDATE_BATCH_IMPORT_PROGRESS', {
        current: 0,
        total: taskCount,
        batchIndex: 0,
        batchCount: Math.ceil(taskCount / 50),
        done: false
      }, { root: true })
    }

    return api.addUri({ uris, outs, options }, onProgress)
      .then(() => {
        if (isBatchImport) {
          // 清除进度状态
          commit('app/UPDATE_BATCH_IMPORT_PROGRESS', null, { root: true })
        }
        dispatch('fetchList')
        dispatch('app/updateAddTaskOptions', {}, { root: true })
      })
      .catch((err) => {
        if (isBatchImport) {
          commit('app/UPDATE_BATCH_IMPORT_PROGRESS', null, { root: true })
        }
        console.error('[Motrix] addUri: Failed to add tasks:', err)
        throw err
      })
  },
  addTorrent ({ dispatch }, data) {
    const { torrent, options } = data
    return api.addTorrent({ torrent, options })
      .then(() => {
        dispatch('fetchList')
        dispatch('app/updateAddTaskOptions', {}, { root: true })
      })
  },
  addMetalink ({ dispatch }, data) {
    const { metalink, options } = data
    return api.addMetalink({ metalink, options })
      .then(() => {
        dispatch('fetchList')
        dispatch('app/updateAddTaskOptions', {}, { root: true })
      })
  },
  getTaskOption (_, gid) {
    return new Promise((resolve) => {
      api.getOption({ gid })
        .then((data) => {
          resolve(data)
        })
    })
  },
  changeTaskOption (_, payload) {
    const { gid, options } = payload
    return api.changeOption({ gid, options })
  },
  removeTask ({ state, dispatch }, task) {
    const { gid } = task
    if (gid === state.currentTaskGid) {
      dispatch('hideTaskDetail')
    }

    return api.removeTask({ gid })
      .finally(() => {
        dispatch('fetchList')
        dispatch('saveSession')
      })
  },
  forcePauseTask ({ dispatch }, task) {
    const { gid, status } = task
    if (status !== TASK_STATUS.ACTIVE) {
      return Promise.resolve(true)
    }

    return api.forcePauseTask({ gid })
      .finally(() => {
        dispatch('fetchList')
        dispatch('saveSession')
      })
  },
  pauseTask ({ dispatch }, task) {
    const { gid } = task
    const isBT = checkTaskIsBT(task)
    const promise = isBT ? api.forcePauseTask({ gid }) : api.pauseTask({ gid })
    promise.finally(() => {
      dispatch('fetchList')
      dispatch('saveSession')
    })
    return promise
  },
  resumeTask ({ dispatch }, task) {
    const { gid } = task
    return api.resumeTask({ gid })
      .finally(() => {
        dispatch('fetchList')
        dispatch('saveSession')
      })
  },
  pauseAllTask ({ dispatch }) {
    return api.pauseAllTask()
      .catch(() => {
        return api.forcePauseAllTask()
      })
      .finally(() => {
        dispatch('fetchList')
        dispatch('saveSession')
      })
  },
  resumeAllTask ({ dispatch }) {
    return api.resumeAllTask()
      .finally(() => {
        dispatch('fetchList')
        dispatch('saveSession')
      })
  },
  addToSeedingList ({ state, commit }, gid) {
    const { seedingList } = state
    if (seedingList.includes(gid)) {
      return
    }

    const list = [
      ...seedingList,
      gid
    ]
    commit('UPDATE_SEEDING_LIST', list)
  },
  removeFromSeedingList ({ state, commit }, gid) {
    const { seedingList } = state
    const idx = seedingList.indexOf(gid)
    if (idx === -1) {
      return
    }

    const list = [...seedingList.slice(0, idx), ...seedingList.slice(idx + 1)]
    commit('UPDATE_SEEDING_LIST', list)
  },
  stopSeeding ({ dispatch }, { gid }) {
    const options = {
      seedTime: 0
    }
    return dispatch('changeTaskOption', { gid, options })
  },
  removeTaskRecord ({ state, dispatch }, task) {
    const { gid, status } = task
    if (gid === state.currentTaskGid) {
      dispatch('hideTaskDetail')
    }

    const { ERROR, COMPLETE, REMOVED } = TASK_STATUS
    if ([ERROR, COMPLETE, REMOVED].indexOf(status) === -1) {
      return
    }
    return api.removeTaskRecord({ gid })
      .finally(() => dispatch('fetchList'))
  },
  saveSession () {
    api.saveSession()
  },
  purgeTaskRecord ({ dispatch }) {
    return api.purgeTaskRecord()
      .finally(() => dispatch('fetchList'))
  },
  toggleTask ({ dispatch }, task) {
    const { status } = task
    const { ACTIVE, WAITING, PAUSED } = TASK_STATUS
    if (status === ACTIVE) {
      return dispatch('pauseTask', task)
    } else if (status === WAITING || status === PAUSED) {
      return dispatch('resumeTask', task)
    }
  },
  batchResumeSelectedTasks ({ state }) {
    const gids = state.selectedGidList
    if (gids.length === 0) {
      return
    }

    return api.batchResumeTask({ gids })
  },
  batchPauseSelectedTasks ({ state }) {
    const gids = state.selectedGidList
    if (gids.length === 0) {
      return
    }

    return api.batchPauseTask({ gids })
  },
  batchForcePauseTask (_, gids) {
    return api.batchForcePauseTask({ gids })
  },
  batchResumeTask (_, gids) {
    return api.batchResumeTask({ gids })
  },
  batchRemoveTask ({ dispatch }, gids) {
    return api.batchRemoveTask({ gids })
      .finally(() => {
        dispatch('fetchList')
        dispatch('saveSession')
      })
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
