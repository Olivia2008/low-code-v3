// 列表多可以显示所有的物料

// key对应组件的映射关系

function createEditorConfig() {
  const componentList = [];
  const componentMap = {};

  return {
    componentList,
    componentMap,
    register: (component) => {
      componentList.push(component);
      componentMap[component.key] = component;
    },
  };
}

export let registerConfig = createEditorConfig();
// console.log(registerConfig, "registerConfig");

registerConfig.register({
  label: "文本",
  preview: () => "预览文本",
  render: () => "渲染文本",
  key: "text",
});
registerConfig.register({
  label: "按钮",
  preview: () => <ElButton>预览按钮</ElButton>,
  render: () => <ElButton>渲染按钮</ElButton>,
  key: "button",
});
registerConfig.register({
  label: "输入框",
  preview: () => <ElInput placeholder="预览输入框"></ElInput>,
  render: () => <ElInput placeholder="请输入渲染框"></ElInput>,
  key: "input",
});
