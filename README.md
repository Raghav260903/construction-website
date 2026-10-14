# Bharath Constructions – Website

All files in ONE folder:
index.html, style.css, main.js, photos.js, vr.js  + rooms/ folder

## Folder
website/   (everything in one folder)
  index.html  style.css  main.js  photos.js  vr.js
  exterior.png   exterior-mask.png
  livingroom.png  livingroom-mask.png
  dining.png     dining-mask.png
  kitchen.png    kitchen-mask.png
  bedroom.png    bedroom-mask.png
(Prefer a sub-folder? put the photos in rooms/ and set  FOLDER = 'rooms/'  at the top of photos.js)

## Real Photos tab (visitors)
Visitors only choose a room and a wall colour. They cannot upload or replace photos.
Rooms without a photo are hidden automatically.

## Make the wall masks ONCE (admin mode)
1. Open  http://127.0.0.1:5500/index.html?admin
2. Pick a room -> "Select walls" -> click the wall (Wand). Brush/Eraser for touch-ups. Shift+click removes.
3. Press "Download wall mask" and put the downloaded  <room>-mask.png  in the same folder as the photos.
4. Repeat for each room. Visitors never see the admin tools (they open normal index.html).

## Settings (top of photos.js)
EXT = 'png'  (change to 'jpg' or 'webp' if you use those)   ROOMS = list of rooms   PALETTE = colours

## Speed
- 3D engine loads only when the 3D tab is opened.
- Compress room photos (squoosh.app / tinypng.com), width about 1600px. A good room photo should be under 400 KB.
- Large photos are the main reason for slow loading.

## Colour change in real photos
No mask needed: visitor picks a colour, then clicks a wall in the photo. Optional: put `<room>-mask.png` (made via `index.html?admin`) next to the photo for an exact, fixed wall selection.

## Booking form -> WhatsApp
Open main.js and set  WA_NUMBER  (country code + number, e.g. 919876543210). After 'Confirm my slot' the visitor is sent to WhatsApp in about 1.5 seconds with the form details filled in.

## 3D walkthrough colours
Every room has two paint targets (buttons above the colour dots): Walls + Ceiling. Exterior: Walls + Roof edge. Sit-out: Pillars + Ceiling. Terrace: Parapet + Terrace floor.
