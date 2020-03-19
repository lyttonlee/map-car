<template>
  <transition
    mode="out-in"
    enter-active-class="animated bounceInLeft"
    leave-active-class="animated bounceOutRight"
  >
    <router-view/>
  </transition>
</template>
