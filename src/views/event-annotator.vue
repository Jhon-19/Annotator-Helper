<template>
  <ElRow justify="center">
    <ElCol :span="18">
      <ElCard>
        <ElRow justify="center">
          <ElCol class="target-input">
            <ElText type="primary">文本</ElText>
            <ElInput
              v-model="targetText"
              autosize
              type="textarea"
              placeholder="请输入需要抽取的文本"
              @change="resetTriples"
            />
          </ElCol>
        </ElRow>

        <ElDivider>事件列表</ElDivider>

        <ElRow justify="center">
          <ElCol>
            <ElTable
              :data="events"
              :height="tableHeight"
              :header-cell-style="{ 'text-align': 'center' }"
              :cell-style="{ 'text-align': 'center' }"
              border
              stripe
            >
              <ElTableColumn prop="trigger" label="事件触发词"></ElTableColumn>
              <ElTableColumn prop="type" label="事件类型"></ElTableColumn>
              <ElTableColumn label="论元集合">
                <template #default="scope">
                  <ElPopover placement="right" title="论元集合" trigger="hover" width="240px">
                    <ElTable
                      :data="scope.row.arguments"
                      :header-cell-style="{ 'text-align': 'center' }"
                      :cell-style="{ 'text-align': 'center' }"
                      border
                      stripe
                    >
                      <ElTableColumn prop="role" label="论元角色"></ElTableColumn>
                      <ElTableColumn prop="argument" label="论元"></ElTableColumn>
                    </ElTable>
                    <template #reference>
                      <ElButton type="info">查看</ElButton>
                    </template>
                  </ElPopover>
                </template>
              </ElTableColumn>
              <ElTableColumn label="操作">
                <template #default="scope">
                  <ElButton type="primary" @click="changeEvent(scope.$index)">修改</ElButton>
                  <ElButton type="danger" @click="deleteEvent(scope.$index)">删除</ElButton>
                </template>
              </ElTableColumn>
            </ElTable>
          </ElCol>
        </ElRow>

        <ElDivider>标注</ElDivider>

        <ElRow justify="space-around">
          <ElButton @click="dialogEventTypeVisible = true">添加事件类型</ElButton>
          <ElButton type="primary" @click="dialogEventVisible = true">添加事件</ElButton>
          <ElButton @click="saveFile">保存文件</ElButton>
        </ElRow>
      </ElCard>
    </ElCol>
  </ElRow>

  <ElDialog v-model="dialogEventTypeVisible" title="添加事件类型" width="300px">
    <ElForm @submit.native.prevent>
      <ElFormItem label="事件类型" label-width="80px">
        <ElInput v-model="newEventType" clearable></ElInput>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="dialogEventTypeVisible = false">取消</ElButton>
      <ElButton type="primary" @click="addEventType">确定</ElButton>
    </template>
  </ElDialog>

  <ElDialog v-model="dialogEventVisible" :title="dialogEventTitle" width="600px">
    <ElText>目标文本：{{ targetText }}</ElText>
    <ElDivider>事件</ElDivider>
    <ElForm
      ref="eventFormRef"
      :model="newEvent"
      label-width="auto"
      status-icon
      @submit.native.prevent
    >
      <ElFormItem prop="trigger" label="事件触发词" :rules="[triggerRule]">
        <ElInput v-model="newEvent.trigger" clearable></ElInput>
      </ElFormItem>
      <ElFormItem prop="type" label="事件类型" :rules="[typeRule]">
        <ElSelect v-model="newEvent.type">
          <ElOption
            v-for="eventType in eventStore.eventTypeSet"
            :key="eventType"
            :label="eventType"
            :value="eventType"
          />
        </ElSelect>
      </ElFormItem>
      <template v-for="(arg, index) in newEvent.arguments">
        <ElRow>
          <ElCol :span="9">
            <ElFormItem
              :prop="`arguments.${index}.role`"
              :label="`论元角色${index + 1}`"
              :rules="roleRules"
            >
              <ElInput v-model="arg.role" clearable></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="10">
            <ElFormItem
              :prop="`arguments.${index}.argument`"
              :label="`论元${index + 1}`"
              :rules="[argumentRule]"
            >
              <ElInput v-model="arg.argument" clearable></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="4" :offset="1">
            <template v-if="index === 0">
              <ElButton type="primary" @click="addArg">添加论元</ElButton>
            </template>
            <template v-else>
              <ElButton type="danger" @click="removeArg(index)">删除论元</ElButton>
            </template>
          </ElCol>
        </ElRow>
      </template>
    </ElForm>
    <template #footer>
      <ElButton @click="dialogEventVisible = false">取消</ElButton>
      <ElButton type="primary" @click="addEvent">确定</ElButton>
    </template>
  </ElDialog>
</template>

