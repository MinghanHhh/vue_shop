import Vue from 'vue'
// import { Button } from 'element-ui'
// import { Form, FormItem } from 'element-ui'
// import { Input } from 'element-ui'
// //导入弹框提示组件
// import { Message} from 'element-ui'

//将上面的合并为一行
import { Button, Form, FormItem, Input, Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
//把弹框组件挂在到了vue的原型对象上,每一个组件都可以通过this访问$message,就可以实现弹框提示了
Vue.prototype.$message = Message

