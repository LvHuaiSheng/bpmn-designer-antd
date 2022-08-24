<template>
  <div class="panel-tab__content">
    <a-table :data="elementListenersList" size="small" border>
      <a-table-column label="序号" width="50px" type="index" />
      <a-table-column label="事件类型" min-width="80px" show-overflow-tooltip :formatter="row => listenerEventTypeObject[row.event]" />
      <a-table-column label="事件id" min-width="80px" prop="id" show-overflow-tooltip />
      <a-table-column label="监听器类型" min-width="80px" show-overflow-tooltip :formatter="row => listenerTypeObject[row.listenerType]" />
      <a-table-column label="操作" width="90px">
        <template v-slot="{ row, $index }">
          <a-button link type="" @click="openListenerForm(row, $index)">编辑</a-button>
          <a-divider direction="vertical" />
          <a-button link type="" style="color: #ff4d4f" @click="removeListener(row, $index)">移除</a-button>
        </template>
      </a-table-column>
    </a-table>
    <div class="element-drawer__button">
      <a-button size="small" type="primary" :icon="Plus" @click="openListenerForm(null)">添加监听器</a-button>
    </div>

    <!-- 监听器 编辑/创建 部分 -->
    <a-drawer v-model:visible="listenerFormModelVisible" title="任务监听器" :size="`${width}px`" append-to-body destroy-on-close>
      <a-form size="small" :model="listenerForm" label-width="96px" ref="listenerFormRef" @submit.prevent>
        <a-form-item label="事件类型" prop="event" :rules="{ required: true, trigger: ['blur', 'change'] }">
          <a-select v-model="listenerForm.event">
            <a-select-option v-for="i in Object.keys(listenerEventTypeObject)" :key="i" :value="i">{{listenerEventTypeObject[i]}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="监听器ID" prop="id" :rules="{ required: true, trigger: ['blur', 'change'] }">
          <a-input v-model:value="listenerForm.id" clearable />
        </a-form-item>
        <a-form-item label="监听器类型" prop="listenerType" :rules="{ required: true, trigger: ['blur', 'change'] }">
          <a-select v-model="listenerForm.listenerType">
            <a-select-option v-for="i in Object.keys(listenerTypeObject)" :key="i" :value="i">{{listenerTypeObject[i]}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          v-if="listenerForm.listenerType === 'classListener'"
          label="Java类"
          prop="class"
          key="listener-class"
          :rules="{ required: true, trigger: ['blur', 'change'] }"
        >
          <a-input v-model:value="listenerForm.class" clearable />
        </a-form-item>
        <a-form-item
          v-if="listenerForm.listenerType === 'expressionListener'"
          label="表达式"
          prop="expression"
          key="listener-expression"
          :rules="{ required: true, trigger: ['blur', 'change'] }"
        >
          <a-input v-model:value="listenerForm.expression" clearable />
        </a-form-item>
        <a-form-item
          v-if="listenerForm.listenerType === 'delegateExpressionListener'"
          label="代理表达式"
          prop="delegateExpression"
          key="listener-delegate"
          :rules="{ required: true, trigger: ['blur', 'change'] }"
        >
          <a-input v-model:value="listenerForm.delegateExpression" clearable />
        </a-form-item>
        <template v-if="listenerForm.listenerType === 'scriptListener'">
          <a-form-item
            label="脚本格式"
            prop="scriptFormat"
            key="listener-script-format"
            :rules="{ required: true, trigger: ['blur', 'change'], message: '请填写脚本格式' }"
          >
            <a-input v-model:value="listenerForm.scriptFormat" clearable />
          </a-form-item>
          <a-form-item
            label="脚本类型"
            prop="scriptType"
            key="listener-script-type"
            :rules="{ required: true, trigger: ['blur', 'change'], message: '请选择脚本类型' }"
          >
            <a-select v-model="listenerForm.scriptType">
              <a-select-option value="inlineScript">内联脚本</a-select-option>
              <a-select-option value="externalScript">外部脚本</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            v-if="listenerForm.scriptType === 'inlineScript'"
            label="脚本内容"
            prop="value"
            key="listener-script"
            :rules="{ required: true, trigger: ['blur', 'change'], message: '请填写脚本内容' }"
          >
            <a-input v-model:value="listenerForm.value" clearable />
          </a-form-item>
          <a-form-item
            v-if="listenerForm.scriptType === 'externalScript'"
            label="资源地址"
            prop="resource"
            key="listener-resource"
            :rules="{ required: true, trigger: ['blur', 'change'], message: '请填写资源地址' }"
          >
            <a-input v-model:value="listenerForm.resource" clearable />
          </a-form-item>
        </template>

        <template v-if="listenerForm.event === 'timeout'">
          <a-form-item label="定时器类型" prop="eventDefinitionType" key="eventDefinitionType">
            <a-select v-model="listenerForm.eventDefinitionType">
              <a-select-option value="date">日期</a-select-option>
              <a-select-option value="duration">持续时长</a-select-option>
              <a-select-option value="cycle">循环</a-select-option>
              <a-select-option value="null">无</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            v-if="!!listenerForm.eventDefinitionType && listenerForm.eventDefinitionType !== 'null'"
            label="定时器"
            prop="eventTimeDefinitions"
            key="eventTimeDefinitions"
            :rules="{ required: true, trigger: ['blur', 'change'], message: '请填写定时器配置' }"
          >
            <a-input v-model:value="listenerForm.eventTimeDefinitions" clearable />
          </a-form-item>
        </template>
      </a-form>

      <a-divider />
      <p class="listener-filed__title">
        <span><a-icon><Menu /></a-icon>注入字段：</span>
        <a-button size="small" type="primary" @click="openListenerFieldForm(null)">添加字段</a-button>
      </p>
      <a-table :data="fieldsListOfListener" size="small" max-height="240" border fit style="flex: none">
        <a-table-column label="序号" width="50px" type="index" />
        <a-table-column label="字段名称" min-width="100px" prop="name" />
        <a-table-column label="字段类型" min-width="80px" show-overflow-tooltip :formatter="row => fieldTypeObject[row.fieldType]" />
        <a-table-column label="字段值/表达式" min-width="100px" show-overflow-tooltip :formatter="row => row.string || row.expression" />
        <a-table-column label="操作" width="100px">
          <template v-slot="{ row, $index }">
            <a-button link type="" @click="openListenerFieldForm(row, $index)">编辑</a-button>
            <a-divider direction="vertical" />
            <a-button link type="" style="color: #ff4d4f" @click="removeListenerField(row, $index)">移除</a-button>
          </template>
        </a-table-column>
      </a-table>

      <div class="element-drawer__button">
        <a-button size="small" @click="listenerFormModelVisible = false">取 消</a-button>
        <a-button size="small" type="primary" @click="saveListenerConfig">保 存</a-button>
      </div>
    </a-drawer>

    <!-- 注入西段 编辑/创建 部分 -->
    <a-modal title="字段配置"  v-model:visible="listenerFieldFormModelVisible" width="600px" append-to-body destroy-on-close>
      <a-form :model="listenerFieldForm" size="small" label-width="96px" ref="listenerFieldFormRef" style="height: 136px" @submit.prevent>
        <a-form-item label="字段名称：" prop="name" :rules="{ required: true, trigger: ['blur', 'change'] }">
          <a-input v-model:value="listenerFieldForm.name" clearable />
        </a-form-item>
        <a-form-item label="字段类型：" prop="fieldType" :rules="{ required: true, trigger: ['blur', 'change'] }">
          <a-select v-model="listenerFieldForm.fieldType">
            <a-select-option v-for="i in Object.keys(fieldTypeObject)" :key="i" :value="i">{{fieldTypeObject[i]}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          v-if="listenerFieldForm.fieldType === 'string'"
          label="字段值："
          prop="string"
          key="field-string"
          :rules="{ required: true, trigger: ['blur', 'change'] }"
        >
          <a-input v-model:value="listenerFieldForm.string" clearable />
        </a-form-item>
        <a-form-item
          v-if="listenerFieldForm.fieldType === 'expression'"
          label="表达式："
          prop="expression"
          key="field-expression"
          :rules="{ required: true, trigger: ['blur', 'change'] }"
        >
          <a-input v-model:value="listenerFieldForm.expression" clearable />
        </a-form-item>
      </a-form>
      <template v-slot:footer>
        <a-button size="small" @click="listenerFieldFormModelVisible = false">取 消</a-button>
        <a-button size="small" type="primary" @click="saveListenerFiled">确 定</a-button>
      </template>
    </a-modal>
  </div>
</template>
<script>
import { createListenerObject, updateElementExtensions } from "../../utils";
import { initListenerForm, initListenerType, eventType, listenerType, fieldType } from "./utilSelf";

export default {
  name: "UserTaskListeners",
  props: {
    id: String,
    type: String
  },
  inject: {
    prefix: "prefix",
    width: "width"
  },
  data() {
    return {
      elementListenersList: [],
      listenerEventTypeObject: eventType,
      listenerTypeObject: listenerType,
      listenerFormModelVisible: false,
      listenerForm: {},
      fieldTypeObject: fieldType,
      fieldsListOfListener: [],
      listenerFieldFormModelVisible: false, // 监听器 注入字段表单弹窗 显示状态
      editingListenerIndex: -1, // 监听器所在下标，-1 为新增
      editingListenerFieldIndex: -1, // 字段所在下标，-1 为新增
      listenerFieldForm: {} // 监听器 注入字段 详情表单
    };
  },
  watch: {
    id: {
      immediate: true,
      handler(val) {
        val && val.length && this.$nextTick(() => this.resetListenersList());
      }
    }
  },
  methods: {
    resetListenersList() {
      this.bpmnElement = window.bpmnInstances.bpmnElement;
      this.otherExtensionList = [];
      this.bpmnElementListeners = this.bpmnElement.businessObject?.extensionElements?.values?.filter(ex => ex.$type === `${this.prefix}:TaskListener`) ?? [];
      this.elementListenersList = this.bpmnElementListeners.map(listener => initListenerType(listener));
    },
    openListenerForm(listener, index) {
      if (listener) {
        this.listenerForm = initListenerForm(listener);
        this.editingListenerIndex = index;
      } else {
        this.listenerForm = {};
        this.editingListenerIndex = -1; // 标记为新增
      }
      if (listener && listener.fields) {
        this.fieldsListOfListener = listener.fields.map(field => ({
          ...field,
          fieldType: field.string ? "string" : "expression"
        }));
      } else {
        this.fieldsListOfListener = [];
        this.listenerForm["fields"] = []
      }
      // 打开侧边栏并清楚验证状态
      this.listenerFormModelVisible = true;
      this.$nextTick(() => {
        if (this.$refs["listenerFormRef"]) this.$refs["listenerFormRef"].clearValidate();
      });
    },
    // 移除监听器
    removeListener(listener, index) {
      this.$confirm("确认移除该监听器吗？", "提示", {
        confirmButtonText: "确 认",
        cancelButtonText: "取 消"
      })
        .then(() => {
          this.bpmnElementListeners.splice(index, 1);
          this.elementListenersList.splice(index, 1);
          updateElementExtensions(this.bpmnElement, this.otherExtensionList.concat(this.bpmnElementListeners));
        })
        .catch(() => console.info("操作取消"));
    },
    // 保存监听器
    async saveListenerConfig() {
      let validateStatus = await this.$refs["listenerFormRef"].validate();
      if (!validateStatus) return; // 验证不通过直接返回
      const listenerObject = createListenerObject(this.listenerForm, true, this.prefix);
      if (this.editingListenerIndex === -1) {
        this.bpmnElementListeners.push(listenerObject);
        this.elementListenersList.push(this.listenerForm);
      } else {
        this.bpmnElementListeners.splice(this.editingListenerIndex, 1, listenerObject);
        this.elementListenersList.splice(this.editingListenerIndex, 1, this.listenerForm);
      }
      // 保存其他配置
      this.otherExtensionList = this.bpmnElement.businessObject?.extensionElements?.values?.filter(ex => ex.$type !== `${this.prefix}:TaskListener`) ?? [];
      updateElementExtensions(this.bpmnElement, this.otherExtensionList.concat(this.bpmnElementListeners));
      // 4. 隐藏侧边栏
      this.listenerFormModelVisible = false;
      this.listenerForm = {};
    },
    // 打开监听器字段编辑弹窗
    openListenerFieldForm(field, index) {
      this.listenerFieldForm = field ? JSON.parse(JSON.stringify(field)) : {};
      this.editingListenerFieldIndex = field ? index : -1;
      this.listenerFieldFormModelVisible = true;
      this.$nextTick(() => {
        if (this.$refs["listenerFieldFormRef"]) this.$refs["listenerFieldFormRef"].clearValidate();
      });
    },
    // 保存监听器注入字段
    async saveListenerFiled() {
      let validateStatus = await this.$refs["listenerFieldFormRef"].validate();
      if (!validateStatus) return; // 验证不通过直接返回
      if (this.editingListenerFieldIndex === -1) {
        this.fieldsListOfListener.push(this.listenerFieldForm);
        this.listenerForm.fields.push(this.listenerFieldForm);
      } else {
        this.fieldsListOfListener.splice(this.editingListenerFieldIndex, 1, this.listenerFieldForm);
        this.listenerForm.fields.splice(this.editingListenerFieldIndex, 1, this.listenerFieldForm);
      }
      this.listenerFieldFormModelVisible = false;
      this.$nextTick(() => (this.listenerFieldForm = {}));
    },
    // 移除监听器字段
    removeListenerField(field, index) {
      this.$confirm("确认移除该字段吗？", "提示", {
        confirmButtonText: "确 认",
        cancelButtonText: "取 消"
      })
        .then(() => {
          this.fieldsListOfListener.splice(index, 1);
          this.listenerForm.fields.splice(index, 1);
        })
        .catch(() => console.info("操作取消"));
    }
  }
};
</script>
