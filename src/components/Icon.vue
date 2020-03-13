<template>
  <svg :class="customClass ? 'icon ' + customClass : 'icon'" aria-hidden="true">
    <use :xlink:href="`#${type}`"></use>
  </svg>
</template>

<script>
export default {
  props: ['type', 'customClass']
}
</script>
