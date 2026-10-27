<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useApp } from '../stores/app'

const app = useApp()
const route = useRoute()
const router = useRouter()
const token = ref('')
const busy = ref(false)
const error = ref('')

async function submit() {
  if (!token.value.trim() || busy.value) return
  busy.value = true
  error.value = ''
  try {
    const r = await fetch('/api/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: token.value }) })
    const j = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string }
    if (!j.ok) { error.value = j.error ?? '密码不正确，请重试。'; return }
    app.authed = true
    token.value = ''
    const next = typeof route.query.next === 'string' && route.query.next.startsWith('/') ? route.query.next : '/'
    router.replace(next)
  } catch {
    error.value = '网络无法连接服务器，请稍后重试。'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="wrap login">
    <div class="kon" aria-hidden="true">
      <img src="/fox/sign.webp" alt="" />
      <span class="board">Members<br />only!</span>
    </div>
    <form class="surface box" @submit.prevent="submit">
      <h1>访问验证 · Sign in</h1>
      <p class="muted">Sim4It 知识基地需要访问密码，请输入你的访问口令后选择角色与课题。</p>
      <label for="access-token">访问密码 / Access token</label>
      <input id="access-token" v-model="token" type="password" autocomplete="current-password" placeholder="请输入访问密码…" spellcheck="false" required />
      <p v-if="error" class="err" role="alert">{{ error }}</p>
      <button class="btn primary" :disabled="busy || !token.trim()">{{ busy ? '验证中…' : '进入基地 · Sign in' }}</button>
    </form>
  </div>
</template>

<style scoped>
.login { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 2rem 3rem; padding-top: 3rem; }
.kon { position: relative; width: 190px; flex: none; transform: rotate(-3deg); }
.kon img { width: 100%; display: block; filter: drop-shadow(2px 0 0 #fff) drop-shadow(-2px 0 0 #fff) drop-shadow(0 2px 0 #fff) drop-shadow(0 -2px 0 #fff) drop-shadow(3px 4px 0 rgb(26 23 18 / .18)); }
.board { position: absolute; left: 10%; right: 10%; top: 7%; height: 24%; display: grid; place-items: center; text-align: center; font-family: var(--display); font-size: 1.35rem; line-height: 1.05; color: var(--fox); transform: rotate(-2deg); }
.box { width: min(400px, 100%); display: grid; gap: .6rem; }
h1 { font-size: 1.65rem; }
label { font-weight: 800; }
.err { color: var(--put); margin: 0; font-weight: 700; }
</style>
