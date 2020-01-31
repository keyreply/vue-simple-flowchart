<template>
  <div id="app">
    <div id="title">
      <h1>KeyReply Flowchart Editor Lab</h1>
      <div class="tool-wrapper">
        <el-select v-model="newNodeType">
          <el-option v-for="(item, index) in nodeCategory" :key="index" :value="index">{{item}}</el-option>
        </el-select>
        <el-input style="width: 300px" type="text" v-model="newNodeLabel" placeholder="Input node label" />
        <el-button type="primary" @click="addNode">ADD</el-button>
      </div>
      <el-button type="primary" @click="isPanelShow = !isPanelShow">{{!isPanelShow ? 'Show Panel' : 'Hide Panel'}}</el-button>
      <el-button v-if="isPanelShow" @click="isRawScene = !isRawScene">{{!isRawScene ? 'Show Raw' : 'Show Pretty'}}</el-button>
      <div v-if="isPanelShow" class="panel-area">
        <el-card v-html="isRawScene ? rawScene : prettyScene" class="extraction-panel" />
      </div>
    </div>
    
    <simple-flowchart
      :scene.sync="scene"
      :showDrawer.sync="showDrawer"
      @nodeClick="nodeClick"
      @nodeDelete="nodeDelete"
      @linkBreak="linkBreak"
      @linkAdded="linkAdded"
      @buttonAdded="buttonAdded"
      @canvasClick="canvasClick"
      @onDropNewNode="onCreateNode"
      :height="800"/>
    
    <el-drawer
      title="I am LEFT"
      :visible.sync="showDrawer.left"
      direction="ltr"
      :before-close="closingDrawer"
      size="30%"
    >
      <span>Hi, there!</span>
    </el-drawer>
    <el-drawer
      title="I am RIGHT"
      :visible.sync="showDrawer.right"
      direction="rtl"
      :before-close="closingDrawer"
      size="70%"
    >
      <span>Hi, there!</span>
    </el-drawer>
  </div>
</template>

<script>
/* eslint-disable */
import SimpleFlowchart from './components/SimpleFlowchart.vue'

export default {
  name: 'app',
  components: {
    SimpleFlowchart
  },
  data() {
    return {
      isRawScene: false,
      isPanelShow: false,
      showDrawer: {
        left: false,
        right: false,
      },
      scene: {
        startNodeTitle: 'Conversation Start',
        centerX: 0,
        centerY: 0,
        scale: 1,
        nodes: [
          {
            id: 1,
            x: 10,
            y: 10,
            type: 'Action',
            label: 'Hello, This is KR dev bot! How can I help you?',
            isStart: true,
            buttons: [{
              id: 1,
              text: 'Option 1'
            }, {
              id: 2,
              text: 'Option 2'
            }, {
              id: 3,
              text: 'Option 3'
            }]
          },
          {
            id: 2,
            x: 300,
            y: 100,
            type: 'Script',
            label: 'Do you have any symptoms described below such as cough, fever, etc?',
            buttons: [{
              id: 1,
              text: 'Yes'
            }, {
              id: 2,
              text: 'No'
            }, {
              id: 3,
              text: "I don't know what to say but this sentence just to long I can't handle it"
            }]
          },
          {
            id: 3,
            x: 600,
            y: 100,
            type: 'Rule',
            label: 'test3',
            buttons: []
          },
          {
            id: 4,
            x: 900,
            y: 400,
            type: 'Rule',
            label: 'test4',
            buttons: []
          }
        ],
        links: [
          {
            id: 5,
            from: 1, // node id the link start
            button: 2,
            to: 2,  // node id the link end
          },
          {
            id: 6,
            from: 2, // node id the link start
            button: 1,
            to: 3,  // node id the link end
          },
          {
            id: 7,
            from: 2, // node id the link start
            button: 2,
            to: 3,  // node id the link end
          },
          {
            id: 8,
            from: 3, // node id the link start
            button: undefined,
            to: 4,  // node id the link end
          },
          {
            id: 9,
            from: 4, // node id the link start
            button: undefined,
            to: 1,  // node id the link end
          },
        ]
      },
      newNodeType: 0,
      newNodeLabel: '',
      nodeCategory:[
        'rule',
        'action',
        'script',
        'decision',
        'fork',
        'join',
      ],
    }
  },
  computed: {
    prettyScene() {
      return JSON.stringify(this.scene, null, '\t').replace(/\n/gi, '<br />').replace(/\t/gi, '&nbsp;&nbsp;')
    },
    rawScene() {
      return JSON.stringify(this.scene);
    }
  },
  methods: {
    canvasClick(e) {
      console.log('canvas Click, event:', e)
    },
    addNode() {
      let maxID = Math.max(0, ...this.scene.nodes.map((link) => {
        return link.id
      }))
      this.scene.nodes.push({
        id: maxID + 1,
        x: 0,
        y: 50,
        type: this.nodeCategory[this.newNodeType],
        label: this.newNodeLabel ? this.newNodeLabel: `test${maxID + 1}`,
      })
    },
    onCreateNode({x, y, nodeType, label}) {

      let maxID = Math.max(0, ...this.scene.nodes.map((link) => {
        return link.id
      }))
      this.scene.nodes.push({
        id: maxID + 1,
        x: x,
        y,
        type: nodeType,
        label: label,
      })
    },
    nodeClick(id) {
      console.log('node click', id);
    },
    nodeDelete(id) {
      console.log('node delete', id);
    },
    linkBreak(id) {
      console.log('link break', id);
    },
    linkAdded(link) {
      console.log('new link added:', link);
    },
    buttonAdded(button) {
      console.log('new button added:', button);
    },
    closingDrawer(done) {
      done();
      // this.$confirm('Are you sure you want to close this?')
      //   .then(_ => {
      //     done();
      //   })
      //   .catch(_ => {});
    },
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0;
  overflow: hidden;
  height: 1280px;
  .tool-wrapper {
    position: relative;
  }
  .panel-area {
    margin-top: 15px;
    margin-bottom: 15px;
    display: flex;
    flex-grow: 1;
    justify-content: center; 
  }
  .extraction-panel {
    text-align: left;
    width: 60%;
    max-height: 300px;
    // border-width: 3px;
    // border-style: solid;
    padding: 10px;
    // border-color: grey;
    // border-radius: 10px;
    overflow: scroll;
  }
}
</style>
