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

## u_011 — Nur Aisyah (26, soup · L3 · intimate-booth · "Halal mala convert")

```
Modern 3D character portrait, head-and-shoulders, looking at camera, soft cinematic lighting, warm color grading, slight friendly smile, shallow depth of field, solid cream background (#FFF7ED), square 1:1 composition, centered subject, clean and polished, dating-app profile photo aesthetic. Subject: 26-year-old Singaporean Malay woman wearing a softly draped sage-green hijab with a subtle textured pattern, warm radiant smile with gentle dimples, minimal natural makeup, simple cream-toned blouse, friendly inviting energy.
```

## u_012 — Vikram Raj (38, dry · L5 · loud-group · "Tamil engineer, masala-to-málà")

```
Modern 3D character portrait, head-and-shoulders, looking at camera, soft cinematic lighting, warm color grading, slight friendly smile, shallow depth of field, solid cream background (#FFF7ED), square 1:1 composition, centered subject, clean and polished, dating-app profile photo aesthetic. Subject: 38-year-old Singaporean Tamil Indian man, short tidy black hair with hints of grey at the temples, neatly trimmed beard, confident closed-mouth smile with crow's-feet around the eyes, slim-fit charcoal button-down shirt, calm seasoned-engineer vibe.
```

## u_013 — Jules Tan (28, both · L4 · casual · "Mala omnivore")

```
Modern 3D character portrait, head-and-shoulders, looking at camera, soft cinematic lighting, warm color grading, slight friendly smile, shallow depth of field, solid cream background (#FFF7ED), square 1:1 composition, centered subject, clean and polished, dating-app profile photo aesthetic. Subject: 28-year-old Singaporean Chinese nonbinary person, modern undercut with wavy dark top hair, small septum ring, thoughtful soft half-smile, mid-tone tan oversized linen shirt, gender-neutral cool-yet-warm energy.
```

## u_014 — Hafiz Ismail (30, dry · L4 · casual · "Beef belly until I drop")

```
Modern 3D character portrait, head-and-shoulders, looking at camera, soft cinematic lighting, warm color grading, slight friendly smile, shallow depth of field, solid cream background (#FFF7ED), square 1:1 composition, centered subject, clean and polished, dating-app profile photo aesthetic. Subject: 30-year-old Singaporean Malay man, short modern haircut, light beard with a sharp lineup, easy confident grin showing teeth, simple navy henley, athletic relaxed vibe.
```

## u_015 — Anjali Pillai (24, soup · L1 · casual · "Mushroom broth queen")

```
Modern 3D character portrait, head-and-shoulders, looking at camera, soft cinematic lighting, warm color grading, slight friendly smile, shallow depth of field, solid cream background (#FFF7ED), square 1:1 composition, centered subject, clean and polished, dating-app profile photo aesthetic. Subject: 24-year-old Singaporean Indian woman, long wavy black hair past the shoulders, small delicate gold nose stud, bright open-mouthed smile, soft turmeric-yellow blouse, gentle radiant warmth.
```

## u_016 — Khye Lim (31, both · L3 · intimate-booth · "Ex-chef umami")

```
Modern 3D character portrait, head-and-shoulders, looking at camera, soft cinematic lighting, warm color grading, slight friendly smile, shallow depth of field, solid cream background (#FFF7ED), square 1:1 composition, centered subject, clean and polished, dating-app profile photo aesthetic. Subject: 31-year-old Singaporean Chinese nonbinary person, short cropped black hair with a side fringe, single thin silver hoop earring, contemplative subtle smirk, faded olive chambray shirt with a chef-style cut, calm deliberate creative vibe.
```

## u_017 — Linda Ng (41, soup · L2 · loud-group · "Hawker auntie since '94")

```
Modern 3D character portrait, head-and-shoulders, looking at camera, soft cinematic lighting, warm color grading, slight friendly smile, shallow depth of field, solid cream background (#FFF7ED), square 1:1 composition, centered subject, clean and polished, dating-app profile photo aesthetic. Subject: 41-year-old Singaporean Chinese woman, shoulder-length permed black hair with subtle waves, warm laughing smile with gentle crow's-feet, small jade pendant on a thin gold chain, soft floral-print blouse, generous warm auntie energy.
```

## u_018 — Theo Chong (36, both · L3 · casual · "Dad-mode mala")

```
Modern 3D character portrait, head-and-shoulders, looking at camera, soft cinematic lighting, warm color grading, slight friendly smile, shallow depth of field, solid cream background (#FFF7ED), square 1:1 composition, centered subject, clean and polished, dating-app profile photo aesthetic. Subject: 36-year-old Singaporean Chinese man, short neat side-part black hair, light stubble, easy-going closed-mouth smile, slightly rounded face, plain navy polo shirt, approachable family-man warmth.
```

## u_019 — Faruq Hassan (27, dry · L5 · loud-group · "Sichuan peppercorns are my love language")

```
Modern 3D character portrait, head-and-shoulders, looking at camera, soft cinematic lighting, warm color grading, slight friendly smile, shallow depth of field, solid cream background (#FFF7ED), square 1:1 composition, centered subject, clean and polished, dating-app profile photo aesthetic. Subject: 27-year-old Singaporean Malay man, modern textured short black hair with a sharp fade, defined jawline, mischievous smirk with a single raised brow, simple burgundy crew-neck tee, intense playful spice-lover vibe.
```

## u_020 — Hana Lim (25, both · L4 · loud-group · "Cheese tofu evangelist")

```
Modern 3D character portrait, head-and-shoulders, looking at camera, soft cinematic lighting, warm color grading, slight friendly smile, shallow depth of field, solid cream background (#FFF7ED), square 1:1 composition, centered subject, clean and polished, dating-app profile photo aesthetic. Subject: 25-year-old Singaporean Eurasian woman, wavy chestnut-brown hair past the shoulders with subtle warm highlights, faint freckles across the nose bridge, big bright open smile, simple coral-pink top, lively social-butterfly energy.
```

---

## Quick post-gen checklist

- [ ] Save as `public/avatars/u_001.png` … `u_020.png`
- [ ] Update each user's `avatar` field in `users.json` from the DiceBear URL to `/avatars/{id}.png`
- [ ] Quick visual check: lay all 20 thumbnails side-by-side. Any that drift in style (different lighting, different bg color, photoreal slip) → regenerate just that one.
- [ ] If 2+ are off-style, the locked preamble may be getting dropped — regenerate with the locked block at both the start *and* end of the prompt.
