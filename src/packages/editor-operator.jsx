import { defineComponent, inject, reactive, watch } from "vue";
import {
  ElColorPicker,
  ElForm,
  ElFormItem,
  ElInputNumber,
  ElSelect,
  ElOption,
} from "element-plus";
import TableEditor from "./table-editor";
export default defineComponent({
  props: {
    block: { type: Object },
    data: { type: Object },
    updateContainer: { type: Function },
    updateBlock: { type: Function },
  },
  setup: (props) => {
    const config = inject("config");
    const state = reactive({
      editData: {},
    });
    const reset = () => {
      if (!props.block) {
        // 绑定data.json中的容器的宽高
        state.editData = JSON.parse(JSON.stringify(props.data.container));
      } else {
        state.editData = JSON.parse(JSON.stringify(props.block));
      }
    };
    const apply = () => {
      if (!props.block) {
        // 更改容器组件大小
        props.updateContainer({ ...props.data, container: state.editData });
      } else {
        // 更改组件属性
        props.updateBlock(state.editData, props.block);
      }
    };
    // 及时监听props.block, reset
    watch(() => props.block, reset, { immediate: true });
    return () => {
      let content = [];
      if (!props.block) {
        content.push(
          <>
            <ElFormItem label="容器宽度">
              <ElInputNumber v-model={state.editData.width}></ElInputNumber>
            </ElFormItem>
            <ElFormItem label="容器高度">
              <ElInputNumber v-model={state.editData.height}></ElInputNumber>
            </ElFormItem>
          </>
        );
      } else {
        let component = config.componentMap[props.block.key];
        if (component && component.props) {
          content.push(
            // eslint-disable-next-line no-unused-vars
            Object.entries(component.props).map(([propName, propConfig]) => {
              return (
                <ElFormItem label={propConfig.label}>
                  {{
                    input: () => (
                      <ElInput
                        v-model={state.editData.props[propName]}></ElInput>
                    ),
                    color: () => (
                      <ElColorPicker
                        v-model={
                          state.editData.props[propName]
                        }></ElColorPicker>
                    ),
                    select: () => (
                      <ElSelect v-model={state.editData.props[propName]}>
                        {propConfig.options.map((option) => {
                          return (
                            <ElOption
                              label={option.label}
                              value={option.value}></ElOption>
                          );
                        })}
                      </ElSelect>
                    ),
                    table: () => (
                      <TableEditor
                        propConfig={propConfig}
                        v-model={state.editData.props[propName]}></TableEditor>
                    ),
                  }[propConfig.type]()}
                </ElFormItem>
              );
            })
          );
        }
        if (component && component.model) {
          content.push(
            Object.entries(component.model).map(([modelName, label]) => {
              return (
                <ElFormItem label={label}>
                  <ElInput v-model={state.editData.model[modelName]}></ElInput>
                </ElFormItem>
              );
            })
          );
        }
      }
      return (
        <ElForm labelPostion="top" style="padding: 30px">
          {content}
          <ElFormItem>
            <ElButton type="primary" onClick={() => apply()}>
              应用
            </ElButton>
            <ElButton onClick={() => reset()}>重置</ElButton>
          </ElFormItem>
        </ElForm>
      );
    };
  },
});
