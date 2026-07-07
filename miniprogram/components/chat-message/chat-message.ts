Component({
  properties: {
    message: {
      type: Object,
      value: {},
    },
    isLoading: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    timeStr: '',
    displayContent: '',
    _typewriterTimer: null as any,
  },

  lifetimes: {
    attached() {
      this.updateTime();
      this.startTypewriter();
    },
    detached() {
      this.stopTypewriter();
    },
  },

  observers: {
    'message.content'(newVal: string) {
      if (newVal) {
        this.startTypewriter();
      }
    },
    'message.timestamp'() {
      this.updateTime();
    },
  },

  methods: {
    startTypewriter() {
      this.stopTypewriter();
      const msg = this.properties.message;
      if (!msg || !msg.content || msg.role !== 'assistant' || msg.isError) {
        this.setData({ displayContent: msg?.content || '' });
        return;
      }

      const fullText = msg.content;
      const len = fullText.length;

      // 短文本不触发打字机效果（<30字）
      if (len <= 30) {
        this.setData({ displayContent: fullText });
        return;
      }

      let index = 0;
      // 根据文本长度动态调整速度：30-50字 30ms/字，50-100字 20ms/字，100+字 15ms/字
      const speed = len < 50 ? 30 : len < 100 ? 20 : 15;

      this.setData({ displayContent: '' });

      const timer = setInterval(() => {
        index += 1;
        if (index >= len) {
          this.setData({ displayContent: fullText });
          this.stopTypewriter();
          return;
        }
        this.setData({ displayContent: fullText.slice(0, index) });
      }, speed);

      (this.data as any)._typewriterTimer = timer;
    },

    stopTypewriter() {
      const timer = (this.data as any)._typewriterTimer;
      if (timer) {
        clearInterval(timer);
        (this.data as any)._typewriterTimer = null;
      }
    },

    updateTime() {
      var msg = this.properties.message;
      if (!msg || !msg.timestamp) {
        this.setData({ timeStr: '' });
        return;
      }
      var ts = msg.timestamp;
      var date = new Date(ts);
      var h = String(date.getHours()).padStart(2, '0');
      var m = String(date.getMinutes()).padStart(2, '0');
      this.setData({ timeStr: h + ':' + m });
    },

    onRetry() {
      var msg = this.properties.message;
      if (!msg || !msg.id) return;
      this.triggerEvent('retry', { messageId: msg.id });
    },
  },
});
