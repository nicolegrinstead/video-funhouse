
echo "Trying to make"

cd ffmpeg

make clean;
emmake make;

cd ../

echo "Done"