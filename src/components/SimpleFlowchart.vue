<template>
  <div @mouseup="itemRelease" @mousemove="itemMove">
    <div id="flowchart" class="flowchart" @dragstart="onDragStart">
      <div id="toolbar" class="flowchart-toolbar">
        <div class="flowchart-toolbar-item" @mousedown="(e) => itemClick(e, 'Rule')">
          <i class="el-icon-copy-document" style="font-size: 40px; margin-bottom: 10px;"></i>
          <span>Content</span>
        </div>
      </div>
      <v-touch id="flowchart-canvas" class="flowchart-container" @tap="vtouch">
        <div @mousemove="handleMove" @mouseup="handleUp" @mousedown="handleDown">
          <flowchart-node
            v-bind.sync="node"
            :showDrawer.sync="showDrawer"
            :isLocked.sync="updateLine.lockedNodes[index]"
            @addingButtons="addingButtons(node.id, $event)"
            :startNodeTitle.sync="scene.startNodeTitle"
            v-for="(node, index) in scene.nodes"
            :key="`node${index}`"
            :options="nodeOptions"
            @linkingStart="linkingStart(node.id, $event)"
            @linkingStop="linkingStop(node.id)"
            @nodeSelected="nodeSelected(node.id, $event)"
            @updateLines="updateLines(node.id, $event)"
            @updateButtonText="updateButtonText(node.id, $event)"
            @deleteButtonNode="deleteButtonNode(node.id, $event)"
            @nodeDelete="nodeDelete(node.id)"
            :foundIsStart="foundIsStart"
          ></flowchart-node>
          <svg width="100%" :height="`${height}px`">
            <flowchart-link
              v-bind.sync="link"
              v-for="(link, index) in lines()"
              :key="`link${index}`"
              @deleteLink="linkDelete(link.id)"
            />
          </svg>
        </div>
      </v-touch>
      <div
        class="dragging-node"
        v-if="moving"
        :style="{ top: `${draggingNodeTop}px`, left: `${draggingNodeLeft}px` }"
      >
        <div class="dragging-node-title" />
        <div class="dragging-node-label" />
      </div>
    </div>
  </div>
</template>

<script>
import FlowchartLink from "./FlowchartLink.vue";
import FlowchartNode from "./FlowchartNode.vue";
import { getMousePosition } from "../assets/utilty/position";

