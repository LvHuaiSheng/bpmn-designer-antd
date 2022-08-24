<template>
  <div class="process-panel__container" :style="{ width: `${this.width}px` }" :class="hide?'hide':''">
    <div class="switch-btn" @click="changePanelHide">
      <DoubleRightOutlined class="hide-btn" v-if="!hide"/>
      <DoubleLeftOutlined class="show-btn" v-else/>
    </div>
    <div class="process-panel-box" >
      <a-collapse v-model:activeKey="activeTab">
        <a-collapse-panel key="base">
          <template #header>
            <div class="panel-tab__title"><info-circle-outlined />常规</div>
          </template>
          <element-base-info :id-edit-disabled="idEditDisabled" :business-object="elementBusinessObject" :type="elementType" />
        </a-collapse-panel>
        <a-collapse-panel v-if="elementType === 'Process'" key="message">
          <template #header>
            <div class="panel-tab__title"><a-icon><comment /></a-icon>消息与信号</div>
          </template>
          <signal-and-massage />
        </a-collapse-panel>
        <a-collapse-panel v-if="conditionFormVisible" key="condition">
          <template #header>
            <div class="panel-tab__title">流转条件</div>
          </template>
          <flow-condition :business-object="elementBusinessObject" :type="elementType" />
        </a-collapse-panel>
        <a-collapse-panel v-if="formVisible" key="form">
          <template #header>
            <div class="panel-tab__title"><a-icon><list /></a-icon>表单</div>
          </template>
          <element-form :id="elementId" :type="elementType" />
        </a-collapse-panel>
        <a-collapse-panel v-if="elementType.indexOf('Task') !== -1" key="task">
          <template #header>
            <div class="panel-tab__title">任务</div>
          </template>
          <element-task :id="elementId" :type="elementType" />
        </a-collapse-panel>
        <a-collapse-panel v-if="elementType.indexOf('Task') !== -1" key="multiInstance">
          <template #header>
            <div class="panel-tab__title">多实例</div>
          </template>
          <element-multi-instance :business-object="elementBusinessObject" :type="elementType" />
        </a-collapse-panel>
        <a-collapse-panel key="listeners">
          <template #header>

            <div class="panel-tab__title">执行监听器</div>
          </template>
          <element-listeners :id="elementId" :type="elementType" />
        </a-collapse-panel>
        <a-collapse-panel v-if="elementType === 'UserTask'" key="taskListeners">
          <template #header>

            <div class="panel-tab__title">任务监听器</div>
          </template>
          <user-task-listeners :id="elementId" :type="elementType" />
        </a-collapse-panel>
        <a-collapse-panel key="extensions">
          <template #header>

            <div class="panel-tab__title">扩展属性</div>
          </template>
          <element-properties :id="elementId" :type="elementType" />
        </a-collapse-panel>
        <a-collapse-panel key="other">
          <template #header>

            <div class="panel-tab__title">其他</div>
          </template>
          <element-other-config :id="elementId" />
        </a-collapse-panel>
      </a-collapse>
    </div>
  </div>
</template>
<script>
import ElementBaseInfo from "./base/ElementBaseInfo";
import ElementOtherConfig from "./other/ElementOtherConfig";
import ElementTask from "./task/ElementTask";
import ElementMultiInstance from "./multi-instance/ElementMultiInstance";
import FlowCondition from "./flow-condition/FlowCondition";
import SignalAndMassage from "./signal-message/SignalAndMessage";
import ElementListeners from "./listeners/ElementListeners";
import ElementProperties from "./properties/ElementProperties";
import ElementForm from "./form/ElementForm";
import UserTaskListeners from "./listeners/UserTaskListeners";
import Log from "../Log";
import {
  InfoCircleOutlined,
  DoubleRightOutlined,
  DoubleLeftOutlined,
} from "@ant-design/icons-vue";
/**
 * 侧边栏
 * @Author MiyueFE
 * @Home https://github.com/miyuesc
 * @Date 2021年3月31日18:57:51
 */
