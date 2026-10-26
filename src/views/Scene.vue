<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDomainPack } from '../lib/content'
import StepPlayer from '../components/StepPlayer.vue'
import TermText from '../components/TermText.vue'
import type { Step } from '@shared/types'

const route = useRoute()
const router = useRouter()
const pack = useDomainPack()
const scenes = computed(() => pack.value.scenes ?? [])
const idx = computed(() => scenes.value.findIndex((m) => m.id === route.params.id))
const m = computed(() => scenes.value[idx.value])
const finished = ref<null | { c: number; t: number }>(null)

const steps = computed<Step[]>(() =>
  m.value?.checkpoints.map((cp) => ({
    ...cp.step,
    brief: {
      label: cp.label,
      date: pack.value.catMap[cp.dept ?? ""]?.name ?? cp.dept ?? "",
      facts: cp.context.split(/(?<=[.!?])\s+(?=[A-Z0-9“"【\[])/).map((x) => x.trim()).filter(Boolean),
    },
  })) ?? [],
)

const go = (d: number) => {
  const n = idx.value + d
  if (scenes.value[n]) {
    finished.value = null
    router.push(`/scenes/${scenes.value[n].id}`)
  }
}
</script>

<template>
  <div class="wrap narrow">
    <nav class="muted crumbs">
      <RouterLink to="/scenes">{{ pack.casesLabel }}</RouterLink> / {{ m?.title }}
    </nav>
    <template v-if="m">
      <h1>{{ m.title }} <span v-if="m.zh" class="zh-sub">· {{ m.zh }}</span></h1>
      <section class="surface brief">
        <p class="label">{{ pack.brand }} · {{ m.genre }}</p>
        <p class="read">{{ m.setup }}</p>
        <p class="read goal"><strong>Goal:</strong> {{ m.goal }}</p>
      </section>
      <StepPlayer
        :key="m.id"
        :qid="`scene:${m.id}`"
        kind="scene"
        :title="m.title"
        :scenario="`${m.title} (${m.genre}). ${m.setup} Goal: ${m.goal}`"
        :steps="steps"
        :terms="m.terms"
        rationale
        @done="(c, t) => (finished = { c, t })"
      />
      <section v-if="finished" class="surface outcome">
        <h2>
          <i :class="['fa-solid', finished.c / finished.t >= 2 / 3 ? 'fa-trophy' : 'fa-rotate-right']" aria-hidden="true" />
          {{ finished.c / finished.t >= 2 / 3 ? 'Passed' : 'Not passed yet' }} · {{ finished.c }}/{{ finished.t }}
        </h2>
        <h3>{{ pack.id === 'director' ? 'Director’s Cut' : 'Editor’s Breakdown' }}</h3>
        <p class="read"><TermText :text="m.outcome" /></p>
        <p v-if="m.ref" class="muted">Reference: {{ m.ref }}</p>
      </section>
      <div class="row pager">
        <button class="btn" :disabled="idx === 0" @click="go(-1)">← Previous</button>
        <span class="grow" />
        <button class="btn primary" :disabled="idx === scenes.length - 1" @click="go(1)">Next →</button>
      </div>
    </template>
    <p v-else>Case not found. <RouterLink to="/scenes">See all {{ pack.casesLabel }}</RouterLink></p>
  </div>
</template>

<style scoped>
.crumbs { font-size: .88rem; margin: .4rem 0 1rem; }
.zh-sub { font-family: var(--ui); font-size: 1.05rem; font-weight: 700; color: var(--fox); }
.brief { margin-bottom: 1rem; border-left: 5px solid var(--fox); }
.label { font-size: .78rem; text-transform: uppercase; letter-spacing: .06em; color: var(--fox); font-weight: 800; margin-bottom: .3rem; }
.goal { margin-bottom: 0; }
.outcome { margin-top: 1.5rem; }
.pager { margin-top: 2rem; }
:deep(.prompt) { white-space: pre-line; }
</style>