export default {
  name: "VueFlowchart",
  props: {
    scene: {
      type: Object,
      default() {
        return {
          startNodeTitle: "Conversation Start",
          centerX: 0,
          scale: 1,
          centerY: 0,
          nodes: [],
          links: []
        };
      }
    },
    height: {
      type: Number,
      default: 400
    },
    onDropNewNode: {
      type: Function,
      default: () => {}
    },
    showDrawer: {
      type: Object,
      default() {
        return {
          left: false,
          right: false
        };
      }
    }
  },
  data() {
    return {
      action: {
        linking: false,
        dragging: false,
        scrolling: false,
        selected: 0,
        moving: false
      },
      mouse: {
        x: 0,
        y: 0,
        lastX: 0,
        lastY: 0
      },
      draggingLink: null,
      rootDivOffset: {
        top: 0,
        left: 0
      },
      moving: false,
      draggingNodeTop: 0,
      draggingNodeLeft: 0,
      actionType: "",
      updateLine: {
        status: false,
        toNodeId: null,
        buttonHeight: null,
        buttonsLength: null,
        lockedNodes: []
      }
    };
  },
  components: {
    FlowchartLink,
    FlowchartNode
  },
  computed: {
    nodeOptions() {
      return {
        centerY: this.scene.centerY,
        centerX: this.scene.centerX,
        scale: this.scene.scale,
        offsetTop: this.rootDivOffset.top,
        offsetLeft: this.rootDivOffset.left,
        selected: this.action.selected,
        moving: this.action.moving
      };
    },
    foundIsStart() {
      return Boolean(this.scene.nodes.find(node => node.isStart));
    }
  },
  watch: {
    "scene.nodes": {
      handler: function(val, old) {
        if (val.length < old.length) {
          // deleted condition
          let deletedIndex = null;
          let found = null;

          old.forEach((item, index) => {
            found = val.find(subitem => subitem.id === item.id);

            if (!found) {
              deletedIndex = index;
            }
          });
          this.updateLine.lockedNodes = this.updateLine.lockedNodes.filter(
            (item, index) => index !== deletedIndex
          );
        } else if (val.length > old.length) {
          this.updateLine.lockedNodes = [...this.updateLine.lockedNodes, true];
        }
      },
      deep: true
    }
  },
  mounted() {
    this.rootDivOffset.top = this.$el ? this.$el.offsetTop : 0;
    this.rootDivOffset.left = this.$el ? this.$el.offsetLeft : 0;
    this.updateLine.lockedNodes = this.scene.nodes.map(() => true);
  },
  methods: {
    // eslint-disable-next-line
    vtouch(e) {
      // console.log({e});
    },
    addingButtons(nodeId, newButton) {
      const node = this.findNodeWithID(nodeId);

      if (!node.buttons || !node.buttons.length) {
        node.buttons = [];
        if (newButton) {
          this.scene.links = this.scene.links.filter(
            link => link.from !== nodeId
          );
        }
      }
      if (newButton) {
        // node.buttons.push(newButton);
        node.buttons = [...node.buttons, newButton];
      }
      this.$emit("buttonAdded", { nodeId, newButton });
    },
    updateLines(toNodeId, { buttonHeight, buttonsLength }) {
      // const foundIndex = this.scene.nodes.findIndex((node) => node.id === toNodeId);

      this.updateLine = {
        ...this.updateLine,
        toNodeId,
        buttonHeight,
        buttonsLength
      };
    },
    updateButtonText(nodeId, { buttonId, text }) {
      const updatedButton = this.findNodeWithID(nodeId).buttons.find(
        button => button.id === buttonId
      );

      updatedButton.text = text;
      this.$emit("buttonUpdated", { nodeId, updatedButton });
    },
    deleteButtonNode(nodeId, buttonId) {
      const node = this.findNodeWithID(nodeId);
      const deletedButton = node.buttons.find(button => button.id === buttonId);

      node.buttons = node.buttons.filter(button => button.id !== buttonId);
      this.scene.links = this.scene.links.filter(
        link => link.from !== nodeId || link.button !== buttonId
      );
      this.$emit("buttonDeleted", { nodeId, deletedButton });
    },
    lines() {
      let lines = this.scene.links.map(link => {
        const fromNode = this.findNodeWithID(link.from);
        const toNode = this.findNodeWithID(link.to);
        let x, y, cy, cx, ex, ey;
        let posResult;

        // console.log({ fromNode, toNode });
        if (!fromNode || !toNode) {
          const error = {
            message: "one of nodes not existed!",
            detail: {
              link,
              fromNode: fromNode || "not defined",
              toNode: toNode || "not defined"
            }
          };

          this.$emit("addErrors", error);

          return null;
        }

        x = this.scene.centerX + (fromNode.centeredX || fromNode.x);
        y = this.scene.centerY + (fromNode.centeredY || fromNode.y);
        posResult = this.getPortPosition(fromNode, "right", x, y, link.button);
        if (!posResult) {
          const error = {
            message: "not able positioning node buttons, button not exist!",
            detail: {
              link,
              fromNode,
              buttons: fromNode.buttons
            }
          };

          this.$emit("addErrors", error);

          return null;
        }
        [cx, cy] = posResult;

        x = this.scene.centerX + (toNode.centeredX || toNode.x);
        y = this.scene.centerY + (toNode.centeredY || toNode.y);
        posResult = this.getPortPosition(toNode, "left", x, y);
        [ex, ey] = posResult;

        if (this.updateLine.toNodeId === link.to) {
          if (this.updateLine.buttonHeight) {
            ey += this.updateLine.buttonHeight / 2;
          }

          let element = document.getElementById(
            "button_" + toNode.id + "_" + (this.updateLine.buttonsLength - 1)
          );
          if (
            (this.updateLine.buttonHeight >= 0 && element) ||
            (this.updateLine.buttonHeight < 0 && !element)
          ) {
            this.updateLine = {
              ...this.updateLine,
              buttonHeight: null,
              buttonsLength: null
            };
          }
        }

        return {
          start: [cx, cy],
          end: [ex, ey],
          id: link.id
        };
      });

      lines = lines.filter(line => line);

      if (this.draggingLink) {
        let x, y, cy, cx;
        const fromNode = this.findNodeWithID(this.draggingLink.from);
        x = this.scene.centerX + (fromNode.centeredX || fromNode.x);
        y = this.scene.centerY + (fromNode.centeredY || fromNode.y);
        [cx, cy] = this.getPortPosition(fromNode, "right", x, y, -1);
        // push temp dragging link, mouse cursor postion = link end postion
        lines.push({
          start: [cx, cy],
          end: [this.draggingLink.mx, this.draggingLink.my]
        });
      }
      return lines;
    },
    findNodeWithID(id) {
      return this.scene.nodes.find(item => {
        return id === item.id;
      });
    },
    getPortPosition(node, type, x, y, buttonId) {
      let labelHeight = 0,
        labelWidth = 0;

      let additionalHeight = 0;

      const labelElement = document.getElementById("node-main_" + node.id);
      if (labelElement) {
        labelHeight = labelElement.offsetHeight;
        labelWidth = labelElement.offsetWidth;
      }

      if (node.isStart) {
        const nodeStartTitleElement = document.getElementsByClassName(
          "node-start"
        )[0];
        additionalHeight += nodeStartTitleElement
          ? nodeStartTitleElement.offsetHeight
          : 0;
      }

      if (type === "right") {
        let buttonIndex = null;
        const index = this.scene.nodes.findIndex(
          nodeitem => nodeitem.id === node.id
        );

        if (
          buttonId &&
          buttonId !== -1 &&
          !this.updateLine.lockedNodes[index]
        ) {
          buttonIndex = node.buttons.findIndex(
            button => button.id === buttonId
          );
          if (buttonIndex < 0) {
            return null;
          }
        } else {
          if (
            buttonId === -1 &&
            this.draggingLink &&
            this.draggingLink.buttonIndex !== undefined &&
            !this.updateLine.lockedNodes[index]
          ) {
            // this line is important! -1 means the condition is in dragginglink
            buttonIndex = this.draggingLink.buttonIndex;
            // console.log({selected: this.draggingLink})
            // console.log({node, buttons: node.buttons})
            // return [x + labelWidth, y + labelHeight + 41 * (buttonIndex + 0.5 - node.buttons.length)]
          } else {
            return [x + labelWidth, y + labelHeight / 2 + additionalHeight / 2];
          }
        }

        const nodeTypeElement = document.getElementById(`node-type_${node.id}`);
        if (!nodeTypeElement) {
          return [0, 0];
        }

        const labelTitleElement = document.getElementById(
          `label-title_${node.id}`
        );
        if (!labelTitleElement) {
          return [0, 0];
        }

        // if (nodeTypeElement && labelTitleElement) {
        //   console.log({nodeTypeElement, labelTitleElement})
        // }
        const nodeTypeHeight = nodeTypeElement.offsetHeight;
        const labelTitleHeight = labelTitleElement.offsetHeight;
        // if (node.id === 1) {
        //   console.log({nodeTypeHeight, labelTitleHeight})
        // }
        let buttonHeight = labelTitleHeight + nodeTypeHeight;

        let element = null;
        for (let i = buttonIndex; i >= 0; i--) {
          // console.log({i, buttonHeight, additionalHeight})
          element = document.getElementById("button_" + node.id + "_" + i);

          if (!element) {
            continue;
          }
          if (i === buttonIndex) {
            buttonHeight += element.offsetHeight / 1.75;
          } else {
            buttonHeight += element.offsetHeight;
          }
        }

        buttonHeight += additionalHeight;
        return [x + labelWidth, y + buttonHeight];
      } else if (type === "left") {
        return [x, y + labelHeight / 2 + additionalHeight / 2];
      }
      // NOT USED YET =============================
      // if (type === 'top') {
      //   return [x + 40, y];
      // }
      // else if (type === 'bottom') {
      //   return [x + 40, y + 80];
      // }
      // ==========================================
    },
    linkingStart(nodeId, buttonIndex) {
      this.action.linking = true;
      this.draggingLink = {
        from: nodeId,
        buttonIndex,
        mx: null,
        my: null
      };
    },
    linkingStop(index) {
      // add new Link
      if (this.draggingLink && this.draggingLink.from !== index) {
        // check link existence
        const existed = this.scene.links.find(link => {
          return (
            link.from === this.draggingLink.from &&
            (link.button
              ? link.button ===
                this.findNodeWithID(link.from).buttons[
                  this.draggingLink.buttonIndex
                ].id
              : true)
          );
        });
        if (!existed) {
          let maxID = Math.max(
            0,
            ...this.scene.links.map(link => {
              return link.id;
            })
          );
          const fromNode = this.findNodeWithID(this.draggingLink.from);
          const outputButtonId =
            fromNode.buttons && fromNode.buttons.length
              ? fromNode.buttons[this.draggingLink.buttonIndex].id
              : undefined;
          const newLink = {
            id: maxID + 1,
            from: this.draggingLink.from,
            to: index,
            button: outputButtonId
          };
          this.scene.links.push(newLink);
          this.$emit("linkAdded", newLink);
        }
      }
      this.draggingLink = null;
    },
    linkDelete(id) {
      const deletedLink = this.scene.links.find(item => {
        return item.id === id;
      });
      if (deletedLink) {
        this.scene.links = this.scene.links.filter(item => {
          return item.id !== id;
        });
        this.$emit("linkBreak", deletedLink);
      }
    },
    nodeSelected(id, e) {
      this.action.dragging = id;
      this.action.selected = id;
      this.$emit("nodeClick", id);
      this.mouse.lastX =
        e.pageX || e.clientX + document.documentElement.scrollLeft;
      this.mouse.lastY =
        e.pageY || e.clientY + document.documentElement.scrollTop;
    },
    handleMove(e) {
      if (this.action.linking) {
        [this.mouse.x, this.mouse.y] = getMousePosition(this.$el, e);

        const canvas = document.getElementById("flowchart-canvas");
        const bodyRect = document.body.getBoundingClientRect();
        const rect = canvas.getBoundingClientRect();
        const offsetTop = rect.top - bodyRect.top;
        const offsetLeft = rect.left - bodyRect.left;

        this.mouse.x = (e.pageX || e.clientX) - offsetLeft;
        this.mouse.y = (e.pageY || e.clientY) - offsetTop;

        [this.draggingLink.mx, this.draggingLink.my] = [
          this.mouse.x,
          this.mouse.y
        ];
      }
      if (this.action.dragging) {
        this.action.moving = true;
        this.mouse.x =
          e.pageX || e.clientX + document.documentElement.scrollLeft;
        this.mouse.y =
          e.pageY || e.clientY + document.documentElement.scrollTop;
        let diffX = this.mouse.x - this.mouse.lastX;
        let diffY = this.mouse.y - this.mouse.lastY;

        this.mouse.lastX = this.mouse.x;
        this.mouse.lastY = this.mouse.y;
        this.moveSelectedNode(diffX, diffY);
      }
      if (this.action.scrolling) {
        [this.mouse.x, this.mouse.y] = getMousePosition(this.$el, e);
        let diffX = this.mouse.x - this.mouse.lastX;
        let diffY = this.mouse.y - this.mouse.lastY;

        this.mouse.lastX = this.mouse.x;
        this.mouse.lastY = this.mouse.y;

        this.scene.centerX = diffX;
        this.scene.centerY = diffY;

        this.scene.nodes = this.scene.nodes.map(node => ({
          ...node,
          centeredX: (node.centeredX || node.x) + diffX,
          centeredY: (node.centeredY || node.y) + diffY
        }));

        // this.hasDragged = true
      }
    },
    handleUp(e) {
      const target = e.target || e.srcElement;
      // eslint-disable-next-line
      // console.log('ini dari SimpleFlowchart.vue fungsi handleUp', this.$el);
      if (this.$el.contains(target)) {
        if (
          typeof target.className !== "string" ||
          target.className.indexOf("node-input") < 0
        ) {
          this.draggingLink = null;
        }
        if (
          typeof target.className === "string" &&
          target.className.indexOf("node-delete") > -1
        ) {
          // console.log('delete2', this.action.dragging);
          this.nodeDelete(this.action.dragging);
        }
      }
      this.action.linking = false;
      this.action.dragging = null;
      this.action.scrolling = false;
      this.action.moving = false;
    },
    handleDown(e) {
      const target = e.target || e.srcElement;
      // console.log('for scroll', target, e.keyCode, e.which)
      if (
        (target === this.$el || target.matches("svg, svg *")) &&
        e.which === 1
      ) {
        this.action.scrolling = true;
        [this.mouse.lastX, this.mouse.lastY] = getMousePosition(this.$el, e);
        this.action.selected = null; // deselectAll
      }
      this.$emit("canvasClick", e);
    },
    moveSelectedNode(dx, dy) {
      let index = this.scene.nodes.findIndex(item => {
        return item.id === this.action.dragging;
      });
      let left =
        (this.scene.nodes[index].centeredX || this.scene.nodes[index].x) +
        dx / this.scene.scale;
      let top =
        (this.scene.nodes[index].centeredY || this.scene.nodes[index].y) +
        dy / this.scene.scale;
      this.$set(
        this.scene.nodes,
        index,
        Object.assign(this.scene.nodes[index], {
          x: left,
          y: top,
          centeredX: left,
          centeredY: top
        })
      );
    },
    nodeDelete(id) {
      this.scene.nodes = this.scene.nodes.filter(node => {
        return node.id !== id;
      });
      this.scene.links = this.scene.links.filter(link => {
        return link.from !== id && link.to !== id;
      });
      this.$emit("nodeDelete", id);
    },
    onDragStart() {
      return false;
    },
    itemClick(e, action) {
      this.moving = true;
      this.actionType = action;
      this.draggingNodeTop = -100;
      this.draggingNodeLeft = -100;
      e.returnValue = false;
      return false;
    },
    itemMove(e) {
      if (this.moving) {
        [this.mouse.x, this.mouse.y] = getMousePosition(this.$el, e);

        const canvas = document.getElementById("flowchart");
        const bodyRect = document.body.getBoundingClientRect();
        const rect = canvas.getBoundingClientRect();
        const offsetTop = rect.top - bodyRect.top;
        const offsetLeft = rect.left - bodyRect.left;

        this.mouse.x = (e.pageX || e.clientX) - offsetLeft;
        this.mouse.y = (e.pageY || e.clientY) - offsetTop;
        let diffX = this.mouse.x;
        let diffY = this.mouse.y;

        diffX = diffX / this.scene.scale;
        diffY = diffY / this.scene.scale;

        this.draggingNodeTop = diffY;
        this.draggingNodeLeft = diffX;

        return false;
      }
    },
    // eslint-disable-next-line
    itemRelease(e) {
      if (this.moving) {
        this.moving = false;

        const toolbarWidth =
          document.getElementById("toolbar").clientWidth + 10;
        const titleHeight = document.getElementById("title").clientHeight;

        const y = this.draggingNodeTop - titleHeight;
        const x = this.draggingNodeLeft - toolbarWidth;

        this.$emit("onDropNewNode", {
          x,
          y,
          nodeType: this.actionType,
          label: "New Rule"
        });
      }
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.flowchart {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  flex: 1;
}
.dragging-node {
  width: 80px;
  height: 80px;
  position: absolute;
  opacity: 0.9;
  .dragging-node-title {
    background: #ff8855;
    color: white;
    font-size: 13px;
    height: 30px;
    width: 80px;
  }
  .dragging-node-label {
    height: 50px;
    background: #fff;
    width: 80px;
  }
}
.flowchart-toolbar {
  flex: 0.1;
  padding-top: 10px;
}
.flowchart-toolbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-bottom: 20px;
  text-align: center;
}
.square {
  width: 30px;
  height: 30px;
  border: 1px solid black;
  margin-bottom: 10px;
}
.flowchart-container {
  flex: 0.9;
  margin: 0;
  background: #ddd;
  position: relative;
  overflow: hidden;
  svg {
    cursor: grab;
    position: relative;
  }
}
</style>
