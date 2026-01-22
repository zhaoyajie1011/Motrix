<template>
  <el-row class="copyright">
    <el-col :span="6" class="copyright-left">
      <span>&copy;{{ year }} Motrix</span>
    </el-col>
    <el-col :span="18" class="copyright-right">
      <span>{{ $t('about.license') }}</span>
      <span>{{ $t('about.about') }}</span>
      <span>{{ $t('about.support') }}</span>
      <span>{{ $t('about.release') }}</span>
    </el-col>
  </el-row>
</template>

<script>
  export default {
    name: 'mo-copyright',
    data () {
      const year = new Date().getFullYear()
      return {
        year
      }
    }
  }
</script>

<style lang="scss">
.copyright {
  width: 100%;
  font-size: $--font-size-small;
  span {
    color: $--app-copyright-color;
    margin-left: 8px;
  }
}
.copyright-left {
  text-align: left;
  span {
    margin-left: 0;
  }
}

.copyright-right {
  text-align: right;
}
</style>
