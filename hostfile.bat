@echo off

SET NEWLINE=^& echo.

FIND /C /I "buddy19.local" %WINDIR%\system32\drivers\etc\hosts
IF %ERRORLEVEL% NEQ 0 ECHO %NEWLINE%^127.0.0.1:3000 buddy19.local>>%WINDIR%\System32\drivers\etc\hosts
