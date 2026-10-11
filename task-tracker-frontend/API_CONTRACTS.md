# Phase 3 and Phase 4 backend contracts

The existing frontend task endpoint currently returns `is_completed`, but does not expose a workflow status or ordering field. The Kanban board sends these fields to the existing task update route and expects them to be persisted:

- `PUT /tasks/{id}` with `{ title, description, category_id, due_date, priority, is_completed, status, position }`
- `status`: `todo | in_progress | review | done`
- `position`: zero-based integer within the status column
- `GET /tasks/` must return `status` and `position` for refresh ordering

The dashboard currently calculates statistics from the authoritative `GET /tasks/` response. A dedicated endpoint can be added later if aggregation should move server-side:

- `GET /dashboard/stats` -> `{ total_tasks, completed_tasks, pending_tasks, overdue_tasks, tasks_by_status, recent_activity }`

Profile UI expects:

- `GET /users/me` -> `{ id, username, email, name, bio, avatar_url, is_admin }`
  - `is_admin` is a boolean used only to show the Admin panel navigation link. The `/admin/users` endpoint remains the authoritative server-side authorization check.
- `PUT /users/me` multipart form fields `name`, `bio`, optional `avatar`

Admin UI expects backend authorization (not client-side role hiding):

- `GET /admin/users` -> an array of `{ id, username, email, name, is_active, is_admin, created_at }`
- `401` redirects to login; `403` renders an access-denied state
- Optional supported mutations: `PATCH /admin/users/{id}` for `{ is_active }`, `DELETE /admin/users/{id}`

The frontend does not fabricate successful responses for missing endpoints; it surfaces the API error to the user.
