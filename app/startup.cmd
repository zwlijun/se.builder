@echo on
@title SE.Builder - 0.1.3

set BAT_PATH=%~dp0
set SBIN_PATH=%BAT_PATH%\\sbin
set path=%path%;%SBIN_PATH%

node startup.js

@pause