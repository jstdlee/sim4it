<script setup lang="ts">
import { useApp } from '../stores/app'
import Simulator from './Simulator.vue'
import DirectorLabPanel from '../components/DirectorLabPanel.vue'
import ComicsLabPanel from '../components/ComicsLabPanel.vue'

const app = useApp()
</script>

<template>
  <Simulator v-if="app.domain === 'options'" />
  <DirectorLabPanel v-else-if="app.domain === 'director'" />
  <ComicsLabPanel v-else />
</template>
