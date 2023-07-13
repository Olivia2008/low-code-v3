import { computed, defineComponent, inject, ref } from "vue";
import "./editor.scss";
import EditorBlock from "./editor-blocks";
import { useMenuDragger } from "./useMenuDragger";
import { useFocus } from "./useFocus";
import { useBlockDragger } from "./useBlockDragger";
import { useCommand } from "./useCommand";
import { $dialog } from "../components/dialog";
import { $dropDown, DropdownItem } from "../components/dropDown";
export default defineComponent({
  props: {
    modelValue: { type: Object },
  },
  emits: ["update:modelValue"],
  setup(props, ctx) {
    // 预览时内容不能再操作，可以点击输入内容，方便看效果
    const previewRef = ref(false);
    const edtionRef = ref(true);

    const data = computed({
      get() {
        return props.modelValue;
      },
      set(newV) {
        ctx.emit("update:modelValue", JSON.parse(JSON.stringify(newV)));
      },
    });
    const containerStyle = computed(() => ({
      width: data.value.container.width + "px",
      height: data.value.container.height + "px",
    }));
    const config = inject("config");

    const containerRef = ref(null);
    // 实现拖拽
    const { dragstart, dragend } = useMenuDragger(containerRef, data);
    // 实现获取焦点,选中后直接进行拖拽，实现多个元素拖拽
    const {
      containerMousedown,
      focusData,
      blockMouseDown,
      lastSelectBlock,
      clearBlockFocus,
    } = useFocus(data, previewRef, (e) => {
      mousedown(e);
    });
    const { mousedown, markLine } = useBlockDragger(
      focusData,
      lastSelectBlock,
      data
    );
    // 菜单栏按钮
    const { commands } = useCommand(data, focusData);
    const buttons = [
      {
        label: "撤销",
        icon: "icon iconfont icon-undo",
        handler: () => commands.undo(),
      },
      {
        label: "重做",
        icon: "icon iconfont icon-redo",
        handler: () => commands.redo(),
      },
      {
        label: "导出",
        icon: "icon iconfont icon-export",
        handler: () => {
          $dialog({
            title: "导出json使用",
            content: JSON.stringify(data.value),
          });
        },
      },
      {
        label: "导入",
        icon: "icon iconfont icon-import",
        handler: () => {
          $dialog({
            title: "导入json使用",
            content: "",
            footer: true,
            onConfirm(text) {
              commands.updateContainer(JSON.parse(text));
            },
          });
        },
      },
      {
        label: "置顶",
        icon: "icon iconfont icon-control-top",
        handler: () => commands.placeTop(),
      },
      {
        label: "置底",
        icon: "icon iconfont icon-zhidi1",
        handler: () => commands.placeBottom(),
      },
      {
        label: "删除",
        icon: "icon iconfont icon-delete",
        handler: () => commands.delete(),
      },
      {
        label: () => (previewRef.value ? "编辑" : "预览"),
        icon: () =>
          previewRef.value
            ? "icon iconfont icon-tianxie"
            : "icon iconfont icon-yulan",
        handler: () => {
          previewRef.value = !previewRef.value;
          clearBlockFocus();
        },
      },
      {
        label: "关闭",
        icon: "icon iconfont icon-guanbi",
        handler: () => {
          edtionRef.value = false;
          clearBlockFocus();
        },
      },
    ];
    const onRightClickMenu = (e, block) => {
      e.preventDefault();

      $dropDown({
        el: e.target,
        content: () => (
          <>
            <DropdownItem
              label="删除"
              icon="icon-delete"
              onClick={() => commands.delete()}></DropdownItem>
            <DropdownItem
              label="置顶"
              icon="icon-control-top"
              onClick={() => commands.placeTop()}></DropdownItem>
            <DropdownItem
              label="置底"
              icon="icon-zhidi1"
              onClick={() => commands.placeBottom()}></DropdownItem>
            <DropdownItem
              label="查看"
              icon="icon-yulan"
              onClick={() => {
                $dialog({
                  title: "查看节点数据",
                  content: JSON.stringify(block),
                });
              }}></DropdownItem>
            <DropdownItem
              label="导入"
              icon="icon-import"
              onClick={() => {
                $dialog({
                  title: "导入节点数据",
                  content: "",
                  footer: true,
                  onConfirm(text) {
                    commands.updateBlock(JSON.parse(text), block);
                  },
                });
              }}></DropdownItem>
          </>
        ),
      });
    };
    return () =>
      !edtionRef.value ? (
        <>
          <div
            className="editor-container-canvas_content"
            style={{ ...containerStyle.value, margin: 0 }}>
            {data.value.blocks.map((item) => (
              <EditorBlock
                class="editor-block-preview"
                block={item}></EditorBlock>
            ))}
            <ElButton type="primary" onClick={() => (edtionRef.value = true)}>
              返回
            </ElButton>
          </div>
        </>
      ) : (
        <div className="editor">
          <div className="editor-left">
            {config.componentList.map((com) => (
              <div
                className="editor-left-item"
                draggable
                onDragstart={(e) => dragstart(e, com)}
                onDragend={dragend}>
                <span>{com.label}</span>
                <div>{com.preview()}</div>
              </div>
            ))}
          </div>
          <div className="editor-top">
            {buttons.map((btn) => {
              const icon =
                typeof btn.icon === "function" ? btn.icon() : btn.icon;
              const label =
                typeof btn.label === "function" ? btn.label() : btn.label;
              return (
                <div className="editor-top-button" onClick={btn.handler}>
                  <i class={icon}></i>
                  <span>{label}</span>
                </div>
              );
            })}
          </div>
          <div className="editor-right">属性控制栏目</div>
          {/* 滚动条 */}
          <div className="editor-container">
            {/* 内容区 */}
            <div className="editor-container-canvas">
              <div
                className="editor-container-canvas_content"
                ref={containerRef}
                style={containerStyle.value}
                onMousedown={containerMousedown}>
                {data.value.blocks.map((item, index) => (
                  <EditorBlock
                    class={
                      item.focus
                        ? "editor-block-focus"
                        : "" || previewRef.value
                        ? "editor-block-preview"
                        : ""
                    }
                    block={item}
                    onMousedown={(e) => blockMouseDown(e, item, index)}
                    onContextmenu={(e) =>
                      onRightClickMenu(e, item)
                    }></EditorBlock>
                ))}
                {markLine.x !== null && (
                  <div class="line-x" style={{ left: markLine.x + "px" }}></div>
                )}
                {markLine.y !== null && (
                  <div class="line-y" style={{ top: markLine.y + "px" }}></div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
  },
});
