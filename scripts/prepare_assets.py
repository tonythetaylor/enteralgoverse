"""Rebuild web-optimized assets from the user's source illustrations."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import shutil

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'source-art'
OUT=ROOT/'public'/'assets'
FILES={
'zo':'zo-character-sheet.png', 'algo':'algo-character-sheet.png',
'jay':'jay-character-sheet.png','nia':'nia-character-sheet.png',
'mom':'mom-character-sheet.png','nova':'nova-character-sheet.png',
'cache':'cache-character-sheet.png', 'world':'world-environments-sheet.png',
'worldbible':'world-bible-sheet.png','poster':'the-algorithm-poster.png',
}
def load(name): return Image.open(SRC/FILES[name]).convert('RGB')
def save(im, path, width=None, quality=86):
 path.parent.mkdir(parents=True,exist_ok=True)
 if width and im.width>width:
  h=int(im.height*width/im.width)
  im=im.resize((width,h),Image.Resampling.LANCZOS)
 im.save(path,'WEBP',quality=quality,method=6)
 print(path.relative_to(ROOT), im.size)

def crop_norm(im, r):
 return im.crop(tuple(int(v*s) for v,s in zip(r,[im.width,im.height,im.width,im.height])))

# Main left-hand portraits on the exact sheets (painterly designs, no substitutions).
portrait_box={
 'zo':(.005,.055,.287,.575),
 'algo':(.005,.015,.265,.480),
 'jay':(.005,.045,.390,.547),
 'nia':(.005,.060,.372,.540),
 'mom':(.005,.048,.395,.447),
 'nova':(.005,.010,.270,.440),
 'cache':(.005,.030,.350,.505),
}
for key,box in portrait_box.items():
 im=crop_norm(load(key),box)
 save(im,OUT/'characters'/f'{key}.webp',width=780)

# Keep the original character art intact as full character-sheet gallery images.
for key in ['zo','algo','jay','nia','mom','nova','cache']:
 save(load(key),OUT/'characters'/f'{key}-sheet.webp',width=1300,quality=82)

# Distinct world scenes extracted from the user's world/environment sheet.
world=load('world')
regions={
 'zo-loft':(0.000,0.000,0.500,0.334),
 'algoverse':(0.500,0.000,1.000,0.334),
 'legacy-district':(0.000,0.334,0.500,0.665),
 'compute-heights':(0.500,0.334,1.000,0.665),
 'processing-center':(0.000,0.665,0.500,1.000),
 'cold-storage':(0.500,0.665,1.000,1.000),
}
for key,r in regions.items():
 save(crop_norm(world,r),OUT/'worlds'/f'{key}.webp',width=900)

# The complete reference world bible and canonical poster.
save(load('worldbible'),OUT/'worlds'/'world-bible.webp',width=1600,quality=82)
save(load('poster'),OUT/'brand'/'the-algorithm-poster.webp',width=1024,quality=86)

# Episode cover art is drawn from original licensed/user-supplied art assets.
# These are site placeholders only: swap with real episode stills anytime.
zo=load('zo'); algo=load('algo')
save(crop_norm(zo,(.010,.010,.35,.49)),OUT/'episodes'/'the-resume.webp',width=650)
save(crop_norm(algo,(.010,.010,.33,.48)),OUT/'episodes'/'reconnected.webp',width=650)
save(crop_norm(load('nia'),(.01,.03,.38,.49)),OUT/'episodes'/'future.webp',width=650)
