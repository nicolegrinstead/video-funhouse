
echo "Trying to emcc"

cd ffmpeg

emcc -s VERBOSE=1 -s ALLOW_MEMORY_GROWTH=1 -v libavutil/*.o libavcodec/*.o libavformat/*.o libavdevice/*.o libswresample/*.o libavfilter/*.o libswscale/*.o *.o -o ../ffmpeg.js --pre-js ../ffmpeg_pre.js --post-js ../ffmpeg_post.js

cd ../

echo "Done"