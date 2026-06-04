# CRM Programming School — API

Backend на NestJS + TypeORM + MySQL для CRM заявок та менеджерів.

## Вимоги

- Node.js 18+
- MySQL (локально або хмарна БД за ТЗ: http://owu.linkpc.net/mysql)

## Встановлення

```bash
cd api
npm install
```

## Налаштування

1. Скопіюйте `.env.example` у `.env`:
   ```bash
   cp .env.example .env
   ```
2. Вкажіть у `.env` параметри підключення до MySQL (`DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`).

## Запуск

```bash
# Режим розробки
npm run start:dev

# Збірка та продакшн
npm run build
npm run start:prod
```

Сервер за замовчуванням: **http://localhost:5000**

## Документація API

- Опис ендпоінтів — у цьому README та в колекції Postman.
- Опційно: встановіть `@nestjs/swagger` і підключіть Swagger у `main.ts` — документація буде доступна за адресою `/api/docs`.

## Postman

У репозиторії є колекція для Postman:

- Файл: **postman/CRM-API.postman_collection.json**

Імпортуйте її в Postman. Для захищених ендпоінтів спочатку виконайте **Auth → Login** (admin@gmail.com / admin), потім у змінній колекції збережеться `access_token` і його можна використовувати в Bearer для інших запитів.

## Дефолтний адмін

Після першого запуску створюється користувач:

- **Email:** admin@gmail.com  
- **Password:** admin  

(Пароль збережено як bcrypt hash у БД.)

## Основні ендпоінти

| Метод | Шлях | Опис |
|-------|------|------|
| POST | /auth/login | Логін (email, password) |
| GET | /auth/me | Поточний користувач (Bearer) |
| POST | /auth/set-password | Встановити пароль за токеном активації/відновлення |
| GET | /courses | Список курсів |
| GET | /course-formats | Формати курсів |
| GET | /course-types | Типи курсів |
| GET | /statuses | Статуси |
| GET/POST | /groups | Список груп / створити групу |
| GET | /orders | Заявки (пагінація, сортування, фільтри) |
| GET | /orders/export | Експорт заявок у Excel |
| GET | /orders/:id | Одна заявка (з коментарями) |
| PATCH | /orders/:id | Оновити заявку |
| GET | /orders/:id/comments | Коментарі заявки |
| POST | /orders/:id/comments | Додати коментар (призначити себе менеджером) |
| GET | /admin/managers | Список менеджерів (пагінація, тільки admin) |
| POST | /admin/managers | Створити менеджера |
| GET | /admin/stats | Статистика по статусах |
| GET | /admin/managers/:id/stats | Статистика по менеджеру |
| POST | /admin/managers/:id/activate | Посилання для активації |
| POST | /admin/managers/:id/recovery | Посилання для відновлення пароля |
| POST | /admin/managers/:id/ban | Заблокувати |
| POST | /admin/managers/:id/unban | Розблокувати |

## Схема БД

Таблиці: `users`, `courses`, `course_formats`, `course_types`, `statuses`, `groups_table`, `orders`, `comments`.  
При першому запуску `synchronize: true` створить таблиці; для продакшну варто вимкнути і використовувати міграції або імпорт дампа за ТЗ.
