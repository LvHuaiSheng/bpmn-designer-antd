<template>
  <div style="margin-top: 16px">
    <a-form-item label="处理用户">
      <a-select v-model="userTaskForm.assignee" @change="updateElementTask('assignee')">
        <a-select-option v-for="ak in mockData" :key="'ass-' + ak" :value="`user${ak}`">{{`用户${ak}`}}</a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item label="候选用户">
      <a-select v-model="userTaskForm.candidateUsers" multiple collapse-tags @change="updateElementTask('candidateUsers')">
        <a-select-option v-for="uk in mockData" :key="'user-' + uk" :value="`user${uk}`" >{{`用户${uk}`}}</a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item label="候选分组">
      <a-select v-model="userTaskForm.candidateGroups" multiple collapse-tags @change="updateElementTask('candidateGroups')">
        <a-select-option v-for="gk in mockData" :key="'ass-' + gk" :value="`group${gk}`" >{{`分组${gk}`}}</a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item label="到期时间">
      <a-input v-model:value="userTaskForm.dueDate" clearable @change="updateElementTask('dueDate')" />
    </a-form-item>
    <a-form-item label="跟踪时间">
      <a-input v-model:value="userTaskForm.followUpDate" clearable @change="updateElementTask('followUpDate')" />
    </a-form-item>
    <a-form-item label="优先级">
      <a-input v-model:value="userTaskForm.priority" clearable @change="updateElementTask('priority')" />
    </a-form-item>
  </div>
</template>

<script>
export default {
  name: "UserTask",
  props: {
    id: String,
    type: String
  },
  data() {
    return {
      defaultTaskForm: {
        assignee: "",
        candidateUsers: [],
        candidateGroups: [],
        dueDate: "",
        followUpDate: "",
        priority: ""
      },
      userTaskForm: {},
      mockData: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    };
  },
  watch: {
    id: {
      immediate: true,
      handler() {
        this.bpmnElement = window.bpmnInstances.bpmnElement;
        this.$nextTick(() => this.resetTaskForm());
      }
    }
  },
  methods: {
    resetTaskForm() {
      for (let key in this.defaultTaskForm) {
        let value;
        if (key === "candidateUsers" || key === "candidateGroups") {
          value = this.bpmnElement?.businessObject[key] ? this.bpmnElement.businessObject[key].split(",") : [];
        } else {
          value = this.bpmnElement?.businessObject[key] || this.defaultTaskForm[key];
        }
        this.userTaskForm[key] = value
      }
    },
    updateElementTask(key) {
      const taskAttr = Object.create(null);
      if (key === "candidateUsers" || key === "candidateGroups") {
        taskAttr[key] = this.userTaskForm[key] && this.userTaskForm[key].length ? this.userTaskForm[key].join() : null;
      } else {
        taskAttr[key] = this.userTaskForm[key] || null;
      }
      window.bpmnInstances.modeling.updateProperties(this.bpmnElement, taskAttr);
    }
  },
  beforeUnmount() {
    this.bpmnElement = null;
  }
};
</script>
