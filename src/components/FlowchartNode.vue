<template>
  <div class="flowchart-node" :style="nodeStyle" 
    @mousedown="handleMousedown"
    @mouseover="handleMouseOver"
    @mouseleave="handleMouseLeave"
    v-bind:class="{selected: options.selected === id}"
  >
    <div class="node-port node-input" :class="{ 'node-port-start': isStart, 'editing': options.selected === id && !options.moving, 'editing-start': isStart && options.selected === id && !options.moving }"
      @mousedown="inputMouseDown"
      @mouseup="inputMouseUp"
    ></div>
    <div :id="'node-main_' + id" class="node-main">
      <div v-if="isStart" :id="'node-main_' + id" class="node-start">
        <el-input v-if="editing.start" :value="startNodeTitle" @input="$emit('update:startNodeTitle', $event)" />
        <span v-else>{{startNodeTitle}}</span>
      </div>
      <div ref="nodeType" :id="'node-type_' + id" class="node-type">
        <div style="display: flex; align-items: center;">
          <el-select v-if="editing.type" :value="type" @input="$emit('update:type', nodeCategory[$event])" >
            <el-option v-for="(item, index) in nodeCategory" :key="index" :value="index">{{item}}</el-option>
          </el-select>
          <span v-else style="flex-grow: 1">{{type}}</span>
          <el-popover
            placement="right-start"
            width="200"
            trigger="hover"
            title="Edit Menu"
          >
            <div style="display: flex; flex-direction: column;">
              <div style="display: flex;">
                <span style="flex-grow: 1;">Node Start</span>
                <el-switch :disabled="foundIsStart && !isStart" :value="isStart" @input="$emit('update:isStart', !isStart); delay()"/>
              </div>
              <el-popover
                placement="right-start"
                width="200"
                trigger="hover"
                title="Version"
              >
                <div style="display: flex; flex-direction: column; flex-grow: 1;">
                  <el-button type="text" plain>English</el-button>
                </div>
                <div style="display: flex; flex-direction: column; flex-grow: 1;">
                  <el-button type="text" plain>Bahasa Indonesia</el-button>
                </div>
                <div slot="reference" style="display: flex; flex-direction: column; flex-grow: 1;">
                  <el-button type="text" plain>Version</el-button>
                </div>
              </el-popover>
              <el-divider content-position="left">Node Details</el-divider>
              <div v-if="isStart" style="display: flex; flex-direction: column; flex-grow: 1;">
                <el-button :icon="editing.start ? 'el-icon-edit' : null" :type="editing.start ? 'primary' : 'text'" plain @click="editing.start = !editing.start; delay()">Start Title</el-button>
              </div>
              <div style="display: flex; flex-direction: column; flex-grow: 1;">
                <el-button :icon="editing.type ? 'el-icon-edit' : null" :type="editing.type ? 'primary' : 'text'" plain @click="editing.type = !editing.type; delay()">Type</el-button>
              </div>
              <div style="display: flex; flex-direction: column; flex-grow: 1;">
                <el-button :icon="editing.label ? 'el-icon-edit' : null" :type="editing.label ? 'primary' : 'text'" plain @click="editing.label = !editing.label; delay()">Label</el-button>
              </div>
              <div v-if="buttons.length" style="display: flex; flex-direction: column; flex-grow: 1;">
                <el-button :icon="editing.options.value ? 'el-icon-edit' : null" :type="editing.options.value ? 'primary' : 'text'" plain @click="editing.options.value = !editing.options.value; delay()">Options</el-button>
              </div>
              <el-divider content-position="left">Settings</el-divider>
              <div style="display: flex; flex-direction: column; flex-grow: 1;">
                <el-button :id="'config-button_' + id" type="text" plain @click="showingDrawer">Showing Configurations</el-button>
              </div>
              <div style="display: flex; flex-direction: column; flex-grow: 1;">
                <el-button icon="el-icon-delete" type="danger" @click="$emit('nodeDelete')">Delete this node</el-button>
              </div>
            </div>
            <el-button slot="reference" icon="el-icon-more" type="warning" size="mini" plain circle></el-button>
          </el-popover>
        </div>
      </div>
      <div class="node-label" :id="'label_' + id">
        <div ref="labelTitle" class="node-label-title" :id="'label-title_' + id">
          <el-input v-if="editing.label" type="textarea" :rows="3" :value="label" @input="$emit('update:label', $event)" />
          <span v-else>{{label}}</span>
        </div>
        <div v-if="buttons.length > 0" class="node-buttons" :id="'node-buttons_' + id">
          <div @mouseover="button.show = true" @mouseleave="button.show = false" v-for="(button, index) in styledButtons" :key="index" :id="'button_' + id + '_' + index" class="node-label-button">
            <div style="position: relative">
              <el-input v-if="editing.options.value" type="textarea" :rows="temp.buttonRows" :value="button.text" @input="$emit('updateButtonText', { text: $event, buttonId: button.id })" />
              <span v-else>{{button.text}}</span>
              <div style="top: -20px; right: -20px" v-show="editing.options.value && button.show" class="button-delete" @click="$emit('deleteButtonNode', button.id)">&times;</div>
            </div>
            <div class="node-port node-output" :id="'port_' + id + '_' + index" :class="{ 'node-port-start': isStart }" 
              :style="button.style"
              @mousedown="outputMouseDown"
              @mousemove="outputMouseMoveFromButtonNode(index)"
              @mouseup="outputMouseUp"
              @mouseleave="outputMouseUp"
            ></div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="buttons.length === 0" :id="'node-output_' + id" class="node-port node-output" :class="{ 'node-port-start': isStart, 'editing': options.selected === id && !options.moving }"
      @mousedown="outputMouseDown"
      @mousemove="outputMouseMove"
      @mouseleave="outputMouseUp"
      @mouseup="outputMouseUp">
    </div>
    <div
      v-if="options.selected === id && !options.moving"
      :id="'add-button_' + id"
      class="node-config-button"
      @click="addingButton"
    >
      <span>Add other options...</span>
    </div>
    <div v-show="show.delete" class="node-delete">&times;</div>
  </div>
