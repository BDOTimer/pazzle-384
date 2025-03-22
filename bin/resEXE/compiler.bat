@echo off

chcp 65001>nul

SET path=C:\!CB-2025\mingw64\bin
::set path=C:\WORKCB-2024\mingw64\bin

if exist "%path%\." (

	echo Указанный путь существует...
	echo %path%\c++ -c -o out.o allRes.cpp
	echo %path%\ar rcs libres.a out.o

	%path%\c++ -c -o out.o allRes.cpp
	%path%\ar rcs libres.a out.o

) else (
	echo ОШИБКА! ЗАДАЙТЕ ПРАВИЛЬНО ПУТЬ К ВАШЕМУ КОМПИЛЯТОРУ!
)


pause