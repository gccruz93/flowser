<script setup lang="ts">
  import { iconFinder } from '../icons'

  withDefaults(
    defineProps<{
      name: Icon
      hideWhenNotFound?: boolean
    }>(),
    {
      hideWhenNotFound: false,
    }
  )
</script>

<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="icon" v-html="iconFinder(name, hideWhenNotFound)"></div>
</template>
