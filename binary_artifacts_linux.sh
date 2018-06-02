#!/bin/bash
cd assets
echo Step: Cloning latest binaries for build
tar -xzf bin/linux64/$KOMODO_COMPRESSED && rm bin/linux64/$KOMODO_COMPRESSED
cp -rvf bin/linux64/verus-cli/komodo* bin/linux64/ && rm -rf bin/linux64/verus-cli
cd ..