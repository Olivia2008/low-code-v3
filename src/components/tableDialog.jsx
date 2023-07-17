import { createVNode, defineComponent, reactive, render } from "vue";
import {
  ElButton,
  ElDialog,
  ElTable,
  ElTableColumn,
  ElInput,
} from "element-plus";

const TableComponent = defineComponent({
  props: {
    option: { type: Object },
  },
  setup(props, ctx) {
    // 响应式数据
    const state = reactive({
      option: props.option,
      isShow: false,
      editData: [],
    });
    let methods = {
      show(option) {
        state.option = option;
        state.isShow = true;
        state.editData = JSON.parse(JSON.stringify(option.data));
      },
    };
    ctx.expose(methods);
    const add = () => {
      state.editData.push({});
    };
    const onCancel = () => {
      state.isShow = false;
    };
    const onConfirm = () => {
      state.option.onConfirm(state.editData);
      state.isShow = false;
    };
    return () => {
      return (
        <ElDialog v-model={state.isShow} title={state.option.config.label}>
          {{
            default: () => (
              <div>
                <div>
                  <ElButton onClick={add}>添加</ElButton>
                  <ElButton>重置</ElButton>
                </div>
                <ElTable data={state.editData}>
                  <ElTableColumn
                    label="序号"
                    type="index"
                    width="60"></ElTableColumn>
                  {state.option.config.table.options.map((item) => {
                    return (
                      <ElTableColumn label={item.label}>
                        {{
                          default: ({ row }) => (
                            <ElInput v-model={row[item.field]}></ElInput>
                          ),
                        }}
                      </ElTableColumn>
                    );
                  })}
                  <ElTableColumn label="操作">
                    <ElButton type="danger">删除</ElButton>
                  </ElTableColumn>
                </ElTable>
              </div>
            ),
            footer: () => (
              <>
                <ElButton onClick={onCancel}>取消</ElButton>
                <ElButton onClick={onConfirm}>确定</ElButton>
              </>
            ),
          }}
        </ElDialog>
      );
    };
  },
});
let vm;
export const $tableDialog = (option) => {
  if (!vm) {
    const el = document.createElement("div");
    vm = createVNode(TableComponent, { option });
    let r = render(vm, el);
    document.body.appendChild((r, el));
  }
  let { show } = vm.component.exposed;
  show(option);
};
