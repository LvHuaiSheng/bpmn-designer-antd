<template>
  <div class="panel-tab__content">
    <a-form size="small" label-width="90px" @submit.prevent>
      <a-form-item label="ID">
        <a-input v-model:value="elementBaseInfo.id" :disabled="idEditDisabled" clearable @change="updateBaseInfo('id')" />
      </a-form-item>
      <a-form-item label="名称">
        <a-input v-model:value="elementBaseInfo.name" clearable @change="updateBaseInfo('name')" />
      </a-form-item>
      <!--流程的基础属性-->
      <template v-if="elementBaseInfo.$type === 'bpmn:Process'">
        <a-form-item label="版本标签">
          <a-input v-model:value="elementBaseInfo.versionTag" clearable @change="updateBaseInfo('versionTag')" />
        </a-form-item>
        <a-form-item label="可执行">
          <a-switch v-model:checked="elementBaseInfo.isExecutable" active-text="是" inactive-text="否" @change="updateBaseInfo('isExecutable')" />
        </a-form-item>
      </template>
      <a-form-item v-if="elementBaseInfo.$type === 'bpmn:SubProcess'" label="状态">
        <a-switch v-model:checked="elementBaseInfo.isExpanded" active-text="展开" inactive-text="折叠" @change="updateBaseInfo('isExpanded')" />
      </a-form-item>
    </a-form>
  </div>
</template>
<script>
export default {
  name: "ElementBaseInfo",
  props: {
    businessObject: Object,
    type: String,
    idEditDisabled: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      elementBaseInfo: {}
    };
  },
  watch: {
    businessObject: {
      immediate: false,
      handler: function(val) {
        if (val) {
          this.$nextTick(() => this.resetBaseInfo());
        }
      }
    }
  },
  methods: {
    resetBaseInfo() {
      this.bpmnElement = window?.bpmnInstances?.bpmnElement || {};
      this.elementBaseInfo = JSON.parse(JSON.stringify(this.bpmnElement.businessObject));
      if (this.elementBaseInfo && this.elementBaseInfo.$type === "bpmn:SubProcess") {
        this.elementBaseInfo["isExpanded"] = this.elementBaseInfo.di?.isExpanded
      }
    },
    updateBaseInfo(key) {
      if (key === "id") {
        window.bpmnInstances.modeling.updateProperties(this.bpmnElement, {
          id: this.elementBaseInfo[key],
          di: { id: `${this.elementBaseInfo[key]}_di` }
        });
        return;
      }
      if (key === "isExpanded") {
        window?.bpmnInstances?.modeling.toggleCollapse(this.bpmnElement);
        return;
      }
      const attrObj = Object.create(null);
      attrObj[key] = this.elementBaseInfo[key];
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, attrObj);
    }
  },
  beforeUnmount() {
    this.bpmnElement = null;
  }
};
</script>
