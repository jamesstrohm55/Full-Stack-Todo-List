# 📝 Todo List Application

A full-stack **Todo List** app where users can manage their daily tasks through a **React + Vite** frontend, a **Node.js** backend API, and **Supabase** for persistent data storage.  
Designed with simplicity, responsiveness, and clean UI in mind.

---

## 🚀 Features
- ✅ **Add Tasks** – Create new tasks with a title, priority (**High / Medium / Low**), and optional due date  
- 📋 **View Tasks** – Display tasks in a neat, responsive list  
- 🔄 **Persistent Data** – Data stored in **Supabase (Postgres)** via a **Node.js REST API**  
- 🧩 **Modern Stack** – Built with **React + Vite**, styled for responsiveness, and tested with **Jest**  
- 📱 **Responsive Design** – Works across desktop and mobile  

---

## 🛠️ Tech Stack
### **Frontend**
- ⚛️ [React](https://react.dev/) – UI library  
- ⚡ [Vite](https://vitejs.dev/) – Build tool for fast dev & production builds  
- 🎨 CSS / Tailwind (optional) – Styling & responsiveness  
- 🧪 [Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/) – Component testing  

### **Backend**
- 🟢 [Node.js](https://nodejs.org/) – Backend runtime  
- 🌐 REST API – Handles requests between frontend & database  

### **Database**
- 🛢️ [Supabase](https://supabase.com/) – Postgres database + authentication & storage  

---

## 📦 Getting Started

### ✅ Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher)  
- [npm](https://www.npmjs.com/) (v6 or higher) or [Yarn](https://yarnpkg.com/)  
- A [Supabase project](https://supabase.com/) with a configured database  

---

### 📥 Installation
Clone the repository:

```bash
git clone https://github.com/your-username/todo-list-frontend.git
cd todo-list-frontend

```
Install dependencies:

```bash
npm install
```

Set up .env:

```env
VITE_API_URL=http://localhost:3000   # Your Node.js backend
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-key
```

##🏃 Available Scripts

#🔧 Run Frontend

```bash
cd todo-list-frontend
npm run dev
```
Frontend runs on: http://localhost:5173

#⚙️ Run Backend (Node.js)

```bash
cd todo-list-backend
node server.js
```
Backend runs on: http://localhost:3000

#🧪 Run Tests

```bash
cd todo-list-frontend
npm test
```

#🗄️ Database (Supabase)

```sql
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  priority text check (priority in ('High', 'Medium', 'Low')),
  due_date date,
  completed boolean default false,
  created_at timestamp default now()
);
```