# MalaBook Avatar Generation Prompts

Generate one image per user. Save the result as `public/avatars/{user_id}.png` and update the `avatar` field in `users.json` to `/avatars/{user_id}.png`.

**Output settings**
- Model: `gpt-image-1`
- Size: 1024×1024
- Quality: standard (`medium`)
- Background: solid cream (rendered in prompt — do **not** use transparent)

**Style is locked across all 10.** Only the bolded "subject" line changes per user. If any image comes out off-style, regenerate that single prompt — don't tweak the locked portion.

---

## Locked style preamble (identical in every prompt)

> Modern 3D character portrait, head-and-shoulders, looking at camera, soft cinematic lighting, warm color grading, slight friendly smile, shallow depth of field, solid cream background (#FFF7ED), square 1:1 composition, centered subject, clean and polished, dating-app profile photo aesthetic.

---

## u_001 — Wei Lin (27, dry · L5 · loud-group · "Da la or go home")

```
Modern 3D character portrait, head-and-shoulders, looking at camera, soft cinematic lighting, warm color grading, slight friendly smile, shallow depth of field, solid cream background (#FFF7ED), square 1:1 composition, centered subject, clean and polished, dating-app profile photo aesthetic. Subject: 27-year-old Singaporean Chinese woman, shoulder-length straight black hair tucked behind one ear, small gold hoop earrings, confident raised-eyebrow expression with a knowing smirk, simple black tee.
```

## u_002 — Joanne Tan (24, soup · L2 · intimate-booth · "Soup girl, collagen broth")

```
Modern 3D character portrait, head-and-shoulders, looking at camera, soft cinematic lighting, warm color grading, slight friendly smile, shallow depth of field, solid cream background (#FFF7ED), square 1:1 composition, centered subject, clean and polished, dating-app profile photo aesthetic. Subject: 24-year-old Singaporean Chinese woman, long straight black hair with curtain bangs, soft warm gentle smile, dewy skin, oversized cream-colored cardigan, cozy and approachable.
```

## u_003 — Marcus Lim (31, both · L3 · casual · "Engineer who optimizes meat-to-veg")

```
Modern 3D character portrait, head-and-shoulders, looking at camera, soft cinematic lighting, warm color grading, slight friendly smile, shallow depth of field, solid cream background (#FFF7ED), square 1:1 composition, centered subject, clean and polished, dating-app profile photo aesthetic. Subject: 31-year-old Singaporean Chinese man, short neat black hair, thin-rimmed glasses, subtle thoughtful smile, smart-casual charcoal henley, calm and analytical demeanor.
```

## u_004 — Priya Chen (29, soup · L1 · intimate-booth · "Tomato broth supremacist")

```
Modern 3D character portrait, head-and-shoulders, looking at camera, soft cinematic lighting, warm color grading, slight friendly smile, shallow depth of field, solid cream background (#FFF7ED), square 1:1 composition, centered subject, clean and polished, dating-app profile photo aesthetic. Subject: 29-year-old Singaporean woman of mixed Indian and Chinese heritage, long wavy dark brown hair, warm radiant smile, small delicate gold nose stud, simple terracotta-toned blouse, gentle and inviting energy.
```

## u_005 — Zhi Hao (26, dry · L4 · loud-group · "Sichuan native, peppercorn buzz")

```
Modern 3D character portrait, head-and-shoulders, looking at camera, soft cinematic lighting, warm color grading, slight friendly smile, shallow depth of field, solid cream background (#FFF7ED), square 1:1 composition, centered subject, clean and polished, dating-app profile photo aesthetic. Subject: 26-year-old Chinese man from Sichuan, slightly messy modern short black hair, confident playful smirk, faint stubble, casual dark grey crewneck, intense and adventurous vibe.
```

## u_006 — Sarah Ong (25, both · L2 · casual · "Vegetarian mala convert")

```
Modern 3D character portrait, head-and-shoulders, looking at camera, soft cinematic lighting, warm color grading, slight friendly smile, shallow depth of field, solid cream background (#FFF7ED), square 1:1 composition, centered subject, clean and polished, dating-app profile photo aesthetic. Subject: 25-year-old Singaporean Chinese woman, chin-length bob with subtle caramel highlights, natural radiant smile, delicate thin gold chain necklace, soft sage-green linen top, wholesome and grounded look.
```

## u_007 — Daniel Koh (33, dry · L4 · casual · "Late-night supper guy in Kovan")

```
Modern 3D character portrait, head-and-shoulders, looking at camera, soft cinematic lighting, warm color grading, slight friendly smile, shallow depth of field, solid cream background (#FFF7ED), square 1:1 composition, centered subject, clean and polished, dating-app profile photo aesthetic. Subject: 33-year-old Singaporean Chinese man, short slightly mussed black hair, light stubble, lopsided tired-but-charming smile, faint under-eye softness, faded black graphic tee, easy-going late-night-eats personality.
```

## u_008 — Mei Xin (28, soup · L3 · intimate-booth · "Half-and-half splitter")

```
Modern 3D character portrait, head-and-shoulders, looking at camera, soft cinematic lighting, warm color grading, slight friendly smile, shallow depth of field, solid cream background (#FFF7ED), square 1:1 composition, centered subject, clean and polished, dating-app profile photo aesthetic. Subject: 28-year-old Singaporean Chinese woman, sleek shoulder-length black hair with side part, thoughtful elegant half-smile, single small pearl earring visible, refined cream silk blouse, calm and balanced presence.
```

## u_009 — Aiden Goh (30, soup · L5 · loud-group · "Duck blood without flinching")

```
Modern 3D character portrait, head-and-shoulders, looking at camera, soft cinematic lighting, warm color grading, slight friendly smile, shallow depth of field, solid cream background (#FFF7ED), square 1:1 composition, centered subject, clean and polished, dating-app profile photo aesthetic. Subject: 30-year-old Singaporean Chinese man, modern textured short black hair, strong jawline, bold confident closed-mouth smile with a glint in the eye, casual unbuttoned olive linen shirt over a white tee, fearless adventurous vibe.
```

## u_010 — Rachel Yeo (23, both · L2 · intimate-booth · "First-time mala-er, brave xiao la")

```
Modern 3D character portrait, head-and-shoulders, looking at camera, soft cinematic lighting, warm color grading, slight friendly smile, shallow depth of field, solid cream background (#FFF7ED), square 1:1 composition, centered subject, clean and polished, dating-app profile photo aesthetic. Subject: 23-year-old Singaporean Chinese woman, long wavy black hair with soft side-swept fringe, bright eyes, big enthusiastic open smile, simple white tee, youthful earnest and hopeful energy.
```

---

## Quick post-gen checklist

- [ ] Save as `public/avatars/u_001.png` … `u_010.png`
- [ ] Update each user's `avatar` field in `users.json` from the DiceBear URL to `/avatars/{id}.png`
- [ ] Quick visual check: lay all 10 thumbnails side-by-side. Any that drift in style (different lighting, different bg color, photoreal slip) → regenerate just that one.
- [ ] If 2+ are off-style, the locked preamble may be getting dropped — regenerate with the locked block at both the start *and* end of the prompt.
