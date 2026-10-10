#!/bin/sh
# uso: crop.sh entrada.mp4 saida.mp4  (recorta a faixa da foto no quadro 720x1280, sem áudio)
ffmpeg -v error -y -i "$1" -an -vf "crop=720:818:0:231" -c:v libx264 -crf 24 -preset slow -pix_fmt yuv420p -movflags +faststart "$2"
