<template>
  <div>
<!--  面包屑导航条-->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>参数列表</el-breadcrumb-item>
  </el-breadcrumb>

  <!--  卡片视图区域-->
  <el-card class="box-card">
    <!--  头部注意标签-->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false" show-icon></el-alert>
    <!--  选择商品分类和级联选择器-->
    <el-row class="cat_opt">
      <el-col>
        <span>选择商品分类：</span>
        <el-cascader
          v-model="selectedKeys"
          :options="cateList"
          :props="cateProps"
          @change="handleChange"></el-cascader>
      </el-col>
    </el-row>
    <!--  动态的tab标签-->
    <el-tabs v-model="activeName" @tab-click="handleTabClick">
<!--      添加动态参数的面板-->
      <el-tab-pane label="动态参数" name="many">
        <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true" > 添加参数</el-button>
<!--      动态参数的表格-->
        <el-table :data="manyTableData" stripe border>
<!--          展开行-->
          <el-table-column type="expand">
            <template slot-scope="scope">
              <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
              <!--              输入的文本框-->
              <el-input
                class="input-new-tag"
                v-if="scope.row.inputVisible"
                v-model="scope.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)"
                @blur="handleInputConfirm(scope.row)"
              >
              </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)" >+ New Tag</el-button>
            </template>
          </el-table-column>
<!--          索引列-->x
          <el-table-column type="index"></el-table-column>
          <el-table-column label="参数名称" prop="attr_name"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">修改</el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

      </el-tab-pane>
<!--      添加静态属性的面板-->
      <el-tab-pane label="静态属性" name="only">
        <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true"> 添加属性</el-button>
        <!--      静态参数的表格-->
        <el-table :data="onlyTableData" stripe border>
          <!--          展开行-->
          <el-table-column type="expand">
            <template slot-scope="scope">
              <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i, scope.row)">{{item}}</el-tag>
              <!--              输入的文本框-->
              <el-input
                class="input-new-tag"
                v-if="scope.row.inputVisible"
                v-model="scope.row.inputValue"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(scope.row)"
                @blur="handleInputConfirm(scope.row)"
              >
              </el-input>
              <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)" >+ New Tag</el-button>
            </template>
          </el-table-column>
          <!--          索引列-->
          <el-table-column type="index"></el-table-column>
          <el-table-column label="属性名称" prop="attr_name"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

      </el-tab-pane>

    </el-tabs>
  </el-card>


    <!--    添加参数与添加属性的共同对话框-->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
