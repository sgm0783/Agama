#!/bin/bash
echo Refreshing binaries from artifacts.supernet.org
echo =========================================
echo Step: Removing old binaries
rm-rf assets/bin/win64 || echo no clean up needed
pwd
[ ! -d assets/bin/win64 ] && \
  mkdir -p assets/bin/win64
cd assets
echo Step: Cloning latest binaries for build
curl "https://artifacts.supernet.org/latest/windows/genkmdconf.bat" -o "bin/win64/genkmdconf.bat"
curl "https://artifacts.supernet.org/latest/windows/libcrypto-1_1.dll" -o "bin/win64/libcrypto-1_1.dll"
curl "https://artifacts.supernet.org/latest/windows/libcurl-4.dll" -o "bin/win64/libcurl-4.dll"
curl "https://artifacts.supernet.org/latest/windows/libcurl.dll" -o "bin/win64/libcurl.dll"
curl "https://artifacts.supernet.org/latest/windows/libgcc_s_sjlj-1.dll" -o "bin/win64/libgcc_s_sjlj-1.dll"
curl "https://artifacts.supernet.org/latest/windows/libnanomsg.dll" -o "bin/win64/libnanomsg.dll"
curl "https://artifacts.supernet.org/latest/windows/libssl-1_1.dll" -o "bin/win64/libssl-1_1.dll"
curl "https://artifacts.supernet.org/latest/windows/libwinpthread-1.dll" -o "bin/win64/libwinpthread-1.dll"
curl "https://artifacts.supernet.org/latest/windows/marketmaker.exe" -o "bin/win64/marketmaker.exe"
curl "https://artifacts.supernet.org/latest/windows/nanomsg.dll" -o "bin/win64/nanomsg.dll"
curl "https://artifacts.supernet.org/latest/windows/pthreadvc2.dll" -o "bin/win64/pthreadvc2.dll"
gsutil cp gs://$BUCKET/$EXECUTABLES/$TRAVIS_BRANCH/$KOMODO_COMPRESSED bin/win64 || gsutil cp gs://$BUCKET/$EXECUTABLES/master/$KOMODO_COMPRESSED bin/win64
unzip bin/win64/$KOMODO_COMPRESSED && rm bin/win64/$KOMODO_COMPRESSED
cp -rvf bin/win64/kmd-cli/komodo* bin/win64/ && rm -rf bin/win64/kmd-cli
cd ..