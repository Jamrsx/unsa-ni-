<template>
  <div class="ac-overlay">
    <div class="ac-modal">
      <h3>Change Avatar</h3>
      <input type="file" accept="image/*" @change="onFileChange" />
      <div class="ac-preview">
        <img ref="imgRef" :src="src" alt="Preview" />
      </div>
      <div class="ac-actions">
        <button class="btn btn-secondary" @click="cancel">Cancel</button>
        <button class="btn btn-primary" @click="save">Save</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import Cropper from 'cropperjs';

const emits = defineEmits(['save', 'cancel']);
const props = defineProps({
  currentAvatarUrl: {
    type: String,
    default: ''
  }
});

const imgRef = ref(null);
const cropper = ref(null);
const src = ref('');

onMounted(() => {
  // load current avatar on mount if available
  if (props.currentAvatarUrl) {
    src.value = props.currentAvatarUrl.startsWith('/') ? props.currentAvatarUrl : ('/' + props.currentAvatarUrl);
    setTimeout(() => {
      initCropper();
    }, 50);
  }
});

function onFileChange(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (event) {
    src.value = event.target.result;
    // initialize cropper after next tick when img src set
    setTimeout(() => {
      initCropper();
    }, 50);
  };
  reader.readAsDataURL(file);
}

function initCropper() {
  if (!imgRef.value) return;
  if (cropper.value) {
    cropper.value.destroy();
    cropper.value = null;
  }
  console.log('Initializing cropper with Cropper class:', Cropper);
  // Cropper is a class, instantiate it with 'new'
  cropper.value = new Cropper(imgRef.value, {
    aspectRatio: 1,
    viewMode: 1,
    autoCropArea: 1,
  });
  console.log('Cropper instance created:', cropper.value);
  console.log('Cropper proto methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(cropper.value)));
}

function save() {
  if (!cropper.value || !imgRef.value) return;
  
  console.log('Save called');
  
  let canvas = null;
  
  try {
    // Simply use the img element and draw it to a canvas at fixed size
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 256;
    tempCanvas.height = 256;
    const ctx = tempCanvas.getContext('2d');
    
    // Draw the current image from the img element
    ctx.drawImage(imgRef.value, 0, 0, 256, 256);
    canvas = tempCanvas;
    
    console.log('Canvas created successfully');
  } catch (e) {
    console.error('Error creating canvas:', e);
    return;
  }
  
  if (!canvas || typeof canvas.toDataURL !== 'function') {
    console.error('Failed to get valid canvas', canvas);
    return;
  }
  
  try {
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
    console.log('Emitting save with base64 length:', base64.length);
    emits('save', base64);
  } catch (e) {
    console.error('Error converting to data URL:', e);
  }
}

function cancel() {
  emits('cancel');
}

onUnmounted(() => {
  if (cropper.value) {
    cropper.value.destroy();
    cropper.value = null;
  }
});
</script>

<style scoped>
.ac-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}
.ac-modal {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  width: 420px;
  max-height: 90vh;
  overflow-y: auto;
}
.ac-preview {
  position: relative;
  margin: 12px 0;
  background: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}
.ac-preview img {
  max-width: 100%;
  max-height: 300px;
  display: block;
}
.ac-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}
/* Cropper.js default styles */
.cropper-container {
  position: relative;
  overflow: hidden;
  background: #fff;
}
.cropper-canvas,
.cropper-modal {
  position: absolute;
  top: 0;
  left: 0;
}
.cropper-modal {
  background: rgba(0, 0, 0, .5);
}
.cropper-viewer,
.cropper-preview {
  position: absolute;
  overflow: hidden;
}
.cropper-viewer {
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}
.cropper-dashed {
  position: absolute;
  display: block;
  border: 1px dashed #ccc;
}
.cropper-face,
.cropper-line,
.cropper-point {
  position: absolute;
  display: block;
  width: 100%;
  height: 100%;
}
.cropper-face {
  background: rgba(255, 255, 255, 0.1);
  cursor: move;
  z-index: 1;
}
.cropper-line {
  background: rgba(255, 255, 255, 0.1);
}
.cropper-line.line-e {
  right: -3px;
  top: 0;
  width: 5px;
  cursor: ew-resize;
}
.cropper-line.line-n {
  top: -3px;
  left: 0;
  height: 5px;
  cursor: ns-resize;
}
.cropper-line.line-w {
  left: -3px;
  top: 0;
  width: 5px;
  cursor: ew-resize;
}
.cropper-line.line-s {
  bottom: -3px;
  left: 0;
  height: 5px;
  cursor: ns-resize;
}
.cropper-point {
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  z-index: 1;
}
.cropper-point.point-e {
  right: -3px;
  top: 50%;
  margin-top: -3px;
  cursor: ew-resize;
}
.cropper-point.point-n {
  top: -3px;
  left: 50%;
  margin-left: -3px;
  cursor: ns-resize;
}
.cropper-point.point-w {
  left: -3px;
  top: 50%;
  margin-top: -3px;
  cursor: ew-resize;
}
.cropper-point.point-s {
  bottom: -3px;
  left: 50%;
  margin-left: -3px;
  cursor: ns-resize;
}
.cropper-point.point-ne {
  right: -3px;
  top: -3px;
  cursor: nesw-resize;
}
.cropper-point.point-nw {
  left: -3px;
  top: -3px;
  cursor: nwse-resize;
}
.cropper-point.point-sw {
  left: -3px;
  bottom: -3px;
  cursor: nesw-resize;
}
.cropper-point.point-se {
  right: -3px;
  bottom: -3px;
  cursor: nwse-resize;
}
</style>
