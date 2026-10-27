import { createRouter, createWebHistory } from 'vue-router'
import { useApp } from './stores/app'
import { PERSONAS, usePersonaNexus, type PersonaId } from './domains/topics'
import type { DomainId } from '../shared/types'

const VALID_DOMAINS: DomainId[] = ['options', 'director', 'comics']
const VALID_PERSONAS: PersonaId[] = ['J', 'S', 'T', 'D']

export const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    { path: '/', component: () => import('./views/Landing.vue') },
    { path: '/journey', component: () => import('./views/Journey.vue') },
    { path: '/options', redirect: () => { useApp().setDomain('options'); return '/journey' } },
    { path: '/director', redirect: () => { useApp().setDomain('director'); return '/journey' } },
    { path: '/comics', redirect: () => { useApp().setDomain('comics'); return '/journey' } },
    { path: '/quest/:level/:idx', component: () => import('./views/Quest.vue'), props: true },
    { path: '/cards', component: () => import('./views/Cards.vue') },
    { path: '/map', component: () => import('./views/TermMap.vue') },
    { path: '/moments', component: () => import('./views/Moments.vue') },
    { path: '/moments/:id/:cp', component: () => import('./views/Moment.vue') },
    { path: '/scenes', component: () => import('./views/Scenes.vue') },
    { path: '/scenes/:id', component: () => import('./views/Scene.vue') },
    { path: '/sim', component: () => import('./views/Lab.vue') },
    { path: '/lab', redirect: '/sim' },
    { path: '/sources', component: () => import('./views/Sources.vue') },
    { path: '/gallery', component: () => import('./views/Gallery.vue') },
    { path: '/settings', component: () => import('./views/Settings.vue') },
    { path: '/login', redirect: '/' },
    { path: '/:rest(.*)*', component: () => import('./views/NotFound.vue') },
  ],
})

router.beforeEach(async (to) => {
  const app = useApp()
  // No login gate required: Sim4It acts as an open 4-Persona (J/S/T/D) & 4-Subject resource hub
  app.authed = true

  const qPersona = typeof to.query.persona === 'string' ? (to.query.persona.toUpperCase() as PersonaId) : null
  if (qPersona && VALID_PERSONAS.includes(qPersona)) {
    const nexus = usePersonaNexus()
    nexus.setPersona(qPersona)
    if (!to.query.domain) {
      app.setDomain(PERSONAS[qPersona].defaultDomain)
    }
  }

  if (typeof to.query.domain === 'string' && VALID_DOMAINS.includes(to.query.domain as DomainId)) {
    app.setDomain(to.query.domain as DomainId)
  }
})
