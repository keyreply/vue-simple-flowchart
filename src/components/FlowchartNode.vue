<template>
  <div>
    <div
      class="flowchart-node"
      :style="nodeStyle"
      @mousedown="handleMousedown"
      @mouseover="handleMouseOver"
      @mouseleave="handleMouseLeave"
      :class="{ selected: options.selected === id }"
      ref="flowchartNode"
    >
      <div
        :id="'node-main_' + id"
        class="node-main"
        :class="{ 'version-exists': versions.length > 0 }"
      >
        <div
          class="node-port node-input"
          :style="nodePortStyle"
          @mousedown="inputMouseDown"
          @mouseup="inputMouseUp"
        />
        <div v-if="isStart" :id="'node-main_' + id" class="node-start">
          <el-input
            v-if="editing.start && !isLocked"
            :value="startNodeTitle"
            @input="$emit('update:startNodeTitle', $event)"
          />
          <span v-else>{{ startNodeTitle }}</span>
        </div>
        <div ref="nodeType" :id="'node-type_' + id" class="node-type">
          <div style="display: flex; align-items: center;">
            <!-- <el-button
              slot="reference"
              :icon="!isLocked ? 'el-icon-unlock' : 'el-icon-lock'"
              type="warning"
              size="mini"
              plain
              circle
              @click="$emit('update:isLocked', !isLocked); delay()"
            ></el-button>-->
            <!-- <el-select
              v-if="editing.type"
              :value="type"
              @input="$emit('update:type', nodeCategory[$event])"
            >
              <el-option v-for="(item, index) in nodeCategory" :key="index" :value="index">{{item}}</el-option>
            </el-select>-->
            <el-input
              v-if="editing.id && !isLocked"
              :value="id"
              @input="$emit('update:id', $event)"
            />
            <span v-else style="flex-grow: 1">{{ id }}</span>
            <el-popover
              placement="right-start"
              width="200"
              trigger="hover"
              title="Edit Menu"
            >
              <div style="display: flex; flex-direction: column;">
                <div style="display: flex;">
                  <span style="flex-grow: 1;">Starting Node</span>
                  <el-switch
                    :disabled="foundIsStart && !isStart"
                    :value="isStart"
                    @input="
                      $emit('update:isStart', !isStart);
                      delay();
                    "
                  />
                </div>
                <span style="flex-grow: 1;margin: 10px 0;">Version</span>
                <el-select value="EN" placeholder="Version">
                  <el-option label="English" value="EN"></el-option>
                  <el-option label="Bahasa Indonesia" value="ID"></el-option>
                </el-select>
                <el-popover
                  placement="buttom"
                  width="200"
                  trigger="hover"
                  title="Version"
                >
                  <div
                    style="display: flex; flex-direction: column; flex-grow: 1;"
                  >
                    <el-button type="text" plain>English</el-button>
                  </div>
                  <div
                    style="display: flex; flex-direction: column; flex-grow: 1;"
                  >
                    <el-button type="text" plain>Bahasa Indonesia</el-button>
                  </div>
                  <div
                    slot="reference"
                    style="display: flex; flex-direction: column; flex-grow: 1;"
                  >
                    <el-button type="text" plain>Version</el-button>
                  </div>
                </el-popover>
                <template v-if="!isLocked">
                  <el-divider content-position="left">Node Details</el-divider>
                  <div
                    v-if="isStart"
                    style="display: flex; flex-direction: column; flex-grow: 1;"
                  >
                    <el-button
                      :icon="editing.start ? 'el-icon-unlock' : 'el-icon-lock'"
                      :type="editing.start ? 'primary' : 'text'"
                      plain
                      @click="
                        editing.start = !editing.start;
                        delay();
                      "
                      >Start Title</el-button
                    >
                  </div>
                  <div
                    style="display: flex; flex-direction: column; flex-grow: 1;"
                  >
                    <el-button
                      :icon="editing.id ? 'el-icon-unlock' : 'el-icon-lock'"
                      :type="editing.id ? 'primary' : 'text'"
                      plain
                      @click="
                        editing.id = !editing.id;
                        delay();
                      "
                      >Node ID</el-button
                    >
                  </div>
                  <div
                    style="display: flex; flex-direction: column; flex-grow: 1;"
                  >
                    <el-button
                      :icon="editing.type ? 'el-icon-unlock' : 'el-icon-lock'"
                      :type="editing.type ? 'primary' : 'text'"
                      plain
                      @click="
                        editing.type = !editing.type;
                        delay();
                      "
                      >Type</el-button
                    >
                  </div>
                  <div
                    style="display: flex; flex-direction: column; flex-grow: 1;"
                  >
                    <el-button
                      :icon="editing.label ? 'el-icon-unlock' : 'el-icon-lock'"
                      :type="editing.label ? 'primary' : 'text'"
                      plain
                      @click="
                        editing.label = !editing.label;
                        delay();
                      "
                      >Label</el-button
                    >
                  </div>
                  <div
                    v-if="buttons.length"
                    style="display: flex; flex-direction: column; flex-grow: 1;"
                  >
                    <el-button
                      :icon="
                        editing.options.value
                          ? 'el-icon-unlock'
                          : 'el-icon-lock'
                      "
                      :type="editing.options.value ? 'primary' : 'text'"
                      plain
                      @click="
                        editing.options.value = !editing.options.value;
                        delay();
                      "
                      >Options</el-button
                    >
                  </div>
                </template>
                <el-divider content-position="left">Settings</el-divider>
                <!-- <div style="display: flex; flex-direction: column; flex-grow: 1;">
                  <el-button
                    :icon="!isLocked ? 'el-icon-unlock' : 'el-icon-lock'"
                    :type="!isLocked ? 'primary' : 'text'"
                    plain
                    @click="$emit('update:isLocked', !isLocked); delay()"
                  >{{!isLocked ? 'Lock' : 'Unlock'}} Editing</el-button>
                </div>-->
                <!-- <div style="display: flex; flex-direction: column; flex-grow: 1;">
                  <el-button
                    :id="'config-button_' + id"
                    type="text"
                    plain
                    @click="showingDrawer"
                  >Show Configurations</el-button>
                </div>-->
                <div
                  style="display: flex; flex-direction: column; flex-grow: 1;"
                >
                  <el-button
                    icon="el-icon-delete"
                    type="danger"
                    @click="$emit('nodeDelete')"
                    >Delete this node</el-button
                  >
                </div>
              </div>
              <el-button
                slot="reference"
                icon="el-icon-more"
                type="warning"
                size="mini"
                plain
                circle
              ></el-button>
            </el-popover>
          </div>
        </div>
        <div class="node-label" :id="'label_' + id">
          <div
            ref="labelTitle"
            class="node-label-title"
            :id="'label-title_' + id"
          >
            <el-input
              v-if="editing.label && !isLocked"
              type="textarea"
              :rows="3"
              :value="label"
              @input="$emit('update:label', $event)"
            />
            <span v-else>{{ label }}</span>
          </div>
          <div
            v-if="buttons.length > 0 && !isLocked"
            class="node-buttons"
            :id="'node-buttons_' + id"
          >
            <div
              @mouseover="button.show = true"
              @mouseleave="button.show = false"
              v-for="(button, index) in styledButtons"
              :key="index"
              :id="'button_' + id + '_' + index"
              class="node-label-button"
            >
              <div style="position: relative">
                <el-input
                  v-if="editing.options.value && !isLocked"
                  type="textarea"
                  :rows="temp.buttonRows"
                  :value="button.text"
                  @input="
                    $emit('updateButtonText', {
                      text: $event,
                      buttonId: button.id
                    })
                  "
                />
                <span v-else>{{ button.text }}</span>
                <div
                  style="top: -20px; right: -20px"
                  v-show="editing.options.value && button.show"
                  class="button-delete"
                  @click="$emit('deleteButtonNode', button.id)"
                >
                  &times;
                </div>
              </div>
              <div
                class="node-port node-output"
                :id="'port_' + id + '_' + index"
                :class="{ 'node-port-start': isStart }"
                :style="button.style"
                @mousedown="outputMouseDown"
                @mousemove="outputMouseMoveFromButtonNode(index)"
                @mouseup="outputMouseUp"
                @mouseleave="outputMouseUp"
              />
            </div>
          </div>
        </div>
        <div
          v-if="buttons.length === 0 || !!isLocked"
          :id="'node-output_' + id"
          class="node-port node-output"
          :style="nodePortStyle"
          @mousedown="outputMouseDown"
          @mousemove="outputMouseMove"
          @mouseleave="outputMouseUp"
          @mouseup="outputMouseUp"
        />
      </div>
      <!-- <div
        v-if="options.selected === id && !options.moving && !isLocked"
        :id="'add-button_' + id"
        class="node-config-button"
        @click="addingButton"
      >
        <span>Add other options...</span>
      </div> -->
      <div v-show="show.delete" class="node-delete">&times;</div>
    </div>
  </div>