</template>

<script>
import * as _ from 'lodash';
export default {
  name: 'FlowchartNode',
  props: {
    foundIsStart: {
      type: Boolean,
      default: false
    },
    showDrawer: {
      type: Object,
      default() {
        return {
          left: false,
          right: false,
        }
      },
      validator(val) {
        return typeof val === 'object'
      }
    },
    startNodeTitle: {
      type: String,
      default: 'Conversation Start',
      validator(val) {
        return typeof val === 'string'
      }
    },
    id: {
      type: Number,
      default: 1000,
      validator(val) {
        return typeof val === 'number'
      }
    },
    x: {
      type: Number,
      default: 0,
      validator(val) {
        return typeof val === 'number'
      }
    },    
    y: {
      type: Number,
      default: 0,
      validator(val) {
        return typeof val === 'number'
      }
    },
    centeredX: {
      type: Number,
      default: 0,
      validator(val) {
        return typeof val === 'number'
      }
    },    
    centeredY: {
      type: Number,
      default: 0,
      validator(val) {
        return typeof val === 'number'
      }
    },
    type: {
      type: String,
      default: 'Default'
    },
    label: {
      type: String,
      default: 'input name'
    },
    options: {
      type: Object,
      default() {
        return {
          centerX: 1024,
          scale: 1,
          centerY: 140,
        }
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
    }
  },
  data() {
    return {
      temp: {
        buttonRows: 2
      },
      styledButtons: [],
      show: {
        delete: false,
      },
      linkingStart: false,
      editing: {
        start: false,
        type: false,
        label: false,
        options: {
          value: false
          // buttons: this.buttons.map(() => false)
        },
        cache: false
      },
      nodeCategory:[
        'Rule',
        'Action',
        'Script',
        'Decision',
        'Fork',
        'Join',
      ]
    }
  },
  created() {
    this.refreshButtons();
  },
  mounted() {
    this.refreshButtons();
  },
  watch: {
    buttons: {
      handler:
        function(val) {
          this.refreshButtons();
          this.$emit('updateLines', { buttonHeight: this.getButtonHeight('new option'), buttonsLength: val.length });
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
    // eslint-disable-next-line
    isStart: function(val) {
      this.refreshAll();
    }
  },
  computed: {
    isEditing() {
      return this.editing.start || this.editing.type || this.editing.label || this.editing.options.value;
    },
    nodeStyle() {
      return {
        top: ((this.centeredY || this.y)  * this.options.scale) + 'px', // remove: this.options.offsetTop + 
        left: ((this.centeredX || this.x) * this.options.scale) + 'px', // remove: this.options.offsetLeft + 
        transform: `scale(${this.options.scale})`,
      }
    }
  },
  methods: {
    refreshAll() {
      this.$emit('updateLines', {});
      this.refreshButtons();
    },
    delay() {
      setTimeout(() => {
        this.editing.cache = !this.editing.cache;
      }, 1)
    },
    refreshButtons() {
      const buttons = _.cloneDeep(this.buttons);

      this.styledButtons = _.cloneDeep(buttons)

      // calculate height of each element
      const nodeTypeElement = this.$refs.nodeType;
      if (!nodeTypeElement) { return; }

      const labelTitleElement = this.$refs.labelTitle;
      if (!labelTitleElement) { return; }

      const nodeTypeHeight = nodeTypeElement.offsetHeight;
      const labelTitleHeight = labelTitleElement.offsetHeight;

      let buttonHeight = labelTitleHeight + nodeTypeHeight;

      // detect start node, if yes, add extra height
      let additionalHeight = 0;
      if(this.isStart) {
        const nodeStartTitleElement = document.getElementsByClassName('node-start')[0];
        additionalHeight += nodeStartTitleElement ? nodeStartTitleElement.offsetHeight : 0;
      }
      buttonHeight += additionalHeight;


      // calculate each port position
      for (let i = 0; i < buttons.length; i++) {
        const btnHeight = this.getButtonHeight(buttons[i].text)

        if(i === 0) {
          buttonHeight += btnHeight/2;
        } else {
          buttonHeight += (btnHeight/2) + (buttons[i-1].height/2)
        }

        // add button height as style to each button
        buttons[i].style = {
          top: buttonHeight + 'px',
          right: '-8px',
          marginTop: '0px'
        }
        buttons[i].height = btnHeight;
        buttons[i].show = false;
        // add styled buttons as variable
        this.styledButtons = _.cloneDeep(buttons);
      }
    },
    buttonPortStyle(index) {
      const nodeTypeElement = this.$refs.nodeType;
      if (!nodeTypeElement) { return; }

      const labelTitleElement = this.$refs.labelTitle;
      if (!labelTitleElement) { return; }

      const nodeTypeHeight = nodeTypeElement.offsetHeight;
      const labelTitleHeight = labelTitleElement.offsetHeight;

      let buttonHeight = labelTitleHeight + nodeTypeHeight;

      let element = null;
      for (let i = index; i >= 0; i--) {
        const elements = this.$refs['button_' + this.id + '_' + i]
        if(elements) {
          element = elements[0]
        }
        else {
          continue;
        }
        if(!element) { continue; }
        if(i === index) {
          buttonHeight += element.offsetHeight/1.75;
        } else {
          buttonHeight += element.offsetHeight;
        }
      }
      
      let additionalHeight = 0;
      if(this.isStart) {
        const nodeStartTitleElement = document.getElementsByClassName('node-start')[0];

        additionalHeight += nodeStartTitleElement ? nodeStartTitleElement.offsetHeight : 0;
      }
      buttonHeight += additionalHeight;

      return {
        top: buttonHeight + 'px',
        right: '-8px',
        marginTop: '0px'
      }
    },
    handleMousedown(e) {
      const target = e.target || e.srcElement;
      if (target.className.indexOf('node-input') < 0 && target.className.indexOf('node-output') < 0) {
        this.$emit('nodeSelected', e);
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
        const fakeBtn = document.createElement('div');
        fakeBtn.style = "padding: 10px; width: 224px; border-radius: 4px; line-height: 1.35;"
        // fakeBtn.style.visibility = 'hidden';
        if (this.editing.options.value) {
          const textarea = document.createElement('textarea');
          textarea.className = "el-textarea__inner";
          textarea.style = "min-height: 33px";
          textarea.rows = this.temp.buttonRows;
          fakeBtn.appendChild(textarea);
        } else {
          const text = document.createElement('span');
          text.style="font-size: 14px; text-align: center; font-weight: 600;";
          text.innerHTML = btnText;
          fakeBtn.appendChild(text);
        }
        document.getElementById('app').appendChild(fakeBtn);
        const height = fakeBtn.offsetHeight;
        document.getElementById('app').removeChild(fakeBtn);
        return height;
    },
    outputMouseDown(e) {
      this.linkingStart = true;
      e.preventDefault();
    },
    // eslint-disable-next-line
    outputMouseMove(e) {
      if(this.linkingStart) {
        this.$emit('linkingStart')
      }
    },
    outputMouseMoveFromButtonNode(buttonIndex) {
      if(this.linkingStart) {
        this.$emit('linkingStart', buttonIndex)
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
      this.$emit('linkingStop')
      e.preventDefault();
    },
    addingButton(e) {
      const maxButtonID = Math.max(0, ...this.buttons.map((button) => button.id));

      this.$emit('addingButtons', {
        id: maxButtonID + 1,
        text: 'new option',
      })

      this.refreshButtons();
      e.preventDefault();
    },
    showingDrawer(e) {
      this.showDrawer.left = true;
      this.showDrawer.right = true;
      e.preventDefault();
    },
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
$themeColor: rgb(255, 136, 85);
$portSize: 16;

.flowchart-node {
  margin: 0;
  width: 250px;
  position: absolute;
  box-sizing: border-box;
  border: none;
  opacity: .9;
  cursor: move;
  transform-origin: top left;
  z-index: 1;
  .node-main {
    text-align: center;
    .node-start{
      margin: 0 auto;
      background: #e4392b;
      padding: 6px;
      width: 200px;
      border-radius: 4px;
      position: relative;
      span{
        color: #FFF;
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
      background: #FFF;
      border: 2px solid #e0e6ed;

      .node-label-title{
        border-radius: 4px;
        background: #FFF;
        padding: 16px;
      }
      .node-label-button{
        border: 1px solid #dfdfdf;
        border-radius: 4px;
        background: #EFEFEF;
        color: #0084ff;
        padding: 10px;
        font-weight: 600;
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
    &.node-port-start {
      margin-top: 17px;
      top: 50%;
      transform: translateY(-50%);
    }
    &.editing {
      margin-top: -22px;
    }
    &.editing-start {
      margin-top: -5px;
    }
  }
  .node-input {
    left: #{-2+$portSize/-3}px;
  }
  .node-output {
    right: #{-2+$portSize/-3}px;
  }
  .node-delete, .button-delete{
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
    &:hover{
      background: $themeColor;
      color: white;
    }
  }
  .node-config-button{
    border: 1px solid #dfdfdf;
    border-radius: 4px;
    color: #EFEFEF;
    background: #0084ff;
    padding: 10px;
    font-weight: 600;
    &:hover {
      color: #EFEFEF;
      background: #0084ffb9;
      cursor: pointer
    }
  }
}
.selected {
  box-shadow: 0 0 0 2px $themeColor;
}
</style>
