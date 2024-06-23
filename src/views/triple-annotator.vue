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

        <ElDivider>三元组列表</ElDivider>

        <ElRow justify="center">
          <ElCol>
            <ElTable
              :data="triples"
              :height="tableHeight"
              :header-cell-style="{ 'text-align': 'center' }"
              :cell-style="{ 'text-align': 'center' }"
              border
              stripe
            >
              <ElTableColumn prop="headEntity" label="头实体"></ElTableColumn>
              <ElTableColumn prop="relation" label="关系"></ElTableColumn>
              <ElTableColumn prop="tailEntity" label="尾实体"></ElTableColumn>
              <ElTableColumn label="操作">
                <template #default="scope">
                  <ElButton type="primary" @click="changeTriple(scope.$index)">修改</ElButton>
                  <ElButton type="danger" @click="deleteTriple(scope.$index)">删除</ElButton>
                </template>
              </ElTableColumn>
            </ElTable>
          </ElCol>
        </ElRow>

        <ElDivider>标注</ElDivider>

        <ElRow justify="space-around">
          <ElButton @click="dialogRelationVisible = true">添加关系</ElButton>
          <ElButton type="primary" @click="dialogTripleVisible = true">添加三元组</ElButton>
          <ElButton @click="saveFile">保存文件</ElButton>
        </ElRow>
      </ElCard>
    </ElCol>
  </ElRow>

  <ElDialog v-model="dialogRelationVisible" title="添加关系" width="300px">
    <ElForm @submit.native.prevent>
      <ElFormItem label="关系" label-width="60px">
        <ElInput v-model="newRelation" clearable></ElInput>
      </ElFormItem>
    </ElForm>

    <template #footer>
      <ElButton @click="dialogRelationVisible = false">取消</ElButton>
      <ElButton type="primary" @click="addRelation">确定</ElButton>
    </template>
  </ElDialog>

  <ElDialog v-model="dialogTripleVisible" :title="dialogTripleTitle" width="600px">
    <ElText>目标文本：{{ targetText }}</ElText>
    <ElDivider>三元组</ElDivider>
    <ElForm
      ref="tripleFormRef"
      :model="newTriple"
      :rules="rules"
      label-width="auto"
      status-icon
      @submit.native.prevent
    >
      <ElFormItem prop="headEntity" label="头实体">
        <ElInput v-model="newTriple.headEntity" clearable></ElInput>
      </ElFormItem>
      <ElFormItem prop="relation" label="关系">
        <ElSelect v-model="newTriple.relation">
          <ElOption
            v-for="relation in tripleStore.relationSet"
            :key="relation"
            :label="relation"
            :value="relation"
          />
        </ElSelect>
      </ElFormItem>
      <ElFormItem prop="tailEntity" label="尾实体">
        <ElInput v-model="newTriple.tailEntity" clearable></ElInput>
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="dialogTripleVisible = false">取消</ElButton>
      <ElButton type="primary" @click="addTriple">确定</ElButton>
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
  type FormInstance
} from 'element-plus'
import { computed, reactive, ref, watchEffect } from 'vue'
import type { ITriple } from './types/triple.type'
import { useTripleStore } from '@/stores/triple'
import { checkTripleInSet, shallowCopyTriple } from '@/utils/triple.util'
import { cloneDeep } from 'lodash'
import { checkPunctuation } from '@/utils/common.util'

const targetText = ref('')

const tableHeight = ref(window.innerHeight - 300)

window.addEventListener('resize', () => {
  tableHeight.value = window.innerHeight - 300
})

const triples = reactive<ITriple[]>([])

const tripleStore = useTripleStore()

const dialogRelationVisible = ref(false)
const newRelation = ref('')

function addRelation() {
  if (newRelation.value.length > 0 && !tripleStore.relationSet.includes(newRelation.value)) {
    tripleStore.addRelation(newRelation.value)
    dialogRelationVisible.value = false
  } else {
    ElMessage.error('关系已存在')
  }
}

const dialogTripleVisible = ref(false)
const newTriple = reactive<ITriple>({ headEntity: '', relation: '', tailEntity: '' })
const dialogTripleTitle = ref('添加三元组')

function addTriple() {
  tripleFormRef.value?.validate((valid) => {
    if (valid) {
      if (!checkTripleInSet(newTriple, triples)) {
        triples.push(cloneDeep(newTriple))
        dialogTripleVisible.value = false
        if (dialogTripleTitle.value === '修改三元组') {
          dialogTripleTitle.value = '添加三元组'
        }
      } else {
        ElMessage.error('三元组已存在')
      }
    }
  })
}

function deleteTriple(tripleIndex: number) {
  const deletedTriple = triples.splice(tripleIndex, 1)
  ElMessage.info(`${JSON.stringify(deletedTriple)} 已删除`)
}

const checkEntity = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('实体不能为空'))
  } else {
    if (checkPunctuation(value)) {
      callback(new Error('实体中不能含有特殊标点符号'))
    } else {
      if (targetText.value.indexOf(value) === -1) {
        callback(new Error('实体需要是 文本 中的字段'))
      }
    }
    callback()
  }
}

const tripleFormRef = ref<FormInstance>()
const entityRule: FormItemRule = { required: true, validator: checkEntity, trigger: 'blur' }

const rules = reactive<FormRules>({
  headEntity: [entityRule],
  relation: [
    {
      required: true,
      message: '请选择关系',
      trigger: 'change'
    }
  ],
  tailEntity: [entityRule]
})

function resetTriples() {
  triples.length = 0
  ElMessage.info('输入文本后，请新增三元组')
}

function changeTriple(tripleIndex: number) {
  const deletedTriple = triples.splice(tripleIndex, 1)[0]
  shallowCopyTriple(deletedTriple, newTriple)
  dialogTripleTitle.value = '修改三元组'
  dialogTripleVisible.value = true
}

async function saveFile() {
  const data = {
    text: targetText.value,
    triples
  }
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  //生成url对象
  const urlObject = window.URL || window.webkitURL || window
  const url = urlObject.createObjectURL(blob)
  //生成<a></a>DOM元素
  const el = document.createElement('a')
  //链接赋值
  el.href = url
  el.download = '三元组示例x.json'
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
