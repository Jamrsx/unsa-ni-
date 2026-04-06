<template>
  <div class="toggle-button">
    <label :for="name" class="toggle-label" :class="{'inherited-label': isInherited, 'denied-label': !isInherited && !model, 'allowed-label': !isInherited && model}">{{ label }}</label>
    <label class="switch" :class="{'inherited-switch': isInherited, 'denied-switch': !isInherited && !model, 'allowed-switch': !isInherited && model}">
      <input
        type="checkbox"
        :id="name"
        v-model="model"
        @change="handleToggle"
      />
      <span class="slider" :class="{'inherited-slider': isInherited, 'denied-slider': !isInherited && !model, 'allowed-slider': !isInherited && model}"></span>
    </label>
  </div>
</template>

<script setup>
const emit = defineEmits(["change"])
const props = defineProps({
  label: {
    type: String,
    default: 'Toggle'
  },
  name: {
    type: String,
    required: true
  },
  apiUrl: {
    type: String,
    default: ''
  },
  isInherited: {
    type: Boolean,
    default: false
  }
})

// replaces v-model + ref
const model = defineModel({ type: Boolean, default: false })

const handleToggle = async () => {
  // Always emit change so parent can react to the new model value
  emit('change', model.value)
  // Parent component should handle persistence/API calls when needed.
}
</script>

<style scoped>
.toggle-button {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toggle-label {
  font-size: 14px;
  color: #333;
  margin: 0;
}

.toggle-label.inherited-label {
  color: #999;
  font-style: italic;
}

.toggle-label.denied-label {
  color: #d32f2f;
  font-weight: 500;
}

.toggle-label.allowed-label {
  color: #1976d2;
  font-weight: 500;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .3s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: \"\";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .3s;
  border-radius: 50%;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

/* Inherited state: gray instead of blue */
.inherited-switch input:checked + .slider {
  background-color: #9e9e9e !important;
}

.inherited-switch input:not(:checked) + .slider {
  background-color: #ccc !important;
}

.inherited-switch input:focus + .slider {
  box-shadow: 0 0 1px #9e9e9e !important;
}

/* Allowed state: blue (checked) */
.allowed-switch input:checked + .slider {
  background-color: #2196F3 !important;
}

.allowed-switch input:not(:checked) + .slider {
  background-color: #ccc !important;
}

.allowed-switch input:focus + .slider {
  box-shadow: 0 0 2px #2196F3 !important;
}

/* Denied state: red (unchecked) */
.denied-switch input:not(:checked) + .slider {
  background-color: #d32f2f !important;
}

.denied-switch input:checked + .slider {
  background-color: #2196F3 !important;
}

.denied-switch input:focus + .slider {
  box-shadow: 0 0 2px #d32f2f !important;
}
</style>
