
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "dbname": "smart_todo",
    "user": "postgres",
    "password": "sak1234"
}

class TaskCreate(BaseModel):
    title: str

@app.get("/")
def home():
    return {"message": "Smart To-Do List API is running!"}

@app.get("/tasks")
def get_tasks():
    with psycopg.connect(**DB_CONFIG) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id, title, completed, created_at FROM tasks ORDER BY id"
            )
            rows = cur.fetchall()

    return {
        "tasks": [
            {
                "id": row[0],
                "title": row[1],
                "completed": row[2],
                "created_at": row[3]
            }
            for row in rows
        ]
    }

@app.post("/tasks")
def create_task(task: TaskCreate):
    with psycopg.connect(**DB_CONFIG) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "INSERT INTO tasks (title) VALUES (%s) RETURNING id, title, completed, created_at",
                (task.title,)
            )
            row = cur.fetchone()

    return {
        "id": row[0],
        "title": row[1],
        "completed": row[2],
        "created_at": row[3]
    }

@app.put("/tasks/{task_id}")
def update_task(task_id: int):
    with psycopg.connect(**DB_CONFIG) as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE tasks
                SET completed = NOT completed
                WHERE id = %s
                RETURNING id, title, completed, created_at
                """,
                (task_id,)
            )
            row = cur.fetchone()

            if row is None:
                from fastapi import HTTPException
                raise HTTPException(status_code=404, detail="Task not found")

    return {
        "id": row[0],
        "title": row[1],
        "completed": row[2],
        "created_at": row[3]
    }


@app.delete("/tasks/{task_id}")
def remove_task(task_id: int):
    with psycopg.connect(**DB_CONFIG) as conn:
        with conn.cursor() as cur:
            cur.execute(
                "DELETE FROM tasks WHERE id = %s RETURNING id",
                (task_id,)
            )
            deleted = cur.fetchone()

            if deleted is None:
                from fastapi import HTTPException
                raise HTTPException(status_code=404, detail="Task not found")

    return {"message": "Task deleted successfully"}

