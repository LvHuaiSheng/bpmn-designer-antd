<template>
  <div class="panel-tab__content">
    <a-table :dataSource="elementPropertyList" :columns="elementPropertyColumns" size="small" max-height="240" border fit>
      <template #bodyCell="{ column, text, record,index }">
        <template v-if="column.dataIndex === 'operation'">
          <a-button link type="" @click="openAttributesForm(record, index)">编辑</a-button>
          <a-divider direction="vertical" />
          <a-button link type="" style="color: #ff4d4f" @click="removeAttributes(record, index)">移除</a-button>
        </template>
      </template>
    </a-table>
    <div class="element-drawer__button">
      <a-button size="small" type="primary" :icon="Plus" @click="openAttributesForm(null, -1)">添加属性</a-button>
    </div>

    <a-modal  v-model:visible="propertyFormModelVisible" title="属性配置" width="600px" append-to-body destroy-on-close>
      <a-form :model="propertyForm" laba-buttonwidth="80px" size="small" ref="attributeFormRef" @submit.prevent>
        <a-form-item label="属性名：" prop="name">
          <a-input v-model:value="propertyForm.name" clearable />
        </a-form-item>
        <a-form-item label="属性值：" prop="value">
          <a-input v-model:value="propertyForm.value" clearable />
        </a-form-item>
      </a-form>
      <template v-slot:footer>
        <a-button size="small" @click="propertyFormModelVisible = false">取 消</a-button>
        <a-button size="small" type="primary" @click="saveAttribute">确 定</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script>
import { Plus } from '@element-plus/icons-vue'
export default {
  name: "ElementProperties",
  setup() {
    return {
      Plus
    }
  },
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
      elementPropertyList: [],
      propertyForm: {},
      editingPropertyIndex: -1,
      propertyFormModelVisible: false,
      elementPropertyColumns:[
        // <a-table-column label="序号" width="50px" type="index" />
        {
          title: '属性名',
          dataIndex: 'name',
          width: '100px',
        },
        {
          title: '属性值',
          dataIndex: 'value',
          width: '100px',
        },
        {
          title: '操作',
          dataIndex: 'operation',
        },
      ],
    };
  },
  watch: {
    id: {
      immediate: true,
      handler(val) {
        val && val.length && this.resetAttributesList();
      }
    }
  },
  methods: {
    resetAttributesList() {
      this.bpmnElement = window.bpmnInstances.bpmnElement;
      this.otherExtensionList = []; // 其他扩展配置
      this.bpmnElementProperties =
        this.bpmnElement.businessObject?.extensionElements?.values?.filter(ex => {
          if (ex.$type !== `${this.prefix}:Properties`) {
            this.otherExtensionList.push(ex);
          }
          return ex.$type === `${this.prefix}:Properties`;
        }) ?? [];

      // 保存所有的 扩展属性字段
      this.bpmnElementPropertyList = this.bpmnElementProperties.reduce((pre, current) => pre.concat(current.values), []);
      // 复制 显示
      this.elementPropertyList = JSON.parse(JSON.stringify(this.bpmnElementPropertyList ?? []));
    },
    openAttributesForm(attr, index) {
      this.editingPropertyIndex = index;
      this.propertyForm = index === -1 ? {} : JSON.parse(JSON.stringify(attr));
      this.propertyFormModelVisible = true;
      this.$nextTick(() => {
        if (this.$refs["attributeFormRef"]) this.$refs["attributeFormRef"].clearValidate();
      });
    },
    removeAttributes(attr, index) {
      this.$confirm("确认移除该属性吗？", "提示", {
        confirmButtonText: "确 认",
        cancelButtonText: "取 消"
      })
        .then(() => {
          this.elementPropertyList.splice(index, 1);
          this.bpmnElementPropertyList.splice(index, 1);
          // 新建一个属性字段的保存列表
          const propertiesObject = window.bpmnInstances.moddle.create(`${this.prefix}:Properties`, {
            values: this.bpmnElementPropertyList
          });
          this.updateElementExtensions(propertiesObject);
          this.resetAttributesList();
        })
        .catch(() => console.info("操作取消"));
    },
    saveAttribute() {
      const { name, value } = this.propertyForm;
      console.log(this.bpmnElementPropertyList);
      if (this.editingPropertyIndex !== -1) {
        window.bpmnInstances.modeling.updateModdleProperties(this.bpmnElement, this.bpmnElementPropertyList[this.editingPropertyIndex], {
          name,
          value
        });
      } else {
        // 新建属性字段
        const newPropertyObject = window.bpmnInstances.moddle.create(`${this.prefix}:Property`, { name, value });
        // 新建一个属性字段的保存列表
        const propertiesObject = window.bpmnInstances.moddle.create(`${this.prefix}:Properties`, {
          values: this.bpmnElementPropertyList.concat([newPropertyObject])
        });
        this.updateElementExtensions(propertiesObject);
      }
      this.propertyFormModelVisible = false;
      this.resetAttributesList();
    },
    updateElementExtensions(properties) {
      const extensions = window.bpmnInstances.moddle.create("bpmn:ExtensionElements", {
        values: this.otherExtensionList.concat([properties])
      });
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
        extensionElements: extensions
      });
    }
  }
};
</script>
