import { createRouter, createWebHistory } from 'vue-router'
import { useApp } from './stores/app'
import type { DomainId } from '../shared/types'

const VALID_DOMAINS: DomainId[] = ['options', 'director', 'comics']

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
    { path: '/login', component: () => import('./views/Login.vue') },
    { path: '/:rest(.*)*', component: () => import('./views/NotFound.vue') },
  ],
})

router.beforeEach(async (to) => {
  const app = useApp()
  if (typeof to.query.domain === 'string' && VALID_DOMAINS.includes(to.query.domain as DomainId)) {
    app.setDomain(to.query.domain as DomainId)
  }
  if (app.authed === null) {
    app.authed = await fetch('/api/session').then((r) => r.json()).then((j: any) => !!j.ok).catch(() => true)
  }
  if (!app.authed && to.path !== '/login') return { path: '/login', query: to.fullPath === '/' ? {} : { next: to.fullPath } }
  if (app.authed && to.path === '/login') return '/'
})
