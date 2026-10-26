<script setup lang="ts">
import { computed } from 'vue'
import { GLOBAL_TERM_MAP, useDomainPack } from '../lib/content'

const props = defineProps<{
  center?: string
  focusId?: string | null
  category?: string
  query?: string
  height?: number
}>()
const emit = defineEmits<{
  pick: [id: string]
  select: [id: string]
}>()
const pack = useDomainPack()

function onNodeClick(id: string) {
  emit('pick', id)
  emit('select', id)
}

const activeCenter = computed(() => {
  if (props.center && GLOBAL_TERM_MAP[props.center]) return props.center
  if (props.focusId && GLOBAL_TERM_MAP[props.focusId]) return props.focusId
  const q = props.query?.trim().toLowerCase()
  const pool = pack.value.terms.filter((t) => {
    if (props.category && props.category !== 'all' && t.cat !== props.category) return false
    if (!q) return true
    return `${t.name} ${t.zh ?? ''} ${t.ja ?? ''} ${t.short}`.toLowerCase().includes(q)
  })
  return pool[0]?.id ?? pack.value.terms[0]?.id ?? 'call'
})

const W = 640
const H = computed(() => props.height || 440)
const cx = W / 2
const cy = computed(() => H.value / 2)

const graph = computed(() => {
  const c = GLOBAL_TERM_MAP[activeCenter.value]
  if (!c) return { nodes: [], edges: [] }
  const domainTerms = pack.value.terms
  const r1 = Array.from(new Set([...c.related, ...domainTerms.filter((t) => t.related.includes(c.id)).map((t) => t.id)])).filter((id) => GLOBAL_TERM_MAP[id] && id !== c.id).slice(0, 10)
  const r2 = Array.from(new Set(r1.flatMap((id) => GLOBAL_TERM_MAP[id]?.related || []))).filter((id) => GLOBAL_TERM_MAP[id] && id !== c.id && !r1.includes(id)).slice(0, 14)
  const place = (ids: string[], R: number, off = 0) => ids.map((id, k) => ({ id, x: cx + R * Math.cos((2 * Math.PI * k) / Math.max(ids.length, 1) + off), y: cy.value + R * 0.78 * Math.sin((2 * Math.PI * k) / Math.max(ids.length, 1) + off), ring: R }))
  const nodes = [{ id: c.id, x: cx, y: cy.value, ring: 0 }, ...place(r1, 140), ...place(r2, 255, 0.2)]
  const pos = Object.fromEntries(nodes.map((n) => [n.id, n]))
  const edges: [string, string][] = []
  for (const n of nodes) for (const r of GLOBAL_TERM_MAP[n.id]?.related || []) if (pos[r] && n.id < r) edges.push([n.id, r])
  for (const n of nodes) for (const r of GLOBAL_TERM_MAP[n.id]?.related || []) if (pos[r] && n.id > r && !(GLOBAL_TERM_MAP[r]?.related || []).includes(n.id)) edges.push([n.id, r])
  return { nodes, edges: edges.map(([a, b]) => ({ a: pos[a], b: pos[b], hot: a === c.id || b === c.id })) }
})
</script>

<template>
  <svg :viewBox="`0 0 ${W} ${H}`" role="img" :aria-label="`Knowledge map around ${GLOBAL_TERM_MAP[activeCenter]?.name}`">
    <line v-for="(e, k) in graph.edges" :key="k" :x1="e.a.x" :y1="e.a.y" :x2="e.b.x" :y2="e.b.y" :stroke="e.hot ? 'var(--teal)' : 'var(--line)'" :stroke-width="e.hot ? 2 : 1.2" />
    <g v-for="n in graph.nodes" :key="n.id" class="node" :class="{ center: n.ring === 0 }" tabindex="0" role="button"
      :aria-label="GLOBAL_TERM_MAP[n.id]?.name" @click="onNodeClick(n.id)" @keydown.enter="onNodeClick(n.id)">
      <circle :cx="n.x" :cy="n.y" :r="n.ring === 0 ? 12 : n.ring < 200 ? 7 : 5" :fill="n.ring === 0 ? 'var(--fox)' : n.ring < 200 ? 'var(--pop)' : 'var(--panel)'" stroke="var(--edge)" stroke-width="2" />
      <text :x="n.x" :y="n.y - 15" text-anchor="middle" :font-size="n.ring === 0 ? 16 : n.ring < 200 ? 12.5 : 10.5" :font-weight="n.ring === 0 ? 800 : 700" :fill="n.ring > 200 ? 'var(--muted)' : 'var(--paper)'">{{ GLOBAL_TERM_MAP[n.id]?.name }}</text>
    </g>
  </svg>
</template>

<style scoped>
svg { width: 100%; height: auto; display: block; }
.node { cursor: pointer; outline: none; }
.node text { paint-order: stroke; stroke: var(--panel); stroke-width: 4px; }
.node:hover circle, .node:focus-visible circle { stroke: var(--teal); stroke-width: 3.5; }
.node:focus-visible text { text-decoration: underline; }
</style>
