# "Kitchen Story" video — generation prompt

Replaces `grok-video-*.mp4` in `src/components/VideoStorySection.tsx`.

## Hard constraints (from the component)

The `<video>` is `autoPlay muted loop playsInline` inside an `aspect-video`
(16:9) box with `object-cover`.

| Constraint | Why |
|---|---|
| **16:9, 1920×1080** | `aspect-video` box |
| **No audio / no dialogue** | rendered `muted`; audio is never heard |
| **8–12s, seamless loop** | `loop` — the last frame must flow back into the first |
| **Keep action centre-frame** | `object-cover` crops the edges on narrow viewports |
| **Nothing vital in the bottom-left** | a dark gradient + the "Nidhi kitchen story" chip sit there |
| **Continuous motion in every shot** | the current clip cross-dissolves between stills, which is exactly why it reads as a *slideshow, not a video* |
| **No on-screen text/logos** | the headline is real DOM text beside the video |

## The prompt

> Cinematic macro food cinematography of traditional Indian spices, in a warm
> sunlit village kitchen in Madhya Pradesh. Continuous, unbroken camera
> movement throughout — slow dolly-in and gentle push, never a static frame,
> never a cut to a still image.
>
> Shot 1: whole red Teja chillies, coriander seeds and turmeric roots tumbling
> in slow motion into a weathered brass bowl, dust motes catching a shaft of
> warm afternoon light. Camera pushes slowly in.
>
> Shot 2: a stone mortar and pestle grinding whole spices into fine powder,
> hands of an older Indian woman working in rhythm, fine turmeric dust rising
> and drifting through the light. Camera orbits slowly around the bowl.
>
> Shot 3: a slow-motion pour of deep-red chilli powder into a small mound,
> particles blooming outward, rich saffron-orange and rust-red tones. Camera
> drifts upward and settles, framing back toward the opening composition so the
> clip loops seamlessly.
>
> Colour palette: warm rust red, saffron, deep turmeric gold, earthy brown,
> soft cream. Golden-hour lighting, shallow depth of field, gentle film grain,
> 4K, photorealistic. Handheld micro-movement for life. Transitions are smooth
> camera moves and match-cuts — absolutely no cross-dissolves, no slideshow
> feel, no text or logos on screen.

## Negative prompt

> static shot, still image, slideshow, cross-dissolve, fade between photos,
> frozen frame, text overlay, watermark, logo, subtitles, people looking at
> camera, modern packaging, plastic, cluttered background, cool blue tones,
> harsh flash lighting, distorted hands

## After generating

1. Export **H.264 MP4**, 1920×1080, no audio track, target **< 3 MB** (the
   current asset is 1.4 MB and it autoplays on the homepage — keep it light or
   it hurts LCP on mobile).
2. Drop it in `src/assets/` and update the import in
   `src/components/VideoStorySection.tsx`.
3. Consider adding `poster={...}` to the `<video>` so a still shows before the
   video buffers.

Brand context, if the tool takes it: Nidhi Grah Udyog, a Jain family spice
business founded in 1994 in Barnagar, Ujjain (MP). Known for jeeravan, achar
masala, chilli powder and kasuri methi. AGMARK certified. The story beat is
"generations of expertise, pure ingredients, fresh small batches".
