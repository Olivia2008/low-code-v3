import { events } from "./events";
export function useMenuDragger(containerRef, data) {
  let currentCom = null;
  // dragenter 进入元素中加一个移动的标识
  const dragEnter = (e) => {
    e.dataTransfer.dropEffect = "move";
  };
  // dragoverd 在目标元素经过，必须阻止默认行为，否则不能触发drop
  const dragOver = (e) => {
    e.preventDefault();
  };
  // dragleve 离开元素的时候，需要增加一个禁用标识
  const dragLeave = (e) => {
    e.dataTransfer.dropEffect = "none";
  };
  // drop松手时，根据拖拽的组件，添加一个组件
  const drop = (e) => {
    let blocks = data.value.blocks;
    data.value = {
      ...data.value,
      blocks: [
        ...blocks,
        {
          top: e.offsetY,
          left: e.offsetX,
          zIndex: 1,
          key: currentCom.key,
          alignCenter: true, // 松手居中
        },
      ],
    };
    // ctx.emit("handledrop", JSON.parse(JSON.stringify(newData)));
    currentCom = null;
  };
  const dragstart = (e, com) => {
    containerRef.value.addEventListener("dragenter", dragEnter);
    containerRef.value.addEventListener("dragover", dragOver);
    containerRef.value.addEventListener("dragleave", dragLeave);
    containerRef.value.addEventListener("drop", drop);
    currentCom = com;
    events.emit("start");
  };
  const dragend = () => {
    containerRef.value.removeEventListener("dragenter", dragEnter);
    containerRef.value.removeEventListener("dragover", dragOver);
    containerRef.value.removeEventListener("dragleave", dragLeave);
    containerRef.value.removeEventListener("drop", drop);
    events.emit("end");
  };
  return {
    dragstart,
    dragend,
  };
}
