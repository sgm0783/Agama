npm install
electron-packager . --platform=darwin --arch=x64 --icon=assets/icons/agama_icons/agama_app_icon.icns --out=build/ --buildVersion=0.2 --ignore=assets/bin/win64 --ignore=assets/bin/linux64 --overwrite
build/Agama-darwin-x64/Agama.app/Contents/MacOS/Agama
