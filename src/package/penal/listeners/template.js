export const template = isTaskListener => {
  return `
  <div class="pana-buttontab__content">
    <a-table :data="elementListenersList" size="small" border>
      <a-table-column label="序号" width="50px" type="index" />
      <a-table-column label="事件类型" min-width="100px" prop="event" />
      <a-table-column label="监听器类型" min-width="100px" show-overflow-tooltip :formatter="row => listenerTypeObject[row.listenerType]" />
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
    <a-drawer v-model:visible="listenerFormModelVisible" title="执行监听器" :size="width + 'px'" append-to-body destroy-on-close>
      <a-form size="small" :model="listenerForm" label-width="96px" ref="listenerFormRef" @submit.prevent>
        <a-form-item label="事件类型" prop="event" :rules="{ required: true, trigger: ['blur', 'change'] }">
          <a-select v-model="listenerForm.event">
            <a-select-option value="start">start</a-select-option>
            <a-select-option value="end">end</a-select-option>
          </a-select>
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
        ${
  isTaskListener
    ? "<a-form-item label='定时器类型' prop='eventDefinitionType' key='eventDefinitionType'>" +
              "<a-select v-model='listenerForm.eventDefinitionType'>" +
              "<a-select-option title='' value='date'>日期</a-select-option>" +
              "<a-select-option title='' value='duration'>持续时长</a-select-option>" +
              "<a-select-option title='' value='cycle'>循环</a-select-option>" +
              "<a-select-option title='' value='' >无</a-select-option>" +
              '</a-select>' +
              '</a-form-item>' +
              "<a-form-item v-if='!!listenerForm.eventDefinitionType' label='定时器' prop='eventDefinitions' key='eventDefinitions'>" +
              "<a-input v-model:value='listenerForm.eventDefinitions' clearable />" +
              '</a-form-item>'
    : ''
}
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
  `;
};