</template>

<script>
import * as _ from "lodash";
export default {
  name: "FlowchartNode",
  props: {
    isLocked: {
      type: Boolean,
      default: true
    },
    foundIsStart: {
      type: Boolean,
      default: false
    },
    showDrawer: {
      type: Object,
      default() {
        return {
          left: false,
          right: false
        };
      },
      validator(val) {
        return typeof val === "object";
      }
    },
    startNodeTitle: {
      type: String,
      default: "Conversation Start",
      validator(val) {
        return typeof val === "string";
      }
    },
    id: {
      // type: Number,
      default: "newNodeId"
      // validator(val) {
      //   return typeof val === 'number'
      // }
    },
    x: {
      type: Number,
      default: 0,
      validator(val) {
        return typeof val === "number";
      }
    },
    y: {
      type: Number,
      default: 0,
      validator(val) {
        return typeof val === "number";
      }
    },
    type: {
      type: String,
      default: "Default"
    },
    label: {
      type: String,
      default: "input name"
    },
    options: {
      type: Object,
      default() {
        return {
          centerX: 0,
          scale: 1,
          centerY: 0
        };
      }
    },
    isStart: {
      type: Boolean,
      default() {
        return false;
      }
    },
    buttons: {
      type: Array,
      default() {
        return [];
      }
    },
    versions: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      temp: {
        buttonRows: 2
      },
      additionalHeight: 0,
      styledButtons: [],
      show: {
        delete: false
      },
      linkingStart: false,
      editing: {
        id: false,
        start: false,
        type: false,
        label: false,
        options: {
          value: false
          // buttons: this.buttons.map(() => false)
        },
        cache: false
      }
      // nodeCategory: ["Rule", "Action", "Script", "Decision", "Fork", "Join"]
    };
  },
  created() {
    this.refreshButtons();
  },
  mounted() {
    this.refreshButtons();
    this.refreshNodes();
  },
  watch: {
    buttons: {
      handler: function(val, old) {
        this.refreshButtons();
        if (val.length < old.length) {
          let deleted = null;
          let found = null;

          old.forEach(item => {
            found = val.find(subitem => subitem.id === item.id);

            if (!found) {
              deleted = item;
            }
          });

          this.$emit("updateLines", {
            buttonHeight: -this.getButtonHeight(deleted.text),
            buttonsLength: old.length
          });
        } else if (val.length > old.length) {
          this.$emit("updateLines", {
            buttonHeight: this.getButtonHeight("new option"),
            buttonsLength: val.length
          });
        }
      },
      deep: true
    },
    editing: {
      // eslint-disable-next-line
      handler: function(val) {
        this.refreshAll();
      },
      deep: true
    },
    isLocked: {
      // eslint-disable-next-line
      handler: function(val) {
        this.refreshAll();
      }
    },
    // eslint-disable-next-line
    isStart: function(val) {
      this.refreshAll();
    }
  },
  computed: {
    isEditing() {
      return (
        this.editing.start ||
        this.editing.type ||
        this.editing.label ||
        this.editing.options.value ||
        this.editing.id
      );
    },
    nodeStyle() {
      return {
        top: this.options.centerY + this.y * this.options.scale + "px", // remove: this.options.offsetTop +
        left: this.options.centerX + this.x * this.options.scale + "px", // remove: this.options.offsetLeft +
        transform: `scale(${this.options.scale})`
      };
    },
    nodePortStyle() {
      return {
        marginTop: this.additionalHeight + "px"
      };
    }
  },
  methods: {
    refreshNodes() {
      const startElement = document.getElementsByClassName("node-start")[0];
      // const configElement = document.getElementsByClassName(
      //   "node-config-button"
      // )[0];

      this.additionalHeight =
        this.isStart && startElement ? startElement.offsetHeight / 2 : 0;
    },
    refreshAll() {
      this.$emit("updateLines", {});
      this.refreshButtons();
      this.refreshNodes();
    },
    delay() {
      this.$nextTick(() => {
        this.editing.cache = !this.editing.cache;
      });
    },
    refreshButtons() {
      const buttons = _.cloneDeep(this.buttons);

      this.styledButtons = _.cloneDeep(buttons);

      // calculate height of each element
      const nodeTypeElement = this.$refs.nodeType;
      if (!nodeTypeElement) {
        return;
      }

      const labelTitleElement = this.$refs.labelTitle;
      if (!labelTitleElement) {
        return;
      }

      const nodeTypeHeight = nodeTypeElement.offsetHeight;
      const labelTitleHeight = labelTitleElement.offsetHeight;

      let buttonHeight = labelTitleHeight + nodeTypeHeight;

      // detect start node, if yes, add extra height
      let additionalHeight = 0;
      if (this.isStart) {
        const nodeStartTitleElement = document.getElementsByClassName(
          "node-start"
        )[0];
        additionalHeight += nodeStartTitleElement
          ? nodeStartTitleElement.offsetHeight
          : 0;
      }
      buttonHeight += additionalHeight;

      // calculate each port position
      for (let i = 0; i < buttons.length; i++) {
        const btnHeight = this.getButtonHeight(buttons[i].text);

        if (i === 0) {
          buttonHeight += btnHeight / 2;
        } else {
          buttonHeight += btnHeight / 2 + buttons[i - 1].height / 2;
        }

        // add button height as style to each button
        buttons[i].style = {
          top: buttonHeight + "px",
          right: "-8px",
          marginTop: "0px"
        };
        buttons[i].height = btnHeight;
        buttons[i].show = false;
        // add styled buttons as variable

        // if(this.id === 'conversation_resume_livechat') {
        //   console.log({labelTitleElement});
        //   console.log({ additionalHeight, nodeTypeHeight, labelTitleHeight })
        // }
        this.styledButtons = _.cloneDeep(buttons);
      }
    },
    buttonPortStyle(index) {
      const nodeTypeElement = this.$refs.nodeType;
      if (!nodeTypeElement) {
        return;
      }

      const labelTitleElement = this.$refs.labelTitle;
      if (!labelTitleElement) {
        return;
      }

      const nodeTypeHeight = nodeTypeElement.offsetHeight;
      const labelTitleHeight = labelTitleElement.offsetHeight;

      let buttonHeight = labelTitleHeight + nodeTypeHeight;

      let element = null;
      for (let i = index; i >= 0; i--) {
        const elements = this.$refs["button_" + this.id + "_" + i];
        if (elements) {
          element = elements[0];
        } else {
          continue;
        }
        if (!element) {
          continue;
        }
        if (i === index) {
          buttonHeight += element.offsetHeight / 1.75;
        } else {
          buttonHeight += element.offsetHeight;
        }
      }

      let additionalHeight = 0;
      if (this.isStart) {
        const nodeStartTitleElement = document.getElementsByClassName(
          "node-start"
        )[0];

        additionalHeight += nodeStartTitleElement
          ? nodeStartTitleElement.offsetHeight
          : 0;
      }
      buttonHeight += additionalHeight;

      return {
        top: buttonHeight + "px",
        right: "-8px",
        marginTop: "0px"
      };
    },
    handleMousedown(e) {
      const target = e.target || e.srcElement;
      if (
        target.className.indexOf("node-input") < 0 &&
        target.className.indexOf("node-output") < 0
      ) {
        this.$emit("nodeSelected", e);
      }
      if (!this.isEditing) {
        e.preventDefault();
      }
    },
    handleMouseOver() {
      this.show.delete = true;
    },
    handleMouseLeave() {
      this.show.delete = false;
    },
    getButtonHeight(btnText) {
      // create fake button
      const fakeBtn = document.createElement("div");
      fakeBtn.className = "node-label-button";
      fakeBtn.style = "padding: 10px; width: 224px; border-radius: 4px;";
      // fakeBtn.style.visibility = 'hidden';
      const fakeDiv = document.createElement("div");
      if (this.editing.options.value) {
        const textarea = document.createElement("textarea");
        textarea.className = "el-textarea__inner";
        textarea.style = "min-height: 33px";
        textarea.rows = this.temp.buttonRows;
        fakeDiv.appendChild(textarea);
      } else {
        const text = document.createElement("span");
        text.style = "font-size: 14px; text-align: center; font-weight: 600;";
        text.innerHTML = btnText;
        fakeDiv.appendChild(text);
      }
      fakeBtn.appendChild(fakeDiv);
      document.getElementById("flowchart-canvas").appendChild(fakeBtn);
      const height = fakeBtn.offsetHeight;
      document.getElementById("flowchart-canvas").removeChild(fakeBtn);
      return height;
    },
    outputMouseDown(e) {
      if (!this.isLocked) {
        this.linkingStart = true;
        e.preventDefault();
      }
    },
    // eslint-disable-next-line
    outputMouseMove(e) {
      if (this.linkingStart) {
        this.$emit("linkingStart");
      }
    },
    outputMouseMoveFromButtonNode(buttonIndex) {
      if (this.linkingStart) {
        this.$emit("linkingStart", buttonIndex);
      }
    },
    outputMouseUp(e) {
      this.linkingStart = false;
      e.preventDefault();
    },
    inputMouseDown(e) {
      e.preventDefault();
    },
    inputMouseUp(e) {
      this.$emit("linkingStop");
      e.preventDefault();
    },
    addingButton(e) {
      const maxButtonID = Math.max(0, ...this.buttons.map(button => button.id));

      this.$emit("addingButtons", {
        id: maxButtonID + 1,
        text: "new option"
      });

      this.refreshButtons();
      e.preventDefault();
    },
    showingDrawer(e) {
      this.showDrawer.left = true;
      this.showDrawer.right = true;
      e.preventDefault();
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
$themeColor: rgb(255, 136, 85);
$portSize: 16;

.flowchart-node {
  margin: 0;
  width: 250px;
  position: absolute;
  box-sizing: border-box;
  border: none;
  opacity: 0.9;
  cursor: move;
  transform-origin: top left;
  z-index: 1;

  .node-main {
    position: relative;
    text-align: center;
    &.version-exists {
      box-shadow: 2px 1px 1px rgba(0, 0, 0, 0.15);
      &:before {
        left: 7px;
        top: 5px;
        z-index: -1;
      }
      &:after {
        left: 12px;
        top: 10px;
        z-index: -2;
      }
      &:before,
      &:after {
        content: "";
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: #eee;
        box-shadow: 2px 1px 1px rgba(0, 0, 0, 0.15);
      }
    }
    .node-start {
      margin: 0 auto;
      background: #e4392b;
      padding: 6px;
      width: 200px;
      border-radius: 4px;
      position: relative;
      span {
        color: #fff;
        font-size: 14px;
        font-weight: 600;
      }
    }
    .node-type {
      background: #fff7e2;
      border: 2px solid #fee196;
      border-radius: 6px;
      border-bottom-left-radius: 0px;
      border-bottom-right-radius: 0px;
      color: black;
      font-size: 16px;
      font-weight: 600;
      padding: 6px;
    }
    .node-label {
      font-size: 14px;
      background: #fff;
      border: 2px solid #e0e6ed;

      .node-label-title {
        border-radius: 4px;
        background: #fff;
        padding: 16px;
      }
    }
  }
  .node-port {
    position: absolute;
    width: #{$portSize}px;
    height: #{$portSize}px;
    top: 50%;
    transform: translateY(-50%);
    border: 1px solid #ccc;
    border-radius: 100px;
    background: #8492a6;
    opacity: 0.8;
    &:hover {
      background: $themeColor;
      border: 1px solid $themeColor;
    }
  }
  .node-input {
    left: #{-2 + $portSize/-3}px;
  }
  .node-output {
    right: #{-2 + $portSize/-3}px;
  }
  .node-delete,
  .button-delete {
    position: absolute;
    right: -6px;
    top: -6px;
    font-size: 12px;
    width: 12px;
    height: 12px;
    color: $themeColor;
    cursor: pointer;
    background: white;
    border: 1px solid $themeColor;
    border-radius: 100px;
    text-align: center;
    &:hover {
      background: $themeColor;
      color: white;
    }
  }
  .node-config-button {
    border: 1px solid #dfdfdf;
    border-radius: 4px;
    color: #efefef;
    background: #0084ff;
    padding: 10px;
    font-weight: 600;
    &:hover {
      color: #efefef;
      background: #0084ffb9;
      cursor: pointer;
    }
  }
}
.node-label-button {
  border: 1px solid #dfdfdf;
  border-radius: 4px;
  background: #efefef;
  color: #0084ff;
  padding: 10px;
  font-weight: 600;
}
.selected {
  box-shadow: 0 0 0 2px $themeColor;
}
</style>
