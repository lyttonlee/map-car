export const validatePassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('密码不能为空!'))
  } else if (value.length < 6 || value.length > 15) {
    callback(new Error('密码长度应在6-15位之间'))
  } else {
    callback()
  }
}
