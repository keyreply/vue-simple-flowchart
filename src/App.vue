<template>
  <div id="app">
    <div id="title">
      <div id="notification">
        <el-alert
          style="margin-top: 10px;"
          center
          show-icon
          v-for="(notification, index) in notifications"
          v-show="notification.status"
          :key="index"
          :title="notification.title"
          :type="notification.type"
          :closable="!notification.auto"
          @close="clearNotification(notification.id)"
        >
        </el-alert>
      </div>
      <h1>KeyReply Flowchart Editor Lab</h1>
      <div class="tool-wrapper">
        <el-select v-model="newNodeType">
          <el-option v-for="(item, index) in nodeCategory" :key="index" :value="index">{{item}}</el-option>
        </el-select>
        <el-input style="width: 300px" type="text" v-model="newNodeLabel" placeholder="Input node label" />
        <el-button type="primary" @click="addNode">ADD</el-button>
      </div>
      <div style="margin: 10px">
        <el-button type="primary" @click="isPanelShow = !isPanelShow">{{!isPanelShow ? 'Show Panel' : 'Hide Panel'}}</el-button>
        <el-button v-if="isPanelShow" @click="isRawScene = !isRawScene">{{!isRawScene ? 'Show Raw' : 'Show Pretty'}}</el-button>
      </div>
      <div style="margin: 10px">
        <el-button type="danger" @click="isErrorShow = !isErrorShow">{{!isErrorShow ? 'Show Error Logs' : 'Hide Error Logs'}}</el-button>
        <el-button v-if="isErrorShow" @click="isRawError = !isRawError">{{!isRawError ? 'Show Raw' : 'Show Pretty'}}</el-button>
      </div>
      <h3 v-if="isPanelShow">Scene</h3>
      <div v-if="isPanelShow" class="panel-area">
        <el-card v-html="isRawScene ? rawScene : prettyScene" class="extraction-panel" />
      </div>
      <h3 v-if="isErrorShow">Error Logs ({{errors.length}})</h3>
      <div v-if="isErrorShow" class="panel-area">
        <el-card v-html="isRawError ? rawErrors : prettyErrors" class="extraction-panel" />
      </div>
      <div class="tool-wrapper">
        <el-input-number v-model="scene.scale" :step="0.1" :precision="1" />
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
      @buttonUpdated="buttonUpdated"
      @buttonDeleted="buttonDeleted"
      @canvasClick="canvasClick"
      @onDropNewNode="onCreateNode"
      @notification="notificationUp($event.title, $event.type, $event.auto)"
      @addErrors="addErrors($event)"
      :height="800"
    />
    
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
import TempJSON from './temp.json'