export default {
  name: "MyPropertiesPanel",
  components: {
    InfoCircleOutlined,
    DoubleRightOutlined,
    DoubleLeftOutlined,
    UserTaskListeners,
    ElementForm,
    ElementProperties,
    ElementListeners,
    SignalAndMassage,
    FlowCondition,
    ElementMultiInstance,
    ElementTask,
    ElementOtherConfig,
    ElementBaseInfo
  },
  componentName: "MyPropertiesPanel",
  props: {
    bpmnModeler: Object,
    prefix: {
      type: String,
      default: "camunda"
    },
    width: {
      type: Number,
      default: 480
    },
    idEditDisabled: {
      type: Boolean,
      default: false
    }
  },
  provide() {
    return {
      prefix: this.prefix,
      width: this.width
    };
  },
  data() {
    return {
      hide:false,
      activeTab: ['base','condition','form','task'],
      elementId: "",
      elementType: "",
      elementBusinessObject: {}, // 元素 businessObject 镜像，提供给需要做判断的组件使用
      conditionFormVisible: false, // 流转条件设置
      formVisible: false // 表单配置
    };
  },
  watch: {
    elementId: {
      handler() {
        this.activeTab = ['base','condition','form','task'];
      }
    }
  },
  created() {
    this.initModels();
  },
  methods: {
    changePanelHide(){
      this.hide=!this.hide
    },
    initModels() {
      // 初始化 modeler 以及其他 moddle
      if (!this.bpmnModeler) {
        // 避免加载时 流程图 并未加载完成
        this.timer = setTimeout(() => this.initModels(), 10);
        return;
      }
      if (this.timer) clearTimeout(this.timer);
      window.bpmnInstances = {
        modeler: this.bpmnModeler,
        modeling: this.bpmnModeler.get("modeling"),
        moddle: this.bpmnModeler.get("moddle"),
        eventBus: this.bpmnModeler.get("eventBus"),
        bpmnFactory: this.bpmnModeler.get("bpmnFactory"),
        elementFactory: this.bpmnModeler.get("elementFactory"),
        elementRegistry: this.bpmnModeler.get("elementRegistry"),
        replace: this.bpmnModeler.get("replace"),
        selection: this.bpmnModeler.get("selection")
      };
      this.getActiveElement();
    },
    getActiveElement() {
      // 初始第一个选中元素 bpmn:Process
      this.initFormOnChanged(null);
      this.bpmnModeler.on("import.done", e => {
        this.initFormOnChanged(null);
      });
      // 监听选择事件，修改当前激活的元素以及表单
      this.bpmnModeler.on("selection.changed", ({ newSelection }) => {
        this.initFormOnChanged(newSelection[0] || null);
      });
      this.bpmnModeler.on("element.changed", ({ element }) => {
        // 保证 修改 "默认流转路径" 类似需要修改多个元素的事件发生的时候，更新表单的元素与原选中元素不一致。
        if (element && element.id === this.elementId) {
          this.initFormOnChanged(element);
        }
      });
    },
    // 初始化数据
    initFormOnChanged(element) {
      let activatedElement = element;
      if (!activatedElement) {
        activatedElement =
          window.bpmnInstances.elementRegistry.find(el => el.type === "bpmn:Process") ??
          window.bpmnInstances.elementRegistry.find(el => el.type === "bpmn:Collaboration");
      }
      if (!activatedElement) return;
      Log.printBack(`select element changed: id: ${activatedElement.id} , type: ${activatedElement.businessObject.$type}`);
      Log.prettyInfo("businessObject", activatedElement.businessObject);
      window.bpmnInstances.bpmnElement = activatedElement;
      this.bpmnElement = activatedElement;
      this.elementId = activatedElement.id;
      this.elementType = activatedElement.type.split(":")[1] || "";
      this.elementBusinessObject = activatedElement.businessObject
      this.conditionFormVisible = !!(
        this.elementType === "SequenceFlow" &&
        activatedElement.source &&
        activatedElement.source.type.indexOf("StartEvent") === -1
      );
      this.formVisible = this.elementType === "UserTask" || this.elementType === "StartEvent";
    },
    beforeUnmount() {
      window.bpmnInstances = null;
    }
  }
};
</script>
