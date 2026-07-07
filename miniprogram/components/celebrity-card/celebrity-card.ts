Component({
  properties: {
    celebrity: {
      type: Object,
      value: {},
    },
    language: {
      type: String,
      value: 'zh',
    },
  },

  data: {},

  methods: {
    onTap() {
      // 冒泡事件，让父页面可以捕获点击
      this.triggerEvent('tap', { id: this.properties.celebrity?.id });
    },
  },
});