<script lang="ts" setup>
import {
  ElCard,
  ElCol,
  ElDivider,
  ElInput,
  ElRow,
  ElTableColumn,
  ElText,
  ElTable,
  ElDialog,
  ElFormItem,
  ElMessage,
  ElForm,
  ElButton,
  ElSelect,
  ElOption,
  type FormRules,
  type FormItemRule,
  type FormInstance,
  ElPopover
} from 'element-plus'
import { computed, reactive, ref, watchEffect } from 'vue'
import { cloneDeep } from 'lodash'
import { checkPunctuation } from '@/utils/common.util'
import type { IEvent } from './types/event.type'
import { useEventStore } from '@/stores/event'
import { checkEventInSet, shallowCopyEvent, parseContent } from '@/utils/event.util'

const targetText = ref('')

const tableHeight = ref(window.innerHeight - 300)

window.addEventListener('resize', () => {
  tableHeight.value = window.innerHeight - 300
})

const events = reactive<IEvent[]>([])

const eventStore = useEventStore()

const dialogEventTypeVisible = ref(false)
const newEventType = ref('')

function addEventType() {
  if (newEventType.value.length > 0 && !eventStore.eventTypeSet.includes(newEventType.value)) {
    eventStore.addEventType(newEventType.value)
    dialogEventTypeVisible.value = false
  } else {
    ElMessage.error('事件类型已存在')
  }
}

const dialogEventVisible = ref(false)
const newEvent = reactive<IEvent>({
  trigger: '',
  type: '',
  arguments: [{ role: '', argument: '' }]
})
const dialogEventTitle = ref('添加事件')

function addEvent() {
  eventFormRef.value?.validate((valid) => {
    if (valid) {
      if (!checkEventInSet(newEvent, events)) {
        events.push(cloneDeep(newEvent))
        dialogEventVisible.value = false
        if (dialogEventTitle.value === '修改事件') {
          dialogEventTitle.value = '添加事件'
        }
      } else {
        ElMessage.error('事件已存在')
      }
    }
  })
}

function deleteEvent(eventIndex: number) {
  const deletedEvent = events.splice(eventIndex, 1)
  const simpleEvent = {
    trigger: deletedEvent[0].trigger,
    type: deletedEvent[0].type,
    arguments: parseContent(deletedEvent[0].arguments)
  }
  ElMessage.info(`${JSON.stringify(simpleEvent)} 已删除`)
}

function addArg() {
  newEvent.arguments.push({ role: '', argument: '' })
}

function removeArg(index: number) {
  newEvent.arguments.splice(index, 1)
}

const checkTrigger = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('触发词不能为空'))
  } else {
    if (checkPunctuation(value)) {
      callback(new Error('触发词中不能含有特殊标点符号'))
    } else {
      if (targetText.value.indexOf(value) === -1) {
        callback(new Error('触发词需要是 文本 中的字段'))
      }
    }
    callback()
  }
}

const checkArgument = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('论元不能为空'))
  } else {
    if (checkPunctuation(value)) {
      callback(new Error('论元中不能含有特殊标点符号'))
    } else {
      if (targetText.value.indexOf(value) === -1) {
        callback(new Error('论元需要是 文本 中的字段'))
      }
    }
    callback()
  }
}

const checkRole = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('论元角色不能为空'))
  } else {
    if (checkPunctuation(value)) {
      callback(new Error('论元角色中不能含有特殊标点符号'))
    }
    callback()
  }
}

const eventFormRef = ref<FormInstance>()
const triggerRule: FormItemRule = { required: true, validator: checkTrigger, trigger: 'blur' }
const typeRule: FormItemRule = {
  required: true,
  message: '请选择事件',
  trigger: 'change'
}
const argumentRule: FormItemRule = { required: true, validator: checkArgument, trigger: 'blur' }
const roleRules: FormItemRule[] = [
  {
    required: true,
    trigger: 'blur',
    validator: checkRole
  },
  {
    max: 50,
    message: '论元角色最大长度为50个字符',
    trigger: 'blur'
  }
]

function resetTriples() {
  events.length = 0
  ElMessage.info('输入文本后，请新增事件')
}

function changeEvent(tripleIndex: number) {
  const deletedEvent = events.splice(tripleIndex, 1)[0]
  shallowCopyEvent(deletedEvent, newEvent)
  dialogEventTitle.value = '修改事件'
  dialogEventVisible.value = true
}

async function saveFile() {
  const data = {
    text: targetText.value,
    events
  }
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  //生成url对象
  const urlObject = window.URL || window.webkitURL || window
  const url = urlObject.createObjectURL(blob)
  //生成<a></a>DOM元素
  const el = document.createElement('a')
  //链接赋值
  el.href = url
  el.download = '事件示例x.json'
  //必须点击否则不会下载
  el.click()
  //移除链接释放资源
  urlObject.revokeObjectURL(url)
}
</script>

<style scoped lang="less">
.target-input {
  display: flex;

  .el-text {
    width: 80px;
    text-align: center;
  }
}
</style>
