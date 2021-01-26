<template>
  <div>
    <!--    面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!--  卡片试图-->
    <el-card>
<!--  添加角色按钮-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible =true">添加角色</el-button>
        </el-col>
      </el-row>

<!--  角色列表-->
      <el-table :data="roleList" border stripe>
<!--        展开列-->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
<!--              一级权限菜单-->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
<!--              二、三级权限菜单-->
              <el-col :span="19">
<!--                通过 for 循环嵌套渲染二级权限-->
                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag closable @close="removeRightById(scope.row, item2.id)" type="success">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18" >
                    <el-tag closable @close="removeRightById(scope.row, item3.id)" type="warning" v-for="(item3,i3) in item2.children" :key="item3.id">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>

        </el-table-column>
<!--        索引列-->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="350px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>

            <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeRoleById(scope.row.id)">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>

<!--      添加角色的对话框-->
      <el-dialog
        title="提示"
        :visible.sync="addRoleDialogVisible"
        width="50%"
        @close="addRoleDialogClosed">

        <el-form :model="addRoleForm" :rules="addRoleFormRules" ref="addRoleFormRef" label-width="100px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>

        <span slot="footer" class="dialog-footer">
          <el-button @click="addRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRole">确 定</el-button>
        </span>
      </el-dialog>

<!--      修改角色的对话框-->
      <el-dialog
        title="修改角色"
        :visible.sync="editRoleDialogVisible"
        width="50%">
        <el-form :model="editRoleForm" :rules="editRoleFormRules" ref="editRoleFormRef" label-width="100px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editRoleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRole">确 定</el-button>
        </span>
      </el-dialog>

      <!--      分配权限的对话框-->
      <el-dialog
        title="分配权限"
        :visible.sync="showRightDialogVisible"
        width="50%"
        @close="setRightDialogClosed"
      >
<!--        树形控件-->
        <el-tree :data="rightsList"
                 :props="treeProps"
                 show-checkbox node-key="id"
                 default-expand-all
                 :default-checked-keys="defKeys"
                 ref="treeRef"
        >
        </el-tree>

        <span slot="footer" class="dialog-footer">
          <el-button @click="showRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>


    </el-card>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        roleList: [],
        // 添加角色
        addRoleDialogVisible: false,
        addRoleForm: {
          roleName: '',
          roleDesc: ''
        },
        addRoleFormRules: {
          roleName: [
            { required: true, message: "请输入角色名称", trigger: "blur"},
          ],
          roleDesc: [
            { required: true, message: "请输入角色描述", trigger: "blur"},
          ],
        },

        // 编辑角色
        editRoleDialogVisible: false,
        editRoleForm: [],
        editRoleFormRules: {
          roleName: [
            { required: true, message: "请输入角色名称", trigger: "blur"},
          ],
          roleDesc: [
            { required: true, message: "请输入角色描述", trigger: "blur"},
          ],
        },

        // 分配权限
        showRightDialogVisible: false,
        rightsList: [],
        // 树形控件的属性绑定对象
        treeProps: {
          label: 'authName',
          children: 'children'
        },
        // 默认选中的节点id值数组
        defKeys: [],
        // 当前即将分配角色的id
        roleId: ''
      }
    },
    created() {
      this.getRolesList();
    },
    methods: {
      // 获取角色列表
      async getRolesList() {
        const {data: res} = await this.$http.get('roles')
        console.log(res)
        if(res.meta.status !== 200)
          return this.$message.error('获取角色列表失败')
        this.roleList = res.data
        console.log(res)
      },

      // 添加角色
      async addRole() {
        this.$refs.addRoleFormRef.validate(async valid => {
          if (!valid) return
          const {data :res} = await this.$http.post('roles', this.addRoleForm)
          if (res.meta.status !== 201)
            return this.$message.error('添加角色失败！')
          this.$message.success('添加用户成功！')
          this.addRoleDialogVisible = false
          this.getRolesList()
        })
      },
      addRoleDialogClosed() {
        this.$refs.addRoleFormRef.resetFields()
      },

      // 编辑角色
      async showEditDialog(id) {
        console.log(id)
        const {data: res} = await this.$http.get('roles/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('查询角色失败！')
        }
        this.editRoleForm = res.data
        this.editRoleDialogVisible = true
        console.log(res)
      },
      editRole() {
        this.$refs.editRoleFormRef.validate(async valid => {
          if (!valid) return
          console.log(this.editRoleForm.id)
          const {data : res} = await this.$http.put('roles/' + this.editRoleForm.roleId,
            {roleName: this.editRoleForm.roleName, roleDesc: this.editRoleForm.roleDesc})
          console.log(res)
          if (res.meta.status !== 200)
            return this.$message.error('编辑角色失败！')
          console.log(res)

          this.editRoleDialogVisible = false
          this.$message.success('编辑角色成功！')
          this.getRolesList()
        })
      },

      // 删除角色
      async removeRoleById(id) {

        const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)

        console.log(confirmResult)
        if (confirmResult !== 'confirm')
          return this.$message.info('已经取消删除')
        console.log('确认删除！')

        const {data: res} = await this.$http.delete('roles/' + id)
        if (res.meta.status !== 200)
          return this.$message.error('删除角色失败！')
        this.$message.success('删除角色成功！')
        this.getRolesList()
      },

      // 根据id删除对应的权限
      async removeRightById(role, rightId) {
        // 弹框提示用户是否确认删除权限
        const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)

        if (confirmResult !== 'confirm')
          return this.$message.info('已经取消删除')
        console.log('确认删除！')

        const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200)
          return this.$message.error('删除权限失败！')

        // this.getRolesList()
        // 这里不用上面的语句是为了避免整个表格都被重新渲染
        // 由于delete返回的data是最新的数据，所以只需要对对应数据进行更新就可以了
        role.children = res.data
        return this.$message.success('删除权限成功！')
      },

      // 展示分配权限对话框
      async showSetRightDialog(role) {
        this.roleId = role.id
        // 获取所有权限的数据
        const {data:res} = await this.$http.get('rights/tree')
        if (res.meta.status !== 200)
          return this.$message.error('获取权限列表失败')
        console.log(res)
        this.rightsList = res.data
        // 递归获取三级节点的id
        this.getLeafKeys(role, this.defKeys)
        this.showRightDialogVisible = true
      },

      // 通过递归的形式获取角色下所有三级权限的id，并保存到defKeys数组中
      getLeafKeys(node, arr) {
        // 如果当前节点不包含children属性，那么它就是三级节点
        if(!node.children) {
          return arr.push(node.id)
        }

        node.children.forEach(item => this.getLeafKeys(item, arr))
      },

      // 监听分配权限的对话框
      setRightDialogClosed() {
        this.defKeys = []
      },

      // 点击为角色分配权限
      async allotRights() {
        const keys = [...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()]
        // 把得到的字符串中间用逗号连接并赋值给一个新的数组
        const idStr = keys.join(',')
        console.log(idStr)
        // 发起请求
        const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids:idStr})

        console.log(res)

        if (res.meta.status !== 200)
          return this.$message.error('分配权限失败')
        this.$message.success('分配权限成功')

        this.getRolesList()
        this.showRightDialogVisible = false
      }
    }
  }
</script>

<style lang="less" scoped>

  .el-tag {
    margin: 7px;
  }

  .bdtop {
    border-top: 1px solid #eee;
  }

  .bdbottom {
    border-bottom: 1px solid #eee;
  }

  .vcenter {
    display: flex;
    align-items: center;
  }

</style>
