#!/bin/bash
echo Refreshing binaries from artifacts.supernet.org
echo =========================================
echo Step: Removing old binaries
rm -rf assets/bin/osx || echo no clean up needed
pwd
[ ! -d assets/bin/osx ] && \
  mkdir -p assets/bin/osx
cd assets
echo Step: Cloning latest binaries for build
curl "https://artifacts.supernet.org/latest/osx/libgcc_s.1.dylib" -o "bin/osx/libgcc_s.1.dylib"
curl "https://artifacts.supernet.org/latest/osx/libgomp.1.dylib" -o "bin/osx/libgomp.1.dylib"
curl "https://artifacts.supernet.org/latest/osx/libnanomsg.5.0.0.dylib" -o "bin/osx/libnanomsg.5.0.0.dylib"
curl "https://artifacts.supernet.org/latest/osx/libstdc%2B%2B.6.dylib" -o "bin/osx/libstdc++.6.dylib"
tar -xzf bin/osx/$KOMODO_COMPRESSED && rm bin/osx/$KOMODO_COMPRESSED
cp -rvf bin/osx/verus-cli/komodo* bin/osx/ && rm -rf bin/osx/verus-cli
chmod -R +x bin/osx
cd ..
echo Moving legacy libs to assets/bin
wget https://supernetorg.bintray.com/misc/libs_legacy_osx.zip
checksum=`shasum -a 256 libs_legacy_osx.zip | awk '{ print $1 }'`
if [ "$checksum" = "e9474aa243694a2d4c87fccc443e4b16a9a5172a24da76af9e5ecddd006649bb" ]; then
    echo "Checksum is correct."
    unzip libs_legacy_osx.zip
    cp -rvf libs_legacy_osx/* assets/bin/osx/.
  else
    echo "Checksum is incorrect!"
    exit 0
fi
