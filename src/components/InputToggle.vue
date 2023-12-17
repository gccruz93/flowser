<script setup lang="ts">
  const modelValue = defineModel({ default: false })
  withDefaults(
    defineProps<{
      text?: string
    }>(),
    {
      text: '',
    }
  )
  defineEmits<{
    change: [value: boolean]
  }>()
</script>

<template>
  <label
    class="inline-flex h-7 max-w-max cursor-pointer select-none items-center justify-between gap-2 hover:text-white"
  >
    <input
      v-model="modelValue"
      type="checkbox"
      class="toggle"
      @change="$emit('change', modelValue)"
    />

    {{ text }}
  </label>
</template>
