#!/bin/bash
cd assets
echo Step: Cloning latest binaries for build
tar -xzf bin/linux64/$KOMODO_COMPRESSED && rm bin/linux64/$KOMODO_COMPRESSED
rm bin/linux/verus-cli/verusd
rm bin/linux/verus-cli/verus
rm bin/linux/verus-cli/README.txt
cp -rvf bin/linux64/verus-cli bin/linux64 && rm -rf bin/linux64/verus-cli
cd ..