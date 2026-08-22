@echo off
cd frontend
start cmd /k npm run dev
cd ..
cd backend
start cmd /k npm run dev