<!--      添加参数的对话框-->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!--    修改参数与添加属性的共同对话框-->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!--      添加参数的对话框-->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
  export default {
    data() {
      return {
        // 商品分类列表
        cateList: [],
        // 级联选择框的配置对象
        cateProps: {
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children'
        },
        // 级联选择框双向绑定到的数组
        selectedKeys: [],
        // 被激活的tab页签名称 默认为第一个
        activeName: 'many',
        // 动态属性表格数据
        manyTableData: [],
        // 静态属性表格数据
        onlyTableData: [],
        // 添加参数与属性的对话框
        addDialogVisible: false,
        // 添加参数对话框
        addForm: {
          attr_name: '',
        },
        // 添加参数对话框规则
        addFormRules: {
          attr_name: [
            { required: true, message:'请输入参数名称', trigger:'blur' }
          ]
        },
        // 修改参数对话框的显示
        editDialogVisible: false,
        // 修改参数对话框
        editForm: {
          attr_name: '',
        },
        // 修改参数对话框规则
        editFormRules: {
          attr_name: [
            { required: true, message:'请输入参数名称', trigger:'blur' }
          ]
        },

      }
    },
    created () {
      this.getCateList()
    },
    methods: {
      // 获取分类列表
      async getCateList() {
        const {data: res} = await this.$http.get(`categories`)
        if (res.meta.status !== 200)
          return this.$message.error('获取分类列表失败')
        this.cateList = res.data
        console.log(this.cateList)
      },
      // 级联选择框选中项变化触发的函数
      handleChange() {
        this.getParamsData()
      },
      // tabs标签点击事件处理函数
      handleTabClick() {
        console.log(this.activeName)
        this.getParamsData()
      },
      // 获取参数列表的数据
      async getParamsData() {
        // 没有选中三级分类
        if (this.selectedKeys.length !== 3) {
          this.$message.warning('请选中三级分类')
          this.selectedKeys = []
          this.manyTableData = []
          this.onlyTableData = []
          return
        } else {
          // 选中的是三级分类
          console.log(this.selectedKeys)
          // 根据所选中的分类id 以及当前所出的tab面板来发起对应的请求
          const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`,
            { params :{ sel : this.activeName} })
          if(res.meta.status !== 200)
            return this.$message.error('获取分类参数列表失败')
          //获取参数列表成功时 要判断所得到的参数列表到底是动态表格中的还是静态表格中的
          console.log(res.data)

          res.data.forEach(item => {
            item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []

            // 控制文本框的显示与隐藏
            item.inputVisible = false
            // 文本框中输入的值
            item.inputVisible = ''
          })


          if (this.activeName === 'many') {
            this.manyTableData = res.data
          } else {
            this.onlyTableData = res.data
          }

        }
      },
      // 监听添加对话框的关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      // 点击按钮添加参数
      addParams() {
        // 表格的预校验
        this.$refs.addFormRef.validate(async valid => {
          if(!valid) return
          const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`,
            {attr_name: this.addForm.attr_name, attr_sel: this.activeName})
          if(res.meta.status !== 201)
            return this.$message.error('添加失败')
          this.$message.success('添加成功')
          this.addDialogVisible = false
          this.getParamsData()
        })
      },
      // 显示编辑对话框
      async showEditDialog(attr_id) {
        const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, { params: { attr_sel: this.activeName}})
        console.log(res)
        if (res.meta.status !== 200)
          return this.$message.error('获取参数信息失败')
        this.editForm = res.data
        this.editDialogVisible = true
      },
      // 监听编辑对话框的关闭事件
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      // 点击按钮编辑
      editParams() {
        // 表格的预校验
        this.$refs.editFormRef.validate(async valid => {
          if(!valid) return
          const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
            {attr_name: this.editForm.attr_name, attr_sel: this.activeName})
          if(res.meta.status !== 200)
            return this.$message.error('添加失败')
          this.$message.success('添加成功')
          this.editDialogVisible = false
          this.getParamsData()
        })
      },
      // 根据id删除对应的参数项
      async removeParams(attr_id){
        const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if (confirmResult != 'confirm')
          return this.$message.info('已取消删除')
        const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)

        if (res.meta.status !== 200) {
          return this.$message.error('删除参数失败')
        }
        this.$message.success('删除参数成功')
        this.getParamsData()
      },
      // 文本框失去焦点或按下enter键触发的事件
      async handleInputConfirm(row) {
        // 判断标签内输入的值去掉空格之后是不是有效的
        if (row.inputValue.trim().length === 0) {
          // 如果用户输入的值去掉空格之后是无效的
          // 先将这一行的值重置为空，然后在失去焦点时隐藏input，在返回
          row.inputValue = ''
          row.inputVisible = false
          return
        }
        // 如果没有 return 则证明输入的内容 需要做后续处理
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue = ''
        row.inputVisible = false
        // 需要发起请求将数据保存在后端
        this.saveAttrVals(row)
      },
      // 将对 attr_vals 的操作保存到数据库中
      async saveAttrVals(row) {
        // 需要发起请求将数据保存在后端
        const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,
          { attr_name: row.attr_name, attr_sel: row.attr_sel,
            attr_vals: row.attr_vals.join(',')})
        console.log(row)
        if (res.meta.status !== 200) {
          return this.$message.error('修改参数项失败')
        }
        this.$message.success('修改参数项成功')
      },
      // 点击按钮展示文本输入框
      showInput(row) {
        row.inputVisible = true
        // 让文本框自动获得焦点
        // $nextTick 方法的作用：当页面上元素被重新渲染之后才会执行回调函数的代码
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },
      // 点击关闭标签按钮对标签进行删除
      async handleClose(i, row) {
        // 在前端的数组中使用splice将所要删除的数据从数组中删除
        row.attr_vals.splice(i, 1)
        // 再调用保存数组的函数将已经更新后的数组保存到数据库中
        this.saveAttrVals(row)
      }
    },
    // 计算属性
    computed: {
      // 如果按钮需要被禁用，返回true，否则返回false
      isBtnDisabled() {
        // 长度不是3代表不符合要求需要禁用
        if(this.selectedKeys.length !== 3)
          return true
        else
          return false
      },
      // 当前选中三级分类的id
      cateId() {
        if (this.selectedKeys.length === 3)
          return this.selectedKeys[2]
        else
          return null
      },
      // 动态计算标题的文本
      titleText() {
        return this.activeName === 'many' ? '动态参数' : '静态属性'
      },

    }
  }
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}

.el-tag {
  margin: 10px;
}

.input-new-tag {
  width: 150px;
}
</style>
