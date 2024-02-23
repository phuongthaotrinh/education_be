import express from 'express'
import { checkAuthenticated, checkIsHeadmaster } from '../middlewares/authGuard.middleware'
import * as ArticleController from '../controllers/article.controller'
const router = express.Router()

router.post('/article', checkAuthenticated, checkIsHeadmaster, ArticleController.createArticle)
router.patch('/article/:id', checkAuthenticated, checkIsHeadmaster, ArticleController.updateArticle)
router.delete('/article/:id', checkAuthenticated, checkIsHeadmaster, ArticleController.deleteArticle)
router.post('/article/search', checkAuthenticated, ArticleController.searchArticle)
router.get('/article', checkAuthenticated, ArticleController.getAllArticle)
router.get('/article/:id', checkAuthenticated, ArticleController.getArticle)

export default router
