import { reactive } from "vue";
import { events } from "./events";
export function useBlockDragger(focusData, lastSelectBlock, data) {
  let dragsState = {
    startX: 0,
    startY: 0,
    dragging: false, // 默认不是在拖拽
  };
  let markLine = reactive({
    x: null,
    y: null,
  });
  const mousedown = (e) => {
    const { width: BWidth, height: BHeight } = lastSelectBlock.value;
    dragsState = {
      startX: e.clientX,
      startY: e.clientY,
      dragging: false,
      startLeft: lastSelectBlock.value.left, // B点拖拽前的位置
      startTop: lastSelectBlock.value.top,
      startPos: focusData.value.focusList.map(({ top, left }) => ({
        top,
        left,
      })),
      lines: (() => {
        const { blurList } = focusData.value;
        // 计算横线位置用y来存放，x存放纵线
        let lines = { x: [], y: [] };
        const blurData = [
          ...blurList,
          {
            top: 0,
            left: 0,
            width: data.value.container.width,
            height: data.value.container.height,
          },
        ];
        blurData.forEach((block) => {
          const {
            top: ATop,
            left: ALeft,
            width: AWidth,
            height: AHeight,
          } = block;
          // 当此元素拖拽到和A元素top一致时，要显示辅助线，辅助线位置就是ATop
          // 顶对顶
          lines.y.push({ showTop: ATop, top: ATop });
          // 顶对底
          lines.y.push({ showTop: ATop, top: ATop - BHeight });
          // 中对中
          lines.y.push({
            showTop: ATop + AHeight / 2,
            top: ATop + AHeight / 2 - BHeight / 2,
          });
          // 底对顶
          lines.y.push({ showTop: ATop + AHeight, top: ATop + AHeight });
          // 底对底
          lines.y.push({
            showTop: ATop + AHeight,
            top: ATop + AHeight - BHeight,
          });

          // 纵线
          // 左对左
          lines.x.push({ showLeft: ALeft, left: ALeft });
          // 右对左
          lines.x.push({ showLeft: ALeft + AWidth, left: ALeft + AWidth });
          //中对中
          lines.x.push({
            showLeft: ALeft + AWidth / 2,
            left: ALeft + AWidth / 2 - BWidth / 2,
          });
          // 右对右
          lines.x.push({
            showLeft: ALeft + AWidth,
            left: ALeft + AWidth - BWidth,
          });
          // 左对右
          lines.x.push({
            showLeft: ALeft,
            left: ALeft - BWidth,
          });
        });
        return lines;
      })(),
    };
    document.addEventListener("mousemove", mousemove);
    document.addEventListener("mouseup", mouseup);
  };
  const mousemove = (e) => {
    let { clientX: moveX, clientY: moveY } = e;
    // 正在拖拽的状态
    if (!dragsState.dragging) {
      dragsState.dragging = true;
      events.emit("start");
    }
    // 计算当前元素最新的left,top去线里面找到显示线
    // 鼠标移动后-鼠标移动前+left
    let left = moveX - dragsState.startX + dragsState.startLeft;
    let top = moveY - dragsState.startY + dragsState.startTop;
    // 先计算横线，距离参照物元素还有5像素时显示辅助线
    let y = null;
    let x = null;
    // x 轴线
    for (let i = 0; i < dragsState.lines.y.length; i++) {
      const { top: t, showTop: s } = dragsState.lines.y[i];
      if (Math.abs(t - top) < 5) {
        // 如果小于5说明横向接近
        y = s; // 辅助线显示位置
        moveY = dragsState.startY - dragsState.startTop + t; // 容器距顶部距离+目标的高度
        break;
      }
    }
    // y 轴线
    for (let i = 0; i < dragsState.lines.x.length; i++) {
      const { left: l, showLeft: s } = dragsState.lines.x[i];
      if (Math.abs(l - left) < 5) {
        // 如果小于5说明横向接近
        x = s; // 辅助线显示位置
        moveX = dragsState.startX - dragsState.startLeft + l; // 容器距顶部距离+目标的高度
        break;
      }
    }
    markLine.x = x;
    markLine.y = y;
    let durX = moveX - dragsState.startX;
    let durY = moveY - dragsState.startY;
    focusData.value.focusList.forEach((block, idx) => {
      block.top = dragsState.startPos[idx].top + durY;
      block.left = dragsState.startPos[idx].left + durX;
    });
  };
  const mouseup = () => {
    document.removeEventListener("mousemove", mousemove);
    document.removeEventListener("mouseup", mouseup);
    markLine.x = null;
    markLine.y = null;
    if (dragsState.dragging) {
      events.emit("end");
    }
  };
  return {
    mousedown,
    markLine,
  };
}
