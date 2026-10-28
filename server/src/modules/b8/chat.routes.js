import { Router } from 'express';
import { requireRole } from './b8.middleware.js';
import * as c from './chat.controller.js';

const router = Router();
const chatters = requireRole('teacher', 'parent');

router.get('/chats', chatters, c.listContacts); // UC-17, UC-26 (langkah 1-2)
router.get('/chats/:counterpartId', chatters, c.getConversation); // langkah 3-5
router.post('/chats/:counterpartId', chatters, c.sendMessage); // langkah 6-10

export default router;