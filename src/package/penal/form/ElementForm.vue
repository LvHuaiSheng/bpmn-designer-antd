<template>
  <div class="panel-tab__content">
    <a-form size="small" label-width="80px"  @submit.prevent>
      <a-form-item label="表单标识">
        <a-input v-model:value="formKey" clearable @change="updateElementFormKey" />
      </a-form-item>
      <a-form-item label="业务标识">
        <a-select v-model:value="businessKey" @change="updateElementBusinessKey">
          <a-select-option v-for="i in fieldList" :key="i.id" :value="i.id">{{i.label}}</a-select-option>
          <a-select-option value="" >无</a-select-option>
        </a-select>
      </a-form-item>
    </a-form>

    <!--字段列表-->
    <div class="element-property list-property">
      <a-divider>表单字段</a-divider>
      <a-table :data-source="fieldList" :columns="columns" :row-key="record => record.key" max-height="240" bordered >
        <template #bodyCell="{ column, text, record,index }">
          <template v-if="column.dataIndex === 'operation'">
            <a-button link type=""  @click="openFieldForm(record, index)">编辑</a-button>
            <a-divider direction="vertical" />
            <a-button link type=""  style="color: #ff4d4f" @click="removeField(record, index)">移除</a-button>
          </template>
        </template>
      </a-table>
    </div>
    <div class="element-drawer__button">
      <a-button size="small" type="primary" :icon="Plus"  @click="openFieldForm(null, -1)">添加字段</a-button>
    </div>

    <!--字段配置侧边栏-->
    <a-drawer v-model:visible="fieldModelVisible" title="字段配置" :size="`${width}px`" append-to-body destroy-on-close>
      <a-form :model="formFieldForm" label-width="90px" size="small" @submit.prevent>
        <a-form-item label="字段ID">
          <a-input v-model:value="formFieldForm.id" clearable />
        </a-form-item>
        <a-form-item label="类型">
          <a-select v-model="formFieldForm.typeType" placeholder="请选择字段类型" clearable @change="changeFieldTypeType">
            <a-select-option v-for="(value, key) of fieldType" :key="key" :value="key" >{{value}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="formFieldForm.typeType === 'custom'" label="类型名称">
          <a-input v-model:value="formFieldForm.type" clearable />
        </a-form-item>
        <a-form-item label="名称">
          <a-input v-model:value="formFieldForm.label" clearable />
        </a-form-item>
        <a-form-item v-if="formFieldForm.typeType === 'date'" label="时间格式">
          <a-input v-model:value="formFieldForm.datePattern" clearable />
        </a-form-item>
        <a-form-item label="默认值">
          <a-input v-model:value="formFieldForm.defaultValue" clearable />
        </a-form-item>
      </a-form>

      <!-- 枚举值设置 -->
      <template v-if="formFieldForm.type === 'enum'">
        <a-divider key="enum-divider" />
        <p key="enum-title" class="listener-filed__title">
          <span>枚举值列表：</span>
          <a-button size="small" type="primary" @click="openFieldOptionForm(null, -1, 'enum')">添加枚举值</a-button>
        </p>
        <a-table key="enum-table" :data="fieldEnumList" size="small" max-height="240" border fit>
          <a-table-column label="序号" width="50px" type="index" />
          <a-table-column label="枚举值编号" prop="id" min-width="100px" show-overflow-tooltip />
          <a-table-column label="枚举值名称" prop="name" min-width="100px" show-overflow-tooltip />
          <a-table-column label="操作" width="90px">
            <template v-slot="{ row, $index }">
              <a-button link type="" @click="openFieldOptionForm(row, $index, 'enum')">编辑</a-button>
              <a-divider direction="vertical" />
              <a-button link type="" style="color: #ff4d4f" @click="removeFieldOptionItem(row, $index, 'enum')">移除</a-button>
            </template>
          </a-table-column>
        </a-table>
      </template>

      <!-- 校验规则 -->
      <a-divider key="validation-divider" />
      <p key="validation-title" class="listener-filed__title">
        <span>约束条件列表：</span>
        <a-button size="small" type="primary" @click="openFieldOptionForm(null, -1, 'constraint')">添加约束</a-button>
      </p>
      <a-table key="validation-table" :data="fieldConstraintsList" size="small" max-height="240" border fit>
        <a-table-column label="序号" width="50px" type="index" />
        <a-table-column label="约束名称" prop="name" min-width="100px" show-overflow-tooltip />
        <a-table-column label="约束配置" prop="config" min-width="100px" show-overflow-tooltip />
        <a-table-column label="操作" width="90px">
          <template v-slot="{ row, $index }">
            <a-button link type="" @click="openFieldOptionForm(row, $index, 'constraint')">编辑</a-button>
            <a-divider direction="vertical" />
            <a-button link type="" style="color: #ff4d4f" @click="removeFieldOptionItem(row, $index, 'constraint')">移除</a-button>
          </template>
        </a-table-column>
      </a-table>

      <!-- 表单属性 -->
      <a-divider key="property-divider" />
      <p key="property-title" class="listener-filed__title">
        <span>字段属性列表：</span>
        <a-button size="small" type="primary" @click="openFieldOptionForm(null, -1, 'property')">添加属性</a-button>
      </p>
      <a-table key="property-table" :data="fieldPropertiesList" size="small" max-height="240" border fit>
        <a-table-column label="序号" width="50px" type="index" />
        <a-table-column label="属性编号" prop="id" min-width="100px" show-overflow-tooltip />
        <a-table-column label="属性值" prop="value" min-width="100px" show-overflow-tooltip />
        <a-table-column label="操作" width="90px">
          <template v-slot="{ row, $index }">
            <a-button link type="" @click="openFieldOptionForm(row, $index, 'property')">编辑</a-button>
            <a-divider direction="vertical" />
            <a-button link type="" style="color: #ff4d4f" @click="removeFieldOptionItem(row, $index, 'property')">移除</a-button>
          </template>
        </a-table-column>
      </a-table>

      <!-- 底部按钮 -->
      <div class="element-drawer__button">
        <a-button size="small">取 消</a-button>
        <a-button size="small" type="primary" @click="saveField">保 存</a-button>
      </div>
    </a-drawer>

    <a-modal  v-model:visible="fieldOptionModelVisible" :title="optionModelTitle" width="600px" append-to-body destroy-on-close>
      <a-form :model="fieldOptionForm" size="small" label-width="96px" @submit.prevent>
        <a-form-item v-if="fieldOptionType !== 'constraint'" key="option-id" label="编号/ID">
          <a-input v-model:value="fieldOptionForm.id" clearable />
        </a-form-item>
        <a-form-item v-if="fieldOptionType !== 'property'" key="option-name" label="名称">
          <a-input v-model:value="fieldOptionForm.name" clearable />
        </a-form-item>
        <a-form-item v-if="fieldOptionType === 'constraint'" key="option-config" label="配置">
          <a-input v-model:value="fieldOptionForm.config" clearable />
        </a-form-item>
        <a-form-item v-if="fieldOptionType === 'property'" key="option-value" label="值">
          <a-input v-model:value="fieldOptionForm.value" clearable />
        </a-form-item>
      </a-form>
      <template v-slot:footer>
        <a-button size="small" @click="fieldOptionModelVisible = false">取 消</a-button>
        <a-button size="small" type="primary" @click="saveFieldOption">确 定</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script>
export default {
  name: 'ElementForm',
  setup() {
    return {

    }
  },
  props: {
    id: String,
    type: String
  },
  inject: {
    prefix: 'prefix',
    width: 'width'
  },
  data() {
    return {
      formKey: '',
      businessKey: '',
      optionModelTitle: '',
      columns:[
        {
          title: '#',
          dataIndex: '$index',
          key: '$index',
          width: '30px',
        },
        {
          title: '字段名称',
          dataIndex: 'label',
          key: 'label',
          width: '100px',
        },
        {
          title: '字段类型',
          dataIndex: 'type',
          key: 'type',
          width: '100px',
        },
        {
          title: '操作',
          dataIndex: 'operation',
        },
      ],
      fieldList: [],
      formFieldForm: {},
      fieldType: {
        long: '长整型',
        string: '字符串',
        boolean: '布尔类',
        date: '日期类',
        enum: '枚举类',
        custom: '自定义类型'
      },
      formFieldIndex: -1, // 编辑中的字段， -1 为新增
      formFieldOptionIndex: -1, // 编辑中的字段配置项， -1 为新增
      fieldModelVisible: false,
      fieldOptionModelVisible: false,
      fieldOptionForm: {}, // 当前激活的字段配置项数据
      fieldOptionType: '', // 当前激活的字段配置项弹窗 类型
      fieldEnumList: [], // 枚举值列表
      fieldConstraintsList: [], // 约束条件列表
      fieldPropertiesList: [] // 绑定属性列表
    };
  },
  watch: {
    id: {
      immediate: true,
      handler(val) {
        val && val.length && this.$nextTick(() => this.resetFormList());
      }
    }
  },
  methods: {
    resetFormList() {
      this.bpmnELement = window.bpmnInstances.bpmnElement;
      this.formKey = this.bpmnELement.businessObject.formKey;
      // 获取元素扩展属性 或者 创建扩展属性
      this.elExtensionElements =
          this.bpmnELement.businessObject.get('extensionElements') || window.bpmnInstances.moddle.create('bpmn:ExtensionElements', { values: [] });
      // 获取元素表单配置 或者 创建新的表单配置
      try {
        this.formData =
          this.elExtensionElements.values.filter(ex => ex.$type === `${this.prefix}:FormData`)[0] ||
          window.bpmnInstances.moddle.create(`${this.prefix}:FormData`, { fields: [] });
      } catch (error) {
        this.formData = {}
        console.log(error)
      }

      // 业务标识 businessKey， 绑定在 formData 中
      this.businessKey = this.formData.businessKey;

      // 保留剩余扩展元素，便于后面更新该元素对应属性
      this.otherExtensions = this.elExtensionElements.values.filter(ex => ex.$type !== `${this.prefix}:FormData`);

      // 复制原始值，填充表格
      this.fieldList = JSON.parse(JSON.stringify(this.formData.fields || []));

      // 更新元素扩展属性，避免后续报错
      this.updateElementExtensions();
    },
    updateElementFormKey() {
      window.bpmnInstances.modeling.updateProperties(this.bpmnELement, { formKey: this.formKey });
    },
    updateElementBusinessKey() {
      window.bpmnInstances.modeling.updateModdleProperties(this.bpmnELement, this.formData, { businessKey: this.businessKey });
    },
    // 根据类型调整字段type
    changeFieldTypeType(type) {
      this.formFieldForm['type'] = type === 'custom' ? '' : type
    },

    // 打开字段详情侧边栏
    openFieldForm(field, index) {
      this.formFieldIndex = index;
      if (index !== -1) {
        const FieldObject = this.formData.fields[index];
        this.formFieldForm = JSON.parse(JSON.stringify(field));
        // 设置自定义类型
        this.formFieldForm['typeType'] = !this.fieldType[field.type] ? 'custom' : field.type
        // 初始化枚举值列表
        field.type === 'enum' && (this.fieldEnumList = JSON.parse(JSON.stringify(FieldObject?.values || [])));
        // 初始化约束条件列表
        this.fieldConstraintsList = JSON.parse(JSON.stringify(FieldObject?.validation?.constraints || []));
        // 初始化自定义属性列表
        this.fieldPropertiesList = JSON.parse(JSON.stringify(FieldObject?.properties?.values || []));
      } else {
        this.formFieldForm = {};
        // 初始化枚举值列表
        this.fieldEnumList = [];
        // 初始化约束条件列表
        this.fieldConstraintsList = [];
        // 初始化自定义属性列表
        this.fieldPropertiesList = [];
      }
      this.fieldModelVisible = true;
    },
    // 打开字段 某个 配置项 弹窗
    openFieldOptionForm(option, index, type) {
      this.fieldOptionModelVisible = true;
      this.fieldOptionType = type;
      this.formFieldOptionIndex = index;
      if (type === 'property') {
        this.fieldOptionForm = option ? JSON.parse(JSON.stringify(option)) : {};
        return (this.optionModelTitle = '属性配置');
      }
      if (type === 'enum') {
        this.fieldOptionForm = option ? JSON.parse(JSON.stringify(option)) : {};
        return (this.optionModelTitle = '枚举值配置');
      }
      this.fieldOptionForm = option ? JSON.parse(JSON.stringify(option)) : {};
      return (this.optionModelTitle = '约束条件配置');
    },

    // 保存字段 某个 配置项
    saveFieldOption() {
      if (this.formFieldOptionIndex === -1) {
        if (this.fieldOptionType === 'property') {
          this.fieldPropertiesList.push(this.fieldOptionForm);
        }
        if (this.fieldOptionType === 'constraint') {
          this.fieldConstraintsList.push(this.fieldOptionForm);
        }
        if (this.fieldOptionType === 'enum') {
          this.fieldEnumList.push(this.fieldOptionForm);
        }
      } else {
        this.fieldOptionType === 'property' && this.fieldPropertiesList.splice(this.formFieldOptionIndex, 1, this.fieldOptionForm);
        this.fieldOptionType === 'constraint' && this.fieldConstraintsList.splice(this.formFieldOptionIndex, 1, this.fieldOptionForm);
        this.fieldOptionType === 'enum' && this.fieldEnumList.splice(this.formFieldOptionIndex, 1, this.fieldOptionForm);
      }
      this.fieldOptionModelVisible = false;
      this.fieldOptionForm = {};
    },
    // 保存字段配置
    saveField() {
      const { id, type, label, defaultValue, datePattern } = this.formFieldForm;
      const Field = window.bpmnInstances.moddle.create(`${this.prefix}:FormField`, { id, type, label });
      defaultValue && (Field.defaultValue = defaultValue);
      datePattern && (Field.datePattern = datePattern);
      // 构建属性
      if (this.fieldPropertiesList && this.fieldPropertiesList.length) {
        const fieldPropertyList = this.fieldPropertiesList.map(fp => {
          return window.bpmnInstances.moddle.create(`${this.prefix}:Property`, { id: fp.id, value: fp.value });
        });
        Field.properties = window.bpmnInstances.moddle.create(`${this.prefix}:Properties`, { values: fieldPropertyList });
      }
      // 构建校验规则
      if (this.fieldConstraintsList && this.fieldConstraintsList.length) {
        const fieldConstraintList = this.fieldConstraintsList.map(fc => {
          return window.bpmnInstances.moddle.create(`${this.prefix}:Constraint`, { name: fc.name, config: fc.config });
        });
        Field.validation = window.bpmnInstances.moddle.create(`${this.prefix}:Validation`, { constraints: fieldConstraintList });
      }
      // 构建枚举值
      if (this.fieldEnumList && this.fieldEnumList.length) {
        Field.values = this.fieldEnumList.map(fe => {
          return window.bpmnInstances.moddle.create(`${this.prefix}:Value`, { name: fe.name, id: fe.id });
        });
      }
      // 更新数组 与 表单配置实例
      if (this.formFieldIndex === -1) {
        this.fieldList.push(this.formFieldForm);
        this.formData.fields && this.formData.fields.push(Field);
      } else {
        this.fieldList.splice(this.formFieldIndex, 1, this.formFieldForm);
        this.formData.fields.splice(this.formFieldIndex, 1, Field);
      }
      this.updateElementExtensions();
      this.fieldModelVisible = false;
    },

    // 移除某个 字段的 配置项
    removeFieldOptionItem(option, index, type) {
      if (type === 'property') {
        this.fieldPropertiesList.splice(index, 1);
        return;
      }
      if (type === 'enum') {
        this.fieldEnumList.splice(index, 1);
        return;
      }
      this.fieldConstraintsList.splice(index, 1);
    },
    // 移除 字段
    removeField(field, index) {
      this.fieldList.splice(index, 1);
      this.formData.fields.splice(index, 1);
      this.updateElementExtensions();
    },

    updateElementExtensions() {
      // 更新回扩展元素
      const newElExtensionElements = window.bpmnInstances.moddle.create(`bpmn:ExtensionElements`, {
        values: this.otherExtensions.concat(this.formData)
      });
      // 更新到元素上
      window.bpmnInstances.modeling.updateProperties(this.bpmnELement, {
        extensionElements: newElExtensionElements
      });
    }
  }
}
</script>
