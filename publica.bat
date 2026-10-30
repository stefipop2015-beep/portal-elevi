@echo off
chcp 65001 >nul
cd /d "D:\01.WorkspaceCLAUDE\Portal-Elevi"

echo ===================================================
echo [1/3] Indexare modificari locale...
echo ===================================================
git --git-dir="C:\git\portal-elevi.git" --work-tree="." add .

echo ===================================================
echo [2/3] Salvare commit...
echo ===================================================
set /p msg="Introdu mesajul modificarii (sau apasa Enter pentru mesaj implicit): "
if "%msg%"=="" set msg=Actualizare design si resurse portal elevi

git --git-dir="C:\git\portal-elevi.git" --work-tree="." commit -m "%msg%"

echo ===================================================
echo [3/3] Trimitere automata pe GitHub Pages...
echo ===================================================
git --git-dir="C:\git\portal-elevi.git" --work-tree="." push origin main

echo.
echo ===================================================
echo Finalizat cu succes! Portalul este actualizat online:
echo https://stefipop2015-beep.github.io/portal-elevi/
echo ===================================================
pause
