import Vue from 'vue'
// import { Button } from 'element-ui'
// import { Form, FormItem } from 'element-ui'
// import { Input } from 'element-ui'
// //导入弹框提示组件
// import { Message} from 'element-ui'

//将上面的合并为一行
import { Button, Form, FormItem, Input,
          Message, Container, Header, Aside,
          Main, Menu, MenuItem, Submenu,
          Breadcrumb, BreadcrumbItem, card,
          Row, Col, Table, TableColumn,
          Switch, Tooltip, Pagination,
          Dialog, MessageBox, Tag, Tree,
          Select, Option, Cascader, Alert,
          Tabs, TabPane,

} from 'element-ui'


//全局注册
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(MenuItem)
Vue.use(Submenu)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(card)
Vue.use(Row)
Vue.use(Col)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Pagination)
Vue.use(Dialog)
Vue.use(Tag)
Vue.use(Tree)
Vue.use(Select)
Vue.use(Option)
Vue.use(Cascader)
Vue.use(Alert)
Vue.use(Tabs)
Vue.use(TabPane)

//把弹框组件挂在到了vue的原型对象上,每一个组件都可以通过this访问$message,就可以实现弹框提示了
Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm

