<template>
  <div>
    <!--    面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!--  卡片视图区域-->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!--      表格-->
      <tree-table class="treeTable" :data="cateList" :columns="columns"
                  :selection-type="false" :expand-type="false"
                  show-index index-text="#" border :show-row-hover="false">
        <!--        是否有效-->
        <template v-slot:isok="scope">
          <i class="el-icon-success" style="color: green" v-if="scope.row === false"></i>
          <i class="el-icon-error" style="color: red" v-else></i>
        </template>
        <!--        排序-->
        <template v-slot:order="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" v-else="scope.row.cat_level === 2">三级</el-tag>
        </template>
        <!--        操作-->
        <template v-slot:act="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini"
                     @click="editCateDialog(scope.row)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini"
                      @click="removeCateById(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!--      分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>

      <!--      添加分类的对话框-->
      <el-dialog title="添加分类" :visible.sync="addCateDialogVisible"
                 width="50%" @close="addCateDialogClosed">
<!--        添加分类的表单-->
        <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
          <el-form-item label="分类名称:" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
<!--            options 用来指定这个级联选择器的数据源-->
<!--            props 用来指定配置对象-->
            <el-cascader
              v-model="selectedKeys"
              :options="parentCateList"
              :props="cascaderProps"
              @change="parentCateChange"
              clearable
            ></el-cascader>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
      </el-dialog>

<!--      编辑分类的对话框-->
      <el-dialog title="编辑分类" :visible.sync="editCateDialogVisible"
                 width="50%" @close="editCateDialogClosed">
        <!--        添加分类的表单-->
        <el-form :model="editCateList" :rules="editCateFormRules" ref="editCateFormRef" label-width="100px">
          <el-form-item label="分类名称:" prop="cate_name">
            <el-input v-model="editCateList.cate_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
      </el-dialog>

    </el-card>
  </div>

</template>

