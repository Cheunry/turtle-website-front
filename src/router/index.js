import { createRouter, createWebHashHistory } from 'vue-router'
import { getToken, isTokenExpired } from '@/utils/auth'
import { ElMessage } from 'element-plus'

const router = createRouter({
  // createWebHistory 路由模式路径不带#号(生产环境下不能直接访问项目，需要 nginx 转发)
  // createWebHashHistory 路由模式路径带#号
  history: createWebHashHistory(), 
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/views/Home')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/Register')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login')
    },
    {
      path: '/feadback',
      name: 'feadback',
      component: () => import('@/views/FeadBack')
    },
    {
      path: '/bookclass',
      name: 'bookclass',
      component: () => import('@/views/BookClass')
    },
    {
      path: '/book_rank',
      name: 'bookRank',
      component: () => import('@/views/BookRank')
    },
    {
      path: '/bookshelf',
      name: 'bookshelf',
      component: () => import('@/views/Bookshelf'),
      meta: { requiresAuth: true }
    },
    {
      path: '/book/:id',
      name: 'book',
      component: () => import('@/views/Book')
	   
    },
    {
      path: '/chapter_list/:bookId',
      name: 'chapterList',
      component: () => import('@/views/ChapterList')
	   
    },
    {
      path: '/book/:id/:chapterNum',
      name: 'bookContent',
      component: () => import('@/views/BookContent')
	   
    },
    {
      path: '/user/setup',
      name: 'userSetup',
      component: () => import('@/views/UserSetup'),
      meta: { requiresAuth: true }
    },
    {
      path: '/user/message',
      name: 'userMessage',
      component: () => import('@/views/UserMessage'),
      meta: { requiresAuth: true }
    },
    {
      path: '/author/register',
      name: 'authorRegister',
      component: () => import('@/views/author/Register'),
      meta: { requiresAuth: true }
    },
    {
      path: '/author/book_list',
      name: 'authorBookList',
      component: () => import('@/views/author/BookList'),
      meta: { requiresAuth: true }
    },
    {
      path: '/author/book_add',
      name: 'authorBookAdd',
      component: () => import('@/views/author/BookAdd'),
      meta: { requiresAuth: true }
    },
    {
      path: '/author/book_edit/:id',
      name: 'authorBookEdit',
      component: () => import('@/views/author/BookEdit'),
      meta: { requiresAuth: true }
    },
    {
      path: '/author/chapter_list',
      name: 'authorChapterList',
      component: () => import('@/views/author/ChapterList'),
      meta: { requiresAuth: true }
    },
    {
      path: '/author/chapter_add',
      name: 'authorChapterAdd',
      component: () => import('@/views/author/ChapterAdd'),
      meta: { requiresAuth: true }
    },
    {
      path: '/author/chapter_update',
      name: 'authorChapterUpdate',
      component: () => import('@/views/author/ChapterUpdate'),
      meta: { requiresAuth: true }
    },
    {
      path: '/author/message',
      name: 'authorMessage',
      component: () => import('@/views/author/Message'),
      meta: { requiresAuth: true }
    },
    {
      path: '/author/recharge',
      name: 'authorRecharge',
      component: () => import('@/views/author/Recharge'),
      meta: { requiresAuth: true }
    }
  ]
})

// 路由守卫：检查需要认证的路由
router.beforeEach((to, from, next) => {
  // 检查路由是否需要认证
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  if (requiresAuth) {
    const token = getToken()
    
    // 检查Token是否存在
    if (!token) {
      ElMessage.warning('请先登录')
      next({ 
        name: 'login', 
        query: { redirect: to.fullPath } 
      })
      return
    }
    
    // 检查Token是否过期
    if (isTokenExpired()) {
      ElMessage.warning('登录已过期，请重新登录')
      next({ 
        name: 'login', 
        query: { redirect: to.fullPath } 
      })
      return
    }
  }
  
  next()
})

// 解决 vue 中路由跳转时，总是从新页面中间开始显示
router.afterEach((to, from) => {
  window.scrollTo(0, 0)
})

export default router