export default {
  name: 'app',
  components: {
    SimpleFlowchart
  },
  data() {
    return {
      notifications: [],
      errors: [],
      isRawScene: false,
      isPanelShow: false,
      isRawError: false,
      isErrorShow: false,
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
            isStart: false,
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
            isStart: false,
            buttons: []
          },
          {
            id: 4,
            x: 900,
            y: 400,
            type: 'Rule',
            label: 'test4',
            isStart: false,
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
            to: 4,  // node id the link end
          },
        ]
      },
      newNodeType: 0,
      newNodeLabel: '',
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
  computed: {
    prettyScene() {
      return JSON.stringify(this.scene, null, '\t').replace(/\n/gi, '<br />').replace(/\t/gi, '&nbsp;&nbsp;')
    },
    rawScene() {
      return JSON.stringify(this.scene);
    },
    prettyErrors() {
      return JSON.stringify(this.errors, null, '\t').replace(/\n/gi, '<br />').replace(/\t/gi, '&nbsp;&nbsp;')
    },
    rawErrors() {
      return JSON.stringify(this.errors);
    }
  },
  mounted() {
    const temp = {
      "nodes": [
        {
          "id": "before_livechat_resolve_fallback",
          "x": 200,
          "y": 100,
          "label": "before_livechat_resolve_fallback\nWe have not received a response from you. The system will end the live chat session now.",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "conversation_resume_livechat",
          "x": 200,
          "y": 350,
          "label": "conversation_resume_livechat\nWelcome back! You are currently in a livechat session. You may continue to chat with our customer support officer. ",
          "isStart": false,
          "type": "Action",
          "buttons": [
            {
              "id": 1,
              "text": "End livechat"
            }
          ]
        },
        {
          "id": "conversation_resume_normal",
          "x": 200,
          "y": 600,
          "label": "conversation_resume_normal\nWelcome back! What can I help you with today?",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "conversation_start",
          "x": 200,
          "y": 850,
          "label": "conversation_start\nHi this is kr dev bot",
          "isStart": true,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "core_bot_rating",
          "x": 200,
          "y": 1100,
          "label": "core_bot_rating\nHow would you rate this experience?",
          "isStart": false,
          "type": "Action",
          "buttons": [
            {
              "id": 1,
              "text": "⭐⭐⭐⭐⭐"
            },
            {
              "id": 2,
              "text": "⭐⭐⭐⭐"
            },
            {
              "id": 3,
              "text": "⭐⭐⭐"
            },
            {
              "id": 4,
              "text": "⭐⭐"
            },
            {
              "id": 5,
              "text": "⭐"
            }
          ]
        },
        {
          "id": "core_bot_rating_comments",
          "x": 200,
          "y": 1590,
          "label": "core_bot_rating_comments\nOh no, we are sorry to hear that! 😧 How can i improve?",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "core_bot_rating_only_one",
          "x": 200,
          "y": 1840,
          "label": "core_bot_rating_only_one\nOnly your first rating will be taken in consideration, thank you.",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "core_bot_rating_thank",
          "x": 200,
          "y": 2090,
          "label": "core_bot_rating_thank\nThanks for your feedback, I look forward to serving you again should you have any questions. Come back soon!",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "fallback_too_complex",
          "x": 200,
          "y": 2340,
          "label": "fallback_too_complex\nCould you please ask again, a little simpler? I'm still learning, but I really want to help 😌,I can only understand a question at a time 😊 Could you please ask that again, a bit simpler?,Please ask that again in a simpler way, so I can find something more useful for you 😄",
          "isStart": false,
          "type": "Action",
          "buttons": [
            {
              "id": 1,
              "text": "Get human help"
            }
          ]
        },
        {
          "id": "fallback_too_complex_simplify",
          "x": 200,
          "y": 2590,
          "label": "fallback_too_complex_simplify\nCould you please ask again, a little simpler? I'm still learning, but I really want to help 😌,I can only understand a question at a time 😊 Could you please ask that again, a bit simpler?,Please ask that again in a simpler way, so I can find something more useful for you 😄",
          "isStart": false,
          "type": "Action",
          "buttons": [
            {
              "id": 1,
              "text": "Get human help"
            }
          ]
        },
        {
          "id": "fallback_too_short",
          "x": 200,
          "y": 2840,
          "label": "fallback_too_short\nWould you mind asking that again with a bit more detail? 😀,Please tell me a bit more so I can help you better 😊,Say a few more words about what you're looking for, so I can find something more useful for you 😄",
          "isStart": false,
          "type": "Action",
          "buttons": [
            {
              "id": 1,
              "text": "Get human help"
            }
          ]
        },
        {
          "id": "faq_has_more_questions",
          "x": 700,
          "y": 250,
          "label": "faq_has_more_questions\nIs there anything else I can help you with?",
          "isStart": false,
          "type": "Action",
          "buttons": [
            {
              "id": 1,
              "text": "Yes"
            },
            {
              "id": 2,
              "text": "No"
            }
          ]
        },
        {
          "id": "faq_has_more_questions_reject",
          "x": 700,
          "y": 560,
          "label": "faq_has_more_questions_reject\nAre you sure? 😏 Give you one more chance,Hmm 😏 Want to try again?",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "faq_have_a_question",
          "x": 700,
          "y": 810,
          "label": "faq_have_a_question\nGo ahead. What would you like to ask?",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "faq_prediction_feedback",
          "x": 700,
          "y": 1060,
          "label": "faq_prediction_feedback\nIs this information helpful?",
          "isStart": false,
          "type": "Action",
          "buttons": [
            {
              "id": 1,
              "text": "Yes"
            },
            {
              "id": 2,
              "text": "No"
            }
          ]
        },
        {
          "id": "faq_prediction_feedback_reject",
          "x": 700,
          "y": 1370,
          "label": "faq_prediction_feedback_reject\nAre you sure? 😏 Give you one more chance,Hmm 😏 Want to try again?",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "faq_thank_user_for_feedback",
          "x": 700,
          "y": 1620,
          "label": "faq_thank_user_for_feedback\nThanks for helping me learn! Please ask your next question.,Got it. I feel smarter already. Next question?",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "faq_thank_user_for_feedback_correct",
          "x": 700,
          "y": 1870,
          "label": "faq_thank_user_for_feedback_correct\nThanks for helping me learn! Please ask your next question.,Got it. I feel smarter already.",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "faq_thank_user_for_feedback_wrong",
          "x": 700,
          "y": 2120,
          "label": "faq_thank_user_for_feedback_wrong\nThanks for helping me learn! Please ask your next question.,Got it. I feel smarter already. Next question?",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "forward_session_history",
          "x": 700,
          "y": 2370,
          "label": "forward_session_history\nThanks, our support team will be in touch with you soon!",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "handover_ameyo_wait",
          "x": 700,
          "y": 2620,
          "label": "handover_ameyo_wait\nPlease hold on, our ameyo support staff will be right with you",
          "isStart": false,
          "type": "Action",
          "buttons": [
            {
              "id": 1,
              "text": "End livechat"
            }
          ]
        },
        {
          "id": "handover_ask_email",
          "x": 1200,
          "y": 250,
          "label": "handover_ask_email\nWhat is your email address?",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "handover_ask_email_reject",
          "x": 1200,
          "y": 500,
          "label": "handover_ask_email_reject\nAre you sure? 😏 Give you one more chance,Hmm 😏 Want to try again?",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "handover_ask_message",
          "x": 1200,
          "y": 750,
          "label": "handover_ask_message\nGot it, we will reply to this email address then. Feel free to add more comments to your message and hit Submit when you're done!",
          "isStart": false,
          "type": "Action",
          "buttons": [
            {
              "id": 1,
              "text": "Change Email"
            },
            {
              "id": 2,
              "text": "Submit"
            }
          ]
        },
        {
          "id": "handover_call",
          "x": 1200,
          "y": 1060,
          "label": "handover_call\nCALL:\n+65 <Insert support hotline here> \n\nMonday – Friday:\n9.30am – 5.30pm\n(Excluding public holidays)\n\n\nEMAIL:\nSend us an enquiry\n\nWe will send you a response within 24 hours\n",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "handover_end_thank",
          "x": 1200,
          "y": 1370,
          "label": "handover_end_thank\nThanks for talking to our support team! You may continue chatting with me if you wish. 😊",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "handover_escalation_ask_email",
          "x": 1200,
          "y": 1620,
          "label": "handover_escalation_ask_email\nWhat is your email?",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "handover_escalation_ask_email_reject",
          "x": 1200,
          "y": 1870,
          "label": "handover_escalation_ask_email_reject\nAre you sure? 😏 Give you one more chance,Hmm 😏 Want to try again?",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "handover_escalation_ask_name",
          "x": 1200,
          "y": 2120,
          "label": "handover_escalation_ask_name\nWhat is your name?",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "handover_escalation_ask_name_reject",
          "x": 1200,
          "y": 2370,
          "label": "handover_escalation_ask_name_reject\nAre you sure? 😏 Give you one more chance,Hmm 😏 Want to try again?",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "handover_escalation_ask_phonenumber",
          "x": 1200,
          "y": 2620,
          "label": "handover_escalation_ask_phonenumber\nWhat is your phone number?",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "handover_escalation_ask_phonenumber_reject",
          "x": 1700,
          "y": 250,
          "label": "handover_escalation_ask_phonenumber_reject\nAre you sure? 😏 Give you one more chance,Hmm 😏 Want to try again?",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "handover_escalation_confirmation",
          "x": 1700,
          "y": 500,
          "label": "handover_escalation_confirmation\nThanks for providing your details! Please click the button below to connect to a customer service representative!",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "handover_fbinbox_start",
          "x": 1700,
          "y": 750,
          "label": "handover_fbinbox_start\nI have connected you to our agent. Go ahead and ask your question!",
          "isStart": false,
          "type": "Action",
          "buttons": [
            {
              "id": 1,
              "text": "End chat"
            }
          ]
        },
        {
          "id": "handover_livechat_agent_end",
          "x": 1700,
          "y": 1000,
          "label": "handover_livechat_agent_end\nAgent ended livechat",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "handover_livechat_agent_unavailable",
          "x": 1700,
          "y": 1250,
          "label": "handover_livechat_agent_unavailable\nOur agents are busy serving other customers and will not be able to attend to you at the moment. Do you want to try getting in touch with us using the following options?",
          "isStart": false,
          "type": "Action",
          "buttons": [
            {
              "id": 1,
              "text": "Leave email"
            },
            {
              "id": 2,
              "text": "Call someone"
            },
            {
              "id": 3,
              "text": "Back to menu"
            }
          ]
        },
        {
          "id": "handover_livechat_offline",
          "x": 1700,
          "y": 1620,
          "label": "handover_livechat_offline\nOur agents are currently not available. Do you want to try the following options?",
          "isStart": false,
          "type": "Action",
          "buttons": [
            {
              "id": 1,
              "text": "Leave email"
            },
            {
              "id": 2,
              "text": "Call someone"
            },
            {
              "id": 3,
              "text": "Back to menu"
            }
          ]
        },
        {
          "id": "handover_livechat_online",
          "x": 1700,
          "y": 1990,
          "label": "handover_livechat_online\nPlease wait while we connect you to an agent. Queue number: ${queueCount}. Estimated waiting time: ${estimatedWaitTime} minutes",
          "isStart": false,
          "type": "Action",
          "buttons": [
            {
              "id": 1,
              "text": "Start chat"
            },
            {
              "id": 2,
              "text": "End chat"
            }
          ]
        },
        {
          "id": "handover_livechat_online_suggest_email",
          "x": 1700,
          "y": 2300,
          "label": "handover_livechat_online_suggest_email\nPlease wait while we connect you to an agent. Queue number: ${queueCount}. Estimated waiting time: ${estimatedWaitTime} minutes. If you would rather not wait, consider emailing us instead.",
          "isStart": false,
          "type": "Action",
          "buttons": [
            {
              "id": 1,
              "text": "Start chat"
            },
            {
              "id": 2,
              "text": "End chat"
            },
            {
              "id": 3,
              "text": "Leave email"
            }
          ]
        },
        {
          "id": "handover_livechat_wait",
          "x": 1700,
          "y": 2670,
          "label": "handover_livechat_wait\nPlease hold on, our support staff will be right with you",
          "isStart": false,
          "type": "Action",
          "buttons": [
            {
              "id": 1,
              "text": "End livechat"
            }
          ]
        },
        {
          "id": "handover_livechat_workinghours",
          "x": 1700,
          "y": 2920,
          "label": "handover_livechat_workinghours\nIt is after office hours and our customer support officers are taking a break! Do you want to try the following options?",
          "isStart": false,
          "type": "Action",
          "buttons": [
            {
              "id": 1,
              "text": "Leave email"
            },
            {
              "id": 2,
              "text": "Call someone"
            },
            {
              "id": 3,
              "text": "Back to menu"
            }
          ]
        },
        {
          "id": "handover_long_wait",
          "x": 2200,
          "y": 370,
          "label": "handover_long_wait\nSorry for the long wait! Our customer support officers are currently very busy. Let me know if you would prefer us to email you instead!",
          "isStart": false,
          "type": "Action",
          "buttons": [
            {
              "id": 1,
              "text": "Send email instead"
            },
            {
              "id": 2,
              "text": "Continue waiting"
            }
          ]
        },
        {
          "id": "handover_start",
          "x": 2200,
          "y": 680,
          "label": "handover_start\nLooks like you need further assistance. I will forward your question to the support team, if that's okay?",
          "isStart": false,
          "type": "Action",
          "buttons": [
            {
              "id": 2,
              "text": "Cancel"
            },
            {
              "id": 3,
              "text": "Call someone"
            }
          ]
        },
        {
          "id": "handover_stop",
          "x": 2200,
          "y": 1050,
          "label": "handover_stop\nThanks for talking to our support team! You may continue chatting with me if you wish. 😊",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "handover_stop_talking",
          "x": 2200,
          "y": 1300,
          "label": "handover_stop_talking\nYou have just ended a chat session with our Agent, if you would like to speak to us again, please come back in a while.",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "handover_talk_to_agent",
          "x": 2200,
          "y": 1550,
          "label": "handover_talk_to_agent\nLooks like you need further assistance. I will forward your question to the support team, if that's okay?",
          "isStart": false,
          "type": "Action",
          "buttons": [
            {
              "id": 1,
              "text": "Okay"
            },
            {
              "id": 2,
              "text": "Cancel"
            },
            {
              "id": 3,
              "text": "Call someone"
            }
          ]
        },
        {
          "id": "handover_whatsapp_notification",
          "x": 2200,
          "y": 1920,
          "label": "handover_whatsapp_notification\nA user has joined the queue!",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "help",
          "x": 2200,
          "y": 2170,
          "label": "help\nYou can type \"menu\" to go back to the main menu, or find menu options at the bottom left of your screen.\n\nTo search for specific content, you can click on \"Ask a Question\" or simply type your question.\n\nYou can edit your preferences by typing \"preferences\".\n\nTo talk to us, type \"feedback\".",
          "isStart": false,
          "type": "Action",
          "buttons": [
            {
              "id": 1,
              "text": "Menu"
            }
          ]
        },
        {
          "id": "inactive_agent_fallback",
          "x": 2200,
          "y": 2420,
          "label": "inactive_agent_fallback\nWe are experiencing a high volume. Please be patient and I will attend to you as soon as I am available. Thank you!",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "inactive_fallback",
          "x": 2200,
          "y": 2670,
          "label": "inactive_fallback\nI have not received a response from you. You can go back to the menu if you wish to!",
          "isStart": false,
          "type": "Action",
          "buttons": [
            {
              "id": 1,
              "text": "Menu"
            }
          ]
        },
        {
          "id": "search_before",
          "x": 2200,
          "y": 2920,
          "label": "search_before\nYou may find these useful:,I thought these might help:,I found these for you:,Would these be what you're looking for?,Take a look at these:,Let's see if these answer your questions:,Are these what you are looking for?,Try these links:,Maybe these will answer your questions:",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "sms_ask",
          "x": 2700,
          "y": 250,
          "label": "sms_ask\nYou will need to be verified first before you can continue. What is your phone number?",
          "isStart": false,
          "type": "Action",
          "buttons": [
            {
              "id": 1,
              "text": "Nevermind"
            }
          ]
        },
        {
          "id": "sms_exit",
          "x": 2700,
          "y": 500,
          "label": "sms_exit\nAlright",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "sms_invalid_phone",
          "x": 2700,
          "y": 750,
          "label": "sms_invalid_phone\nSorry, you have entered an invalid number. Please make sure that it is a Singapore number.",
          "isStart": false,
          "type": "Action",
          "buttons": [
            {
              "id": 1,
              "text": "Nevermind"
            }
          ]
        },
        {
          "id": "sms_invalid_verification",
          "x": 2700,
          "y": 1000,
          "label": "sms_invalid_verification\nSorry, you have entered an invalid verification code. Please type it in again.",
          "isStart": false,
          "type": "Action",
          "buttons": [
            {
              "id": 1,
              "text": "Nevermind"
            }
          ]
        },
        {
          "id": "sms_verified",
          "x": 2700,
          "y": 1250,
          "label": "sms_verified\nYou have been verified! We're connecting you to our agent now.",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "sms_verify",
          "x": 2700,
          "y": 1500,
          "label": "sms_verify\nA verification code has been sent to your number. Enter the code you have received below.",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "subscribe_choices",
          "x": 2700,
          "y": 1750,
          "label": "subscribe_choices\nHow often would you like me to send you updates?",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "subscribe_status_false",
          "x": 2700,
          "y": 2120,
          "label": "subscribe_status_false\nYou are currently not subscribed to the latest content.\nWould you like to subscribe now? ",
          "isStart": false,
          "type": "Action",
          "buttons": [
            {
              "id": 1,
              "text": "Subscribe"
            },
            {
              "id": 2,
              "text": "Back to Menu"
            }
          ]
        },
        {
          "id": "subscribe_status_true",
          "x": 2700,
          "y": 2430,
          "label": "subscribe_status_true\nYou are getting the latest content ${frequency_text} at 1pm.",
          "isStart": false,
          "type": "Action",
          "buttons": [
            {
              "id": 1,
              "text": "Change frequency"
            },
            {
              "id": 3,
              "text": "Menu"
            }
          ]
        },
        {
          "id": "subscription_onboarding",
          "x": 2700,
          "y": 2800,
          "label": "subscription_onboarding\nWould you like me to keep you updated on our latest news?",
          "isStart": false,
          "type": "Action",
          "buttons": [
            {
              "id": 1,
              "text": "Yes"
            },
            {
              "id": 2,
              "text": "No"
            }
          ]
        },
        {
          "id": "subscription_reject",
          "x": 3200,
          "y": 310,
          "label": "subscription_reject\nNo worries, you can subscribe anytime on the menu or just type \"subscribe!\"",
          "isStart": false,
          "type": "Action",
          "buttons": []
        },
        {
          "id": "subscription_subscribe_success",
          "x": 3200,
          "y": 560,
          "label": "subscription_subscribe_success\nYou will get the latest content ${frequency_text} at 1pm.",
          "isStart": false,
          "type": "Action",
          "buttons": [
            {
              "id": 1,
              "text": "Change frequency"
            },
            {
              "id": 3,
              "text": "Menu"
            }
          ]
        },
        {
          "id": "subscription_unsubscribe_success",
          "x": 3200,
          "y": 930,
          "label": "subscription_unsubscribe_success\nYou are now unsubscribed from the latest content.",
          "isStart": false,
          "type": "Action",
          "buttons": [
            {
              "id": 1,
              "text": "Subscribe"
            },
            {
              "id": 2,
              "text": "Back to Menu"
            }
          ]
        },
        {
          "id": "subscriptions",
          "x": 3200,
          "y": 1240,
          "label": "subscriptions\nWhen would you like to receive new content?",
          "isStart": false,
          "type": "Action",
          "buttons": [
            {
              "id": 1,
              "text": "Change frequency"
            }
          ]
        },
        {
          "id": "withdraw_ask",
          "x": 3200,
          "y": 1550,
          "label": "withdraw_ask\nAre you sure you want to withdraw?",
          "isStart": false,
          "type": "Action",
          "buttons": []
        }
      ],
        "links": [
          {
            "id": 1,
            "from": "conversation_resume_livechat",
            "to": "handover_stop",
            "button": 1
          },
          {
            "id": 2,
            "from": "core_bot_rating",
            "to": "core_set_bot_rating",
            "button": 1
          },
          {
            "id": 3,
            "from": "core_bot_rating",
            "to": "core_set_bot_rating",
            "button": 2
          },
          {
            "id": 4,
            "from": "core_bot_rating",
            "to": "core_set_bot_rating",
            "button": 3
          },
          {
            "id": 5,
            "from": "core_bot_rating",
            "to": "core_set_bot_rating",
            "button": 4
          },
          {
            "id": 6,
            "from": "core_bot_rating",
            "to": "core_set_bot_rating",
            "button": 5
          },
          {
            "id": 7,
            "from": "fallback_too_complex",
            "to": "goto",
            "button": 1
          },
          {
            "id": 8,
            "from": "fallback_too_complex_simplify",
            "to": "goto",
            "button": 1
          },
          {
            "id": 9,
            "from": "fallback_too_short",
            "to": "goto",
            "button": 1
          },
          {
            "id": 10,
            "from": "faq_has_more_questions",
            "to": "faq_has_more_questions_success",
            "button": 1
          },
          {
            "id": 11,
            "from": "faq_has_more_questions",
            "to": "faq_has_more_questions_reject",
            "button": 2
          },
          {
            "id": 12,
            "from": "faq_prediction_feedback",
            "to": "faq_prediction_feedback_success",
            "button": 1
          },
          {
            "id": 13,
            "from": "faq_prediction_feedback",
            "to": "faq_prediction_feedback_reject",
            "button": 2
          },
          {
            "id": 14,
            "from": "handover_ameyo_wait",
            "to": "handover_stop",
            "button": 1
          },
          {
            "id": 15,
            "from": "handover_ask_message",
            "to": "handover_ask_email",
            "button": 1
          },
          {
            "id": 16,
            "from": "handover_ask_message",
            "to": "forward_session_history",
            "button": 2
          },
          {
            "id": 17,
            "from": "handover_fbinbox_start",
            "to": "handover_stop",
            "button": 1
          },
          {
            "id": 18,
            "from": "handover_livechat_agent_unavailable",
            "to": "handover_ask_email",
            "button": 1
          },
          {
            "id": 19,
            "from": "handover_livechat_agent_unavailable",
            "to": "handover_call",
            "button": 2
          },
          {
            "id": 20,
            "from": "handover_livechat_agent_unavailable",
            "to": "menu",
            "button": 3
          },
          {
            "id": 21,
            "from": "handover_livechat_offline",
            "to": "handover_ask_email",
            "button": 1
          },
          {
            "id": 22,
            "from": "handover_livechat_offline",
            "to": "handover_call",
            "button": 2
          },
          {
            "id": 23,
            "from": "handover_livechat_offline",
            "to": "menu",
            "button": 3
          },
          {
            "id": 24,
            "from": "handover_livechat_online",
            "to": "handover_livechat_start",
            "button": 1
          },
          {
            "id": 25,
            "from": "handover_livechat_online",
            "to": "handover_stop",
            "button": 2
          },
          {
            "id": 26,
            "from": "handover_livechat_online_suggest_email",
            "to": "handover_livechat_start",
            "button": 1
          },
          {
            "id": 27,
            "from": "handover_livechat_online_suggest_email",
            "to": "handover_stop",
            "button": 2
          },
          {
            "id": 28,
            "from": "handover_livechat_online_suggest_email",
            "to": "handover_ask_email",
            "button": 3
          },
          {
            "id": 29,
            "from": "handover_livechat_wait",
            "to": "handover_stop",
            "button": 1
          },
          {
            "id": 30,
            "from": "handover_livechat_workinghours",
            "to": "handover_ask_email",
            "button": 1
          },
          {
            "id": 31,
            "from": "handover_livechat_workinghours",
            "to": "handover_call",
            "button": 2
          },
          {
            "id": 32,
            "from": "handover_livechat_workinghours",
            "to": "menu",
            "button": 3
          },
          {
            "id": 33,
            "from": "handover_long_wait",
            "to": "handover_long_wait_transfer",
            "button": 1
          },
          {
            "id": 34,
            "from": "handover_long_wait",
            "to": "handover_livechat_wait",
            "button": 2
          },
          {
            "id": 35,
            "from": "handover_start",
            "to": "help",
            "button": 2
          },
          {
            "id": 36,
            "from": "handover_start",
            "to": "handover_call",
            "button": 3
          },
          {
            "id": 37,
            "from": "handover_talk_to_agent",
            "to": "handover_ask_email",
            "button": 1
          },
          {
            "id": 38,
            "from": "handover_talk_to_agent",
            "to": "help",
            "button": 2
          },
          {
            "id": 39,
            "from": "handover_talk_to_agent",
            "to": "handover_call",
            "button": 3
          },
          {
            "id": 40,
            "from": "help",
            "to": "menu",
            "button": 1
          },
          {
            "id": 41,
            "from": "inactive_fallback",
            "to": "menu",
            "button": 1
          },
          {
            "id": 42,
            "from": "sms_ask",
            "to": "exit_sms_auth",
            "button": 1
          },
          {
            "id": 43,
            "from": "sms_invalid_phone",
            "to": "exit_sms_auth",
            "button": 1
          },
          {
            "id": 44,
            "from": "sms_invalid_verification",
            "to": "exit_sms_auth",
            "button": 1
          },
          {
            "id": 45,
            "from": "subscribe_status_false",
            "to": "subscribe_choices",
            "button": 1
          },
          {
            "id": 46,
            "from": "subscribe_status_false",
            "to": "menu",
            "button": 2
          },
          {
            "id": 47,
            "from": "subscribe_status_true",
            "to": "subscribe_choices",
            "button": 1
          },
          {
            "id": 48,
            "from": "subscribe_status_true",
            "to": "menu",
            "button": 3
          },
          {
            "id": 49,
            "from": "subscription_onboarding",
            "to": "subscribe_choices",
            "button": 1
          },
          {
            "id": 50,
            "from": "subscription_onboarding",
            "to": "subscription_reject",
            "button": 2
          },
          {
            "id": 51,
            "from": "subscription_subscribe_success",
            "to": "subscribe_choices",
            "button": 1
          },
          {
            "id": 52,
            "from": "subscription_subscribe_success",
            "to": "menu",
            "button": 3
          },
          {
            "id": 53,
            "from": "subscription_unsubscribe_success",
            "to": "subscribe_choices",
            "button": 1
          },
          {
            "id": 54,
            "from": "subscription_unsubscribe_success",
            "to": "menu",
            "button": 2
          },
          {
            "id": 55,
            "from": "subscriptions",
            "to": "subscribe_choices",
            "button": 1
          }
        ]
    }

    const temp2 = TempJSON
    

    this.scene.nodes = temp2.nodes;
    this.scene.links = [];
    // this.scene.links = temp.links.filter((link) => Boolean(temp.nodes.find((node) => node.id === link.to)));
    // console.log('FILTER LINKS', temp.links.filter((link) => Boolean(temp.nodes.find((node) => node.id === link.to))).length);
    // console.log({temp, scene: this.scene})
  },
  methods: {
    addErrors({ message, detail }) {
      if (!this.errors.find((error) => error.detail.link.id === detail.link.id)) {
          this.errors.push({
            message,
            detail
          })
          this.notificationUp(message + ' check log windows!', 'error', true);
      }
      if (!detail.link) {
        this.notificationUp(message + ' check log windows!', 'error', true);
        this.errors.push({
          message,
          detail
        })
      }
    },
    notificationUp(title, type, auto) {
      const id = Math.max(0, ...this.notifications.map((item) => item.id)) + 1;
      const notification = {
        id,
        status: true,
        title,
        type,
        auto
      }
      
      this.notifications.unshift(notification);

      if (this.notifications[0].auto) {
        this.notificationDown(id);
      }
    },
    notificationDown(id) {
      setTimeout(() => {
        this.clearNotification(id);
      }, 3000)
    },
    clearNotification(id) {
      const notification = this.notifications.find((item) => item.id === id);
      
      notification.status = false;
      // this.notifications = this.notifications.filter((item) => item.id !== id);
    },
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
        isStart: false,
        buttons: []
      })
    },
    onCreateNode({x, y, nodeType, label}) {

      let maxID = Math.max(0, ...this.scene.nodes.map((link) => {
        return link.id
      }))
      this.scene.nodes.push({
        id: maxID + 1,
        x,
        y,
        type: nodeType,
        label: label,
        isStart: false,
        buttons: []
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
    buttonAdded(obj) {
      console.log('new button added:', obj);
    },
    buttonUpdated(obj) {
      console.log('button updated:', obj);
    },
    buttonDeleted(obj) {
      console.log('button deleted:', obj);
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

#notification {
  position: fixed;
  top: 0;
  left: 0;
  padding-left: 10px;
  padding-right: 10px;
  width: 98%;
  z-index: 10;
}
</style>
