<template>
  <div class="login-container">
    <!-- <i id="bubbleradius"></i>
    <span v-for="(c, index) in circles" :style="style(c)" :key="c.key" :class="'span'+(index+1)">&nbsp;</span> -->
    <img src="../assets/img/logicon.png" alt="" class="imgsty">
    <div class="logins">
      <div class="logfrom">
        <div class="logtitle">
          智慧照明
        </div>
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="0px" class="ms-content">
          <el-form-item label="" prop="usersName">
            <el-input v-model="ruleForm.usersName" id="name" placeholder="用户名">
              <img src="../assets/img/user.png" style="color:#1d283b;margin-top: 12px;margin-left:6px;width: 14px;height:14px" slot="prefix" alt="">
            </el-input>
          </el-form-item>
          <el-form-item label="" prop="loginPassword">
            <el-input v-model="ruleForm.loginPassword" type="Password" placeholder="密码" show-password>
              <img src="../assets/img/pwd.png" style="color:#1d283b;margin-top: 12px;margin-left:6px;width: 14px;height:14px" slot="prefix" alt="">
            </el-input>
          </el-form-item>
          <div class="login-btn">
            <el-button type="primary" @click="submitForm('ruleForm')">登录</el-button>
          </div>
        </el-form>
      </div>
    </div>
    <div class="comName">- &copy;2020 重庆丝路启航智能科技有限公司 -</div>
  </div>
</template>

