<template>
  <a :href="hyperlink" class="card-thumb_link">
    <div class="card-thumb">
        <div class="card-thumb_img">
            <img :src="imgSrc || fallbackSrc" :alt="title" @error="onImgError"/>
        </div>
        <div class="card-thumb_body">
        <h4 class="card-thumb_title">{{ title }}</h4>
        <p class="card-thumb_desc">{{ description }}</p>
        </div>
    </div>
  </a>
</template>

<script setup>
/**
 * @typedef {Object} Props
 * @property {string} hyperlink - Link target for the card (default: '#')
 * @property {string} imgSrc - Primary image URL to display
 * @property {string} title - Title text shown on the card
 * @property {string} description - Description text shown on the card
 * @property {string} [fallbackSrc] - Fallback image URL when `imgSrc` fails to load (default: /asset/event/default.png)
 */

const fallbackSrcDefault = '/asset/event/default.png'

/** @type {Props} */
const props = defineProps({
  hyperlink: { type: String, default: '#' },
  imgSrc: { type: String, default: '' },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  fallbackSrc: { type: String, default: fallbackSrcDefault }
})

const fallbackSrc = props.fallbackSrc || fallbackSrcDefault

function onImgError(e) {
  try {
    const img = e && e.target
    if (!img) return
    img.src = fallbackSrc
  } catch (err) {
    // ignore
  }
}
</script>