<script>
  export default {
    data () {
      return {
        // 查询条件
        queryInfo: {
          type: 3,
          // 当前所在页数
          pagenum: 1,
          // 当前一页有多少数据
          pagesize: 5
        },
        // 商品分类的数据列表，默认为空
        cateList: [],
        // 总数据条数
        total: 0,
        // 为table指定列的定义
        columns: [
          {
            label: '分类名称',
            prop: 'cat_name'
          },
          {
            label: '是否有效',
            // 表示将当前列定义为模板列
            type: 'template',
            // 表示当前列使用的模板名称
            template: 'isok'
          },
          {
            label: '排序',
            type: 'template',
            template: 'order'
          },
          {
            label: '操作',
            type: 'template',
            template: 'act'
          }

        ],
        // 添加分类的对话框
        addCateDialogVisible: false,
        // 添加对话框存储的信息
        addCateForm: {
          // 将要添加的分类名称
          cat_name:'',
          // 父级分类的id
          cat_pid: 0,
          // 当前分类层级,默认添加的是一级分类
          cat_level: 0
        },
        // 添加表单的验证规则对象
        addCateFormRules: {
          cat_name:[
            { required: true, message: '请输入分类名称', trigger: "blur"},
          ]
        },
        // 父级菜单列表
        parentCateList: [],
        // 指定级联选择器的配置对象
        cascaderProps: {
          // 选中的样式是hover类型的
          expandTrigger: 'hover',
          // 具体选中的值的属性
          value: 'cat_id',
          // 所看到的选中属性
          label: 'cat_name',
          // 父子嵌套所用的属性
          children: 'children',
          // 可以任意选中任何一级的文本
          checkStrictly: true
        },
        // 选中的父级分类的id数组
        selectedKeys:[],
        // 编辑分类对话框
        editCateDialogVisible: false,
        editCateList: {
          cate_id:'',
          cate_name:''
        },
        editCateFormRules:{
          cate_name:[
            { required: true, message: '请输入分类名称', trigger: "blur"},
          ]
        }

      }
    },
    created () {
      this.getCateList()
    },
    methods: {
      async getCateList () {
        const { data: res } = await this.$http.get(`categories`, { params: this.queryInfo })
        if (res.meta.status !== 200) {
          return this.$message.error('获取商品列表失败')
        }

        console.log(res.data)
        // 把数据列表赋值给cateList
        this.cateList = res.data.result
        // 为总数条数赋值
        this.total = res.data.total
      },
      // 监听 pagesize 的改变
      handleSizeChange(newSize) {
        this.queryInfo.pagesize = newSize
        this.getCateList()
      },
      // 监听 pagenum 的改变
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum = newPage
        this.getCateList()
      },
      // 点击添加按钮弹出对话框
      showAddCateDialog() {
        // 先获取父级列表数据
        this.getParentCateList()
        // 再显示对话框
        this.addCateDialogVisible = true
      },
      // 获取父级分类的数据列表
      async getParentCateList() {
        const {data: res} = await this.$http.get('categories',{ params: { type: 2 } })
        if(res.meta.status !== 200)
          return this.$message.error('获取父级分类数据列表失败')
        console.log(res.data)
        this.parentCateList = res.data
      },
      // 选中项发生变化触发这个值
      parentCateChange() {
        console.log(this.selectedKeys)
        console.log(this.selectedKeys[0])
        // 如果selectedKeys的长度大于0 则证明有父级分类被选中
        // 否则就没有父级分类
        if (this.selectedKeys.length > 0) {
          console.log('进入了判断')
          // 父级分类的id赋值
          this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
          console.log(this.addCateForm.cat_pid)
          this.addCateForm.cat_level = this.selectedKeys.length
          console.log(this.addCateForm.cat_level)
          console.log(this.addCateForm)
          return
        } else {
          this.addCateForm.cat_pid = 0
          this.addCateForm.cat_level = 0
          console.log(this.addCateForm)
        }
      },
      // 添加分类确定按钮
      addCate() {
        console.log(this.addCateForm)
        this.$refs.addCateFormRef.validate(async valid => {
          if(!valid) return
          const {data: res} = await this.$http.post('categories', this.addCateForm)

          console.log(res)

          if(res.meta.status !== 201)
            return this.$message.error('添加分类失败!')
          this.$message.success('添加分类成功!')
          this.getCateList()
          this.addCateDialogVisible = false
        })
      },
      // 添加分类对话框关闭
      addCateDialogClosed() {
        this.selectedKeys = []
        this.$refs.addCateFormRef.resetFields()
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      },
      // 点击编辑分类按钮
      editCateDialog(cate) {
        this.editCateDialogVisible = true
        console.log(cate)
        this.editCateList.cate_id = cate.cat_id
        this.editCateList.cate_name = cate.cat_name

        console.log(this.editCateList)
      },
      // 确定对分类进行编辑
      async editCate(){
        const {data: res} = await this.$http.put(`categories/` + this.editCateList.cate_id,
          {cat_name: this.editCateList.cate_name})
        if(res.meta.status !== 200)
          return this.$message.error('提交分类失败')
        this.editCateDialogVisible = false
        this.getCateList()
        this.$message.success('更新分类成功')
      },
      // 关闭编辑分类对话框
      editCateDialogClosed() {
        this.$refs.editCateFormRef.resetFields()
      },
      // 删除分类
      async removeCateById(id) {
        console.log(id)
        const confirmResult = await this.$confirm('此操作将永久删除该分类,是否继续?','提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)

        console.log(confirmResult)
        if (confirmResult !== 'confirm')
          return this.$message.info('已经取消删除')

        const {data: res} = await this.$http.delete(`categories/` + id)
        if(res.meta.status !== 200)
          return this.$message.error('删除分类失败!')
        this.$message.success('删除分类成功!')
        this.getCateList()
      }

    }
  }
</script>

<style lang="less" scoped>
  .treeTable {
    margin-top: 20px;
  }

  .el-cascader {
    width: 100%;
  }
</style>