<script>
import bus from '../common/bus.js'
import baseValidator from '@/common/baseValidator'
export default {
  name: 'login', //登录
  components: {},
  data() {
    return {
      circles: [],
      lastExec: null,
      globalID: null,
      hue: 250,
      lastCollisions: [],
      hiddenProperty: null,
      visibilityChangeEvent: null,
      moving: true,
      ruleForm: {
        usersName: '', //登录账户
        loginPassword: '', //密码
      },
      loginInfo: null, //登陆后返回的用户信息
      isEnableLogin: true, //是否允许登录
      loading: false, //加载中
      rules: {
        usersName: [
          {
            required: true,
            message: '请输入用户名',
            trigger: 'blur'
          }
        ],
        loginPassword: [
          {
            required: true,
            message: '请输入密码',
            trigger: 'blur'
          }
        ],
        userCode: [
          {
            required: true,
            message: '请输入租户编码'
          },
          {
            validator: baseValidator.validateUserCode,
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.keyupEnter()
  },
  mounted() {
    // var box = this.$el.getBoundingClientRect()
    // var radius = this.$el.querySelector('#bubbleradius').getBoundingClientRect().width
    // // var max = (box.width * box.height) / 300 / Math.pow(radius, 1.2)
    // var max = 6
    // for (var i = 0; i < max; i++) {
    //   this.circles.push({
    //     key: Math.random(),
    //     y: Math.random() * box.height,
    //     x: Math.random() * box.width,
    //     vx: Math.random() / 5,
    //     vy: Math.random() / 5,
    //     hue: Math.random() * 5000,
    //     collisionFree: false,
    //     mass: 1,
    //     radius: radius,
    //     popped: false
    //   })
    // }
    // this.globalID = requestAnimationFrame(this.update)

    // var hidden, visibilityChange
    // if (typeof document.hidden !== 'undefined') {
    //   // Opera 12.10 and Firefox 18 and later support
    //   hidden = 'hidden'
    //   visibilityChange = 'visibilitychange'
    // } else if (typeof document.msHidden !== 'undefined') {
    //   hidden = 'msHidden'
    //   visibilityChange = 'msvisibilitychange'
    // } else if (typeof document.webkitHidden !== 'undefined') {
    //   hidden = 'webkitHidden'
    //   visibilityChange = 'webkitvisibilitychange'
    // }
    // this.hiddenProperty = hidden
    // this.visibilityChangeEvent = visibilityChange
    // document.addEventListener(this.visibilityChangeEvent, this.handleVisibilityChange, false)
  },
  methods: {
    /**
     * 登录
     */
    submitForm(formName) {
      if (!this.isEnableLogin) {
        return
      }
      this.isEnableLogin = false
      this.$refs[formName].validate(valid => {
        // if (!valid) {
        //   this.isEnableLogin = true
        //   return false
        // }
        // this.loading = true
        // let oLogin = {
        //   sUsername: this.ruleForm.usersName.trim(),
        //   sPassword: this.$md5(this.ruleForm.loginPassword.trim())
        // }
        // this.login(oLogin)
        this.$router.push({
                name: 'index'
              }) // 
      })
    },
    /**
     * 回车--登录
     */
    keyupEnter() {
      document.onkeydown = e => {
        let body = document.getElementsByTagName('body')[0]
        if (e.keyCode === 13) {
          this.submitForm('ruleForm')
        }
      }
    },
    /**
     * 登录请求
     */
    login(loginObj) {
      let self = this
      this.$axios
        .leansite({
          url: this.API.leansite.login, //不需要再添加ip和端口
          method: 'post', //提交方式：get和post，同 params 和 data配合使用
          params: {
            loginName: loginObj.sUsername,
            password: loginObj.sPassword
          }
        })
        .then(res => {
          this.loading = false
          this.isEnableLogin = true
          var resData = res.data
          let resCode = parseInt(resData.code)
          if (resCode == 0) {
            this.$store.dispatch('userCenter/setUser', {
              data: resData.data.loginUser
            })
            this.$store.dispatch('userCenter/setToken', {
              data: resData.data.token
            })
            if (self.$route.query.redirect) {
              self.$router.push(self.$route.query.redirect).go(0) // 登录过期重新登录
            } else {
              self.$router.push({
                name: 'index'
              }) // 正常登录
            }
          } else if (resData.code == 1000) {
            this.$message({
              type: 'error',
              message: '登录失败：' + resData.msg
            })
          }
        })
    },
    style(c) {
      return `top:${c.y}px;left:${c.x}px;`
    },
    rotate(x, y, sin, cos, reverse) {
      return reverse
        ? {
            x: cos * x + sin * y,
            y: cos * y - sin * x
          }
        : {
            x: cos * x - sin * y,
            y: cos * y + sin * x
          }
    },
    flatten(arr) {
      arr.reduce((a, b) => a.concat(Array.isArray(b) ? this.flatten(b) : b), [])
    },
    update(tm) {
      if (!this.moving) {
        return
      }
      if (this.lastExec && this.circles.length) {
        var diff = tm - this.lastExec
        // var huediff = (this.hue + diff/30) % 360
        var box = this.$el.getBoundingClientRect()
        var radius = this.$el.querySelector('#bubbleradius').getBoundingClientRect().width

        var couples = []
        this.circles
          .filter(cc => !cc.popped)
          .forEach(c1 => {
            this.circles
              .filter(cc => !cc.popped)
              .forEach(c2 => {
                if (c1 !== c2) {
                  couples.push([c1, c2])
                }
              })
          })

        var collisions = couples.filter(couple => {
          var dist = Math.sqrt(Math.pow(couple[0].y - couple[1].y, 2) + Math.pow(couple[0].x - couple[1].x, 2))
          return dist < radius * 2
        })

        var newcollisions = collisions.filter(couple => {
          var key = couple[0].key + couple[1].key
          return this.lastCollisions.indexOf(key) < 0
        })

        newcollisions.forEach(couple => {
          var a = couple[0]
          var b = couple[1]

          if (a.collisionFree && b.collisionFree) {
            var dx = b.x - a.x
            var dy = b.y - a.y
            var collisionAngle = Math.atan2(dy, dx)
            var sin = Math.sin(collisionAngle)
            var cos = Math.cos(collisionAngle)
            var pos_a = {
              x: 0,
              y: 0
            }
            var pos_b = this.rotate(dx, dy, sin, cos, true)
            var vel_a = this.rotate(a.vx, a.vy, sin, cos, true)
            var vel_b = this.rotate(b.vx, b.vy, sin, cos, true)
            var vxTotal = vel_a.x - vel_b.x
            vel_a.x = ((a.mass - b.mass) * vel_a.x + 2 * b.mass * vel_b.x) / (a.mass + b.mass)
            vel_b.x = vxTotal + vel_a.x
            pos_a.x += vel_a.x
            pos_b.x += vel_b.x

            var pos_a_final = this.rotate(pos_a.x, pos_a.y, sin, cos, false)
            var vel_a_final = this.rotate(vel_a.x, vel_a.y, sin, cos, false)
            a.new_x = a.x + pos_a_final.x
            a.new_y = a.y + pos_a_final.y
            a.new_vx = vel_a_final.x
            a.new_vy = vel_a_final.y
          }
        })

        newcollisions.forEach(couple => {
          var a = couple[0]
          var b = couple[1]
          if (a.new_vy) {
            a.vx = a.new_vx
            a.vy = a.new_vy
            a.x = a.new_x
            a.y = a.new_y
            a.hue += 20
          }
        })

        this.lastCollisions = collisions.map(couple => {
          return couple[0].key + couple[1].key
        })

        var collided = [...new Set(this.flatten(newcollisions))]
        var collidedKeys = collided.map(c => c.key)

        this.circles.forEach(c => {
          c.collisionFree = c.collisionFree || collidedKeys.indexOf(c.key) < 0
          if (c.y < 0) {
            c.vy = Math.abs(c.vy)
          } else if (c.y > box.height) {
            c.vy = -Math.abs(c.vy)
          }
          if (c.x < 0) {
            c.vx = Math.abs(c.vx)
          } else if (c.x > box.width) {
            c.vx = -Math.abs(c.vx)
          }

          c.y += c.vy * diff
          c.x += c.vx * diff
        })
      }
      this.lastExec = tm
      this.globalID = requestAnimationFrame(this.update)
    },
    handleVisibilityChange() {
      if (!document[this.hiddenProperty]) {
        this.globalID = requestAnimationFrame(this.update)
        this.moving = true
      } else {
        cancelAnimationFrame(this.globalID)
        this.moving = false
      }
    }
  },
  beforeDestroy() {
    document.removeEventListener(this.visibilityChangeEvent, this.handleVisibilityChange, false)
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  min-width: 1088px;
  min-height: 670px;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  background-image: url(../assets/img/backfilt.png);
  background-position: top;
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-color: #fff;
  z-index: 1;
  .imgsty {
    position: fixed;
    top: 34px;
    left: 27px;
    z-index: 3;
  }
  .comName {
    position: absolute;
    color: #fff;
    bottom: 40px;
    width: 100%;
    text-align: center;
    font-size: 14px;
    height: 14px;
    font-weight: normal;
    font-stretch: normal;
    line-height: 24px;
    letter-spacing: 0px;
    color: #9bb2ce;
  }
  .logins {
    width: 1088px;
    height: 670px;
    position: fixed;
    top: calc(50% - 335px);
    left: calc(50% - 544px);
    background-color: #ffffff;
    box-shadow: 27px 2px 67px 6px rgba(47, 72, 100, 0.18);
    background-image: url(../assets/img/denglu-beijing.png);
    background-position: top;
    background-repeat: no-repeat;
    background-size: 100% 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    .logfrom {
      width: 358px;
      height: 427px;
      text-align: center;
      margin-left: 265px;
      .logtitle {
        height: 33px;
        font-family: LOGINFONT;
        font-size: 28px;
        font-weight: normal;
        font-stretch: normal;
        line-height: 24px;
        letter-spacing: 0px;
        color: #323232;
        font-weight: bold;
      }
      .ms-content {
        margin-top: 69px;
        .el-form-item {
          margin-bottom: 39px;
        }
        /deep/ .el-input__inner {
          height: 50px;
          background-color: #ffffff;
          border-radius: 2px;
          border: solid 1px #dfdfdf;
        }
        /deep/ .el-button--primary {
          height: 66px;
          background-image: linear-gradient(266deg, #006fe6 0%, #7b7cf8 100%);
          box-shadow: -2px 20px 21px 0px rgba(0, 40, 123, 0.26);
          border-radius: 2px;
          width: 100%;
          margin-top: -8px;
          span {
            width: 60px;
            height: 20px;
            font-family: ArialMT;
            font-size: 20px;
            font-weight: normal;
            font-stretch: normal;
            line-height: 24px;
            letter-spacing: 0px;
            color: #ffffff;
          }
        }
      }
    }
  }
  * {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
    user-select: none;
  }

  #bubbleradius {
    width: 4.5rem;
    height: 1px;
    opacity: 0;
    z-index: -1;
    display: block;
  }

  body {
    overflow: hidden;
  }

  span {
    transform: translate(-50%, -50%);
    border-radius: 50%;
    display: block;
    position: absolute;
    opacity: 1;
    filter: blur(10px);
    background-color: #006fe6;
    box-shadow: rgba($color: #006fe6, $alpha: 1) 0 0 2rem inset;
    // box-shadow: rgba(0, 111, 230) 0 0 2rem inset;
    transition: box-shadow 0.5s ease-in-out, transform 0.07s ease-out, opacity 0.04s ease-in;
  }

  .span1 {
    height: 460px;
    width: 460px;
  }

  .span2 {
    height: 220px;
    width: 220px;
  }

  .span3 {
    height: 400px;
    width: 400px;
  }

  .span4 {
    height: 300px;
    width: 300px;
  }

  .span5 {
    height: 280px;
    width: 280px;
  }

  .span6 {
    height: 400px;
    width: 400px;
  }
}
// .login-container {
//   width: 100%;
//   height: 100%;
//   display: flex;
//   justify-content: flex-start;
//   .login_left {
//     position: relative;
//     width: 65.468%;
//     height: 100%;
//     background-image: url(../assets/img/denglu-beijing.png);
//     background-position: top;
//     background-repeat: no-repeat;
//     background-size: 100% 100%;
//     .comName {
//       position: absolute;
//       color: #fff;
//       bottom: 20px;
//       left: 40px;
//     }
//     .message {
//       position: absolute;
//       bottom: 100px;
//       left: 50px;
//       color: #fff;
//       text-align: left;
//       hr {
//         background-color: #fff;
//         border: 1px solid #fff;
//       }
//       span {
//         font-size: 14px;
//         display: block;
//         &:last-child {
//           font-size: 24px;
//         }
//       }
//     }
//   }
//   .login_right {
//     width: 100%;
//     height: 100%;
//     background-image: url(../assets/img/denglu-beijing.png);
//     background-position: top;
//     background-repeat: no-repeat;
//     background-size: 100% 100%;
//     position: relative;
//     text-align: center;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     /deep/ .el-input__prefix {
//       left: 8px;
//     }
//   }

//   .comName {
//     position: absolute;
//     color: #fff;
//     bottom: 30px;
//     font-size: 14px;
//     font-weight: normal;
//     font-stretch: normal;
//     line-height: 4px;
//     letter-spacing: 0px;
//     color: #a7abb8;
//     width: 365px;
//   }
//   .ms-login {
//     width: 365px;
//     // height: 450px;
//     color: #ffffff;
//     text-align: center;
//     /deep/ .el-form-item__content {
//       color: #323232;
//     }
//     /deep/ .el-form-item__error {
//       color: #acacac;
//     }
//     .ptitle {
//       height: 18px;
//       font-family: MicrosoftYaHei;
//       font-size: 18px;
//       font-weight: normal;
//       font-stretch: normal;
//       line-height: 4px;
//       letter-spacing: 0px;
//       color: #ffffff;
//       margin-top: 29px;
//       margin-bottom: 47px;
//     }
//     img {
//       width: 113;
//       height: 24px;
//     }
//     .systemLogo {
//       // margin: 20px auto 0px;
//     }
//     .el-form {
//       // width: 60%;
//       font-size: 16px !important;
//       margin: 0 auto;
//       text-align: left;
//       .el-form-item {
//         margin-bottom: 28px;
//         .erificationCodeImg {
//           width: 108px;
//           height: 40px;
//           border-radius: 4px;
//           margin-left: 10px;
//           cursor: pointer;
//         }
//       }
//       .login-btn {
//         width: 100%;
//         color: #ffffff;
//         text-align: center;
//         .el-button {
//           width: 100%;
//           background-color: #3461b5;
//           margin-top: 28px;
//           height: 40px;
//           border: none;
//         }
//       }
//     }
//   }
//   /deep/ .el-input__inner {
//     // background: transparent !important;
//     border: none;
//     // border-radius: 0;
//     // border-bottom: 1px solid #c4c4c4;
//     font-family: Helvetica;
//     font-size: 14px;
//     // color: #595959;
//     background-color: #1f2d59;
//     color: #fff;
//     border-radius: 4px;
//     height: 40px;
//   }
//   /deep/ .el-input__inner::-webkit-input-placeholder {
//     color: #d2d5dc;
//   }
//   /deep/ .el-input__inner::-moz-input-placeholder {
//     color: #d2d5dc;
//   }
//   /deep/ .el-input__inner::-ms-input-placeholder {
//     color: #d2d5dc;
//   }
// }
</style>
